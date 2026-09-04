import { NextResponse } from 'next/server';
import pool from '../../lib/db';
import { MonthData, FixedExpense, WeekPeriod, Expense } from '../../types/finance';

export async function GET() {
  try {
    const client = await pool.connect();
    try {
      // 1. Lấy danh sách tháng
      const monthsRes = await client.query(`
        SELECT id, name, year, month_number, initial_money, locked_weekly_budget, status, created_at
        FROM months
        ORDER BY year DESC, month_number DESC
      `);

      if (monthsRes.rows.length === 0) {
        return NextResponse.json({ months: [] });
      }

      // 2. Lấy fixed_expenses
      const fixedRes = await client.query(`
        SELECT id, month_id, name, amount, icon, is_paid
        FROM fixed_expenses
      `);

      // 3. Lấy weeks
      const weeksRes = await client.query(`
        SELECT id, month_id, week_index, name, start_date, end_date, full_start_date, full_end_date, is_current
        FROM weeks
        ORDER BY week_index ASC
      `);

      // 4. Lấy expenses
      const expensesRes = await client.query(`
        SELECT id, month_id, amount, category, description, date, week_index, wallet, note, created_at
        FROM expenses
        ORDER BY date DESC, created_at DESC
      `);

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

        const mWeeks: WeekPeriod[] = weeksRes.rows
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
