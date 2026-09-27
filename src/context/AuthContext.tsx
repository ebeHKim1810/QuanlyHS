import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserProfile } from '../types';
import { apiRequest } from '../services/apiClient';

export interface RegisterFormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  pendingEmailForVerification: string | null;
  setPendingEmailForVerification: (email: string | null) => void;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; accountStatus?: string }>;
  register: (data: RegisterFormData) => Promise<{ success: boolean; error?: string; message?: string; verificationCode?: string }>;
  verifyEmail: (params: { email?: string; code?: string; token?: string }) => Promise<{ success: boolean; error?: string }>;
  resendVerification: (email: string) => Promise<{ success: boolean; error?: string; message?: string }>;
  forgotPassword: (email: string) => Promise<{ success: boolean; error?: string; message?: string }>;
  resetPassword: (token: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (data: Partial<UserProfile> & { centerName?: string; address?: string; bankName?: string; bankAccountNumber?: string; bankAccountName?: string; footerNotes?: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AUTH_TOKEN_KEY = 'TUITION_AUTH_TOKEN_V2';
const PENDING_EMAIL_KEY = 'TUITION_PENDING_VERIFY_EMAIL';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem(AUTH_TOKEN_KEY);
    } catch {
      return null;
    }
  });

  const [pendingEmailForVerification, setPendingEmailState] = useState<string | null>(() => {
    try {
      return localStorage.getItem(PENDING_EMAIL_KEY);
    } catch {
      return null;
    }
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);

  const setPendingEmailForVerification = (email: string | null) => {
    setPendingEmailState(email);
    if (email) {
      localStorage.setItem(PENDING_EMAIL_KEY, email);
    } else {
      localStorage.removeItem(PENDING_EMAIL_KEY);
    }
  };

  // Restore session on mount
  useEffect(() => {
    async function checkAuth() {
      const storedToken = localStorage.getItem(AUTH_TOKEN_KEY);
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await apiRequest('/api/auth/me', {
          token: storedToken,
        });

        if (res.ok && res.data?.user) {
          setUser(res.data.user);
          setToken(storedToken);
        } else {
          localStorage.removeItem(AUTH_TOKEN_KEY);
          setToken(null);
          setUser(null);
        }
      } catch (err) {
        console.error('Failed to verify session token:', err);
      } finally {
        setIsLoading(false);
      }
    }

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await apiRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      const resData = res.data;
      if (!res.ok || !resData?.success) {
        const accountStatus = resData?.accountStatus;
        if (accountStatus === 'PENDING_VERIFICATION') {
          setPendingEmailForVerification(resData?.email || email);
        }
        return {
          success: false,
          error: res.error || resData?.error || 'Email hoặc mật khẩu không đúng.',
          accountStatus,
        };
      }

      setToken(resData.token);
      setUser(resData.user);
      localStorage.setItem(AUTH_TOKEN_KEY, resData.token);
      setPendingEmailForVerification(null);
      return { success: true };
    } catch (err: any) {
      return {
        success: false,
        error: 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra máy chủ API hoặc cấu hình triển khai.',
      };
    }
  };

  const register = async (data: RegisterFormData) => {
    try {
      const res = await apiRequest('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      const resData = res.data;
      if (!res.ok || !resData?.success) {
        return {
          success: false,
          error: res.error || resData?.error || 'Đăng ký thất bại.',
        };
      }

      setPendingEmailForVerification(resData.email || data.email);
      return {
        success: true,
        message: resData.message,
        verificationCode: resData.verificationCode,
      };
    } catch (err: any) {
      return {
        success: false,
        error: 'Lỗi đăng ký: ' + (err?.message || 'Không thể kết nối đến máy chủ.'),
      };
    }
  };

  const verifyEmail = async (params: { email?: string; code?: string; token?: string }) => {
    try {
      const res = await apiRequest('/api/auth/verify', {
        method: 'POST',
        body: JSON.stringify(params),
      });

      const resData = res.data;
      if (!res.ok || !resData?.success) {
        return {
          success: false,
          error: res.error || resData?.error || 'Mã xác minh không chính xác hoặc đã hết hạn.',
        };
      }

      setToken(resData.token);
      setUser(resData.user);
      localStorage.setItem(AUTH_TOKEN_KEY, resData.token);
      setPendingEmailForVerification(null);
      return { success: true };
    } catch (err: any) {
      return {
        success: false,
        error: 'Lỗi xác minh: ' + (err?.message || 'Không thể kết nối đến máy chủ.'),
      };
    }
  };

  const resendVerification = async (email: string) => {
    try {
      const res = await apiRequest('/api/auth/resend-verification', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });

      const resData = res.data;
      if (!res.ok || !resData?.success) {
        return {
          success: false,
          error: res.error || resData?.error || 'Không thể gửi lại mã xác minh.',
        };
      }

      return { success: true, message: resData.message };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Không thể kết nối đến máy chủ.' };
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      const res = await apiRequest('/api/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });

      const resData = res.data;
      return {
        success: res.ok,
        message: resData?.message || res.message || 'Nếu email tồn tại trong hệ thống, hướng dẫn đặt lại mật khẩu đã được gửi đến bạn.',
        error: !res.ok ? res.error : undefined,
      };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Không thể kết nối đến máy chủ.' };
    }
  };

  const resetPassword = async (resetToken: string, newPassword: string) => {
    try {
      const res = await apiRequest('/api/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token: resetToken, newPassword }),
      });

      const resData = res.data;
      if (!res.ok || !resData?.success) {
        return {
          success: false,
          error: res.error || resData?.error || 'Đặt lại mật khẩu thất bại.',
        };
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Không thể kết nối đến máy chủ.' };
    }
  };

  const updateProfile = async (updateData: Partial<UserProfile> & { centerName?: string; address?: string; bankName?: string; bankAccountNumber?: string; bankAccountName?: string; footerNotes?: string }) => {
    if (!token) return { success: false, error: 'Chưa đăng nhập.' };

    try {
      const res = await apiRequest('/api/auth/update-profile', {
        method: 'POST',
        token,
        body: JSON.stringify(updateData),
      });

      const resData = res.data;
      if (!res.ok || !resData?.success) {
        return {
          success: false,
          error: res.error || resData?.error || 'Cập nhật thất bại.',
        };
      }

      setUser(resData.user);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Không thể kết nối đến máy chủ.' };
    }
  };

  const logout = async () => {
    if (token) {
      try {
        await apiRequest('/api/auth/logout', {
          method: 'POST',
          token,
        });
      } catch {
        // Ignore
      }
    }
    localStorage.removeItem(AUTH_TOKEN_KEY);
    setToken(null);
    setUser(null);
  };

  const isAuthenticated = Boolean(user && user.accountStatus === 'ACTIVE');
  const isAdmin = Boolean(user && user.role === 'ADMIN');

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated,
        isAdmin,
        pendingEmailForVerification,
        setPendingEmailForVerification,
        login,
        register,
        verifyEmail,
        resendVerification,
        forgotPassword,
        resetPassword,
        updateProfile,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};
