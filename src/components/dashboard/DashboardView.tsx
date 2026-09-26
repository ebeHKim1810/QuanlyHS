import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Users,
  CalendarDays,
  Clock,
  Coins,
  Receipt,
  CheckCircle2,
  AlertCircle,
  Plus,
  ArrowRight,
  Sparkles,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { StatCard } from '../common/StatCard';
import { LessonStatusBadge, TuitionModeBadge } from '../common/Badge';
import { format, parseISO, isThisWeek, isThisMonth } from 'date-fns';
import { vi } from 'date-fns/locale';

export const DashboardView: React.FC = () => {
  const {
    students,
    lessons,
    invoices,
    setActiveTab,
    openStudentDetail,
    openLessonModal,
    openInvoicePreview,
  } = useApp();

  // 1. Tổng số học sinh
  const totalStudents = students.length;

  // 2. Số buổi học trong tuần này
  const lessonsThisWeek = lessons.filter((l) => isThisWeek(parseISO(l.lessonDate), { weekStartsOn: 1 })).length;

  // 3. Số buổi đã học nhưng chưa tính học phí
  const unbilledAttendedLessons = lessons.filter(
    (l) => l.attendanceStatus === 'ATTENDED' && l.billingStatus === 'UNBILLED'
  );
  const unbilledAttendedCount = unbilledAttendedLessons.length;

  // 4. Tổng học phí chưa xuất phiếu
  const totalUnbilledAmount = unbilledAttendedLessons.reduce(
    (sum, l) => sum + (l.calculatedAmount || 0),
    0
  );

  // 5. Tổng học phí đã xuất trong tháng
  const invoicesThisMonth = invoices.filter((inv) => isThisMonth(parseISO(inv.issuedAt)));
  const totalBilledThisMonth = invoicesThisMonth.reduce((sum, inv) => sum + inv.totalAmount, 0);

  // 6. Số phiếu đã xuất
  const totalInvoicesCount = invoices.length;

  // 7. Lịch học sắp tới (từ hôm nay trở đi)
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const upcomingLessons = lessons
    .filter((l) => l.lessonDate >= todayStr)
    .sort((a, b) => a.lessonDate.localeCompare(b.lessonDate) || a.startTime.localeCompare(b.startTime))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-violet-900 text-white p-6 sm:p-8 shadow-xl shadow-indigo-950/10">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-indigo-200 border border-white/10">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Hệ thống Quản lý Học sinh & Tính Học phí Thông minh</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-display leading-tight">
            Quản Lý Lớp Học Thảnh Thơi, <br className="hidden sm:inline" />
            Xuất Phiếu Thu Minh Bạch
          </h2>

          <p className="text-xs sm:text-sm text-indigo-100/90 leading-relaxed max-w-xl">
            Tự động theo dõi điểm danh, khóa vĩnh viễn các buổi học đã tính phí để chống tính trùng,
            và xuất phiếu thu pastel nhã nhặn hoặc ảnh điện thoại cho phụ huynh trong chớp mắt.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => setActiveTab('create_invoice')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-indigo-900 text-xs sm:text-sm font-bold shadow-md hover:bg-indigo-50 active:bg-indigo-100 transition-all"
            >
              <Receipt className="w-4 h-4 text-indigo-600" />
              <span>Lập phiếu học phí ngay</span>
              {unbilledAttendedCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-[11px] font-black flex items-center justify-center">
                  {unbilledAttendedCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('students')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-700/60 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold border border-indigo-500/30 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm học sinh mới</span>
            </button>
          </div>
        </div>

        {/* Decorative background circle */}
        <div className="absolute -bottom-16 -right-16 w-80 h-80 rounded-full bg-violet-600/30 blur-3xl pointer-events-none" />
      </div>

      {/* 6 Key Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
        <StatCard
          title="Tổng học sinh"
          value={totalStudents}
          subtitle="Đang theo học"
          icon={Users}
          variant="indigo"
          onClick={() => setActiveTab('students')}
        />

        <StatCard
          title="Buổi học tuần này"
          value={lessonsThisWeek}
          subtitle="Thời khóa biểu"
          icon={CalendarDays}
          variant="blue"
          onClick={() => setActiveTab('schedules')}
        />

        <StatCard
          title="Chưa tính học phí"
          value={`${unbilledAttendedCount} buổi`}
          subtitle="Đã học • Chờ chốt"
          icon={Clock}
          variant="amber"
          onClick={() => setActiveTab('create_invoice')}
        />

        <StatCard
          title="Tổng tiền chưa xuất"
          value={`${totalUnbilledAmount.toLocaleString('vi-VN')} đ`}
          subtitle="Cần xuất phiếu"
          icon={Coins}
          variant="rose"
          onClick={() => setActiveTab('create_invoice')}
        />

        <StatCard
          title="Đã xuất trong tháng"
          value={`${totalBilledThisMonth.toLocaleString('vi-VN')} đ`}
          subtitle={`Từ ${invoicesThisMonth.length} phiếu`}
          icon={TrendingUp}
          variant="emerald"
          onClick={() => setActiveTab('invoices')}
        />

        <StatCard
          title="Tổng phiếu đã xuất"
          value={totalInvoicesCount}
          subtitle="Trong lịch sử"
          icon={Receipt}
          variant="violet"
          onClick={() => setActiveTab('invoices')}
        />
      </div>

      {/* Main 2 Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Buổi Chưa Tính Học Phí (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-soft space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Buổi Chưa Tính Học Phí</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {unbilledAttendedCount} buổi đã điểm danh có học nhưng chưa đưa vào phiếu thu
                </p>
              </div>
            </div>

            {unbilledAttendedCount > 0 && (
              <button
                onClick={() => setActiveTab('create_invoice')}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 flex items-center gap-1"
              >
                <span>Xuất phiếu ngay</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>

          {unbilledAttendedLessons.length === 0 ? (
            <div className="text-center py-12 text-slate-400 dark:text-slate-500 text-xs">
              Tuyệt vời! Hiện tại không có buổi học nào chưa tính học phí.
            </div>
          ) : (
            <div className="space-y-2.5">
              {unbilledAttendedLessons.map((lesson) => {
                const student = students.find((s) => s.id === lesson.studentId);
                return (
                  <div
                    key={lesson.id}
                    onClick={() => student && openStudentDetail(student.id)}
                    className="p-3.5 rounded-2xl border border-amber-200/70 dark:border-amber-900/40 bg-amber-50/40 dark:bg-amber-950/20 hover:bg-amber-50/80 dark:hover:bg-amber-950/40 transition-all flex items-center justify-between cursor-pointer shadow-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 font-bold flex items-center justify-center text-sm">
                        {student?.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white text-sm hover:text-indigo-600 dark:hover:text-indigo-400">
                          {student?.name}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {format(parseISO(lesson.lessonDate), 'dd/MM/yyyy')} – {lesson.startTime}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-bold font-mono text-slate-900 dark:text-white">
                        {lesson.calculatedAmount.toLocaleString('vi-VN')} đ
                      </div>
                      <span className="inline-block mt-0.5 text-[11px] font-semibold text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-950 px-2 py-0.5 rounded-full">
                        Chưa xuất phiếu
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Lịch Học Sắp Tới (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-soft space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                <CalendarDays className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Lịch Học Gần Đây & Sắp Tới</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Các buổi học cần chú ý</p>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('schedules')}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800"
            >
              Xem lịch
            </button>
          </div>

          <div className="space-y-2.5">
            {upcomingLessons.map((lesson) => {
              const student = students.find((s) => s.id === lesson.studentId);
              return (
                <div
                  key={lesson.id}
                  onClick={() => openLessonModal(lesson)}
                  className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 transition-all flex items-center justify-between cursor-pointer"
                >
                  <div>
                    <div className="font-bold text-xs text-slate-900 dark:text-white">{student?.name}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {format(parseISO(lesson.lessonDate), 'dd/MM/yyyy')} • {lesson.startTime}–{lesson.endTime}
                    </div>
                  </div>

                  <LessonStatusBadge
                    attendanceStatus={lesson.attendanceStatus}
                    billingStatus={lesson.billingStatus}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
