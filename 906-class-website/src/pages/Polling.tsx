export default function Polling() {
  return (
    <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border-t-4 border-pink-500">
      <h2 className="text-xl font-bold text-slate-800 mb-4">
        <i className="fas fa-check-to-slot text-pink-500 mr-2"></i> 投票區
      </h2>
      <p className="text-slate-500">可嵌入 Google Form 連結（polls 集合或保留表單 URL）</p>
    </div>
  );
}
