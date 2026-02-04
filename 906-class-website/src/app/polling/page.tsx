'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface Poll {
  id: string;
  title: string;
  formUrl: string;
  due?: string;
}

export default function Polling() {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDocs(query(collection(db, 'polls'), orderBy('due', 'desc')))
      .then((snap) => {
        setPolls(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Poll)));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border-t-4 border-pink-500">
      <h2 className="text-xl font-bold text-slate-800 mb-4">
        <i className="fas fa-check-to-slot text-pink-500 mr-2"></i> 投票區
      </h2>
      {loading ? (
        <div className="flex justify-center py-10">
          <i className="fas fa-circle-notch fa-spin text-4xl text-pink-500"></i>
        </div>
      ) : polls.length === 0 ? (
        <p className="text-slate-500 py-6">尚無投票。請於 Firestore polls 集合新增表單連結。</p>
      ) : (
        <div className="space-y-6">
          {polls.map((p) => (
            <div
              key={p.id}
              className="border border-pink-200 rounded-xl overflow-hidden"
            >
              <div className="p-4 bg-pink-50 flex justify-between items-center">
                <h3 className="font-bold text-slate-800">{p.title}</h3>
                {p.due && (
                  <span className="text-xs text-slate-500">截止：{p.due}</span>
                )}
              </div>
              <div className="p-4">
                {p.formUrl ? (
                  <iframe
                    src={p.formUrl.replace('/viewform', '/viewform?embedded=true')}
                    width="100%"
                    height="400"
                    frameBorder="0"
                    marginHeight={0}
                    marginWidth={0}
                    title={p.title}
                    className="max-w-full rounded-lg"
                  />
                ) : (
                  <a
                    href={p.formUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-pink-600 hover:underline"
                  >
                    開啟表單 <i className="fas fa-external-link-alt text-xs ml-1"></i>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
