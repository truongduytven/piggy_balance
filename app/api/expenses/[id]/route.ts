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
      await client.query('DELETE FROM expenses WHERE id = $1', [id]);
      return NextResponse.json({ success: true, message: 'Đã xóa khoản chi' });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Lỗi khi xóa khoản chi:', error);
    return NextResponse.json({ error: 'Lỗi máy chủ khi xóa khoản chi' }, { status: 500 });
  }
}
