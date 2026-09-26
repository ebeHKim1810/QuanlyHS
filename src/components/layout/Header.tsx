import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  Receipt,
  Menu,
  Sun,
  Moon,
  Monitor,
  User,
  Settings,
  LogOut,
  ShieldAlert,
  ChevronDown,
  Palette,
  Check,
} from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

export const Header: React.FC<{ onOpenMobileMenu?: () => void }> = ({ onOpenMobileMenu }) => {
  const { activeTab, setActiveTab, lessons, settings } = useApp();
  const { user, isAdmin, logout } = useAuth();
  const { theme, setTheme } = useTheme();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const titleMap: Record<string, { title: string; desc: string }> = {
    dashboard: { title: 'Bảng Điều Khiển', desc: 'Tổng quan lịch học, sĩ số và tài chính lớp học' },
    students: { title: 'Quản Lý Học Sinh', desc: 'Danh sách, thông tin liên lạc và mức thu học phí' },
    schedules: { title: 'Lịch Học & Thời Khóa Biểu', desc: 'Theo dõi lịch học định kỳ và lịch dạy theo ngày' },
    attendance: { title: 'Điểm Danh Buổi Học', desc: 'Đánh dấu có học, vắng hoặc hủy buổi học' },
    tuition: { title: 'Cấu Hình & Bảng Giá Học Phí', desc: 'Quy tắc tính học phí theo buổi hoặc theo tiết' },
    create_invoice: { title: 'Lập & Xuất Phiếu Học Phí', desc: 'Chọn các buổi học đã học để chốt và xuất phiếu' },
    invoices: { title: 'Lịch Sử Xuất Phiếu Học Phí', desc: 'Danh sách phiếu thu đã xuất, tải PDF và đối soát thanh toán' },
    settings: { title: 'Cài Đặt & Hồ Sơ Giáo Viên', desc: 'Thông tin lớp học, tài khoản ngân hàng và sao lưu dữ liệu' },
    profile: { title: 'Hồ Sơ Cá Nhân', desc: 'Thông tin tài khoản và tùy chọn giao diện' },
    admin_teachers: { title: 'Quản Trị Hệ Thống', desc: 'Quản lý tài khoản giáo viên, phân quyền và trạng thái' },
  };

  const currentInfo = titleMap[activeTab] || { title: 'Hệ Thống Quản Lý', desc: '' };

  const unbilledAttendedCount = lessons.filter(
    (l) => l.attendanceStatus === 'ATTENDED' && l.billingStatus === 'UNBILLED'
  ).length;

  const todayDisplay = format(new Date(), "EEEE, 'ngày' dd/MM/yyyy", { locale: vi });

  const displayName = user?.fullName || settings?.teacherName || (isAdmin ? 'Administrator' : 'Giáo viên');
  const userInitial = displayName.charAt(0).toUpperCase();

  return (
    <header className="h-18 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between shrink-0 no-print transition-colors">
      <div className="flex items-center gap-3">
        {onOpenMobileMenu && (
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-tight">
            {currentInfo.title}
          </h1>
          <p className="hidden sm:block text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {currentInfo.desc}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Date Display */}
        <div className="hidden xl:flex items-center text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200/60 dark:border-slate-700 capitalize">
          {todayDisplay}
        </div>

        {/* Quick Invoice Button */}
        <button
          onClick={() => setActiveTab('create_invoice')}
          className="relative inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-2 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-sm shadow-indigo-100 dark:shadow-none transition-all"
        >
          <Receipt className="w-4 h-4" />
          <span className="hidden sm:inline">Xuất phiếu học phí</span>
          <span className="sm:hidden">Xuất phiếu</span>
          {unbilledAttendedCount > 0 && (
            <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-[11px] font-bold rounded-full bg-amber-400 text-slate-900 ml-1">
              {unbilledAttendedCount}
            </span>
          )}
        </button>

        {/* Theme Quick Toggle */}
        <div className="hidden sm:flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200/60 dark:border-slate-700">
          <button
            onClick={() => setTheme('light')}
            className={`p-1.5 rounded-lg text-xs transition-all ${
              theme === 'light'
                ? 'bg-white dark:bg-slate-700 text-amber-500 shadow-2xs'
                : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
            title="Giao diện Sáng"
          >
            <Sun className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setTheme('dark')}
            className={`p-1.5 rounded-lg text-xs transition-all ${
              theme === 'dark'
                ? 'bg-white dark:bg-slate-700 text-indigo-400 shadow-2xs'
                : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
            title="Giao diện Tối"
          >
            <Moon className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setTheme('system')}
            className={`p-1.5 rounded-lg text-xs transition-all ${
              theme === 'system'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
            title="Theo hệ thống"
          >
            <Monitor className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* User Profile Dropdown Menu */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1.5 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              {userInitial}
            </div>
            <div className="hidden md:block text-left min-w-0 max-w-[120px]">
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                {displayName}
              </div>
              <div className="text-[10px] text-slate-400 truncate">
                {isAdmin ? 'Quản trị viên' : 'Giáo viên'}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </button>

          {/* Dropdown Menu */}
          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
              {/* User Header */}
              <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {displayName}
                </p>
                <p className="text-[11px] text-slate-400 font-mono truncate">
                  {user?.email || 'trang.hoang@edu.vn'}
                </p>
                <div className="mt-1.5">
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isAdmin
                        ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300'
                        : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                    }`}
                  >
                    {isAdmin ? 'Quản trị viên hệ thống' : 'Tài khoản Giáo viên'}
                  </span>
                </div>
              </div>

              {/* Navigation Items */}
              <div className="p-1 space-y-0.5">
                {isAdmin && (
                  <button
                    onClick={() => {
                      setActiveTab('admin_teachers');
                      setIsUserMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                      activeTab === 'admin_teachers'
                        ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <ShieldAlert className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <span>Quản trị hệ thống</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    setActiveTab('settings');
                    setIsUserMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                    activeTab === 'settings'
                      ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <User className="w-4 h-4 text-slate-500" />
                  <span>Hồ sơ & Lớp học</span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('settings');
                    setIsUserMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <Settings className="w-4 h-4 text-slate-500" />
                  <span>Cài đặt hệ thống</span>
                </button>
              </div>

              {/* Appearance Submenu */}
              <div className="p-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <Palette className="w-3.5 h-3.5" />
                  <span>Giao diện</span>
                </div>
                <div className="grid grid-cols-3 gap-1 pt-1">
                  <button
                    onClick={() => setTheme('light')}
                    className={`flex items-center justify-center gap-1 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                      theme === 'light'
                        ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 font-bold border border-amber-200'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Sun className="w-3 h-3" />
                    <span>Sáng</span>
                  </button>

                  <button
                    onClick={() => setTheme('dark')}
                    className={`flex items-center justify-center gap-1 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                      theme === 'dark'
                        ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 font-bold border border-indigo-200'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Moon className="w-3 h-3" />
                    <span>Tối</span>
                  </button>

                  <button
                    onClick={() => setTheme('system')}
                    className={`flex items-center justify-center gap-1 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                      theme === 'system'
                        ? 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 font-bold border border-slate-300 dark:border-slate-700'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Monitor className="w-3 h-3" />
                    <span>Hệ thống</span>
                  </button>
                </div>
              </div>

              {/* Logout */}
              <div className="p-1 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Đăng xuất</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
