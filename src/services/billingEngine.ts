import { Student, Lesson, Invoice, InvoiceItem, ReceiptThemeId, PaymentStatus } from '../types';

export class BillingEngine {
  /**
   * Calculate lesson price based on tuition mode and student rates.
   * If PER_SESSION: unitPrice = student.pricePerSession, total = student.pricePerSession
   * If PER_PERIOD: unitPrice = student.pricePerPeriod, total = pricePerPeriod * periodCount
   */
  static calculateLessonTuition(
    student: Student,
    periodCountOverride?: number
  ): { unitPrice: number; totalAmount: number; periodCount: number } {
    const periodCount = periodCountOverride ?? student.periodsPerLesson ?? 1;

    if (student.tuitionMode === 'PER_PERIOD') {
      const unitPrice = student.pricePerPeriod;
      const totalAmount = unitPrice * periodCount;
      return { unitPrice, totalAmount, periodCount };
    } else {
      const unitPrice = student.pricePerSession;
      const totalAmount = unitPrice;
      return { unitPrice, totalAmount, periodCount };
    }
  }

  /**
   * Determine if a lesson is eligible for billing:
   * STRICT RULE: Must be ATTENDED AND UNBILLED.
   */
  static isBillable(lesson: Lesson): boolean {
    return lesson.attendanceStatus === 'ATTENDED' && lesson.billingStatus === 'UNBILLED';
  }

  /**
   * Get all billable lessons for a given student
   */
  static getEligibleLessons(lessons: Lesson[], studentId: string): Lesson[] {
    return lessons
      .filter((l) => l.studentId === studentId && this.isBillable(l))
      .sort((a, b) => new Date(a.lessonDate).getTime() - new Date(b.lessonDate).getTime());
  }

  /**
   * Generate sequential invoice number (e.g., HP-2026-0002)
   */
  static generateInvoiceNumber(existingInvoices: Invoice[]): string {
    const currentYear = new Date().getFullYear();
    const prefix = `HP-${currentYear}-`;

    const numbers = existingInvoices
      .filter((inv) => inv.invoiceNumber.startsWith(prefix))
      .map((inv) => {
        const parts = inv.invoiceNumber.split('-');
        return parseInt(parts[2], 10);
      })
      .filter((n) => !isNaN(n));

    const nextNum = numbers.length > 0 ? Math.max(...numbers) + 1 : 1;
    return `${prefix}${nextNum.toString().padStart(4, '0')}`;
  }

  /**
   * Transactional Invoice Creation:
   * 1. Validates selected lessons are strictly ATTENDED and UNBILLED.
   * 2. Prevents double-billing.
   * 3. Creates immutable snapshot InvoiceItems preserving rates at time of billing.
   * 4. Updates lesson billingStatus to 'INVOICED' and assigns invoiceId.
   */
  static createInvoice(params: {
    student: Student;
    selectedLessons: Lesson[];
    allLessons: Lesson[];
    existingInvoices: Invoice[];
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
  }): { invoice: Invoice; updatedLessons: Lesson[] } {
    const {
      student,
      selectedLessons,
      allLessons,
      existingInvoices,
      theme,
      showComment,
      teacherComment,
      discount = 0,
      paymentStatus = 'UNPAID',
      lessonDisplayMode = 'STANDARD',
      showBankInfo = false,
      bankNameSnapshot = '',
      bankAccountNumberSnapshot = '',
      bankAccountHolderSnapshot = '',
      transferNoteSnapshot = '',
      qrImageUrlSnapshot = '',
    } = params;

    // Safety checks
    if (!selectedLessons || selectedLessons.length === 0) {
      throw new Error('Vui lòng chọn ít nhất một buổi học hợp lệ để xuất phiếu!');
    }

    const selectedLessonIds = new Set(selectedLessons.map((l) => l.id));

    // Verify all selected lessons are strictly eligible (ATTENDED & UNBILLED)
    for (const lesson of selectedLessons) {
      if (lesson.studentId !== student.id) {
        throw new Error(`Buổi học ngày ${lesson.lessonDate} không thuộc học sinh đã chọn!`);
      }
      if (lesson.attendanceStatus !== 'ATTENDED') {
        throw new Error(`Buổi học ngày ${lesson.lessonDate} chưa được điểm danh có học!`);
      }
      if (lesson.billingStatus === 'INVOICED' || lesson.invoiceId) {
        throw new Error(`Buổi học ngày ${lesson.lessonDate} đã từng được xuất phiếu trước đó! Không thể tính học phí trùng.`);
      }
    }

    const invoiceId = `inv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const invoiceNumber = this.generateInvoiceNumber(existingInvoices);
    const todayStr = new Date().toISOString().split('T')[0];

    // Build immutable invoice items
    const invoiceItems: InvoiceItem[] = selectedLessons.map((lesson, idx) => {
      // Use the lesson's unitPriceSnapshot or compute from student configuration
      const amount = lesson.calculatedAmount > 0
        ? lesson.calculatedAmount
        : student.tuitionMode === 'PER_PERIOD'
        ? student.pricePerPeriod * lesson.periodCount
        : student.pricePerSession;

      const unitPrice = lesson.unitPriceSnapshot > 0
        ? lesson.unitPriceSnapshot
        : student.tuitionMode === 'PER_PERIOD'
        ? student.pricePerPeriod
        : student.pricePerSession;

      return {
        id: `item_${invoiceId}_${idx + 1}`,
        invoiceId,
        lessonId: lesson.id,
        lessonDate: lesson.lessonDate,
        startTime: lesson.startTime,
        endTime: lesson.endTime,
        periodCount: lesson.periodCount,
        tuitionMode: lesson.tuitionMode || student.tuitionMode,
        unitPrice,
        amount,
        notes: lesson.notes || '',
      };
    });

    const subtotal = invoiceItems.reduce((sum, item) => sum + item.amount, 0);
    const totalAmount = Math.max(0, subtotal - discount);

    const invoice: Invoice = {
      id: invoiceId,
      studentId: student.id,
      studentNameSnapshot: student.name,
      studentPhoneSnapshot: student.phone,
      invoiceNumber,
      issuedAt: todayStr,
      subtotal,
      discount,
      totalAmount,
      paymentStatus,
      paymentDate: paymentStatus === 'PAID' ? todayStr : null,
      receiptTheme: theme,
      showComment,
      teacherComment: teacherComment.trim(),
      tuitionModeSnapshot: student.tuitionMode,
      unitPriceSnapshot: student.tuitionMode === 'PER_PERIOD' ? student.pricePerPeriod : student.pricePerSession,
      periodCountSnapshot: student.periodsPerLesson,
      lessonCount: selectedLessons.length,
      items: invoiceItems,
      lessonDisplayMode,
      showBankInfo,
      bankNameSnapshot,
      bankAccountNumberSnapshot,
      bankAccountHolderSnapshot,
      transferNoteSnapshot,
      qrImageUrlSnapshot,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Atomically lock included lessons
    const updatedLessons = allLessons.map((l) => {
      if (selectedLessonIds.has(l.id)) {
        return {
          ...l,
          billingStatus: 'INVOICED' as const,
          invoiceId: invoiceId,
          updatedAt: new Date().toISOString(),
        };
      }
      return l;
    });

    return { invoice, updatedLessons };
  }

  /**
   * Delete or void an invoice safely:
   * Releases associated lessons back to UNBILLED status so they are not permanently orphaned.
   */
  static voidInvoice(
    invoiceId: string,
    allInvoices: Invoice[],
    allLessons: Lesson[]
  ): { updatedInvoices: Invoice[]; updatedLessons: Lesson[] } {
    const updatedInvoices = allInvoices.filter((inv) => inv.id !== invoiceId);

    const updatedLessons = allLessons.map((l) => {
      if (l.invoiceId === invoiceId) {
        return {
          ...l,
          billingStatus: 'UNBILLED' as const,
          invoiceId: null,
          updatedAt: new Date().toISOString(),
        };
      }
      return l;
    });

    return { updatedInvoices, updatedLessons };
  }
}
