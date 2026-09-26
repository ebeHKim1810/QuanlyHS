import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { AuthLayout } from './AuthLayout';
import { Mail, ArrowLeft, Send, CheckCircle2, AlertCircle } from 'lucide-react';

interface ForgotPasswordPageProps {
  onNavigate: (view: 'login' | 'reset_password') => void;
  onSetResetToken?: (token: string) => void;
}

export const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({ onNavigate, onSetResetToken }) => {
  const { forgotPassword } = useAuth();

  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim()) {
      setErrorMessage('Vui lòng nhập địa chỉ email.');
      return;
    }

    try {
      setIsLoading(true);
      const res = await forgotPassword(email.trim());
      setIsSent(true);
    } catch (err: any) {
      setErrorMessage(err.message || 'Lỗi gửi yêu cầu.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Khôi Phục Mật Khẩu"
      subtitle="Nhập email tài khoản giáo viên để nhận hướng dẫn đặt lại mật khẩu"
    >
      {isSent ? (
        <div className="space-y-4 text-center">
          <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>

          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Đã gửi hướng dẫn đặt lại mật khẩu!
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Nếu email <span className="font-semibold text-slate-700 dark:text-slate-200">{email}</span> tồn tại trong hệ thống, bạn sẽ nhận được một liên kết hoặc mã token để đặt lại mật khẩu.
            </p>
          </div>

          <div className="pt-3 space-y-2">
            <button
              type="button"
              onClick={() => onNavigate('reset_password')}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
            >
              Tôi đã có mã token đặt lại mật khẩu →
            </button>

            <button
              type="button"
              onClick={() => onNavigate('login')}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Quay lại đăng nhập
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 text-xs font-semibold text-rose-700 dark:text-rose-300 flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
              Địa chỉ Email đã đăng ký
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

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 shadow-md shadow-indigo-100 dark:shadow-none transition-all disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>{isLoading ? 'Đang gửi...' : 'GỬI YÊU CẦU ĐẶT LẠI'}</span>
          </button>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => onNavigate('login')}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 inline-flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Quay lại đăng nhập</span>
            </button>
          </div>
        </form>
      )}
    </AuthLayout>
  );
};
