import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Sun, Cloud, Droplets, Wind, Eye, Compass, X } from 'lucide-react';
import { useOS } from '../system/OSContext';
import { GLASS } from '../system/tokens';

// Tap the temperature to switch °F/°C. Content paddings use the shared
// status-bar + tab-bar safe areas.
const WeatherApp: React.FC = () => {
  const { t, closeActiveApp } = useOS();
  const [celsius, setCelsius] = useState(false);
  const f2c = (f: number) => Math.round((f - 32) * (5 / 9));
  const temp = (f: number) => (celsius ? `${f2c(f)}°` : `${f}°`);

  const hourly = [
    { label: 'Now', f: 72 },
    { label: '1PM', f: 73 },
    { label: '2PM', f: 74 },
    { label: '3PM', f: 75 },
    { label: '4PM', f: 76 },
    { label: '5PM', f: 75 },
  ];

  const cards = [
    { icon: Sun, label: t('weather.uvIndex'), value: '4', sub: t('weather.moderate') },
    { icon: Droplets, label: t('weather.humidity'), value: '48%', sub: `${t('weather.dewPoint')} ${temp(54)}` },
    { icon: Eye, label: t('weather.visibility'), value: '10 mi', sub: t('weather.perfect') },
  ];

  return (
    <div className="h-full w-full text-white flex flex-col relative overflow-hidden bg-transparent">
      <motion.div
        animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        className="absolute -top-20 -right-20 w-96 h-96 bg-cyan-300/25 blur-[120px] rounded-full mix-blend-screen pointer-events-none"
      />
      <div className="flex-1 overflow-y-auto no-scrollbar pt-20 px-6 pb-24 relative z-10">
        <div className="flex justify-between items-start mb-14 drop-shadow-md">
          <button onClick={() => setCelsius(!celsius)} className="text-left" aria-label="Toggle units">
            <div className="text-lg font-medium tracking-widest uppercase opacity-90 flex items-center gap-2">
              <MapPin size={16} /> San Francisco
            </div>
            <div className="text-[7rem] leading-none font-extralight tracking-tighter mt-2 drop-shadow-lg text-white">
              {temp(72)}
            </div>
            <div className="text-xl font-medium opacity-90 mt-2">{t('weather.mostlyClear')}</div>
            <div className="flex gap-4 mt-2 text-sm opacity-80 font-medium">
              <span>H:{temp(76)} L:{temp(62)}</span>
              <span>AQI 32</span>
            </div>
          </button>
        </div>

        <div className={`${GLASS.darkHigh} rounded-[28px] p-6 mb-4 overflow-x-auto no-scrollbar`}>
          <div className="text-xs font-bold uppercase opacity-60 mb-4 sticky left-0 text-white/80">{t('weather.hourly')}</div>
          <div className="flex gap-8 w-max">
            {hourly.map((h, i) => (
              <div key={i} className="flex flex-col items-center gap-3 min-w-[30px]">
                <span className="text-xs font-medium text-white/90">{h.label}</span>
                <Cloud size={24} fill={i === 0 ? 'white' : 'rgba(255,255,255,0.2)'} />
                <span className="text-lg font-bold">{temp(h.f)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {cards.map((c, i) => (
            <div key={i} className={`aspect-square ${GLASS.darkHigh} rounded-[28px] p-5 flex flex-col justify-between`}>
              <div className="flex items-center gap-2 text-xs font-bold uppercase opacity-60 text-white/80">
                <c.icon size={14} /> {c.label}
              </div>
              <div>
                <div className="text-4xl font-semibold">{c.value}</div>
                <div className="text-sm font-medium opacity-80 mt-1">{c.sub}</div>
              </div>
              {i === 0 && (
                <div className="h-1 w-full bg-white/20 rounded-full overflow-hidden">
                  <div className="w-[40%] h-full bg-gradient-to-r from-green-400 to-yellow-400" />
                </div>
              )}
            </div>
          ))}
          <div className={`aspect-square ${GLASS.darkHigh} rounded-[28px] p-5 flex flex-col justify-between`}>
            <div className="flex items-center gap-2 text-xs font-bold uppercase opacity-60 text-white/80">
              <Wind size={14} /> {t('weather.wind')}
            </div>
            <div className="relative h-20 w-20 self-center">
              <Compass size={80} className="opacity-20 absolute inset-0" />
              <div className="absolute inset-0 flex items-center justify-center font-bold">NW</div>
              <div className="absolute inset-0 border-t-4 border-white rounded-full rotate-45 shadow-[0_2px_10px_rgba(255,255,255,0.5)]" />
            </div>
            <div className="text-center font-bold">8 mph</div>
          </div>
        </div>
      </div>
      <button
        onClick={closeActiveApp}
        aria-label="Close"
        className={`absolute top-14 right-6 p-3 rounded-full ${GLASS.button} z-50 text-white active:scale-90`}
      >
        <X size={20} />
      </button>
    </div>
  );
};

export default WeatherApp;
