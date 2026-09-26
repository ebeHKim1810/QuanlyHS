import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../common/Modal';
import { Calendar, Clock, BookOpen, User, RefreshCw, CalendarDays } from 'lucide-react';

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedStudentId?: string;
  preselectedDate?: string;
}

export const ScheduleModal: React.FC<ScheduleModalProps> = ({
  isOpen,
  onClose,
  preselectedStudentId,
  preselectedDate,
}) => {
  const { students, createOrUpdateLesson, createRecurringSchedule } = useApp();

  const [scheduleType, setScheduleType] = useState<'ONE_TIME' | 'RECURRING'>('ONE_TIME');
  const [studentId, setStudentId] = useState<string>('');
  const [lessonDate, setLessonDate] = useState<string>('');
  const [dayOfWeek, setDayOfWeek] = useState<number>(1); // 1 = Monday
  const [startTime, setStartTime] = useState<string>('18:00');
  const [endTime, setEndTime] = useState<string>('19:30');
  const [periodCount, setPeriodCount] = useState<number>(2);
  const [durationMinutes, setDurationMinutes] = useState<number>(90);
  const [weeksAhead, setWeeksAhead] = useState<number>(4);
  const [notes, setNotes] = useState<string>('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (preselectedStudentId) {
      setStudentId(preselectedStudentId);
    } else if (students.length > 0 && !studentId) {
      setStudentId(students[0].id);
    }

    if (preselectedDate) {
      setLessonDate(preselectedDate);
      const parsed = new Date(preselectedDate);
      if (!isNaN(parsed.getTime())) {
        setDayOfWeek(parsed.getDay());
      }
    } else {
      setLessonDate(new Date().toISOString().split('T')[0]);
    }
  }, [isOpen, preselectedStudentId, preselectedDate, students]);

  // When student changes, inherit their default period count
  useEffect(() => {
    const std = students.find((s) => s.id === studentId);
    if (std) {
      setPeriodCount(std.periodsPerLesson || 2);
    }
  }, [studentId, students]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!studentId) errs.studentId = 'Vui lòng chọn học sinh';
    if (scheduleType === 'ONE_TIME' && !lessonDate) {
      errs.lessonDate = 'Vui lòng chọn ngày học';
    }
    if (!startTime) errs.startTime = 'Vui lòng chọn giờ bắt đầu';
    if (!endTime) errs.endTime = 'Vui lòng chọn giờ kết thúc';
    if (startTime >= endTime) errs.endTime = 'Giờ kết thúc phải sau giờ bắt đầu';
    if (periodCount < 1) errs.periodCount = 'Số tiết phải ít nhất là 1';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setIsSubmitting(true);

      if (scheduleType === 'ONE_TIME') {
        // Create a single lesson
        await createOrUpdateLesson({
          studentId,
          lessonDate,
          startTime,
          endTime,
          durationMinutes,
          periodCount,
          attendanceStatus: 'SCHEDULED',
          notes,
        });
      } else {
        // Create recurring weekly schedule + auto-generate future lessons
        await createRecurringSchedule(
          {
            studentId,
            dayOfWeek,
            startTime,
            endTime,
            durationMinutes,
            periodCount,
            notes,
            isActive: true,
          },
          weeksAhead
        );
      }

      onClose();
    } catch (err: any) {
      alert(err.message || 'Lỗi khi tạo lịch học');
    } finally {
      setIsSubmitting(false);
    }
  };

  const dayOptions = [
    { value: 1, label: 'Thứ Hai' },
    { value: 2, label: 'Thứ Ba' },
    { value: 3, label: 'Thứ Tư' },
    { value: 4, label: 'Thứ Năm' },
    { value: 5, label: 'Thứ Sáu' },
    { value: 6, label: 'Thứ Bảy' },
    { value: 0, label: 'Chủ Nhật' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={scheduleType === 'ONE_TIME' ? 'Thêm Buổi Học Đơn Lẻ' : 'Tạo Lịch Học Định Kỳ Hàng Tuần'}
      subtitle="Xếp lịch học cho học sinh, đồng bộ tự động vào thời khóa biểu"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Toggle Schedule Type */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
          <button
            type="button"
            onClick={() => setScheduleType('ONE_TIME')}
            className={`py-2 text-xs font-semibold rounded-lg transition-all ${
              scheduleType === 'ONE_TIME'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Buổi học một lần
          </button>
          <button
            type="button"
            onClick={() => setScheduleType('RECURRING')}
            className={`py-2 text-xs font-semibold rounded-lg transition-all ${
              scheduleType === 'RECURRING'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Lịch định kỳ hàng tuần
          </button>
        </div>

        {/* Student Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Chọn học sinh <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <select
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className={`w-full pl-9 pr-3 py-2 text-sm rounded-xl border bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all ${
                errors.studentId ? 'border-rose-300' : 'border-slate-200'
              }`}
            >
              <option value="">-- Chọn học sinh --</option>
              {students.map((std) => (
                <option key={std.id} value={std.id}>
                  {std.name} ({std.tuitionMode === 'PER_SESSION' ? 'Theo buổi' : 'Theo tiết'})
                </option>
              ))}
            </select>
          </div>
          {errors.studentId && <p className="text-xs text-rose-500 mt-1">{errors.studentId}</p>}
        </div>

        {/* Date or Day of Week */}
        {scheduleType === 'ONE_TIME' ? (
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Ngày học <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="date"
                value={lessonDate}
                onChange={(e) => setLessonDate(e.target.value)}
                className={`w-full pl-9 pr-3 py-2 text-sm rounded-xl border bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all ${
                  errors.lessonDate ? 'border-rose-300' : 'border-slate-200'
                }`}
              />
            </div>
            {errors.lessonDate && <p className="text-xs text-rose-500 mt-1">{errors.lessonDate}</p>}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Lặp lại vào thứ <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <CalendarDays className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <select
                  value={dayOfWeek}
                  onChange={(e) => setDayOfWeek(Number(e.target.value))}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  {dayOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label} hàng tuần
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tự động tạo lịch trước
              </label>
              <div className="relative">
                <RefreshCw className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <select
                  value={weeksAhead}
                  onChange={(e) => setWeeksAhead(Number(e.target.value))}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value={2}>2 tuần tới</option>
                  <option value={4}>4 tuần tới (1 tháng)</option>
                  <option value={8}>8 tuần tới (2 tháng)</option>
                  <option value={12}>12 tuần tới (3 tháng)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Start Time & End Time */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Giờ bắt đầu <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Giờ kết thúc <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className={`w-full pl-9 pr-3 py-2 text-sm rounded-xl border bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${
                  errors.endTime ? 'border-rose-300' : 'border-slate-200'
                }`}
              />
            </div>
            {errors.endTime && <p className="text-xs text-rose-500 mt-1">{errors.endTime}</p>}
          </div>
        </div>

        {/* Period Count & Duration */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Số tiết học <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <BookOpen className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="number"
                min="1"
                max="10"
                value={periodCount}
                onChange={(e) => setPeriodCount(Number(e.target.value))}
                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Thời lượng (phút)
            </label>
            <input
              type="number"
              min="15"
              step="15"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value))}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Ghi chú bài học
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ví dụ: Ôn tập chương 2, giải đề thi thử..."
            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-sm shadow-indigo-100 transition-all disabled:opacity-50"
          >
            {isSubmitting ? 'Đang tạo...' : 'Lưu lịch học'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
