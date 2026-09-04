import { NextResponse } from 'next/server';
import pool from '../../../lib/db';

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json({ error: 'ID không hợp lệ' }, { status: 400 });
    }

    const client = await pool.connect();
    try {
      await client.query('DELETE FROM fixed_expenses WHERE id = $1', [id]);
      return NextResponse.json({ success: true, message: 'Đã xóa chi phí cố định' });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Lỗi khi xóa chi phí cố định:', error);
    return NextResponse.json({ error: 'Lỗi máy chủ' }, { status: 500 });
  }
}
