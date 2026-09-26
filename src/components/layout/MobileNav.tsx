import React from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { ActiveNavTab } from '../../types';
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  CheckSquare,
  Receipt,
  X,
  History,
  Coins,
  Settings,
  ShieldAlert,
} from 'lucide-react';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ isOpen, onClose }) => {
  const { activeTab, setActiveTab, lessons } = useApp();
  const { isAdmin } = useAuth();

  const unbilledCount = lessons.filter(
    (l) => l.attendanceStatus === 'ATTENDED' && l.billingStatus === 'UNBILLED'
  ).length;

  const fullNavItems: Array<{ id: ActiveNavTab; label: string; icon: any; badge?: number }> = [
    { id: 'dashboard', label: 'Tổng quan', icon: LayoutDashboard },
    { id: 'students', label: 'Học sinh', icon: Users },
    { id: 'schedules', label: 'Lịch học & Lịch dạy', icon: CalendarDays },
    { id: 'attendance', label: 'Điểm danh', icon: CheckSquare },
    { id: 'tuition', label: 'Học phí & Bảng giá', icon: Coins },
    {
      id: 'create_invoice',
      label: 'Phiếu học phí',
      icon: Receipt,
      badge: unbilledCount > 0 ? unbilledCount : undefined,
    },
    { id: 'invoices', label: 'Lịch sử xuất phiếu', icon: History },
    { id: 'settings', label: 'Cài đặt hệ thống', icon: Settings },
  ];

  if (isAdmin) {
    fullNavItems.push({
      id: 'admin_teachers',
      label: 'Quản trị hệ thống',
      icon: ShieldAlert,
    });
  }

  const handleSelect = (tab: ActiveNavTab) => {
    setActiveTab(tab);
    onClose();
  };

  return (
    <>
      {/* Mobile Drawer (Menu side sheet) */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden no-print">
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
          <div className="fixed inset-y-0 left-0 w-72 bg-white dark:bg-slate-900 shadow-2xl z-50 flex flex-col p-4 border-r border-slate-200 dark:border-slate-800 transition-colors">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <span className="font-bold text-slate-900 dark:text-white text-lg font-display">
                Tuition Manager
              </span>
              <button
                onClick={onClose}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 py-4 space-y-1 overflow-y-auto">
              {fullNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 font-bold'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>
                    {item.badge !== undefined && (
                      <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* Bottom Sticky Tab Bar */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800 z-40 px-2 py-1.5 flex items-center justify-around no-print shadow-lg">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center py-1 px-2 rounded-xl text-[10px] font-medium ${
            activeTab === 'dashboard'
              ? 'text-indigo-600 dark:text-indigo-400 font-bold'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <LayoutDashboard className="w-5 h-5 mb-0.5" />
          <span>Tổng quan</span>
        </button>

        <button
          onClick={() => setActiveTab('students')}
          className={`flex flex-col items-center py-1 px-2 rounded-xl text-[10px] font-medium ${
            activeTab === 'students'
              ? 'text-indigo-600 dark:text-indigo-400 font-bold'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <Users className="w-5 h-5 mb-0.5" />
          <span>Học sinh</span>
        </button>

        <button
          onClick={() => setActiveTab('attendance')}
          className={`flex flex-col items-center py-1 px-2 rounded-xl text-[10px] font-medium ${
            activeTab === 'attendance'
              ? 'text-indigo-600 dark:text-indigo-400 font-bold'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <CheckSquare className="w-5 h-5 mb-0.5" />
          <span>Điểm danh</span>
        </button>

        <button
          onClick={() => setActiveTab('create_invoice')}
          className={`flex flex-col items-center py-1 px-2 rounded-xl text-[10px] font-medium relative ${
            activeTab === 'create_invoice'
              ? 'text-indigo-600 dark:text-indigo-400 font-bold'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <div className="relative">
            <Receipt className="w-5 h-5 mb-0.5" />
            {unbilledCount > 0 && (
              <span className="absolute -top-1 -right-2 w-4 h-4 bg-amber-500 text-white rounded-full flex items-center justify-center text-[9px] font-bold">
                {unbilledCount}
              </span>
            )}
          </div>
          <span>Xuất phiếu</span>
        </button>

        <button
          onClick={() => setActiveTab('invoices')}
          className={`flex flex-col items-center py-1 px-2 rounded-xl text-[10px] font-medium ${
            activeTab === 'invoices'
              ? 'text-indigo-600 dark:text-indigo-400 font-bold'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <History className="w-5 h-5 mb-0.5" />
          <span>Lịch sử</span>
        </button>
      </div>
    </>
  );
};
