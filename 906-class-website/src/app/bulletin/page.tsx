'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { escapeHtml } from '@/lib/utils';

interface BulletinItem {
  id: string;
  imp: string;
  cat: string;
  date: string;
  title: string;
  due?: string;
  content: string;
}

export default function Bulletin() {
  const [items, setItems] = useState<BulletinItem[]>([]);
  const [filter, setFilter] = useState('全部');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDocs(query(collection(db, 'announcements'), orderBy('date', 'desc')))
      .then((snap) => {
        setItems(
          snap.docs.map((d) => ({ id: d.id, ...d.data() } as BulletinItem))
        );
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const categories = ['全部', ...new Set(items.map((i) => i.cat).filter(Boolean))];
  const filtered = items.filter((i) => filter === '全部' || i.cat === filter);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <i className="fas fa-circle-notch fa-spin text-4xl text-blue-500"></i>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border-t-4 border-blue-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
        <h2 className="text-xl font-bold text-slate-800">
          <i className="fas fa-bullhorn text-blue-500 mr-2"></i> 班級公告
        </h2>
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={`px-3 py-1 rounded-full text-sm font-bold ${
                filter === c ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <p className="col-span-full text-center text-slate-500 py-10">無相關公告</p>
        ) : (
          filtered.map((i) => (
            <div
              key={i.id}
              className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition"
            >
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="text-xs font-bold text-slate-400">{i.date}</span>
                <span className="text-xs font-bold bg-blue-50 text-blue-500 px-2 py-0.5 rounded">
                  {i.cat}
                </span>
                {i.due && (
                  <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded">
                    截止：{i.due}
                  </span>
                )}
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">{escapeHtml(i.title)}</h3>
              <p className="text-sm text-slate-500 line-clamp-3 mb-4">
                {escapeHtml(i.content)}
              </p>
              <span className="text-blue-500 text-sm font-bold">閱讀更多</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
