import React, { useRef } from 'react';
import { useOS } from './OSContext';

// Top-edge drag zones — real touch/pointer gestures replacing the original
// mouse-hover triggers, which could never fire on a touchscreen.
// Left of island → Notifications, right of island → Control Center.
export const GestureLayer: React.FC = () => {
  const { setShade, locked, shade } = useOS();
  const start = useRef<{ y: number; zone: 'notifications' | 'control' } | null>(null);

  const down = (zone: 'notifications' | 'control') => (e: React.PointerEvent) => {
    if (locked || shade) return;
    start.current = { y: e.clientY, zone };
  };
  const move = (e: React.PointerEvent) => {
    if (!start.current) return;
    if (e.clientY - start.current.y > 26) {
      setShade(start.current.zone);
      start.current = null;
    }
  };
  const up = () => (start.current = null);

  return (
    <>
      <div
        className="absolute top-0 left-0 w-[35%] h-10 z-[150] cursor-s-resize"
        onPointerDown={down('notifications')}
        onPointerMove={move}
        onPointerUp={up}
        onPointerLeave={up}
      />
      <div
        className="absolute top-0 right-0 w-[35%] h-10 z-[150] cursor-s-resize"
        onPointerDown={down('control')}
        onPointerMove={move}
        onPointerUp={up}
        onPointerLeave={up}
      />
    </>
  );
};
