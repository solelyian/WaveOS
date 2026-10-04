import React, { useEffect, useState } from 'react';
import { Signal, Wifi, WifiOff, Battery, Plane, Moon, Bluetooth } from 'lucide-react';
import { useOS } from './OSContext';
import { APPS } from '../apps/registry';

// Status bar adapts its ink to the app theme underneath (fixes the original
// bug: white text over light apps). Overlays always force light ink.
export const StatusBar: React.FC = () => {
  const { activeApp, shade, locked, switcherOpen, airplane, wifi, cellular, bluetooth, focus, t, locale } =
    useOS();
  const [time, setTime] = useState('');

  useEffect(() => {
    const update = () =>
      setTime(new Date().toLocaleTimeString(locale, { hour: 'numeric', minute: '2-digit', hour12: false }));
    update();
    const i = setInterval(update, 5000);
    return () => clearInterval(i);
  }, [locale]);

  const overlay = shade !== null || locked || switcherOpen;
  const appTheme = activeApp ? APPS[activeApp].theme : 'dark';
  const darkInk = !overlay && appTheme !== 'dark';

  if (locked) return null;

  return (
    <div
      className={`absolute top-0 w-full h-12 z-50 flex justify-between items-center px-6 pt-3 font-medium text-sm transition-colors duration-300 pointer-events-none ${
        darkInk ? 'text-black/80' : 'text-white drop-shadow-md'
      }`}
    >
      <span className="font-semibold w-16">{time}</span>
      <div className="flex gap-2 items-center">
        {focus && <Moon size={14} className="fill-current" />}
        {airplane ? (
          <Plane size={15} />
        ) : (
          <>
            {bluetooth && <Bluetooth size={14} />}
            {cellular ? <Signal size={14} /> : <Signal size={14} className="opacity-30" />}
            {wifi ? <Wifi size={15} /> : <WifiOff size={15} className="opacity-60" />}
          </>
        )}
        <Battery size={19} />
      </div>
    </div>
  );
};
