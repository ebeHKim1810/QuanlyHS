import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// Embedded initial database seed (guarantees data exists even if filesystem is read-only or file missing)
export const SEED_DATABASE = {
  version: 1,
  students: [
    {
      id: "std_gia_huy_02",
      name: "Trần Gia Huy",
      phone: "0912 345 678",
      email: "giahuy.tran@gmail.com",
      studentCode: "HS-2026-002",
      notes: "Học theo tiết (2 tiết/buổi). Chăm chỉ, chuẩn bị bài tốt.",
      tuitionMode: "PER_PERIOD",
      pricePerSession: 90000,
      pricePerPeriod: 45000,
      periodsPerLesson: 2,
      status: "ACTIVE",
      createdAt: "2026-08-26T08:00:00.000Z",
      updatedAt: "2026-08-26T08:00:00.000Z",
      teacherId: "teacher_trang_01"
    },
    {
      id: "std_hoang_nam_03",
      name: "Lê Hoàng Nam",
      phone: "0988 765 432",
      email: "hoangnam.le@gmail.com",
      studentCode: "HS-2026-003",
      notes: "Lớp ôn thi chọn chuyên. Lịch học Thứ 7 & CN.",
      tuitionMode: "PER_SESSION",
      pricePerSession: 150000,
      pricePerPeriod: 75000,
      periodsPerLesson: 2,
      status: "ACTIVE",
      createdAt: "2026-08-27T08:00:00.000Z",
      updatedAt: "2026-08-27T08:00:00.000Z",
      teacherId: "teacher_trang_01"
    }
  ],
  schedules: [
    {
      id: "sch_gia_huy_tue",
      studentId: "std_gia_huy_02",
      dayOfWeek: 2,
      startTime: "17:30",
      endTime: "19:00",
      durationMinutes: 90,
      periodCount: 2,
      notes: "Toán cơ bản",
      isActive: true,
      createdAt: "2026-08-26T08:00:00.000Z",
      teacherId: "teacher_trang_01"
    },
    {
      id: "sch_hoang_nam_sat",
      studentId: "std_hoang_nam_03",
      dayOfWeek: 6,
      startTime: "08:30",
      endTime: "10:00",
      durationMinutes: 90,
      periodCount: 2,
      notes: "Luyện đề nâng cao",
      isActive: true,
      createdAt: "2026-08-27T08:00:00.000Z",
      teacherId: "teacher_trang_01"
    }
  ],
  lessons: [
    {
      id: "ls_gh_01",
      studentId: "std_gia_huy_02",
      scheduleId: "sch_gia_huy_tue",
      lessonDate: "2026-09-15",
      startTime: "17:30",
      endTime: "19:00",
      durationMinutes: 90,
      periodCount: 2,
      attendanceStatus: "ATTENDED",
      billingStatus: "INVOICED",
      tuitionMode: "PER_PERIOD",
      unitPriceSnapshot: 45000,
      calculatedAmount: 90000,
      invoiceId: "inv_1790418077420_64iih",
      notes: "Học bài số nguyên âm và quy tắc dấu",
      createdAt: "2026-09-15T17:30:00.000Z",
      updatedAt: "2026-09-26T10:21:17.421Z",
      teacherId: "teacher_trang_01"
    },
    {
      id: "ls_gh_02",
      studentId: "std_gia_huy_02",
      scheduleId: "sch_gia_huy_tue",
      lessonDate: "2026-09-22",
      startTime: "17:30",
      endTime: "19:00",
      durationMinutes: 90,
      periodCount: 2,
      attendanceStatus: "ATTENDED",
      billingStatus: "INVOICED",
      tuitionMode: "PER_PERIOD",
      unitPriceSnapshot: 45000,
      calculatedAmount: 90000,
      invoiceId: "inv_1790418077420_64iih",
      notes: "Bài tập nâng cao phân tích đa thức",
      createdAt: "2026-09-22T17:30:00.000Z",
      updatedAt: "2026-09-26T10:21:17.421Z",
      teacherId: "teacher_trang_01"
    }
  ],
  invoices: [
    {
      id: "inv_1790418077420_64iih",
      studentId: "std_gia_huy_02",
      studentNameSnapshot: "Trần Gia Huy",
      studentPhoneSnapshot: "0912 345 678",
      invoiceNumber: "HP-2026-0002",
      issuedAt: "2026-09-26",
      subtotal: 180000,
      discount: 0,
      totalAmount: 180000,
      paymentStatus: "UNPAID",
      paymentDate: null,
      receiptTheme: "soft_pink",
      showComment: true,
      teacherComment: "",
      tuitionModeSnapshot: "PER_PERIOD",
      unitPriceSnapshot: 45000,
      periodCountSnapshot: 2,
      lessonCount: 2,
      items: [
        {
          id: "item_inv_1790418077420_64iih_1",
          invoiceId: "inv_1790418077420_64iih",
          lessonId: "ls_gh_01",
          lessonDate: "2026-09-15",
          startTime: "17:30",
          endTime: "19:00",
          periodCount: 2,
          tuitionMode: "PER_PERIOD",
          unitPrice: 45000,
          amount: 90000,
          notes: "Học bài số nguyên âm và quy tắc dấu"
        },
        {
          id: "item_inv_1790418077420_64iih_2",
          invoiceId: "inv_1790418077420_64iih",
          lessonId: "ls_gh_02",
          lessonDate: "2026-09-22",
          startTime: "17:30",
          endTime: "19:00",
          periodCount: 2,
          tuitionMode: "PER_PERIOD",
          unitPrice: 45000,
          amount: 90000,
          notes: "Bài tập nâng cao phân tích đa thức"
        }
      ],
      createdAt: "2026-09-26T10:21:17.420Z",
      updatedAt: "2026-09-26T10:21:17.421Z",
      teacherId: "teacher_trang_01"
    }
  ],
  settings: {
    teacherName: "Cô Hoàng Thảo Trang",
    phone: "0905 888 999",
    email: "trang.hoang@edu.vn",
    centerName: "Lớp Bồi Dưỡng Toán & Kỹ Năng",
    address: "45 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh",
    footerNotes: "Cảm ơn Quý phụ huynh đã tin tưởng và đồng hành cùng sự tiến bộ của các con!",
    bankName: "MB Bank (Quân Đội)",
    bankAccountNumber: "0905888999",
    bankAccountName: "HOANG THAO TRANG",
    currency: "VND"
  },
  lastUpdated: "2026-09-26T16:26:06.803Z",
  users: [
    {
      id: "teacher_trang_01",
      userId: "teacher_trang_01",
      fullName: "Cô Hoàng Thảo Trang",
      email: "trang.hoang@edu.vn",
      phone: "0905 888 999",
      role: "TEACHER",
      accountStatus: "ACTIVE",
      passwordSalt: "e23bc24905209f7b8edacf34d9ff18f8",
      passwordHash: "f97978a34781a7242f5800fcbd42a563a88b78b0f3a2b29813d2744d1a273e10391c80d143051424535f3939d4ef4dab5ab540d97822bfaafb8c4228e1275331",
      emailVerifiedAt: "2026-09-26T16:26:06.798Z",
      createdAt: "2026-08-25T08:00:00.000Z",
      updatedAt: "2026-09-26T16:26:06.799Z"
    },
    {
      id: "admin_root_01",
      userId: "admin_root_01",
      fullName: "Quản trị viên Hệ thống",
      email: "admin@tuitionmanager.vn",
      phone: "0900 000 000",
      role: "ADMIN",
      accountStatus: "ACTIVE",
      passwordSalt: "18c62ec75041c1828ebb372eebe12a4f",
      passwordHash: "fe262435805891a01aa65722707565dee30e8949ce37021a8f0dd4542f5910e847975dc0747f9f790ec355d34c9eff52bffdc1cfbc7901299a12494cb0c7504f",
      emailVerifiedAt: "2026-09-26T16:26:06.803Z",
      createdAt: "2026-08-20T08:00:00.000Z",
      updatedAt: "2026-09-26T16:26:06.803Z"
    }
  ],
  teacherSettingsMap: {
    teacher_trang_01: {
      teacherName: "Cô Hoàng Thảo Trang",
      phone: "0905 888 999",
      email: "trang.hoang@edu.vn",
      centerName: "Lớp Bồi Dưỡng Toán & Kỹ Năng",
      address: "45 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh",
      footerNotes: "Cảm ơn Quý phụ huynh đã tin tưởng và đồng hành cùng sự tiến bộ của các con!",
      bankName: "MB Bank (Quân Đội)",
      bankAccountNumber: "0905888999",
      bankAccountName: "HOANG THAO TRANG",
      currency: "VND",
      teacherId: "teacher_trang_01"
    }
  }
};

export const devMailbox = [];

export function hashPassword(password, salt) {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
}

export function generate6DigitCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function createSessionToken(userId) {
  const secret = process.env.JWT_SECRET || process.env.AUTH_SECRET || 'tuition_manager_secret_salt_2026';
  const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000;
  const payload = `${userId}.${expiresAt}`;
  const sig = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  return `tok_v2_${payload}.${sig}`;
}

export function verifySessionToken(token) {
  if (!token || typeof token !== 'string') return null;
  if (token.startsWith('tok_v2_')) {
    const raw = token.slice(7);
    const parts = raw.split('.');
    if (parts.length === 3) {
      const [userId, expiresAtStr, sig] = parts;
      const expiresAt = parseInt(expiresAtStr, 10);
      if (!isNaN(expiresAt) && Date.now() <= expiresAt) {
        const secret = process.env.JWT_SECRET || process.env.AUTH_SECRET || 'tuition_manager_secret_salt_2026';
        const expectedSig = crypto.createHmac('sha256', secret).update(`${userId}.${expiresAt}`).digest('hex');
        if (sig === expectedSig) {
          return { userId };
        }
      }
    }
  }
  return null;
}

export async function sendTransactionalEmail(options) {
  const { to, subject, html, code, token } = options;
  const emailLog = {
    id: `mail_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    to,
    subject,
    body: html,
    code,
    token,
    timestamp: new Date().toISOString(),
  };

  devMailbox.unshift(emailLog);
  if (devMailbox.length > 50) devMailbox.pop();

  const resendApiKey = process.env.RESEND_API_KEY;
  if (resendApiKey) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM || 'Tuition Manager <noreply@tuitionmanager.vn>',
          to: [to],
          subject,
          html,
        }),
      });
      return res.ok;
    } catch (err) {
      console.error('[Resend Error]', err);
    }
  }
  return true;
}

export class DatabaseManager {
  constructor() {
    this.primaryFile = path.resolve(process.cwd(), 'data', 'database.json');
    const tmpDir = process.env.TMPDIR || '/tmp';
    this.fallbackFile = path.resolve(tmpDir, 'tuition_database.json');
    this.memoryData = null;
    this.ensureInitialized();
  }

  sanitizeData(data) {
    if (!data || typeof data !== 'object') return null;
    if (!Array.isArray(data.users)) data.users = [];
    if (!Array.isArray(data.students)) data.students = [];
    if (!Array.isArray(data.schedules)) data.schedules = [];
    if (!Array.isArray(data.lessons)) data.lessons = [];
    if (!Array.isArray(data.invoices)) data.invoices = [];
    if (!data.teacherSettingsMap || typeof data.teacherSettingsMap !== 'object') {
      data.teacherSettingsMap = {};
    }
    return data;
  }

  getRawData() {
    if (this.memoryData) {
      return this.memoryData;
    }

    if (fs.existsSync(this.fallbackFile)) {
      try {
        const raw = fs.readFileSync(this.fallbackFile, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed) {
          this.memoryData = this.sanitizeData(parsed);
          return this.memoryData;
        }
      } catch {}
    }

    if (fs.existsSync(this.primaryFile)) {
      try {
        const raw = fs.readFileSync(this.primaryFile, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed) {
          this.memoryData = this.sanitizeData(parsed);
          return this.memoryData;
        }
      } catch {}
    }

    this.memoryData = JSON.parse(JSON.stringify(SEED_DATABASE));
    return this.memoryData;
  }

  saveRawData(data) {
    data.lastUpdated = new Date().toISOString();
    this.memoryData = this.sanitizeData(data);
    const jsonStr = JSON.stringify(data, null, 2);

    let written = false;
    try {
      const dir = path.dirname(this.primaryFile);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.primaryFile, jsonStr, 'utf-8');
      written = true;
    } catch {}

    if (!written || process.env.VERCEL) {
      try {
        const dir = path.dirname(this.fallbackFile);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(this.fallbackFile, jsonStr, 'utf-8');
      } catch {}
    }
  }

  ensureInitialized() {
    let data = this.getRawData();
    if (!data || !data.users || data.users.length === 0) {
      data = JSON.parse(JSON.stringify(SEED_DATABASE));
      this.saveRawData(data);
    }
  }

  getUserByToken(token) {
    if (!token) return null;
    const data = this.getRawData();
    if (!data || !Array.isArray(data.users)) return null;

    const tokenPayload = verifySessionToken(token);
    if (tokenPayload) {
      const user = data.users.find((u) => u.id === tokenPayload.userId || u.userId === tokenPayload.userId);
      if (user && user.accountStatus !== 'DELETED') {
        return user;
      }
    }
    return null;
  }

  createSession(user) {
    return createSessionToken(user.id);
  }

  deleteSession() {
    // Stateless token expired on logout
  }
}

let dbManagerInstance = null;
export function getDbManager() {
  if (!dbManagerInstance) {
    dbManagerInstance = new DatabaseManager();
  }
  return dbManagerInstance;
}

export function applyCors(req, res) {
  const origin = req.headers?.origin || req.headers?.Origin || '*';

  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return true;
  }
  return false;
}

export function sendJson(req, res, statusCode, data) {
  applyCors(req, res);
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
}

export function parseBody(req, res, callback) {
  if (req.body !== undefined && req.body !== null) {
    if (typeof req.body === 'string') {
      try {
        callback(req.body ? JSON.parse(req.body) : {});
      } catch (err) {
        sendJson(req, res, 400, { error: 'Dữ liệu JSON không hợp lệ: ' + err.message });
      }
    } else {
      callback(req.body);
    }
    return;
  }

  let bodyStr = '';
  req.on('data', (chunk) => {
    bodyStr += chunk;
  });
  req.on('end', () => {
    try {
      const parsed = bodyStr ? JSON.parse(bodyStr) : {};
      callback(parsed);
    } catch (err) {
      sendJson(req, res, 400, { error: 'Dữ liệu JSON không hợp lệ: ' + err.message });
    }
  });
  req.on('error', (err) => {
    sendJson(req, res, 400, { error: 'Lỗi đọc dữ liệu: ' + err.message });
  });
}

export function getBearerToken(req) {
  const authHeader = req.headers?.['authorization'] || req.headers?.['Authorization'];
  if (!authHeader) return null;
  const parts = authHeader.split(' ');
  if (parts.length === 2 && parts[0].toLowerCase() === 'bearer') {
    return parts[1];
  }
  return null;
}

export function getAuthUser(req, dbManager) {
  const token = getBearerToken(req);
  if (!token) return null;
  return dbManager.getUserByToken(token);
}

// ============================================================================
// HANDLERS
// ============================================================================

export async function handleHealth(req, res) {
  if (applyCors(req, res)) return;
  if (req.method !== 'GET') {
    return sendJson(req, res, 405, { error: 'Method Not Allowed' });
  }
  return sendJson(req, res, 200, {
    ok: true,
    service: 'api',
    environment: 'production',
    timestamp: new Date().toISOString(),
  });
}

export async function handleLogin(req, res) {
  if (applyCors(req, res)) return;
  const method = (req.method || 'GET').toUpperCase();
  if (method !== 'POST') {
    return sendJson(req, res, 405, { error: 'Method Not Allowed. Use POST.' });
  }

  const dbManager = getDbManager();
  return parseBody(req, res, (body) => {
    const { email, password } = body;
    if (!email || !password) {
      return sendJson(req, res, 400, { error: 'Vui lòng nhập email và mật khẩu.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const data = dbManager.getRawData();
    const user = data.users.find((u) => u.email.toLowerCase() === cleanEmail);

    if (!user) {
      return sendJson(req, res, 401, { error: 'Email hoặc mật khẩu không đúng.' });
    }

    const computedHash = hashPassword(password, user.passwordSalt);
    if (computedHash !== user.passwordHash) {
      return sendJson(req, res, 401, { error: 'Email hoặc mật khẩu không đúng.' });
    }

    if (user.accountStatus === 'DELETED') {
      return sendJson(req, res, 403, { error: 'Tài khoản này không còn hoạt động.' });
    }

    if (user.accountStatus === 'DISABLED') {
      return sendJson(req, res, 403, { error: 'Tài khoản của bạn đã bị khóa bởi Quản trị viên.' });
    }

    if (user.accountStatus === 'PENDING_VERIFICATION') {
      return sendJson(req, res, 403, {
        error: 'Tài khoản chưa được xác minh. Vui lòng kiểm tra email để kích hoạt.',
        accountStatus: 'PENDING_VERIFICATION',
        email: user.email,
      });
    }

    const sessionToken = dbManager.createSession(user);

    return sendJson(req, res, 200, {
      success: true,
      token: sessionToken,
      user: {
        id: user.id,
        userId: user.userId,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        accountStatus: user.accountStatus,
        emailVerifiedAt: user.emailVerifiedAt,
        themePreference: user.themePreference || 'system',
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  });
}

export async function handleRegister(req, res) {
  if (applyCors(req, res)) return;
  const method = (req.method || 'GET').toUpperCase();
  if (method !== 'POST') {
    return sendJson(req, res, 405, { error: 'Method Not Allowed. Use POST.' });
  }

  const dbManager = getDbManager();
  return parseBody(req, res, async (body) => {
    const { fullName, email, password, confirmPassword, phone } = body;

    if (!fullName || !email || !password || !confirmPassword) {
      return sendJson(req, res, 400, { error: 'Vui lòng điền đầy đủ các thông tin bắt buộc.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return sendJson(req, res, 400, { error: 'Địa chỉ email không hợp lệ.' });
    }

    if (password.length < 6) {
      return sendJson(req, res, 400, { error: 'Mật khẩu phải có độ dài tối thiểu 6 ký tự.' });
    }

    if (password !== confirmPassword) {
      return sendJson(req, res, 400, { error: 'Mật khẩu xác nhận không khớp.' });
    }

    const data = dbManager.getRawData();
    const existing = data.users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      if (existing.accountStatus === 'DELETED') {
        return sendJson(req, res, 400, { error: 'Tài khoản với email này đã từng bị xóa. Vui lòng liên hệ quản trị viên.' });
      }
      return sendJson(req, res, 400, { error: 'Email này đã được đăng ký trong hệ thống.' });
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const hash = hashPassword(password, salt);
    const code = generate6DigitCode();
    const token = 'tok_verify_' + crypto.randomBytes(24).toString('hex');
    const now = new Date().toISOString();

    const newUser = {
      id: `teacher_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: `usr_${Date.now()}`,
      fullName: fullName.trim(),
      email: cleanEmail,
      phone: phone ? phone.trim() : '',
      role: 'TEACHER',
      accountStatus: 'PENDING_VERIFICATION',
      passwordSalt: salt,
      passwordHash: hash,
      verificationCode: code,
      verificationToken: token,
      verificationTokenExpiresAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
      lastResendAt: now,
      createdAt: now,
      updatedAt: now,
    };

    data.users.push(newUser);

    if (!data.teacherSettingsMap) data.teacherSettingsMap = {};
    data.teacherSettingsMap[newUser.id] = {
      teacherId: newUser.id,
      teacherName: newUser.fullName,
      phone: newUser.phone || '',
      email: newUser.email,
      centerName: `Lớp Dạy Của ${newUser.fullName}`,
      address: '',
      footerNotes: 'Cảm ơn Quý phụ huynh đã tin tưởng và đồng hành cùng sự tiến bộ của con!',
      currency: 'VND',
    };

    dbManager.saveRawData(data);

    await sendTransactionalEmail({
      to: cleanEmail,
      subject: 'Xác minh tài khoản giáo viên - Tuition Manager',
      code,
      token,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
          <h2 style="color: #4f46e5;">Xác minh tài khoản giáo viên</h2>
          <p>Xin chào <strong>${newUser.fullName}</strong>,</p>
          <p>Cảm ơn bạn đã đăng ký tài khoản trên hệ thống quản lý học phí Tuition Manager.</p>
          <p>Mã xác minh của bạn là: <strong>${code}</strong></p>
        </div>
      `,
    });

    return sendJson(req, res, 200, {
      success: true,
      message: 'Đăng ký thành công! Vui lòng kiểm tra email để xác minh tài khoản.',
      email: cleanEmail,
      verificationCode: code,
      verificationToken: token,
    });
  });
}

export async function handleVerify(req, res) {
  if (applyCors(req, res)) return;
  const dbManager = getDbManager();
  return parseBody(req, res, (body) => {
    const { email, code, token } = body;
    const data = dbManager.getRawData();

    let user;
    if (token) {
      user = data.users.find((u) => u.verificationToken === token);
    } else if (email && code) {
      const cleanEmail = email.trim().toLowerCase();
      const cleanCode = code.trim();
      user = data.users.find((u) => u.email.toLowerCase() === cleanEmail && u.verificationCode === cleanCode);
    }

    if (!user) {
      return sendJson(req, res, 400, { error: 'Mã xác minh không chính xác hoặc liên kết đã hết hạn.' });
    }

    user.accountStatus = 'ACTIVE';
    user.emailVerifiedAt = new Date().toISOString();
    user.verificationCode = null;
    user.verificationToken = null;
    user.updatedAt = new Date().toISOString();

    dbManager.saveRawData(data);
    const sessionToken = dbManager.createSession(user);

    return sendJson(req, res, 200, {
      success: true,
      message: 'Xác minh tài khoản thành công!',
      token: sessionToken,
      user: {
        id: user.id,
        userId: user.userId,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        accountStatus: user.accountStatus,
        emailVerifiedAt: user.emailVerifiedAt,
        themePreference: user.themePreference || 'system',
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  });
}

export async function handleMe(req, res) {
  if (applyCors(req, res)) return;
  const dbManager = getDbManager();
  const user = getAuthUser(req, dbManager);
  if (!user) {
    return sendJson(req, res, 401, { error: 'Chưa đăng nhập hoặc phiên đã hết hạn.' });
  }

  return sendJson(req, res, 200, {
    user: {
      id: user.id,
      userId: user.userId,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      accountStatus: user.accountStatus,
      emailVerifiedAt: user.emailVerifiedAt,
      themePreference: user.themePreference || 'system',
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
  });
}

export async function handleLogout(req, res) {
  if (applyCors(req, res)) return;
  return sendJson(req, res, 200, { success: true });
}

export async function handleDb(req, res) {
  if (applyCors(req, res)) return;
  const dbManager = getDbManager();
  const user = getAuthUser(req, dbManager);

  if (!user) {
    return sendJson(req, res, 401, { error: 'Vui lòng đăng nhập để truy cập dữ liệu.' });
  }

  if (user.accountStatus !== 'ACTIVE') {
    return sendJson(req, res, 403, { error: 'Tài khoản chưa được kích hoạt hoặc đã bị khóa.' });
  }

  const method = (req.method || 'GET').toUpperCase();

  if (method === 'GET') {
    const data = dbManager.getRawData();
    if (user.role === 'ADMIN') {
      return sendJson(req, res, 200, data);
    }

    const teacherId = user.id;
    const isolatedStudents = (data.students || []).filter((s) => s.teacherId === teacherId);
    const isolatedSchedules = (data.schedules || []).filter((sch) => sch.teacherId === teacherId);
    const isolatedLessons = (data.lessons || []).filter((l) => l.teacherId === teacherId);
    const isolatedInvoices = (data.invoices || []).filter((inv) => inv.teacherId === teacherId);
    const isolatedSettings =
      (data.teacherSettingsMap && data.teacherSettingsMap[teacherId]) ||
      {
        teacherId,
        teacherName: user.fullName,
        phone: user.phone || '',
        email: user.email,
        centerName: `Lớp Dạy Của ${user.fullName}`,
        address: '',
        footerNotes: 'Cảm ơn Quý phụ huynh đã tin tưởng và đồng hành cùng sự tiến bộ của con!',
        currency: 'VND',
      };

    return sendJson(req, res, 200, {
      version: 1,
      students: isolatedStudents,
      schedules: isolatedSchedules,
      lessons: isolatedLessons,
      invoices: isolatedInvoices,
      settings: isolatedSettings,
      lastUpdated: data.lastUpdated,
    });
  }

  if (method === 'POST') {
    return parseBody(req, res, (body) => {
      const data = dbManager.getRawData();
      const teacherId = user.id;

      if (user.role === 'ADMIN') {
        dbManager.saveRawData(body);
        return sendJson(req, res, 200, { success: true });
      }

      const teacherStudents = (body.students || []).map((s) => ({ ...s, teacherId }));
      const teacherSchedules = (body.schedules || []).map((sch) => ({ ...sch, teacherId }));
      const teacherLessons = (body.lessons || []).map((l) => ({ ...l, teacherId }));
      const teacherInvoices = (body.invoices || []).map((inv) => ({ ...inv, teacherId }));

      const otherStudents = (data.students || []).filter((s) => s.teacherId !== teacherId);
      const otherSchedules = (data.schedules || []).filter((sch) => sch.teacherId !== teacherId);
      const otherLessons = (data.lessons || []).filter((l) => l.teacherId !== teacherId);
      const otherInvoices = (data.invoices || []).filter((inv) => inv.teacherId !== teacherId);

      data.students = [...otherStudents, ...teacherStudents];
      data.schedules = [...otherSchedules, ...teacherSchedules];
      data.lessons = [...otherLessons, ...teacherLessons];
      data.invoices = [...otherInvoices, ...teacherInvoices];

      if (!data.teacherSettingsMap) data.teacherSettingsMap = {};
      if (body.settings) {
        data.teacherSettingsMap[teacherId] = { ...body.settings, teacherId };
      }

      dbManager.saveRawData(data);
      return sendJson(req, res, 200, { success: true });
    });
  }

  return sendJson(req, res, 405, { error: 'Method Not Allowed' });
}

export async function handleAdminTeachers(req, res) {
  if (applyCors(req, res)) return;
  const dbManager = getDbManager();
  const user = getAuthUser(req, dbManager);
  if (!user || user.role !== 'ADMIN') {
    return sendJson(req, res, 403, { error: 'Bạn không có quyền truy cập khu vực quản trị.' });
  }

  const data = dbManager.getRawData();
  const teachers = (data.users || [])
    .filter((u) => u.role === 'TEACHER')
    .map((t) => {
      const studentCount = (data.students || []).filter((s) => s.teacherId === t.id).length;
      const invoiceCount = (data.invoices || []).filter((i) => i.teacherId === t.id).length;
      return {
        id: t.id,
        userId: t.userId,
        fullName: t.fullName,
        email: t.email,
        phone: t.phone,
        role: t.role,
        accountStatus: t.accountStatus,
        emailVerifiedAt: t.emailVerifiedAt,
        createdAt: t.createdAt,
        studentCount,
        invoiceCount,
      };
    });

  return sendJson(req, res, 200, { teachers });
}

export async function handleAdminTeachersStatus(req, res) {
  if (applyCors(req, res)) return;
  const dbManager = getDbManager();
  const user = getAuthUser(req, dbManager);
  if (!user || user.role !== 'ADMIN') {
    return sendJson(req, res, 403, { error: 'Bạn không có quyền quản trị.' });
  }

  return parseBody(req, res, (body) => {
    const { teacherId, status } = body;
    if (!['ACTIVE', 'DISABLED'].includes(status)) {
      return sendJson(req, res, 400, { error: 'Trạng thái không hợp lệ.' });
    }

    const data = dbManager.getRawData();
    const teacher = data.users.find((u) => u.id === teacherId);
    if (!teacher) return sendJson(req, res, 404, { error: 'Không tìm thấy giáo viên.' });

    teacher.accountStatus = status;
    teacher.updatedAt = new Date().toISOString();
    dbManager.saveRawData(data);

    return sendJson(req, res, 200, { success: true, teacherId, status });
  });
}

export async function handleAdminTeachersDelete(req, res) {
  if (applyCors(req, res)) return;
  const dbManager = getDbManager();
  const user = getAuthUser(req, dbManager);
  if (!user || user.role !== 'ADMIN') {
    return sendJson(req, res, 403, { error: 'Bạn không có quyền quản trị.' });
  }

  return parseBody(req, res, (body) => {
    const { teacherId } = body;
    const data = dbManager.getRawData();
    const teacher = data.users.find((u) => u.id === teacherId);
    if (!teacher) return sendJson(req, res, 404, { error: 'Không tìm thấy giáo viên.' });

    teacher.accountStatus = 'DELETED';
    teacher.deletedAt = new Date().toISOString();
    teacher.updatedAt = new Date().toISOString();
    dbManager.saveRawData(data);

    return sendJson(req, res, 200, {
      success: true,
      message: `Đã khóa và đánh dấu xóa giáo viên ${teacher.fullName}. Toàn bộ dữ liệu phiếu học phí và lịch sử tài chính vẫn được bảo toàn an toàn.`,
    });
  });
}

export async function handleResendVerification(req, res) {
  if (applyCors(req, res)) return;
  const dbManager = getDbManager();
  return parseBody(req, res, async (body) => {
    const { email } = body;
    if (!email) return sendJson(req, res, 400, { error: 'Vui lòng cung cấp email.' });

    const cleanEmail = email.trim().toLowerCase();
    const data = dbManager.getRawData();
    const user = data.users.find((u) => u.email.toLowerCase() === cleanEmail);

    if (!user) {
      return sendJson(req, res, 404, { error: 'Không tìm thấy tài khoản với email này.' });
    }

    if (user.accountStatus === 'ACTIVE') {
      return sendJson(req, res, 400, { error: 'Tài khoản đã được xác minh trước đó.' });
    }

    const now = Date.now();
    if (user.lastResendAt && now - new Date(user.lastResendAt).getTime() < 60 * 1000) {
      const waitSeconds = Math.ceil((60 * 1000 - (now - new Date(user.lastResendAt).getTime())) / 1000);
      return sendJson(req, res, 429, { error: `Vui lòng đợi ${waitSeconds} giây trước khi yêu cầu mã mới.` });
    }

    const code = generate6DigitCode();
    const token = 'tok_verify_' + crypto.randomBytes(24).toString('hex');
    user.verificationCode = code;
    user.verificationToken = token;
    user.verificationTokenExpiresAt = new Date(now + 24 * 3600 * 1000).toISOString();
    user.lastResendAt = new Date(now).toISOString();
    user.updatedAt = new Date(now).toISOString();

    dbManager.saveRawData(data);

    await sendTransactionalEmail({
      to: cleanEmail,
      subject: 'Gửi lại mã xác minh tài khoản - Tuition Manager',
      code,
      token,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
          <h2 style="color: #4f46e5;">Mã xác minh mới của bạn</h2>
          <p>Xin chào <strong>${user.fullName}</strong>,</p>
          <p>Mã xác minh tài khoản mới của bạn là: <strong>${code}</strong></p>
        </div>
      `,
    });

    return sendJson(req, res, 200, {
      success: true,
      message: 'Email xác minh đã được gửi đến địa chỉ email của bạn.',
      verificationCode: code,
      verificationToken: token,
    });
  });
}

export async function handleForgotPassword(req, res) {
  if (applyCors(req, res)) return;
  const dbManager = getDbManager();
  return parseBody(req, res, async (body) => {
    const { email } = body;
    if (!email) return sendJson(req, res, 400, { error: 'Vui lòng cung cấp email.' });

    const cleanEmail = email.trim().toLowerCase();
    const data = dbManager.getRawData();
    const user = data.users.find((u) => u.email.toLowerCase() === cleanEmail);

    if (user && user.accountStatus !== 'DELETED') {
      const resetToken = 'tok_reset_' + crypto.randomBytes(24).toString('hex');
      user.resetPasswordToken = resetToken;
      user.resetPasswordExpiresAt = new Date(Date.now() + 2 * 3600 * 1000).toISOString();
      dbManager.saveRawData(data);

      await sendTransactionalEmail({
        to: cleanEmail,
        subject: 'Đặt lại mật khẩu - Tuition Manager',
        token: resetToken,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
            <h2 style="color: #4f46e5;">Yêu cầu đặt lại mật khẩu</h2>
            <p>Xin chào <strong>${user.fullName}</strong>,</p>
            <p>Mã token đặt lại mật khẩu của bạn là: <strong>${resetToken}</strong></p>
          </div>
        `,
      });
    }

    return sendJson(req, res, 200, {
      success: true,
      message: 'Nếu email tồn tại trong hệ thống, hướng dẫn đặt lại mật khẩu đã được gửi đến bạn.',
    });
  });
}

export async function handleResetPassword(req, res) {
  if (applyCors(req, res)) return;
  const dbManager = getDbManager();
  return parseBody(req, res, (body) => {
    const { token, newPassword } = body;
    if (!token || !newPassword) {
      return sendJson(req, res, 400, { error: 'Vui lòng cung cấp mã token và mật khẩu mới.' });
    }

    if (newPassword.length < 6) {
      return sendJson(req, res, 400, { error: 'Mật khẩu mới phải có tối thiểu 6 ký tự.' });
    }

    const data = dbManager.getRawData();
    const user = data.users.find((u) => u.resetPasswordToken === token);

    if (!user || (user.resetPasswordExpiresAt && new Date() > new Date(user.resetPasswordExpiresAt))) {
      return sendJson(req, res, 400, { error: 'Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.' });
    }

    user.passwordSalt = crypto.randomBytes(16).toString('hex');
    user.passwordHash = hashPassword(newPassword, user.passwordSalt);
    user.resetPasswordToken = null;
    user.resetPasswordExpiresAt = null;
    user.updatedAt = new Date().toISOString();

    dbManager.saveRawData(data);

    return sendJson(req, res, 200, {
      success: true,
      message: 'Đặt lại mật khẩu thành công! Bạn có thể đăng nhập ngay.',
    });
  });
}

export async function handleUpdateProfile(req, res) {
  if (applyCors(req, res)) return;
  const dbManager = getDbManager();
  const user = getAuthUser(req, dbManager);
  if (!user) return sendJson(req, res, 401, { error: 'Chưa đăng nhập.' });

  return parseBody(req, res, (body) => {
    const { fullName, phone, themePreference, email } = body;
    const data = dbManager.getRawData();
    const targetUser = data.users.find((u) => u.id === user.id);

    if (!targetUser) return sendJson(req, res, 404, { error: 'Không tìm thấy người dùng.' });

    if (fullName) targetUser.fullName = fullName.trim();
    if (phone !== undefined) targetUser.phone = phone.trim();
    if (themePreference && ['light', 'dark', 'system'].includes(themePreference)) {
      targetUser.themePreference = themePreference;
    }

    if (email && email.trim().toLowerCase() !== targetUser.email.toLowerCase()) {
      const newEmail = email.trim().toLowerCase();
      const emailExists = data.users.some(
        (u) => u.id !== targetUser.id && u.email.toLowerCase() === newEmail
      );
      if (emailExists) {
        return sendJson(req, res, 400, { error: 'Địa chỉ email này đã được sử dụng bởi tài khoản khác.' });
      }
      targetUser.email = newEmail;
      targetUser.accountStatus = 'PENDING_VERIFICATION';
      targetUser.emailVerifiedAt = null;
      targetUser.verificationCode = generate6DigitCode();
      targetUser.verificationToken = 'tok_verify_' + crypto.randomBytes(24).toString('hex');
    }

    targetUser.updatedAt = new Date().toISOString();
    dbManager.saveRawData(data);

    return sendJson(req, res, 200, {
      success: true,
      user: {
        id: targetUser.id,
        userId: targetUser.userId,
        fullName: targetUser.fullName,
        email: targetUser.email,
        phone: targetUser.phone,
        role: targetUser.role,
        accountStatus: targetUser.accountStatus,
        emailVerifiedAt: targetUser.emailVerifiedAt,
        themePreference: targetUser.themePreference || 'system',
        createdAt: targetUser.createdAt,
        updatedAt: targetUser.updatedAt,
      },
    });
  });
}

