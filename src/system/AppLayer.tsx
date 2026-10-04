import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence, useDragControls, useMotionValue, animate } from 'framer-motion';
import { useOS, AppID } from './OSContext';
import { APPS } from '../apps/registry';
import { SCREEN, SWITCHER, SPRINGS, WINDOW_RADIUS, ICON_RADIUS } from './tokens';

// Window geometry. The slot element ALWAYS stays SCREEN-sized — only its
// position and scale animate. Content never relayouts mid-morph, which is
// what caused the squished/overflowing "padding" artifacts on open/close.
// borderRadius is expressed on the unscaled surface (visual radius / scale)
// so corners match the icon at icon size and the bezel at full size.
// NOTE: `y` is deliberately NOT part of the animate targets — it's the drag
// axis. A constant y:0 in the target would never re-fire ("0 → 0" is a no-op)
// and a leftover drag offset would stick on the window forever.
type Geo = { left: number; top: number; scale: number; borderRadius: number; opacity: number };

const AppSlot: React.FC<{ id: AppID; index: number }> = ({ id, index }) => {
  const ctx = useOS();
  const config = APPS[id];
  const controls = useDragControls();
  const isActive = ctx.activeApp === id;
  const isClosing = ctx.closingApp === id;
  const { switcherOpen } = ctx;
  const dragStartY = useRef(0);
  const dragY = useMotionValue(0);

  // Expose drag controls so the global home bar drives the active window.
  useEffect(() => {
    if (isActive && !switcherOpen) ctx.setWindowControls(controls);
    else if (isActive) ctx.setWindowControls(null);
    return () => {
      if (isActive) ctx.setWindowControls(null);
    };
  }, [isActive, switcherOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  const iconRect = ctx.iconRects.get(id);
  const cardW = SCREEN.w * SWITCHER.cardScale;
  const iconScale = iconRect ? iconRect.w / SCREEN.w : 0.17;

  const full: Geo = { left: 0, top: 0, scale: 1, borderRadius: WINDOW_RADIUS, opacity: 1 };
  const card: Geo = {
    left: SWITCHER.padLeft + index * (cardW + SWITCHER.cardGap),
    top: SWITCHER.top,
    scale: SWITCHER.cardScale,
    borderRadius: 26 / SWITCHER.cardScale,
    opacity: 1,
  };
  const icon: Geo | null = iconRect
    ? {
        left: iconRect.x,
        top: iconRect.y,
        scale: iconScale,
        borderRadius: ICON_RADIUS / iconScale,
        opacity: 0.95,
      }
    : null;
  const hidden: Geo = { ...full, scale: 0.92, opacity: 0 };

  const target: Geo = switcherOpen ? card : isActive ? full : isClosing ? icon ?? hidden : hidden;
  // Enter morph: start from the icon rect on first mount.
  const initial: Geo = icon ?? { ...full, opacity: 0 };

  const interactive = isActive && !switcherOpen;

  return (
    <motion.div
      initial={initial}
      animate={target}
      exit={{ opacity: 0, y: -160, transition: { duration: 0.22 } }}
      transition={ctx.reduceMotion ? { duration: 0.15 } : SPRINGS.morph}
      onAnimationComplete={() => {
        if (isClosing && !switcherOpen) ctx.finishClosing(id);
      }}
      drag="y"
      dragListener={false}
      dragControls={controls}
      dragMomentum={false} /* off: inertia on release would clobber the onDragEnd spring-back */
      dragConstraints={switcherOpen ? { top: -420, bottom: 0 } : { top: -900, bottom: 0 }}
      dragElastic={0.12}
      onDragEnd={(e, info) => {
        if (switcherOpen) {
          if (info.offset.y < -60 || info.velocity.y < -400) {
            ctx.killApp(id); // exit anim handles the fling-off
            return;
          }
        } else {
          // iOS model: fling up = go home, drag-and-hold = app switcher.
          if (info.offset.y < -190 || info.velocity.y < -550) ctx.closeActiveApp();
          else if (info.offset.y < -56) ctx.setSwitcherOpen(true);
        }
        // Release the held drag offset back to rest, continuing its velocity
        // so it glides into whatever morph is starting (close/card/snap-back).
        animate(dragY, 0, { ...SPRINGS.morph, velocity: info.velocity.y });
      }}
      className={`absolute w-[400px] h-[850px] overflow-hidden origin-top-left ${config.color} shadow-[0_30px_100px_rgba(0,0,0,0.6)]`}
      style={{
        y: dragY,
        zIndex: isActive && !switcherOpen ? 40 : 30,
        // The layer container is pointer-events-none so an empty window plane
        // never swallows SpringBoard taps; live slots opt back in here.
        pointerEvents: isActive || switcherOpen ? 'auto' : 'none',
      }}
      aria-hidden={!interactive && !switcherOpen}
    >
      {/* app content — fixed-size surface, crossfades in over the morphing shell */}
      <motion.div
        initial={{ opacity: 0, filter: 'blur(10px)' }}
        animate={{ opacity: 1, filter: 'blur(0px)' }}
        transition={{ duration: 0.25, delay: 0.05 }}
        className={`h-full w-full flex flex-col relative ${config.theme === 'dark' ? 'bg-[#050505]' : 'bg-[#f4f4f5]'} ${
          interactive ? '' : 'pointer-events-none'
        }`}
      >
        <config.component />
      </motion.div>

      {/* Switcher card chrome: tap to focus, drag up to quit */}
      {switcherOpen && (
        <div
          className="absolute inset-0 z-50 cursor-pointer touch-none"
          onPointerDown={(e) => {
            dragStartY.current = e.clientY;
            controls.start(e);
          }}
          onClick={(e) => {
            if (Math.abs(e.clientY - dragStartY.current) < 8) ctx.focusApp(id);
          }}
        >
          <div className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/50 backdrop-blur px-3 py-1.5 rounded-full border border-white/15">
            <config.icon size={14} className="text-white" />
            <span className="text-xs font-bold text-white whitespace-nowrap">{ctx.t(`app.${id}`)}</span>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export const AppLayer: React.FC = () => {
  const { openApps, switcherOpen, setSwitcherOpen, t, locked } = useOS();
  const cardW = SCREEN.w * SWITCHER.cardScale;
  const totalW = openApps.length * (cardW + SWITCHER.cardGap) + SWITCHER.padLeft * 2;

  return (
    <>
      <AnimatePresence>
        {switcherOpen && (
          <motion.div
            key="switcher-bg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-20 bg-black/45 backdrop-blur-md"
            onClick={() => setSwitcherOpen(false)}
          />
        )}
      </AnimatePresence>

      <div
        className={`absolute inset-0 z-30 pointer-events-none transition-opacity duration-300 ${
          switcherOpen ? 'overflow-x-auto overflow-y-hidden no-scrollbar' : 'overflow-hidden'
        } ${locked ? 'opacity-0' : 'opacity-100'}`}
      >
        <div className="relative h-full pointer-events-none" style={{ width: switcherOpen ? totalW : '100%' }}>
          <AnimatePresence>
            {openApps.map((id, i) => (
              <AppSlot key={id} id={id} index={i} />
            ))}
          </AnimatePresence>
        </div>
      </div>

      {switcherOpen && (
        <div className="absolute top-16 inset-x-0 z-40 text-center pointer-events-none">
          <div className="text-white/90 font-bold text-lg drop-shadow">{t('switcher.recent')}</div>
          {openApps.length === 0 && <div className="text-white/50 text-sm mt-2">{t('switcher.empty')}</div>}
          {openApps.length > 0 && <div className="text-white/50 text-xs mt-1">{t('switcher.hint')}</div>}
        </div>
      )}
    </>
  );
};
