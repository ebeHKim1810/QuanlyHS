import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  Student,
  RecurringSchedule,
  Lesson,
  Invoice,
  TeacherSettings,
  ActiveNavTab,
  AttendanceStatus,
  PaymentStatus,
  ReceiptThemeId,
} from '../types';
import { StorageService } from '../services/storage';
import { BillingEngine } from '../services/billingEngine';
import { useAuth } from './AuthContext';
import confetti from 'canvas-confetti';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
}

interface AppContextType {
  reloadDatabase: () => Promise<void>;
  // State
  students: Student[];
  schedules: RecurringSchedule[];
  lessons: Lesson[];
  invoices: Invoice[];
  settings: TeacherSettings;
  activeTab: ActiveNavTab;
  selectedStudentId: string | null;
  previewInvoice: Invoice | null;
  selectedLessonForModal: Lesson | null;
  isLoading: boolean;
  toasts: ToastMessage[];

  // Navigation & Modal triggers
  setActiveTab: (tab: ActiveNavTab) => void;
  setSelectedStudentId: (id: string | null) => void;
  openStudentDetail: (id: string) => void;
  openInvoicePreview: (invoice: Invoice) => void;
  closeInvoicePreview: () => void;
  openLessonModal: (lesson: Lesson | null) => void;
  closeLessonModal: () => void;

  // Toast
  addToast: (title: string, message?: string, type?: ToastMessage['type']) => void;
  removeToast: (id: string) => void;

  // Student Actions
  createOrUpdateStudent: (data: Partial<Student> & { name: string; phone: string }) => Promise<Student>;
  deleteStudent: (studentId: string) => Promise<void>;

  // Schedule & Lesson Actions
  createRecurringSchedule: (
    data: Omit<RecurringSchedule, 'id' | 'createdAt'>,
    weeksToGenerate?: number
  ) => Promise<RecurringSchedule>;
  deleteRecurringSchedule: (scheduleId: string) => Promise<void>;
  createOrUpdateLesson: (data: Partial<Lesson> & { studentId: string; lessonDate: string; startTime: string; endTime: string }) => Promise<Lesson>;
  deleteLesson: (lessonId: string) => Promise<void>;
  setLessonAttendance: (lessonId: string, status: AttendanceStatus, notes?: string) => Promise<void>;

  // Invoicing Actions
  issueInvoice: (params: {
    studentId: string;
    selectedLessonIds: string[];
    theme: ReceiptThemeId;
    showComment: boolean;
    teacherComment: string;
    discount?: number;
    paymentStatus?: PaymentStatus;
    lessonDisplayMode?: 'STANDARD' | 'COMPACT';
    showBankInfo?: boolean;
    bankNameSnapshot?: string;
    bankAccountNumberSnapshot?: string;
    bankAccountHolderSnapshot?: string;
    transferNoteSnapshot?: string;
    qrImageUrlSnapshot?: string;
  }) => Promise<Invoice>;
  updateInvoicePayment: (invoiceId: string, paymentStatus: PaymentStatus) => Promise<void>;
  deleteOrVoidInvoice: (invoiceId: string) => Promise<void>;

  // Settings & DB Actions
  saveSettings: (newSettings: TeacherSettings) => Promise<void>;
  resetToDemoData: () => Promise<void>;
  clearAllData: () => Promise<void>;
  importDatabaseJson: (jsonStr: string) => Promise<void>;
  exportDatabaseJson: () => Promise<string>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [schedules, setSchedules] = useState<RecurringSchedule[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [settings, setSettings] = useState<TeacherSettings>({} as TeacherSettings);

  const [activeTab, setActiveTab] = useState<ActiveNavTab>('dashboard');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);
  const [selectedLessonForModal, setSelectedLessonForModal] = useState<Lesson | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const { user, token } = useAuth();

  // Reload database on auth state change or mount
  const reloadDatabase = async () => {
    try {
      setIsLoading(true);
      StorageService.clearCache();
      const db = await StorageService.loadDatabase();
      setStudents(db.students || []);
      setSchedules(db.schedules || []);
      setLessons(db.lessons || []);
      setInvoices(db.invoices || []);
      setSettings(db.settings || ({} as TeacherSettings));
    } catch (err) {
      console.error('Initialization error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    reloadDatabase();
  }, [token]);

  // Helper to persist current state
  const persistState = async (
    newStudents: Student[],
    newSchedules: RecurringSchedule[],
    newLessons: Lesson[],
    newInvoices: Invoice[],
    newSettings: TeacherSettings
  ) => {
    await StorageService.saveDatabase({
      version: 1,
      students: newStudents,
      schedules: newSchedules,
      lessons: newLessons,
      invoices: newInvoices,
      settings: newSettings,
      lastUpdated: new Date().toISOString(),
    });
  };

  // Toast notifications
  const addToast = (title: string, message?: string, type: ToastMessage['type'] = 'success') => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`;
    setToasts((prev) => [...prev, { id, title, message, type }]);

    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Navigation helpers
  const openStudentDetail = (id: string) => {
    setSelectedStudentId(id);
    setActiveTab('students');
  };

  const openInvoicePreview = (invoice: Invoice) => {
    setPreviewInvoice(invoice);
  };

  const closeInvoicePreview = () => {
    setPreviewInvoice(null);
  };

  const openLessonModal = (lesson: Lesson | null) => {
    setSelectedLessonForModal(lesson);
  };

  const closeLessonModal = () => {
    setSelectedLessonForModal(null);
  };

  // Student CRUD
  const createOrUpdateStudent = async (data: Partial<Student> & { name: string; phone: string }): Promise<Student> => {
    let updatedList: Student[];
    let targetStudent: Student;

    if (data.id) {
      // Edit
      const existing = students.find((s) => s.id === data.id);
      if (!existing) throw new Error('Không tìm thấy học sinh cần cập nhật!');

      targetStudent = {
        ...existing,
        ...data,
        updatedAt: new Date().toISOString(),
      };
      updatedList = students.map((s) => (s.id === data.id ? targetStudent : s));
      addToast('Cập nhật thành công', `Đã lưu thông tin học sinh ${targetStudent.name}`, 'success');
    } else {
      // Create new
      const newId = `std_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      targetStudent = {
        id: newId,
        teacherId: user?.id,
        name: data.name.trim(),
        phone: data.phone.trim(),
        email: data.email?.trim() || '',
        studentCode: data.studentCode?.trim() || `HS-${new Date().getFullYear()}-${(students.length + 1).toString().padStart(3, '0')}`,
        notes: data.notes?.trim() || '',
        tuitionMode: data.tuitionMode || 'PER_SESSION',
        pricePerSession: data.pricePerSession ?? 100000,
        pricePerPeriod: data.pricePerPeriod ?? 50000,
        periodsPerLesson: data.periodsPerLesson ?? 2,
        status: data.status || 'ACTIVE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      updatedList = [...students, targetStudent];
      addToast('Thêm học sinh mới', `Đã thêm ${targetStudent.name} vào hệ thống`, 'success');
    }

    setStudents(updatedList);
    await persistState(updatedList, schedules, lessons, invoices, settings);
    return targetStudent;
  };

  const deleteStudent = async (studentId: string): Promise<void> => {
    const student = students.find((s) => s.id === studentId);
    if (!student) return;

    // Check if student has invoices
    const studentInvoices = invoices.filter((inv) => inv.studentId === studentId);
    if (studentInvoices.length > 0) {
      const confirmText = window.confirm(
        `Học sinh ${student.name} đã có ${studentInvoices.length} phiếu học phí trong lịch sử tài chính.\n\nBạn có chắc chắn muốn xóa học sinh này cùng toàn bộ dữ liệu liên quan không?`
      );
      if (!confirmText) return;
    }

    const updatedStudents = students.filter((s) => s.id !== studentId);
    const updatedSchedules = schedules.filter((sch) => sch.studentId !== studentId);
    const updatedLessons = lessons.filter((l) => l.studentId !== studentId);
    const updatedInvoices = invoices.filter((inv) => inv.studentId !== studentId);

    setStudents(updatedStudents);
    setSchedules(updatedSchedules);
    setLessons(updatedLessons);
    setInvoices(updatedInvoices);

    if (selectedStudentId === studentId) {
      setSelectedStudentId(null);
    }

    await persistState(updatedStudents, updatedSchedules, updatedLessons, updatedInvoices, settings);
    addToast('Đã xóa học sinh', `Đã xóa học sinh ${student.name} khỏi danh sách`, 'info');
  };

  // Schedule & Lessons
  const createRecurringSchedule = async (
    data: Omit<RecurringSchedule, 'id' | 'createdAt'>,
    weeksToGenerate: number = 4
  ): Promise<RecurringSchedule> => {
    const newScheduleId = `sch_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newSchedule: RecurringSchedule = {
      ...data,
      id: newScheduleId,
      teacherId: user?.id,
      createdAt: new Date().toISOString(),
    };

    const updatedSchedules = [...schedules, newSchedule];
    setSchedules(updatedSchedules);

    // Automatically generate upcoming lesson occurrences for the specified weeks
    const student = students.find((s) => s.id === data.studentId);
    const newGeneratedLessons: Lesson[] = [];

    if (student && weeksToGenerate > 0) {
      const today = new Date();
      // Generate lessons for the next N weeks matching dayOfWeek
      for (let w = 0; w < weeksToGenerate; w++) {
        for (let d = 0; d < 7; d++) {
          const checkDate = new Date(today);
          checkDate.setDate(today.getDate() + w * 7 + d);

          if (checkDate.getDay() === data.dayOfWeek) {
            const dateStr = checkDate.toISOString().split('T')[0];

            // Check if lesson already exists for this student on this date and time
            const exists = lessons.some(
              (l) => l.studentId === student.id && l.lessonDate === dateStr && l.startTime === data.startTime
            );

            if (!exists) {
              const { unitPrice, totalAmount } = BillingEngine.calculateLessonTuition(student, data.periodCount);
              newGeneratedLessons.push({
                id: `ls_${Date.now()}_${Math.random().toString(36).substring(2, 6)}_${w}_${d}`,
                teacherId: user?.id,
                studentId: student.id,
                scheduleId: newScheduleId,
                lessonDate: dateStr,
                startTime: data.startTime,
                endTime: data.endTime,
                durationMinutes: data.durationMinutes || 90,
                periodCount: data.periodCount || 2,
                attendanceStatus: 'SCHEDULED',
                billingStatus: 'UNBILLED',
                tuitionMode: student.tuitionMode,
                unitPriceSnapshot: unitPrice,
                calculatedAmount: totalAmount,
                invoiceId: null,
                notes: data.notes || '',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              });
            }
          }
        }
      }
    }

    const updatedLessons = [...lessons, ...newGeneratedLessons];
    setLessons(updatedLessons);

    await persistState(students, updatedSchedules, updatedLessons, invoices, settings);
    addToast(
      'Tạo lịch học thành công',
      `Đã tạo lịch học định kỳ và tự động sinh ${newGeneratedLessons.length} buổi học sắp tới`,
      'success'
    );

    return newSchedule;
  };

  const deleteRecurringSchedule = async (scheduleId: string): Promise<void> => {
    const updatedSchedules = schedules.filter((s) => s.id !== scheduleId);
    setSchedules(updatedSchedules);
    await persistState(students, updatedSchedules, lessons, invoices, settings);
    addToast('Đã xóa lịch học', 'Đã hủy lịch học định kỳ', 'info');
  };

  const createOrUpdateLesson = async (
    data: Partial<Lesson> & { studentId: string; lessonDate: string; startTime: string; endTime: string }
  ): Promise<Lesson> => {
    const student = students.find((s) => s.id === data.studentId);
    if (!student) throw new Error('Không tìm thấy học sinh!');

    let targetLesson: Lesson;
    let updatedLessons: Lesson[];

    const periodCount = data.periodCount ?? student.periodsPerLesson ?? 2;
    const { unitPrice, totalAmount } = BillingEngine.calculateLessonTuition(student, periodCount);

    if (data.id) {
      const existing = lessons.find((l) => l.id === data.id);
      if (!existing) throw new Error('Không tìm thấy buổi học cần sửa!');

      if (existing.billingStatus === 'INVOICED') {
        const confirmChange = window.confirm(
          'CẢNH BÁO: Buổi học này đã được tính trong phiếu học phí! Việc sửa đổi có thể làm sai lệch lịch sử tài chính. Bạn có chắc chắn muốn cập nhật không?'
        );
        if (!confirmChange) return existing;
      }

      targetLesson = {
        ...existing,
        ...data,
        periodCount,
        unitPriceSnapshot: existing.billingStatus === 'INVOICED' ? existing.unitPriceSnapshot : unitPrice,
        calculatedAmount: existing.billingStatus === 'INVOICED' ? existing.calculatedAmount : totalAmount,
        updatedAt: new Date().toISOString(),
      };
      updatedLessons = lessons.map((l) => (l.id === data.id ? targetLesson : l));
      addToast('Cập nhật buổi học', `Đã lưu buổi học ngày ${targetLesson.lessonDate}`, 'success');
    } else {
      targetLesson = {
        id: `ls_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        teacherId: user?.id,
        studentId: data.studentId,
        scheduleId: data.scheduleId || null,
        lessonDate: data.lessonDate,
        startTime: data.startTime,
        endTime: data.endTime,
        durationMinutes: data.durationMinutes || 90,
        periodCount,
        attendanceStatus: data.attendanceStatus || 'SCHEDULED',
        billingStatus: 'UNBILLED',
        tuitionMode: student.tuitionMode,
        unitPriceSnapshot: unitPrice,
        calculatedAmount: totalAmount,
        invoiceId: null,
        notes: data.notes || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      updatedLessons = [...lessons, targetLesson];
      addToast('Thêm buổi học', `Đã thêm buổi học ngày ${targetLesson.lessonDate}`, 'success');
    }

    setLessons(updatedLessons);
    await persistState(students, schedules, updatedLessons, invoices, settings);
    return targetLesson;
  };

  const deleteLesson = async (lessonId: string): Promise<void> => {
    const lesson = lessons.find((l) => l.id === lessonId);
    if (!lesson) return;

    if (lesson.billingStatus === 'INVOICED') {
      const confirmDelete = window.confirm(
        'CẢNH BÁO: Buổi học này đã được tính trong phiếu học phí! Thao tác này có thể ảnh hưởng đến lịch sử tài chính.\n\nBạn có chắc chắn muốn xóa không?'
      );
      if (!confirmDelete) return;
    }

    const updatedLessons = lessons.filter((l) => l.id !== lessonId);
    setLessons(updatedLessons);
    await persistState(students, schedules, updatedLessons, invoices, settings);
    addToast('Đã xóa buổi học', `Đã xóa buổi học ngày ${lesson.lessonDate}`, 'info');
  };

  const setLessonAttendance = async (
    lessonId: string,
    status: AttendanceStatus,
    notes?: string
  ): Promise<void> => {
    const lesson = lessons.find((l) => l.id === lessonId);
    if (!lesson) return;

    if (lesson.billingStatus === 'INVOICED') {
      const confirmChange = window.confirm(
        'CẢNH BÁO: Buổi học này đã được tính trong phiếu học phí và đã chốt tiền! Việc đổi điểm danh sẽ ảnh hưởng tới số liệu đối chiếu.\n\nBạn có muốn tiếp tục?'
      );
      if (!confirmChange) return;
    }

    const student = students.find((s) => s.id === lesson.studentId);
    let calculatedAmount = lesson.calculatedAmount;
    if (student) {
      if (status === 'ATTENDED') {
        const { totalAmount } = BillingEngine.calculateLessonTuition(student, lesson.periodCount);
        calculatedAmount = totalAmount;
      } else {
        calculatedAmount = 0;
      }
    }

    const updatedLessons = lessons.map((l) => {
      if (l.id === lessonId) {
        return {
          ...l,
          attendanceStatus: status,
          calculatedAmount,
          notes: notes !== undefined ? notes : l.notes,
          updatedAt: new Date().toISOString(),
        };
      }
      return l;
    });

    setLessons(updatedLessons);
    await persistState(students, schedules, updatedLessons, invoices, settings);

    const studentName = student?.name || 'Học sinh';
    const statusLabels: Record<AttendanceStatus, string> = {
      ATTENDED: 'Đã điểm danh: Có học (Đủ điều kiện tính phí)',
      ABSENT: 'Đã đánh dấu: Vắng (Không tính phí)',
      CANCELLED: 'Đã đánh dấu: Hủy buổi học',
      SCHEDULED: 'Đã chuyển về: Chưa điểm danh',
    };

    addToast(studentName, statusLabels[status], status === 'ATTENDED' ? 'success' : 'info');
  };

  // Invoicing
  const issueInvoice = async (params: {
    studentId: string;
    selectedLessonIds: string[];
    theme: ReceiptThemeId;
    showComment: boolean;
    teacherComment: string;
    discount?: number;
    paymentStatus?: PaymentStatus;
    lessonDisplayMode?: 'STANDARD' | 'COMPACT';
    showBankInfo?: boolean;
    bankNameSnapshot?: string;
    bankAccountNumberSnapshot?: string;
    bankAccountHolderSnapshot?: string;
    transferNoteSnapshot?: string;
    qrImageUrlSnapshot?: string;
  }): Promise<Invoice> => {
    const student = students.find((s) => s.id === params.studentId);
    if (!student) throw new Error('Không tìm thấy học sinh!');

    const selectedLessons = lessons.filter((l) => params.selectedLessonIds.includes(l.id));

    // Execute atomic invoice creation via BillingEngine
    const { invoice, updatedLessons } = BillingEngine.createInvoice({
      student,
      selectedLessons,
      allLessons: lessons,
      existingInvoices: invoices,
      theme: params.theme,
      showComment: params.showComment,
      teacherComment: params.teacherComment,
      discount: params.discount || 0,
      paymentStatus: params.paymentStatus || 'UNPAID',
      lessonDisplayMode: params.lessonDisplayMode || 'STANDARD',
      showBankInfo: params.showBankInfo ?? false,
      bankNameSnapshot: params.bankNameSnapshot || '',
      bankAccountNumberSnapshot: params.bankAccountNumberSnapshot || '',
      bankAccountHolderSnapshot: params.bankAccountHolderSnapshot || '',
      transferNoteSnapshot: params.transferNoteSnapshot || '',
      qrImageUrlSnapshot: params.qrImageUrlSnapshot || '',
    });

    invoice.teacherId = user?.id;
    const updatedInvoices = [invoice, ...invoices];

    setLessons(updatedLessons);
    setInvoices(updatedInvoices);
    await persistState(students, schedules, updatedLessons, updatedInvoices, settings);

    // Trigger celebratory confetti effect
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f43f5e', '#8b5cf6', '#0ea5e9', '#10b981', '#f59e0b'],
      });
    } catch {
      // Ignored in headless testing
    }

    addToast(
      'Xuất phiếu học phí thành công!',
      `Đã tạo phiếu ${invoice.invoiceNumber} cho ${student.name} (${invoice.totalAmount.toLocaleString('vi-VN')} đ)`,
      'success'
    );

    return invoice;
  };

  const updateInvoicePayment = async (invoiceId: string, paymentStatus: PaymentStatus): Promise<void> => {
    const invoice = invoices.find((inv) => inv.id === invoiceId);
    if (!invoice) return;

    const todayStr = new Date().toISOString().split('T')[0];
    const updatedInvoices = invoices.map((inv) => {
      if (inv.id === invoiceId) {
        return {
          ...inv,
          paymentStatus,
          paymentDate: paymentStatus === 'PAID' ? todayStr : null,
          updatedAt: new Date().toISOString(),
        };
      }
      return inv;
    });

    setInvoices(updatedInvoices);
    if (previewInvoice && previewInvoice.id === invoiceId) {
      setPreviewInvoice({
        ...previewInvoice,
        paymentStatus,
        paymentDate: paymentStatus === 'PAID' ? todayStr : null,
      });
    }

    await persistState(students, schedules, lessons, updatedInvoices, settings);
    addToast(
      'Cập nhật thanh toán',
      `Phiếu ${invoice.invoiceNumber}: ${paymentStatus === 'PAID' ? 'ĐÃ THANH TOÁN' : 'CHƯA THANH TOÁN'}`,
      'success'
    );
  };

  const deleteOrVoidInvoice = async (invoiceId: string): Promise<void> => {
    const invoice = invoices.find((inv) => inv.id === invoiceId);
    if (!invoice) return;

    const confirmVoid = window.confirm(
      `Bạn có chắc chắn muốn xóa/hủy phiếu ${invoice.invoiceNumber} không?\n\nToàn bộ ${invoice.lessonCount} buổi học trong phiếu này sẽ tự động được MỞ KHÓA trở lại trạng thái CHƯA TÍNH PHÍ để có thể lập phiếu mới.`
    );
    if (!confirmVoid) return;

    const { updatedInvoices, updatedLessons } = BillingEngine.voidInvoice(invoiceId, invoices, lessons);

    setInvoices(updatedInvoices);
    setLessons(updatedLessons);
    if (previewInvoice?.id === invoiceId) {
      setPreviewInvoice(null);
    }

    await persistState(students, schedules, updatedLessons, updatedInvoices, settings);
    addToast(
      'Đã hủy phiếu học phí',
      `Đã hủy phiếu ${invoice.invoiceNumber} và mở khóa ${invoice.lessonCount} buổi học`,
      'info'
    );
  };

  // Settings & DB Management
  const saveSettings = async (newSettings: TeacherSettings): Promise<void> => {
    setSettings(newSettings);
    await persistState(students, schedules, lessons, invoices, newSettings);
    addToast('Lưu cài đặt', 'Đã lưu thông tin giáo viên và cấu hình hệ thống', 'success');
  };

  const resetToDemoData = async (): Promise<void> => {
    const confirmReset = window.confirm(
      'Khôi phục dữ liệu mẫu sẽ đưa hệ thống về bộ dữ liệu kiểm thử chuẩn (Nguyễn Minh Anh, Trần Gia Huy, Lê Hoàng Nam và kịch bản đối chiếu học phí). Bạn có chắc chắn muốn khôi phục?'
    );
    if (!confirmReset) return;

    const demoDb = await StorageService.resetToDemo();
    setStudents(demoDb.students);
    setSchedules(demoDb.schedules);
    setLessons(demoDb.lessons);
    setInvoices(demoDb.invoices);
    setSettings(demoDb.settings);
    setSelectedStudentId(null);
    setPreviewInvoice(null);
    setActiveTab('dashboard');

    addToast('Khôi phục dữ liệu mẫu', 'Đã nạp lại dữ liệu mẫu kiểm thử thành công', 'success');
  };

  const clearAllData = async (): Promise<void> => {
    const confirmClear = window.confirm(
      'CẢNH BÁO NGUY HIỂM: Thao tác này sẽ XÓA TOÀN BỘ học sinh, lịch học, điểm danh và phiếu học phí trong cơ sở dữ liệu. Bạn có chắc chắn không?'
    );
    if (!confirmClear) return;

    const cleanDb = await StorageService.clearAllData();
    setStudents(cleanDb.students);
    setSchedules(cleanDb.schedules);
    setLessons(cleanDb.lessons);
    setInvoices(cleanDb.invoices);
    setSelectedStudentId(null);
    setPreviewInvoice(null);
    setActiveTab('dashboard');

    addToast('Đã xóa dữ liệu', 'Cơ sở dữ liệu đã được làm trống', 'info');
  };

  const importDatabaseJson = async (jsonStr: string): Promise<void> => {
    const db = await StorageService.importDataFromJSON(jsonStr);
    setStudents(db.students);
    setSchedules(db.schedules);
    setLessons(db.lessons);
    setInvoices(db.invoices);
    setSettings(db.settings);
    setSelectedStudentId(null);
    setPreviewInvoice(null);
    addToast('Nhập dữ liệu thành công', 'Đã phục hồi cơ sở dữ liệu từ file sao lưu', 'success');
  };

  const exportDatabaseJson = async (): Promise<string> => {
    return await StorageService.exportDataAsJSON();
  };

  return (
    <AppContext.Provider
      value={{
        students,
        schedules,
        lessons,
        invoices,
        settings,
        activeTab,
        selectedStudentId,
        previewInvoice,
        selectedLessonForModal,
        isLoading,
        toasts,
        reloadDatabase,
        setActiveTab,
        setSelectedStudentId,
        openStudentDetail,
        openInvoicePreview,
        closeInvoicePreview,
        openLessonModal,
        closeLessonModal,
        addToast,
        removeToast,
        createOrUpdateStudent,
        deleteStudent,
        createRecurringSchedule,
        deleteRecurringSchedule,
        createOrUpdateLesson,
        deleteLesson,
        setLessonAttendance,
        issueInvoice,
        updateInvoicePayment,
        deleteOrVoidInvoice,
        saveSettings,
        resetToDemoData,
        clearAllData,
        importDatabaseJson,
        exportDatabaseJson,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
