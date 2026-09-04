import { NextResponse } from 'next/server';
import pool from '../../lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { monthId, name, amount, icon } = body;

    if (!monthId || !name || !amount || isNaN(amount) || amount <= 0) {
      return NextResponse.json({ error: 'Thông tin cố định không hợp lệ' }, { status: 400 });
    }

    const id = `fx-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const client = await pool.connect();

    try {
      await client.query(`
        INSERT INTO fixed_expenses (id, month_id, name, amount, icon, is_paid)
        VALUES ($1, $2, $3, $4, $5, true)
      `, [id, monthId, name, amount, icon || '💡']);

      return NextResponse.json({
        success: true,
        fixedExpense: { id, monthId, name, amount, icon: icon || '💡', isPaid: true },
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Lỗi khi thêm chi phí cố định:', error);
    return NextResponse.json({ error: 'Lỗi máy chủ' }, { status: 500 });
  }
}
