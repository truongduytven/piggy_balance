import {
  Expense,
  ExpenseCategory,
  MonthData,
  MonthSummary,
  WeekPeriod,
  WeekSummary,
} from '../types/finance';

/**
 * Định dạng số tiền sang chuẩn VND (ví dụ: 1.500.000đ)
 */
export function formatVND(amount: number): string {
  if (isNaN(amount)) return '0đ';
  const rounded = Math.round(amount);
  return `${rounded.toLocaleString('vi-VN')}đ`;
}

/**
 * Tính số ngày của một tháng bất kỳ
 */
export function getDaysInMonth(year: number, monthNumber: number): number {
  return new Date(year, monthNumber, 0).getDate();
}

/**
 * Tạo danh sách các tuần cho tháng theo khoảng ngày thực tế.
 * - Mặc định chia 4 tuần (3 tuần đầu 7 ngày, tuần 4 đến hết tháng),
 * - Hoặc 5 tuần nếu tháng có > 28 ngày và cấu hình 5 tuần.
 */
export function generateWeeksForMonth(
  year: number,
  monthNumber: number,
  preferFourWeeks: boolean = true
): WeekPeriod[] {
  const totalDays = getDaysInMonth(year, monthNumber);
  const mStr = monthNumber < 10 ? `0${monthNumber}` : `${monthNumber}`;

  if (preferFourWeeks) {
    // 4 tuần: 01-07, 08-14, 15-21, 22-totalDays
    return [
      {
        index: 1,
        name: 'Tuần 1',
        startDate: `01/${mStr}`,
        endDate: `07/${mStr}`,
        fullStartDate: `${year}-${mStr}-01`,
        fullEndDate: `${year}-${mStr}-07`,
        isCurrent: true,
      },
      {
        index: 2,
        name: 'Tuần 2',
        startDate: `08/${mStr}`,
        endDate: `14/${mStr}`,
        fullStartDate: `${year}-${mStr}-08`,
        fullEndDate: `${year}-${mStr}-14`,
        isCurrent: false,
      },
      {
        index: 3,
        name: 'Tuần 3',
        startDate: `15/${mStr}`,
        endDate: `21/${mStr}`,
        fullStartDate: `${year}-${mStr}-15`,
        fullEndDate: `${year}-${mStr}-21`,
        isCurrent: false,
      },
      {
        index: 4,
        name: 'Tuần 4',
        startDate: `22/${mStr}`,
        endDate: `${totalDays}/${mStr}`,
        fullStartDate: `${year}-${mStr}-22`,
        fullEndDate: `${year}-${mStr}-${totalDays}`,
        isCurrent: false,
      },
    ];
  }

  // 5 tuần
  const weeks: WeekPeriod[] = [];
  const ranges = [
    [1, 7],
    [8, 14],
    [15, 21],
    [22, 28],
    [29, totalDays],
  ];

  ranges.forEach((range, idx) => {
    if (range[0] <= totalDays) {
      const startDay = range[0] < 10 ? `0${range[0]}` : `${range[0]}`;
      const endDay = Math.min(range[1], totalDays) < 10
        ? `0${Math.min(range[1], totalDays)}`
        : `${Math.min(range[1], totalDays)}`;

      weeks.push({
        index: idx + 1,
        name: `Tuần ${idx + 1}`,
        startDate: `${startDay}/${mStr}`,
        endDate: `${endDay}/${mStr}`,
        fullStartDate: `${year}-${mStr}-${startDay}`,
        fullEndDate: `${year}-${mStr}-${endDay}`,
        isCurrent: idx === 0,
      });
    }
  });

  return weeks;
}

/**
 * Xác định giao dịch thuộc tuần nào dựa vào ngày (YYYY-MM-DD)
 */
export function getWeekIndexForDate(dateStr: string, weeks: WeekPeriod[]): number {
  for (let i = 0; i < weeks.length; i++) {
    if (dateStr >= weeks[i].fullStartDate && dateStr <= weeks[i].fullEndDate) {
      return i;
    }
  }
  // Mặc định tuần hiện tại hoặc tuần 0
  const current = weeks.findIndex((w) => w.isCurrent);
  return current !== -1 ? current : 0;
}

/**
 * Tính toán toàn bộ bức tranh tài chính của tháng
 * TUÂN THỦ NGHIÊM NGẶT NGUYÊN TẮC LOCKED WEEKLY BUDGET
 */
export function calculateMonthSummary(month: MonthData): MonthSummary {
  const totalFixed = month.fixedExpenses.reduce((sum, item) => sum + item.amount, 0);
  const availableBudget = Math.max(0, month.initialMoney - totalFixed);
  const lockedWeeklyBudget = month.lockedWeeklyBudget;

  // Tính tổng chi tiêu của tháng
  const totalSpent = month.expenses.reduce((sum, item) => sum + item.amount, 0);
  const remainingMonth = month.initialMoney - totalFixed - totalSpent;
  const percentMonthSpent =
    availableBudget > 0 ? Math.min(100, (totalSpent / availableBudget) * 100) : 0;

  // Chi tiêu theo từng danh mục
  const categorySpending: Record<ExpenseCategory, number> = {
    food: 0,
    transport: 0,
    shopping: 0,
    entertainment: 0,
    bills: 0,
    other: 0,
  };

  month.expenses.forEach((exp) => {
    if (categorySpending[exp.category] !== undefined) {
      categorySpending[exp.category] += exp.amount;
    } else {
      categorySpending.other += exp.amount;
    }
  });

  // Tính tiến độ cho từng tuần
  // QUY TẮC: remaining = lockedWeeklyBudget - spent (KHÔNG TỰ ĐỘNG DỒN TIỀN)
  const weeksSummary: WeekSummary[] = month.weeks.map((week, idx) => {
    const weekExpenses = month.expenses.filter(
      (e) => e.weekIndex === idx || (e.weekIndex === undefined && getWeekIndexForDate(e.date, month.weeks) === idx)
    );
    const spent = weekExpenses.reduce((sum, e) => sum + e.amount, 0);
    const remaining = lockedWeeklyBudget - spent;
    const percentSpent =
      lockedWeeklyBudget > 0 ? (spent / lockedWeeklyBudget) * 100 : 0;

    let status: WeekSummary['status'] = 'safe';
    let statusLabel = 'Tiến độ rất tốt';
    let statusIcon = '🌱';

    if (spent === 0 && !week.isCurrent) {
      status = 'unused';
      statusLabel = 'Chưa sử dụng';
      statusIcon = '🌱';
    } else if (percentSpent > 100) {
      status = 'over';
      statusLabel = 'Đã vượt định mức';
      statusIcon = '🥲';
    } else if (percentSpent >= 85) {
      status = 'warning';
      statusLabel = 'Sắp chạm giới hạn';
      statusIcon = '😳';
    } else if (percentSpent >= 50) {
      status = 'moderate';
      statusLabel = 'Trong mức kiểm soát';
      statusIcon = '🙂';
    } else {
      status = 'safe';
      statusLabel = 'Tiến độ rất tốt';
      statusIcon = '🌱';
    }

    return {
      week,
      lockedBudget: lockedWeeklyBudget,
      spent,
      remaining,
      percentSpent: Math.min(100, Math.round(percentSpent)),
      status,
      statusLabel,
      statusIcon,
    };
  });

  const currentWeekSummary =
    weeksSummary.find((w) => w.week.isCurrent) || weeksSummary[0];

  // Trạng thái chung của tháng
  let monthStatus: MonthSummary['status'] = 'safe';
  let monthStatusLabel = 'Quản lý rất ổn định 🌱';

  if (percentMonthSpent > 100) {
    monthStatus = 'over';
    monthStatusLabel = 'Vượt ngân sách tháng 😳';
  } else if (percentMonthSpent >= 80) {
    monthStatus = 'fast';
    monthStatusLabel = 'Đang tiêu hơi nhanh 👀';
  } else if (percentMonthSpent >= 50) {
    monthStatus = 'normal';
    monthStatusLabel = 'Chi tiêu trong tầm kiểm soát 🙂';
  } else {
    monthStatus = 'safe';
    monthStatusLabel = 'Bạn đang quản lý tháng này khá ổn định 🌱';
  }

  return {
    month,
    initialMoney: month.initialMoney,
    totalFixed,
    availableBudget,
    totalSpent,
    remainingMonth,
    percentMonthSpent: Math.round(percentMonthSpent * 10) / 10,
    weeksSummary,
    currentWeekSummary,
    categorySpending,
    status: monthStatus,
    statusLabel: monthStatusLabel,
  };
}
