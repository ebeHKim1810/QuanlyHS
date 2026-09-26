import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AttendanceStatus, Lesson } from '../../types';
import {
  CheckSquare,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Calendar,
  Check,
  X,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { LessonStatusBadge } from '../common/Badge';
import { format, parseISO, isToday, isThisWeek, isThisMonth } from 'date-fns';
import { vi } from 'date-fns/locale';

export const AttendanceView: React.FC = () => {
  const { students, lessons, setLessonAttendance, openLessonModal } = useApp();

  const [dateFilter, setDateFilter] = useState<'ALL' | 'TODAY' | 'WEEK' | 'MONTH'>('ALL');
  const [studentFilter, setStudentFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter lessons
  const filteredLessons = lessons
    .filter((lesson) => {
      // Date filter
      const lessonDateObj = parseISO(lesson.lessonDate);
      if (dateFilter === 'TODAY' && !isToday(lessonDateObj)) return false;
      if (dateFilter === 'WEEK' && !isThisWeek(lessonDateObj, { weekStartsOn: 1 })) return false;
      if (dateFilter === 'MONTH' && !isThisMonth(lessonDateObj)) return false;

      // Student filter
      if (studentFilter !== 'ALL' && lesson.studentId !== studentFilter) return false;

      // Status filter
      if (statusFilter !== 'ALL' && lesson.attendanceStatus !== statusFilter) return false;

      // Search student name
      if (searchQuery.trim()) {
        const student = students.find((s) => s.id === lesson.studentId);
        if (!student?.name.toLowerCase().includes(searchQuery.toLowerCase())) {
          return false;
        }
      }

      return true;
    })
    .sort((a, b) => new Date(b.lessonDate).getTime() - new Date(a.lessonDate).getTime());

  // Statistics
  const attendedCount = filteredLessons.filter((l) => l.attendanceStatus === 'ATTENDED').length;
  const scheduledCount = filteredLessons.filter((l) => l.attendanceStatus === 'SCHEDULED').length;
  const absentCount = filteredLessons.filter((l) => l.attendanceStatus === 'ABSENT').length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      {/* Header and Quick Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Điểm Danh & Ghi Nhận Buổi Học</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Đánh dấu học sinh có học để đưa vào danh sách tính học phí
          </p>
        </div>

        {/* Quick summary stats */}
        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-850 text-xs font-semibold flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Có học: {attendedCount}</span>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-semibold flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span>Chưa điểm danh: {scheduledCount}</span>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-850 text-xs font-semibold flex items-center gap-1.5">
            <XCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
            <span>Vắng: {absentCount}</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-soft space-y-3">
        {/* Date presets */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300">
            <button
              onClick={() => setDateFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                dateFilter === 'ALL'
                  ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow-xs'
                  : 'hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Tất cả thời gian
            </button>
            <button
              onClick={() => setDateFilter('TODAY')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                dateFilter === 'TODAY'
                  ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow-xs'
                  : 'hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Hôm nay
            </button>
            <button
              onClick={() => setDateFilter('WEEK')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                dateFilter === 'WEEK'
                  ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow-xs'
                  : 'hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Tuần này
            </button>
            <button
              onClick={() => setDateFilter('MONTH')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                dateFilter === 'MONTH'
                  ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow-xs'
                  : 'hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Tháng này
            </button>
          </div>

          {/* Search box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên học sinh..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Học sinh:</span>
            <select
              value={studentFilter}
              onChange={(e) => setStudentFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium focus:outline-none"
            >
              <option value="ALL">Tất cả học sinh ({students.length})</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Trạng thái:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium focus:outline-none"
            >
              <option value="ALL">Tất cả trạng thái điểm danh</option>
              <option value="SCHEDULED">Chưa điểm danh</option>
              <option value="ATTENDED">Có học</option>
              <option value="ABSENT">Vắng</option>
              <option value="CANCELLED">Hủy buổi</option>
            </select>
          </div>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-soft overflow-hidden">
        {filteredLessons.length === 0 ? (
          <div className="text-center py-14 text-slate-400 text-sm">
            Không có buổi học nào phù hợp với bộ lọc đã chọn.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/70 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
                  <th className="py-3 pl-4">Học sinh</th>
                  <th className="py-3">Ngày & Giờ</th>
                  <th className="py-3">Số tiết</th>
                  <th className="py-3">Trạng thái hiện tại</th>
                  <th className="py-3">Khả năng tính phí</th>
                  <th className="py-3 text-center pr-4">Thao tác điểm danh nhanh</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredLessons.map((lesson) => {
                  const student = students.find((s) => s.id === lesson.studentId);
                  const isLocked = lesson.billingStatus === 'INVOICED';

                  return (
                    <tr
                      key={lesson.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
                      onClick={() => openLessonModal(lesson)}
                    >
                      {/* Student info */}
                      <td className="py-3.5 pl-4">
                        <div className="font-bold text-slate-900 dark:text-white">{student?.name || 'Học sinh'}</div>
                        <div className="text-xs text-slate-400 mt-0.5">{student?.phone}</div>
                      </td>

                      {/* Date & Time */}
                      <td className="py-3.5">
                        <div className="font-medium text-slate-800 dark:text-slate-200">
                          {format(parseISO(lesson.lessonDate), 'dd/MM/yyyy')}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {lesson.startTime} – {lesson.endTime}
                        </div>
                      </td>

                      {/* Period Count */}
                      <td className="py-3.5 text-xs text-slate-600 dark:text-slate-400 font-medium">
                        {lesson.periodCount} tiết
                      </td>

                      {/* Status Badge */}
                      <td className="py-3.5">
                        <LessonStatusBadge
                          attendanceStatus={lesson.attendanceStatus}
                          billingStatus={lesson.billingStatus}
                        />
                      </td>

                      {/* Eligibility text */}
                      <td className="py-3.5 text-xs">
                        {lesson.attendanceStatus === 'ATTENDED' && lesson.billingStatus === 'UNBILLED' ? (
                          <span className="text-amber-700 dark:text-amber-300 font-semibold bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                            Sẵn sàng tính phí ({lesson.calculatedAmount.toLocaleString('vi-VN')} đ)
                          </span>
                        ) : lesson.billingStatus === 'INVOICED' ? (
                          <span className="text-violet-700 dark:text-violet-300 font-semibold bg-violet-50 dark:bg-violet-950/40 px-2 py-0.5 rounded-full border border-violet-200 dark:border-violet-800">
                            Đã chốt hóa đơn
                          </span>
                        ) : (
                          <span className="text-slate-400">Không tính phí</span>
                        )}
                      </td>

                      {/* Quick Action Buttons */}
                      <td
                        className="py-3.5 pr-4 text-center"
                        onClick={(e) => e.stopPropagation()} // don't open modal when clicking fast buttons
                      >
                        {isLocked ? (
                          <span className="text-xs text-slate-400 font-mono italic">
                            Đã khóa (Xem phiếu)
                          </span>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                            <button
                              onClick={() => setLessonAttendance(lesson.id, 'ATTENDED')}
                              title="Điểm danh: Có học (Tính phí)"
                              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all flex items-center gap-1 ${
                                lesson.attendanceStatus === 'ATTENDED'
                                  ? 'bg-emerald-600 text-white shadow-xs'
                                  : 'text-slate-600 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-white dark:hover:bg-slate-700'
                              }`}
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Có học</span>
                            </button>

                            <button
                              onClick={() => setLessonAttendance(lesson.id, 'ABSENT')}
                              title="Điểm danh: Vắng (Không tính phí)"
                              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all flex items-center gap-1 ${
                                lesson.attendanceStatus === 'ABSENT'
                                  ? 'bg-rose-600 text-white shadow-xs'
                                  : 'text-slate-600 dark:text-slate-300 hover:text-rose-700 dark:hover:text-rose-400 hover:bg-white dark:hover:bg-slate-700'
                              }`}
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>Vắng</span>
                            </button>

                            <button
                              onClick={() => setLessonAttendance(lesson.id, 'SCHEDULED')}
                              title="Đặt lại: Chưa điểm danh"
                              className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-white dark:hover:bg-slate-700 transition-colors"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
