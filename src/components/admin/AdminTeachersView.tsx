import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { apiRequest } from '../../services/apiClient';
import {
  ShieldAlert,
  Search,
  Filter,
  Lock,
  Unlock,
  Trash2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  UserCheck,
  RefreshCw,
  Users,
  Receipt,
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { format, parseISO } from 'date-fns';

interface AdminTeacherRecord {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  phone?: string;
  role: 'TEACHER' | 'ADMIN';
  accountStatus: 'PENDING_VERIFICATION' | 'ACTIVE' | 'DISABLED' | 'DELETED';
  emailVerifiedAt?: string | null;
  createdAt: string;
  studentCount: number;
  invoiceCount: number;
}

export const AdminTeachersView: React.FC = () => {
  const { token, user, isAdmin } = useAuth();
  const { addToast } = useApp();

  const [teachers, setTeachers] = useState<AdminTeacherRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Confirmation Modals
  const [confirmModalData, setConfirmModalData] = useState<{
    teacher: AdminTeacherRecord;
    action: 'LOCK' | 'UNLOCK' | 'DELETE';
  } | null>(null);

  const fetchTeachers = async () => {
    if (!token) return;
    try {
      setIsLoading(true);
      const res = await apiRequest<{ teachers: AdminTeacherRecord[] }>('/api/admin/teachers', {
        token,
      });

      if (res.ok && res.data) {
        setTeachers(res.data.teachers || []);
      } else {
        addToast('Lỗi tải danh sách giáo viên', res.error || 'Không thể lấy dữ liệu quản trị', 'error');
      }
    } catch (err: any) {
      addToast('Lỗi kết nối', err?.message || 'Không thể kết nối đến máy chủ', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, [token]);

  // Handle Lock / Unlock
  const handleToggleStatus = async (teacher: AdminTeacherRecord) => {
    const nextStatus = teacher.accountStatus === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
    try {
      const res = await apiRequest('/api/admin/teachers/status', {
        method: 'POST',
        token,
        body: JSON.stringify({ teacherId: teacher.id, status: nextStatus }),
      });

      if (res.ok) {
        addToast(
          nextStatus === 'DISABLED' ? 'Đã khóa tài khoản' : 'Đã mở khóa tài khoản',
          `Giáo viên ${teacher.fullName} hiện ${nextStatus === 'DISABLED' ? 'đã bị khóa' : 'đang hoạt động'}`,
          'success'
        );
        fetchTeachers();
      } else {
        addToast('Lỗi cập nhật', res.error || 'Không thể cập nhật trạng thái', 'error');
      }
    } finally {
      setConfirmModalData(null);
    }
  };

  // Handle Safe Soft Delete
  const handleDeleteTeacher = async (teacher: AdminTeacherRecord) => {
    try {
      const res = await apiRequest('/api/admin/teachers/delete', {
        method: 'POST',
        token,
        body: JSON.stringify({ teacherId: teacher.id }),
      });

      if (res.ok) {
        addToast('Đã xóa giáo viên (Soft Delete)', `Đã chuyển tài khoản ${teacher.fullName} sang trạng thái ĐÃ XÓA. Lịch sử tài chính được bảo toàn nguyên vẹn.`, 'info');
        fetchTeachers();
      } else {
        addToast('Lỗi xóa giáo viên', res.error || 'Không thể thực hiện thao tác xóa', 'error');
      }
    } finally {
      setConfirmModalData(null);
    }
  };

  if (!isAdmin) {
    return (
      <div className="p-8 text-center bg-rose-50 dark:bg-rose-950/40 rounded-3xl border border-rose-200 dark:border-rose-900/60 max-w-lg mx-auto">
        <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-rose-800 dark:text-rose-200">
          Quyền truy cập bị từ chối
        </h3>
        <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">
          Chỉ có tài khoản Quản trị viên (Admin) mới có quyền truy cập trang quản lý này.
        </p>
      </div>
    );
  }

  // Filtered teachers
  const filteredTeachers = teachers.filter((t) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      t.fullName.toLowerCase().includes(q) ||
      t.email.toLowerCase().includes(q) ||
      (t.phone && t.phone.includes(q));

    const matchesStatus = statusFilter === 'ALL' || t.accountStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const activeCount = teachers.filter((t) => t.accountStatus === 'ACTIVE').length;
  const pendingCount = teachers.filter((t) => t.accountStatus === 'PENDING_VERIFICATION').length;
  const disabledCount = teachers.filter((t) => t.accountStatus === 'DISABLED').length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <span>Quản Trị Hệ Thống: Quản Lý Giáo Viên</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Xem danh sách tài khoản, trạng thái xác minh và quản trị quyền truy cập của các giáo viên
          </p>
        </div>

        <button
          onClick={fetchTeachers}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-2xs self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Làm mới danh sách</span>
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Tổng giáo viên
          </span>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {teachers.length}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft">
          <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
            Đang hoạt động
          </span>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            {activeCount}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft">
          <span className="text-[11px] font-semibold text-amber-500 uppercase tracking-wider block">
            Chờ xác minh
          </span>
          <div className="text-2xl font-bold text-amber-500 mt-1">
            {pendingCount}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft">
          <span className="text-[11px] font-semibold text-rose-500 uppercase tracking-wider block">
            Đã khóa / Xóa
          </span>
          <div className="text-2xl font-bold text-rose-500 mt-1">
            {disabledCount}
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-soft flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên giáo viên, email, SĐT..."
            className="w-full text-xs pl-9.5 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="ACTIVE">Đang hoạt động</option>
            <option value="PENDING_VERIFICATION">Chờ xác minh</option>
            <option value="DISABLED">Đã khóa</option>
            <option value="DELETED">Đã xóa</option>
          </select>
        </div>
      </div>

      {/* Teachers Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 pl-6">Giáo viên</th>
                <th className="py-3.5 px-4">Email</th>
                <th className="py-3.5 px-4">Số học sinh</th>
                <th className="py-3.5 px-4">Phiếu đã xuất</th>
                <th className="py-3.5 px-4">Trạng thái</th>
                <th className="py-3.5 px-4">Ngày đăng ký</th>
                <th className="py-3.5 pr-6 text-right">Thao tác</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredTeachers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Không tìm thấy giáo viên nào phù hợp.
                  </td>
                </tr>
              ) : (
                filteredTeachers.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 pl-6">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {t.fullName}
                      </div>
                      {t.phone && (
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                          {t.phone}
                        </div>
                      )}
                    </td>

                    <td className="py-4 px-4 font-mono text-slate-600 dark:text-slate-300">
                      {t.email}
                    </td>

                    <td className="py-4 px-4">
                      <span className="inline-flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        <span>{t.studentCount} HS</span>
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      <span className="inline-flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                        <Receipt className="w-3.5 h-3.5 text-slate-400" />
                        <span>{t.invoiceCount} phiếu</span>
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      {t.accountStatus === 'ACTIVE' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Đang hoạt động</span>
                        </span>
                      )}
                      {t.accountStatus === 'PENDING_VERIFICATION' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                          <Clock className="w-3 h-3" />
                          <span>Chờ xác minh</span>
                        </span>
                      )}
                      {t.accountStatus === 'DISABLED' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                          <Lock className="w-3 h-3" />
                          <span>Đã khóa</span>
                        </span>
                      )}
                      {t.accountStatus === 'DELETED' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700">
                          <span>Đã xóa</span>
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-4 text-slate-500 dark:text-slate-400 text-[11px]">
                      {format(parseISO(t.createdAt), 'dd/MM/yyyy')}
                    </td>

                    <td className="py-4 pr-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {t.accountStatus !== 'DELETED' && (
                          <button
                            onClick={() =>
                              setConfirmModalData({
                                teacher: t,
                                action: t.accountStatus === 'ACTIVE' ? 'LOCK' : 'UNLOCK',
                              })
                            }
                            className={`p-1.5 rounded-lg border transition-colors ${
                              t.accountStatus === 'ACTIVE'
                                ? 'text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/50 border-amber-200 dark:border-amber-800'
                                : 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800'
                            }`}
                            title={t.accountStatus === 'ACTIVE' ? 'Khóa tài khoản' : 'Mở khóa'}
                          >
                            {t.accountStatus === 'ACTIVE' ? (
                              <Lock className="w-3.5 h-3.5" />
                            ) : (
                              <Unlock className="w-3.5 h-3.5" />
                            )}
                          </button>
                        )}

                        {t.accountStatus !== 'DELETED' && (
                          <button
                            onClick={() =>
                              setConfirmModalData({ teacher: t, action: 'DELETE' })
                            }
                            className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 transition-colors"
                            title="Xóa giáo viên (Bảo toàn lịch sử tài chính)"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmModalData && (
        <Modal
          isOpen={Boolean(confirmModalData)}
          onClose={() => setConfirmModalData(null)}
          title={
            confirmModalData.action === 'DELETE'
              ? 'Xác nhận xóa tài khoản giáo viên'
              : confirmModalData.action === 'LOCK'
              ? 'Xác nhận khóa tài khoản'
              : 'Xác nhận mở khóa tài khoản'
          }
          maxWidth="md"
        >
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-900 dark:text-amber-200">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold">
                  {confirmModalData.action === 'DELETE'
                    ? `Bạn có chắc muốn xóa giáo viên "${confirmModalData.teacher.fullName}"?`
                    : confirmModalData.action === 'LOCK'
                    ? `Bạn có chắc muốn khóa tài khoản của "${confirmModalData.teacher.fullName}"?`
                    : `Mở khóa và cho phép "${confirmModalData.teacher.fullName}" tiếp tục truy cập?`}
                </p>
                <p className="text-[11px] leading-relaxed">
                  {confirmModalData.action === 'DELETE'
                    ? 'Thao tác này sẽ khóa đăng nhập và ẩn giáo viên khỏi hệ thống (Soft Delete). Toàn bộ dữ liệu phiếu học phí, học sinh và lịch sử tài chính sẽ được bảo lưu an toàn để tránh mất mát dữ liệu kế toán.'
                    : confirmModalData.action === 'LOCK'
                    ? 'Giáo viên sẽ không thể đăng nhập hoặc chỉnh sửa dữ liệu học phí cho đến khi được mở khóa.'
                    : 'Giáo viên sẽ có thể đăng nhập bình thường và truy cập các lớp học của mình.'}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmModalData(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Hủy bỏ
              </button>

              <button
                type="button"
                onClick={() => {
                  if (confirmModalData.action === 'DELETE') {
                    handleDeleteTeacher(confirmModalData.teacher);
                  } else {
                    handleToggleStatus(confirmModalData.teacher);
                  }
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold text-white transition-all shadow-xs ${
                  confirmModalData.action === 'DELETE'
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : confirmModalData.action === 'LOCK'
                    ? 'bg-amber-600 hover:bg-amber-700'
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {confirmModalData.action === 'DELETE'
                  ? 'Đồng ý Xóa giáo viên'
                  : confirmModalData.action === 'LOCK'
                  ? 'Đồng ý Khóa tài khoản'
                  : 'Đồng ý Mở khóa'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
