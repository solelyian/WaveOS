import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useOS } from '../system/OSContext';
import { GLASS } from '../system/tokens';

type Op = '+' | '−' | '×' | '÷';

const compute = (a: number, b: number, op: Op): number => {
  switch (op) {
    case '+': return a + b;
    case '−': return a - b;
    case '×': return a * b;
    case '÷': return b === 0 ? NaN : a / b;
  }
};

const fmt = (n: number): string => {
  if (!isFinite(n) || isNaN(n)) return 'Error';
  const s = parseFloat(n.toFixed(10)).toString();
  return s.length > 11 ? n.toExponential(5) : s;
};

// Fully working calculator — the original rendered dead buttons.
const CalculatorApp: React.FC = () => {
  const { closeActiveApp } = useOS();
  const [display, setDisplay] = useState('0');
  const [acc, setAcc] = useState<number | null>(null);
  const [op, setOp] = useState<Op | null>(null);
  const [trail, setTrail] = useState('');
  const [fresh, setFresh] = useState(true);

  const digit = (d: string) => {
    if (display === 'Error' || fresh || display === '0') {
      setDisplay(d === '.' ? '0.' : d);
      setFresh(false);
    } else if (d === '.' && display.includes('.')) {
      return;
    } else if (display.replace(/[-.]/g, '').length < 10) {
      setDisplay(display + d);
    }
  };

  const applyOp = (next: Op) => {
    const val = parseFloat(display);
    if (acc !== null && op && !fresh) {
      const r = compute(acc, val, op);
      setAcc(r);
      setDisplay(fmt(r));
    } else {
      setAcc(val);
    }
    setTrail(`${fmt(acc !== null && op && !fresh ? compute(acc, val, op) : val)} ${next}`);
    setOp(next);
    setFresh(true);
  };

  const equals = () => {
    if (acc === null || !op) return;
    const r = compute(acc, parseFloat(display), op);
    setTrail(`${fmt(acc)} ${op} ${display} =`);
    setDisplay(fmt(r));
    setAcc(null);
    setOp(null);
    setFresh(true);
  };

  const clear = () => {
    setDisplay('0');
    setAcc(null);
    setOp(null);
    setTrail('');
    setFresh(true);
  };

  const pct = () => setDisplay(fmt(parseFloat(display) / 100));
  const neg = () => setDisplay(display.startsWith('-') ? display.slice(1) : display === '0' ? '0' : '-' + display);

  const keys: (string | number)[][] = [
    ['AC', '±', '%', '÷'],
    [7, 8, 9, '×'],
    [4, 5, 6, '−'],
    [1, 2, 3, '+'],
    [0, '.', '='],
  ];

  const handler = (k: string | number) => {
    if (typeof k === 'number' || k === '.') digit(String(k));
    else if (k === 'AC') clear();
    else if (k === '±') neg();
    else if (k === '%') pct();
    else if (k === '=') equals();
    else applyOp(k as Op);
  };

  return (
    <div className="h-full w-full bg-transparent p-5 pt-16 flex flex-col">
      <button
        onClick={closeActiveApp}
        aria-label="Close"
        className={`absolute top-14 right-5 p-2.5 rounded-full ${GLASS.button} z-50 text-white active:scale-90`}
      >
        <X size={18} />
      </button>
      <div className="flex-1 flex flex-col items-end justify-end mb-8 px-2">
        <div className="text-white/50 text-xl font-medium mb-2 h-7">{trail}</div>
        <div className="text-7xl font-light text-white tracking-tight truncate max-w-full">{display}</div>
      </div>
      <div className="grid grid-cols-4 gap-3">
        {keys.flat().map((k, i) => {
          const isOp = ['÷', '×', '−', '+', '='].includes(String(k));
          const isFn = ['AC', '±', '%'].includes(String(k));
          const isActiveOp = op === k && fresh;
          return (
            <button
              key={i}
              onClick={() => handler(k)}
              className={`h-[68px] rounded-[24px] text-2xl font-medium border active:scale-95 transition-all shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),0_4px_10px_rgba(0,0,0,0.3)] ${
                isOp
                  ? isActiveOp
                    ? 'bg-white text-orange-500 border-white'
                    : 'bg-orange-500 text-white border-orange-400/50 shadow-[inset_0_1px_1px_rgba(255,255,255,0.5)]'
                  : isFn
                    ? 'bg-white/85 backdrop-blur-md text-black border-white/30'
                    : `bg-black/40 backdrop-blur-md text-white border-white/10 ${k === 0 ? 'col-span-2' : ''}`
              }`}
            >
              {k}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CalculatorApp;
