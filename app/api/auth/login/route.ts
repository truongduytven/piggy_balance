import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import pool from '../../../lib/db';
import { signAuthToken, AUTH_COOKIE_NAME, SESSION_MAX_AGE_SECONDS } from '../../../lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: 'Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu!' },
        { status: 400 }
      );
    }

    const trimmedUsername = String(username).trim();
    const cleanPassword = String(password);

    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT id, username, password_hash, display_name FROM users WHERE LOWER(username) = LOWER($1)`,
        [trimmedUsername]
      );

      if (result.rows.length === 0) {
        return NextResponse.json(
          { success: false, message: 'Tài khoản không tồn tại. Bạn kiểm tra lại nha 🥺' },
          { status: 401 }
        );
      }

      const user = result.rows[0];
      const isPasswordMatch = await bcrypt.compare(cleanPassword, user.password_hash);

      if (!isPasswordMatch) {
        return NextResponse.json(
          { success: false, message: 'Mật khẩu chưa chính xác rồi bạn ơi 🥺' },
          { status: 401 }
        );
      }

      const authUser = {
        id: user.id,
        username: user.username,
        displayName: user.display_name || user.username,
      };

      const token = signAuthToken(authUser);
      const expiresAt = Date.now() + SESSION_MAX_AGE_SECONDS * 1000;

      const response = NextResponse.json({
        success: true,
        message: `Chào mừng ${authUser.displayName} trở lại 🌱`,
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
    console.error('Lỗi khi đăng nhập:', error);
    return NextResponse.json(
      { success: false, message: 'Đã xảy ra lỗi máy chủ khi đăng nhập' },
      { status: 500 }
    );
  }
}
