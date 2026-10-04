import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import { useOS } from '../system/OSContext';
import { GLASS } from '../system/tokens';

// --- NavBar: single navigation header for all apps.
// `large` renders the title below the bar (iOS-style large title);
// otherwise the title is centered inline. `onBack` defaults to closing the app
// when the app has no internal stack — apps with a stack must pass it.

export const NavBar: React.FC<{
  title: string;
  large?: boolean;
  actionIcon?: React.ElementType;
  onAction?: () => void;
  onBack?: () => void;
  backLabel?: string;
  dark?: boolean;
}> = ({ title, large = false, actionIcon: ActionIcon, onAction, onBack, backLabel, dark }) => {
  const { closeActiveApp, t } = useOS();
  const handleBack = onBack || closeActiveApp;
  const fg = dark ? 'text-white/90' : 'text-black/80';
  const accent = 'text-wave-cyan';

  return (
    <div className="flex flex-col px-6 pt-14 pb-2 z-50 relative shrink-0">
      <div className="flex justify-between items-center mb-2 min-h-[44px]">
        <button
          onClick={handleBack}
          aria-label={backLabel || t('common.back')}
          className={`p-2.5 rounded-full ${GLASS.button} ${dark ? 'text-white/80' : 'text-black/70'} active:scale-95 flex items-center gap-1`}
        >
          <ChevronLeft size={22} />
          {backLabel && <span className="text-sm font-semibold pr-1">{backLabel}</span>}
        </button>
        {ActionIcon && (
          <button
            onClick={onAction}
            aria-label={title}
            className={`p-2.5 rounded-full ${GLASS.button} ${accent} active:scale-95`}
          >
            <ActionIcon size={20} />
          </button>
        )}
      </div>
      {large ? (
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`text-4xl font-bold tracking-tight mt-2 ml-1 ${fg}`}
        >
          {title}
        </motion.h1>
      ) : (
        <div className={`absolute bottom-3 left-1/2 -translate-x-1/2 font-semibold text-lg ${fg}`}>
          {title}
        </div>
      )}
    </div>
  );
};

// --- TabBar: floating bottom tab bar, shared by all tabbed apps.

export const TabBar: React.FC<{
  tabs: { id: string; icon: React.ElementType; label: string }[];
  activeTab: string;
  onTabChange: (id: string) => void;
  dark?: boolean;
}> = ({ tabs, activeTab, onTabChange, dark }) => {
  return (
    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[90%] max-w-[360px] h-[72px] z-40">
      <div className={`w-full h-full rounded-[36px] overflow-hidden ${dark ? GLASS.darkHigh : GLASS.high}`}>
        <div className="absolute inset-0 flex justify-around items-center px-1">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                aria-label={tab.label}
                aria-pressed={isActive}
                className="relative flex flex-col items-center justify-center w-full h-full gap-1 group"
              >
                {isActive && (
                  <motion.div
                    layoutId="tab-pill"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                    className={`absolute w-12 h-12 rounded-[20px] ${
                      dark
                        ? 'bg-white/15 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2)]'
                        : 'bg-wave-cyan/15 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.6)]'
                    }`}
                  />
                )}
                <div className={`relative z-10 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-105'}`}>
                  <tab.icon
                    size={24}
                    strokeWidth={isActive ? 2.5 : 2}
                    className={`transition-colors duration-300 ${
                      isActive ? (dark ? 'text-white' : 'text-wave-deep') : dark ? 'text-white/60' : 'text-black/50'
                    }`}
                  />
                </div>
                {isActive && (
                  <motion.div
                    layoutId="tab-dot"
                    className={`w-1 h-1 rounded-full absolute bottom-2 ${dark ? 'bg-white' : 'bg-wave-deep'}`}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// --- Small shared pieces ---

export const Toggle: React.FC<{ on: boolean; onChange: (v: boolean) => void; label?: string }> = ({
  on,
  onChange,
  label,
}) => (
  <button
    role="switch"
    aria-checked={on}
    aria-label={label}
    onClick={() => onChange(!on)}
    className={`w-[52px] h-[32px] rounded-full p-[3px] transition-colors duration-200 shrink-0 ${
      on ? 'bg-wave-cyan' : 'bg-black/20'
    }`}
  >
    <motion.div
      animate={{ x: on ? 20 : 0 }}
      transition={{ type: 'spring', stiffness: 500, damping: 32 }}
      className="w-[26px] h-[26px] rounded-full bg-white shadow-[0_2px_6px_rgba(0,0,0,0.25)]"
    />
  </button>
);

export const ListRow: React.FC<{
  icon?: React.ElementType;
  iconColor?: string;
  label: string;
  value?: string;
  onClick?: () => void;
  first?: boolean;
  trailing?: React.ReactNode;
}> = ({ icon: Icon, iconColor = 'bg-wave-cyan', label, value, onClick, first, trailing }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-4 p-4 text-left active:bg-black/5 transition-colors ${
      first ? '' : 'border-t border-black/5'
    }`}
  >
    {Icon && (
      <div className={`w-8 h-8 rounded-lg ${iconColor} flex items-center justify-center text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)]`}>
        <Icon size={16} />
      </div>
    )}
    <span className="font-semibold text-black/90 flex-1">{label}</span>
    {value && <span className="text-black/50 font-medium text-sm mr-1">{value}</span>}
    {trailing ?? (onClick && <ChevronLeft size={16} className="text-black/30 rotate-180" />)}
  </button>
);

export const Wordmark: React.FC<{ size?: number; className?: string }> = ({ size = 56, className = '' }) => (
  <span
    className={`font-semibold tracking-tight text-white select-none ${className}`}
    style={{ fontSize: size, lineHeight: 1 }}
  >
    Wave<span className="text-wave-cyan">OS</span>
  </span>
);
