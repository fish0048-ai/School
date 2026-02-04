'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { escapeHtml } from '@/lib/utils';

interface Violation {
  id: string;
  date: string;
  seat: string;
  reason: string;
  subject: string;
  period: string;
  score: string;
  status: string;
}

export default function Violations() {
  const { hasRole, profile } = useAuth();
  const [items, setItems] = useState<Violation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hasRole('teacher', 'staff')) {
      setLoading(false);
      return;
    }
    getDocs(query(collection(db, 'violations'), orderBy('date', 'desc')))
      .then((snap) => {
        setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Violation)));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [hasRole, profile]);

  if (!hasRole('teacher', 'staff')) {
    return (
      <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border-t-4 border-yellow-500">
        <h2 className="text-xl font-bold text-slate-800 mb-4">
          <i className="fas fa-user-shield text-yellow-500 mr-2"></i> 常規紀錄
        </h2>
        <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-100 text-center">
          <i className="fas fa-lock text-2xl text-yellow-600 mb-3"></i>
          <h3 className="font-bold text-slate-800 mb-3">請登入後查看</h3>
          <p className="text-sm text-slate-500">常規紀錄需具備 teacher 或 staff 權限</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <i className="fas fa-circle-notch fa-spin text-4xl text-yellow-500"></i>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border-t-4 border-yellow-500">
      <h2 className="text-xl font-bold text-slate-800 mb-4">
        <i className="fas fa-user-shield text-yellow-500 mr-2"></i> 常規紀錄
      </h2>
      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left font-bold text-slate-500">日期</th>
              <th className="px-4 py-3 text-left font-bold text-slate-500">座號</th>
              <th className="px-4 py-3 text-left font-bold text-slate-500">事由</th>
              <th className="px-4 py-3 text-left font-bold text-slate-500">課堂</th>
              <th className="px-4 py-3 text-left font-bold text-slate-500">節次</th>
              <th className="px-4 py-3 text-left font-bold text-slate-500">扣分</th>
              <th className="px-4 py-3 text-left font-bold text-slate-500">狀態</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {items.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-500">
                  尚無常規紀錄
                </td>
              </tr>
            ) : (
              items.map((v) => (
                <tr key={v.id} className="hover:bg-yellow-50">
                  <td className="px-4 py-3">{escapeHtml(v.date)}</td>
                  <td className="px-4 py-3 font-medium">{escapeHtml(v.seat)}</td>
                  <td className="px-4 py-3">{escapeHtml(v.reason)}</td>
                  <td className="px-4 py-3">{escapeHtml(v.subject)}</td>
                  <td className="px-4 py-3">{escapeHtml(v.period)}</td>
                  <td className="px-4 py-3 text-red-600">{escapeHtml(v.score)}</td>
                  <td className="px-4 py-3">{escapeHtml(v.status)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
