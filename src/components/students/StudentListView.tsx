import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Student, TuitionMode } from '../../types';
import {
  UserPlus,
  Search,
  Filter,
  Phone,
  Mail,
  Receipt,
  MoreVertical,
  Edit2,
  Trash2,
  Eye,
  Calendar,
  AlertCircle,
  Coins,
} from 'lucide-react';
import { TuitionModeBadge } from '../common/Badge';
import { StudentFormModal } from './StudentFormModal';
import { StudentDetailView } from './StudentDetailView';
import { ScheduleModal } from '../schedules/ScheduleModal';
import { EmptyState } from '../common/EmptyState';

export const StudentListView: React.FC = () => {
  const { students, lessons, selectedStudentId, setSelectedStudentId, openStudentDetail, setActiveTab } =
    useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [tuitionFilter, setTuitionFilter] = useState<'ALL' | TuitionMode>('ALL');
  const [onlyUnbilled, setOnlyUnbilled] = useState(false);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [targetStudentForSchedule, setTargetStudentForSchedule] = useState<Student | null>(null);

  // If a student is currently selected, show their detailed view
  if (selectedStudentId) {
    const selectedStudent = students.find((s) => s.id === selectedStudentId);
    if (selectedStudent) {
      return (
        <>
          <StudentDetailView
            student={selectedStudent}
            onBack={() => setSelectedStudentId(null)}
            onEdit={(student) => {
              setEditingStudent(student);
              setIsFormModalOpen(true);
            }}
            onAddSchedule={() => {
              setTargetStudentForSchedule(selectedStudent);
              setIsScheduleModalOpen(true);
            }}
          />

          <StudentFormModal
            isOpen={isFormModalOpen}
            onClose={() => {
              setIsFormModalOpen(false);
              setEditingStudent(null);
            }}
            studentToEdit={editingStudent}
          />

          <ScheduleModal
            isOpen={isScheduleModalOpen}
            onClose={() => {
              setIsScheduleModalOpen(false);
              setTargetStudentForSchedule(null);
            }}
            preselectedStudentId={selectedStudent.id}
          />
        </>
      );
    }
  }

  // Calculate unbilled stats per student
  const studentStats = students.map((student) => {
    const studentLessons = lessons.filter((l) => l.studentId === student.id);
    const unbilledLessons = studentLessons.filter(
      (l) => l.attendanceStatus === 'ATTENDED' && l.billingStatus === 'UNBILLED'
    );
    const unbilledTotal = unbilledLessons.reduce((sum, l) => sum + (l.calculatedAmount || 0), 0);

    return {
      student,
      unbilledCount: unbilledLessons.length,
      unbilledTotal,
      totalLessons: studentLessons.length,
    };
  });

  // Filter students based on search and selected filters
  const filteredList = studentStats.filter(({ student, unbilledCount }) => {
    const q = searchQuery.toLowerCase().trim();
    const matchQuery =
      !q ||
      student.name.toLowerCase().includes(q) ||
      student.phone.toLowerCase().includes(q) ||
      (student.studentCode && student.studentCode.toLowerCase().includes(q)) ||
      (student.email && student.email.toLowerCase().includes(q));

    const matchTuition = tuitionFilter === 'ALL' || student.tuitionMode === tuitionFilter;
    const matchUnbilled = !onlyUnbilled || unbilledCount > 0;

    return matchQuery && matchTuition && matchUnbilled;
  });

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Danh Sách Học Sinh</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Tổng cộng {students.length} học sinh đang theo học
          </p>
        </div>

        <button
          onClick={() => {
            setEditingStudent(null);
            setIsFormModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-sm shadow-indigo-100 dark:shadow-none transition-all shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>Thêm học sinh mới</span>
        </button>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-soft flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên học sinh, số điện thoại, mã HS..."
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Tuition Mode Filter */}
          <select
            value={tuitionFilter}
            onChange={(e) => setTuitionFilter(e.target.value as any)}
            className="text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="ALL">Mọi hình thức thu</option>
            <option value="PER_SESSION">Thu theo buổi</option>
            <option value="PER_PERIOD">Thu theo tiết</option>
          </select>

          {/* Toggle only unbilled */}
          <button
            type="button"
            onClick={() => setOnlyUnbilled(!onlyUnbilled)}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
              onlyUnbilled
                ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border-amber-300 dark:border-amber-800 font-semibold'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-750'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>Chờ xuất phiếu</span>
          </button>
        </div>
      </div>

      {/* Students Grid */}
      {filteredList.length === 0 ? (
        <EmptyState
          icon={Search}
          title="Không tìm thấy học sinh nào"
          description="Thử tìm kiếm với từ khóa khác hoặc xóa bộ lọc để hiển thị toàn bộ danh sách."
          actionText="Thêm học sinh mới"
          onAction={() => {
            setSearchQuery('');
            setTuitionFilter('ALL');
            setOnlyUnbilled(false);
            setIsFormModalOpen(true);
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredList.map(({ student, unbilledCount, unbilledTotal }) => (
            <div
              key={student.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-soft hover:shadow-soft-lg hover:border-indigo-100 dark:hover:border-indigo-900/50 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header: Name, Code & Badge */}
                <div className="flex items-start justify-between gap-2">
                  <div
                    onClick={() => openStudentDetail(student.id)}
                    className="cursor-pointer group"
                  >
                    <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {student.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <TuitionModeBadge mode={student.tuitionMode} />
                      {student.studentCode && (
                        <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                          {student.studentCode}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingStudent(student);
                        setIsFormModalOpen(true);
                      }}
                      className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Sửa học sinh"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Contact info */}
                <div className="mt-3.5 space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <a href={`tel:${student.phone}`} className="hover:text-indigo-600 dark:hover:text-indigo-400">
                      {student.phone}
                    </a>
                  </div>
                  {student.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{student.email}</span>
                    </div>
                  )}
                </div>

                {/* Pricing info */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">Mức học phí:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {student.tuitionMode === 'PER_SESSION'
                      ? `${student.pricePerSession.toLocaleString('vi-VN')} đ / buổi`
                      : `${student.pricePerPeriod.toLocaleString('vi-VN')} đ / tiết`}
                  </span>
                </div>

                {/* Unbilled banner if any */}
                {unbilledCount > 0 ? (
                  <div className="mt-3 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/60 flex items-center justify-between text-xs">
                    <div className="text-amber-800 dark:text-amber-300">
                      <span className="font-bold">{unbilledCount} buổi</span> chưa xuất phiếu
                    </div>
                    <div className="font-bold text-amber-900 dark:text-amber-200">
                      {unbilledTotal.toLocaleString('vi-VN')} đ
                    </div>
                  </div>
                ) : (
                  <div className="mt-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
                    <span>Đã chốt toàn bộ học phí</span>
                    <span>0 đ</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                <button
                  onClick={() => openStudentDetail(student.id)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 rounded-xl border border-slate-200/80 dark:border-slate-700 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Chi tiết</span>
                </button>

                <button
                  onClick={() => {
                    setTargetStudentForSchedule(student);
                    setIsScheduleModalOpen(true);
                  }}
                  className="inline-flex items-center justify-center p-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 rounded-xl border border-slate-200/80 dark:border-slate-700 transition-colors"
                  title="Thêm lịch học"
                >
                  <Calendar className="w-4 h-4" />
                </button>

                {unbilledCount > 0 && (
                  <button
                    onClick={() => setActiveTab('create_invoice')}
                    className="inline-flex items-center justify-center gap-1 py-2 px-3 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors"
                    title="Xuất phiếu ngay"
                  >
                    <Receipt className="w-3.5 h-3.5" />
                    <span>Lập phiếu</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      <StudentFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingStudent(null);
        }}
        studentToEdit={editingStudent}
      />

      <ScheduleModal
        isOpen={isScheduleModalOpen}
        onClose={() => {
          setIsScheduleModalOpen(false);
          setTargetStudentForSchedule(null);
        }}
        preselectedStudentId={targetStudentForSchedule?.id}
      />
    </div>
  );
};
