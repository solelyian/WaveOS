import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Mail, Lock, Calendar, Trash2, X, Moon } from 'lucide-react';
import { useOS, AppID } from './OSContext';
import { GLASS, SPRINGS } from './tokens';

interface Notif {
  id: number;
  app: AppID | 'home';
  appLabel: string;
  user: string;
  text: string;
  time: string;
  icon: React.ElementType;
  color: string;
}

const SEED: Notif[] = [
  { id: 1, app: 'messages', appLabel: 'Messages', user: 'Sarah Connor', text: 'The future is not set.', time: '2m', icon: MessageCircle, color: 'bg-green-500' },
  { id: 2, app: 'mail', appLabel: 'Mail', user: 'Nyne ID', text: 'New login detected on MacBook Pro.', time: '15m', icon: Mail, color: 'bg-wave-cyan' },
  { id: 3, app: 'home', appLabel: 'Home', user: 'Security', text: 'Front door motion detected.', time: '1h', icon: Lock, color: 'bg-orange-500' },
  { id: 4, app: 'calendar', appLabel: 'Calendar', user: 'Up Next', text: 'Design Review in 30 mins.', time: '1h', icon: Calendar, color: 'bg-red-500' },
];

// Notifications are now real objects: dismiss individually, clear all, tap to
// open the source app. Focus mode surfaces its silencing state.
export const NotificationCenter: React.FC = () => {
  const { setShade, t, locale, focus, openApp, pushToast } = useOS();
  const [notifs, setNotifs] = useState(SEED);
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString(locale, { hour: 'numeric', minute: '2-digit', hour12: false }));
      setDate(now.toLocaleDateString(locale, { weekday: 'long', month: 'long', day: 'numeric' }));
    };
    update();
    const i = setInterval(update, 1000);
    return () => clearInterval(i);
  }, [locale]);

  const open = (n: Notif) => {
    if (n.app === 'home') {
      pushToast(t('cc.scenesActive'));
      return;
    }
    openApp(n.app);
  };

  return (
    <motion.div
      initial={{ y: '-100%' }}
      animate={{ y: '0%' }}
      exit={{ y: '-100%' }}
      transition={SPRINGS.shade}
      drag="y"
      dragConstraints={{ top: 0, bottom: 0 }}
      onDragEnd={(e, { offset, velocity }) => {
        if (offset.y < -100 || velocity.y < -500) setShade(null);
      }}
      className="absolute inset-0 z-[200] bg-black/25 backdrop-blur-[14px] backdrop-saturate-[130%] flex flex-col p-6 pt-16 text-white"
    >
      <div className="flex flex-col items-center mb-8 drop-shadow-md">
        <div className="text-xl font-medium opacity-90 capitalize">{date}</div>
        <div className="text-7xl font-bold tracking-tight">{time}</div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar space-y-3">
        <div className="flex justify-between items-center px-2 mb-2">
          <span className="text-lg font-bold">{t('notif.title')}</span>
          {notifs.length > 0 && (
            <button
              onClick={() => setNotifs([])}
              aria-label={t('notif.clear')}
              className={`p-2 rounded-full ${GLASS.button}`}
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>

        {focus && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-[20px] bg-indigo-500/25 border border-indigo-300/30 text-sm font-medium">
            <Moon size={16} className="fill-indigo-300 text-indigo-300" />
            {t('notif.focusOn')}
          </div>
        )}

        <AnimatePresence initial={false}>
          {notifs.map((n, i) => (
            <motion.div
              key={n.id}
              layout
              initial={{ opacity: 0, x: -50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 60, scale: 0.9, transition: { duration: 0.18 } }}
              transition={{ delay: i * 0.04 }}
              onClick={() => open(n)}
              className={`${GLASS.darkHigh} p-4 rounded-[24px] flex gap-4 cursor-pointer active:scale-[0.98] transition-transform relative group`}
            >
              <div className={`w-10 h-10 rounded-full ${n.color} flex items-center justify-center shrink-0 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)]`}>
                <n.icon size={20} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline">
                  <span className="font-bold text-sm">{n.appLabel}</span>
                  <span className="text-xs opacity-60">{n.time}</span>
                </div>
                <div className="font-medium text-sm mt-0.5 opacity-90">{n.user}</div>
                <div className="text-xs opacity-70 truncate">{n.text}</div>
              </div>
              <button
                aria-label="Dismiss"
                onClick={(e) => {
                  e.stopPropagation();
                  setNotifs((prev) => prev.filter((x) => x.id !== n.id));
                }}
                className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-white/90 text-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow"
              >
                <X size={12} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>

        {notifs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 opacity-50 gap-2">
            <span className="text-sm font-semibold">{t('notif.empty')}</span>
          </div>
        )}
      </div>

      <div className="w-full h-6 flex justify-center items-center opacity-50 mt-4">
        <div className="w-12 h-1 bg-white rounded-full" />
      </div>
    </motion.div>
  );
};
