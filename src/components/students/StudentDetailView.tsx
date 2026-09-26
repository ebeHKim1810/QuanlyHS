import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Student, Lesson } from '../../types';
import {
  ArrowLeft,
  Edit2,
  Trash2,
  CalendarPlus,
  Receipt,
  Phone,
  Mail,
  Hash,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Calendar,
  Eye,
  Check,
  X,
  CreditCard,
} from 'lucide-react';
import { LessonStatusBadge, PaymentStatusBadge, TuitionModeBadge } from '../common/Badge';
import { format, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';

interface StudentDetailViewProps {
  student: Student;
  onBack: () => void;
  onEdit: (student: Student) => void;
  onAddSchedule: () => void;
}

export const StudentDetailView: React.FC<StudentDetailViewProps> = ({
  student,
  onBack,
  onEdit,
  onAddSchedule,
}) => {
  const {
    lessons,
    schedules,
    invoices,
    deleteStudent,
    deleteRecurringSchedule,
    setLessonAttendance,
    deleteLesson,
    openInvoicePreview,
    setActiveTab,
    openLessonModal,
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'lessons' | 'invoices' | 'schedules'>('lessons');

  // Student lessons
  const studentLessons = lessons
    .filter((l) => l.studentId === student.id)
    .sort((a, b) => new Date(b.lessonDate).getTime() - new Date(a.lessonDate).getTime());

  // Student schedules
  const studentSchedules = schedules.filter((s) => s.studentId === student.id);

  // Student invoices
  const studentInvoices = invoices
    .filter((inv) => inv.studentId === student.id)
    .sort((a, b) => new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime());

  // Filter unbilled attended lessons
  const unbilledAttendedLessons = studentLessons.filter(
    (l) => l.attendanceStatus === 'ATTENDED' && l.billingStatus === 'UNBILLED'
  );

  // Calculate totals
  const totalInvoicedAmount = studentInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
  const totalUnbilledAmount = unbilledAttendedLessons.reduce(
    (sum, l) => sum + (l.calculatedAmount || 0),
    0
  );
  const totalAttendedCount = studentLessons.filter((l) => l.attendanceStatus === 'ATTENDED').length;

  const dayNames = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];

  return (
    <div className="space-y-6">
      {/* Top Header / Back Button */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-900 px-3.5 py-2 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại danh sách học sinh</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(student)}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 px-3.5 py-2 rounded-xl border border-slate-200/80 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
          >
            <Edit2 className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <span>Sửa học sinh</span>
          </button>

          <button
            onClick={() => deleteStudent(student.id)}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-3.5 py-2 rounded-xl border border-rose-200 dark:border-rose-900/60 hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-all"
          >
            <Trash2 className="w-4 h-4" />
            <span>Xóa</span>
          </button>
        </div>
      </div>

      {/* Profile Overview Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-soft">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          {/* Avatar & Info */}
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-500 text-white flex items-center justify-center font-bold text-2xl shadow-md shadow-indigo-100 dark:shadow-none shrink-0">
              {student.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">{student.name}</h2>
                <TuitionModeBadge mode={student.tuitionMode} />
                {student.studentCode && (
                  <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                    {student.studentCode}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 mt-2.5 text-xs text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <a href={`tel:${student.phone}`} className="hover:text-indigo-600 dark:hover:text-indigo-400 font-medium">
                    {student.phone}
                  </a>
                </div>
                {student.email && (
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{student.email}</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Tham gia từ {format(new Date(student.createdAt), 'dd/MM/yyyy')}</span>
                </div>
              </div>

              {student.notes && (
                <div className="mt-3 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200/60 max-w-2xl">
                  <span className="font-semibold text-slate-700">Ghi chú:</span> {student.notes}
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap sm:flex-nowrap md:flex-col gap-2 shrink-0">
            <button
              onClick={() => setActiveTab('create_invoice')}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-sm shadow-indigo-100 transition-all"
            >
              <Receipt className="w-4 h-4" />
              <span>Xuất phiếu học phí</span>
            </button>
            <button
              onClick={onAddSchedule}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 transition-all"
            >
              <CalendarPlus className="w-4 h-4 text-slate-500" />
              <span>Tạo lịch học mới</span>
            </button>
          </div>
        </div>

        {/* Current Tuition Rate Strip */}
        <div className="mt-6 pt-5 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60">
            <span className="text-xs text-slate-500 font-medium">Hình thức thu học phí</span>
            <div className="text-base font-bold text-slate-800 mt-0.5">
              {student.tuitionMode === 'PER_SESSION' ? 'Theo từng Buổi' : 'Theo từng Tiết học'}
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              {student.tuitionMode === 'PER_SESSION'
                ? `${student.pricePerSession.toLocaleString('vi-VN')} đ / buổi`
                : `${student.pricePerPeriod.toLocaleString('vi-VN')} đ / tiết (${student.periodsPerLesson} tiết/buổi)`}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/60">
            <span className="text-xs text-amber-800 font-medium">Học phí chưa xuất phiếu</span>
            <div className="text-base font-bold text-amber-900 mt-0.5">
              {totalUnbilledAmount.toLocaleString('vi-VN')} đ
            </div>
            <div className="text-xs text-amber-700 mt-0.5">
              {unbilledAttendedLessons.length} buổi đã học đang chờ tính phí
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200/60">
            <span className="text-xs text-emerald-800 font-medium">Tổng tiền đã xuất phiếu</span>
            <div className="text-base font-bold text-emerald-900 mt-0.5">
              {totalInvoicedAmount.toLocaleString('vi-VN')} đ
            </div>
            <div className="text-xs text-emerald-700 mt-0.5">
              Qua {studentInvoices.length} phiếu học phí đã lập
            </div>
          </div>
        </div>
      </div>

      {/* Billable Alert Banner (if any unbilled attended sessions exist) */}
      {unbilledAttendedLessons.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-amber-900">
                Có {unbilledAttendedLessons.length} buổi học đã học nhưng chưa xuất phiếu!
              </div>
              <div className="text-xs text-amber-700 mt-0.5">
                Tổng số tiền chờ thu:{' '}
                <span className="font-bold">{totalUnbilledAmount.toLocaleString('vi-VN')} đ</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('create_invoice')}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs transition-all shrink-0"
          >
            <span>Lập phiếu thu ngay</span>
            <Receipt className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Sub Tabs: Buổi học / Phiếu học phí / Lịch định kỳ */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-soft overflow-hidden">
        <div className="flex border-b border-slate-100 dark:border-slate-800 px-6 pt-3 gap-6 overflow-x-auto">
          <button
            onClick={() => setActiveSubTab('lessons')}
            className={`pb-3 text-sm font-semibold border-b-2 transition-all shrink-0 ${
              activeSubTab === 'lessons'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Lịch sử các buổi học ({studentLessons.length})
          </button>

          <button
            onClick={() => setActiveSubTab('invoices')}
            className={`pb-3 text-sm font-semibold border-b-2 transition-all shrink-0 ${
              activeSubTab === 'invoices'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Phiếu học phí đã xuất ({studentInvoices.length})
          </button>

          <button
            onClick={() => setActiveSubTab('schedules')}
            className={`pb-3 text-sm font-semibold border-b-2 transition-all shrink-0 ${
              activeSubTab === 'schedules'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Lịch học định kỳ ({studentSchedules.length})
          </button>
        </div>

        {/* Tab 1: Lessons List */}
        {activeSubTab === 'lessons' && (
          <div className="p-6">
            {studentLessons.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-sm">
                Học sinh này chưa có buổi học nào. Hãy bấm "Tạo lịch học mới" để bắt đầu!
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 text-xs font-semibold uppercase text-slate-400">
                      <th className="pb-3 pl-2">Ngày học</th>
                      <th className="pb-3">Giờ học</th>
                      <th className="pb-3">Số tiết</th>
                      <th className="pb-3">Điểm danh</th>
                      <th className="pb-3">Trạng thái phí</th>
                      <th className="pb-3 text-right">Tiền học</th>
                      <th className="pb-3 text-right pr-2">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {studentLessons.map((lesson) => (
                      <tr key={lesson.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="py-3.5 pl-2 font-medium text-slate-900 dark:text-white">
                          {format(parseISO(lesson.lessonDate), 'dd/MM/yyyy')}
                        </td>
                        <td className="py-3.5 text-slate-600 dark:text-slate-400">
                          {lesson.startTime} – {lesson.endTime}
                        </td>
                        <td className="py-3.5 text-slate-600 dark:text-slate-400">{lesson.periodCount} tiết</td>
                        <td className="py-3.5">
                          <LessonStatusBadge
                            attendanceStatus={lesson.attendanceStatus}
                            billingStatus={lesson.billingStatus}
                          />
                        </td>
                        <td className="py-3.5 text-xs text-slate-500 dark:text-slate-400">
                          {lesson.billingStatus === 'INVOICED' ? (
                            <span className="text-violet-600 dark:text-violet-400 font-medium">Đã chốt phiếu</span>
                          ) : lesson.attendanceStatus === 'ATTENDED' ? (
                            <span className="text-amber-600 dark:text-amber-400 font-medium">Chờ xuất phiếu</span>
                          ) : (
                            <span className="text-slate-400">Không tính phí</span>
                          )}
                        </td>
                        <td className="py-3.5 text-right font-semibold text-slate-800 dark:text-slate-200">
                          {lesson.attendanceStatus === 'ATTENDED'
                            ? `${lesson.calculatedAmount.toLocaleString('vi-VN')} đ`
                            : '0 đ'}
                        </td>
                        <td className="py-3.5 text-right pr-2">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Fast attendance toggle if not invoiced */}
                            {lesson.billingStatus !== 'INVOICED' && (
                              <>
                                <button
                                  title="Đánh dấu Có học"
                                  onClick={() => setLessonAttendance(lesson.id, 'ATTENDED')}
                                  className={`p-1.5 rounded-lg border text-xs ${
                                    lesson.attendanceStatus === 'ATTENDED'
                                      ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                                      : 'bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 text-slate-500 dark:text-slate-400 hover:text-emerald-700 dark:hover:text-emerald-300 border-slate-200 dark:border-slate-700'
                                  }`}
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  title="Đánh dấu Vắng"
                                  onClick={() => setLessonAttendance(lesson.id, 'ABSENT')}
                                  className={`p-1.5 rounded-lg border text-xs ${
                                    lesson.attendanceStatus === 'ABSENT'
                                      ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800'
                                      : 'bg-white dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/50 text-slate-500 dark:text-slate-400 hover:text-rose-700 dark:hover:text-rose-300 border-slate-200 dark:border-slate-700'
                                  }`}
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}

                            <button
                              onClick={() => openLessonModal(lesson)}
                              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                              title="Chi tiết buổi học"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteLesson(lesson.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/50"
                              title="Xóa buổi học"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Invoices List */}
        {activeSubTab === 'invoices' && (
          <div className="p-6">
            {studentInvoices.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-sm">
                Học sinh này chưa có phiếu học phí nào được xuất.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 text-xs font-semibold uppercase text-slate-400">
                      <th className="pb-3 pl-2">Mã phiếu</th>
                      <th className="pb-3">Ngày xuất</th>
                      <th className="pb-3">Số buổi</th>
                      <th className="pb-3">Thành tiền</th>
                      <th className="pb-3">Thanh toán</th>
                      <th className="pb-3 text-right pr-2">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {studentInvoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="py-3.5 pl-2 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                          {inv.invoiceNumber}
                        </td>
                        <td className="py-3.5 text-slate-600 dark:text-slate-400">
                          {format(parseISO(inv.issuedAt), 'dd/MM/yyyy')}
                        </td>
                        <td className="py-3.5 text-slate-600 dark:text-slate-400">{inv.lessonCount} buổi</td>
                        <td className="py-3.5 font-bold text-slate-900 dark:text-white">
                          {inv.totalAmount.toLocaleString('vi-VN')} đ
                        </td>
                        <td className="py-3.5">
                          <PaymentStatusBadge status={inv.paymentStatus} />
                        </td>
                        <td className="py-3.5 text-right pr-2">
                          <button
                            onClick={() => openInvoicePreview(inv)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded-lg transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Xem phiếu</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Schedules */}
        {activeSubTab === 'schedules' && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
                Lịch học định kỳ hàng tuần
              </span>
              <button
                onClick={onAddSchedule}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 bg-indigo-50 dark:bg-indigo-950/50 px-3 py-1.5 rounded-lg"
              >
                <CalendarPlus className="w-3.5 h-3.5" />
                <span>Thêm lịch định kỳ</span>
              </button>
            </div>

            {studentSchedules.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-sm">
                Chưa thiết lập lịch định kỳ cho học sinh này.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {studentSchedules.map((sch) => (
                  <div
                    key={sch.id}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                        {dayNames[sch.dayOfWeek]}: {sch.startTime} – {sch.endTime}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {sch.durationMinutes} phút • {sch.periodCount} tiết
                        {sch.notes ? ` • ${sch.notes}` : ''}
                      </div>
                    </div>
                    <button
                      onClick={() => deleteRecurringSchedule(sch.id)}
                      className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/50"
                      title="Xóa lịch định kỳ"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
