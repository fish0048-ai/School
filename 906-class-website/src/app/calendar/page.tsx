'use client';

import { useState } from 'react';

export default function Calendar() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth());

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

  const cells: (number | null)[] = [];
  for (let i = 0; i < (firstDay === 0 ? 6 : firstDay - 1); i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

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
        {cells.map((d, i) => (
          <div
            key={i}
            className={`aspect-square bg-white p-1 text-sm ${
              d === null ? 'bg-slate-50' : ''
            } ${
              d && today.getDate() === d && today.getMonth() === month && today.getFullYear() === year
                ? 'bg-blue-100'
                : ''
            }`}
          >
            {d ?? ''}
          </div>
        ))}
      </div>
      <div className="mt-6 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
        <h3 className="font-bold text-indigo-900 mb-3 text-sm">本月待辦</h3>
        <p className="text-slate-500 text-sm">整合公告與倒數資料顯示</p>
      </div>
    </div>
  );
}
