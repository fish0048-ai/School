'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { escapeHtml } from '@/lib/utils';

interface SeatingDoc {
  id: string;
  grid?: string[][];
  rows?: number;
  cols?: number;
  cells?: Record<string, string>;
}

export default function Seating() {
  const { hasRole, profile } = useAuth();
  const [seating, setSeating] = useState<SeatingDoc | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hasRole('teacher', 'staff')) {
      setLoading(false);
      return;
    }
    getDocs(collection(db, 'seating'))
      .then((snap) => {
        const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() } as SeatingDoc));
        setSeating(docs[0] || null);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [hasRole, profile]);

  if (!hasRole('teacher', 'staff')) {
    return (
      <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border-t-4 border-green-500">
        <h2 className="text-xl font-bold text-slate-800 mb-4">
          <i className="fas fa-border-all text-green-500 mr-2"></i> 座位表
        </h2>
        <div className="bg-green-50 p-6 rounded-xl border border-green-100 text-center">
          <i className="fas fa-lock text-2xl text-green-600 mb-3"></i>
          <h3 className="font-bold text-slate-800 mb-3">請登入後查看</h3>
          <p className="text-sm text-slate-500">座位表需具備 teacher 或 staff 權限</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <i className="fas fa-circle-notch fa-spin text-4xl text-green-500"></i>
      </div>
    );
  }

  const grid = seating?.grid;
  const rows = seating?.rows ?? (grid?.length || 8);
  const cols = seating?.cols ?? (grid?.[0]?.length || 6);

  return (
    <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border-t-4 border-green-500">
      <h2 className="text-xl font-bold text-slate-800 mb-4">
        <i className="fas fa-border-all text-green-500 mr-2"></i> 座位表
      </h2>
      {!grid && !seating?.cells ? (
        <p className="text-slate-500 py-8">
          尚無座位表資料。請執行遷移腳本匯入，或於 Firestore <code>seating</code> 集合新增文件，格式為{' '}
          <code>grid: [[座號1, 姓名1], ...]</code>
        </p>
      ) : (
        <div className="overflow-x-auto">
          <div
            className="inline-grid gap-1 p-4 bg-slate-50 rounded-xl"
            style={{
              gridTemplateColumns: `repeat(${cols}, minmax(80px, 1fr))`,
              gridTemplateRows: `repeat(${rows}, minmax(40px, 1fr))`,
            }}
          >
            {grid?.flat().map((cell, i) => (
              <div
                key={i}
                className="flex items-center justify-center p-2 bg-white border border-slate-200 rounded text-sm font-medium"
              >
                {escapeHtml(String(cell || ''))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
