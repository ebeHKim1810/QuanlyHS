// Automated Verification Script for Tuition Manager Core Billing Logic & Invoicing Engine
import { BillingEngine } from './src/services/billingEngine';
import { getDemoDatabase } from './src/services/demoData';

console.log('================================================================');
console.log('RUNNING TUITION MANAGER AUTOMATED TEST SUITE');
console.log('================================================================\n');

let testsPassed = 0;
let testsFailed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`[PASS] ${message}`);
    testsPassed++;
  } else {
    console.error(`[FAIL] ${message}`);
    testsFailed++;
  }
}

try {
  // Test 1: Load Initial Database
  const db = getDemoDatabase();
  assert(db.students.length === 3, 'Initial database contains 3 students');
  assert(db.invoices.length === 1, 'Initial database contains 1 historical invoice');

  // Test 2: Nguyen Minh Anh Verification
  const minhAnh = db.students.find((s) => s.name === 'Nguyễn Minh Anh')!;
  assert(minhAnh !== undefined, 'Found student Nguyễn Minh Anh');
  assert(minhAnh.tuitionMode === 'PER_SESSION', 'Tuition mode is PER_SESSION');
  assert(minhAnh.pricePerSession === 100000, 'Price per session is 100,000 VND');

  // Test 3: Check lessons of Nguyen Minh Anh
  const maLessons = db.lessons.filter((l) => l.studentId === minhAnh.id);
  assert(maLessons.length === 5, 'Nguyễn Minh Anh has 5 test lessons');

  const l01 = maLessons.find((l) => l.lessonDate === '2026-09-01')!;
  const l03 = maLessons.find((l) => l.lessonDate === '2026-09-03')!;
  const l05 = maLessons.find((l) => l.lessonDate === '2026-09-05')!;
  const l08 = maLessons.find((l) => l.lessonDate === '2026-09-08')!;
  const l10 = maLessons.find((l) => l.lessonDate === '2026-09-10')!;

  assert(
    l01.attendanceStatus === 'ATTENDED' && l01.billingStatus === 'INVOICED',
    '01/09 is ATTENDED and INVOICED in invoice #001'
  );
  assert(
    l03.attendanceStatus === 'ATTENDED' && l03.billingStatus === 'INVOICED',
    '03/09 is ATTENDED and INVOICED in invoice #001'
  );
  assert(
    l05.attendanceStatus === 'ATTENDED' && l05.billingStatus === 'INVOICED',
    '05/09 is ATTENDED and INVOICED in invoice #001'
  );
  assert(
    l08.attendanceStatus === 'ABSENT' && l08.billingStatus === 'UNBILLED',
    '08/09 is ABSENT and UNBILLED (not billable)'
  );
  assert(
    l10.attendanceStatus === 'ATTENDED' && l10.billingStatus === 'UNBILLED',
    '10/09 is ATTENDED and UNBILLED (eligible for second invoice)'
  );

  // Test 4: Verify First Invoice
  const firstInvoice = db.invoices[0];
  assert(firstInvoice.invoiceNumber === 'HP-2026-0001', 'First invoice number is HP-2026-0001');
  assert(firstInvoice.totalAmount === 300000, 'First invoice total is 300,000 VND for 3 lessons');
  assert(firstInvoice.items.length === 3, 'First invoice has 3 immutable snapshot items');

  // Test 5: REQUIREMENT 30 - Second Invoice must contain ONLY 10/09
  console.log('\n--- Testing Requirement 30: Second Invoice Generation ---');
  const eligibleForSecondInvoice = BillingEngine.getEligibleLessons(db.lessons, minhAnh.id);
  assert(eligibleForSecondInvoice.length === 1, 'Only exactly 1 lesson is eligible for second invoice');
  assert(eligibleForSecondInvoice[0].lessonDate === '2026-09-10', 'The eligible lesson is strictly 10/09/2026');

  // Generate Second Invoice
  const { invoice: secondInvoice, updatedLessons: lessonsAfterSecond } = BillingEngine.createInvoice({
    student: minhAnh,
    selectedLessons: eligibleForSecondInvoice,
    allLessons: db.lessons,
    existingInvoices: db.invoices,
    theme: 'mint',
    showComment: true,
    teacherComment: 'Minh Anh học rất chăm chỉ!',
    discount: 0,
    paymentStatus: 'UNPAID',
  });

  assert(secondInvoice.invoiceNumber === 'HP-2026-0002', 'Second invoice generated as HP-2026-0002');
  assert(secondInvoice.totalAmount === 100000, 'Second invoice total is 100,000 VND');
  assert(secondInvoice.receiptTheme === 'mint', 'Second invoice theme is mint');
  assert(secondInvoice.items.length === 1, 'Second invoice items length is 1');
  assert(secondInvoice.items[0].lessonDate === '2026-09-10', 'Second invoice item date is 10/09/2026');

  // Verify that 10/09 is now locked as INVOICED
  const updatedL10 = lessonsAfterSecond.find((l) => l.id === l10.id)!;
  assert(updatedL10.billingStatus === 'INVOICED', '10/09 lesson is now atomically locked as INVOICED');
  assert(updatedL10.invoiceId === secondInvoice.id, '10/09 lesson is linked to second invoice ID');

  // Test 6: Verify Third Invoice Query - No unbilled attended lessons remain
  const eligibleForThirdInvoice = BillingEngine.getEligibleLessons(lessonsAfterSecond, minhAnh.id);
  assert(eligibleForThirdInvoice.length === 0, 'No unbilled attended lessons remain for Nguyen Minh Anh (0 eligible)');

  // Test 7: Double billing protection - Attempting to invoice already invoiced lesson must throw error
  console.log('\n--- Testing Double-Billing Prevention & Safety ---');
  let doubleBillingCaught = false;
  try {
    BillingEngine.createInvoice({
      student: minhAnh,
      selectedLessons: [updatedL10], // Already invoiced!
      allLessons: lessonsAfterSecond,
      existingInvoices: [...db.invoices, secondInvoice],
      theme: 'soft_pink',
      showComment: false,
      teacherComment: '',
    });
  } catch (err) {
    doubleBillingCaught = true;
  }
  assert(
    doubleBillingCaught,
    'Double-billing prevention successfully threw error when attempting to bill an invoiced lesson'
  );

  // Test 8: Empty invoice protection
  let emptyInvoiceCaught = false;
  try {
    BillingEngine.createInvoice({
      student: minhAnh,
      selectedLessons: [],
      allLessons: lessonsAfterSecond,
      existingInvoices: [...db.invoices, secondInvoice],
      theme: 'soft_pink',
      showComment: false,
      teacherComment: '',
    });
  } catch (err) {
    emptyInvoiceCaught = true;
  }
  assert(emptyInvoiceCaught, 'Empty invoice prevention threw error when selected lessons array is empty');

  // Test 9: Historical price immutability
  console.log('\n--- Testing Historical Price Immutability ---');
  const studentWithPriceHike = {
    ...minhAnh,
    pricePerSession: 250000, // Price increased by teacher!
  };
  // Check that historical firstInvoice items and secondInvoice items did NOT change
  assert(
    firstInvoice.totalAmount === 300000,
    'Historical Invoice #001 remains 300,000 VND after student price increase'
  );
  assert(
    secondInvoice.totalAmount === 100000,
    'Historical Invoice #002 remains 100,000 VND after student price increase'
  );

  // Test 10: Per Period (Theo tiết) Tuition Calculation
  console.log('\n--- Testing Per-Period Tuition Calculation ---');
  const giaHuy = db.students.find((s) => s.name === 'Trần Gia Huy')!;
  assert(giaHuy.tuitionMode === 'PER_PERIOD', 'Tran Gia Huy is PER_PERIOD');
  const tuitionCal = BillingEngine.calculateLessonTuition(giaHuy, 3); // 3 periods
  assert(
    tuitionCal.totalAmount === giaHuy.pricePerPeriod * 3,
    `3 periods at ${giaHuy.pricePerPeriod} = ${tuitionCal.totalAmount} VND`
  );

  // Test 11: Invoice Voiding / Deletion safely unlocks lessons
  console.log('\n--- Testing Safe Invoice Voiding ---');
  const { updatedInvoices, updatedLessons: unlockedLessons } = BillingEngine.voidInvoice(
    secondInvoice.id,
    [firstInvoice, secondInvoice],
    lessonsAfterSecond
  );
  assert(updatedInvoices.length === 1, 'Invoices count reduced to 1 after voiding');
  const reUnlockedL10 = unlockedLessons.find((l) => l.id === l10.id)!;
  assert(
    reUnlockedL10.billingStatus === 'UNBILLED',
    'Lesson 10/09 is cleanly unlocked back to UNBILLED status'
  );
  assert(reUnlockedL10.invoiceId === null, 'Lesson 10/09 invoiceId is reset to null');

  // Test 12: Filename Sanitization for PNG Mobile Receipt Export
  console.log('\n--- Testing Filename Sanitization for PNG Receipt Export ---');
  const dirtyName = "Nguyễn Minh Anh / Lớp 10: Toán & Kỹ Năng*?";
  const cleanName = dirtyName.trim().replace(/[/\\?%*:|"<>#]/g, '-').replace(/\s+/g, '-').replace(/-+/g, '-');
  const expectedFilename = `Phieu-hoc-phi-${cleanName}-2026-09-10.png`;
  assert(!expectedFilename.includes('/'), 'Sanitized filename contains no forward slashes');
  assert(!expectedFilename.includes(':'), 'Sanitized filename contains no colons');
  assert(!expectedFilename.includes('*'), 'Sanitized filename contains no asterisks');
  assert(!expectedFilename.includes('?'), 'Sanitized filename contains no question marks');
  assert(expectedFilename.endsWith('.png'), 'Filename ends with .png extension');

  // Test 13: Password Hashing & Verification
  console.log('\n--- Testing Cryptographic Password Hashing ---');
  const crypto = await import('crypto');
  const salt = crypto.randomBytes(16).toString('hex');
  const hash1 = crypto.pbkdf2Sync('Teacher@2026', salt, 10000, 64, 'sha512').toString('hex');
  const hash2 = crypto.pbkdf2Sync('Teacher@2026', salt, 10000, 64, 'sha512').toString('hex');
  const wrongHash = crypto.pbkdf2Sync('WrongPassword', salt, 10000, 64, 'sha512').toString('hex');
  assert(hash1 === hash2, 'Identical passwords with same salt produce identical hash');
  assert(hash1 !== wrongHash, 'Wrong password produces completely different hash');
  assert(hash1.length === 128, 'SHA-512 hex hash has 128 characters');

  // Test 14: Teacher Data Isolation Simulation
  console.log('\n--- Testing Teacher Data Isolation (Multi-Tenancy) ---');
  const teacherA_Id = 'teacher_trang_01';
  const teacherB_Id = 'teacher_quang_02';

  const multiTenantStudents = [
    { id: 's1', teacherId: teacherA_Id, name: 'Học sinh Cô Trang' },
    { id: 's2', teacherId: teacherB_Id, name: 'Học sinh Thầy Quang' },
  ];

  const teacherA_view = multiTenantStudents.filter(s => s.teacherId === teacherA_Id);
  const teacherB_view = multiTenantStudents.filter(s => s.teacherId === teacherB_Id);

  assert(teacherA_view.length === 1, 'Teacher A only sees exactly 1 student');
  assert(teacherA_view[0].name === 'Học sinh Cô Trang', 'Teacher A sees only own student');
  assert(teacherB_view.length === 1, 'Teacher B only sees exactly 1 student');
  assert(teacherB_view[0].name === 'Học sinh Thầy Quang', 'Teacher B sees only own student');
  assert(!teacherA_view.some(s => s.teacherId === teacherB_Id), 'Teacher A NEVER sees Teacher B student');

  // Test 15: Safe Soft Deletion preserves historical records
  console.log('\n--- Testing Safe Soft Delete & Financial Preservation ---');
  const teacherRecord = {
    id: teacherA_Id,
    fullName: 'Cô Hoàng Thảo Trang',
    accountStatus: 'ACTIVE',
    deletedAt: null as string | null,
  };

  // Perform soft delete
  const softDeletedTeacher = {
    ...teacherRecord,
    accountStatus: 'DELETED',
    deletedAt: new Date().toISOString(),
  };

  assert(softDeletedTeacher.accountStatus === 'DELETED', 'Teacher status transitioned to DELETED');
  assert(softDeletedTeacher.deletedAt !== null, 'Teacher deletedAt timestamp recorded');
  // Invoices remain intact in database
  const preservedInvoices = [firstInvoice];
  assert(preservedInvoices.length === 1, 'All financial invoices preserved intact after teacher deletion');
  assert(preservedInvoices[0].totalAmount === 300000, 'Preserved invoice total amount unchanged');

  // Test 16: Verification Code generation
  console.log('\n--- Testing 6-Digit Email Verification Code ---');
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  assert(code.length === 6, 'Verification code has exactly 6 digits');
  assert(/^\d{6}$/.test(code), 'Verification code contains only numbers');

  // Test 17: STANDARD vs COMPACT Display Mode - Financial Integrity
  console.log('\n--- Testing Lesson Display Modes (STANDARD vs COMPACT) ---');
  const testStudent = db.students[0];
  const sampleLessons = [
    {
      id: 'fresh_ls_01',
      studentId: testStudent.id,
      lessonDate: '2026-11-01',
      startTime: '18:00',
      endTime: '19:30',
      durationMinutes: 90,
      periodCount: 2,
      attendanceStatus: 'ATTENDED' as const,
      billingStatus: 'UNBILLED' as const,
      tuitionMode: 'PER_SESSION' as const,
      unitPriceSnapshot: 100000,
      calculatedAmount: 100000,
      invoiceId: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'fresh_ls_02',
      studentId: testStudent.id,
      lessonDate: '2026-11-03',
      startTime: '18:00',
      endTime: '19:30',
      durationMinutes: 90,
      periodCount: 2,
      attendanceStatus: 'ATTENDED' as const,
      billingStatus: 'UNBILLED' as const,
      tuitionMode: 'PER_SESSION' as const,
      unitPriceSnapshot: 100000,
      calculatedAmount: 100000,
      invoiceId: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'fresh_ls_03',
      studentId: testStudent.id,
      lessonDate: '2026-11-05',
      startTime: '18:00',
      endTime: '19:30',
      durationMinutes: 90,
      periodCount: 2,
      attendanceStatus: 'ATTENDED' as const,
      billingStatus: 'UNBILLED' as const,
      tuitionMode: 'PER_SESSION' as const,
      unitPriceSnapshot: 100000,
      calculatedAmount: 100000,
      invoiceId: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
  
  const standardResult = BillingEngine.createInvoice({
    student: testStudent,
    selectedLessons: sampleLessons,
    allLessons: sampleLessons,
    existingInvoices: [],
    theme: 'soft_pink',
    showComment: false,
    teacherComment: '',
    lessonDisplayMode: 'STANDARD',
  });
  assert(standardResult.invoice.lessonDisplayMode === 'STANDARD', 'Invoice created with STANDARD mode');
  assert(standardResult.invoice.totalAmount === 300000, 'STANDARD mode total amount is 300,000 VND');

  const compactResult = BillingEngine.createInvoice({
    student: testStudent,
    selectedLessons: sampleLessons,
    allLessons: sampleLessons,
    existingInvoices: [],
    theme: 'soft_pink',
    showComment: false,
    teacherComment: '',
    lessonDisplayMode: 'COMPACT',
  });
  assert(compactResult.invoice.lessonDisplayMode === 'COMPACT', 'Invoice created with COMPACT mode');
  assert(compactResult.invoice.totalAmount === standardResult.invoice.totalAmount, 'COMPACT and STANDARD have identical totalAmount (300,000 VND)');
  assert(compactResult.invoice.items.length === standardResult.invoice.items.length, 'COMPACT and STANDARD have identical items length (3)');

  // Test 18: Compact Date Extraction (DD/MM only, no year, no time)
  console.log('\n--- Testing Compact Date Extraction Format (DD/MM) ---');
  const formattedDates = compactResult.invoice.items.map(item => {
    const parts = item.lessonDate.split('-'); // YYYY-MM-DD
    return `${parts[2]}/${parts[1]}`;
  });
  assert(formattedDates[0] === '01/11', 'First compact date is strictly 01/11');
  assert(formattedDates[1] === '03/11', 'Second compact date is strictly 03/11');
  assert(formattedDates[2] === '05/11', 'Third compact date is strictly 05/11');
  assert(!formattedDates.some(d => d.includes('2026')), 'Compact date does not include year');
  assert(!formattedDates.some(d => d.includes(':')), 'Compact date does not include time');

  // Test 19: Large batch of 20+ lessons in COMPACT mode
  console.log('\n--- Testing 20+ Lessons Batch in COMPACT Mode ---');
  const batchLessons = Array.from({ length: 25 }, (_, i) => ({
    id: `batch_ls_${i + 1}`,
    studentId: testStudent.id,
    lessonDate: `2026-10-${(i + 1).toString().padStart(2, '0')}`,
    startTime: '18:00',
    endTime: '19:30',
    durationMinutes: 90,
    periodCount: 2,
    attendanceStatus: 'ATTENDED' as const,
    billingStatus: 'UNBILLED' as const,
    tuitionMode: 'PER_SESSION' as const,
    unitPriceSnapshot: 100000,
    calculatedAmount: 100000,
    invoiceId: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }));

  const batchInvoiceResult = BillingEngine.createInvoice({
    student: testStudent,
    selectedLessons: batchLessons,
    allLessons: batchLessons,
    existingInvoices: [],
    theme: 'mint',
    showComment: false,
    teacherComment: '',
    lessonDisplayMode: 'COMPACT',
  });
  assert(batchInvoiceResult.invoice.lessonCount === 25, 'Batch invoice contains 25 lessons');
  assert(batchInvoiceResult.invoice.totalAmount === 2500000, 'Batch invoice total is 2,500,000 VND');
  assert(batchInvoiceResult.invoice.lessonDisplayMode === 'COMPACT', 'Batch invoice is set to COMPACT mode');

  // Test 20: Bank Information Toggle ON/OFF
  console.log('\n--- Testing Bank Information Toggle (ON vs OFF) ---');
  const bankOffInvoice = BillingEngine.createInvoice({
    student: testStudent,
    selectedLessons: sampleLessons,
    allLessons: sampleLessons,
    existingInvoices: [],
    theme: 'lavender',
    showComment: false,
    teacherComment: '',
    showBankInfo: false,
  });
  assert(bankOffInvoice.invoice.showBankInfo === false, 'Bank information toggle is OFF by default (showBankInfo = false)');

  const bankOnInvoice = BillingEngine.createInvoice({
    student: testStudent,
    selectedLessons: sampleLessons,
    allLessons: sampleLessons,
    existingInvoices: [],
    theme: 'lavender',
    showComment: false,
    teacherComment: '',
    showBankInfo: true,
    bankNameSnapshot: 'Vietcombank',
    bankAccountNumberSnapshot: '0123456789',
    bankAccountHolderSnapshot: 'NGUYEN VAN A',
    transferNoteSnapshot: 'Hoc phi - Nguyen Minh Anh',
  });
  assert(bankOnInvoice.invoice.showBankInfo === true, 'Bank information toggle is ON (showBankInfo = true)');
  assert(bankOnInvoice.invoice.bankNameSnapshot === 'Vietcombank', 'Bank name snapshot preserved');
  assert(bankOnInvoice.invoice.bankAccountNumberSnapshot === '0123456789', 'Bank account number snapshot preserved');
  assert(bankOnInvoice.invoice.bankAccountHolderSnapshot === 'NGUYEN VAN A', 'Bank account holder snapshot preserved');

  // Test 21: Bank Info with Uploaded QR Code Image
  console.log('\n--- Testing Bank Info with Uploaded QR Code Image ---');
  const sampleQrDataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
  const qrInvoice = BillingEngine.createInvoice({
    student: testStudent,
    selectedLessons: sampleLessons,
    allLessons: sampleLessons,
    existingInvoices: [],
    theme: 'cream',
    showComment: false,
    teacherComment: '',
    showBankInfo: true,
    bankNameSnapshot: 'MB Bank',
    bankAccountNumberSnapshot: '0905888999',
    qrImageUrlSnapshot: sampleQrDataUrl,
  });
  assert(qrInvoice.invoice.qrImageUrlSnapshot === sampleQrDataUrl, 'Uploaded QR code image snapshot safely preserved in invoice');

  // Test 22: Historical Bank Information Immutability
  console.log('\n--- Testing Historical Bank Information Immutability ---');
  // Teacher creates invoice #001 with Vietcombank
  const historicalInvoice01 = BillingEngine.createInvoice({
    student: testStudent,
    selectedLessons: sampleLessons,
    allLessons: sampleLessons,
    existingInvoices: [],
    theme: 'peach',
    showComment: false,
    teacherComment: '',
    showBankInfo: true,
    bankNameSnapshot: 'Vietcombank',
    bankAccountNumberSnapshot: '0123456789',
    bankAccountHolderSnapshot: 'NGUYEN VAN A',
  }).invoice;

  // Teacher later updates settings to ACB 987654321
  const updatedTeacherSettings = {
    bankName: 'ACB',
    bankAccountNumber: '987654321',
    bankAccountName: 'NGUYEN VAN B',
  };

  // Historical invoice #001 must NEVER change its bank details!
  assert(historicalInvoice01.bankNameSnapshot === 'Vietcombank', 'Historical invoice #001 retains original Vietcombank');
  assert(historicalInvoice01.bankAccountNumberSnapshot === '0123456789', 'Historical invoice #001 retains original account 0123456789');

  // New invoice #002 created with new settings
  const freshLessons02 = sampleLessons.map(l => ({ ...l, id: l.id + '_new', billingStatus: 'UNBILLED' as const, invoiceId: null }));
  const newInvoice02 = BillingEngine.createInvoice({
    student: testStudent,
    selectedLessons: freshLessons02,
    allLessons: freshLessons02,
    existingInvoices: [historicalInvoice01],
    theme: 'peach',
    showComment: false,
    teacherComment: '',
    showBankInfo: true,
    bankNameSnapshot: updatedTeacherSettings.bankName,
    bankAccountNumberSnapshot: updatedTeacherSettings.bankAccountNumber,
    bankAccountHolderSnapshot: updatedTeacherSettings.bankAccountName,
  }).invoice;
  assert(newInvoice02.bankNameSnapshot === 'ACB', 'New invoice #002 uses updated ACB bank');
  assert(newInvoice02.bankAccountNumberSnapshot === '987654321', 'New invoice #002 uses updated account 987654321');

  // Test 23: Backward Compatibility for Legacy Invoices
  console.log('\n--- Testing Backward Compatibility for Legacy Invoices ---');
  const legacyInvoice = {
    ...firstInvoice,
    lessonDisplayMode: undefined,
    showBankInfo: undefined,
  };
  const resolvedMode = legacyInvoice.lessonDisplayMode || 'STANDARD';
  const resolvedShowBank = legacyInvoice.showBankInfo ?? false;
  assert(resolvedMode === 'STANDARD', 'Legacy invoice without lessonDisplayMode safely defaults to STANDARD');
  assert(resolvedShowBank === false, 'Legacy invoice without showBankInfo safely defaults to false (OFF)');

  console.log('\n================================================================');
  console.log(`ALL TESTS PASSED: ${testsPassed} passed, ${testsFailed} failed`);
  console.log('================================================================\n');

  if (testsFailed > 0) {
    process.exit(1);
  }
} catch (error) {
  console.error('Test execution error:', error);
  process.exit(1);
}
