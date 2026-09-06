import { NextResponse } from 'next/server';
import { getAuthUserFromRequest } from '../../../lib/auth';
import pool from '../../../lib/db';

export async function GET(request: Request) {
  try {
    const authUser = await getAuthUserFromRequest(request);

    if (!authUser) {
      return NextResponse.json(
        { success: false, authenticated: false, message: 'Chưa đăng nhập hoặc phiên đã hết hạn' },
        { status: 401 }
      );
    }

    // Xác thực lại trong DB để chắc chắn user vẫn tồn tại
    const client = await pool.connect();
    try {
      const res = await client.query(
        `SELECT id, username, display_name FROM users WHERE id = $1`,
        [authUser.id]
      );

      if (res.rows.length === 0) {
        return NextResponse.json(
          { success: false, authenticated: false, message: 'Tài khoản không còn tồn tại' },
          { status: 401 }
        );
      }

      const user = res.rows[0];
      return NextResponse.json({
        success: true,
        authenticated: true,
        user: {
          id: user.id,
          username: user.username,
          displayName: user.display_name,
        },
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Lỗi kiểm tra phiên me:', error);
    return NextResponse.json(
      { success: false, authenticated: false, message: 'Lỗi máy chủ' },
      { status: 500 }
    );
  }
}
