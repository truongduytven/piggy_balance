import { NextResponse } from 'next/server';
import pool from '../../lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { monthId, amount, category, description, date, weekIndex, wallet, note } = body;

    if (!monthId || !amount || isNaN(amount) || amount <= 0) {
      return NextResponse.json({ error: 'Thông tin chi tiêu không hợp lệ' }, { status: 400 });
    }

    const expenseId = `exp-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const client = await pool.connect();

    try {
      await client.query(`
        INSERT INTO expenses (id, month_id, amount, category, description, date, week_index, wallet, note)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [
        expenseId,
        monthId,
        amount,
        category || 'other',
        description || 'Khoản chi',
        date || new Date().toISOString().split('T')[0],
        weekIndex ?? 0,
        wallet || 'Ví chính',
        note || '',
      ]);

      return NextResponse.json({
        success: true,
        expense: {
          id: expenseId,
          monthId,
          amount,
          category,
          description,
          date,
          weekIndex,
          wallet,
          note,
        },
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Lỗi khi lưu khoản chi vào DB:', error);
    return NextResponse.json({ error: 'Lỗi máy chủ khi lưu chi tiêu' }, { status: 500 });
  }
}
