import { useState } from 'react';

const FORTUNES = [
  { t: '上上籤', i: '🌟', d: '大吉！考試順利！' },
  { t: '中吉', i: '🌤️', d: '努力會有回報。' },
  { t: '小吉', i: '🌱', d: '平穩的一天。' },
  { t: '貴人運', i: '🤝', d: '多問問題有收穫。' },
  { t: '大吉', i: '🌈', d: '靈感爆發！' },
  { t: '學習運', i: '📚', d: '今天背書特別快。' },
  { t: '幸運籤', i: '🍀', d: '幸運女神在對你微笑。' },
  { t: '自信籤', i: '✨', d: '相信自己，你很棒。' },
];

export default function Fortune() {
  const [result, setResult] = useState<typeof FORTUNES[0] | null>(null);
  const [loading, setLoading] = useState(false);

  const draw = () => {
    setLoading(true);
    setTimeout(() => {
      setResult(FORTUNES[Math.floor(Math.random() * FORTUNES.length)]);
      setLoading(false);
    }, 600);
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border-t-4 border-violet-500 text-center min-h-[300px] flex flex-col justify-center items-center">
      <i className="fas fa-star text-5xl text-violet-300 mb-4"></i>
      <h2 className="text-2xl font-bold text-violet-800 mb-2">每日勵志</h2>
      <p className="text-slate-500 mb-6 text-sm">給孩子的一句鼓勵。</p>
      <button
        onClick={draw}
        disabled={loading}
        className="bg-violet-600 text-white font-bold py-2 px-8 rounded-full shadow-lg hover:bg-violet-700 disabled:opacity-50"
      >
        {loading ? <i className="fas fa-spinner fa-spin mr-2"></i> : null}
        抽取今日小語
      </button>
      {result && (
        <div className="mt-6 p-6 bg-violet-50 rounded-xl border border-violet-100 w-full max-w-md">
          <div className="text-5xl mb-4">{result.i}</div>
          <h3 className="text-2xl font-bold text-violet-800 mb-2">{result.t}</h3>
          <p className="text-slate-600 text-lg">{result.d}</p>
        </div>
      )}
    </div>
  );
}
