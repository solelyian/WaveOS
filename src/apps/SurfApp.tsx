import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Grid, Shield, ChevronLeft, X, RotateCw } from 'lucide-react';
import { useOS } from '../system/OSContext';
import { GLASS } from '../system/tokens';

interface Page {
  title: string;
  url: string;
}

// Renamed from "Safari" — WaveOS's own browser. Address bar drives the
// system keyboard and loads a page view; the grid opens a tab card.
const SurfApp: React.FC = () => {
  const { t, registerInput, unregisterInput, openKeyboard } = useOS();
  const [page, setPage] = useState<Page | null>(null);
  const [query, setQuery] = useState('');
  const [tabsOpen, setTabsOpen] = useState(false);
  const qRef = useRef(query);
  qRef.current = query;

  const go = () => {
    const q = qRef.current.trim();
    if (!q) return;
    const url = q.includes('.') ? q.toLowerCase() : `${q.toLowerCase().replace(/\s+/g, '')}.wave`;
    setPage({ title: q, url });
    setTabsOpen(false);
  };

  useEffect(() => {
    registerInput('surf.address', { get: () => qRef.current, set: setQuery, onSubmit: go, placeholder: t('surf.address') });
    return () => unregisterInput('surf.address');
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const favorites = [
    { name: 'Nyne', icon: 'N', color: 'bg-black' },
    { name: 'Google', icon: 'G', color: 'bg-red-500' },
    { name: 'Twitter', icon: 'X', color: 'bg-black' },
    { name: 'News', icon: 'N', color: 'bg-pink-500' },
    { name: 'Reddit', icon: 'R', color: 'bg-orange-500' },
    { name: 'Video', icon: 'V', color: 'bg-red-600' },
  ];

  return (
    <div className="h-full w-full flex flex-col relative">
      <AnimatePresence mode="wait">
        {page ? (
          <motion.div key="page" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 overflow-y-auto no-scrollbar pt-16 pb-28">
            <div className="px-6 py-8 border-b border-gray-100 bg-white">
              <div className="text-xs font-bold text-wave-deep uppercase tracking-wider mb-2">{page.url}</div>
              <h1 className="text-3xl font-bold text-black/90 capitalize">{page.title}</h1>
            </div>
            <div className="px-6 py-6 space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded-full w-full" />
                  <div className="h-4 bg-gray-200 rounded-full w-5/6" />
                  <div className="h-4 bg-gray-200 rounded-full w-2/3" />
                </div>
              ))}
              <div className="h-40 rounded-[24px] bg-gradient-to-br from-wave-cyan/20 to-wave-deep/10 border border-wave-cyan/20 flex items-center justify-center">
                <Shield size={40} className="text-wave-deep/40" />
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div key="start" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 overflow-y-auto no-scrollbar pt-16 px-6 pb-28">
            <div className="text-3xl font-bold mb-8 text-black/90">{t('surf.startPage')}</div>
            <div className="text-sm font-bold text-black/30 mb-4 uppercase tracking-wider">{t('surf.favorites')}</div>
            <div className="grid grid-cols-4 gap-y-6">
              {favorites.map((site) => (
                <button key={site.name} onClick={() => { setQuery(site.name); setPage({ title: site.name, url: `${site.name.toLowerCase()}.wave` }); }} className="flex flex-col items-center gap-2">
                  <div className={`w-16 h-16 rounded-[22px] ${site.color} text-white flex items-center justify-center text-2xl font-bold shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),0_4px_10px_rgba(0,0,0,0.1)] active:scale-95 transition-transform`}>
                    {site.icon}
                  </div>
                  <span className="text-xs text-black/60 font-medium">{site.name}</span>
                </button>
              ))}
            </div>
            <div className="text-sm font-bold text-black/30 mt-10 mb-4 uppercase tracking-wider">{t('surf.privacyReport')}</div>
            <div className="bg-white rounded-[28px] p-5 flex items-center gap-4 shadow-sm border border-gray-100">
              <Shield className="text-wave-cyan fill-wave-cyan/20" size={40} />
              <div>
                <div className="font-bold text-lg text-black/90">24 {t('surf.trackers')}</div>
                <div className="text-xs text-black/50 font-medium">{t('surf.last24')}</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Address bar */}
      <div className={`absolute bottom-24 left-4 right-4 h-14 ${GLASS.high} rounded-[24px] flex items-center px-4 gap-3 z-20`}>
        {page ? (
          <button onClick={() => setPage(null)} aria-label="Back to start" className="text-wave-deep active:scale-90">
            <ChevronLeft size={20} />
          </button>
        ) : (
          <div className="text-black/50 font-medium text-sm">Aa</div>
        )}
        <button onClick={() => openKeyboard('surf.address')} className="flex-1 text-center font-medium text-sm flex items-center justify-center gap-1.5 text-black/90 truncate">
          <Lock size={12} className="text-black/50 shrink-0" />
          <span className="truncate">{page ? page.url : query || t('surf.address')}</span>
        </button>
        {page ? (
          <button onClick={() => {}} aria-label="Reload" className="text-wave-deep active:scale-90">
            <RotateCw size={16} />
          </button>
        ) : null}
        <button onClick={() => setTabsOpen(true)} aria-label="Tabs" className="text-wave-deep active:scale-90">
          <Grid size={18} />
        </button>
      </div>

      {/* Tab overview */}
      <AnimatePresence>
        {tabsOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[110] bg-black/50 backdrop-blur-lg flex items-center justify-center p-8"
            onClick={() => setTabsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.8, y: 40 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0 }}
              className="w-[70%] aspect-[400/600] bg-white rounded-[24px] shadow-2xl overflow-hidden"
              onClick={(e) => {
                e.stopPropagation();
                setTabsOpen(false);
              }}
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <span className="text-xs font-bold text-black/70 truncate">{page ? page.url : t('surf.startPage')}</span>
                <X size={14} className="text-black/40" />
              </div>
              <div className="p-4 text-sm font-bold text-black/80 capitalize">{page ? page.title : t('surf.startPage')}</div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SurfApp;
