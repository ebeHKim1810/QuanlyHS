import React, { ReactNode } from 'react';
import { BookOpenCheck, Sparkles, Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col justify-between transition-colors">
      {/* Top Navbar */}
      <header className="p-4 sm:p-6 flex items-center justify-between max-w-6xl w-full mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-200 dark:shadow-none">
            <BookOpenCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-slate-900 dark:text-white tracking-tight text-lg font-display">
              Tuition Manager
            </span>
            <span className="hidden sm:inline text-xs text-slate-400 dark:text-slate-500 ml-2 border-l border-slate-300 dark:border-slate-700 pl-2">
              Quản lý Dạy học & Học phí
            </span>
          </div>
        </div>

        {/* Theme Toggle */}
        <div className="flex items-center gap-1 p-1 bg-slate-200/70 dark:bg-slate-800 rounded-xl">
          <button
            onClick={() => setTheme('light')}
            className={`p-1.5 rounded-lg text-xs transition-all ${
              theme === 'light'
                ? 'bg-white dark:bg-slate-700 text-amber-500 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
            title="Giao diện Sáng"
          >
            <Sun className="w-4 h-4" />
          </button>
          <button
            onClick={() => setTheme('dark')}
            className={`p-1.5 rounded-lg text-xs transition-all ${
              theme === 'dark'
                ? 'bg-white dark:bg-slate-700 text-indigo-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
            title="Giao diện Tối"
          >
            <Moon className="w-4 h-4" />
          </button>
          <button
            onClick={() => setTheme('system')}
            className={`p-1.5 rounded-lg text-xs transition-all ${
              theme === 'system'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
            title="Theo hệ thống"
          >
            <Monitor className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none p-6 sm:p-8 space-y-6">
          <div className="text-center space-y-1.5">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight font-display">
              {title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              {subtitle}
            </p>
          </div>

          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 text-center text-xs text-slate-400 dark:text-slate-600">
        Tuition Manager © {new Date().getFullYear()} • Hệ thống quản lý học phí & phiếu thu chuẩn sư phạm
      </footer>
    </div>
  );
};
