import React from 'react';
import { motion, useDragControls, useMotionValue, animate } from 'framer-motion';
import { useOS } from './OSContext';
import { APPS } from '../apps/registry';
import { SPRINGS } from './tokens';

// Global home bar. In an app: drag up = close / app switcher (handled by the
// window's own onDragEnd). On home: drag up opens the switcher. In the
// switcher: fling down dismisses it.
export const HomeIndicator: React.FC = () => {
  const { activeApp, switcherOpen, setSwitcherOpen, windowControls, shade, locked } = useOS();
  const selfControls = useDragControls();
  const y = useMotionValue(0);

  // The whole bottom strip is the gesture zone — not just the 6px pill —
  // so the close/switcher swipe is actually grabbable on a touch device.
  const onPointerDown = (e: React.PointerEvent) => {
    if (shade) return;
    if (!switcherOpen && activeApp && windowControls) {
      windowControls.start(e);
    } else {
      selfControls.start(e);
    }
  };

  // The lock screen owns its own swipe bar — never double-render ours under it.
  if (locked) return null;

  const appTheme = activeApp ? APPS[activeApp].theme : 'dark';
  const lightBar = switcherOpen || shade || !activeApp || appTheme === 'dark';

  return (
    <div
      className="absolute bottom-0 left-0 w-full h-10 z-[300] flex items-center justify-center touch-none"
      onPointerDown={onPointerDown}
    >
      <motion.div
        drag="y"
        dragListener={false}
        dragControls={selfControls}
        dragMomentum={false}
        dragConstraints={{ top: -160, bottom: 160 }}
        dragElastic={0.1}
        style={{ y }}
        onDragEnd={(e, info) => {
          if (switcherOpen) {
            if (info.offset.y > 50 || info.velocity.y > 300) setSwitcherOpen(false);
          } else if (!activeApp && (info.offset.y < -40 || info.velocity.y < -300)) {
            setSwitcherOpen(true);
          }
          animate(y, 0, { ...SPRINGS.morph, velocity: info.velocity.y });
        }}
        className={`w-36 h-1.5 rounded-full shadow-[0_2px_4px_rgba(0,0,0,0.3)] cursor-grab active:cursor-grabbing ${
          lightBar ? 'bg-white/85' : 'bg-black/60'
        }`}
      />
    </div>
  );
};
