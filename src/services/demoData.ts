import { AppDatabase, Student, RecurringSchedule, Lesson, Invoice, TeacherSettings } from '../types';

export const INITIAL_SETTINGS: TeacherSettings = {
  teacherName: 'Cô Hoàng Thảo Trang',
  phone: '0905 888 999',
  email: 'trang.hoang@edu.vn',
  centerName: 'Lớp Bồi Dưỡng Toán & Kỹ Năng',
  address: '45 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh',
  footerNotes: 'Cảm ơn Quý phụ huynh đã tin tưởng và đồng hành cùng sự tiến bộ của các con!',
  bankName: 'MB Bank (Quân Đội)',
  bankAccountNumber: '0905888999',
  bankAccountName: 'HOANG THAO TRANG',
  transferNoteTemplate: 'Học phí {studentName}',
  qrImageUrl: '',
  currency: 'VND',
};

export function getDemoDatabase(): AppDatabase {
  // Student 1: Nguyễn Minh Anh (Required Business Scenario)
  const student1Id = 'std_minh_anh_01';
  const student1: Student = {
    id: student1Id,
    name: 'Nguyễn Minh Anh',
    phone: '0901 234 567',
    email: 'minhanh.nguyen@gmail.com',
    studentCode: 'HS-2026-001',
    notes: 'Học sinh năng động, tiếp thu bài nhanh, cần rèn thêm bài tập nâng cao.',
    tuitionMode: 'PER_SESSION',
    pricePerSession: 100000,
    pricePerPeriod: 50000,
    periodsPerLesson: 2,
    status: 'ACTIVE',
    createdAt: '2026-08-25T08:00:00.000Z',
    updatedAt: '2026-08-25T08:00:00.000Z',
  };

  // Student 2: Trần Gia Huy (Per Period: 40k/tiết x 2 tiết = 80k/buổi)
  const student2Id = 'std_gia_huy_02';
  const student2: Student = {
    id: student2Id,
    name: 'Trần Gia Huy',
    phone: '0912 345 678',
    email: 'giahuy.tran@gmail.com',
    studentCode: 'HS-2026-002',
    notes: 'Học theo tiết (2 tiết/buổi). Chăm chỉ, chuẩn bị bài tốt.',
    tuitionMode: 'PER_PERIOD',
    pricePerSession: 90000,
    pricePerPeriod: 45000,
    periodsPerLesson: 2,
    status: 'ACTIVE',
    createdAt: '2026-08-26T08:00:00.000Z',
    updatedAt: '2026-08-26T08:00:00.000Z',
  };

  // Student 3: Lê Hoàng Nam (Per Session: 150k/buổi)
  const student3Id = 'std_hoang_nam_03';
  const student3: Student = {
    id: student3Id,
    name: 'Lê Hoàng Nam',
    phone: '0988 765 432',
    email: 'hoangnam.le@gmail.com',
    studentCode: 'HS-2026-003',
    notes: 'Lớp ôn thi chọn chuyên. Lịch học Thứ 7 & CN.',
    tuitionMode: 'PER_SESSION',
    pricePerSession: 150000,
    pricePerPeriod: 75000,
    periodsPerLesson: 2,
    status: 'ACTIVE',
    createdAt: '2026-08-27T08:00:00.000Z',
    updatedAt: '2026-08-27T08:00:00.000Z',
  };

  // Recurring Schedules
  const schedule1: RecurringSchedule = {
    id: 'sch_minh_anh_mon',
    studentId: student1Id,
    dayOfWeek: 1, // Thứ Hai
    startTime: '18:00',
    endTime: '19:30',
    durationMinutes: 90,
    periodCount: 2,
    notes: 'Lịch cố định đầu tuần',
    isActive: true,
    createdAt: '2026-08-25T08:00:00.000Z',
  };

  const schedule2: RecurringSchedule = {
    id: 'sch_minh_anh_wed',
    studentId: student1Id,
    dayOfWeek: 3, // Thứ Tư
    startTime: '18:00',
    endTime: '19:30',
    durationMinutes: 90,
    periodCount: 2,
    notes: 'Lịch cố định giữa tuần',
    isActive: true,
    createdAt: '2026-08-25T08:00:00.000Z',
  };

  const schedule3: RecurringSchedule = {
    id: 'sch_gia_huy_tue',
    studentId: student2Id,
    dayOfWeek: 2, // Thứ Ba
    startTime: '17:30',
    endTime: '19:00',
    durationMinutes: 90,
    periodCount: 2,
    notes: 'Toán cơ bản',
    isActive: true,
    createdAt: '2026-08-26T08:00:00.000Z',
  };

  const schedule4: RecurringSchedule = {
    id: 'sch_hoang_nam_sat',
    studentId: student3Id,
    dayOfWeek: 6, // Thứ Bảy
    startTime: '08:30',
    endTime: '10:00',
    durationMinutes: 90,
    periodCount: 2,
    notes: 'Luyện đề nâng cao',
    isActive: true,
    createdAt: '2026-08-27T08:00:00.000Z',
  };

  // First historical invoice ID
  const invoice1Id = 'inv_hp_2026_001';

  // EXACT BUSINESS SCENARIO LESSONS FOR NGUYEN MINH ANH (Requirement 30)
  // 01/09/2026 - ATTENDED + INVOICED
  const lesson1: Lesson = {
    id: 'ls_ma_01',
    studentId: student1Id,
    scheduleId: schedule1.id,
    lessonDate: '2026-09-01',
    startTime: '18:00',
    endTime: '19:30',
    durationMinutes: 90,
    periodCount: 2,
    attendanceStatus: 'ATTENDED',
    billingStatus: 'INVOICED',
    tuitionMode: 'PER_SESSION',
    unitPriceSnapshot: 100000,
    calculatedAmount: 100000,
    invoiceId: invoice1Id,
    notes: 'Ôn tập phân số và số thập phân',
    createdAt: '2026-09-01T18:00:00.000Z',
    updatedAt: '2026-09-06T10:00:00.000Z',
  };

  // 03/09/2026 - ATTENDED + INVOICED
  const lesson2: Lesson = {
    id: 'ls_ma_02',
    studentId: student1Id,
    scheduleId: schedule2.id,
    lessonDate: '2026-09-03',
    startTime: '18:00',
    endTime: '19:30',
    durationMinutes: 90,
    periodCount: 2,
    attendanceStatus: 'ATTENDED',
    billingStatus: 'INVOICED',
    tuitionMode: 'PER_SESSION',
    unitPriceSnapshot: 100000,
    calculatedAmount: 100000,
    invoiceId: invoice1Id,
    notes: 'Giải toán hình học phẳng',
    createdAt: '2026-09-03T18:00:00.000Z',
    updatedAt: '2026-09-06T10:00:00.000Z',
  };

  // 05/09/2026 - ATTENDED + INVOICED
  const lesson3: Lesson = {
    id: 'ls_ma_03',
    studentId: student1Id,
    scheduleId: schedule1.id,
    lessonDate: '2026-09-05',
    startTime: '18:00',
    endTime: '19:30',
    durationMinutes: 90,
    periodCount: 2,
    attendanceStatus: 'ATTENDED',
    billingStatus: 'INVOICED',
    tuitionMode: 'PER_SESSION',
    unitPriceSnapshot: 100000,
    calculatedAmount: 100000,
    invoiceId: invoice1Id,
    notes: 'Luyện tập phương trình đại số',
    createdAt: '2026-09-05T18:00:00.000Z',
    updatedAt: '2026-09-06T10:00:00.000Z',
  };

  // 08/09/2026 - ABSENT (Not billable)
  const lesson4: Lesson = {
    id: 'ls_ma_04',
    studentId: student1Id,
    scheduleId: schedule2.id,
    lessonDate: '2026-09-08',
    startTime: '18:00',
    endTime: '19:30',
    durationMinutes: 90,
    periodCount: 2,
    attendanceStatus: 'ABSENT',
    billingStatus: 'UNBILLED',
    tuitionMode: 'PER_SESSION',
    unitPriceSnapshot: 100000,
    calculatedAmount: 0,
    invoiceId: null,
    notes: 'Phụ huynh xin phép vắng do gia đình bận',
    createdAt: '2026-09-08T18:00:00.000Z',
    updatedAt: '2026-09-08T18:00:00.000Z',
  };

  // 10/09/2026 - ATTENDED + UNBILLED (Ready for invoice #2!)
  const lesson5: Lesson = {
    id: 'ls_ma_05',
    studentId: student1Id,
    scheduleId: schedule1.id,
    lessonDate: '2026-09-10',
    startTime: '18:00',
    endTime: '19:30',
    durationMinutes: 90,
    periodCount: 2,
    attendanceStatus: 'ATTENDED',
    billingStatus: 'UNBILLED',
    tuitionMode: 'PER_SESSION',
    unitPriceSnapshot: 100000,
    calculatedAmount: 100000,
    invoiceId: null,
    notes: 'Bài kiểm tra 15 phút đạt 9.5 điểm',
    createdAt: '2026-09-10T18:00:00.000Z',
    updatedAt: '2026-09-10T18:00:00.000Z',
  };

  // Additional lessons for Trần Gia Huy (Per Period: 45k x 2 = 90k)
  const lesson6: Lesson = {
    id: 'ls_gh_01',
    studentId: student2Id,
    scheduleId: schedule3.id,
    lessonDate: '2026-09-15',
    startTime: '17:30',
    endTime: '19:00',
    durationMinutes: 90,
    periodCount: 2,
    attendanceStatus: 'ATTENDED',
    billingStatus: 'UNBILLED',
    tuitionMode: 'PER_PERIOD',
    unitPriceSnapshot: 45000,
    calculatedAmount: 90000,
    invoiceId: null,
    notes: 'Học bài số nguyên âm và quy tắc dấu',
    createdAt: '2026-09-15T17:30:00.000Z',
    updatedAt: '2026-09-15T17:30:00.000Z',
  };

  const lesson7: Lesson = {
    id: 'ls_gh_02',
    studentId: student2Id,
    scheduleId: schedule3.id,
    lessonDate: '2026-09-22',
    startTime: '17:30',
    endTime: '19:00',
    durationMinutes: 90,
    periodCount: 2,
    attendanceStatus: 'ATTENDED',
    billingStatus: 'UNBILLED',
    tuitionMode: 'PER_PERIOD',
    unitPriceSnapshot: 45000,
    calculatedAmount: 90000,
    invoiceId: null,
    notes: 'Bài tập nâng cao phân tích đa thức',
    createdAt: '2026-09-22T17:30:00.000Z',
    updatedAt: '2026-09-22T17:30:00.000Z',
  };

  // Upcoming scheduled lesson for Trần Gia Huy
  const lesson8: Lesson = {
    id: 'ls_gh_03',
    studentId: student2Id,
    scheduleId: schedule3.id,
    lessonDate: '2026-09-29',
    startTime: '17:30',
    endTime: '19:00',
    durationMinutes: 90,
    periodCount: 2,
    attendanceStatus: 'SCHEDULED',
    billingStatus: 'UNBILLED',
    tuitionMode: 'PER_PERIOD',
    unitPriceSnapshot: 45000,
    calculatedAmount: 90000,
    invoiceId: null,
    notes: 'Buổi học sắp tới theo lịch',
    createdAt: '2026-09-26T08:00:00.000Z',
    updatedAt: '2026-09-26T08:00:00.000Z',
  };

  // Lesson for Lê Hoàng Nam (Per Session: 150k)
  const lesson9: Lesson = {
    id: 'ls_hn_01',
    studentId: student3Id,
    scheduleId: schedule4.id,
    lessonDate: '2026-09-19',
    startTime: '08:30',
    endTime: '10:00',
    durationMinutes: 90,
    periodCount: 2,
    attendanceStatus: 'ATTENDED',
    billingStatus: 'UNBILLED',
    tuitionMode: 'PER_SESSION',
    unitPriceSnapshot: 150000,
    calculatedAmount: 150000,
    invoiceId: null,
    notes: 'Chuyên đề bất đẳng thức Cauchy',
    createdAt: '2026-09-19T08:30:00.000Z',
    updatedAt: '2026-09-19T08:30:00.000Z',
  };

  // Scheduled lesson for Lê Hoàng Nam
  const lesson10: Lesson = {
    id: 'ls_hn_02',
    studentId: student3Id,
    scheduleId: schedule4.id,
    lessonDate: '2026-09-26',
    startTime: '08:30',
    endTime: '10:00',
    durationMinutes: 90,
    periodCount: 2,
    attendanceStatus: 'SCHEDULED',
    billingStatus: 'UNBILLED',
    tuitionMode: 'PER_SESSION',
    unitPriceSnapshot: 150000,
    calculatedAmount: 150000,
    invoiceId: null,
    notes: 'Lịch học sáng nay',
    createdAt: '2026-09-26T08:30:00.000Z',
    updatedAt: '2026-09-26T08:30:00.000Z',
  };

  // Historical Invoice #001 for Nguyễn Minh Anh (Required Business Scenario)
  const historicalInvoice: Invoice = {
    id: invoice1Id,
    studentId: student1Id,
    studentNameSnapshot: 'Nguyễn Minh Anh',
    studentPhoneSnapshot: '0901 234 567',
    invoiceNumber: 'HP-2026-0001',
    issuedAt: '2026-09-06',
    subtotal: 300000,
    discount: 0,
    totalAmount: 300000,
    paymentStatus: 'PAID',
    paymentDate: '2026-09-07',
    receiptTheme: 'soft_pink',
    showComment: true,
    teacherComment: 'Minh Anh học rất chăm chỉ, chủ động giơ tay phát biểu và hoàn thành xuất sắc các bài tập trên lớp.',
    tuitionModeSnapshot: 'PER_SESSION',
    unitPriceSnapshot: 100000,
    lessonCount: 3,
    lessonDisplayMode: 'STANDARD',
    showBankInfo: false,
    items: [
      {
        id: 'item_01',
        invoiceId: invoice1Id,
        lessonId: lesson1.id,
        lessonDate: '2026-09-01',
        startTime: '18:00',
        endTime: '19:30',
        periodCount: 2,
        tuitionMode: 'PER_SESSION',
        unitPrice: 100000,
        amount: 100000,
        notes: 'Ôn tập phân số và số thập phân',
      },
      {
        id: 'item_02',
        invoiceId: invoice1Id,
        lessonId: lesson2.id,
        lessonDate: '2026-09-03',
        startTime: '18:00',
        endTime: '19:30',
        periodCount: 2,
        tuitionMode: 'PER_SESSION',
        unitPrice: 100000,
        amount: 100000,
        notes: 'Giải toán hình học phẳng',
      },
      {
        id: 'item_03',
        invoiceId: invoice1Id,
        lessonId: lesson3.id,
        lessonDate: '2026-09-05',
        startTime: '18:00',
        endTime: '19:30',
        periodCount: 2,
        tuitionMode: 'PER_SESSION',
        unitPrice: 100000,
        amount: 100000,
        notes: 'Luyện tập phương trình đại số',
      },
    ],
    createdAt: '2026-09-06T10:00:00.000Z',
    updatedAt: '2026-09-07T14:30:00.000Z',
  };

  return {
    version: 1,
    students: [student1, student2, student3],
    schedules: [schedule1, schedule2, schedule3, schedule4],
    lessons: [lesson1, lesson2, lesson3, lesson4, lesson5, lesson6, lesson7, lesson8, lesson9, lesson10],
    invoices: [historicalInvoice],
    settings: INITIAL_SETTINGS,
    lastUpdated: new Date().toISOString(),
  };
}
