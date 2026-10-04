import React, { useMemo, useState } from 'react';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { useOS } from '../system/OSContext';
import { NavBar } from '../ui/kit';

// Real month math + localized weekday headers; Today jumps back to the
// current date.
const CalendarApp: React.FC = () => {
  const { t, locale } = useOS();
  const now = new Date();
  const [view, setView] = useState({ y: now.getFullYear(), m: now.getMonth() });
  const [selected, setSelected] = useState(now.getDate());

  const meta = useMemo(() => {
    const first = new Date(view.y, view.m, 1);
    const days = new Date(view.y, view.m + 1, 0).getDate();
    return { firstDow: first.getDay(), days };
  }, [view]);

  const monthName = new Date(view.y, view.m, 1).toLocaleDateString(locale, { month: 'long', year: 'numeric' });
  const weekdays = useMemo(() => {
    const base = new Date(2024, 0, 7); // a Sunday
    return [...Array(7)].map((_, i) =>
      new Date(base.getFullYear(), base.getMonth(), base.getDate() + i).toLocaleDateString(locale, { weekday: 'narrow' })
    );
  }, [locale]);

  const events = [
    { time: '09:00', title: 'Team Sync', color: 'bg-blue-50 text-blue-700' },
    { time: '11:30', title: 'Design Review', color: 'bg-purple-50 text-purple-700' },
    { time: '14:00', title: 'Client Call', color: 'bg-orange-50 text-orange-700' },
    { time: '16:00', title: 'Focus Time', color: 'bg-green-50 text-green-700' },
  ];

  const nav = (dir: number) =>
    setView((v) => {
      const d = new Date(v.y, v.m + dir, 1);
      return { y: d.getFullYear(), m: d.getMonth() };
    });

  const isToday = (d: number) =>
    d === now.getDate() && view.m === now.getMonth() && view.y === now.getFullYear();

  return (
    <div className="h-full w-full flex flex-col">
      <NavBar title={monthName} large actionIcon={Plus} dark={false} />
      <div className="flex justify-between items-center px-6 mb-2">
        <button onClick={() => nav(-1)} aria-label="Previous month" className="p-2 rounded-full bg-white shadow-sm border border-gray-100 active:scale-95">
          <ChevronLeft size={16} className="text-black/60" />
        </button>
        <button onClick={() => nav(1)} aria-label="Next month" className="p-2 rounded-full bg-white shadow-sm border border-gray-100 active:scale-95">
          <ChevronRight size={16} className="text-black/60 rotate-180" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto no-scrollbar pb-28 px-4">
        <div className="bg-white rounded-[28px] p-4 mb-6 shadow-sm border border-gray-100">
          <div className="grid grid-cols-7 mb-2">
            {weekdays.map((d, i) => (
              <div key={i} className="text-center text-xs font-bold text-gray-400 uppercase">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-y-2">
            {[...Array(meta.firstDow)].map((_, i) => <div key={`e${i}`} />)}
            {[...Array(meta.days)].map((_, i) => {
              const day = i + 1;
              const isSel = day === selected;
              return (
                <div key={i} onClick={() => setSelected(day)} className="flex justify-center cursor-pointer">
                  <div
                    className={`w-9 h-9 flex items-center justify-center rounded-full text-sm font-medium transition-all ${
                      isSel
                        ? 'bg-red-500 text-white shadow-lg scale-110'
                        : isToday(day)
                          ? 'text-red-500 font-bold ring-1 ring-red-300'
                          : 'text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    {day}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <h3 className="font-bold text-xl px-2 mb-4 text-black/90">{t('calendar.schedule')}</h3>
        <div className="space-y-3">
          {events.map((evt, i) => (
            <div key={i} className="flex gap-4">
              <div className="w-14 text-right text-xs font-bold text-gray-400 pt-3">{evt.time}</div>
              <div className={`flex-1 p-4 rounded-[24px] ${evt.color} flex flex-col shadow-sm border border-gray-100 active:scale-[0.98] transition-transform`}>
                <span className="font-bold">{evt.title}</span>
                <span className="text-xs opacity-70">Wave Meet</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="absolute bottom-24 right-6">
        <button
          onClick={() => {
            setView({ y: now.getFullYear(), m: now.getMonth() });
            setSelected(now.getDate());
          }}
          className="px-6 py-3 bg-red-500 text-white font-bold rounded-full shadow-lg shadow-red-500/30 active:scale-95 transition-transform"
        >
          {t('common.today')}
        </button>
      </div>
    </div>
  );
};

export default CalendarApp;
