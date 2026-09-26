export type TuitionMode = 'PER_SESSION' | 'PER_PERIOD';

export type AttendanceStatus = 'SCHEDULED' | 'ATTENDED' | 'ABSENT' | 'CANCELLED';

export type BillingStatus = 'UNBILLED' | 'INVOICED';

export type PaymentStatus = 'UNPAID' | 'PAID';

export type UserRole = 'TEACHER' | 'ADMIN';

export type AccountStatus = 'PENDING_VERIFICATION' | 'ACTIVE' | 'DISABLED' | 'DELETED';

export type ThemePreference = 'light' | 'dark' | 'system';

export interface UserProfile {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  phone?: string;
  role: UserRole;
  accountStatus: AccountStatus;
  emailVerifiedAt?: string | null;
  themePreference?: ThemePreference;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export type ReceiptThemeId =
  | 'soft_pink'
  | 'lavender'
  | 'mint'
  | 'baby_blue'
  | 'peach'
  | 'cream'
  | 'sage'
  | 'powder_purple';

export interface Student {
  id: string;
  teacherId?: string;
  name: string;
  phone: string;
  email?: string;
  studentCode?: string;
  notes?: string;
  tuitionMode: TuitionMode;
  pricePerSession: number;
  pricePerPeriod: number;
  periodsPerLesson: number;
  status: 'ACTIVE' | 'ARCHIVED';
  createdAt: string;
  updatedAt: string;
}

export interface RecurringSchedule {
  id: string;
  teacherId?: string;
  studentId: string;
  dayOfWeek: number; // 0 = Chủ Nhật, 1 = Thứ Hai, ..., 6 = Thứ Bảy
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  durationMinutes: number;
  periodCount: number;
  startDate?: string;
  endDate?: string;
  notes?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Lesson {
  id: string;
  teacherId?: string;
  studentId: string;
  scheduleId?: string | null;
  lessonDate: string; // YYYY-MM-DD
  startTime: string;  // HH:mm
  endTime: string;    // HH:mm
  durationMinutes: number;
  periodCount: number;
  attendanceStatus: AttendanceStatus;
  billingStatus: BillingStatus;
  tuitionMode: TuitionMode;
  unitPriceSnapshot: number;
  calculatedAmount: number;
  invoiceId?: string | null;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceItem {
  id: string;
  invoiceId: string;
  lessonId: string;
  lessonDate: string;
  startTime: string;
  endTime: string;
  periodCount: number;
  tuitionMode: TuitionMode;
  unitPrice: number;
  amount: number;
  notes?: string;
}

export type LessonDisplayMode = 'STANDARD' | 'COMPACT';

export interface Invoice {
  id: string;
  teacherId?: string;
  studentId: string;
  studentNameSnapshot: string;
  studentPhoneSnapshot: string;
  invoiceNumber: string; // e.g. HP-2026-0001
  issuedAt: string;      // YYYY-MM-DD
  subtotal: number;
  discount: number;
  totalAmount: number;
  paymentStatus: PaymentStatus;
  paymentDate?: string | null;
  receiptTheme: ReceiptThemeId;
  showComment: boolean;
  teacherComment?: string;
  tuitionModeSnapshot: TuitionMode;
  unitPriceSnapshot: number;
  periodCountSnapshot?: number;
  lessonCount: number;
  items: InvoiceItem[];
  // Lesson display mode
  lessonDisplayMode?: LessonDisplayMode; // 'STANDARD' | 'COMPACT' (default: 'STANDARD')
  // Bank information snapshot
  showBankInfo?: boolean;
  bankNameSnapshot?: string;
  bankAccountNumberSnapshot?: string;
  bankAccountHolderSnapshot?: string;
  transferNoteSnapshot?: string;
  qrImageUrlSnapshot?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TeacherSettings {
  teacherId?: string;
  teacherName: string;
  phone: string;
  email: string;
  centerName: string;
  address: string;
  logoUrl?: string;
  footerNotes: string;
  bankName?: string;
  bankAccountNumber?: string;
  bankAccountName?: string;
  transferNoteTemplate?: string;
  qrImageUrl?: string;
  currency: string;
  themePreference?: ThemePreference;
}

export interface AppDatabase {
  version: number;
  users?: UserProfile[];
  students: Student[];
  schedules: RecurringSchedule[];
  lessons: Lesson[];
  invoices: Invoice[];
  settings: TeacherSettings;
  lastUpdated: string;
}

export type ActiveNavTab =
  | 'dashboard'
  | 'students'
  | 'schedules'
  | 'attendance'
  | 'tuition'
  | 'create_invoice'
  | 'invoices'
  | 'settings'
  | 'profile'
  | 'admin_teachers';
