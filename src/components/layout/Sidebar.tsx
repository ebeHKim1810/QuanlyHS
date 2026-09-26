import React from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { ActiveNavTab } from '../../types';
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  CheckSquare,
  Coins,
  Receipt,
  History,
  Settings,
  ShieldAlert,
  BookOpenCheck,
} from 'lucide-react';

interface NavItem {
  id: ActiveNavTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, lessons, settings } = useApp();
  const { user, isAdmin } = useAuth();

  // Count unbilled attended lessons eligible for invoicing
  const unbilledCount = lessons.filter(
    (l) => l.attendanceStatus === 'ATTENDED' && l.billingStatus === 'UNBILLED'
  ).length;

  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Tổng quan', icon: LayoutDashboard },
    { id: 'students', label: 'Học sinh', icon: Users },
    { id: 'schedules', label: 'Lịch học', icon: CalendarDays },
    { id: 'attendance', label: 'Điểm danh', icon: CheckSquare },
    { id: 'tuition', label: 'Học phí', icon: Coins },
    {
      id: 'create_invoice',
      label: 'Phiếu học phí',
      icon: Receipt,
      badge: unbilledCount > 0 ? unbilledCount : undefined,
    },
    { id: 'invoices', label: 'Lịch sử xuất phiếu', icon: History },
    { id: 'settings', label: 'Cài đặt & Hồ sơ', icon: Settings },
  ];

  if (isAdmin) {
    navItems.push({
      id: 'admin_teachers',
      label: 'Quản trị hệ thống',
      icon: ShieldAlert,
    });
  }

  const teacherName = user?.fullName || settings?.teacherName || (isAdmin ? 'Administrator' : 'Giáo viên');
  const initial = teacherName.charAt(0).toUpperCase();

  return (
    <aside className="hidden lg:flex lg:flex-col w-64 bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 shrink-0 select-none no-print transition-colors">
      {/* Brand Logo & Name */}
      <div className="h-18 flex items-center gap-3 px-6 border-b border-slate-100 dark:border-slate-800">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-100 dark:shadow-none">
          <BookOpenCheck className="w-5 h-5" />
        </div>
        <div>
          <span className="font-bold text-slate-900 dark:text-white tracking-tight text-base font-display">
            Tuition Manager
          </span>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium leading-none mt-0.5">
            Quản lý Dạy học & Học phí
          </p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Menu Chính
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-indigo-50/80 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-semibold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4.5 h-4.5 transition-colors ${
                    isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 group-hover:text-slate-600'
                  }`}
                />
                <span>{item.label}</span>
              </div>

              {item.badge !== undefined && (
                <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-semibold rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 animate-pulse">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Teacher Profile / Bottom Info */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 m-3 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300 flex items-center justify-center font-bold text-sm shrink-0">
            {initial}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
              {teacherName}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
              {isAdmin ? 'Quản trị viên' : settings.centerName || 'Lớp học tư nhân'}
            </div>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-700 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
            Đang hoạt động
          </span>
          <span className="font-mono text-[10px] text-slate-400">v2.1</span>
        </div>
      </div>
    </aside>
  );
};
