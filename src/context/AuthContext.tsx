import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserProfile, ThemePreference } from '../types';

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
        const res = await fetch('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${storedToken}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          if (data && data.user) {
            setUser(data.user);
            setToken(storedToken);
          } else {
            localStorage.removeItem(AUTH_TOKEN_KEY);
            setToken(null);
            setUser(null);
          }
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
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        if (data.accountStatus === 'PENDING_VERIFICATION') {
          setPendingEmailForVerification(data.email || email);
        }
        return {
          success: false,
          error: data.error || 'Email hoặc mật khẩu không đúng.',
          accountStatus: data.accountStatus,
        };
      }

      setToken(data.token);
      setUser(data.user);
      localStorage.setItem(AUTH_TOKEN_KEY, data.token);
      setPendingEmailForVerification(null);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: 'Không thể kết nối đến máy chủ: ' + err.message };
    }
  };

  const register = async (data: RegisterFormData) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const resData = await res.json();
      if (!res.ok || !resData.success) {
        return {
          success: false,
          error: resData.error || 'Đăng ký thất bại.',
        };
      }

      setPendingEmailForVerification(resData.email || data.email);
      return {
        success: true,
        message: resData.message,
        verificationCode: resData.verificationCode,
      };
    } catch (err: any) {
      return { success: false, error: 'Lỗi đăng ký: ' + err.message };
    }
  };

  const verifyEmail = async (params: { email?: string; code?: string; token?: string }) => {
    try {
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        return {
          success: false,
          error: data.error || 'Mã xác minh không chính xác hoặc đã hết hạn.',
        };
      }

      setToken(data.token);
      setUser(data.user);
      localStorage.setItem(AUTH_TOKEN_KEY, data.token);
      setPendingEmailForVerification(null);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: 'Lỗi xác minh: ' + err.message };
    }
  };

  const resendVerification = async (email: string) => {
    try {
      const res = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Không thể gửi lại mã xác minh.' };
      }

      return { success: true, message: data.message };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      return { success: true, message: data.message };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const resetPassword = async (token: string, newPassword: string) => {
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Đặt lại mật khẩu thất bại.' };
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const updateProfile = async (updateData: Partial<UserProfile> & { centerName?: string; address?: string; bankName?: string; bankAccountNumber?: string; bankAccountName?: string; footerNotes?: string }) => {
    if (!token) return { success: false, error: 'Chưa đăng nhập.' };

    try {
      const res = await fetch('/api/auth/update-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Cập nhật thất bại.' };
      }

      setUser(data.user);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const logout = async () => {
    if (token) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
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
