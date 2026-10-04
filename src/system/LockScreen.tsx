import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { Lock, Flashlight, Camera, Delete } from 'lucide-react';
import { useOS } from './OSContext';
import { GLASS, SPRINGS } from './tokens';

// Lock → swipe up reveals the passcode pad; any 4-digit code unlocks
// (prototype). Flashlight shortcut works without unlocking.
export const LockScreen: React.FC = () => {
  const { unlock, t, locale, flashlight, setFlashlight, openApp } = useOS();
  const [time, setTime] = useState('');
  const [dateStr, setDateStr] = useState('');
  const [stage, setStage] = useState<'clock' | 'pin'>('clock');
  const [pin, setPin] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString(locale, { hour: 'numeric', minute: '2-digit', hour12: false }));
      setDateStr(now.toLocaleDateString(locale, { weekday: 'long', month: 'long', day: 'numeric' }));
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [locale]);

  const y = useMotionValue(0);
  const opacity = useTransform(y, [0, -200], [1, 0]);
  const blur = useTransform(y, [0, -200], [0, 10]);

  useEffect(() => {
    if (pin.length === 4) {
      const t = setTimeout(unlock, 180);
      return () => clearTimeout(t);
    }
  }, [pin, unlock]);

  const press = (d: string) => setPin((p) => (p.length < 4 ? p + d : p));

  return (
    <motion.div className="absolute inset-0 z-[500] flex flex-col items-center justify-between py-12 text-white" style={{ opacity, filter: `blur(${blur}px)` }}>
      <AnimatePresence mode="wait">
        {stage === 'clock' ? (
          <motion.div key="clock" className="flex flex-col items-center mt-12" exit={{ opacity: 0, y: -30 }}>
            <Lock size={20} className="mb-4 opacity-80" />
            <div className="text-xl font-bold opacity-90 mb-1 capitalize">{dateStr}</div>
            <h1 className="text-8xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 drop-shadow-lg">
              {time}
            </h1>
          </motion.div>
        ) : (
          <motion.div
            key="pin"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center mt-24"
          >
            <Lock size={18} className="mb-3 opacity-80" />
            <div className="text-lg font-semibold mb-6">{t('lock.enterPasscode')}</div>
            <div className="flex gap-4 mb-10">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`w-3.5 h-3.5 rounded-full border border-white/70 transition-all duration-150 ${
                    pin.length > i ? 'bg-white scale-110' : 'bg-transparent'
                  }`}
                />
              ))}
            </div>
            <div className="grid grid-cols-3 gap-x-8 gap-y-4">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
                <button
                  key={d}
                  onClick={() => press(d)}
                  className={`w-[68px] h-[68px] rounded-full ${GLASS.tile} text-2xl font-medium text-white active:bg-white/30 active:scale-95 transition-all flex items-center justify-center`}
                >
                  {d}
                </button>
              ))}
              <button
                onClick={() => setStage('clock')}
                className="text-sm font-medium text-white/80 active:opacity-60 self-center justify-self-center"
              >
                {t('lock.cancel')}
              </button>
              <button
                onClick={() => press('0')}
                className={`w-[68px] h-[68px] rounded-full ${GLASS.tile} text-2xl font-medium text-white active:bg-white/30 active:scale-95 transition-all flex items-center justify-center`}
              >
                0
              </button>
              <button
                onClick={() => setPin((p) => p.slice(0, -1))}
                aria-label="Delete"
                className="self-center justify-self-center p-4 text-white/80 active:opacity-60"
              >
                <Delete size={26} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full flex justify-between px-10 items-end mb-4">
        <button
          onClick={() => setFlashlight(!flashlight)}
          aria-label="Flashlight"
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-lg active:scale-95 ${
            flashlight ? 'bg-white text-black' : `${GLASS.darkHigh} text-white`
          }`}
        >
          <Flashlight size={24} />
        </button>
        <div className="flex flex-col items-center gap-2">
          {stage === 'clock' && (
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/80">{t('lock.swipeUp')}</span>
          )}
          <motion.div
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0.2, bottom: 0.05 }}
            style={{ y }}
            onDragEnd={(e, info) => {
              if (info.offset.y < -80 || info.velocity.y < -400) setStage('pin');
            }}
            className="w-36 h-1.5 bg-white/90 rounded-full cursor-grab active:cursor-grabbing shadow-[0_2px_4px_rgba(0,0,0,0.4)]"
          />
        </div>
        <button
          onClick={() => setStage('pin')}
          aria-label="Camera"
          className={`w-14 h-14 rounded-full ${GLASS.darkHigh} flex items-center justify-center text-white transition-all shadow-lg active:scale-95`}
        >
          <Camera size={24} />
        </button>
      </div>
    </motion.div>
  );
};
