import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import pool from '../../../lib/db';
import { signAuthToken, AUTH_COOKIE_NAME, SESSION_MAX_AGE_SECONDS } from '../../../lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password, passwordKey, displayName } = body;

    // 1. Kiểm tra mã bí mật PASSWORD_KEY bắt buộc
    const systemKey = (process.env.PASSWORD_KEY || 'Congchua1802').trim();
    if (!passwordKey || String(passwordKey).trim() !== systemKey) {
      return NextResponse.json(
        {
          success: false,
          message: 'Mã bảo mật hệ thống (PASSWORD_KEY) không chính xác! Không thể tạo tài khoản.',
        },
        { status: 403 }
      );
    }

    // 2. Kiểm tra dữ liệu đầu vào
    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: 'Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu!' },
        { status: 400 }
      );
    }

    const trimmedUsername = String(username).trim();
    if (trimmedUsername.length < 2) {
      return NextResponse.json(
        { success: false, message: 'Tên đăng nhập phải có ít nhất 2 ký tự!' },
        { status: 400 }
      );
    }

    if (String(password).length < 4) {
      return NextResponse.json(
        { success: false, message: 'Mật khẩu phải có ít nhất 4 ký tự!' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    try {
      // 3. Kiểm tra xem username đã tồn tại chưa
      const checkExist = await client.query(
        `SELECT id FROM users WHERE LOWER(username) = LOWER($1)`,
        [trimmedUsername]
      );

      if (checkExist.rows.length > 0) {
        return NextResponse.json(
          { success: false, message: 'Tên đăng nhập này đã có người sử dụng rồi 🥺' },
          { status: 409 }
        );
      }

      // 4. Hash mật khẩu và tạo user mới
      const passwordHash = await bcrypt.hash(String(password), 10);
      const newUserId = `usr-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
      const finalDisplayName = displayName?.trim() || trimmedUsername;

      await client.query(
        `INSERT INTO users (id, username, password_hash, display_name)
         VALUES ($1, $2, $3, $4)`,
        [newUserId, trimmedUsername, passwordHash, finalDisplayName]
      );

      const authUser = {
        id: newUserId,
        username: trimmedUsername,
        displayName: finalDisplayName,
      };

      const token = signAuthToken(authUser);
      const expiresAt = Date.now() + SESSION_MAX_AGE_SECONDS * 1000;

      const response = NextResponse.json({
        success: true,
        message: `Đăng ký thành công! Chào mừng ${authUser.displayName} 🌱`,
        user: authUser,
        token,
        expiresAt,
      });

      // Lưu Cookie an toàn 7 ngày (1 tuần)
      response.cookies.set({
        name: AUTH_COOKIE_NAME,
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: SESSION_MAX_AGE_SECONDS,
      });

      return response;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Lỗi khi đăng ký:', error);
    return NextResponse.json(
      { success: false, message: 'Đã xảy ra lỗi máy chủ khi đăng ký' },
      { status: 500 }
    );
  }
}
