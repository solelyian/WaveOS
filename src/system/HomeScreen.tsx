import React, { useLayoutEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Sun } from 'lucide-react';
import { useOS, AppID } from './OSContext';
import { APPS } from '../apps/registry';
import { GLASS } from './tokens';

const DOCK: AppID[] = ['phone', 'surf', 'messages', 'music'];

// Icons register their on-screen position so the window manager can morph
// from icon → window and back — deterministic, no shared layoutId conflicts
// (the original approach breaks once several windows stay mounted).
const AppIcon: React.FC<{ id: AppID; compact?: boolean }> = ({ id, compact }) => {
  const { openApp, registerIconRect, t } = useOS();
  const ref = useRef<HTMLDivElement>(null);
  const config = APPS[id];
  const Icon = config.icon;

  useLayoutEffect(() => {
    const measure = () => {
      const el = ref.current;
      if (!el) return;
      const bezel = el.closest('[data-bezel]');
      if (!bezel) return;
      const r = el.getBoundingClientRect();
      const b = bezel.getBoundingClientRect();
      registerIconRect(id, { x: r.left - b.left, y: r.top - b.top, w: r.width, h: r.height });
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [id, registerIconRect]);

  return (
    <div className="flex flex-col items-center gap-2 group">
      <motion.div
        ref={ref}
        onClick={() => openApp(id)}
        whileTap={{ scale: 0.85 }}
        className={`${compact ? 'w-[60px] h-[60px]' : 'w-[68px] h-[68px]'} rounded-[22px] ${config.color} flex items-center justify-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.5),0_8px_16px_rgba(0,0,0,0.2)] relative cursor-pointer z-10 overflow-hidden border border-white/20`}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent pointer-events-none mix-blend-overlay" />
        <Icon className="text-white drop-shadow-md w-8 h-8" strokeWidth={2} />
      </motion.div>
      {!compact && (
        <span className="text-[12px] font-semibold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)] tracking-wide">
          {t(`app.${id}`)}
        </span>
      )}
    </div>
  );
};

const Widget: React.FC<{ onClick?: () => void; className?: string; children: React.ReactNode }> = ({
  onClick,
  className = '',
  children,
}) => (
  <button
    onClick={onClick}
    className={`col-span-1 h-40 ${GLASS.low} rounded-[28px] p-5 text-white flex flex-col justify-between text-left active:scale-[0.97] transition-transform ${className}`}
  >
    {children}
  </button>
);

export const HomeScreen: React.FC = () => {
  const { t, openApp } = useOS();
  const gridApps = (Object.keys(APPS) as AppID[]).filter((id) => !DOCK.includes(id));

  return (
    <div className="pt-20 px-6 h-full flex flex-col">
      <div className="grid grid-cols-2 gap-4 mb-10">
        <Widget onClick={() => openApp('weather')}>
          <div className="flex justify-between">
            <span className="font-bold tracking-wide text-sm">SAN FRANCISCO</span>
            <Sun size={20} className="text-yellow-300" />
          </div>
          <div>
            <div className="text-5xl font-light tracking-tighter">72°</div>
            <div className="text-xs font-semibold opacity-90 mt-1">{t('weather.mostlyClear')}</div>
          </div>
        </Widget>
        <Widget onClick={() => openApp('calendar')} className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-wave-cyan/25 to-blue-500/20 pointer-events-none mix-blend-overlay" />
          <div className="flex justify-between relative z-10">
            <span className="font-bold tracking-wide text-sm">{t('app.calendar').toUpperCase()}</span>
            <div className="text-xs opacity-90 font-semibold">SAT 6</div>
          </div>
          <div className="relative z-10">
            <div className="w-1 h-8 bg-wave-cyan rounded-full absolute -left-2 top-1" />
            <div className="text-lg font-bold leading-tight pl-2">Design Review</div>
            <div className="text-xs opacity-90 mt-1 pl-2 font-medium">10:00 - 11:30</div>
          </div>
        </Widget>
      </div>

      <div className="grid grid-cols-4 gap-x-5 gap-y-8">
        {gridApps.map((id) => (
          <AppIcon key={id} id={id} />
        ))}
      </div>

      <div className="mt-auto mb-12 w-full">
        <div className={`${GLASS.low} rounded-[40px] p-3 flex justify-around items-center`}>
          {DOCK.map((id) => (
            <AppIcon key={id} id={id} compact />
          ))}
        </div>
      </div>
    </div>
  );
};
