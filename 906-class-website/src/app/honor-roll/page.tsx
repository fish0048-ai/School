'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface HonorItem {
  id: string;
  progress_title: string;
  progress_winners: string[];
  rank_title: string;
  rank_winners: string[];
}

export default function HonorRoll() {
  const [items, setItems] = useState<HonorItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDocs(collection(db, 'honor_roll'))
      .then((snap) => {
        setItems(
          snap.docs.map((d) => {
            const data = d.data();
            return {
              id: d.id,
              progress_title: data.progress_title ?? '進步獎',
              progress_winners: Array.isArray(data.progress_winners) ? data.progress_winners : [],
              rank_title: data.rank_title ?? '前三名',
              rank_winners: Array.isArray(data.rank_winners) ? data.rank_winners : [],
            } as HonorItem;
          })
        );
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <i className="fas fa-circle-notch fa-spin text-4xl text-yellow-500"></i>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border-t-4 border-yellow-500">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-800">
          <i className="fas fa-trophy text-yellow-500 mr-2"></i> 榮譽榜
        </h2>
        <p className="text-xs text-slate-500 mt-1 bg-yellow-50 px-2 py-1 rounded inline-block">
          <i className="fas fa-info-circle mr-1"></i> 進步取前次大考平均，自己跟自己比
        </p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {items.length === 0 ? (
          <p className="col-span-full text-center text-slate-500">尚無資料</p>
        ) : (
          items.map((e) => (
            <div key={e.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="bg-orange-100 p-3 border-b border-orange-200">
                    <h3 className="font-bold text-orange-900">{e.progress_title}</h3>
                  </div>
                  <div className="p-4">
                    {e.progress_winners.length
                      ? e.progress_winners.map((w, i) => (
                          <div key={i} className="flex items-center mb-2 p-2 rounded">
                            {w}
                          </div>
                        ))
                      : '無資料'}
                  </div>
                </div>
                <div>
                  <div className="bg-blue-100 p-3 border-b border-blue-200">
                    <h3 className="font-bold text-blue-900">{e.rank_title}</h3>
                  </div>
                  <div className="p-4">
                    {e.rank_winners.length
                      ? e.rank_winners.map((w, i) => (
                          <div key={i} className="flex items-center mb-2 p-2 rounded">
                            {w}
                          </div>
                        ))
                      : '無資料'}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
