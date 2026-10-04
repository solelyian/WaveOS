import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { useOS, AppID } from './OSContext';
import { APPS } from '../apps/registry';
import { SCREEN, SWITCHER, SPRINGS, WINDOW_RADIUS, ICON_RADIUS } from './tokens';

// Window geometry per mode. Every slot stays mounted once opened — that's
// what preserves app state (the original destroyed it on every close).
type Geo = { left: number; top: number; width: number; height: number; borderRadius: number; scale: number; opacity: number; y: number };

const AppSlot: React.FC<{ id: AppID; index: number }> = ({ id, index }) => {
  const ctx = useOS();
  const config = APPS[id];
  const controls = useDragControls();
  const isActive = ctx.activeApp === id;
  const isClosing = ctx.closingApp === id;
  const { switcherOpen } = ctx;
  const dragStartY = useRef(0);

  // Expose drag controls so the global home bar drives the active window.
  useEffect(() => {
    if (isActive && !switcherOpen) ctx.setWindowControls(controls);
    else if (isActive) ctx.setWindowControls(null);
    return () => {
      if (isActive) ctx.setWindowControls(null);
    };
  }, [isActive, switcherOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  const iconRect = ctx.iconRects.get(id);
  const full: Geo = { left: 0, top: 0, width: SCREEN.w, height: SCREEN.h, borderRadius: WINDOW_RADIUS, scale: 1, opacity: 1, y: 0 };
  const cardW = SCREEN.w * SWITCHER.cardScale;
  const card: Geo = {
    left: SWITCHER.padLeft + index * (cardW + SWITCHER.cardGap),
    top: SWITCHER.top,
    width: SCREEN.w,
    height: SCREEN.h,
    borderRadius: 26,
    scale: SWITCHER.cardScale,
    opacity: 1,
    y: 0,
  };
  const hidden: Geo = { ...full, scale: 0.9, opacity: 0 };
  const closing: Geo = iconRect
    ? { left: iconRect.x, top: iconRect.y, width: iconRect.w, height: iconRect.h, borderRadius: ICON_RADIUS, scale: 1, opacity: 0.9, y: 0 }
    : hidden;

  const target: Geo = switcherOpen ? card : isActive ? full : isClosing ? closing : hidden;
  // Enter morph: start from the icon rect on first mount.
  const initial: Geo = iconRect
    ? { left: iconRect.x, top: iconRect.y, width: iconRect.w, height: iconRect.h, borderRadius: ICON_RADIUS, scale: 1, opacity: 1, y: 0 }
    : { ...full, opacity: 0 };

  const interactive = isActive && !switcherOpen;

  return (
    <motion.div
      initial={initial}
      animate={target}
      exit={{ opacity: 0, y: -140, scale: SWITCHER.cardScale, transition: { duration: 0.22 } }}
      transition={SPRINGS.morph}
      onAnimationComplete={() => {
        if (isClosing && !switcherOpen) ctx.finishClosing(id);
      }}
      drag="y"
      dragListener={false}
      dragControls={controls}
      dragConstraints={switcherOpen ? { top: -400, bottom: 0 } : { top: -900, bottom: 0 }}
      dragElastic={0.12}
      onDragEnd={(e, info) => {
        if (switcherOpen) {
          if (info.offset.y < -60 || info.velocity.y < -400) ctx.killApp(id);
        } else {
          // iOS model: fling up = go home, drag-and-hold = app switcher.
          if (info.offset.y < -190 || info.velocity.y < -550) ctx.closeActiveApp();
          else if (info.offset.y < -56) ctx.setSwitcherOpen(true);
        }
      }}
      className={`absolute overflow-hidden ${config.color} shadow-[0_30px_100px_rgba(0,0,0,0.6)]`}
      style={{
        zIndex: isActive && !switcherOpen ? 40 : 30,
        transformOrigin: 'top left',
        // The layer container is pointer-events-none so an empty window plane
        // never swallows SpringBoard taps; live slots opt back in here.
        pointerEvents: isActive || switcherOpen ? 'auto' : 'none',
      }}
      aria-hidden={!interactive && !switcherOpen}
    >
      {/* app content — crossfades in over the morphing shell */}
      <motion.div
        initial={{ opacity: 0, filter: 'blur(10px)', scale: 0.98 }}
        animate={{ opacity: 1, filter: 'blur(0px)', scale: 1 }}
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
          <div className="absolute top-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/50 backdrop-blur px-2 py-0.5 rounded-full">
            <config.icon size={11} className="text-white" />
            <span className="text-[9px] font-bold text-white whitespace-nowrap">{ctx.t(`app.${id}`)}</span>
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
          {openApps.length === 0 && (
            <div className="text-white/50 text-sm mt-2">{t('switcher.empty')}</div>
          )}
          {openApps.length > 0 && (
            <div className="text-white/50 text-xs mt-1">{t('switcher.hint')}</div>
          )}
        </div>
      )}
    </>
  );
};
