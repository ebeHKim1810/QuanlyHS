import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Lesson, AttendanceStatus } from '../../types';
import { Modal } from '../common/Modal';
import {
  Calendar,
  Clock,
  BookOpen,
  User,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Receipt,
  Trash2,
  Check,
  X,
  FileText,
  DollarSign,
  Lock,
} from 'lucide-react';
import { LessonStatusBadge, TuitionModeBadge } from '../common/Badge';
import { format, parseISO } from 'date-fns';

interface LessonModalProps {
  lesson: Lesson | null;
  isOpen: boolean;
  onClose: () => void;
}

export const LessonModal: React.FC<LessonModalProps> = ({ lesson, isOpen, onClose }) => {
  const {
    students,
    invoices,
    setLessonAttendance,
    deleteLesson,
    openInvoicePreview,
    setActiveTab,
    createOrUpdateLesson,
  } = useApp();

  const [notes, setNotes] = useState(lesson?.notes || '');
  const [isUpdatingNotes, setIsUpdatingNotes] = useState(false);

  if (!lesson) return null;

  const student = students.find((s) => s.id === lesson.studentId);
  const invoice = lesson.invoiceId ? invoices.find((inv) => inv.id === lesson.invoiceId) : null;

  const handleAttendance = async (status: AttendanceStatus) => {
    await setLessonAttendance(lesson.id, status);
  };

  const handleSaveNotes = async () => {
    try {
      setIsUpdatingNotes(true);
      await createOrUpdateLesson({
        ...lesson,
        notes,
      });
    } finally {
      setIsUpdatingNotes(false);
    }
  };

  const formattedDate = format(parseISO(lesson.lessonDate), 'dd/MM/yyyy');

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Chi Tiết Buổi Học"
      subtitle={`${formattedDate} • ${lesson.startTime} – ${lesson.endTime}`}
      maxWidth="md"
    >
      <div className="space-y-5">
        {/* Student card & Status */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-base">
              {student ? student.name.charAt(0).toUpperCase() : 'H'}
            </div>
            <div>
              <div className="font-bold text-slate-900 text-sm">{student?.name || 'Học sinh'}</div>
              <div className="text-xs text-slate-500 mt-0.5">{student?.phone || ''}</div>
            </div>
          </div>

          <LessonStatusBadge
            attendanceStatus={lesson.attendanceStatus}
            billingStatus={lesson.billingStatus}
          />
        </div>

        {/* Lesson details grid */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-white border border-slate-200">
            <span className="text-slate-400 block mb-1">Thời lượng & Tiết</span>
            <div className="font-semibold text-slate-800 text-sm">
              {lesson.durationMinutes} phút • {lesson.periodCount} tiết
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white border border-slate-200">
            <span className="text-slate-400 block mb-1">Số tiền buổi học</span>
            <div className="font-bold text-indigo-700 text-sm">
              {lesson.attendanceStatus === 'ATTENDED'
                ? `${lesson.calculatedAmount.toLocaleString('vi-VN')} đ`
                : '0 đ (Chưa/Không tính)'}
            </div>
          </div>
        </div>

        {/* Invoice status banner */}
        {lesson.billingStatus === 'INVOICED' ? (
          <div className="p-3.5 rounded-xl bg-violet-50 border border-violet-200 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-violet-900">
              <Lock className="w-4 h-4 text-violet-600 shrink-0" />
              <div>
                <span className="font-semibold">Đã xuất phiếu: </span>
                <span className="font-mono font-bold">{invoice?.invoiceNumber || 'HP-0001'}</span>
              </div>
            </div>
            {invoice && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  openInvoicePreview(invoice);
                }}
                className="text-violet-700 hover:text-violet-900 font-semibold underline text-xs ml-2"
              >
                Xem phiếu
              </button>
            )}
          </div>
        ) : lesson.attendanceStatus === 'ATTENDED' ? (
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between text-xs">
            <div className="text-amber-900">
              <span className="font-bold">Đã có học & chưa xuất phiếu:</span> Sẵn sàng để lập hóa đơn
            </div>
            <button
              type="button"
              onClick={() => {
                onClose();
                setActiveTab('create_invoice');
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg shrink-0 shadow-xs"
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>Lập phiếu</span>
            </button>
          </div>
        ) : null}

        {/* Attendance Action Buttons */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-2">
            Điểm danh buổi học:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              type="button"
              onClick={() => handleAttendance('ATTENDED')}
              className={`p-2.5 rounded-xl text-xs font-semibold flex flex-col items-center gap-1 border transition-all ${
                lesson.attendanceStatus === 'ATTENDED'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Có học</span>
            </button>

            <button
              type="button"
              onClick={() => handleAttendance('ABSENT')}
              className={`p-2.5 rounded-xl text-xs font-semibold flex flex-col items-center gap-1 border transition-all ${
                lesson.attendanceStatus === 'ABSENT'
                  ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                  : 'bg-rose-50 hover:bg-rose-100 text-rose-800 border-rose-200'
              }`}
            >
              <XCircle className="w-4 h-4" />
              <span>Vắng</span>
            </button>

            <button
              type="button"
              onClick={() => handleAttendance('CANCELLED')}
              className={`p-2.5 rounded-xl text-xs font-semibold flex flex-col items-center gap-1 border transition-all ${
                lesson.attendanceStatus === 'CANCELLED'
                  ? 'bg-slate-700 text-white border-slate-700 shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Hủy buổi</span>
            </button>

            <button
              type="button"
              onClick={() => handleAttendance('SCHEDULED')}
              className={`p-2.5 rounded-xl text-xs font-semibold flex flex-col items-center gap-1 border transition-all ${
                lesson.attendanceStatus === 'SCHEDULED'
                  ? 'bg-slate-800 text-white border-slate-800 shadow-sm'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>Chưa điểm danh</span>
            </button>
          </div>
        </div>

        {/* Lesson Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Ghi chú bài học / bài tập về nhà:
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Nội dung đã dạy, điểm số, nhắc nhở..."
              className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
            <button
              type="button"
              onClick={handleSaveNotes}
              disabled={isUpdatingNotes}
              className="px-3 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shrink-0"
            >
              {isUpdatingNotes ? 'Lưu...' : 'Lưu ghi chú'}
            </button>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={() => {
              deleteLesson(lesson.id);
              onClose();
            }}
            className="inline-flex items-center gap-1.5 text-xs text-rose-600 hover:text-rose-800 hover:bg-rose-50 px-2.5 py-1.5 rounded-lg transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Xóa buổi học này</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
          >
            Đóng
          </button>
        </div>
      </div>
    </Modal>
  );
};
