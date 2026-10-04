import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, SkipBack, SkipForward, Pause, Play, Moon, Flashlight } from 'lucide-react';
import { useOS } from './OSContext';
import { SPRINGS } from './tokens';

// WaveOS live-activity surface. Slim hardware-style pill when idle (shows
// ambient status glyphs instead of a dead black blob), expands for media.
export const FlowIsland: React.FC = () => {
  const { isPlaying, setIsPlaying, focus, flashlight } = useOS();
  const [expanded, setExpanded] = useState(false);

  const hasActivity = isPlaying;
  const width = expanded && hasActivity ? 360 : isPlaying ? 190 : 124;
  const height = expanded && hasActivity ? 180 : 36;
  const radius = expanded && hasActivity ? 44 : 24;

  return (
    <div className="absolute top-3 left-0 right-0 z-[250] flex justify-center pointer-events-none">
      <motion.div
        layout
        initial={false}
        animate={{ width, height, borderRadius: radius }}
        transition={SPRINGS.island}
        className="bg-black overflow-hidden pointer-events-auto relative shadow-[inset_0_-1px_1px_rgba(255,255,255,0.2),0_10px_30px_rgba(0,0,0,0.5)] border border-white/10"
        onClick={() => hasActivity && setExpanded(!expanded)}
        role="button"
        aria-label="Activity island"
      >
        <motion.div
          className="absolute inset-0 flex items-center justify-between px-4"
          animate={{ opacity: expanded && hasActivity ? 0 : 1 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center gap-1.5">
            {focus && <Moon size={13} className="text-indigo-300 fill-indigo-300" />}
            {flashlight && <Flashlight size={13} className="text-yellow-300" />}
            {isPlaying && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-5 h-5 rounded overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=100"
                  alt=""
                  className="w-full h-full object-cover"
                />
              </motion.div>
            )}
          </div>
          <div className="flex items-center justify-end h-full">
            {isPlaying ? (
              <div className="flex items-end gap-1 h-3 mb-0.5">
                {[0.8, 0.5, 1.1, 0.7].map((d, i) => (
                  <motion.div
                    key={i}
                    animate={{ height: [4 + i * 2, 12 + i, 5 + i] }}
                    transition={{ repeat: Infinity, duration: d }}
                    className="w-1 bg-wave-cyan rounded-full"
                  />
                ))}
              </div>
            ) : null}
          </div>
        </motion.div>

        <AnimatePresence>
          {expanded && hasActivity && (
            <motion.div
              initial={{ opacity: 0, filter: 'blur(10px)' }}
              animate={{ opacity: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, filter: 'blur(10px)', transition: { duration: 0.15 } }}
              transition={{ delay: 0.1 }}
              className="absolute inset-0 p-6 flex flex-col justify-between text-white"
            >
              <div className="flex gap-4 items-center">
                <div className="w-14 h-14 rounded-2xl overflow-hidden bg-gray-800 shadow-lg">
                  <img
                    src="https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=200"
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-lg truncate">Midnight City</div>
                  <div className="text-white/60 text-sm truncate">M83</div>
                </div>
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity }}
                    className="w-2 h-2 bg-wave-cyan rounded-full"
                  />
                </div>
              </div>
              <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden mt-2">
                <motion.div className="h-full bg-white" animate={{ width: '60%' }} />
              </div>
              <div className="flex justify-between items-center px-2 mt-2">
                <SkipBack size={24} className="fill-white opacity-80 hover:opacity-100" />
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsPlaying(!isPlaying);
                  }}
                >
                  {isPlaying ? <Pause size={32} fill="white" /> : <Play size={32} fill="white" />}
                </motion.button>
                <SkipForward size={24} className="fill-white opacity-80 hover:opacity-100" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
