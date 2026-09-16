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
 * Lấy chuỗi ngày hôm nay YYYY-MM-DD theo múi giờ Việt Nam hoặc địa phương
 */
export function getTodayDateString(d: Date = new Date()): string {
  try {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Ho_Chi_Minh',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(d);
  } catch {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}

/**
 * Chuẩn hóa các tuần của tháng để đảm bảo `isCurrent` luôn phản ánh chính xác ngày hôm nay
 */
export function normalizeMonthWeeks(
  weeks: WeekPeriod[],
  year: number,
  monthNumber: number
): WeekPeriod[] {
  if (!weeks || weeks.length === 0) return [];

  const todayStr = getTodayDateString();
  const [currentYStr, currentMStr, currentDStr] = todayStr.split('-');
  const currentY = parseInt(currentYStr, 10);
  const currentM = parseInt(currentMStr, 10);
  const currentD = parseInt(currentDStr, 10);

  // Tìm tuần chứa ngày hôm nay
  let currentIdx = weeks.findIndex(
    (w) => w.fullStartDate && w.fullEndDate && todayStr >= w.fullStartDate && todayStr <= w.fullEndDate
  );

  // Nếu không tìm thấy tuần chứa ngày hôm nay theo fullStartDate/fullEndDate
  if (currentIdx === -1) {
    if (year === currentY && monthNumber === currentM) {
      // Đúng tháng hiện tại nhưng ngày ở rìa
      const foundIdx = weeks.findIndex((w) => {
        const s = parseInt(w.startDate.split('/')[0], 10);
        const e = parseInt(w.endDate.split('/')[0], 10);
        return currentD >= s && currentD <= e;
      });
      if (foundIdx !== -1) {
        currentIdx = foundIdx;
      } else if (currentD < parseInt(weeks[0].startDate.split('/')[0], 10)) {
        currentIdx = 0;
      } else {
        currentIdx = weeks.length - 1;
      }
    } else if (year > currentY || (year === currentY && monthNumber > currentM)) {
      // Tháng tương lai: không có tuần hiện tại
      currentIdx = -1;
    } else {
      // Tháng quá khứ: không có tuần nào là current
      currentIdx = -1;
    }
  }

  return weeks.map((w, idx) => ({
    ...w,
    isCurrent: idx === currentIdx,
  }));
}

/**
 * Tạo danh sách các tuần cho tháng theo khoảng ngày thực tế.
 * - Mặc định chia 4 tuần (3 tuần đầu 7 ngày, tuần 4 đến hết tháng),
 * - Hoặc 5 tuần nếu tháng có > 28 ngày và cấu hình 5 tuần.
 */
/**
 * Tạo danh sách các tuần cho tháng theo lịch thực tế (Thứ Hai đến Chủ Nhật).
 * - Tuần 1 bắt đầu từ ngày 1 của tháng cho đến Chủ Nhật đầu tiên của tháng.
 * - Các tuần tiếp theo chạy trọn vẹn từ Thứ Hai đến Chủ Nhật.
 * - Tuần cuối cùng bắt đầu từ Thứ Hai và kết thúc vào ngày cuối cùng của tháng.
 * - Tự động xác định chính xác tuần hiện tại dựa trên ngày hôm nay.
 */
export function generateWeeksForMonth(
  year: number,
  monthNumber: number
): WeekPeriod[] {
  const totalDays = getDaysInMonth(year, monthNumber);
  const mStr = monthNumber < 10 ? `0${monthNumber}` : `${monthNumber}`;

  // Chuỗi ngày hôm nay YYYY-MM-DD
  const todayStr = getTodayDateString();
  const [currentYStr, currentMStr, currentDStr] = todayStr.split('-');
  const currentY = parseInt(currentYStr, 10);
  const currentM = parseInt(currentMStr, 10);
  const currentD = parseInt(currentDStr, 10);

  const weeks: WeekPeriod[] = [];
  let currentStart = 1;
  let weekIndex = 1;

  while (currentStart <= totalDays) {
    // Tìm thứ trong tuần của currentStart (1 = Thứ Hai, ..., 7 = Chủ Nhật)
    const d = new Date(year, monthNumber - 1, currentStart);
    const jsDay = d.getDay(); // 0: CN, 1: T2, ..., 6: T7
    const isoDay = jsDay === 0 ? 7 : jsDay;

    // Số ngày còn lại trong tuần này tới Chủ Nhật: (7 - isoDay)
    const daysUntilSunday = 7 - isoDay;
    const currentEnd = Math.min(totalDays, currentStart + daysUntilSunday);

    const startPad = currentStart < 10 ? `0${currentStart}` : `${currentStart}`;
    const endPad = currentEnd < 10 ? `0${currentEnd}` : `${currentEnd}`;

    const fullStartDate = `${year}-${mStr}-${startPad}`;
    const fullEndDate = `${year}-${mStr}-${endPad}`;

    // Kiểm tra xem tuần này có chứa ngày hôm nay không
    const isCurrent = todayStr >= fullStartDate && todayStr <= fullEndDate;

    weeks.push({
      index: weekIndex,
      name: `Tuần ${weekIndex}`,
      startDate: `${startPad}/${mStr}`,
      endDate: `${endPad}/${mStr}`,
      fullStartDate,
      fullEndDate,
      isCurrent,
    });

    currentStart = currentEnd + 1;
    weekIndex++;
  }

  // Nếu không có tuần nào là isCurrent (ví dụ xem tháng tương lai hoặc quá khứ)
  const hasCurrent = weeks.some((w) => w.isCurrent);
  if (!hasCurrent && weeks.length > 0) {
    if (year === currentY && monthNumber === currentM) {
      // Nếu đúng tháng hiện tại nhưng múi giờ lệch nhẹ, tìm tuần chứa ngày hôm nay
      const foundIdx = weeks.findIndex((w) => {
        const s = parseInt(w.startDate.split('/')[0], 10);
        const e = parseInt(w.endDate.split('/')[0], 10);
        return currentD >= s && currentD <= e;
      });
      if (foundIdx !== -1) {
        weeks[foundIdx].isCurrent = true;
      } else {
        weeks[0].isCurrent = true;
      }
    } else if (year > currentY || (year === currentY && monthNumber > currentM)) {
      // Tháng tương lai: để tuần 1 làm mặc định
      weeks[0].isCurrent = true;
    }
  }

  return weeks;
}

/**
 * Xác định giao dịch thuộc tuần nào dựa vào ngày (YYYY-MM-DD)
 */
export function getWeekIndexForDate(dateStr: string, weeks: WeekPeriod[]): number {
  if (!weeks || weeks.length === 0) return 0;

  for (let i = 0; i < weeks.length; i++) {
    if (dateStr >= weeks[i].fullStartDate && dateStr <= weeks[i].fullEndDate) {
      return i;
    }
  }

  // Nếu ngày trước tuần 1 thì tính là tuần 1 (index 0)
  if (dateStr < weeks[0].fullStartDate) {
    return 0;
  }
  // Nếu ngày sau tuần cuối thì tính là tuần cuối
  if (dateStr > weeks[weeks.length - 1].fullEndDate) {
    return weeks.length - 1;
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

  // Chuẩn hóa isCurrent theo thời gian thực (ngày hôm nay)
  const normalizedWeeks = normalizeMonthWeeks(month.weeks, month.year, month.monthNumber);

  // Tính tiến độ cho từng tuần
  // QUY TẮC: remaining = lockedWeeklyBudget - spent (KHÔNG TỰ ĐỘNG DỒN TIỀN)
  const weeksSummary: WeekSummary[] = normalizedWeeks.map((week, idx) => {
    const weekExpenses = month.expenses.filter(
      (e) => e.weekIndex === idx || (e.weekIndex === undefined && getWeekIndexForDate(e.date, normalizedWeeks) === idx)
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

  // Tổng ngân sách cấp cho các tuần trong tháng
  const totalWeeksBudget = lockedWeeklyBudget * normalizedWeeks.length;
  // Khoản tích lũy / dôi dư còn lại sau khi trừ cố định và phân bổ các tuần (ví dụ: 10tr - 2tr cố định - 4x500k tuần = 6tr)
  const unallocatedSavings = Math.max(0, availableBudget - totalWeeksBudget);
  // Tổng số tiền còn lại thực tế trong các tuần
  const totalWeeksRemaining = weeksSummary.reduce(
    (sum, w) => sum + Math.max(0, w.remaining),
    0
  );

  return {
    month: {
      ...month,
      weeks: normalizedWeeks,
    },
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
    totalWeeksBudget,
    unallocatedSavings,
    totalWeeksRemaining,
  };
}
