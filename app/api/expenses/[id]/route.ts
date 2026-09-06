import { NextResponse } from 'next/server';
import pool from '../../../lib/db';
import { getAuthUserFromRequest } from '../../../lib/auth';

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await getAuthUserFromRequest(request);
    if (!authUser) {
      return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
    }

    const { id } = await context.params;

    if (!id) {
      return NextResponse.json({ error: 'ID không hợp lệ' }, { status: 400 });
    }

    const client = await pool.connect();
    try {
      // Chỉ cho phép xóa khoản chi thuộc về các tháng của user hiện tại
      const res = await client.query(`
        DELETE FROM expenses 
        WHERE id = $1 AND month_id IN (SELECT id FROM months WHERE user_id = $2)
      `, [id, authUser.id]);

      if (res.rowCount === 0) {
        return NextResponse.json({ error: 'Khoản chi không tồn tại hoặc không có quyền' }, { status: 404 });
      }

      return NextResponse.json({ success: true, message: 'Đã xóa khoản chi' });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Lỗi khi xóa khoản chi:', error);
    return NextResponse.json({ error: 'Lỗi máy chủ khi xóa khoản chi' }, { status: 500 });
  }
}
