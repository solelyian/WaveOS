import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Delete, ChevronDown, CornerDownLeft, ArrowBigUp, Send } from 'lucide-react';
import { useOS } from './OSContext';
import { SPRINGS } from './tokens';

const LAYOUTS = {
  en: [
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
    ['z', 'x', 'c', 'v', 'b', 'n', 'm'],
  ],
  fr: [
    ['a', 'z', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['q', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'm'],
    ['w', 'x', 'c', 'v', 'b', 'n'],
  ],
};

const SYMBOLS = [
  ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
  ['-', '/', ':', ';', '(', ')', '@', '"', '.'],
  ['?', '!', "'", '€', '$', '&', '='],
];

// System keyboard: QWERTY/AZERTY by language, writes into the registered
// input sink live, Return submits (send/search) and dismisses.
export const Keyboard: React.FC = () => {
  const { keyboardFor, closeKeyboard, getInput, lang } = useOS();
  const [buffer, setBuffer] = useState('');
  const [shift, setShift] = useState(false);
  const [symbols, setSymbols] = useState(false);

  const sink = keyboardFor ? getInput(keyboardFor) : undefined;

  useEffect(() => {
    if (keyboardFor && sink) {
      setBuffer(sink.get());
      setShift(false);
      setSymbols(false);
    }
  }, [keyboardFor]); // eslint-disable-line react-hooks/exhaustive-deps

  const write = (next: string) => {
    setBuffer(next);
    sink?.set(next);
  };

  const key = (k: string) => {
    write(buffer + (shift ? k.toUpperCase() : k));
    if (shift) setShift(false);
  };

  const submit = () => {
    sink?.onSubmit?.();
    closeKeyboard();
  };

  const rows = symbols ? SYMBOLS : LAYOUTS[lang];

  return (
    <AnimatePresence>
      {keyboardFor && (
        <motion.div
          initial={{ y: '110%' }}
          animate={{ y: '0%' }}
          exit={{ y: '110%' }}
          transition={SPRINGS.shade}
          className="absolute bottom-0 inset-x-0 z-[400] bg-black/55 backdrop-blur-2xl backdrop-saturate-[160%] border-t border-white/15 pb-8 pt-2 px-1.5"
        >
          {/* preview / submit strip */}
          <div className="flex items-center gap-2 px-3 pb-2">
            <div className="flex-1 min-w-0 text-white/90 text-sm font-medium truncate">
              {buffer || <span className="text-white/40">{sink?.placeholder}</span>}
            </div>
            {sink?.onSubmit && (
              <button onClick={submit} aria-label="Send" className="p-2 text-wave-cyan active:scale-90">
                <Send size={18} />
              </button>
            )}
            <button onClick={closeKeyboard} aria-label="Hide keyboard" className="p-2 text-white/60 active:scale-90">
              <ChevronDown size={20} />
            </button>
          </div>

          {rows.map((row, i) => (
            <div key={i} className="flex justify-center gap-[5px] mb-[6px] px-1">
              {i === 2 && !symbols && (
                <button
                  onClick={() => setShift(!shift)}
                  aria-label="Shift"
                  aria-pressed={shift}
                  className={`min-w-[38px] h-[44px] rounded-md flex items-center justify-center transition-colors ${
                    shift ? 'bg-white text-black' : 'bg-white/[0.08] text-white border border-white/10'
                  }`}
                >
                  <ArrowBigUp size={20} className={shift ? 'fill-black' : ''} />
                </button>
              )}
              {row.map((k) => (
                <button
                  key={k}
                  onClick={() => key(k)}
                  className="flex-1 max-w-[40px] h-[44px] rounded-md bg-white/[0.13] border border-white/10 text-white text-lg font-medium active:bg-white/80 active:text-black shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_1px_0_rgba(0,0,0,0.4)] transition-colors"
                >
                  {shift && !symbols ? k.toUpperCase() : k}
                </button>
              ))}
              {i === 2 && (
                <button
                  onClick={() => write(buffer.slice(0, -1))}
                  aria-label="Delete"
                  className="min-w-[38px] h-[44px] rounded-md bg-white/[0.08] border border-white/10 text-white flex items-center justify-center active:bg-white/80 active:text-black"
                >
                  <Delete size={20} />
                </button>
              )}
            </div>
          ))}

          <div className="flex justify-center gap-[5px] px-1">
            <button
              onClick={() => setSymbols(!symbols)}
              className="min-w-[72px] h-[44px] rounded-md bg-white/[0.08] border border-white/10 text-white text-sm font-medium active:bg-white/80 active:text-black"
            >
              {symbols ? 'ABC' : '?123'}
            </button>
            <button
              onClick={() => write(buffer + ' ')}
              aria-label="Space"
              className="flex-1 max-w-[200px] h-[44px] rounded-md bg-white/[0.13] border border-white/10 active:bg-white/80"
            />
            <button
              onClick={submit}
              aria-label="Return"
              className="min-w-[72px] h-[44px] rounded-md bg-wave-cyan text-black flex items-center justify-center active:scale-95"
            >
              <CornerDownLeft size={20} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
