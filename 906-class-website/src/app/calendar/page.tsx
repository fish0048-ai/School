'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  due?: string;
  content?: string;
  type: 'announcement' | 'countdown';
}

function toDateStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function Calendar() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 0);
    const startStr = toDateStr(start);
    const endStr = toDateStr(end);

    Promise.all([
      getDocs(collection(db, 'announcements')),
      getDocs(collection(db, 'countdown_events')),
    ])
      .then(([annSnap, countSnap]) => {
        const list: CalendarEvent[] = [];
        annSnap.docs.forEach((d) => {
          const data = d.data();
          const date = data.date || '';
          if (date >= startStr && date <= endStr) {
            list.push({
              id: d.id,
              title: data.title || '',
              date: date,
              due: data.due,
              content: data.content,
              type: 'announcement',
            });
          }
        });
        countSnap.docs.forEach((d) => {
          const data = d.data();
          const dateVal = data.date;
          let dateStr = '';
          if (dateVal?.toDate) {
            dateStr = toDateStr(dateVal.toDate());
          } else if (typeof dateVal === 'string') {
            dateStr = dateVal.slice(0, 10);
          }
          if (dateStr && dateStr >= startStr && dateStr <= endStr) {
            list.push({
              id: d.id,
              title: data.title || '',
              date: dateStr,
              type: 'countdown',
            });
          }
        });
        setEvents(list.sort((a, b) => a.date.localeCompare(b.date)));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [year, month]);

  const changeMonth = (delta: number) => {
    let m = month + delta;
    let y = year;
    if (m < 0) {
      m = 11;
      y--;
    } else if (m > 11) {
      m = 0;
      y++;
    }
    setMonth(m);
    setYear(y);
  };

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  const todayStr = toDateStr(today);

  const cells: (number | null)[] = [];
  for (let i = 0; i < (firstDay === 0 ? 6 : firstDay - 1); i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const eventsByDay: Record<string, CalendarEvent[]> = {};
  events.forEach((e) => {
    if (!eventsByDay[e.date]) eventsByDay[e.date] = [];
    eventsByDay[e.date].push(e);
  });

  return (
    <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border-t-4 border-indigo-500">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-slate-800">
          <i className="fas fa-calendar-alt text-indigo-500 mr-2"></i> 重要日程
        </h2>
        <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-lg text-sm">
          <button
            onClick={() => changeMonth(-1)}
            className="p-2 rounded hover:bg-white"
          >
            <i className="fas fa-chevron-left"></i>
          </button>
          <span className="font-bold text-slate-700 min-w-[80px] text-center">
            {year}年 {month + 1}月
          </span>
          <button
            onClick={() => changeMonth(1)}
            className="p-2 rounded hover:bg-white"
          >
            <i className="fas fa-chevron-right"></i>
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 mb-2 text-center text-slate-500 text-xs font-bold">
        <div className="text-red-500">日</div>
        <div>一</div>
        <div>二</div>
        <div>三</div>
        <div>四</div>
        <div>五</div>
        <div className="text-green-600">六</div>
      </div>
      <div className="grid grid-cols-7 gap-1 bg-slate-200 border border-slate-300 rounded-lg overflow-hidden">
        {cells.map((d, i) => {
          const dayStr = d ? toDateStr(new Date(year, month, d)) : '';
          const dayEvents = dayStr ? eventsByDay[dayStr] || [] : [];
          const isToday = dayStr === todayStr;
          return (
            <div
              key={i}
              className={`aspect-square bg-white p-1 text-sm flex flex-col ${
                d === null ? 'bg-slate-50' : ''
              } ${isToday ? 'bg-blue-100 ring-2 ring-blue-500' : ''}`}
            >
              <span>{d ?? ''}</span>
              {dayEvents.length > 0 && (
                <span className="text-xs text-indigo-600 mt-auto">
                  {dayEvents.length} 項
                </span>
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-6 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
        <h3 className="font-bold text-indigo-900 mb-3 text-sm">本月日程</h3>
        {loading ? (
          <p className="text-slate-500 text-sm">載入中...</p>
        ) : events.length === 0 ? (
          <p className="text-slate-500 text-sm">本月尚無公告或倒數事件</p>
        ) : (
          <ul className="space-y-2">
            {events.map((e) => (
              <li key={e.id} className="flex items-start gap-2 text-sm">
                <span className="text-slate-500 shrink-0">{e.date}</span>
                <span
                  className={`px-2 py-0.5 rounded text-xs ${
                    e.type === 'countdown' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {e.type === 'countdown' ? '倒數' : '公告'}
                </span>
                <span className="font-medium">{e.title}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
