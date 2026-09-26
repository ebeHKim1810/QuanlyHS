import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Student, TuitionMode } from '../../types';
import {
  Coins,
  ShieldCheck,
  Calculator,
  User,
  Edit2,
  BookOpen,
  DollarSign,
  Info,
} from 'lucide-react';
import { TuitionModeBadge } from '../common/Badge';
import { StudentFormModal } from '../students/StudentFormModal';

export const TuitionPlansView: React.FC = () => {
  const { students } = useApp();

  const [calcMode, setCalcMode] = useState<TuitionMode>('PER_SESSION');
  const [calcUnitPrice, setCalcUnitPrice] = useState<number>(100000);
  const [calcPeriods, setCalcPeriods] = useState<number>(2);
  const [calcLessonsCount, setCalcLessonsCount] = useState<number>(8);

  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Simulator calculation
  const totalPerLesson = calcMode === 'PER_PERIOD' ? calcUnitPrice * calcPeriods : calcUnitPrice;
  const grandTotal = totalPerLesson * calcLessonsCount;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Cấu Hình & Quản Lý Mức Thu Học Phí</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Quy tắc tính toán học phí theo buổi hoặc theo tiết và cơ chế bảo toàn dữ liệu lịch sử
        </p>
      </div>

      {/* Historical Data Protection Banner */}
      <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-900/60 flex items-start gap-3.5 shadow-sm">
        <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 flex items-center justify-center shrink-0 mt-0.5">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="text-xs text-indigo-900 dark:text-indigo-200 leading-relaxed">
          <div className="font-bold text-sm text-indigo-950 dark:text-indigo-100">
            Nguyên Tắc Bất Biến Của Lịch Sử Tài Chính (Historical Immutability)
          </div>
          <p className="mt-1 text-indigo-800 dark:text-indigo-300">
            Khi thầy/cô điều chỉnh mức học phí của học sinh (ví dụ tăng từ 100.000đ lên 120.000đ/buổi),
            hệ thống sẽ <strong>chỉ áp dụng mức giá mới cho các buổi học phát sinh trong tương lai</strong>.
            Tất cả các phiếu học phí và các buổi học đã được xuất phiếu trước đây luôn được lưu trữ
            chính xác theo mức giá tại thời điểm lập phiếu và <strong>tuyệt đối không bao giờ bị thay đổi</strong>.
          </p>
        </div>
      </div>

      {/* Grid: 2 Pricing Modes Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Mode 1: Per Session */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-soft space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Hình Thức 1
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
              Thu theo Buổi (PER_SESSION)
            </span>
          </div>

          <h3 className="text-base font-bold text-slate-900 dark:text-white">Học Phí Tính Trọn Gói / Buổi Học</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Mỗi buổi học sẽ được tính đúng một mức giá cố định bất kể buổi học kéo dài bao nhiêu phút
            hoặc bao nhiêu tiết. Thích hợp cho gia sư dạy kèm 1-1 hoặc các lớp học theo thời lượng cố
            định (ví dụ: 100.000đ hoặc 150.000đ / buổi).
          </p>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-700 dark:text-slate-300">
            Học phí 1 buổi = <span className="font-bold text-indigo-700 dark:text-indigo-400">Giá mỗi buổi</span>
          </div>
        </div>

        {/* Mode 2: Per Period */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-soft space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Hình Thức 2
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
              Thu theo Tiết (PER_PERIOD)
            </span>
          </div>

          <h3 className="text-base font-bold text-slate-900 dark:text-white">Học Phí Nhân Với Số Tiết Dạy</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Học phí được tính theo đơn giá của 1 tiết nhân với số tiết thực tế của buổi học đó. Ví dụ:
            45.000đ/tiết, buổi học 2 tiết = 90.000đ; buổi học 3 tiết = 135.000đ. Giúp linh hoạt thay
            đổi số tiết khi dạy tăng cường.
          </p>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-700 dark:text-slate-300">
            Học phí 1 buổi = <span className="font-bold text-indigo-700 dark:text-indigo-400">Đơn giá tiết × Số tiết</span>
          </div>
        </div>
      </div>

      {/* Interactive Simulator Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-soft space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Calculator className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Công Cụ Ước Tính & Thử Nghiệm Học Phí</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Mô phỏng tính toán học phí theo các kịch bản thực tế</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2">
          {/* Mode */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Cách tính</label>
            <select
              value={calcMode}
              onChange={(e) => setCalcMode(e.target.value as any)}
              className="w-full text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100"
            >
              <option value="PER_SESSION">Theo buổi</option>
              <option value="PER_PERIOD">Theo tiết</option>
            </select>
          </div>

          {/* Unit Price */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              {calcMode === 'PER_SESSION' ? 'Đơn giá mỗi buổi (đ)' : 'Đơn giá mỗi tiết (đ)'}
            </label>
            <input
              type="number"
              step="5000"
              value={calcUnitPrice}
              onChange={(e) => setCalcUnitPrice(Number(e.target.value))}
              className="w-full text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100"
            />
          </div>

          {/* Periods if per period */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              Số tiết / buổi học
            </label>
            <input
              type="number"
              min="1"
              max="10"
              disabled={calcMode === 'PER_SESSION'}
              value={calcPeriods}
              onChange={(e) => setCalcPeriods(Number(e.target.value))}
              className="w-full text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 disabled:opacity-40"
            />
          </div>

          {/* Number of Lessons */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              Số buổi dự kiến
            </label>
            <input
              type="number"
              min="1"
              value={calcLessonsCount}
              onChange={(e) => setCalcLessonsCount(Number(e.target.value))}
              className="w-full text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100"
            />
          </div>
        </div>

        {/* Calculation Result */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <span className="text-slate-500 dark:text-slate-400">Mỗi buổi học: </span>
            <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">
              {totalPerLesson.toLocaleString('vi-VN')} đ
            </span>
            <span className="text-slate-400 ml-2">
              ({calcLessonsCount} buổi trong tháng)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-600 dark:text-slate-300 font-semibold">TỔNG HỌC PHÍ DỰ KIẾN:</span>
            <span className="text-lg font-bold text-indigo-700 dark:text-indigo-400">
              {grandTotal.toLocaleString('vi-VN')} đ
            </span>
          </div>
        </div>
      </div>

      {/* Student Rates Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-soft overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">
            Bảng Mức Thu Hiện Tại Của Từng Học Sinh ({students.length})
          </h3>
          <span className="text-xs text-slate-400">Bấm nút bút để chỉnh sửa mức thu</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-xs font-semibold uppercase text-slate-400">
                <th className="py-3 pl-4">Học sinh</th>
                <th className="py-3">Hình thức thu</th>
                <th className="py-3">Đơn giá áp dụng</th>
                <th className="py-3">Số tiết/buổi</th>
                <th className="py-3 text-right">Mức thu 1 buổi</th>
                <th className="py-3 text-right pr-4">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {students.map((student) => {
                const perLessonAmount =
                  student.tuitionMode === 'PER_PERIOD'
                    ? student.pricePerPeriod * student.periodsPerLesson
                    : student.pricePerSession;

                return (
                  <tr key={student.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 pl-4 font-bold text-slate-900 dark:text-white">{student.name}</td>
                    <td className="py-3.5">
                      <TuitionModeBadge mode={student.tuitionMode} />
                    </td>
                    <td className="py-3.5 text-xs text-slate-600 dark:text-slate-400 font-medium">
                      {student.tuitionMode === 'PER_SESSION'
                        ? `${student.pricePerSession.toLocaleString('vi-VN')} đ / buổi`
                        : `${student.pricePerPeriod.toLocaleString('vi-VN')} đ / tiết`}
                    </td>
                    <td className="py-3.5 text-xs text-slate-600 dark:text-slate-400">
                      {student.tuitionMode === 'PER_PERIOD'
                        ? `${student.periodsPerLesson} tiết`
                        : 'Mặc định'}
                    </td>
                    <td className="py-3.5 text-right font-bold text-indigo-700 dark:text-indigo-400">
                      {perLessonAmount.toLocaleString('vi-VN')} đ
                    </td>
                    <td className="py-3.5 text-right pr-4">
                      <button
                        onClick={() => {
                          setEditingStudent(student);
                          setIsEditModalOpen(true);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Chỉnh mức thu</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <StudentFormModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingStudent(null);
        }}
        studentToEdit={editingStudent}
      />
    </div>
  );
};
