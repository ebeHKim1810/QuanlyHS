import { DatabaseManager, hashPassword, generate6DigitCode, sendTransactionalEmail, type UserRecord } from './apiServer.ts';
import crypto from 'crypto';

// Singleton DB Manager instance
let globalDbManager: DatabaseManager | null = null;
export function getDbManager(): DatabaseManager {
  if (!globalDbManager) {
    globalDbManager = new DatabaseManager();
  }
  return globalDbManager;
}

/**
 * Handle CORS headers for preflight and standard requests
 */
export function applyCors(req: any, res: any): boolean {
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

/**
 * Helper to send JSON response with CORS headers
 */
export function sendJson(req: any, res: any, statusCode: number, data: any): void {
  applyCors(req, res);
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
}

/**
 * Helper to parse JSON body (handles pre-parsed bodies on Vercel & streams in dev)
 */
export function parseBody(req: any, res: any, callback: (body: any) => void): void {
  if (req.body !== undefined && req.body !== null) {
    if (typeof req.body === 'string') {
      try {
        callback(req.body ? JSON.parse(req.body) : {});
      } catch (err: any) {
        sendJson(req, res, 400, { error: 'Dữ liệu JSON không hợp lệ: ' + err.message });
      }
    } else {
      callback(req.body);
    }
    return;
  }

  let bodyStr = '';
  req.on('data', (chunk: any) => {
    bodyStr += chunk;
  });
  req.on('end', () => {
    try {
      const parsed = bodyStr ? JSON.parse(bodyStr) : {};
      callback(parsed);
    } catch (err: any) {
      sendJson(req, res, 400, { error: 'Dữ liệu JSON không hợp lệ: ' + err.message });
    }
  });
  req.on('error', (err: any) => {
    sendJson(req, res, 400, { error: 'Lỗi đọc dữ liệu: ' + err.message });
  });
}

/**
 * Extract Bearer token from authorization header
 */
export function getBearerToken(req: any): string | null {
  const authHeader = req.headers?.['authorization'] || req.headers?.['Authorization'];
  if (!authHeader) return null;
  const parts = authHeader.split(' ');
  if (parts.length === 2 && parts[0].toLowerCase() === 'bearer') {
    return parts[1];
  }
  return null;
}

/**
 * Get authenticated user from request token
 */
export function getAuthUser(req: any, dbManager: DatabaseManager): UserRecord | null {
  const token = getBearerToken(req);
  if (!token) return null;
  return dbManager.getUserByToken(token);
}

// ============================================================================
// CONTROLLERS
// ============================================================================

/**
 * GET /api/health or GET /api
 */
export async function healthController(req: any, res: any): Promise<void> {
  if (applyCors(req, res)) return;
  return sendJson(req, res, 200, {
    ok: true,
    status: 'online',
    service: 'Tuition Manager API',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
  });
}

/**
 * POST /api/auth/login or POST /api/login
 */
export async function loginController(req: any, res: any): Promise<void> {
  if (applyCors(req, res)) return;

  const method = req.method ? req.method.toUpperCase() : 'GET';
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
    const user = data.users.find((u: UserRecord) => u.email.toLowerCase() === cleanEmail);

    if (!user) {
      return sendJson(req, res, 401, { error: 'Email hoặc mật khẩu không đúng.' });
    }

    // Verify password
    const computedHash = hashPassword(password, user.passwordSalt);
    if (computedHash !== user.passwordHash) {
      return sendJson(req, res, 401, { error: 'Email hoặc mật khẩu không đúng.' });
    }

    // Check account status
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

/**
 * POST /api/auth/register
 */
export async function registerController(req: any, res: any): Promise<void> {
  if (applyCors(req, res)) return;

  const method = req.method ? req.method.toUpperCase() : 'GET';
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
    const existing = data.users.find((u: UserRecord) => u.email.toLowerCase() === cleanEmail);
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

    const newUser: UserRecord = {
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

    // Send verification email
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
          <p>Mã xác minh của bạn là:</p>
          <div style="background: #f1f5f9; padding: 15px; border-radius: 8px; font-size: 24px; font-weight: bold; letter-spacing: 4px; text-align: center; color: #1e293b;">
            ${code}
          </div>
          <p style="margin-top: 20px; font-size: 13px; color: #64748b;">
            Mã xác minh có hiệu lực trong 24 giờ.
          </p>
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

/**
 * POST /api/auth/verify
 */
export async function verifyEmailController(req: any, res: any): Promise<void> {
  if (applyCors(req, res)) return;

  const dbManager = getDbManager();
  return parseBody(req, res, (body) => {
    const { email, code, token } = body;
    const data = dbManager.getRawData();

    let user: UserRecord | undefined;
    if (token) {
      user = data.users.find((u: UserRecord) => u.verificationToken === token);
    } else if (email && code) {
      const cleanEmail = email.trim().toLowerCase();
      const cleanCode = code.trim();
      user = data.users.find(
        (u: UserRecord) => u.email.toLowerCase() === cleanEmail && u.verificationCode === cleanCode
      );
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
      message: 'Xác minh tài khoản thành công! Bạn có thể sử dụng hệ thống ngay bây giờ.',
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

/**
 * POST /api/auth/resend-verification
 */
export async function resendVerificationController(req: any, res: any): Promise<void> {
  if (applyCors(req, res)) return;

  const dbManager = getDbManager();
  return parseBody(req, res, async (body) => {
    const { email } = body;
    if (!email) return sendJson(req, res, 400, { error: 'Vui lòng cung cấp địa chỉ email.' });

    const cleanEmail = email.trim().toLowerCase();
    const data = dbManager.getRawData();
    const user = data.users.find((u: UserRecord) => u.email.toLowerCase() === cleanEmail);

    if (!user) {
      return sendJson(req, res, 404, { error: 'Không tìm thấy tài khoản với email này.' });
    }

    if (user.accountStatus === 'ACTIVE') {
      return sendJson(req, res, 400, { error: 'Tài khoản này đã được xác minh trước đó.' });
    }

    if (user.lastResendAt) {
      const diffMs = Date.now() - new Date(user.lastResendAt).getTime();
      if (diffMs < 60000) {
        const waitSec = Math.ceil((60000 - diffMs) / 1000);
        return sendJson(req, res, 429, { error: `Vui lòng đợi ${waitSec} giây trước khi yêu cầu gửi lại email.` });
      }
    }

    const code = generate6DigitCode();
    const token = 'tok_verify_' + crypto.randomBytes(24).toString('hex');
    user.verificationCode = code;
    user.verificationToken = token;
    user.verificationTokenExpiresAt = new Date(Date.now() + 24 * 3600 * 1000).toISOString();
    user.lastResendAt = new Date().toISOString();

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
          <p>Mã xác minh tài khoản mới của bạn là:</p>
          <div style="background: #f1f5f9; padding: 15px; border-radius: 8px; font-size: 24px; font-weight: bold; letter-spacing: 4px; text-align: center; color: #1e293b;">
            ${code}
          </div>
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

/**
 * GET /api/auth/me
 */
export async function meController(req: any, res: any): Promise<void> {
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

/**
 * POST /api/auth/logout
 */
export async function logoutController(req: any, res: any): Promise<void> {
  if (applyCors(req, res)) return;

  const dbManager = getDbManager();
  const token = getBearerToken(req);
  if (token) dbManager.deleteSession(token);
  return sendJson(req, res, 200, { success: true });
}

/**
 * POST /api/auth/forgot-password
 */
export async function forgotPasswordController(req: any, res: any): Promise<void> {
  if (applyCors(req, res)) return;

  const dbManager = getDbManager();
  return parseBody(req, res, async (body) => {
    const { email } = body;
    if (!email) return sendJson(req, res, 400, { error: 'Vui lòng cung cấp email.' });

    const cleanEmail = email.trim().toLowerCase();
    const data = dbManager.getRawData();
    const user = data.users.find((u: UserRecord) => u.email.toLowerCase() === cleanEmail);

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
            <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.</p>
            <p>Mã token đặt lại mật khẩu của bạn là:</p>
            <div style="background: #f1f5f9; padding: 12px; border-radius: 8px; font-family: monospace; font-size: 16px; word-break: break-all; color: #1e293b;">
              ${resetToken}
            </div>
            <p style="margin-top: 15px; font-size: 13px; color: #64748b;">
              Token này có hiệu lực trong 2 giờ.
            </p>
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

/**
 * POST /api/auth/reset-password
 */
export async function resetPasswordController(req: any, res: any): Promise<void> {
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
    const user = data.users.find((u: UserRecord) => u.resetPasswordToken === token);

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

/**
 * POST /api/auth/update-profile
 */
export async function updateProfileController(req: any, res: any): Promise<void> {
  if (applyCors(req, res)) return;

  const dbManager = getDbManager();
  const user = getAuthUser(req, dbManager);
  if (!user) return sendJson(req, res, 401, { error: 'Chưa đăng nhập.' });

  return parseBody(req, res, (body) => {
    const { fullName, phone, themePreference, email } = body;
    const data = dbManager.getRawData();
    const targetUser = data.users.find((u: UserRecord) => u.id === user.id);

    if (!targetUser) return sendJson(req, res, 404, { error: 'Không tìm thấy người dùng.' });

    if (fullName) targetUser.fullName = fullName.trim();
    if (phone !== undefined) targetUser.phone = phone.trim();
    if (themePreference && ['light', 'dark', 'system'].includes(themePreference)) {
      targetUser.themePreference = themePreference;
    }

    // Email update handling with re-verification
    if (email && email.trim().toLowerCase() !== targetUser.email.toLowerCase()) {
      const newEmail = email.trim().toLowerCase();
      const emailExists = data.users.some(
        (u: UserRecord) => u.id !== targetUser.id && u.email.toLowerCase() === newEmail
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

/**
 * GET /api/admin/teachers
 */
export async function adminTeachersController(req: any, res: any): Promise<void> {
  if (applyCors(req, res)) return;

  const dbManager = getDbManager();
  const user = getAuthUser(req, dbManager);
  if (!user || user.role !== 'ADMIN') {
    return sendJson(req, res, 403, { error: 'Bạn không có quyền truy cập khu vực quản trị.' });
  }

  const data = dbManager.getRawData();
  const teachers = data.users
    .filter((u: UserRecord) => u.role === 'TEACHER')
    .map((t: UserRecord) => {
      const studentCount = (data.students || []).filter((s: any) => s.teacherId === t.id).length;
      const invoiceCount = (data.invoices || []).filter((i: any) => i.teacherId === t.id).length;
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

/**
 * POST /api/admin/teachers/status
 */
export async function adminTeachersStatusController(req: any, res: any): Promise<void> {
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
    const teacher = data.users.find((u: UserRecord) => u.id === teacherId);
    if (!teacher) return sendJson(req, res, 404, { error: 'Không tìm thấy giáo viên.' });

    teacher.accountStatus = status;
    teacher.updatedAt = new Date().toISOString();
    dbManager.saveRawData(data);

    return sendJson(req, res, 200, { success: true, teacherId, status });
  });
}

/**
 * POST /api/admin/teachers/delete
 */
export async function adminTeachersDeleteController(req: any, res: any): Promise<void> {
  if (applyCors(req, res)) return;

  const dbManager = getDbManager();
  const user = getAuthUser(req, dbManager);
  if (!user || user.role !== 'ADMIN') {
    return sendJson(req, res, 403, { error: 'Bạn không có quyền quản trị.' });
  }

  return parseBody(req, res, (body) => {
    const { teacherId } = body;
    const data = dbManager.getRawData();
    const teacher = data.users.find((u: UserRecord) => u.id === teacherId);
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

/**
 * GET & POST /api/db
 */
export async function dbController(req: any, res: any): Promise<void> {
  if (applyCors(req, res)) return;

  const dbManager = getDbManager();
  const user = getAuthUser(req, dbManager);

  if (!user) {
    return sendJson(req, res, 401, { error: 'Vui lòng đăng nhập để truy cập dữ liệu.' });
  }

  if (user.accountStatus !== 'ACTIVE') {
    return sendJson(req, res, 403, { error: 'Tài khoản chưa được kích hoạt hoặc đã bị khóa.' });
  }

  const method = req.method ? req.method.toUpperCase() : 'GET';

  // GET /api/db
  if (method === 'GET') {
    const data = dbManager.getRawData();
    if (user.role === 'ADMIN') {
      return sendJson(req, res, 200, data);
    }

    // Teacher isolation
    const teacherId = user.id;
    const isolatedStudents = (data.students || []).filter((s: any) => s.teacherId === teacherId);
    const isolatedSchedules = (data.schedules || []).filter((sch: any) => sch.teacherId === teacherId);
    const isolatedLessons = (data.lessons || []).filter((l: any) => l.teacherId === teacherId);
    const isolatedInvoices = (data.invoices || []).filter((inv: any) => inv.teacherId === teacherId);
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

  // POST /api/db
  if (method === 'POST') {
    return parseBody(req, res, (body) => {
      const data = dbManager.getRawData();
      const teacherId = user.id;

      if (user.role === 'ADMIN') {
        dbManager.saveRawData(body);
        return sendJson(req, res, 200, { success: true });
      }

      const teacherStudents = (body.students || []).map((s: any) => ({ ...s, teacherId }));
      const teacherSchedules = (body.schedules || []).map((sch: any) => ({ ...sch, teacherId }));
      const teacherLessons = (body.lessons || []).map((l: any) => ({ ...l, teacherId }));
      const teacherInvoices = (body.invoices || []).map((inv: any) => ({ ...inv, teacherId }));

      const otherStudents = (data.students || []).filter((s: any) => s.teacherId !== teacherId);
      const otherSchedules = (data.schedules || []).filter((sch: any) => sch.teacherId !== teacherId);
      const otherLessons = (data.lessons || []).filter((l: any) => l.teacherId !== teacherId);
      const otherInvoices = (data.invoices || []).filter((inv: any) => inv.teacherId !== teacherId);

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
