import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useOS } from './OSContext';

const WAVE_PATH = 'M0 20 C 30 4, 60 36, 90 20 C 120 4, 150 36, 180 20';

// Boot sequence (HarmonyOS Next–inspired):
//   1. brand splash — black screen, "Nyne" centered, "Powered by WaveOS" at the bottom
//   2. OS reveal — the wave glyph draws itself in light, then the WaveOS wordmark rises
const BRAND_MS = 1400;
const TOTAL_MS = 3600;

export const BootScreen: React.FC = () => {
  const { setBooted, reduceMotion } = useOS();
  const [stage, setStage] = useState<'brand' | 'os'>('brand');

  useEffect(() => {
    const t1 = setTimeout(() => setStage('os'), reduceMotion ? 500 : BRAND_MS);
    const t2 = setTimeout(() => setBooted(true), reduceMotion ? 900 : TOTAL_MS);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [setBooted, reduceMotion]);

  return (
    <motion.div
      className="absolute inset-0 z-[700] bg-black flex flex-col items-center justify-center overflow-hidden"
      exit={{ opacity: 0, transition: { duration: 0.55, ease: 'easeOut' } }}
    >
      <AnimatePresence mode="wait">
        {stage === 'brand' ? (
          <motion.div
            key="brand"
            className="absolute inset-0 flex flex-col items-center justify-center"
            exit={{ opacity: 0, scale: 1.04, filter: 'blur(8px)', transition: { duration: 0.45, ease: 'easeIn' } }}
          >
            <motion.span
              className="text-white font-semibold tracking-[-0.02em] select-none"
              style={{ fontSize: 64, lineHeight: 1 }}
              initial={{ opacity: 0, scale: 0.96, filter: 'blur(6px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            >
              Nyne
            </motion.span>
            <motion.div
              className="absolute bottom-14 flex items-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35, duration: 0.5 }}
            >
              <svg width="16" height="10" viewBox="0 0 16 10" fill="none">
                <path d="M1 5 C 3.5 1.5, 6 8.5, 8 5 C 10 1.5, 12.5 8.5, 15 5" stroke="#00C2FF" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
              <span className="text-white/40 text-[11px] font-medium tracking-[0.22em] uppercase select-none">
                Powered by WaveOS
              </span>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="os"
            className="flex flex-col items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="relative">
              {/* halo that blooms as the wave completes */}
              <motion.div
                className="absolute -inset-10 rounded-full"
                style={{ background: 'radial-gradient(closest-side, rgba(0,194,255,0.22), transparent 70%)' }}
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: reduceMotion ? 0 : 0.9, duration: 0.8, ease: 'easeOut' }}
              />
              <motion.svg width="200" height="46" viewBox="0 0 180 40" className="relative">
                {/* soft under-glow */}
                <motion.path
                  d={WAVE_PATH}
                  fill="none"
                  stroke="rgba(0,194,255,0.35)"
                  strokeWidth="7"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: reduceMotion ? 0.2 : 1.15, ease: 'easeInOut', delay: 0.1 }}
                />
                <motion.path
                  d={WAVE_PATH}
                  fill="none"
                  stroke="#00C2FF"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: reduceMotion ? 0.2 : 1.15, ease: 'easeInOut', delay: 0.1 }}
                />
              </motion.svg>
            </div>
            <motion.div
              className="mt-8"
              initial={{ opacity: 0, y: 8, filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ delay: reduceMotion ? 0.1 : 0.95, duration: 0.55, ease: 'easeOut' }}
            >
              <span className="text-white font-semibold tracking-tight select-none" style={{ fontSize: 42, lineHeight: 1 }}>
                Wave<span className="text-wave-cyan">OS</span>
              </span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
