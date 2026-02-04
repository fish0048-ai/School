'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, limit, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';

type ScheduleType = 'class' | 'teacher';

interface ScheduleRow {
  id: string;
  period: number;
  mon?: string;
  tue?: string;
  wed?: string;
  thu?: string;
  fri?: string;
}

const PERIODS = ['1', '2', '3', '4', '午餐', '午休', '5', '6', '7', '8'];
const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri'] as const;
const DAY_LABELS = ['週一', '週二', '週三', '週四', '週五'];

export default function Schedule() {
  const [type, setType] = useState<ScheduleType>('class');
  const [rows, setRows] = useState<ScheduleRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const col = type === 'class' ? 'schedules' : 'schedules_teacher';
    getDocs(
      query(collection(db, col), orderBy('period', 'asc'), limit(12))
    )
      .then((snap) => {
        setRows(snap.docs.map((d) => ({ id: d.id, ...d.data() } as ScheduleRow)));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [type]);

  const today = new Date();
  const dayIdx = today.getDay() === 0 ? 6 : today.getDay() - 1;
  const hour = today.getHours();
  const periodIdx =
    hour >= 8 && hour < 12 ? hour - 8 : hour >= 13 && hour < 17 ? hour - 9 : -1;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <i className="fas fa-circle-notch fa-spin text-4xl text-indigo-500"></i>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border-t-4 border-indigo-500">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-slate-800">
          <i className="fas fa-table text-indigo-500 mr-2"></i> 班級課表
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => setType('class')}
            className={`px-3 py-1 rounded-md text-sm font-bold ${
              type === 'class' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-600'
            }`}
          >
            班級課表
          </button>
          <button
            onClick={() => setType('teacher')}
            className={`px-3 py-1 rounded-md text-sm font-bold ${
              type === 'teacher' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-600'
            }`}
          >
            教師課表
          </button>
        </div>
      </div>
      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="min-w-full">
          <thead>
            <tr className="bg-slate-50">
              <th className="px-2 py-2 text-xs font-bold text-slate-500 border-r border-slate-200">
                節
              </th>
              {DAY_LABELS.map((l) => (
                <th key={l} className="px-2 py-2 text-xs font-bold text-slate-500 text-center">
                  {l}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => {
              const isBreak = PERIODS[idx] === '午餐' || PERIODS[idx] === '午休';
              return (
                <tr key={row.id}>
                  <td
                    className={`px-2 py-2 text-sm font-bold border-r border-slate-200 ${
                      isBreak ? 'bg-green-50 text-green-700' : 'text-slate-500'
                    }`}
                  >
                    {PERIODS[idx]}
                  </td>
                  {DAYS.map((day, di) => {
                    const cell = row[day] ?? '';
                    const isCurrent =
                      !isBreak &&
                      dayIdx === di &&
                      periodIdx === idx;
                    return (
                      <td
                        key={day}
                        className={`px-2 py-2 text-sm text-center border-r border-slate-100 ${
                          isCurrent ? 'bg-blue-100 font-bold text-blue-800 border-2 border-blue-500' : ''
                        }`}
                      >
                        {cell}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
