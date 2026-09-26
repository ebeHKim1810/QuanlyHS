import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { AuthLayout } from './AuthLayout';
import { Mail, Lock, LogIn, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';

interface LoginPageProps {
  onNavigate: (view: 'login' | 'register' | 'verify' | 'forgot_password') => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password) {
      setErrorMessage('Vui lòng nhập đầy đủ email và mật khẩu.');
      return;
    }

    try {
      setIsLoading(true);
      const res = await login(email.trim(), password);

      if (!res.success) {
        setErrorMessage(res.error || 'Đăng nhập không thành công.');
        if (res.accountStatus === 'PENDING_VERIFICATION') {
          setTimeout(() => {
            onNavigate('verify');
          }, 1500);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fillTeacherDemo = () => {
    setEmail('trang.hoang@edu.vn');
    setPassword('Trang@123456');
    setErrorMessage(null);
  };

  const fillAdminDemo = () => {
    setEmail('admin@tuitionmanager.vn');
    setPassword('Admin@123456');
    setErrorMessage(null);
  };

  return (
    <AuthLayout
      title="Đăng Nhập Hệ Thống"
      subtitle="Quản lý học sinh, buổi học và lập phiếu học phí chuyên nghiệp"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 text-xs font-semibold text-rose-700 dark:text-rose-300 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
            <div className="flex-1">
              <span>{errorMessage}</span>
              {errorMessage.includes('chưa được xác minh') && (
                <button
                  type="button"
                  onClick={() => onNavigate('verify')}
                  className="block mt-1 underline font-bold hover:text-rose-800 dark:hover:text-rose-200"
                >
                  Bấm vào đây để nhập mã xác minh email →
                </button>
              )}
            </div>
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
            Địa chỉ Email
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="giao-vien@domain.com"
              required
              className="w-full text-sm pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Mật khẩu
            </label>
            <button
              type="button"
              onClick={() => onNavigate('forgot_password')}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Quên mật khẩu?
            </button>
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full text-sm pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 shadow-md shadow-indigo-100 dark:shadow-none transition-all disabled:opacity-50 mt-2"
        >
          <LogIn className="w-4 h-4" />
          <span>{isLoading ? 'Đang xác thực...' : 'ĐĂNG NHẬP'}</span>
        </button>
      </form>

      {/* Quick Demo Login Credentials Bar */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block text-center">
          Tài khoản dùng thử có sẵn
        </span>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={fillTeacherDemo}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-colors"
          >
            <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
              Giáo viên (Cô Trang)
            </div>
            <div className="text-[10px] text-slate-400 font-mono truncate">
              trang.hoang@edu.vn
            </div>
          </button>

          <button
            type="button"
            onClick={fillAdminDemo}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-colors"
          >
            <div className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              <span>Quản trị viên (Admin)</span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono truncate">
              admin@tuitionmanager.vn
            </div>
          </button>
        </div>
      </div>

      {/* Switch to Register */}
      <div className="text-center pt-2">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Chưa có tài khoản giáo viên?{' '}
          <button
            type="button"
            onClick={() => onNavigate('register')}
            className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
          >
            <span>Đăng ký ngay</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </p>
      </div>
    </AuthLayout>
  );
};
