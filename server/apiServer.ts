import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface UserRecord {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  phone?: string;
  role: 'TEACHER' | 'ADMIN';
  accountStatus: 'PENDING_VERIFICATION' | 'ACTIVE' | 'DISABLED' | 'DELETED';
  passwordHash: string;
  passwordSalt: string;
  emailVerifiedAt?: string | null;
  verificationToken?: string | null;
  verificationCode?: string | null;
  verificationTokenExpiresAt?: string | null;
  resetPasswordToken?: string | null;
  resetPasswordExpiresAt?: string | null;
  lastResendAt?: string | null;
  themePreference?: 'light' | 'dark' | 'system';
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface StoredSession {
  token: string;
  userId: string;
  createdAt: number;
  expiresAt: number;
}

// In-memory active sessions
const sessionsMap = new Map<string, StoredSession>();

// In-memory dev mailbox store to verify emails easily in development
export interface SentEmailLog {
  id: string;
  to: string;
  subject: string;
  body: string;
  code?: string;
  token?: string;
  timestamp: string;
}
export const devMailbox: SentEmailLog[] = [];

// Password hashing utility with unique cryptographic salt
export function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
}

export function generateToken(): string {
  return 'tok_' + crypto.randomBytes(32).toString('hex');
}

export function generate6DigitCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Transactional email sender
 * Uses SMTP / Resend if environment variables are provided,
 * otherwise logs to console and stores in devMailbox.
 */
export async function sendTransactionalEmail(options: {
  to: string;
  subject: string;
  html: string;
  code?: string;
  token?: string;
}): Promise<boolean> {
  const { to, subject, html, code, token } = options;
  const emailLog: SentEmailLog = {
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

  console.log('\n================================================================');
  console.log(`[EMAIL DISPATCH] To: ${to}`);
  console.log(`Subject: ${subject}`);
  if (code) console.log(`Verification Code: ${code}`);
  if (token) console.log(`Token: ${token}`);
  console.log('================================================================\n');

  // Check for Resend API Key
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

/**
 * Database manager & migrator
 */
export class DatabaseManager {
  private dbDir: string;
  private dbFile: string;

  constructor() {
    this.dbDir = path.resolve(process.cwd(), 'data');
    this.dbFile = path.resolve(this.dbDir, 'database.json');
    if (!fs.existsSync(this.dbDir)) {
      fs.mkdirSync(this.dbDir, { recursive: true });
    }
    this.ensureInitializedAndMigrated();
  }

  getRawData(): any {
    if (!fs.existsSync(this.dbFile)) return null;
    try {
      const data = JSON.parse(fs.readFileSync(this.dbFile, 'utf-8'));
      if (data) {
        if (!Array.isArray(data.users)) data.users = [];
        if (!Array.isArray(data.students)) data.students = [];
        if (!Array.isArray(data.schedules)) data.schedules = [];
        if (!Array.isArray(data.lessons)) data.lessons = [];
        if (!Array.isArray(data.invoices)) data.invoices = [];
        if (!data.teacherSettingsMap) data.teacherSettingsMap = {};
      }
      return data;
    } catch {
      return null;
    }
  }

  saveRawData(data: any): void {
    data.lastUpdated = new Date().toISOString();
    fs.writeFileSync(this.dbFile, JSON.stringify(data, null, 2), 'utf-8');
  }

  /**
   * Migrate existing single-teacher data to multi-tenant schema with default teacher & admin
   */
  ensureInitializedAndMigrated(): void {
    let data = this.getRawData();
    if (!data) {
      data = {
        version: 1,
        users: [],
        students: [],
        schedules: [],
        lessons: [],
        invoices: [],
        settings: {
          teacherName: 'Cô Hoàng Thảo Trang',
          phone: '0905 888 999',
          email: 'trang.hoang@edu.vn',
          centerName: 'Lớp Bồi Dưỡng Toán & Kỹ Năng',
          address: '45 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh',
          footerNotes: 'Cảm ơn Quý phụ huynh đã tin tưởng và đồng hành cùng sự tiến bộ của các con!',
          bankName: 'MB Bank (Quân Đội)',
          bankAccountNumber: '0905888999',
          bankAccountName: 'HOANG THAO TRANG',
          currency: 'VND',
        },
        teacherSettingsMap: {},
        lastUpdated: new Date().toISOString(),
      };
    }

    let needsSave = false;

    if (!Array.isArray(data.users)) {
      data.users = [];
      needsSave = true;
    }

    if (!data.teacherSettingsMap) {
      data.teacherSettingsMap = {};
    }

    // Check if default Teacher exists
    let defaultTeacher = data.users.find((u: UserRecord) => u.email.toLowerCase() === 'trang.hoang@edu.vn');
    if (!defaultTeacher) {
      const salt = crypto.randomBytes(16).toString('hex');
      const hash = hashPassword('Trang@123456', salt);
      defaultTeacher = {
        id: 'teacher_trang_01',
        userId: 'teacher_trang_01',
        fullName: data.settings?.teacherName || 'Cô Hoàng Thảo Trang',
        email: 'trang.hoang@edu.vn',
        phone: data.settings?.phone || '0905 888 999',
        role: 'TEACHER',
        accountStatus: 'ACTIVE',
        passwordSalt: salt,
        passwordHash: hash,
        emailVerifiedAt: new Date().toISOString(),
        createdAt: '2026-08-25T08:00:00.000Z',
        updatedAt: new Date().toISOString(),
      };
      data.users.push(defaultTeacher);
      needsSave = true;
    }

    // Check if default Admin exists
    let defaultAdmin = data.users.find((u: UserRecord) => u.email.toLowerCase() === 'admin@tuitionmanager.vn');
    if (!defaultAdmin) {
      const salt = crypto.randomBytes(16).toString('hex');
      const hash = hashPassword('Admin@123456', salt);
      defaultAdmin = {
        id: 'admin_root_01',
        userId: 'admin_root_01',
        fullName: 'Quản trị viên Hệ thống',
        email: 'admin@tuitionmanager.vn',
        phone: '0900 000 000',
        role: 'ADMIN',
        accountStatus: 'ACTIVE',
        passwordSalt: salt,
        passwordHash: hash,
        emailVerifiedAt: new Date().toISOString(),
        createdAt: '2026-08-20T08:00:00.000Z',
        updatedAt: new Date().toISOString(),
      };
      data.users.push(defaultAdmin);
      needsSave = true;
    }

    // Attach teacherId to existing single-teacher records if missing
    const teacherId = defaultTeacher.id;

    if (Array.isArray(data.students)) {
      data.students.forEach((s: any) => {
        if (!s.teacherId) {
          s.teacherId = teacherId;
          needsSave = true;
        }
      });
    }

    if (Array.isArray(data.schedules)) {
      data.schedules.forEach((sch: any) => {
        if (!sch.teacherId) {
          sch.teacherId = teacherId;
          needsSave = true;
        }
      });
    }

    if (Array.isArray(data.lessons)) {
      data.lessons.forEach((l: any) => {
        if (!l.teacherId) {
          l.teacherId = teacherId;
          needsSave = true;
        }
      });
    }

    if (Array.isArray(data.invoices)) {
      data.invoices.forEach((inv: any) => {
        if (!inv.teacherId) {
          inv.teacherId = teacherId;
          needsSave = true;
        }
      });
    }

    // Initialize teacherSettingsMap for default teacher
    if (!data.teacherSettingsMap[teacherId] && data.settings) {
      data.teacherSettingsMap[teacherId] = {
        ...data.settings,
        teacherId,
      };
      needsSave = true;
    }

    if (needsSave) {
      this.saveRawData(data);
    }
  }

  // Get user by token
  getUserByToken(token: string): UserRecord | null {
    if (!token) return null;
    const session = sessionsMap.get(token);
    if (!session) return null;
    if (Date.now() > session.expiresAt) {
      sessionsMap.delete(token);
      return null;
    }

    const data = this.getRawData();
    if (!data || !Array.isArray(data.users)) return null;
    const user = data.users.find((u: UserRecord) => u.id === session.userId);
    return user || null;
  }

  // Create session for user
  createSession(user: UserRecord): string {
    const token = generateToken();
    const now = Date.now();
    const session: StoredSession = {
      token,
      userId: user.id,
      createdAt: now,
      expiresAt: now + 30 * 24 * 60 * 60 * 1000, // 30 days
    };
    sessionsMap.set(token, session);
    return token;
  }

  deleteSession(token: string): void {
    sessionsMap.delete(token);
  }
}
