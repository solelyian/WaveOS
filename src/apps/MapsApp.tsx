import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Search, MapPin, Navigation, LocateFixed, CornerUpRight, ArrowUp, CornerUpLeft } from 'lucide-react';
import { useOS } from '../system/OSContext';
import { GLASS } from '../system/tokens';

// Search drives the system keyboard; Directions opens a real route sheet.
const MapsApp: React.FC = () => {
  const { t, closeActiveApp, registerInput, unregisterInput, openKeyboard } = useOS();
  const [query, setQuery] = useState('');
  const [routing, setRouting] = useState(false);
  const qRef = useRef(query);
  qRef.current = query;

  useEffect(() => {
    registerInput('maps.search', { get: () => qRef.current, set: setQuery, placeholder: t('maps.search') });
    return () => unregisterInput('maps.search');
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const cats = [t('maps.restaurants'), t('maps.gas'), t('maps.groceries'), t('maps.hotels')];

  const steps = [
    { icon: ArrowUp, text: 'Head north on Powell St', d: '0.3 mi' },
    { icon: CornerUpRight, text: 'Turn right onto Geary St', d: '0.4 mi' },
    { icon: CornerUpLeft, text: 'Turn left — destination on your right', d: '0.1 mi' },
  ];

  return (
    <div className="h-full w-full relative bg-[#e5e3df] overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="w-full h-full bg-[url('https://api.mapbox.com/styles/v1/mapbox/light-v10/static/-122.4194,37.7749,12,0/800x1200?access_token=pk.eyJ1IjoiZXhhbXBsZSIsImEiOiJjbGZ5cGJ1d3IwMDBmM2V0Z2Z5cGJ1d3IwIn0.example')] bg-cover bg-center grayscale-[0.2]" />
        {/* stylized streets overlay so the map reads even offline */}
        <svg className="absolute inset-0 w-full h-full opacity-30" preserveAspectRatio="none" viewBox="0 0 400 850">
          {[...Array(7)].map((_, i) => (
            <line key={`v${i}`} x1={40 + i * 55} y1={0} x2={30 + i * 58} y2={850} stroke="white" strokeWidth={i % 3 === 0 ? 10 : 4} />
          ))}
          {[...Array(11)].map((_, i) => (
            <line key={`h${i}`} x1={0} y1={30 + i * 80} x2={400} y2={20 + i * 82} stroke="white" strokeWidth={i % 4 === 0 ? 9 : 4} />
          ))}
        </svg>
        {routing && (
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 850" preserveAspectRatio="none">
            <motion.path
              d="M200 430 L 200 350 L 290 350 L 290 180"
              fill="none"
              stroke="#00C2FF"
              strokeWidth={6}
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1 }}
            />
            <circle cx="290" cy="180" r="10" fill="#00C2FF" stroke="white" strokeWidth="4" />
          </svg>
        )}
      </div>

      <div className="absolute top-14 left-4 right-4 z-20">
        <div className={`${GLASS.high} rounded-[20px] h-12 flex items-center px-3 gap-2.5`}>
          <button onClick={closeActiveApp} aria-label="Back" className="p-1.5 bg-black/5 rounded-full">
            <ChevronLeft size={16} />
          </button>
          <Search size={17} className="text-gray-600" />
          <button onClick={() => openKeyboard('maps.search')} className="flex-1 text-left text-sm font-medium truncate">
            <span className={query ? 'text-black' : 'text-gray-500'}>{query || t('maps.search')}</span>
          </button>
          <div className="w-8 h-8 rounded-full bg-wave-cyan text-white flex items-center justify-center text-xs font-bold shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)]">
            JD
          </div>
        </div>
        <div className="flex gap-2 mt-3 overflow-x-auto no-scrollbar pl-1">
          {cats.map((cat) => (
            <button
              key={cat}
              onClick={() => setQuery(cat)}
              className={`px-4 py-1.5 ${GLASS.high} rounded-full text-xs font-bold text-gray-800 active:scale-95 transition-transform whitespace-nowrap`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center">
        <div className="bg-white/90 backdrop-blur-md border border-white/50 px-3 py-1.5 rounded-xl shadow-md text-xs font-bold mb-1 whitespace-nowrap">
          {query || 'Union Square'}
        </div>
        <MapPin size={36} className="text-red-500 fill-red-500 drop-shadow-xl" />
      </div>

      <button
        aria-label="Locate"
        className={`absolute bottom-[360px] right-4 z-20 w-11 h-11 rounded-full ${GLASS.high} flex items-center justify-center text-wave-deep active:scale-90 transition-transform shadow-md`}
      >
        <LocateFixed size={20} />
      </button>

      <AnimatePresence>
        {!routing ? (
          <motion.div
            key="place"
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            className={`absolute bottom-10 left-4 right-4 ${GLASS.high} rounded-[28px] p-5 pb-7`}
          >
            <div className="w-12 h-1 bg-black/20 rounded-full mx-auto mb-4" />
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-bold text-black/90">{query || 'Union Square'}</h2>
                <p className="text-sm text-black/60">Public Plaza · 0.2 mi</p>
              </div>
              <button
                onClick={() => setRouting(true)}
                aria-label={t('maps.directions')}
                className="w-12 h-12 rounded-full bg-wave-cyan text-white flex items-center justify-center shadow-lg shadow-wave-cyan/30 border border-cyan-300 active:scale-95 transition-transform"
              >
                <Navigation size={20} fill="white" />
              </button>
            </div>
            <div className="flex gap-4 overflow-x-auto no-scrollbar">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-24 h-24 shrink-0 rounded-[20px] bg-gray-200 overflow-hidden shadow-sm border border-white/50">
                  <img src={`https://picsum.photos/seed/${i + 88}/200`} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="route"
            initial={{ y: 200, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 200, opacity: 0 }}
            className={`absolute bottom-10 left-4 right-4 ${GLASS.high} rounded-[28px] p-5 pb-7`}
          >
            <div className="flex justify-between items-center mb-4">
              <div>
                <div className="text-2xl font-bold text-wave-deep">12 min</div>
                <div className="text-xs text-black/50 font-medium">0.8 mi · {query || 'Union Square'}</div>
              </div>
              <button
                onClick={() => setRouting(false)}
                className="px-4 py-2 rounded-full bg-black/5 text-sm font-bold text-black/70 active:scale-95"
              >
                {t('common.cancel')}
              </button>
            </div>
            <div className="space-y-3">
              {steps.map((s, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-wave-cyan/15 flex items-center justify-center text-wave-deep">
                    <s.icon size={16} />
                  </div>
                  <div className="flex-1 text-sm font-medium text-black/80">{s.text}</div>
                  <div className="text-xs text-black/40 font-semibold">{s.d}</div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MapsApp;
