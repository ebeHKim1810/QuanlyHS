import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Student, Lesson, ReceiptThemeId, PaymentStatus } from '../../types';
import { THEME_LIST, RECEIPT_THEMES } from './ReceiptThemes';
import { ReceiptTemplate } from './ReceiptTemplate';
import { MobileReceiptTemplate } from './MobileReceiptTemplate';
import {
  Receipt,
  User,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Sparkles,
  Palette,
  MessageSquare,
  DollarSign,
  ShieldCheck,
  Check,
  Eye,
  ChevronRight,
  Smartphone,
  FileText,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { TuitionModeBadge } from '../common/Badge';

export const InvoiceBuilderView: React.FC = () => {
  const { students, lessons, settings, issueInvoice, openInvoicePreview, setActiveTab } = useApp();

  // State
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [selectedLessonIds, setSelectedLessonIds] = useState<string[]>([]);
  const [selectedTheme, setSelectedTheme] = useState<ReceiptThemeId>('soft_pink');
  const [showComment, setShowComment] = useState<boolean>(true);
  const [teacherComment, setTeacherComment] = useState<string>('');
  const [discount, setDiscount] = useState<number>(0);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('UNPAID');
  const [previewMode, setPreviewMode] = useState<'a4' | 'mobile'>('a4');
  const [lessonDisplayMode, setLessonDisplayMode] = useState<'STANDARD' | 'COMPACT'>('STANDARD');
  const [showBankInfo, setShowBankInfo] = useState<boolean>(false);

  const [activeStep, setActiveStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Auto-select first student if available and not selected
  useEffect(() => {
    if (students.length > 0 && !selectedStudentId) {
      // Find a student who has unbilled lessons first
      const studentWithUnbilled = students.find((s) =>
        lessons.some((l) => l.studentId === s.id && l.attendanceStatus === 'ATTENDED' && l.billingStatus === 'UNBILLED')
      );
      setSelectedStudentId(studentWithUnbilled ? studentWithUnbilled.id : students[0].id);
    }
  }, [students, lessons, selectedStudentId]);

  const selectedStudent = students.find((s) => s.id === selectedStudentId);

  // Retrieve strictly ATTENDED and UNBILLED lessons for the selected student
  const eligibleLessons = lessons
    .filter(
      (l) =>
        l.studentId === selectedStudentId &&
        l.attendanceStatus === 'ATTENDED' &&
        l.billingStatus === 'UNBILLED'
    )
    .sort((a, b) => new Date(a.lessonDate).getTime() - new Date(b.lessonDate).getTime());

  // Default: Select all eligible lessons whenever student changes
  useEffect(() => {
    setSelectedLessonIds(eligibleLessons.map((l) => l.id));
  }, [selectedStudentId, lessons]);

  // Toggle selection of a lesson
  const toggleLesson = (lessonId: string) => {
    setSelectedLessonIds((prev) =>
      prev.includes(lessonId) ? prev.filter((id) => id !== lessonId) : [...prev, lessonId]
    );
  };

  const selectAll = () => {
    setSelectedLessonIds(eligibleLessons.map((l) => l.id));
  };

  const deselectAll = () => {
    setSelectedLessonIds([]);
  };

  // Calculation
  const chosenLessons = eligibleLessons.filter((l) => selectedLessonIds.includes(l.id));

  const subtotal = chosenLessons.reduce((sum, l) => {
    if (l.calculatedAmount > 0) return sum + l.calculatedAmount;
    if (selectedStudent?.tuitionMode === 'PER_PERIOD') {
      return sum + selectedStudent.pricePerPeriod * l.periodCount;
    }
    return sum + (selectedStudent?.pricePerSession || 0);
  }, 0);

  const totalAmount = Math.max(0, subtotal - discount);

  // Mock invoice for live preview
  const livePreviewInvoice = selectedStudent
    ? {
        id: 'preview_temp',
        studentId: selectedStudent.id,
        studentNameSnapshot: selectedStudent.name,
        studentPhoneSnapshot: selectedStudent.phone,
        invoiceNumber: 'HP-2026-PREVIEW',
        issuedAt: new Date().toISOString().split('T')[0],
        subtotal,
        discount,
        totalAmount,
        paymentStatus,
        receiptTheme: selectedTheme,
        showComment,
        teacherComment,
        tuitionModeSnapshot: selectedStudent.tuitionMode,
        unitPriceSnapshot:
          selectedStudent.tuitionMode === 'PER_PERIOD'
            ? selectedStudent.pricePerPeriod
            : selectedStudent.pricePerSession,
        lessonCount: chosenLessons.length,
        lessonDisplayMode,
        showBankInfo,
        bankNameSnapshot: settings.bankName || '',
        bankAccountNumberSnapshot: settings.bankAccountNumber || '',
        bankAccountHolderSnapshot: settings.bankAccountName || settings.teacherName || '',
        transferNoteSnapshot: settings.transferNoteTemplate
          ? settings.transferNoteTemplate.replace('{studentName}', selectedStudent.name)
          : `${selectedStudent.name}`,
        qrImageUrlSnapshot: settings.qrImageUrl || '',
        items: chosenLessons.map((l, idx) => ({
          id: `preview_item_${idx}`,
          invoiceId: 'preview_temp',
          lessonId: l.id,
          lessonDate: l.lessonDate,
          startTime: l.startTime,
          endTime: l.endTime,
          periodCount: l.periodCount,
          tuitionMode: selectedStudent.tuitionMode,
          unitPrice:
            selectedStudent.tuitionMode === 'PER_PERIOD'
              ? selectedStudent.pricePerPeriod
              : selectedStudent.pricePerSession,
          amount:
            l.calculatedAmount > 0
              ? l.calculatedAmount
              : selectedStudent.tuitionMode === 'PER_PERIOD'
              ? selectedStudent.pricePerPeriod * l.periodCount
              : selectedStudent.pricePerSession,
        })),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    : null;

  // Handle Issuance
  const handleIssueInvoice = async () => {
    if (!selectedStudent) return;
    if (chosenLessons.length === 0) {
      alert('Vui lòng chọn ít nhất một buổi học để xuất phiếu!');
      return;
    }

    try {
      setIsSubmitting(true);
      const invoice = await issueInvoice({
        studentId: selectedStudent.id,
        selectedLessonIds,
        theme: selectedTheme,
        showComment,
        teacherComment,
        discount,
        paymentStatus,
        lessonDisplayMode,
        showBankInfo,
        bankNameSnapshot: settings.bankName || '',
        bankAccountNumberSnapshot: settings.bankAccountNumber || '',
        bankAccountHolderSnapshot: settings.bankAccountName || settings.teacherName || '',
        transferNoteSnapshot: settings.transferNoteTemplate
          ? settings.transferNoteTemplate.replace('{studentName}', selectedStudent.name)
          : `${selectedStudent.name}`,
        qrImageUrlSnapshot: settings.qrImageUrl || '',
      });

      // Open the preview modal of the newly issued invoice
      openInvoicePreview(invoice);
    } catch (err: any) {
      alert(err.message || 'Lỗi khi xuất phiếu học phí');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900">Lập & Xuất Phiếu Học Phí</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Quy trình 8 bước chuẩn hóa: Tự động gom các buổi đã học chưa thanh toán, chốt số tiền và khóa lịch sử
        </p>
      </div>

      {/* Main Grid: Steps & Config on Left, Live Preview on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Form Steps (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* STEP 1: Select Student */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-soft space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">
                  1
                </span>
                <h3 className="font-bold text-sm text-slate-900">Chọn Học Sinh</h3>
              </div>
              {selectedStudent && <TuitionModeBadge mode={selectedStudent.tuitionMode} />}
            </div>

            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50/50 font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                {students.map((std) => {
                  const unbilled = lessons.filter(
                    (l) => l.studentId === std.id && l.attendanceStatus === 'ATTENDED' && l.billingStatus === 'UNBILLED'
                  ).length;

                  return (
                    <option key={std.id} value={std.id}>
                      {std.name} — {unbilled > 0 ? `🔥 Có ${unbilled} buổi chưa tính phí` : 'Đã thanh toán đủ'}
                    </option>
                  );
                })}
              </select>
            </div>

            {selectedStudent && (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-xs text-slate-600 flex items-center justify-between">
                <span>
                  Đơn giá:{' '}
                  <strong>
                    {selectedStudent.tuitionMode === 'PER_SESSION'
                      ? `${selectedStudent.pricePerSession.toLocaleString('vi-VN')} đ / buổi`
                      : `${selectedStudent.pricePerPeriod.toLocaleString('vi-VN')} đ / tiết`}
                  </strong>
                </span>
                <span>SĐT: {selectedStudent.phone}</span>
              </div>
            )}
          </div>

          {/* STEP 2 & 3: Eligible Unbilled Lessons Selection */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-soft space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">
                  2
                </span>
                <h3 className="font-bold text-sm text-slate-900">
                  Các Buổi Đã Học Chưa Tính Phí ({eligibleLessons.length})
                </h3>
              </div>

              {eligibleLessons.length > 0 && (
                <div className="flex items-center gap-2 text-xs">
                  <button
                    type="button"
                    onClick={selectAll}
                    className="text-indigo-600 hover:text-indigo-800 font-semibold"
                  >
                    Chọn tất cả
                  </button>
                  <span className="text-slate-300">|</span>
                  <button
                    type="button"
                    onClick={deselectAll}
                    className="text-slate-500 hover:text-slate-700"
                  >
                    Bỏ chọn
                  </button>
                </div>
              )}
            </div>

            {/* Empty state if no unbilled lessons */}
            {eligibleLessons.length === 0 ? (
              <div className="p-6 rounded-xl border border-dashed border-amber-200 bg-amber-50/60 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-amber-500 mx-auto" />
                <h4 className="text-sm font-bold text-amber-900">
                  Hiện không có buổi học nào chưa tính học phí.
                </h4>
                <p className="text-xs text-amber-700 max-w-sm mx-auto">
                  Tất cả các buổi học trước đây của {selectedStudent?.name} đều đã được xuất phiếu hoặc
                  học sinh chưa có buổi học nào được điểm danh "Có học".
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => setActiveTab('attendance')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-800 bg-amber-100 hover:bg-amber-200 rounded-lg transition-colors"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Đi tới mục Điểm danh</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {eligibleLessons.map((lesson) => {
                  const isChecked = selectedLessonIds.includes(lesson.id);
                  const amount =
                    lesson.calculatedAmount > 0
                      ? lesson.calculatedAmount
                      : selectedStudent?.tuitionMode === 'PER_PERIOD'
                      ? (selectedStudent?.pricePerPeriod || 0) * lesson.periodCount
                      : selectedStudent?.pricePerSession || 0;

                  return (
                    <label
                      key={lesson.id}
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                        isChecked
                          ? 'border-indigo-500 bg-indigo-50/40 text-slate-900 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 bg-white text-slate-500'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleLesson(lesson.id)}
                          className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                        />
                        <div>
                          <div className="text-xs font-bold text-slate-800">
                            {format(parseISO(lesson.lessonDate), 'dd/MM/yyyy')} • {lesson.startTime}–{lesson.endTime}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {lesson.periodCount} tiết
                            {lesson.notes ? ` • ${lesson.notes}` : ''}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-xs font-mono font-bold text-indigo-700">
                          {amount.toLocaleString('vi-VN')} đ
                        </div>
                        <span className="text-[10px] text-emerald-600 font-medium">Đã học</span>
                      </div>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* STEP 4: Summary Calculations & Discount */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-soft space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">
                3
              </span>
              <h3 className="font-bold text-sm text-slate-900">Chi Tiết Tính Tiền & Thanh Toán</h3>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                <span className="text-xs text-slate-500">Số buổi chọn thanh toán</span>
                <div className="text-lg font-bold text-slate-900 mt-0.5">
                  {chosenLessons.length} buổi
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                <span className="text-xs text-slate-500">Tạm tính</span>
                <div className="text-lg font-bold text-slate-900 mt-0.5">
                  {subtotal.toLocaleString('vi-VN')} đ
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* Discount / Miễn giảm */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Miễn giảm / Chiết khấu (VNĐ)
                </label>
                <input
                  type="number"
                  step="5000"
                  min="0"
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                  placeholder="0"
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none"
                />
              </div>

              {/* Payment status option */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Trạng thái thanh toán ban đầu
                </label>
                <select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value as any)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-medium"
                >
                  <option value="UNPAID">Chưa thanh toán (Chờ phụ huynh chuyển)</option>
                  <option value="PAID">Đã thanh toán (Thu tiền mặt ngay)</option>
                </select>
              </div>
            </div>

            {/* Total Highlight */}
            <div className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-200 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-950">
                TỔNG HỌC PHÍ PHẢI THU:
              </span>
              <span className="text-xl font-black text-indigo-700 font-display">
                {totalAmount.toLocaleString('vi-VN')} đ
              </span>
            </div>
          </div>

          {/* STEP 5: Teacher Comments */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-soft space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">
                  4
                </span>
                <h3 className="font-bold text-sm text-slate-900">Nhận Xét Của Giáo Viên</h3>
              </div>

              {/* Toggle Comment ON/OFF */}
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-600">
                <input
                  type="checkbox"
                  checked={showComment}
                  onChange={(e) => setShowComment(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                />
                <span>Hiển thị nhận xét trên phiếu</span>
              </label>
            </div>

            {showComment && (
              <textarea
                rows={2}
                value={teacherComment}
                onChange={(e) => setTeacherComment(e.target.value)}
                placeholder="Ví dụ: Minh Anh tháng này học rất tiến bộ, chăm chỉ làm bài tập và tích cực phát biểu..."
                className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            )}
          </div>

          {/* STEP 5: Hiển Thị Phiếu (Display Mode & Bank/QR Info) */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-soft space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">
                5
              </span>
              <h3 className="font-bold text-sm text-slate-900">Hiển Thị Phiếu & Thông Tin Thanh Toán</h3>
            </div>

            {/* Kiểu hiển thị buổi học */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Kiểu hiển thị buổi học
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setLessonDisplayMode('STANDARD')}
                  className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                    lessonDisplayMode === 'STANDARD'
                      ? 'border-indigo-600 bg-indigo-50/50 text-indigo-950 ring-2 ring-indigo-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold">Danh sách đầy đủ</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">Bảng chi tiết giờ & số tiết chuẩn</div>
                  </div>
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ml-2 ${
                      lessonDisplayMode === 'STANDARD'
                        ? 'border-indigo-600 bg-indigo-600 text-white'
                        : 'border-slate-300'
                    }`}
                  >
                    {lessonDisplayMode === 'STANDARD' && (
                      <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    )}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setLessonDisplayMode('COMPACT')}
                  className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                    lessonDisplayMode === 'COMPACT'
                      ? 'border-indigo-600 bg-indigo-50/50 text-indigo-950 ring-2 ring-indigo-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold">Dạng ngày gọn</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">Ô ngày DD/MM rút ngắn chiều dài</div>
                  </div>
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ml-2 ${
                      lessonDisplayMode === 'COMPACT'
                        ? 'border-indigo-600 bg-indigo-600 text-white'
                        : 'border-slate-300'
                    }`}
                  >
                    {lessonDisplayMode === 'COMPACT' && (
                      <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    )}
                  </div>
                </button>
              </div>
            </div>

            {/* Toggle Hiển thị thông tin ngân hàng */}
            <div className="pt-2 border-t border-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-xs font-bold text-slate-800 block">
                    Hiển thị thông tin ngân hàng
                  </label>
                  <span className="text-[11px] text-slate-400">
                    Bật để in tài khoản nhận tiền và mã QR lên phiếu
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setShowBankInfo(!showBankInfo)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    showBankInfo ? 'bg-indigo-600' : 'bg-slate-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      showBankInfo ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Bank Details Summary / Warning when ON */}
              {showBankInfo && (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2.5 text-xs">
                  {!settings.bankName && !settings.bankAccountNumber && !settings.qrImageUrl ? (
                    <div className="flex items-start gap-2 text-amber-700 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold">Bạn chưa thiết lập thông tin ngân hàng.</p>
                        <p className="text-[11px] text-amber-600 mt-0.5">
                          Hãy cập nhật trong{' '}
                          <button
                            type="button"
                            onClick={() => setActiveTab('settings')}
                            className="underline font-bold text-indigo-700"
                          >
                            Cài đặt
                          </button>{' '}
                          để phiếu hiển thị đầy đủ tài khoản nhận tiền.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <span className="font-bold text-slate-700">Thông tin nhận thanh toán:</span>
                        <button
                          type="button"
                          onClick={() => setActiveTab('settings')}
                          className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold underline"
                        >
                          Chỉnh sửa trong Cài đặt
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600">
                        {settings.bankName && (
                          <div>
                            Ngân hàng: <strong className="text-slate-800">{settings.bankName}</strong>
                          </div>
                        )}
                        {settings.bankAccountNumber && (
                          <div>
                            Số tài khoản:{' '}
                            <strong className="font-mono text-indigo-700 font-bold">
                              {settings.bankAccountNumber}
                            </strong>
                          </div>
                        )}
                        {(settings.bankAccountName || settings.teacherName) && (
                          <div>
                            Chủ tài khoản:{' '}
                            <strong className="text-slate-800">
                              {settings.bankAccountName || settings.teacherName}
                            </strong>
                          </div>
                        )}
                        <div>
                          Mã QR:{' '}
                          {settings.qrImageUrl ? (
                            <span className="text-emerald-700 font-semibold">Đã tải ảnh lên</span>
                          ) : (
                            <span className="text-slate-400 italic">Chưa tải ảnh QR</span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* STEP 6: Select Receipt Theme (8 Pastel Themes) */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-soft space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">
                6
              </span>
              <h3 className="font-bold text-sm text-slate-900">Chọn Giao Diện Pastel Cho Phiếu Thu</h3>
            </div>
            <p className="text-xs text-slate-500">
              Chọn màu sắc trang nhã, nhã nhặn phù hợp để gửi đến phụ huynh
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
              {THEME_LIST.map((th) => {
                const isSelected = selectedTheme === th.id;
                return (
                  <button
                    key={th.id}
                    type="button"
                    onClick={() => setSelectedTheme(th.id)}
                    className={`flex items-center gap-2.5 p-2 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-slate-800 bg-slate-50 shadow-xs ring-2 ring-indigo-500/30'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <span
                      className="w-5 h-5 rounded-full border border-black/10 shrink-0"
                      style={{ backgroundColor: th.previewColor }}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-slate-800 truncate">{th.name}</div>
                      <div className="text-[10px] text-slate-400 truncate">{th.subname}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* STEP 8: Issue Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleIssueInvoice}
              disabled={isSubmitting || chosenLessons.length === 0}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl text-base font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 shadow-md shadow-indigo-200 transition-all disabled:opacity-40 disabled:pointer-events-none"
            >
              <Receipt className="w-5 h-5" />
              <span>{isSubmitting ? 'Đang tạo phiếu...' : 'XUẤT PHIẾU HỌC PHÍ NGAY'}</span>
              <ChevronRight className="w-5 h-5 ml-1" />
            </button>
            <p className="text-center text-[11px] text-slate-400 mt-2">
              Sau khi xuất phiếu, {chosenLessons.length} buổi học này sẽ được khóa vĩnh viễn và không bao giờ bị tính trùng.
            </p>
          </div>
        </div>

        {/* Right Column: Live Interactive Receipt Preview (5 cols) */}
        <div className="lg:col-span-5 sticky top-6 space-y-3">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
              <Eye className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Xem trước phiếu thu (Live Preview)</span>
            </div>

            {/* Toggle A4 vs Mobile */}
            <div className="flex items-center gap-1 p-0.5 bg-slate-200/80 dark:bg-slate-800 rounded-lg text-[11px] font-semibold">
              <button
                type="button"
                onClick={() => setPreviewMode('a4')}
                className={`px-2 py-0.5 rounded-md flex items-center gap-1 transition-all ${
                  previewMode === 'a4'
                    ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <FileText className="w-3 h-3" />
                <span>Khổ A4</span>
              </button>

              <button
                type="button"
                onClick={() => setPreviewMode('mobile')}
                className={`px-2 py-0.5 rounded-md flex items-center gap-1 transition-all ${
                  previewMode === 'mobile'
                    ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <Smartphone className="w-3 h-3" />
                <span>Điện thoại (Zalo)</span>
              </button>
            </div>
          </div>

          {livePreviewInvoice && (
            <div className="overflow-hidden flex justify-center transition-transform">
              {previewMode === 'a4' ? (
                <div className="overflow-hidden transform scale-95 origin-top sm:scale-100 transition-transform w-full">
                  <ReceiptTemplate
                    invoice={livePreviewInvoice}
                    settings={settings}
                    elementId="builder-live-preview"
                  />
                </div>
              ) : (
                <div className="p-3 bg-slate-100/80 dark:bg-slate-950/60 rounded-3xl border border-slate-200/80 dark:border-slate-800 w-full flex justify-center">
                  <MobileReceiptTemplate
                    invoice={livePreviewInvoice}
                    settings={settings}
                    elementId="builder-live-preview-mobile"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
