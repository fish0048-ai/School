'use client';

import { useRef, useState, useEffect } from 'react';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';

const UPLOAD_API = process.env.NEXT_PUBLIC_UPLOAD_API || '';
const COLORS = ['#000', '#f00', '#0a0', '#00f', '#f80', '#80f', '#fff'];

export default function Graffiti() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawing, setDrawing] = useState(false);
  const [color, setColor] = useState('#000');
  const [size, setSize] = useState(4);
  const [uploading, setUploading] = useState(false);
  const { user, profile } = useAuth();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, rect.width, rect.height);
  }, []);

  const getPos = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0]?.clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0]?.clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!drawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;
    const { x, y } = getPos(e);
    ctx.strokeStyle = color;
    ctx.lineWidth = size;
    ctx.lineCap = 'round';
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const startDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setDrawing(true);
    const { x, y } = getPos(e);
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
  };

  const endDraw = () => setDrawing(false);

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;
    const rect = canvas.getBoundingClientRect();
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const download = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `塗鴉-${new Date().toISOString().slice(0, 10)}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const uploadToGallery = async () => {
    if (!UPLOAD_API || !user) {
      alert('請設定 NEXT_PUBLIC_UPLOAD_API 並登入後上傳');
      return;
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    setUploading(true);
    try {
      const dataUrl = canvas.toDataURL('image/png');
      const base64 = dataUrl.replace(/^data:image\/\w+;base64,/, '');
      const today = new Date().toISOString().slice(0, 10);
      const res = await fetch(UPLOAD_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: today,
          album: '塗鴉牆',
          title: `塗鴉 ${today}`,
          uploader: profile?.displayName || user.email || '',
          desc: '',
          filename: `graffiti-${Date.now()}.png`,
          image: base64,
        }),
      });
      const json = await res.json().catch(() => ({}));
      const url = json?.url || json?.fileUrl;
      if (!url) throw new Error('未取得上傳 URL');
      await addDoc(collection(db, 'gallery_photos'), {
        url,
        title: `塗鴉 ${today}`,
        album: '塗鴉牆',
        desc: '',
        date: today,
        uploader: profile?.displayName || user.email || '',
      });
      alert('已上傳至相簿！');
    } catch (err) {
      console.error(err);
      alert('上傳失敗，請確認 Apps Script 已部署');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border-t-4 border-purple-500">
      <h2 className="text-xl font-bold text-slate-800 mb-4">
        <i className="fas fa-paint-brush text-purple-500 mr-2"></i> 塗鴉牆
      </h2>
      <div className="flex flex-wrap gap-2 mb-4">
        {COLORS.map((c) => (
          <button
            key={c}
            onClick={() => setColor(c)}
            className={`w-8 h-8 rounded-full border-2 ${
              color === c ? 'border-slate-800' : 'border-slate-300'
            }`}
            style={{ backgroundColor: c }}
          />
        ))}
        <input
          type="range"
          min="1"
          max="20"
          value={size}
          onChange={(e) => setSize(Number(e.target.value))}
          className="w-24 align-middle"
        />
        <span className="text-sm text-slate-500">粗細 {size}</span>
        <button
          onClick={clear}
          className="ml-2 px-3 py-1 bg-slate-200 rounded-lg text-sm font-medium hover:bg-slate-300"
        >
          清除
        </button>
        <button
          onClick={download}
          className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-200"
        >
          下載
        </button>
        {UPLOAD_API && user && (
          <button
            onClick={uploadToGallery}
            disabled={uploading}
            className="px-3 py-1 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50"
          >
            {uploading ? <i className="fas fa-spinner fa-spin mr-1"></i> : null}
            上傳至相簿
          </button>
        )}
      </div>
      <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-100">
        <canvas
          ref={canvasRef}
          className="w-full touch-none cursor-crosshair"
          style={{ height: 400, display: 'block' }}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={endDraw}
        />
      </div>
    </div>
  );
}
