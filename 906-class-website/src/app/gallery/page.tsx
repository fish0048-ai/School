'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { escapeHtml } from '@/lib/utils';

interface GalleryPhoto {
  id: string;
  url: string;
  title: string;
  album: string;
  desc?: string;
  date?: string;
  uploader?: string;
}

const UPLOAD_API = process.env.NEXT_PUBLIC_UPLOAD_API || '';

export default function Gallery() {
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDocs(query(collection(db, 'gallery_photos'), orderBy('date', 'desc')))
      .then((snap) => {
        setPhotos(
          snap.docs.map((d) => ({ id: d.id, ...d.data() } as GalleryPhoto))
        );
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const albums = photos.reduce<Record<string, GalleryPhoto[]>>((acc, p) => {
    const a = p.album || '未分類';
    if (!acc[a]) acc[a] = [];
    acc[a].push(p);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <i className="fas fa-circle-notch fa-spin text-4xl text-blue-500"></i>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border-t-4 border-blue-500">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-slate-800">
          <i className="fas fa-images text-blue-500 mr-2"></i> 班級相簿
        </h2>
        {UPLOAD_API && (
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              alert('上傳功能需連接 Apps Script，請在設定中填入 NEXT_PUBLIC_UPLOAD_API');
            }}
            className="fixed bottom-20 right-6 bg-blue-500 text-white px-4 py-2 rounded-full font-bold shadow-lg flex items-center gap-2"
          >
            <i className="fas fa-cloud-upload-alt"></i>
            上傳照片
          </a>
        )}
      </div>
      {Object.keys(albums).length === 0 ? (
        <p className="text-center text-slate-500 py-10">尚無照片</p>
      ) : (
        <div className="space-y-6">
          {Object.entries(albums).map(([albumName, imgs]) => (
            <div key={albumName} className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="p-4 bg-slate-50 font-bold text-slate-700 flex items-center">
                <i className="fas fa-folder-open text-yellow-500 mr-2"></i>
                {escapeHtml(albumName)}
                <span className="ml-2 text-xs bg-white border border-slate-200 px-2 py-0.5 rounded-full text-slate-500">
                  {imgs.length}
                </span>
              </div>
              <div className="p-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                {imgs.map((p) => (
                  <a
                    key={p.id}
                    href={p.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="aspect-[4/3] bg-slate-100 rounded-lg overflow-hidden block group"
                  >
                    <img
                      src={p.url}
                      alt={p.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition"
                    />
                    <div className="p-2 bg-black/50 text-white text-xs truncate">
                      {escapeHtml(p.title || p.desc || '')}
                    </div>
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
