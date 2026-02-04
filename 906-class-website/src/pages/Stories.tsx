import { useEffect, useState } from 'react';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { escapeHtml } from '../lib/utils';

interface Story {
  id: string;
  cat: string;
  title: string;
  content: string;
  oneLiner?: string;
  videoId?: string;
}

export default function Stories() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDocs(query(collection(db, 'stories'), orderBy('title', 'asc')))
      .then((snap) => {
        setStories(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Story)));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <i className="fas fa-circle-notch fa-spin text-4xl text-teal-500"></i>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border-t-4 border-teal-500">
      <h2 className="text-xl font-bold text-slate-800 mb-4">
        <i className="fas fa-book-open text-teal-500 mr-2"></i> 親師生共讀
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {stories.length === 0 ? (
          <p className="col-span-full text-center text-slate-500">尚無文章</p>
        ) : (
          stories.map((s) => (
            <div
              key={s.id}
              className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-teal-500 hover:shadow-lg transition"
            >
              <span className="text-xs font-bold text-teal-600">{s.cat}</span>
              <h3 className="text-lg font-bold text-slate-800 mt-2">{escapeHtml(s.title)}</h3>
              <p className="text-sm text-slate-600 mt-2 line-clamp-2">
                {escapeHtml(s.oneLiner || s.content)}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
