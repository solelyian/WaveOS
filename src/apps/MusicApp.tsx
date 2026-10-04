import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Grid,
  Signal,
  Search,
  ChevronLeft,
  MoreHorizontal,
  Heart,
  Music,
} from 'lucide-react';
import { useOS } from '../system/OSContext';
import { TabBar } from '../ui/kit';

const DURATION = 243; // 4:03

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

// All four tabs render content; the player tracks real elapsed time.
const MusicApp: React.FC = () => {
  const { isPlaying, setIsPlaying, t } = useOS();
  const [tab, setTab] = useState('listen');
  const [view, setView] = useState<'tabs' | 'player'>('tabs');
  const [pos, setPos] = useState(84);

  useEffect(() => {
    if (!isPlaying) return;
    const i = setInterval(() => setPos((p) => (p + 1) % DURATION), 1000);
    return () => clearInterval(i);
  }, [isPlaying]);

  return (
    <div className="h-full w-full text-white flex flex-col overflow-hidden relative bg-transparent">
      <div className="absolute inset-0 z-0 opacity-40 mix-blend-screen pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-2/3 bg-gradient-to-b from-cyan-500 to-transparent blur-3xl" />
        <div className="absolute bottom-0 right-0 w-full h-2/3 bg-gradient-to-t from-rose-500 to-transparent blur-3xl" />
      </div>

      <AnimatePresence mode="wait">
        {view === 'player' ? (
          <motion.div
            key="player"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="absolute inset-0 z-20 flex flex-col pt-16 px-8 pb-10 bg-transparent"
          >
            <div className="flex justify-between items-center mb-8 drop-shadow-sm">
              <button onClick={() => setView('tabs')} aria-label="Back" className="p-2 bg-white/10 rounded-full border border-white/20 active:scale-90">
                <ChevronLeft />
              </button>
              <span className="text-xs font-bold tracking-widest uppercase opacity-60">{t('music.playingFrom')}</span>
              <button aria-label="More" className="p-2 bg-white/10 rounded-full border border-white/20 active:scale-90">
                <MoreHorizontal size={20} />
              </button>
            </div>
            <motion.div
              layoutId="mini-player"
              className="w-full aspect-square rounded-[40px] shadow-[0_20px_60px_-10px_rgba(0,194,255,0.35),inset_0_1px_1px_rgba(255,255,255,0.4)] overflow-hidden mb-10 border border-white/20"
            >
              <img src="https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=800" alt="" className="w-full h-full object-cover" />
            </motion.div>
            <div className="flex justify-between items-end mb-8 drop-shadow-md">
              <div>
                <h2 className="text-3xl font-bold">Midnight City</h2>
                <p className="text-lg text-white/70 font-medium">M83</p>
              </div>
              <div className="p-3 bg-white/10 border border-white/20 rounded-full shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)]">
                <Heart size={20} className="text-rose-400 fill-rose-400" />
              </div>
            </div>
            <div className="space-y-2 mb-8">
              <div className="w-full h-1.5 bg-black/40 border border-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-white shadow-[0_0_15px_white]" style={{ width: `${(pos / DURATION) * 100}%` }} />
              </div>
              <div className="flex justify-between text-xs font-medium opacity-60">
                <span>{fmt(pos)}</span>
                <span>{fmt(DURATION)}</span>
              </div>
            </div>
            <div className="flex justify-between items-center px-4 drop-shadow-lg">
              <SkipBack size={32} />
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsPlaying(!isPlaying)}
                aria-label={isPlaying ? 'Pause' : 'Play'}
                className="w-20 h-20 rounded-full bg-white text-black flex items-center justify-center shadow-[inset_0_-2px_4px_rgba(0,0,0,0.2),0_10px_30px_rgba(255,255,255,0.3)]"
              >
                {isPlaying ? <Pause fill="black" size={28} /> : <Play fill="black" size={28} className="ml-1" />}
              </motion.button>
              <SkipForward size={32} />
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="tabs"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col pt-16 px-6 pb-28 z-10 overflow-y-auto no-scrollbar"
          >
            {tab === 'listen' && (
              <>
                <h1 className="text-4xl font-bold mb-6 drop-shadow-md">{t('music.listenNow')}</h1>
                <motion.div
                  layoutId="mini-player"
                  onClick={() => setView('player')}
                  className="w-full aspect-[4/3] bg-black/40 border border-white/20 rounded-[28px] overflow-hidden relative shadow-[0_10px_40px_rgba(0,0,0,0.5)] mb-8 group cursor-pointer"
                >
                  <img
                    src="https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=500"
                    alt=""
                    className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-black/90 to-transparent">
                    <div className="text-xs font-bold uppercase text-wave-cyan mb-1 drop-shadow-sm">{t('music.nowPlaying')}</div>
                    <div className="text-2xl font-bold">Midnight City</div>
                    <div className="text-white/70 font-medium">M83</div>
                  </div>
                </motion.div>
                <div className="text-lg font-bold mb-4 drop-shadow-sm">{t('music.topPicks')}</div>
                <div className="grid grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <button key={i} onClick={() => { setIsPlaying(true); setView('player'); }} className="space-y-2 text-left">
                      <div className="aspect-square bg-black/40 border border-white/10 rounded-[20px] overflow-hidden shadow-lg">
                        <img src={`https://picsum.photos/seed/${i + 50}/200/200`} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="text-xs font-medium opacity-80 pl-1">{t('music.dailyMix')} {i}</div>
                    </button>
                  ))}
                </div>
              </>
            )}

            {tab === 'browse' && (
              <>
                <h1 className="text-4xl font-bold mb-6 drop-shadow-md">{t('music.browse')}</h1>
                <div className="grid grid-cols-2 gap-4">
                  {['Synthwave', 'Ambient', 'French Touch', 'Indie', 'Jazz', 'Focus'].map((g, i) => (
                    <button
                      key={g}
                      onClick={() => setView('player')}
                      className="h-28 rounded-[24px] relative overflow-hidden text-left active:scale-[0.97] transition-transform border border-white/10"
                      style={{ background: `linear-gradient(135deg, hsl(${190 + i * 25} 80% ${28 + (i % 3) * 8}%), hsl(${210 + i * 20} 70% 18%))` }}
                    >
                      <Music size={40} className="absolute -right-2 -bottom-2 opacity-20" />
                      <span className="absolute left-4 bottom-4 font-bold text-lg drop-shadow">{g}</span>
                    </button>
                  ))}
                </div>
              </>
            )}

            {tab === 'radio' && (
              <>
                <h1 className="text-4xl font-bold mb-6 drop-shadow-md">{t('music.radio')}</h1>
                <div className="text-sm font-bold text-white/40 uppercase tracking-wider mb-3">{t('music.stations')}</div>
                {['Wave One', 'Night FM', 'Analog Dreams'].map((s, i) => (
                  <button
                    key={s}
                    onClick={() => { setIsPlaying(true); setView('player'); }}
                    className="w-full flex items-center gap-4 py-4 border-b border-white/10 text-left active:opacity-70"
                  >
                    <div className="w-14 h-14 rounded-[16px] bg-gradient-to-br from-wave-cyan/40 to-purple-500/40 border border-white/15 flex items-center justify-center">
                      <Signal size={22} className="text-white/80" />
                    </div>
                    <div>
                      <div className="font-bold text-lg">{s}</div>
                      <div className="text-sm text-white/50">{i === 0 ? 'Live · M83' : 'Electronic'}</div>
                    </div>
                  </button>
                ))}
              </>
            )}

            {tab === 'search' && (
              <>
                <h1 className="text-4xl font-bold mb-6 drop-shadow-md">{t('common.search')}</h1>
                <div className="h-11 bg-white/10 border border-white/15 rounded-[14px] flex items-center px-3 gap-2 text-white/40 mb-8">
                  <Search size={16} />
                  <span className="text-sm">{t('common.search')}</span>
                </div>
                <div className="text-sm font-bold text-white/40 uppercase tracking-wider mb-3">{t('music.topPicks')}</div>
                <div className="grid grid-cols-3 gap-3">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="aspect-square rounded-[16px] overflow-hidden bg-black/40 border border-white/10">
                      <img src={`https://picsum.photos/seed/${i + 60}/150/150`} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {view === 'tabs' && (
        <TabBar
          dark
          activeTab={tab}
          onTabChange={setTab}
          tabs={[
            { id: 'listen', label: t('music.listenNow'), icon: Play },
            { id: 'browse', label: t('music.browse'), icon: Grid },
            { id: 'radio', label: t('music.radio'), icon: Signal },
            { id: 'search', label: t('common.search'), icon: Search },
          ]}
        />
      )}
    </div>
  );
};

export default MusicApp;
