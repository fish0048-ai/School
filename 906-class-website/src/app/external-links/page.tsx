'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { escapeHtml } from '@/lib/utils';

interface LinkItem {
  id: string;
  cat: string;
  title: string;
  url: string;
}

export default function ExternalLinks() {
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDocs(query(collection(db, 'links'), orderBy('cat', 'asc')))
      .then((snap) => {
        setLinks(snap.docs.map((d) => ({ id: d.id, ...d.data() } as LinkItem)));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const grouped = links.reduce<Record<string, LinkItem[]>>((acc, l) => {
    const c = l.cat || '其他';
    if (!acc[c]) acc[c] = [];
    acc[c].push(l);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <i className="fas fa-circle-notch fa-spin text-4xl text-slate-500"></i>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border-t-4 border-slate-500">
      <h2 className="text-xl font-bold text-slate-800 mb-4">
        <i className="fas fa-link text-slate-500 mr-2"></i> 常用連結
      </h2>
      {Object.keys(grouped).length === 0 ? (
        <p className="text-slate-500">尚無連結</p>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([cat, items]) => (
            <div key={cat}>
              <h3 className="text-lg font-bold text-slate-700 border-b pb-2 mb-3">{cat}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {items.map((l) => (
                  <a
                    key={l.id}
                    href={l.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:text-blue-600 group"
                  >
                    <span className="font-medium">{escapeHtml(l.title)}</span>
                    <i className="fas fa-external-link-alt text-xs text-slate-400 group-hover:text-blue-400"></i>
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
