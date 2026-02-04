'use client';

import { useEffect, useState } from 'react';
import { collection, addDoc, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { escapeHtml } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

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
  const { user, profile } = useAuth();
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    album: '',
    title: '',
    desc: '',
    file: null as File | null,
  });

  const loadPhotos = () => {
    getDocs(query(collection(db, 'gallery_photos'), orderBy('date', 'desc')))
      .then((snap) => {
        setPhotos(snap.docs.map((d) => ({ id: d.id, ...d.data() } as GalleryPhoto)));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadPhotos();
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!UPLOAD_API || !uploadForm.file || !user) return;
    setUploading(true);
    try {
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const m = (reader.result as string).match(/^data:([^;]+);base64,(.+)$/);
          resolve(m ? m[2] : '');
        };
        reader.onerror = reject;
        reader.readAsDataURL(uploadForm.file!);
      });
      const today = new Date().toISOString().slice(0, 10);
      const res = await fetch(UPLOAD_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: today,
          album: uploadForm.album || '未分類',
          title: uploadForm.title || uploadForm.file.name,
          uploader: profile?.displayName || user.email || '',
          desc: uploadForm.desc || '',
          filename: uploadForm.file.name,
          image: base64,
        }),
      });
      const json = await res.json().catch(() => ({}));
      const url = json?.url || json?.fileUrl;
      if (!url) {
        throw new Error('Apps Script 未回傳 url，請確認部署正確');
      }
      await addDoc(collection(db, 'gallery_photos'), {
        url,
        title: uploadForm.title || uploadForm.file.name,
        album: uploadForm.album || '未分類',
        desc: uploadForm.desc || '',
        date: today,
        uploader: profile?.displayName || user.email || '',
      });
      setShowUpload(false);
      setUploadForm({ album: '', title: '', desc: '', file: null });
      loadPhotos();
    } catch (err) {
      console.error(err);
      alert(
        err instanceof Error
          ? err.message
          : '上傳失敗，請確認 NEXT_PUBLIC_UPLOAD_API 正確且 Apps Script 已部署並回傳 { url }'
      );
    } finally {
      setUploading(false);
    }
  };

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
        {UPLOAD_API && user && (
          <button
            onClick={() => setShowUpload(true)}
            className="fixed bottom-20 right-6 bg-blue-500 text-white px-4 py-2 rounded-full font-bold shadow-lg flex items-center gap-2 z-10"
          >
            <i className="fas fa-cloud-upload-alt"></i>
            上傳照片
          </button>
        )}
      </div>

      {showUpload && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">
              <i className="fas fa-cloud-upload-alt text-blue-500 mr-2"></i> 上傳照片
            </h3>
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">相簿名稱</label>
                <input
                  type="text"
                  value={uploadForm.album}
                  onChange={(e) => setUploadForm((p) => ({ ...p, album: e.target.value }))}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                  placeholder="未分類"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">標題</label>
                <input
                  type="text"
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm((p) => ({ ...p, title: e.target.value }))}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                  placeholder="照片標題"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">說明</label>
                <input
                  type="text"
                  value={uploadForm.desc}
                  onChange={(e) => setUploadForm((p) => ({ ...p, desc: e.target.value }))}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                  placeholder="選填"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">選擇圖片</label>
                <input
                  type="file"
                  accept="image/*"
                  required
                  onChange={(e) =>
                    setUploadForm((p) => ({ ...p, file: e.target.files?.[0] || null }))
                  }
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 bg-blue-600 text-white font-bold py-2 rounded-lg disabled:opacity-50"
                >
                  {uploading ? <i className="fas fa-spinner fa-spin mr-2"></i> : null}
                  上傳
                </button>
                <button
                  type="button"
                  onClick={() => setShowUpload(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700"
                >
                  取消
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
