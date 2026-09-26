import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Student, TuitionMode } from '../../types';
import { Modal } from '../common/Modal';
import { User, Phone, Mail, FileText, Hash, DollarSign, BookOpen } from 'lucide-react';

interface StudentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentToEdit?: Student | null;
}

export const StudentFormModal: React.FC<StudentFormModalProps> = ({
  isOpen,
  onClose,
  studentToEdit,
}) => {
  const { createOrUpdateStudent } = useApp();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [studentCode, setStudentCode] = useState('');
  const [notes, setNotes] = useState('');
  const [tuitionMode, setTuitionMode] = useState<TuitionMode>('PER_SESSION');
  const [pricePerSession, setPricePerSession] = useState<number>(100000);
  const [pricePerPeriod, setPricePerPeriod] = useState<number>(50000);
  const [periodsPerLesson, setPeriodsPerLesson] = useState<number>(2);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (studentToEdit) {
      setName(studentToEdit.name);
      setPhone(studentToEdit.phone);
      setEmail(studentToEdit.email || '');
      setStudentCode(studentToEdit.studentCode || '');
      setNotes(studentToEdit.notes || '');
      setTuitionMode(studentToEdit.tuitionMode);
      setPricePerSession(studentToEdit.pricePerSession);
      setPricePerPeriod(studentToEdit.pricePerPeriod);
      setPeriodsPerLesson(studentToEdit.periodsPerLesson);
    } else {
      setName('');
      setPhone('');
      setEmail('');
      setStudentCode('');
      setNotes('');
      setTuitionMode('PER_SESSION');
      setPricePerSession(100000);
      setPricePerPeriod(50000);
      setPeriodsPerLesson(2);
    }
    setErrors({});
  }, [studentToEdit, isOpen]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Vui lòng nhập họ và tên học sinh';
    if (!phone.trim()) errs.phone = 'Vui lòng nhập số điện thoại phụ huynh/học sinh';
    if (tuitionMode === 'PER_SESSION' && (pricePerSession <= 0 || isNaN(pricePerSession))) {
      errs.pricePerSession = 'Giá mỗi buổi học phải lớn hơn 0';
    }
    if (tuitionMode === 'PER_PERIOD') {
      if (pricePerPeriod <= 0 || isNaN(pricePerPeriod)) {
        errs.pricePerPeriod = 'Giá mỗi tiết phải lớn hơn 0';
      }
      if (periodsPerLesson <= 0 || isNaN(periodsPerLesson)) {
        errs.periodsPerLesson = 'Số tiết phải ít nhất là 1';
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setIsSubmitting(true);
      await createOrUpdateStudent({
        id: studentToEdit?.id,
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        studentCode: studentCode.trim(),
        notes: notes.trim(),
        tuitionMode,
        pricePerSession: Number(pricePerSession),
        pricePerPeriod: Number(pricePerPeriod),
        periodsPerLesson: Number(periodsPerLesson),
      });
      onClose();
    } catch (err: any) {
      alert(err.message || 'Có lỗi xảy ra khi lưu học sinh');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Preview estimated tuition for 1 lesson
  const estimatedLessonPrice =
    tuitionMode === 'PER_PERIOD' ? pricePerPeriod * periodsPerLesson : pricePerSession;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={studentToEdit ? 'Chỉnh Sửa Thông Tin Học Sinh' : 'Thêm Học Sinh Mới'}
      subtitle="Thiết lập thông tin cá nhân và mức thu học phí riêng cho học sinh"
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Section 1: Basic Information */}
        <div className="space-y-4">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            1. Thông Tin Cơ Bản
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Họ và tên học sinh <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ví dụ: Nguyễn Minh Anh"
                  className={`w-full pl-9 pr-3 py-2 text-sm rounded-xl border bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all ${
                    errors.name ? 'border-rose-300 focus:border-rose-500' : 'border-slate-200 focus:border-indigo-500'
                  }`}
                />
              </div>
              {errors.name && <p className="text-xs text-rose-500 mt-1">{errors.name}</p>}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Số điện thoại <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Ví dụ: 0901 234 567"
                  className={`w-full pl-9 pr-3 py-2 text-sm rounded-xl border bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all ${
                    errors.phone ? 'border-rose-300 focus:border-rose-500' : 'border-slate-200 focus:border-indigo-500'
                  }`}
                />
              </div>
              {errors.phone && <p className="text-xs text-rose-500 mt-1">{errors.phone}</p>}
            </div>

            {/* Email (Optional) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email (không bắt buộc)
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="phuhuynh@gmail.com"
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>
            </div>

            {/* Student Code (Optional) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mã học sinh / MSSV
              </label>
              <div className="relative">
                <Hash className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={studentCode}
                  onChange={(e) => setStudentCode(e.target.value)}
                  placeholder="HS-2026-001"
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Tuition Configuration */}
        <div className="space-y-4 pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              2. Cấu Hình Học Phí
            </h4>
            <span className="text-[11px] text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full font-medium">
              Định giá riêng cho học sinh
            </span>
          </div>

          {/* Tuition Mode Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Thu học phí theo:
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label
                className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                  tuitionMode === 'PER_SESSION'
                    ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                <input
                  type="radio"
                  name="tuitionMode"
                  checked={tuitionMode === 'PER_SESSION'}
                  onChange={() => setTuitionMode('PER_SESSION')}
                  className="text-indigo-600 focus:ring-indigo-500"
                />
                <div>
                  <div className="text-sm font-semibold">Theo Buổi</div>
                  <div className="text-xs text-slate-500 mt-0.5">Thu theo từng buổi học cố định</div>
                </div>
              </label>

              <label
                className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                  tuitionMode === 'PER_PERIOD'
                    ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                <input
                  type="radio"
                  name="tuitionMode"
                  checked={tuitionMode === 'PER_PERIOD'}
                  onChange={() => setTuitionMode('PER_PERIOD')}
                  className="text-indigo-600 focus:ring-indigo-500"
                />
                <div>
                  <div className="text-sm font-semibold">Theo Tiết</div>
                  <div className="text-xs text-slate-500 mt-0.5">Giá theo tiết × Số tiết/buổi</div>
                </div>
              </label>
            </div>
          </div>

          {/* Pricing Fields */}
          {tuitionMode === 'PER_SESSION' ? (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Giá học phí mỗi buổi (VNĐ) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="number"
                  step="1000"
                  min="0"
                  value={pricePerSession}
                  onChange={(e) => setPricePerSession(Number(e.target.value))}
                  placeholder="100000"
                  className={`w-full pl-9 pr-3 py-2 text-sm rounded-xl border bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all ${
                    errors.pricePerSession ? 'border-rose-300 focus:border-rose-500' : 'border-slate-200 focus:border-indigo-500'
                  }`}
                />
              </div>
              {errors.pricePerSession && (
                <p className="text-xs text-rose-500 mt-1">{errors.pricePerSession}</p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Giá mỗi tiết (VNĐ) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="number"
                    step="1000"
                    min="0"
                    value={pricePerPeriod}
                    onChange={(e) => setPricePerPeriod(Number(e.target.value))}
                    placeholder="50000"
                    className={`w-full pl-9 pr-3 py-2 text-sm rounded-xl border bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all ${
                      errors.pricePerPeriod ? 'border-rose-300 focus:border-rose-500' : 'border-slate-200 focus:border-indigo-500'
                    }`}
                  />
                </div>
                {errors.pricePerPeriod && (
                  <p className="text-xs text-rose-500 mt-1">{errors.pricePerPeriod}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Số tiết mặc định mỗi buổi <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <BookOpen className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={periodsPerLesson}
                    onChange={(e) => setPeriodsPerLesson(Number(e.target.value))}
                    placeholder="2"
                    className={`w-full pl-9 pr-3 py-2 text-sm rounded-xl border bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all ${
                      errors.periodsPerLesson ? 'border-rose-300 focus:border-rose-500' : 'border-slate-200 focus:border-indigo-500'
                    }`}
                  />
                </div>
                {errors.periodsPerLesson && (
                  <p className="text-xs text-rose-500 mt-1">{errors.periodsPerLesson}</p>
                )}
              </div>
            </div>
          )}

          {/* Dynamic summary calculation banner */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 flex items-center justify-between text-xs">
            <span className="text-slate-600">
              Mức thu tính toán cho 1 buổi học thông thường:
            </span>
            <span className="font-bold text-indigo-700 text-sm">
              {estimatedLessonPrice.toLocaleString('vi-VN')} đ / buổi
            </span>
          </div>
        </div>

        {/* Section 3: Notes */}
        <div className="pt-3 border-t border-slate-100">
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Ghi chú học tập / yêu cầu từ phụ huynh
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ví dụ: Mục tiêu nâng cao điểm hình học, cần nhắc làm bài tập..."
            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all"
          >
            Hủy bỏ
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-sm shadow-indigo-100 transition-all disabled:opacity-50"
          >
            {isSubmitting ? 'Đang lưu...' : studentToEdit ? 'Lưu thay đổi' : 'Thêm học sinh'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
