import { useAuth } from '../context/AuthContext';

export default function Seating() {
  const { hasRole } = useAuth();

  if (!hasRole('teacher', 'staff')) {
    return (
      <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border-t-4 border-green-500">
        <h2 className="text-xl font-bold text-slate-800 mb-4">
          <i className="fas fa-border-all text-green-500 mr-2"></i> 座位表
        </h2>
        <div className="bg-green-50 p-6 rounded-xl border border-green-100 text-center">
          <i className="fas fa-lock text-2xl text-green-600 mb-3"></i>
          <h3 className="font-bold text-slate-800 mb-3">請登入後查看</h3>
          <p className="text-sm text-slate-500">座位表需具備 teacher 或 staff 權限</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border-t-4 border-green-500">
      <h2 className="text-xl font-bold text-slate-800 mb-4">
        <i className="fas fa-border-all text-green-500 mr-2"></i> 座位表
      </h2>
      <p className="text-slate-500">座位表網格（從 Firestore seating 讀取）</p>
    </div>
  );
}
