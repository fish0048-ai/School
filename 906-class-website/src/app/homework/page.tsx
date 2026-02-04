'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { escapeHtml } from '@/lib/utils';

interface HomeworkItem {
  id: string;
  item: string;
  status: string;
  missing_count: number;
  missing_seats: string;
}

export default function Homework() {
  const [items, setItems] = useState<HomeworkItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDocs(query(collection(db, 'homework'), orderBy('item', 'asc')))
      .then((snap) => {
        setItems(
          snap.docs.map((d) => ({ id: d.id, ...d.data() } as HomeworkItem))
        );
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const active = items.filter((i) => (i.missing_count ?? 0) > 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <i className="fas fa-circle-notch fa-spin text-4xl text-red-500"></i>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border-t-4 border-red-500">
      <h2 className="text-xl font-bold text-slate-800 mb-4">
        <i className="fas fa-clipboard-list text-red-500 mr-2"></i> 作業繳交
      </h2>
      <div className="bg-red-50 p-3 rounded-lg mb-4 text-red-800 text-sm flex items-start">
        <i className="fas fa-info-circle mt-0.5 mr-2 flex-shrink-0"></i>
        <p>請家長協助督促孩子完成作業，培養責任感。</p>
      </div>
      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-xs font-bold text-slate-500">項目</th>
              <th className="px-4 py-3 text-xs font-bold text-slate-500">狀態</th>
              <th className="px-4 py-3 text-xs font-bold text-slate-500">人數</th>
              <th className="px-4 py-3 text-xs font-bold text-slate-500 min-w-[150px]">
                未交座號
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {active.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-green-600 font-bold text-lg">
                  <i className="fas fa-check-circle mr-2"></i>太棒了！全班無缺交！
                </td>
              </tr>
            ) : (
              active.map((r) => (
                <tr key={r.id} className="hover:bg-red-50">
                  <td className="px-6 py-4 font-medium text-slate-800">
                    {escapeHtml(r.item)}
                  </td>
                  <td
                    className={`px-6 py-4 font-bold ${
                      String(r.status).includes('已') ? 'text-green-600' : 'text-orange-500'
                    }`}
                  >
                    {escapeHtml(r.status)}
                  </td>
                  <td className="px-6 py-4 text-red-600 font-bold">{r.missing_count} 人</td>
                  <td className="px-6 py-4 text-slate-600 text-xs break-all">
                    {escapeHtml(r.missing_seats)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
