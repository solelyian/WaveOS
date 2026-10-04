import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Phone, User, Settings, Send, ChevronLeft, Search, Video } from 'lucide-react';
import { useOS } from '../system/OSContext';
import { TabBar, Toggle } from '../ui/kit';
import { GLASS } from '../system/tokens';

interface Msg {
  id: number;
  me: boolean;
  text: string;
}

const NAMES = ['Alex Morgan', 'Sarah Connor', 'John Doe', 'Marie Curie', 'Dave Kim', 'Lena Park', 'Sam Fox', 'Ana Ruiz'];

// Chats open a real conversation (system keyboard, send, auto-reply);
// Calls/People/Settings panes replace the original dead tab bar.
const MessagesApp: React.FC = () => {
  const { t, registerInput, unregisterInput, openKeyboard } = useOS();
  const [tab, setTab] = useState('chats');
  const [conv, setConv] = useState<number | null>(null);
  const [text, setText] = useState('');
  const [threads, setThreads] = useState<Record<number, Msg[]>>({});
  const [readReceipts, setReadReceipts] = useState(true);
  const textRef = useRef(text);
  textRef.current = text;
  const convRef = useRef<number | null>(null);
  convRef.current = conv;

  const seed = (c: number): Msg[] => [
    { id: 1, me: false, text: c === 0 ? 'Hey, are we still on for lunch?' : 'Sent a photo' },
    { id: 2, me: true, text: 'Yes! See you at 12:30.' },
    { id: 3, me: false, text: 'Perfect 🙌' },
  ];

  const send = () => {
    const c = convRef.current;
    const v = textRef.current.trim();
    if (c === null || !v) return;
    setThreads((prev) => ({ ...prev, [c]: [...(prev[c] ?? seed(c)), { id: Date.now(), me: true, text: v }] }));
    setText('');
    setTimeout(() => {
      setThreads((prev) => ({
        ...prev,
        [c]: [...(prev[c] ?? []), { id: Date.now() + 1, me: false, text: '👍' }],
      }));
    }, 1200);
  };

  useEffect(() => {
    registerInput('messages.compose', {
      get: () => textRef.current,
      set: setText,
      onSubmit: send,
      placeholder: t('msg.inputPlaceholder'),
    });
    return () => unregisterInput('messages.compose');
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const messages = conv !== null ? threads[conv] ?? seed(conv) : [];

  return (
    <div className="h-full w-full flex flex-col relative">
      <AnimatePresence>
        {conv !== null && (
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 60 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 z-30 bg-[#f4f4f5] flex flex-col"
          >
            <div className={`px-4 pt-14 pb-3 ${GLASS.high} rounded-b-[28px] z-20 flex items-center gap-3`}>
              <button onClick={() => setConv(null)} aria-label="Back" className="p-2 -ml-1 text-wave-deep active:scale-90">
                <ChevronLeft size={24} />
              </button>
              <img src={`https://i.pravatar.cc/100?img=${conv + 20}`} alt="" className="w-10 h-10 rounded-full bg-gray-200" />
              <div className="flex-1">
                <div className="font-bold text-black/90">{NAMES[conv]}</div>
                <div className="text-xs text-black/50">{t('phone.mobile')}</div>
              </div>
              <button aria-label="Video call" className="p-2 text-wave-deep active:scale-90">
                <Video size={20} />
              </button>
              <button aria-label="Call" className="p-2 text-wave-deep active:scale-90">
                <Phone size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar px-4 py-4 space-y-2.5">
              {messages.map((m) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={`max-w-[75%] px-4 py-2.5 rounded-[22px] text-[15px] font-medium leading-snug shadow-sm ${
                    m.me
                      ? 'ml-auto bg-wave-cyan text-white rounded-br-md'
                      : 'bg-white text-black/85 rounded-bl-md border border-gray-100'
                  }`}
                >
                  {m.text}
                </motion.div>
              ))}
            </div>

            <div className="px-4 pb-24 pt-2">
              <button
                onClick={() => openKeyboard('messages.compose')}
                className="w-full h-11 bg-white rounded-full shadow-sm border border-gray-200 flex items-center px-4 gap-3 text-left"
              >
                <span className={`flex-1 text-sm truncate ${text ? 'text-black/85 font-medium' : 'text-gray-400'}`}>
                  {text || t('msg.inputPlaceholder')}
                </span>
                <Send size={16} className={text ? 'text-wave-deep' : 'text-gray-300'} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {tab === 'chats' && (
        <>
          <div className={`px-6 pt-16 pb-4 ${GLASS.high} rounded-b-[28px] mb-2 z-20`}>
            <div className="flex justify-between items-center mb-4">
              <div className="text-wave-deep font-medium">{t('common.edit')}</div>
              <div className="p-2 bg-wave-cyan shadow-sm shadow-wave-cyan/30 text-white rounded-full active:scale-90 transition-transform">
                <Send size={18} className="ml-0.5" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-black/90 mb-4">{t('app.messages')}</h1>
            <div className="h-10 bg-white shadow-sm border border-gray-100 rounded-[14px] flex items-center px-3 gap-2 text-gray-400">
              <Search size={16} />
              <span className="text-sm">{t('common.search')}</span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto no-scrollbar pb-28 px-4 pt-2">
            <div className="flex gap-4 overflow-x-auto no-scrollbar py-2 mb-4 pl-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex flex-col items-center gap-1 shrink-0">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-wave-cyan to-green-400 p-[2px] shadow-md">
                    <div className="w-full h-full rounded-full bg-white p-0.5">
                      <img src={`https://i.pravatar.cc/150?img=${i + 10}`} alt="" className="w-full h-full rounded-full object-cover" />
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-black/50">{NAMES[i - 1].split(' ')[0]}</span>
                </div>
              ))}
            </div>
            <div className="space-y-3">
              {[...Array(8)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setConv(i)}
                  className="w-full bg-white p-4 rounded-[24px] flex gap-4 items-center shadow-sm border border-gray-100 active:scale-[0.98] transition-transform text-left"
                >
                  <div className="relative shrink-0">
                    <img src={`https://i.pravatar.cc/150?img=${i + 20}`} alt="" className="w-14 h-14 rounded-full object-cover bg-gray-200" />
                    {i < 3 && <div className="absolute -top-1 -right-1 w-4 h-4 bg-wave-cyan rounded-full border-2 border-white shadow-sm" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <span className="font-bold text-black/90 text-lg">{NAMES[i]}</span>
                      <span className="text-xs text-black/40 font-bold">10:{10 + i} AM</span>
                    </div>
                    <div className="text-sm text-black/60 truncate leading-relaxed font-medium">
                      {i === 0 ? 'Hey, are we still on for lunch?' : 'Sent a photo'}
                    </div>
                  </div>
                  <ChevronLeft size={16} className="text-gray-300 rotate-180 shrink-0" />
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {tab === 'calls' && (
        <div className="flex-1 overflow-y-auto pt-16 px-4 pb-28 no-scrollbar">
          <h1 className="text-3xl font-bold mb-4 text-black/90">{t('msg.calls')}</h1>
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center justify-between py-4 border-b border-gray-100/50">
              <div className="flex items-center gap-4">
                <img src={`https://i.pravatar.cc/100?img=${i + 30}`} alt="" className="w-12 h-12 rounded-full bg-gray-200" />
                <div>
                  <div className="font-bold text-lg text-black/90">{NAMES[i]}</div>
                  <div className="text-sm text-black/50">Wave Call</div>
                </div>
              </div>
              <span className="text-xs text-black/40">Yesterday</span>
            </div>
          ))}
        </div>
      )}

      {tab === 'people' && (
        <div className="flex-1 overflow-y-auto pt-16 px-4 pb-28 no-scrollbar">
          <h1 className="text-3xl font-bold mb-6 text-black/90">{t('msg.people')}</h1>
          <div className="grid grid-cols-3 gap-4">
            {NAMES.map((n, i) => (
              <button key={n} onClick={() => { setConv(i); setTab('chats'); }} className="flex flex-col items-center gap-2 active:scale-95 transition-transform">
                <img src={`https://i.pravatar.cc/150?img=${i + 40}`} alt="" className="w-20 h-20 rounded-full object-cover bg-gray-200 shadow-sm" />
                <span className="text-xs font-semibold text-black/70">{n.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {tab === 'settings' && (
        <div className="flex-1 overflow-y-auto pt-16 px-4 pb-28 no-scrollbar">
          <h1 className="text-3xl font-bold mb-6 text-black/90">{t('msg.settings')}</h1>
          <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <span className="font-semibold text-black/80">Read receipts</span>
              <Toggle on={readReceipts} onChange={setReadReceipts} label="Read receipts" />
            </div>
            <div className="flex items-center justify-between p-4">
              <span className="font-semibold text-black/80">Wave effects</span>
              <Toggle on={true} onChange={() => {}} label="Wave effects" />
            </div>
          </div>
        </div>
      )}

      <TabBar
        activeTab={tab}
        onTabChange={setTab}
        tabs={[
          { id: 'chats', label: t('msg.chats'), icon: MessageCircle },
          { id: 'calls', label: t('msg.calls'), icon: Phone },
          { id: 'people', label: t('msg.people'), icon: User },
          { id: 'settings', label: t('msg.settings'), icon: Settings },
        ]}
      />
    </div>
  );
};

export default MessagesApp;
