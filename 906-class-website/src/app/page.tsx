'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { collection, getDocs, orderBy, query, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface CountdownEvent {
  rating: number;
  title: string;
  date: unknown;
  end?: unknown;
  subj1?: string;
  subj2?: string;
}

function toDate(v: unknown): Date | null {
  if (!v) return null;
  if (v instanceof Date) return v;
  if (typeof v === 'object' && v !== null && 'toDate' in v)
    return (v as { toDate: () => Date }).toDate();
  return null;
}

interface BulletinItem {
  title: string;
  imp: string;
  cat: string;
  date: string;
  due?: string;
  content: string;
}

export default function Home() {
  const [countdown, setCountdown] = useState<CountdownEvent | null>(null);
  const [bulletins, setBulletins] = useState<BulletinItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [countSnap, bullSnap] = await Promise.all([
          getDocs(
            query(
              collection(db, 'countdown_events'),
              orderBy('date', 'asc'),
              limit(5)
            )
          ),
          getDocs(
            query(
              collection(db, 'announcements'),
              orderBy('date', 'desc'),
              limit(5)
            )
          ),
        ]);

        const now = new Date();
        const events = countSnap.docs
          .map((d) => ({ id: d.id, ...d.data() } as CountdownEvent & { id: string }))
          .filter((e) => {
            const d = toDate(e.date);
            return d && d >= now;
          });
        if (events.length > 0) {
          setCountdown(events[0]);
        }

        setBulletins(
          bullSnap.docs.map((d) => ({ id: d.id, ...d.data() } as BulletinItem & { id: string }))
        );
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <i className="fas fa-circle-notch fa-spin text-4xl text-blue-500"></i>
      </div>
    );
  }

  const primaryDate = toDate(countdown?.date);
  const diffDays = primaryDate
    ? Math.ceil((primaryDate.getTime() - new Date().setHours(0, 0, 0, 0)) / 86400000)
    : null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-4 border-b-4 border-b-amber-400">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
            <i className="fas fa-graduation-cap mr-2"></i>
            {countdown?.title ?? '暫無考試'}
          </p>
          <p className="text-4xl sm:text-5xl font-extrabold text-slate-800">
            {diffDays !== null ? (diffDays > 0 ? diffDays : '0') : '-'}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {primaryDate
              ? `${primaryDate.getMonth() + 1}/${primaryDate.getDate()}`
              : ''}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col justify-center">
          <h2 className="text-xl font-bold text-slate-800">906 親師平台</h2>
          <p className="text-slate-500 text-sm mt-1">親師合作，共創未來</p>
          <Link
            href="/bulletin"
            className="mt-4 inline-flex items-center text-blue-600 font-medium text-sm hover:underline"
          >
            查看全部公告 <i className="fas fa-arrow-right ml-1"></i>
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border-t-4 border-blue-500 p-4 sm:p-6">
        <h2 className="text-xl font-bold text-slate-800 mb-4">
          <i className="fas fa-bullhorn text-blue-500 mr-2"></i> 最新公告
        </h2>
        {bulletins.length === 0 ? (
          <p className="text-slate-500 text-center py-8">尚無公告</p>
        ) : (
          <div className="space-y-3">
            {bulletins.map((b) => (
              <Link
                key={b.title}
                href={`/bulletin#${encodeURIComponent(b.title)}`}
                className="block p-4 rounded-lg bg-slate-50 hover:bg-blue-50 transition"
              >
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-slate-800">{b.title}</h3>
                  <span className="text-xs text-slate-400">{b.date}</span>
                </div>
                <p className="text-sm text-slate-600 mt-1 line-clamp-2">{b.content}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
