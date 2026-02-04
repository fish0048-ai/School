import { useAuth } from '../context/AuthContext';

export default function Violations() {
  const { hasRole } = useAuth();

  if (!hasRole('teacher', 'staff')) {
    return (
      <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border-t-4 border-yellow-500">
        <h2 className="text-xl font-bold text-slate-800 mb-4">
          <i className="fas fa-user-shield text-yellow-500 mr-2"></i> 常規紀錄
        </h2>
        <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-100 text-center">
          <i className="fas fa-lock text-2xl text-yellow-600 mb-3"></i>
          <h3 className="font-bold text-slate-800 mb-3">請登入後查看</h3>
          <p className="text-sm text-slate-500">常規紀錄需具備 teacher 或 staff 權限</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border-t-4 border-yellow-500">
      <h2 className="text-xl font-bold text-slate-800 mb-4">
        <i className="fas fa-user-shield text-yellow-500 mr-2"></i> 常規紀錄
      </h2>
      <p className="text-slate-500">常規列表（從 Firestore violations 讀取）</p>
    </div>
  );
}
