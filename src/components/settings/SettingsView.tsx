import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { TeacherSettings } from '../../types';
import {
  User,
  Phone,
  Mail,
  Building,
  MapPin,
  CreditCard,
  Upload,
  Trash2,
  Save,
  CheckCircle2,
  QrCode,
  Download,
  Palette,
  Sun,
  Moon,
  Monitor,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const {
    settings,
    saveSettings,
    exportDatabaseJson,
    importDatabaseJson,
    addToast,
  } = useApp();

  const { user, updateProfile, isAdmin } = useAuth();
  const { theme, setTheme } = useTheme();

  const [formData, setFormData] = useState<TeacherSettings>({
    ...settings,
    teacherName: user?.fullName || settings?.teacherName || '',
    email: user?.email || settings?.email || '',
    phone: user?.phone || settings?.phone || '',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isSavingPayment, setIsSavingPayment] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const qrInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (settings) {
      setFormData((prev) => ({
        ...prev,
        ...settings,
        teacherName: user?.fullName || settings.teacherName || prev.teacherName,
        email: user?.email || settings.email || prev.email,
        phone: user?.phone || settings.phone || prev.phone,
        transferNoteTemplate: settings.transferNoteTemplate || prev.transferNoteTemplate || 'Học phí {studentName}',
        qrImageUrl: settings.qrImageUrl || prev.qrImageUrl || '',
      }));
    }
  }, [settings, user]);

  const handleChange = (field: keyof TeacherSettings, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleQrUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert('Định dạng ảnh không hợp lệ! Vui lòng chọn tệp PNG, JPG, JPEG hoặc WebP.');
      if (qrInputRef.current) qrInputRef.current.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Kích thước ảnh quá lớn! Vui lòng chọn ảnh dung lượng dưới 5MB.');
      if (qrInputRef.current) qrInputRef.current.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setFormData((prev) => ({ ...prev, qrImageUrl: dataUrl }));
      addToast('Tải ảnh QR thành công', 'Ảnh mã QR đã được tải lên và sẵn sàng lưu.', 'info');
      if (qrInputRef.current) qrInputRef.current.value = '';
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveQr = () => {
    setFormData((prev) => ({ ...prev, qrImageUrl: '' }));
    if (qrInputRef.current) qrInputRef.current.value = '';
    addToast('Đã gỡ ảnh QR', 'Đã xóa ảnh mã QR khỏi cài đặt.', 'info');
  };

  const handleSavePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSavingPayment(true);
      await saveSettings(formData);
      if (updateProfile) {
        await updateProfile({
          bankName: formData.bankName,
          bankAccountNumber: formData.bankAccountNumber,
          bankAccountName: formData.bankAccountName,
        });
      }
      addToast('Lưu thông tin thanh toán', 'Đã lưu tài khoản ngân hàng và mã QR thành công!', 'success');
    } catch (err: any) {
      addToast('Lỗi lưu thông tin', err.message, 'error');
    } finally {
      setIsSavingPayment(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      await saveSettings(formData);

      // Also update auth profile
      if (updateProfile) {
        await updateProfile({
          fullName: formData.teacherName,
          phone: formData.phone,
          email: formData.email,
          centerName: formData.centerName,
          address: formData.address,
          bankName: formData.bankName,
          bankAccountNumber: formData.bankAccountNumber,
          bankAccountName: formData.bankAccountName,
          footerNotes: formData.footerNotes,
          themePreference: theme,
        });
      }

      addToast('Lưu thành công', 'Đã cập nhật hồ sơ và thông tin phiếu thu', 'success');
    } catch (err: any) {
      addToast('Lỗi lưu cài đặt', err.message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Export JSON Backup
  const handleExportBackup = async () => {
    try {
      const jsonStr = await exportDatabaseJson();
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `TuitionManager_Backup_${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
      addToast('Sao lưu thành công', 'Đã tải xuống tệp dữ liệu JSON', 'success');
    } catch (err: any) {
      alert('Không thể xuất dữ liệu: ' + err.message);
    }
  };

  // Import JSON Backup
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const text = event.target?.result as string;
        try {
          await importDatabaseJson(text);
          if (fileInputRef.current) fileInputRef.current.value = '';
        } catch (err: any) {
          alert(err.message || 'Lỗi khi nhập dữ liệu');
        }
      };
      reader.readAsText(file);
    } catch (err: any) {
      alert('Lỗi đọc tệp: ' + err.message);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Top Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Cài Đặt & Hồ Sơ Giáo Viên</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Quản lý thông tin hiển thị trên phiếu thu học phí, thông tin chuyển khoản, giao diện và dữ liệu
        </p>
      </div>

      {/* Account Info Card */}
      {user && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-soft flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center font-bold text-base shadow-xs">
              {user.fullName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  {user.fullName}
                </h3>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    isAdmin
                      ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                      : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                  }`}
                >
                  {isAdmin ? 'Quản trị viên' : 'Giáo viên'}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Tài khoản đã xác minh</span>
            </span>
          </div>
        </div>
      )}

      {/* Appearance Settings Section */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-soft space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Palette className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>Giao Diện & Chế Độ Màu Ứng Dụng</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Lựa chọn chế độ sáng, tối hoặc tự động đồng bộ theo hệ điều hành của bạn
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => setTheme('light')}
            className={`flex items-center gap-3 p-3.5 rounded-2xl border text-left transition-all ${
              theme === 'light'
                ? 'border-amber-500 bg-amber-50/60 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 ring-2 ring-amber-500/20 shadow-xs'
                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
            }`}
          >
            <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Sun className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold">Chế độ Sáng (Light)</div>
              <div className="text-[11px] text-slate-400">Giao diện tươi sáng</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setTheme('dark')}
            className={`flex items-center gap-3 p-3.5 rounded-2xl border text-left transition-all ${
              theme === 'dark'
                ? 'border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 ring-2 ring-indigo-500/20 shadow-xs'
                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
            }`}
          >
            <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <Moon className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold">Chế độ Tối (Dark)</div>
              <div className="text-[11px] text-slate-400">Dịu mắt ban đêm</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setTheme('system')}
            className={`flex items-center gap-3 p-3.5 rounded-2xl border text-left transition-all ${
              theme === 'system'
                ? 'border-slate-800 dark:border-slate-400 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white ring-2 ring-slate-400/20 shadow-xs'
                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
            }`}
          >
            <div className="w-9 h-9 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0">
              <Monitor className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold">Theo hệ thống (Mặc định)</div>
              <div className="text-[11px] text-slate-400">Tự động theo OS</div>
            </div>
          </button>
        </div>
      </div>

      {/* Teacher Profile & Receipt Settings Form */}
      <form onSubmit={handleSave} className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-soft space-y-6">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <User className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>Thông Tin Giáo Viên & Phiếu Thu</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Thông tin này sẽ được in trên tiêu đề của mỗi phiếu học phí gửi cho phụ huynh
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Teacher Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Họ và tên giáo viên <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={formData.teacherName || ''}
                onChange={(e) => handleChange('teacherName', e.target.value)}
                placeholder="Cô Hoàng Thảo Trang"
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                required
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Số điện thoại / Zalo liên hệ <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={formData.phone || ''}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="0905 888 999"
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Email tài khoản
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                value={formData.email || ''}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="giaovien@edu.vn"
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          {/* Center Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Tên trung tâm / Lớp học
            </label>
            <div className="relative">
              <Building className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={formData.centerName || ''}
                onChange={(e) => handleChange('centerName', e.target.value)}
                placeholder="Lớp Học Bồi Dưỡng Toán & Kỹ Năng"
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          {/* Address */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Địa chỉ lớp dạy
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={formData.address || ''}
                onChange={(e) => handleChange('address', e.target.value)}
                placeholder="45 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh"
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          {/* Footer Text */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Lời cảm ơn / Ghi chú chân phiếu thu
            </label>
            <textarea
              rows={2}
              value={formData.footerNotes || ''}
              onChange={(e) => handleChange('footerNotes', e.target.value)}
              placeholder="Cảm ơn Quý phụ huynh đã tin tưởng và đồng hành cùng sự tiến bộ của các con!"
              className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
        </div>

        {/* SECTION: Thông tin nhận thanh toán */}
        <div className="pt-5 border-t border-slate-100 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Thông Tin Nhận Thanh Toán
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Cài đặt tài khoản ngân hàng và mã QR của giáo viên để in lên phiếu học phí khi bật thanh toán
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSavePayment}
              disabled={isSavingPayment}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 shadow-sm transition-all disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSavingPayment ? 'Đang lưu...' : 'Lưu thông tin thanh toán'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Tên ngân hàng
              </label>
              <input
                type="text"
                value={formData.bankName || ''}
                onChange={(e) => handleChange('bankName', e.target.value)}
                placeholder="MB Bank, Vietcombank, Techcombank..."
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Số tài khoản nhận học phí
              </label>
              <input
                type="text"
                value={formData.bankAccountNumber || ''}
                onChange={(e) => handleChange('bankAccountNumber', e.target.value)}
                placeholder="0123456789"
                className="w-full text-xs font-mono font-bold px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Tên chủ tài khoản
              </label>
              <input
                type="text"
                value={formData.bankAccountName || ''}
                onChange={(e) => handleChange('bankAccountName', e.target.value)}
                placeholder="NGUYEN VAN A"
                className="w-full text-xs uppercase px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Nội dung chuyển khoản mặc định
              </label>
              <input
                type="text"
                value={formData.transferNoteTemplate || ''}
                onChange={(e) => handleChange('transferNoteTemplate', e.target.value)}
                placeholder="Học phí {studentName}"
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Gợi ý: Dùng <code className="text-indigo-600 dark:text-indigo-400 font-mono">{"{studentName}"}</code> để hệ thống tự điền tên học sinh trên từng phiếu thu.
              </span>
            </div>
          </div>

          {/* QR Code Upload & Preview */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <QrCode className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Ảnh mã QR</span>
            </label>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3">
              Tải lên ảnh mã QR chuyển khoản của ngân hàng bạn để in lên phiếu thu (Hỗ trợ PNG, JPG, JPEG, WebP - Tối đa 5MB)
            </p>

            <input
              type="file"
              ref={qrInputRef}
              onChange={handleQrUpload}
              accept="image/png,image/jpeg,image/jpg,image/webp"
              className="hidden"
            />

            {formData.qrImageUrl ? (
              <div className="flex flex-wrap items-center gap-4 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                <div className="p-2 bg-white rounded-xl border border-slate-200 shadow-2xs">
                  <img
                    src={formData.qrImageUrl}
                    alt="Xem trước mã QR"
                    className="w-28 h-28 object-contain rounded-lg"
                  />
                </div>
                <div className="space-y-2">
                  <div className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Đã tải lên ảnh mã QR thành công</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Ảnh này sẽ tự động xuất hiện trên phiếu khi bạn bật "Hiển thị thông tin ngân hàng".
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => qrInputRef.current?.click()}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 shadow-2xs"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Đổi ảnh khác</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveQr}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 hover:bg-rose-100"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Xóa ảnh QR</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <button
                  type="button"
                  onClick={() => qrInputRef.current?.click()}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border-2 border-dashed border-slate-300 dark:border-slate-600 transition-colors shadow-2xs"
                >
                  <Upload className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>Tải ảnh mã QR lên</span>
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 shadow-md shadow-indigo-100 dark:shadow-none transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Đang lưu...' : 'Lưu Toàn Bộ Cài Đặt'}</span>
          </button>
        </div>
      </form>

      {/* Database Backup & Maintenance Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-soft space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Download className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>Sao Lưu & Quản Lý Dữ Liệu</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Xuất file sao lưu JSON an toàn hoặc khôi phục dữ liệu đã lưu từ máy tính
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            type="button"
            onClick={handleExportBackup}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors shadow-2xs"
          >
            <Download className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Tải file sao lưu JSON</span>
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors shadow-2xs"
          >
            <Upload className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Khôi phục từ file JSON</span>
          </button>
        </div>
      </div>
    </div>
  );
};
