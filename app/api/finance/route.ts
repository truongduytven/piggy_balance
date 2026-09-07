import { NextResponse } from 'next/server';
import pool from '../../lib/db';
import { getAuthUserFromRequest } from '../../lib/auth';
import { MonthData, FixedExpense, WeekPeriod, Expense } from '../../types/finance';
import { normalizeMonthWeeks, getTodayDateString } from '../../lib/financeCalculations';

export async function GET(request: Request) {
  try {
    const authUser = await getAuthUserFromRequest(request);
    if (!authUser) {
      return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
    }

    const client = await pool.connect();
    try {
      // 1. Lấy danh sách tháng của user hiện tại
      const monthsRes = await client.query(`
        SELECT id, name, year, month_number, initial_money, locked_weekly_budget, status, created_at
        FROM months
        WHERE user_id = $1
        ORDER BY year DESC, month_number DESC
      `, [authUser.id]);

      if (monthsRes.rows.length === 0) {
        return NextResponse.json({ months: [] });
      }

      const monthIds = monthsRes.rows.map((m: any) => m.id);

      // Cập nhật is_current trong DB theo thời gian thực (ngày hôm nay)
      const todayStr = getTodayDateString();
      try {
        await client.query(`
          UPDATE weeks
          SET is_current = CASE WHEN full_start_date <= $1 AND full_end_date >= $1 THEN true ELSE false END
          WHERE month_id = ANY($2::text[]) AND full_start_date IS NOT NULL AND full_end_date IS NOT NULL
        `, [todayStr, monthIds]);
      } catch (err) {
        console.warn('Không thể tự động đồng bộ weeks.is_current:', err);
      }

      // 2. Lấy fixed_expenses của các tháng thuộc user
      const fixedRes = await client.query(`
        SELECT id, month_id, name, amount, icon, is_paid
        FROM fixed_expenses
        WHERE month_id = ANY($1::text[])
      `, [monthIds]);

      // 3. Lấy weeks của các tháng thuộc user
      const weeksRes = await client.query(`
        SELECT id, month_id, week_index, name, start_date, end_date, full_start_date, full_end_date, is_current
        FROM weeks
        WHERE month_id = ANY($1::text[])
        ORDER BY week_index ASC
      `, [monthIds]);

      // 4. Lấy expenses của các tháng thuộc user
      const expensesRes = await client.query(`
        SELECT id, month_id, amount, category, description, date, week_index, wallet, note, created_at
        FROM expenses
        WHERE month_id = ANY($1::text[])
        ORDER BY date DESC, created_at DESC
      `, [monthIds]);

      // Nhóm lại thành cấu trúc MonthData[]
      const months: MonthData[] = monthsRes.rows.map((m: any) => {
        const mFixed: FixedExpense[] = fixedRes.rows
          .filter((f: any) => f.month_id === m.id)
          .map((f: any) => ({
            id: f.id,
            name: f.name,
            amount: Number(f.amount),
            icon: f.icon || '💡',
            isPaid: f.is_paid,
          }));

        const rawWeeks: WeekPeriod[] = weeksRes.rows
          .filter((w: any) => w.month_id === m.id)
          .map((w: any) => ({
            index: w.week_index,
            name: w.name,
            startDate: w.start_date,
            endDate: w.end_date,
            fullStartDate: w.full_start_date,
            fullEndDate: w.full_end_date,
            isCurrent: w.is_current,
          }));

        const mWeeks: WeekPeriod[] = normalizeMonthWeeks(rawWeeks, m.year, m.month_number);

        const mExpenses: Expense[] = expensesRes.rows
          .filter((e: any) => e.month_id === m.id)
          .map((e: any) => ({
            id: e.id,
            monthId: e.month_id,
            amount: Number(e.amount),
            category: e.category,
            description: e.description,
            date: e.date,
            weekIndex: e.week_index,
            wallet: e.wallet,
            note: e.note,
          }));

        return {
          id: m.id,
          name: m.name,
          year: m.year,
          monthNumber: m.month_number,
          initialMoney: Number(m.initial_money),
          lockedWeeklyBudget: Number(m.locked_weekly_budget),
          fixedExpenses: mFixed,
          weeks: mWeeks,
          expenses: mExpenses,
          status: m.status,
          createdAt: m.created_at,
        };
      });

      return NextResponse.json({ months });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Lỗi khi tải dữ liệu finance từ DB:', error);
    return NextResponse.json(
      { error: 'Không thể tải dữ liệu tài chính', details: String(error) },
      { status: 500 }
    );
  }
}
