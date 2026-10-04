import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Search, Grid, ArrowUp, Share, Plus, Send, X } from 'lucide-react';
import { useOS } from '../system/OSContext';
import { GLASS } from '../system/tokens';

interface Draft {
  to: string;
  subject: string;
  body: string;
}

// Inbox → detail → working compose sheet driven by the system keyboard.
const MailApp: React.FC = () => {
  const { t, registerInput, unregisterInput, openKeyboard, pushToast } = useOS();
  const [view, setView] = useState<'list' | 'detail'>('list');
  const [composing, setComposing] = useState(false);
  const [draft, setDraft] = useState<Draft>({ to: '', subject: '', body: '' });
  const [read, setRead] = useState<Set<number>>(new Set());
  const draftRef = useRef(draft);
  draftRef.current = draft;

  useEffect(() => {
    registerInput('mail.to', { get: () => draftRef.current.to, set: (v) => setDraft((d) => ({ ...d, to: v })), placeholder: t('mail.to') });
    registerInput('mail.subject', { get: () => draftRef.current.subject, set: (v) => setDraft((d) => ({ ...d, subject: v })), placeholder: t('mail.subject') });
    registerInput('mail.body', { get: () => draftRef.current.body, set: (v) => setDraft((d) => ({ ...d, body: v })), placeholder: t('mail.body') });
    return () => {
      unregisterInput('mail.to');
      unregisterInput('mail.subject');
      unregisterInput('mail.body');
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const send = () => {
    pushToast(t('mail.sent'));
    setComposing(false);
    setDraft({ to: '', subject: '', body: '' });
  };

  const openDetail = (i: number) => {
    setRead((p) => new Set(p).add(i));
    setView('detail');
  };

  return (
    <div className="h-full w-full flex flex-col">
      <AnimatePresence>
        {view === 'detail' && (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            className="absolute inset-0 z-20 bg-slate-50 flex flex-col pt-12"
          >
            <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-white/50 backdrop-blur-md">
              <button onClick={() => setView('list')} className="flex items-center text-wave-deep font-medium active:opacity-70">
                <ChevronLeft /> {t('mail.inbox')}
              </button>
              <div className="flex gap-6 text-wave-deep">
                <ArrowUp />
                <Share />
              </div>
            </div>
            <div className="p-6 overflow-y-auto no-scrollbar">
              <div className="flex justify-between items-start mb-6">
                <h1 className="text-2xl font-bold">New Login Detected</h1>
                <span className="text-xs text-gray-400">10:42 AM</span>
              </div>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-bold">N</div>
                <div>
                  <div className="font-bold">Nyne Support</div>
                  <div className="text-xs text-gray-500">To: You</div>
                </div>
              </div>
              <p className="text-gray-700 leading-relaxed text-lg">
                Your Nyne ID was used to sign in to a new device. If this wasn't you, please change your password immediately.
              </p>
              <button
                onClick={() => setComposing(true)}
                className="mt-8 px-6 py-3 bg-wave-cyan text-white font-bold rounded-full shadow-lg shadow-wave-cyan/30 active:scale-95 transition-transform"
              >
                {t('mail.reply')}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="px-6 pt-16 pb-2">
        <div className="flex justify-between items-center">
          <button className="text-wave-deep font-medium active:opacity-70">{t('common.edit')}</button>
          <h1 className="text-2xl font-bold text-black/90">{t('mail.inbox')}</h1>
          <button className="text-wave-deep active:opacity-70" aria-label="Mailboxes">
            <Grid size={20} />
          </button>
        </div>
        <div className="mt-4 h-10 bg-white shadow-sm border border-gray-100 rounded-[14px] flex items-center px-3 gap-2 text-gray-400">
          <Search size={16} /> <span className="text-sm">{t('common.search')}</span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto no-scrollbar px-4 pb-24 space-y-3">
        {[...Array(6)].map((_, i) => (
          <button
            key={i}
            onClick={() => openDetail(i)}
            className="w-full text-left bg-white p-4 rounded-[24px] shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-50 flex flex-col gap-1 active:scale-[0.98] transition-transform relative overflow-hidden"
          >
            <div className="flex justify-between items-center">
              <span className="font-bold text-sm flex items-center gap-2 text-black/90">
                {i === 0 && !read.has(i) && <div className="w-2.5 h-2.5 rounded-full bg-wave-cyan shadow-sm" />}
                Nyne Support
              </span>
              <span className="text-xs text-black/40">10:4{i} AM</span>
            </div>
            <span className="font-medium text-sm mt-1 text-black/80">New Login Detected on MacBook Pro…</span>
            <span className="text-xs text-black/50 truncate mt-0.5">We detected a new login from a device you don't usually use…</span>
          </button>
        ))}
      </div>

      <div className="absolute bottom-24 right-6 z-10">
        <button
          onClick={() => setComposing(true)}
          aria-label={t('mail.compose')}
          className="w-14 h-14 rounded-full bg-wave-cyan text-white flex items-center justify-center shadow-lg shadow-wave-cyan/40 border border-cyan-300 active:scale-90 transition-transform"
        >
          <Plus size={28} />
        </button>
      </div>

      {/* Compose sheet */}
      <AnimatePresence>
        {composing && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: '0%' }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            className="absolute inset-x-0 bottom-0 top-20 z-[120] bg-white rounded-t-[28px] shadow-2xl flex flex-col overflow-hidden"
          >
            <div className="flex justify-between items-center px-5 py-4 border-b border-gray-100">
              <button onClick={() => setComposing(false)} className="text-wave-deep font-medium active:opacity-70">
                {t('common.cancel')}
              </button>
              <span className="font-bold text-black/90">{t('mail.compose')}</span>
              <button
                onClick={send}
                aria-label={t('common.send')}
                className="w-9 h-9 rounded-full bg-wave-cyan text-white flex items-center justify-center active:scale-90"
              >
                <Send size={16} />
              </button>
            </div>
            <button onClick={() => openKeyboard('mail.to')} className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-100 text-left">
              <span className="text-sm text-gray-400 w-16">{t('mail.to')}</span>
              <span className="text-sm font-medium text-black/85 truncate">{draft.to}</span>
            </button>
            <button onClick={() => openKeyboard('mail.subject')} className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-100 text-left">
              <span className="text-sm text-gray-400 w-16">{t('mail.subject')}</span>
              <span className="text-sm font-medium text-black/85 truncate">{draft.subject}</span>
            </button>
            <button onClick={() => openKeyboard('mail.body')} className="flex-1 px-5 py-4 text-left align-top">
              <span className={`text-[15px] leading-relaxed ${draft.body ? 'text-black/85' : 'text-gray-400'}`}>
                {draft.body || t('mail.body')}
              </span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MailApp;
