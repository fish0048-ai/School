import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const tabs = [
  { path: '/', label: '首頁', icon: 'fa-home' },
  { path: '/bulletin', label: '公告', icon: 'fa-bullhorn' },
  { path: '/schedule', label: '課表', icon: 'fa-table' },
  { path: '/calendar', label: '日程', icon: 'fa-calendar-alt' },
  { path: '/homework', label: '作業', icon: 'fa-clipboard-check' },
  { path: '/honor-roll', label: '榮譽榜', icon: 'fa-trophy' },
  { path: '/seating', label: '座位', icon: 'fa-border-all' },
  { path: '/gallery', label: '相簿', icon: 'fa-images' },
  { path: '/graffiti', label: '塗鴉', icon: 'fa-paint-brush' },
  { path: '/class-fund', label: '班費', icon: 'fa-coins' },
  { path: '/violations', label: '常規', icon: 'fa-user-clock' },
  { path: '/stories', label: '文章', icon: 'fa-book-reader' },
  { path: '/fortune', label: '占卜', icon: 'fa-star' },
  { path: '/polling', label: '投票', icon: 'fa-check-to-slot' },
  { path: '/external-links', label: '連結', icon: 'fa-link' },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { user, signOut } = useAuth();

  return (
    <div className="w-full max-w-7xl mx-auto min-h-screen flex flex-col p-4 sm:p-6 lg:p-8">
      <header className="bg-white shadow-sm rounded-xl p-4 border border-slate-200 mb-4">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
              <span className="text-blue-600">906</span> 親師平台
            </h1>
            <p className="text-slate-500 mt-1 text-xs sm:text-sm">
              親師合作，共創未來 | 114學年度
            </p>
          </div>
          <div className="flex items-center gap-2">
            {user ? (
              <button
                onClick={() => signOut()}
                className="px-3 py-1 rounded-lg text-sm font-medium bg-slate-100 text-slate-600 hover:bg-slate-200"
              >
                登出
              </button>
            ) : (
              <Link
                to="/login"
                className="px-3 py-1 rounded-lg text-sm font-medium bg-blue-500 text-white hover:bg-blue-600"
              >
                登入
              </Link>
            )}
          </div>
        </div>
      </header>

      <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border border-slate-200 rounded-xl p-2 mb-6 overflow-x-auto flex gap-2 -mx-4 px-4 sm:mx-0">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;
          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={`whitespace-nowrap px-4 py-2 rounded-lg font-medium text-sm transition-all flex-shrink-0 ${
                isActive
                  ? 'bg-blue-100 text-blue-600 font-bold'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <i className={`fas ${tab.icon} mr-1`}></i>
              {tab.label}
            </Link>
          );
        })}
      </nav>

      <main className="flex-grow">{children}</main>
    </div>
  );
}
