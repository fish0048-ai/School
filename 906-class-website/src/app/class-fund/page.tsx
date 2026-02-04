'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { escapeHtml } from '@/lib/utils';

interface ClassFundEntry {
  id: string;
  date: string;
  item: string;
  income: number;
  expense: number;
  note: string;
}

export default function ClassFund() {
  const { hasRole, profile } = useAuth();
  const [items, setItems] = useState<ClassFundEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hasRole('teacher', 'staff')) {
      setLoading(false);
      return;
    }
    getDocs(query(collection(db, 'class_fund'), orderBy('date', 'asc')))
      .then((snap) => {
        setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() } as ClassFundEntry)));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [hasRole, profile]);

  if (!hasRole('teacher', 'staff')) {
    return (
      <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border-t-4 border-emerald-500">
        <h2 className="text-xl font-bold text-slate-800 mb-4">
          <i className="fas fa-coins text-emerald-500 mr-2"></i> 班費收支
        </h2>
        <div className="bg-emerald-50 p-6 rounded-xl border border-emerald-100 text-center">
          <i className="fas fa-lock text-2xl text-emerald-600 mb-3"></i>
          <h3 className="font-bold text-slate-800 mb-3">請登入後查看</h3>
          <p className="text-sm text-slate-500">班費功能需具備 teacher 或 staff 權限</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <i className="fas fa-circle-notch fa-spin text-4xl text-emerald-500"></i>
      </div>
    );
  }

  const totalIncome = items.reduce((s, x) => s + (Number(x.income) || 0), 0);
  const totalExpense = items.reduce((s, x) => s + (Number(x.expense) || 0), 0);
  const balance = totalIncome - totalExpense;

  return (
    <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border-t-4 border-emerald-500">
      <h2 className="text-xl font-bold text-slate-800 mb-4">
        <i className="fas fa-coins text-emerald-500 mr-2"></i> 班費收支
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-green-50 rounded-xl border border-green-200">
          <p className="text-sm text-green-700">收入總計</p>
          <p className="text-2xl font-bold text-green-800">${totalIncome}</p>
        </div>
        <div className="p-4 bg-red-50 rounded-xl border border-red-200">
          <p className="text-sm text-red-700">支出總計</p>
          <p className="text-2xl font-bold text-red-800">${totalExpense}</p>
        </div>
        <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
          <p className="text-sm text-emerald-700">結餘</p>
          <p className="text-2xl font-bold text-emerald-800">${balance}</p>
        </div>
      </div>
      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left font-bold text-slate-500">日期</th>
              <th className="px-4 py-3 text-left font-bold text-slate-500">項目</th>
              <th className="px-4 py-3 text-right font-bold text-slate-500">收入</th>
              <th className="px-4 py-3 text-right font-bold text-slate-500">支出</th>
              <th className="px-4 py-3 text-left font-bold text-slate-500">備註</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {items.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-500">
                  尚無班費紀錄
                </td>
              </tr>
            ) : (
              items.map((r) => (
                <tr key={r.id} className="hover:bg-emerald-50">
                  <td className="px-4 py-3">{escapeHtml(r.date)}</td>
                  <td className="px-4 py-3 font-medium">{escapeHtml(r.item)}</td>
                  <td className="px-4 py-3 text-right text-green-600">
                    {Number(r.income) ? `$${r.income}` : '-'}
                  </td>
                  <td className="px-4 py-3 text-right text-red-600">
                    {Number(r.expense) ? `$${r.expense}` : '-'}
                  </td>
                  <td className="px-4 py-3 text-slate-500">{escapeHtml(r.note)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
