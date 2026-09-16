export type MonthStatus = 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';

export type ExpenseCategory =
  | 'food'
  | 'transport'
  | 'shopping'
  | 'entertainment'
  | 'bills'
  | 'other';

export interface CategoryMeta {
  id: ExpenseCategory;
  name: string;
  icon: string;
  color: string;
  bgColor: string;
}

export interface Expense {
  id: string;
  monthId: string;
  amount: number;
  category: ExpenseCategory;
  description: string;
  date: string; // YYYY-MM-DD
  weekIndex: number; // 0-indexed week (Tuần 1, 2, 3...)
  wallet?: string; // 'Ví chính' | 'MoMo' | 'Thẻ Visa'
  note?: string;
}

export interface FixedExpense {
  id: string;
  name: string;
  amount: number;
  icon?: string;
  isPaid?: boolean;
}

export interface WeekPeriod {
  index: number; // 1, 2, 3, 4, 5
  name: string; // 'Tuần 1'
  startDate: string; // '01/09'
  endDate: string; // '07/09'
  fullStartDate: string; // '2026-09-01'
  fullEndDate: string; // '2026-09-07'
  isCurrent: boolean;
}

export interface MonthData {
  id: string; // '2026-09'
  name: string; // 'Tháng 9, 2026'
  year: number;
  monthNumber: number; // 9
  initialMoney: number; // e.g. 8.000.000
  fixedExpenses: FixedExpense[];
  lockedWeeklyBudget: number; // e.g. 1.500.000 (LOCKED, never recalculated dynamically)
  weeks: WeekPeriod[];
  expenses: Expense[];
  status: MonthStatus;
  createdAt: string;
}

export interface WeekSummary {
  week: WeekPeriod;
  lockedBudget: number;
  spent: number;
  remaining: number;
  percentSpent: number;
  status: 'safe' | 'moderate' | 'warning' | 'over' | 'unused';
  statusLabel: string;
  statusIcon: string;
}

export interface MonthSummary {
  month: MonthData;
  initialMoney: number;
  totalFixed: number;
  availableBudget: number;
  totalSpent: number;
  remainingMonth: number;
  percentMonthSpent: number;
  weeksSummary: WeekSummary[];
  currentWeekSummary?: WeekSummary;
  categorySpending: Record<ExpenseCategory, number>;
  status: 'safe' | 'normal' | 'fast' | 'over';
  statusLabel: string;
  totalWeeksBudget: number;
  unallocatedSavings: number;
  totalWeeksRemaining: number;
}

export interface PurchaseAdviceData {
  item: string;
  amount: number;
  category: ExpenseCategory;
  weeklyRemaining: number;
  afterPurchaseWeekly: number;
  percentOfWeeklyRemaining: number;
  remainingMonth: number;
  verdict: 'safe' | 'caution' | 'weekly_over' | 'monthly_over';
  verdictLabel: string;
  verdictColor: string;
  advice: string;
}

export interface ChatMessage {
  id: string;
  sender: 'cozy' | 'user';
  text: string;
  timestamp: string;
  card?: {
    type: 'confirmation' | 'summary' | 'purchase_advice';
    data?: {
      amount?: number;
      category?: ExpenseCategory;
      description?: string;
      date?: string;
      wallet?: string;
    };
    adviceData?: PurchaseAdviceData;
    status?: 'pending' | 'confirmed' | 'cancelled';
    isConfirmed?: boolean;
  };
}
