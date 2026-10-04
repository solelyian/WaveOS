import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wordmark } from '../ui/kit';
import { useOS } from './OSContext';

export const BootScreen: React.FC = () => {
  const { setBooted } = useOS();

  useEffect(() => {
    const t = setTimeout(() => setBooted(true), 2000);
    return () => clearTimeout(t);
  }, [setBooted]);

  return (
    <motion.div
      className="absolute inset-0 z-[700] bg-[#020617] flex flex-col items-center justify-center"
      exit={{ opacity: 0, transition: { duration: 0.5, ease: 'easeOut' } }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, filter: 'blur(6px)' }}
        animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      >
        <Wordmark size={58} />
      </motion.div>
      <motion.svg
        width="180"
        height="40"
        viewBox="0 0 180 40"
        className="mt-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <motion.path
          d="M0 20 C 30 4, 60 36, 90 20 C 120 4, 150 36, 180 20"
          fill="none"
          stroke="#00C2FF"
          strokeWidth="2.5"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.1, ease: 'easeInOut', delay: 0.3 }}
        />
      </motion.svg>
    </motion.div>
  );
};
