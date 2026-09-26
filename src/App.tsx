import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { MobileNav } from './components/layout/MobileNav';
import { ToastContainer } from './components/common/ToastContainer';
import { DashboardView } from './components/dashboard/DashboardView';
import { StudentListView } from './components/students/StudentListView';
import { CalendarView } from './components/calendar/CalendarView';
import { AttendanceView } from './components/attendance/AttendanceView';
import { TuitionPlansView } from './components/tuition/TuitionPlansView';
import { InvoiceBuilderView } from './components/invoices/InvoiceBuilderView';
import { InvoiceHistoryView } from './components/invoices/InvoiceHistoryView';
import { SettingsView } from './components/settings/SettingsView';
import { AdminTeachersView } from './components/admin/AdminTeachersView';
import { ReceiptPreviewModal } from './components/invoices/ReceiptPreviewModal';
import { LessonModal } from './components/calendar/LessonModal';

// Auth Pages
import { LoginPage } from './components/auth/LoginPage';
import { RegisterPage } from './components/auth/RegisterPage';
import { VerifyEmailPage } from './components/auth/VerifyEmailPage';
import { ForgotPasswordPage } from './components/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './components/auth/ResetPasswordPage';
import { BookOpenCheck } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { activeTab, previewInvoice, closeInvoicePreview, selectedLessonForModal, closeLessonModal } =
    useApp();
  const { isAdmin } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 antialiased font-sans transition-colors">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        {/* Top Header */}
        <Header onOpenMobileMenu={() => setIsMobileMenuOpen(true)} />

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'dashboard' && <DashboardView />}
            {activeTab === 'students' && <StudentListView />}
            {activeTab === 'schedules' && <CalendarView />}
            {activeTab === 'attendance' && <AttendanceView />}
            {activeTab === 'tuition' && <TuitionPlansView />}
            {activeTab === 'create_invoice' && <InvoiceBuilderView />}
            {activeTab === 'invoices' && <InvoiceHistoryView />}
            {activeTab === 'settings' && <SettingsView />}
            {activeTab === 'admin_teachers' && isAdmin && <AdminTeachersView />}
          </div>
        </main>
      </div>

      {/* Mobile Drawer & Bottom Navigation */}
      <MobileNav
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Global Modals */}
      <ReceiptPreviewModal
        invoice={previewInvoice}
        isOpen={Boolean(previewInvoice)}
        onClose={closeInvoicePreview}
      />

      <LessonModal
        lesson={selectedLessonForModal}
        isOpen={Boolean(selectedLessonForModal)}
        onClose={closeLessonModal}
      />

      {/* Animated Toast Alerts */}
      <ToastContainer />
    </div>
  );
};

const AuthOrApp: React.FC = () => {
  const { isAuthenticated, isLoading, pendingEmailForVerification } = useAuth();
  const [authView, setAuthView] = useState<'login' | 'register' | 'verify' | 'forgot_password' | 'reset_password'>('login');
  const [resetToken, setResetToken] = useState<string>('');

  if (isLoading) {
    return (
      <div className="min-h-screen w-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white">
        <div className="w-14 h-14 rounded-3xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-xl shadow-indigo-200 dark:shadow-none animate-bounce mb-4">
          <BookOpenCheck className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-black tracking-tight font-display">Tuition Manager</h2>
        <p className="text-xs text-slate-400 mt-1">Đang khởi tạo hệ thống...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (authView === 'register') {
      return <RegisterPage onNavigate={(v) => setAuthView(v)} />;
    }
    if (authView === 'verify' || pendingEmailForVerification) {
      return <VerifyEmailPage onNavigate={(v) => setAuthView(v)} />;
    }
    if (authView === 'forgot_password') {
      return (
        <ForgotPasswordPage
          onNavigate={(v) => setAuthView(v)}
          onSetResetToken={(token) => {
            setResetToken(token);
            setAuthView('reset_password');
          }}
        />
      );
    }
    if (authView === 'reset_password') {
      return (
        <ResetPasswordPage
          initialToken={resetToken}
          onNavigate={(v) => setAuthView(v)}
        />
      );
    }
    return <LoginPage onNavigate={(v) => setAuthView(v)} />;
  }

  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
};

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AuthOrApp />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
