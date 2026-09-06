import { NextResponse } from 'next/server';
import pool from '../../lib/db';
import { getAuthUserFromRequest } from '../../lib/auth';
import { generateWeeksForMonth } from '../../lib/financeCalculations';
import { FixedExpense } from '../../types/finance';

export async function POST(request: Request) {
  try {
    const authUser = await getAuthUserFromRequest(request);
    if (!authUser) {
      return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
    }

    const body = await request.json();
    const { year, monthNumber, initialMoney, fixedExpenses, lockedWeeklyBudget } = body;

    if (!year || !monthNumber || !initialMoney || !lockedWeeklyBudget) {
      return NextResponse.json({ error: 'Thiếu thông tin chu kỳ tháng' }, { status: 400 });
    }

    const mStr = monthNumber < 10 ? `0${monthNumber}` : `${monthNumber}`;
    // Định dạng ID phân tách theo user để không bị trùng khóa chính giữa các user
    const monthId = `${authUser.id}_${year}-${mStr}`;
    const monthName = `Tháng ${monthNumber}, ${year}`;
    const weeks = generateWeeksForMonth(year, monthNumber);

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Chuyển các tháng ACTIVE của CHÍNH USER NÀY sang ARCHIVED
      await client.query(`
        UPDATE months SET status = 'ARCHIVED' WHERE user_id = $1 AND status = 'ACTIVE'
      `, [authUser.id]);

      // Xóa tháng cũ nếu có cùng ID của user này để tránh conflict
      await client.query('DELETE FROM months WHERE id = $1 AND user_id = $2', [monthId, authUser.id]);

      // Chèn tháng mới gắn với user_id
      await client.query(`
        INSERT INTO months (id, user_id, name, year, month_number, initial_money, locked_weekly_budget, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, 'ACTIVE')
      `, [monthId, authUser.id, monthName, year, monthNumber, initialMoney, lockedWeeklyBudget]);

      // Chèn chi phí cố định
      if (Array.isArray(fixedExpenses)) {
        for (const fx of fixedExpenses as FixedExpense[]) {
          await client.query(`
            INSERT INTO fixed_expenses (id, month_id, name, amount, icon, is_paid)
            VALUES ($1, $2, $3, $4, $5, $6)
          `, [
            fx.id || `fx-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            monthId,
            fx.name,
            fx.amount,
            fx.icon || '💡',
            fx.isPaid !== false,
          ]);
        }
      }

      // Chèn các tuần
      for (const w of weeks) {
        await client.query(`
          INSERT INTO weeks (id, month_id, week_index, name, start_date, end_date, full_start_date, full_end_date, is_current)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `, [
          `w-${monthId}-${w.index}`,
          monthId,
          w.index,
          w.name,
          w.startDate,
          w.endDate,
          w.fullStartDate,
          w.fullEndDate,
          w.isCurrent,
        ]);
      }

      await client.query('COMMIT');

      return NextResponse.json({
        success: true,
        month: {
          id: monthId,
          name: monthName,
          year,
          monthNumber,
          initialMoney,
          lockedWeeklyBudget,
          status: 'ACTIVE',
          fixedExpenses,
          weeks,
          expenses: [],
        },
      });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Lỗi khi tạo tháng mới trong DB:', error);
    return NextResponse.json({ error: 'Lỗi máy chủ khi tạo tháng mới' }, { status: 500 });
  }
}
