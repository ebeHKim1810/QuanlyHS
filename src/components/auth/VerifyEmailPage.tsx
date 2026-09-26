import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { AuthLayout } from './AuthLayout';
import { Mail, CheckCircle2, AlertCircle, ArrowLeft, RefreshCw, KeyRound } from 'lucide-react';

interface VerifyEmailPageProps {
  onNavigate: (view: 'login' | 'register' | 'verify') => void;
}

export const VerifyEmailPage: React.FC<VerifyEmailPageProps> = ({ onNavigate }) => {
  const { pendingEmailForVerification, verifyEmail, resendVerification } = useAuth();

  const [email, setEmail] = useState(pendingEmailForVerification || '');
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState<number>(0);

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const interval = setInterval(() => {
      setCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!code.trim()) {
      setErrorMessage('Vui lòng nhập mã xác minh 6 chữ số.');
      return;
    }

    try {
      setIsLoading(true);
      const res = await verifyEmail({
        email: email.trim(),
        code: code.trim(),
      });

      if (!res.success) {
        setErrorMessage(res.error || 'Mã xác minh không chính xác hoặc đã hết hạn.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || isResending) return;
    if (!email.trim()) {
      setErrorMessage('Vui lòng nhập địa chỉ email để gửi lại mã.');
      return;
    }

    try {
      setIsResending(true);
      setErrorMessage(null);
      const res = await resendVerification(email.trim());

      if (res.success) {
        setSuccessMessage('Mã xác minh mới đã được gửi đến email của bạn.');
        setCooldown(60);
      } else {
        setErrorMessage(res.error || 'Không thể gửi lại mã.');
      }
    } finally {
      setIsResending(false);
    }
  };

  return (
    <AuthLayout
      title="Xác Minh Tài Khoản"
      subtitle="Kích hoạt tài khoản giáo viên để bắt đầu sử dụng hệ thống"
    >
      <div className="space-y-4">
        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 text-xs font-semibold text-rose-700 dark:text-rose-300 flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900/60 text-xs font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
            <span>{successMessage}</span>
          </div>
        )}

        <div className="p-3.5 bg-indigo-50/70 dark:bg-indigo-950/40 rounded-2xl border border-indigo-100 dark:border-indigo-900/40 text-xs text-indigo-900 dark:text-indigo-300 space-y-1">
          <p className="font-bold flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5" />
            <span>Email đã nhận mã xác minh:</span>
          </p>
          <p className="font-mono text-indigo-700 dark:text-indigo-400 font-semibold truncate">
            {email || 'Chưa cung cấp email'}
          </p>
        </div>

        <form onSubmit={handleVerify} className="space-y-4">
          {!pendingEmailForVerification && (
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Email tài khoản
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="giao-vien@domain.com"
                required
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block text-center">
              Nhập mã xác minh (6 chữ số)
            </label>
            <div className="relative">
              <input
                type="text"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                placeholder="••••••"
                required
                className="w-full text-2xl font-mono tracking-widest text-center py-3 rounded-2xl border-2 border-indigo-200 dark:border-indigo-800 bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-400 font-bold focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10"
              />
            </div>
            <p className="text-[11px] text-slate-400 text-center">
              Vui lòng kiểm tra hộp thư đến (hoặc hòm thư Spam) của email
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading || code.length < 6}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 shadow-md shadow-indigo-100 dark:shadow-none transition-all disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isLoading ? 'Đang kích hoạt...' : 'KÍCH HOẠT TÀI KHOẢN'}</span>
          </button>
        </form>

        {/* Resend Code Section with Cooldown */}
        <div className="pt-2 text-center border-t border-slate-100 dark:border-slate-800">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Không nhận được mã xác minh?{' '}
            <button
              type="button"
              onClick={handleResend}
              disabled={cooldown > 0 || isResending}
              className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline disabled:opacity-40 disabled:pointer-events-none inline-flex items-center gap-1"
            >
              <RefreshCw className={`w-3 h-3 ${isResending ? 'animate-spin' : ''}`} />
              <span>
                {cooldown > 0 ? `Gửi lại sau ${cooldown}s` : 'Gửi lại email xác minh'}
              </span>
            </button>
          </p>
        </div>

        {/* Back to Login */}
        <div className="text-center pt-1">
          <button
            type="button"
            onClick={() => onNavigate('login')}
            className="text-xs font-semibold text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 inline-flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Quay lại trang đăng nhập</span>
          </button>
        </div>
      </div>
    </AuthLayout>
  );
};
