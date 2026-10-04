import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Wordmark } from '../ui/kit';
import { useOS } from './OSContext';

// Boot sequence (HarmonyOS Next–inspired):
//   1. brand splash — black screen, "Nyne" centered, "Powered by WaveOS" at the bottom
//   2. OS reveal — a ring ("O") draws itself and fills in light, then morphs
//      down into its slot inside the wordmark while "Wave" and "S" fade in
const BRAND_MS = 1400;
const TOTAL_MS = 4400;

const OSReveal: React.FC<{ reduceMotion: boolean }> = ({ reduceMotion }) => {
  const stageRef = useRef<HTMLDivElement>(null);
  const slotRef = useRef<HTMLSpanElement>(null);
  const [d, setD] = useState<{ x: number; y: number } | null>(null);

  useLayoutEffect(() => {
    const stage = stageRef.current;
    const slot = slotRef.current;
    if (!stage || !slot) return;
    const sr = slot.getBoundingClientRect();
    const br = stage.getBoundingClientRect();
    setD({
      x: br.left + br.width / 2 - (sr.left + sr.width / 2),
      y: br.top + br.height / 2 - (sr.top + sr.height / 2),
    });
  }, []);

  const dx = d?.x ?? 0;
  const dy = d?.y ?? 0;

  const ringT = reduceMotion
    ? { duration: 0.25, delay: 0 }
    : { duration: 1.15, ease: 'easeInOut' as const, delay: 0.15 };
  // hold centered while the O draws, then morph into the wordmark slot
  const morphT = reduceMotion
    ? { duration: 0.3, times: [0, 0.5, 1] }
    : { duration: 2.7, times: [0, 0.52, 0.85], ease: 'easeInOut' as const };
  const lettersDelay = reduceMotion ? 0.15 : 2.05;
  const oDelay = reduceMotion ? 0.2 : 2.5;

  return (
    <div ref={stageRef} className="absolute inset-0 flex items-center justify-center">
      <div
        className="flex items-baseline font-semibold tracking-tight text-white select-none"
        style={{ fontSize: 42, lineHeight: 1 }}
      >
        <motion.span
          initial={{ opacity: 0, filter: 'blur(6px)' }}
          animate={{ opacity: 1, filter: 'blur(0px)' }}
          transition={{ delay: lettersDelay, duration: 0.55, ease: 'easeOut' }}
        >
          Wave
        </motion.span>

        {/* the "O" — ring draws centered, fills, then morphs down into this slot */}
        <span
          ref={slotRef}
          className="relative inline-flex items-end justify-center text-wave-cyan"
          style={{ width: '0.78em', height: '1em' }}
        >
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: oDelay, duration: 0.4 }}
            style={{ fontSize: '1em', lineHeight: 1 }}
          >
            O
          </motion.span>
          {d !== null && (
            <motion.div
              className="absolute flex items-center justify-center"
              style={{ left: '50%', top: '56%', width: 34, height: 34, marginLeft: -17, marginTop: -17 }}
              initial={{ x: dx, y: dy, scale: 3.6, opacity: 1 }}
              animate={{ x: [dx, dx, 0], y: [dy, dy, 0], scale: [3.6, 3.6, 1], opacity: [1, 1, 0] }}
              transition={morphT}
            >
              {/* halo while centered */}
              <motion.div
                className="absolute -inset-8 rounded-full"
                style={{ background: 'radial-gradient(closest-side, rgba(0,194,255,0.25), transparent 70%)' }}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: [0, 1, 1, 0], scale: [0.5, 1, 1, 0.8] }}
                transition={reduceMotion ? { duration: 0.4 } : { duration: 2.4, times: [0, 0.35, 0.6, 1], ease: 'easeOut' }}
              />
              {/* soft fill that blooms inside the ring */}
              <motion.div
                className="absolute rounded-full"
                style={{ inset: 5, background: 'radial-gradient(closest-side, rgba(0,194,255,0.5), rgba(0,194,255,0.12))' }}
                initial={{ opacity: 0, scale: 0.4 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={reduceMotion ? { duration: 0.25 } : { delay: 0.75, duration: 0.6, ease: 'easeOut' }}
              />
              <motion.svg
                width="34"
                height="34"
                viewBox="0 0 34 34"
                className="relative"
                initial={{ rotate: -150 }}
                animate={{ rotate: 0 }}
                transition={reduceMotion ? { duration: 0.25 } : { duration: 1.3, ease: 'easeOut' }}
              >
                <motion.circle
                  cx="17"
                  cy="17"
                  r="14.5"
                  fill="none"
                  stroke="#00C2FF"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={ringT}
                />
              </motion.svg>
            </motion.div>
          )}
        </span>

        <motion.span
          className="text-wave-cyan"
          initial={{ opacity: 0, filter: 'blur(6px)' }}
          animate={{ opacity: 1, filter: 'blur(0px)' }}
          transition={{ delay: lettersDelay + 0.12, duration: 0.55, ease: 'easeOut' }}
        >
          S
        </motion.span>
      </div>
    </div>
  );
};

export const BootScreen: React.FC = () => {
  const { setBooted, reduceMotion } = useOS();
  const [stage, setStage] = useState<'brand' | 'os'>('brand');

  useEffect(() => {
    const t1 = setTimeout(() => setStage('os'), reduceMotion ? 500 : BRAND_MS);
    const t2 = setTimeout(() => setBooted(true), reduceMotion ? 1000 : TOTAL_MS);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [setBooted, reduceMotion]);

  return (
    <motion.div
      className="absolute inset-0 z-[700] bg-black overflow-hidden"
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
              <span className="text-white/40 text-[11px] font-medium tracking-[0.18em] uppercase select-none">
                Powered by
              </span>
              <Wordmark size={15} className="opacity-90" />
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="os"
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <OSReveal reduceMotion={reduceMotion} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
