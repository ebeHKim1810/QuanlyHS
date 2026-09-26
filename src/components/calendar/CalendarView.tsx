import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Lesson, AttendanceStatus, BillingStatus } from '../../types';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  CalendarDays,
  Plus,
  Filter,
  Check,
  X,
  Clock,
  User,
  List,
  Grid,
} from 'lucide-react';
import {
  format,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addWeeks,
  subWeeks,
  addDays,
  subDays,
  parseISO,
} from 'date-fns';
import { vi } from 'date-fns/locale';
import { ScheduleModal } from '../schedules/ScheduleModal';
import { LessonModal } from './LessonModal';
import { LessonStatusBadge } from '../common/Badge';

type CalendarViewMode = 'month' | 'week' | 'day' | 'agenda';

export const CalendarView: React.FC = () => {
  const { students, lessons, setLessonAttendance } = useApp();

  const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 8, 10)); // Default near demo data
  const [viewMode, setViewMode] = useState<CalendarViewMode>('month');

  // Filters
  const [selectedStudentFilter, setSelectedStudentFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modals
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [selectedDateForNewLesson, setSelectedDateForNewLesson] = useState<string>('');
  const [selectedLessonForDetail, setSelectedLessonForDetail] = useState<Lesson | null>(null);

  // Filter lessons
  const filteredLessons = lessons.filter((lesson) => {
    if (selectedStudentFilter !== 'ALL' && lesson.studentId !== selectedStudentFilter) {
      return false;
    }

    if (statusFilter === 'ATTENDED_UNBILLED') {
      return lesson.attendanceStatus === 'ATTENDED' && lesson.billingStatus === 'UNBILLED';
    }
    if (statusFilter === 'ATTENDED_INVOICED') {
      return lesson.attendanceStatus === 'ATTENDED' && lesson.billingStatus === 'INVOICED';
    }
    if (statusFilter === 'ABSENT') {
      return lesson.attendanceStatus === 'ABSENT';
    }
    if (statusFilter === 'SCHEDULED') {
      return lesson.attendanceStatus === 'SCHEDULED';
    }

    return true;
  });

  // Navigation handlers
  const handlePrev = () => {
    if (viewMode === 'month') setCurrentDate((d) => subMonths(d, 1));
    else if (viewMode === 'week') setCurrentDate((d) => subWeeks(d, 1));
    else if (viewMode === 'day') setCurrentDate((d) => subDays(d, 1));
    else setCurrentDate((d) => subMonths(d, 1));
  };

  const handleNext = () => {
    if (viewMode === 'month') setCurrentDate((d) => addMonths(d, 1));
    else if (viewMode === 'week') setCurrentDate((d) => addWeeks(d, 1));
    else if (viewMode === 'day') setCurrentDate((d) => addDays(d, 1));
    else setCurrentDate((d) => addMonths(d, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Get date intervals for month view
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const monthDays = eachDayOfInterval({ start: startDate, end: endDate });

  // Get date intervals for week view
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  // Status style helper
  const getLessonStyle = (lesson: Lesson) => {
    if (lesson.attendanceStatus === 'ATTENDED') {
      if (lesson.billingStatus === 'INVOICED') {
        return {
          bg: 'bg-violet-50 dark:bg-violet-950/40 text-violet-800 dark:text-violet-200 border-violet-200 dark:border-violet-800 hover:bg-violet-100 dark:hover:bg-violet-900/50',
          dot: 'bg-violet-600',
          label: 'Đã xuất phiếu',
        };
      } else {
        return {
          bg: 'bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/50 font-semibold',
          dot: 'bg-amber-500',
          label: 'Chưa tính phí',
        };
      }
    }
    if (lesson.attendanceStatus === 'ABSENT') {
      return {
        bg: 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 border-rose-200 dark:border-rose-850 hover:bg-rose-100 dark:hover:bg-rose-900/50',
        dot: 'bg-rose-500',
        label: 'Vắng học',
      };
    }
    if (lesson.attendanceStatus === 'CANCELLED') {
      return {
        bg: 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-750',
        dot: 'bg-slate-400',
        label: 'Đã hủy',
      };
    }
    return {
      bg: 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-750',
      dot: 'bg-slate-400',
      label: 'Chưa học',
    };
  };

  const dayHeaders = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ Nhật'];

  return (
    <div className="space-y-5">
      {/* Top Controls Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Navigation & Title */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
            <button
              onClick={handlePrev}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-700 transition-colors"
              title="Kỳ trước"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleToday}
              className="px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white rounded-md hover:bg-white dark:hover:bg-slate-700 transition-colors"
            >
              Hôm nay
            </button>
            <button
              onClick={handleNext}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-700 transition-colors"
              title="Kỳ tiếp"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white capitalize">
            {viewMode === 'month' && format(currentDate, "'Tháng' MM, yyyy", { locale: vi })}
            {viewMode === 'week' &&
              `Tuần ${format(weekStart, 'dd/MM')} – ${format(weekEnd, 'dd/MM/yyyy')}`}
            {viewMode === 'day' && format(currentDate, "EEEE, 'ngày' dd/MM/yyyy", { locale: vi })}
            {viewMode === 'agenda' && 'Danh sách buổi học theo thời gian'}
          </h3>
        </div>

        {/* View Mode Switcher & Add Button */}
        <div className="flex flex-wrap items-center gap-2">
          {/* View Mode Buttons */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-1 text-xs font-medium text-slate-600 dark:text-slate-300">
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                viewMode === 'month'
                  ? 'bg-white dark:bg-slate-700 font-bold text-indigo-700 dark:text-indigo-300 shadow-xs'
                  : 'hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Tháng
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                viewMode === 'week'
                  ? 'bg-white dark:bg-slate-700 font-bold text-indigo-700 dark:text-indigo-300 shadow-xs'
                  : 'hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Tuần
            </button>
            <button
              onClick={() => setViewMode('day')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                viewMode === 'day'
                  ? 'bg-white dark:bg-slate-700 font-bold text-indigo-700 dark:text-indigo-300 shadow-xs'
                  : 'hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Ngày
            </button>
            <button
              onClick={() => setViewMode('agenda')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                viewMode === 'agenda'
                  ? 'bg-white dark:bg-slate-700 font-bold text-indigo-700 dark:text-indigo-300 shadow-xs'
                  : 'hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Danh sách
            </button>
          </div>

          {/* Add Lesson Button */}
          <button
            onClick={() => {
              setSelectedDateForNewLesson(format(currentDate, 'yyyy-MM-dd'));
              setIsScheduleModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo lịch học</span>
          </button>
        </div>
      </div>

      {/* Filter and Color Legend Strip */}
      <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-soft flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 font-medium">
            <Filter className="w-3.5 h-3.5" />
            <span>Lọc:</span>
          </div>

          {/* Student Filter */}
          <select
            value={selectedStudentFilter}
            onChange={(e) => setSelectedStudentFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium focus:outline-none"
          >
            <option value="ALL">Tất cả học sinh</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium focus:outline-none"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="ATTENDED_UNBILLED">Có học • Chưa tính phí (Orange)</option>
            <option value="ATTENDED_INVOICED">Có học • Đã xuất phiếu (Purple)</option>
            <option value="SCHEDULED">Chưa điểm danh (Gray)</option>
            <option value="ABSENT">Vắng học (Red)</option>
          </select>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-600 dark:text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
            Chưa học
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            Có học • Chưa tính phí
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-violet-600"></span>
            Có học • Đã xuất phiếu
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
            Vắng
          </span>
        </div>
      </div>

      {/* VIEW 1: MONTH VIEW */}
      {viewMode === 'month' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-soft overflow-hidden">
          {/* Day of Week Headers */}
          <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/70 text-center text-xs font-semibold text-slate-600 dark:text-slate-300 py-2.5">
            {dayHeaders.map((header) => (
              <div key={header}>{header}</div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-100 dark:divide-slate-800 min-h-[560px]">
            {monthDays.map((day) => {
              const dayStr = format(day, 'yyyy-MM-dd');
              const isToday = isSameDay(day, new Date());
              const isCurrentMonth = isSameMonth(day, monthStart);
              const dayLessons = filteredLessons.filter((l) => l.lessonDate === dayStr);

              return (
                <div
                  key={dayStr}
                  className={`min-h-[105px] p-2 flex flex-col justify-between transition-colors ${
                    !isCurrentMonth
                      ? 'bg-slate-50/40 dark:bg-slate-950/40 text-slate-300 dark:text-slate-600'
                      : 'bg-white dark:bg-slate-900 hover:bg-slate-50/50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  {/* Date Header */}
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-xs font-semibold rounded-full w-6 h-6 flex items-center justify-center ${
                        isToday
                          ? 'bg-indigo-600 text-white'
                          : isCurrentMonth
                          ? 'text-slate-800 dark:text-slate-200'
                          : 'text-slate-400 dark:text-slate-600'
                      }`}
                    >
                      {format(day, 'd')}
                    </span>

                    <button
                      onClick={() => {
                        setSelectedDateForNewLesson(dayStr);
                        setIsScheduleModalOpen(true);
                      }}
                      className="opacity-0 hover:opacity-100 focus:opacity-100 p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded"
                      title="Thêm buổi học"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Lessons list for this day */}
                  <div className="space-y-1 flex-1 overflow-y-auto max-h-[110px]">
                    {dayLessons.map((lesson) => {
                      const student = students.find((s) => s.id === lesson.studentId);
                      const style = getLessonStyle(lesson);

                      return (
                        <div
                          key={lesson.id}
                          onClick={() => setSelectedLessonForDetail(lesson)}
                          className={`p-1.5 rounded-lg border text-[11px] leading-tight cursor-pointer transition-all ${style.bg}`}
                        >
                          <div className="flex items-center gap-1 font-semibold truncate">
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${style.dot}`} />
                            <span className="truncate">{student?.name || 'Học sinh'}</span>
                          </div>
                          <div className="text-[10px] opacity-80 mt-0.5 flex items-center justify-between">
                            <span>{lesson.startTime}</span>
                            <span>{lesson.periodCount} tiết</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 2: WEEK VIEW */}
      {viewMode === 'week' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-soft overflow-hidden">
          <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/70 text-center py-2.5">
            {weekDays.map((day, idx) => {
              const isToday = isSameDay(day, new Date());
              return (
                <div key={idx} className="text-xs">
                  <div className="font-semibold text-slate-500 dark:text-slate-400">{dayHeaders[idx]}</div>
                  <div
                    className={`mt-1 font-bold inline-block px-2 py-0.5 rounded-full ${
                      isToday ? 'bg-indigo-600 text-white' : 'text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    {format(day, 'dd/MM')}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-7 divide-x divide-slate-100 dark:divide-slate-800 min-h-[500px]">
            {weekDays.map((day) => {
              const dayStr = format(day, 'yyyy-MM-dd');
              const dayLessons = filteredLessons.filter((l) => l.lessonDate === dayStr);

              return (
                <div key={dayStr} className="p-2 space-y-2">
                  {dayLessons.map((lesson) => {
                    const student = students.find((s) => s.id === lesson.studentId);
                    const style = getLessonStyle(lesson);

                    return (
                      <div
                        key={lesson.id}
                        onClick={() => setSelectedLessonForDetail(lesson)}
                        className={`p-2.5 rounded-xl border text-xs cursor-pointer shadow-xs ${style.bg}`}
                      >
                        <div className="font-bold truncate">{student?.name}</div>
                        <div className="text-[11px] mt-1 opacity-90">
                          {lesson.startTime} – {lesson.endTime}
                        </div>
                        <div className="mt-2 pt-1 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-[10px]">
                          <span>{lesson.periodCount} tiết</span>
                          <span className="font-medium">{style.label}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 3: DAY VIEW */}
      {viewMode === 'day' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-soft">
          <div className="max-w-2xl mx-auto space-y-3">
            {(() => {
              const dayStr = format(currentDate, 'yyyy-MM-dd');
              const dayLessons = filteredLessons.filter((l) => l.lessonDate === dayStr);

              if (dayLessons.length === 0) {
                return (
                  <div className="text-center py-12 text-slate-400 text-sm">
                    Không có buổi học nào vào ngày này.
                  </div>
                );
              }

              return dayLessons.map((lesson) => {
                const student = students.find((s) => s.id === lesson.studentId);
                return (
                  <div
                    key={lesson.id}
                    onClick={() => setSelectedLessonForDetail(lesson)}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-600 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 flex items-center justify-between cursor-pointer transition-all shadow-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold">
                        {student?.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white text-sm">{student?.name}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {lesson.startTime} – {lesson.endTime} ({lesson.periodCount} tiết)
                        </div>
                      </div>
                    </div>
                    <LessonStatusBadge
                      attendanceStatus={lesson.attendanceStatus}
                      billingStatus={lesson.billingStatus}
                    />
                  </div>
                );
              });
            })()}
          </div>
        </div>
      )}

      {/* VIEW 4: AGENDA / LIST VIEW */}
      {viewMode === 'agenda' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-soft">
          <div className="space-y-3">
            {filteredLessons.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-sm">
                Không tìm thấy buổi học nào phù hợp với bộ lọc.
              </div>
            ) : (
              filteredLessons
                .sort((a, b) => new Date(a.lessonDate).getTime() - new Date(b.lessonDate).getTime())
                .map((lesson) => {
                  const student = students.find((s) => s.id === lesson.studentId);
                  return (
                    <div
                      key={lesson.id}
                      onClick={() => setSelectedLessonForDetail(lesson)}
                      className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-600 bg-white dark:bg-slate-850 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer transition-all hover:shadow-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex flex-col items-center justify-center text-xs text-slate-600 dark:text-slate-300 shrink-0">
                          <span className="font-bold text-slate-900 dark:text-white">
                            {format(parseISO(lesson.lessonDate), 'dd')}
                          </span>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400">
                            {format(parseISO(lesson.lessonDate), 'MM/yyyy')}
                          </span>
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white text-sm">{student?.name}</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            {lesson.startTime} – {lesson.endTime} • {lesson.periodCount} tiết
                            {lesson.notes ? ` • ${lesson.notes}` : ''}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 justify-between sm:justify-end">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          {lesson.attendanceStatus === 'ATTENDED'
                            ? `${lesson.calculatedAmount.toLocaleString('vi-VN')} đ`
                            : '0 đ'}
                        </span>
                        <LessonStatusBadge
                          attendanceStatus={lesson.attendanceStatus}
                          billingStatus={lesson.billingStatus}
                        />
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      <ScheduleModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        preselectedDate={selectedDateForNewLesson}
      />

      <LessonModal
        isOpen={Boolean(selectedLessonForDetail)}
        onClose={() => setSelectedLessonForDetail(null)}
        lesson={selectedLessonForDetail}
      />
    </div>
  );
};
