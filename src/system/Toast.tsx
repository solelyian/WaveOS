import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOS } from './OSContext';
import { GLASS } from './tokens';

export const Toast: React.FC = () => {
  const { toast } = useOS();
  return (
    <div className="absolute top-16 left-0 right-0 z-[450] flex justify-center pointer-events-none">
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -16, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 500, damping: 32 }}
            className={`${GLASS.darkHigh} px-5 py-2.5 rounded-full text-white text-sm font-semibold max-w-[80%] text-center`}
          >
            {toast.text}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
