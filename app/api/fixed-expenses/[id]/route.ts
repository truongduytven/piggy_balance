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
      const res = await client.query(`
        DELETE FROM fixed_expenses 
        WHERE id = $1 AND month_id IN (SELECT id FROM months WHERE user_id = $2)
      `, [id, authUser.id]);

      if (res.rowCount === 0) {
        return NextResponse.json({ error: 'Khoản cố định không tồn tại hoặc không có quyền' }, { status: 404 });
      }

      return NextResponse.json({ success: true, message: 'Đã xóa chi phí cố định' });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Lỗi khi xóa chi phí cố định:', error);
    return NextResponse.json({ error: 'Lỗi máy chủ' }, { status: 500 });
  }
}
