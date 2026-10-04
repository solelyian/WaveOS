import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Clock, User, Grid, Voicemail, Phone, Info, Delete, Play, Pause } from 'lucide-react';
import { useOS } from '../system/OSContext';
import { TabBar } from '../ui/kit';

const CONTACTS = ['Alex Morgan', 'Sarah Connor', 'John Doe', 'Marie Curie', 'Dave Kim', 'Lena Park'];

// All five tabs now have content (favorites/contacts/voicemail were dead in
// the original). Keypad dials, call screen connects, voicemail plays.
const PhoneApp: React.FC = () => {
  const { t } = useOS();
  const [tab, setTab] = useState('keypad');
  const [number, setNumber] = useState('');
  const [calling, setCalling] = useState<string | null>(null);
  const [playingVm, setPlayingVm] = useState<number | null>(null);

  const press = (n: string) => number.length < 15 && setNumber((p) => p + n);

  return (
    <div className="h-full w-full flex flex-col">
      <AnimatePresence mode="wait">
        {calling ? (
          <motion.div
            key="call-screen"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-gray-900 flex flex-col items-center pt-24 pb-12"
          >
            <img
              src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500"
              alt=""
              className="absolute inset-0 w-full h-full object-cover opacity-30 blur-xl saturate-150"
            />
            <div className="relative z-10 flex flex-col items-center flex-1">
              <div className="w-24 h-24 rounded-full overflow-hidden mb-6 shadow-2xl border-2 border-white/20">
                <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200" alt="" className="w-full h-full object-cover" />
              </div>
              <h2 className="text-3xl font-bold text-white drop-shadow-md">{calling}</h2>
              <p className="text-white/70 mt-1">{t('phone.calling')}</p>
            </div>
            <div className="relative z-10 flex gap-8">
              <button
                onClick={() => setCalling(null)}
                aria-label="End call"
                className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center text-white shadow-lg shadow-red-500/40 border border-red-400 active:scale-90 transition-transform"
              >
                <Phone size={28} className="rotate-[135deg]" />
              </button>
            </div>
          </motion.div>
        ) : (
          <div className="flex-1 flex flex-col min-h-0">
            {tab === 'keypad' && (
              <div className="flex-1 flex flex-col justify-end items-center pb-28">
                <div className="h-20 flex items-center gap-3 text-4xl font-light text-black mb-4 tracking-wider">
                  {number || <span className="text-gray-300">···</span>}
                  {number && (
                    <button onClick={() => setNumber((p) => p.slice(0, -1))} aria-label="Delete" className="text-gray-400 active:scale-90">
                      <Delete size={26} />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-x-6 gap-y-4 mb-8">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, '*', 0, '#'].map((n) => (
                    <motion.button
                      key={n}
                      whileTap={{ backgroundColor: '#e5e7eb', scale: 0.9 }}
                      onClick={() => press(String(n))}
                      className="w-[72px] h-[72px] rounded-full bg-white flex flex-col items-center justify-center transition-colors shadow-sm border border-gray-100"
                    >
                      <span className="text-3xl font-medium text-black">{n}</span>
                      {typeof n === 'number' && n !== 0 && n !== 1 && (
                        <span className="text-[9px] font-bold tracking-[2px] text-gray-400">
                          {['', '', 'ABC', 'DEF', 'GHI', 'JKL', 'MNO', 'PQRS', 'TUV', 'WXYZ'][n]}
                        </span>
                      )}
                    </motion.button>
                  ))}
                </div>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => number && setCalling(number)}
                  aria-label="Call"
                  className={`w-[72px] h-[72px] rounded-full flex items-center justify-center text-white shadow-lg border transition-all ${
                    number ? 'bg-green-500 shadow-green-500/40 border-green-400' : 'bg-gray-300 border-gray-300 shadow-none'
                  }`}
                >
                  <Phone size={32} fill="white" />
                </motion.button>
              </div>
            )}

            {tab === 'recents' && (
              <div className="flex-1 overflow-y-auto pt-16 px-4 pb-28 no-scrollbar">
                <h1 className="text-3xl font-bold mb-4 text-black/90">{t('phone.recents')}</h1>
                {[...Array(10)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between py-4 border-b border-gray-100/50">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden">
                        <img src={`https://i.pravatar.cc/100?img=${i + 1}`} alt="" />
                      </div>
                      <div>
                        <div className={`font-bold text-lg ${i === 0 ? 'text-red-500' : 'text-black/90'}`}>{CONTACTS[i % CONTACTS.length]}</div>
                        <div className="text-sm text-black/50">{t('phone.mobile')}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-black/40">Yesterday</span>
                      <button onClick={() => setCalling(CONTACTS[i % CONTACTS.length])} aria-label="Call back">
                        <Phone size={18} className="text-green-500 ml-2" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {tab === 'favorites' && (
              <div className="flex-1 overflow-y-auto pt-16 px-4 pb-28 no-scrollbar">
                <h1 className="text-3xl font-bold mb-6 text-black/90">{t('phone.favorites')}</h1>
                <div className="grid grid-cols-2 gap-4">
                  {CONTACTS.slice(0, 4).map((c, i) => (
                    <button
                      key={c}
                      onClick={() => setCalling(c)}
                      className="bg-white rounded-[24px] p-5 flex flex-col items-center gap-3 shadow-sm border border-gray-100 active:scale-[0.97] transition-transform"
                    >
                      <img src={`https://i.pravatar.cc/150?img=${i + 12}`} alt="" className="w-16 h-16 rounded-full object-cover bg-gray-200" />
                      <span className="font-semibold text-black/80 text-sm">{c}</span>
                      <Star size={16} className="text-yellow-400 fill-yellow-400" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {tab === 'contacts' && (
              <div className="flex-1 overflow-y-auto pt-16 px-4 pb-28 no-scrollbar">
                <h1 className="text-3xl font-bold mb-4 text-black/90">{t('phone.contacts')}</h1>
                {CONTACTS.map((c, i) => (
                  <button
                    key={c}
                    onClick={() => setCalling(c)}
                    className="w-full flex items-center gap-4 py-4 border-b border-gray-100/50 text-left active:opacity-70"
                  >
                    <img src={`https://i.pravatar.cc/100?img=${i + 21}`} alt="" className="w-12 h-12 rounded-full bg-gray-200" />
                    <div>
                      <div className="font-bold text-lg text-black/90">{c}</div>
                      <div className="text-sm text-black/50">{t('phone.mobile')}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {tab === 'voicemail' && (
              <div className="flex-1 overflow-y-auto pt-16 px-4 pb-28 no-scrollbar">
                <h1 className="text-3xl font-bold mb-4 text-black/90">{t('phone.voicemail')}</h1>
                {[0, 1].map((i) => (
                  <div key={i} className="py-4 border-b border-gray-100/50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-bold text-lg text-black/90">{CONTACTS[i]}</div>
                      <span className="text-xs text-black/40">Yesterday</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setPlayingVm(playingVm === i ? null : i)}
                        aria-label="Play voicemail"
                        className="w-10 h-10 rounded-full bg-wave-cyan text-white flex items-center justify-center active:scale-90"
                      >
                        {playingVm === i ? <Pause size={16} fill="white" /> : <Play size={16} fill="white" className="ml-0.5" />}
                      </button>
                      <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-wave-cyan"
                          animate={playingVm === i ? { width: '100%' } : { width: '0%' }}
                          transition={playingVm === i ? { duration: 12, ease: 'linear' } : { duration: 0.2 }}
                        />
                      </div>
                      <span className="text-xs text-black/40 font-medium">0:{12 + i * 7}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </AnimatePresence>
      <TabBar
        activeTab={tab}
        onTabChange={setTab}
        tabs={[
          { id: 'favorites', label: t('phone.favorites'), icon: Star },
          { id: 'recents', label: t('phone.recents'), icon: Clock },
          { id: 'contacts', label: t('phone.contacts'), icon: User },
          { id: 'keypad', label: t('phone.keypad'), icon: Grid },
          { id: 'voicemail', label: t('phone.voicemail'), icon: Voicemail },
        ]}
      />
    </div>
  );
};

export default PhoneApp;
