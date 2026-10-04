import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Clock, User, Grid, Voicemail, Phone, Delete, Play, Pause, MicOff, Grid3x3, Volume2, UserPlus, Video, Users } from 'lucide-react';
import { useOS } from '../system/OSContext';
import { TabBar } from '../ui/kit';

const CONTACTS = ['Alex Morgan', 'Sarah Connor', 'John Doe', 'Marie Curie', 'Dave Kim', 'Lena Park'];

// One canonical avatar per contact — recents/favorites/contacts/call all share it.
const avatarFor = (name: string) => {
  const i = CONTACTS.indexOf(name);
  return i >= 0 ? `https://i.pravatar.cc/400?img=${i + 21}` : null;
};
const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

const CallAction: React.FC<{
  icon: React.ElementType;
  label: string;
  active?: boolean;
  onPress?: () => void;
}> = ({ icon: Icon, label, active, onPress }) => (
  <motion.button
    whileTap={{ scale: 0.88 }}
    onClick={onPress}
    aria-label={label}
    aria-pressed={active}
    className="flex flex-col items-center gap-2"
  >
    <div
      className={`w-[68px] h-[68px] rounded-full flex items-center justify-center border backdrop-blur-xl transition-colors duration-150 ${
        active
          ? 'bg-white text-black border-white'
          : 'bg-white/10 text-white border-white/15 shadow-[inset_0_1px_1px_rgba(255,255,255,0.25)]'
      }`}
    >
      <Icon size={27} strokeWidth={1.8} />
    </div>
    <span className="text-[12px] font-medium text-white/85">{label}</span>
  </motion.button>
);

// iOS-style immersive call screen: full-bleed contact art, ringing state that
// connects into a live timer, glass action grid, red end button.
const CallScreen: React.FC<{ who: string; onEnd: () => void }> = ({ who, onEnd }) => {
  const { t } = useOS();
  const photo = avatarFor(who);
  const [connected, setConnected] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [muted, setMuted] = useState(false);
  const [speaker, setSpeaker] = useState(false);

  useEffect(() => {
    const connect = setTimeout(() => setConnected(true), 1800);
    return () => clearTimeout(connect);
  }, []);

  useEffect(() => {
    if (!connected) return;
    const iv = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(iv);
  }, [connected]);

  return (
    <motion.div
      key="call-screen"
      initial={{ opacity: 0, scale: 1.04 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.04, transition: { duration: 0.18 } }}
      className="absolute inset-0 z-50 bg-black flex flex-col items-center overflow-hidden"
    >
      {/* full-bleed backdrop: contact photo or gradient for unknown numbers */}
      {photo ? (
        <>
          <img src={photo} alt="" className="absolute inset-0 w-full h-full object-cover saturate-110" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/10 to-black/85" />
        </>
      ) : (
        <>
          <div className="absolute inset-0 bg-gradient-to-b from-[#06283d] via-[#0a1220] to-black" />
          <div
            className="absolute inset-0 opacity-60"
            style={{ background: 'radial-gradient(120% 60% at 50% 0%, rgba(0,194,255,0.22), transparent 60%)' }}
          />
        </>
      )}

      <div className="relative z-10 flex-1 flex flex-col items-center justify-end pb-24 w-full">
        {!photo && (
          <div className="w-24 h-24 rounded-full bg-white/10 border border-white/20 backdrop-blur-md flex items-center justify-center mb-5">
            <span className="text-3xl font-semibold text-white/90">{initialsOf(who)}</span>
          </div>
        )}
        <h2 className="text-[34px] leading-tight font-semibold text-white drop-shadow-md px-6 text-center">{who}</h2>
        <p className="text-white/75 mt-1.5 text-[17px] font-medium tabular-nums">
          {connected ? fmt(elapsed) : t('phone.calling')}
        </p>
      </div>

      <div className="relative z-10 w-full px-10 pb-4">
        <div className="grid grid-cols-3 gap-y-7 place-items-center mb-9">
          <CallAction icon={MicOff} label={t('phone.mute')} active={muted} onPress={() => setMuted((m) => !m)} />
          <CallAction icon={Grid3x3} label={t('phone.keypad')} />
          <CallAction icon={Volume2} label={t('phone.speaker')} active={speaker} onPress={() => setSpeaker((s) => !s)} />
          <CallAction icon={UserPlus} label={t('phone.addCall')} />
          <CallAction icon={Video} label={t('phone.facetime')} />
          <CallAction icon={Users} label={t('phone.contactsBtn')} />
        </div>
        <div className="flex justify-center pb-6">
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={onEnd}
            aria-label={t('phone.end')}
            className="w-[72px] h-[72px] rounded-full bg-[#FF3B30] flex items-center justify-center text-white shadow-[0_12px_32px_rgba(255,59,48,0.45)] border border-red-400/60"
          >
            <Phone size={30} className="rotate-[135deg]" fill="white" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

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
          <CallScreen who={calling} onEnd={() => setCalling(null)} />
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
                        <img src={avatarFor(CONTACTS[i % CONTACTS.length])!} alt="" />
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
                      <img src={avatarFor(c)!} alt="" className="w-16 h-16 rounded-full object-cover bg-gray-200" />
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
                    <img src={avatarFor(c)!} alt="" className="w-12 h-12 rounded-full bg-gray-200" />
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
