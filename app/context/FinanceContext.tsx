'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Expense, MonthData, MonthSummary, FixedExpense } from '../types/finance';
import {
  calculateMonthSummary,
  generateWeeksForMonth,
  getWeekIndexForDate,
} from '../lib/financeCalculations';

import { GlobalLoading } from '../components/GlobalLoading';

interface FinanceContextType {
  months: MonthData[];
  activeMonthId: string;
  activeMonth: MonthData | null;
  activeMonthSummary: MonthSummary | null;
  allMonthsSummaries: MonthSummary[];
  isLoaded: boolean;
  isFirstTimeEmpty: boolean;
  isApiLoading: boolean;
  apiLoadingText: string;

  // Actions
  setActiveMonthId: (id: string) => void;
  addExpense: (expense: Omit<Expense, 'id' | 'monthId' | 'weekIndex' | 'date'> & { date?: string; weekIndex?: number }) => Promise<Expense>;
  deleteExpense: (expenseId: string) => Promise<void>;
  addFixedExpense: (name: string, amount: number, icon?: string) => Promise<void>;
  deleteFixedExpense: (fixedId: string) => Promise<void>;
  createNewMonth: (params: {
    year: number;
    monthNumber: number;
    initialMoney: number;
    fixedExpenses: FixedExpense[];
    lockedWeeklyBudget: number;
    preferFourWeeks?: boolean;
  }) => Promise<MonthData>;
  archiveMonth: (monthId: string) => void;
  refreshFromDB: () => Promise<void>;
  clearAllDataForEmptyState: () => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [months, setMonths] = useState<MonthData[]>([]);
  const [activeMonthId, setActiveMonthId] = useState<string>('');
  const [isFirstTimeEmpty, setIsFirstTimeEmpty] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [apiLoadingCount, setApiLoadingCount] = useState<number>(0);
  const [apiLoadingText, setApiLoadingText] = useState<string>('Đang đồng bộ...');

  const isApiLoading = apiLoadingCount > 0;

  const executeWithLoading = useCallback(
    async <T,>(fn: () => Promise<T>, loadingText = 'Đang đồng bộ...'): Promise<T> => {
      setApiLoadingCount((prev) => prev + 1);
      setApiLoadingText(loadingText);
      try {
        return await fn();
      } finally {
        setApiLoadingCount((prev) => Math.max(0, prev - 1));
      }
    },
    []
  );

  // Tải dữ liệu từ database API
  const refreshFromDB = useCallback(async () => {
    return executeWithLoading(async () => {
      try {
        const res = await fetch('/api/finance');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.months) && data.months.length > 0) {
            setMonths(data.months);
            const active = data.months.find((m: MonthData) => m.status === 'ACTIVE') || data.months[0];
            setActiveMonthId(active.id);
            setIsFirstTimeEmpty(false);
            return;
          }
        }
        // Nếu DB chưa có tháng nào (sạch sẽ 100%)
        setIsFirstTimeEmpty(true);
        setMonths([]);
        setActiveMonthId('');
      } catch (err) {
        console.error('Không thể kết nối API /api/finance:', err);
        setIsFirstTimeEmpty(true);
        setMonths([]);
      } finally {
        setIsLoaded(true);
      }
    }, 'Đang tải dữ liệu Cozy...');
  }, [executeWithLoading]);

  useEffect(() => {
    refreshFromDB();
  }, [refreshFromDB]);

  // Tìm tháng hiện tại
  const activeMonth = months.find((m) => m.id === activeMonthId) || months[0] || null;

  // Tính toán MonthSummary cho tháng hiện tại
  const activeMonthSummary = activeMonth ? calculateMonthSummary(activeMonth) : null;

  // Tính toán MonthSummary cho toàn bộ danh sách tháng
  const allMonthsSummaries = months.map((m) => calculateMonthSummary(m));

  // Thêm khoản chi tiêu mới (lưu vào database)
  const addExpense = async (
    newExp: Omit<Expense, 'id' | 'monthId' | 'weekIndex' | 'date'> & { date?: string; weekIndex?: number }
  ): Promise<Expense> => {
    return executeWithLoading(async () => {
      if (!activeMonth) {
        throw new Error('Chưa chọn tháng hiện tại để ghi chi tiêu');
      }

      const todayStr = newExp.date || new Date().toISOString().split('T')[0];
      const calculatedWeekIndex =
        newExp.weekIndex !== undefined
          ? newExp.weekIndex
          : getWeekIndexForDate(todayStr, activeMonth.weeks);

      try {
        const res = await fetch('/api/expenses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            monthId: activeMonth.id,
            amount: newExp.amount,
            category: newExp.category,
            description: newExp.description,
            date: todayStr,
            weekIndex: calculatedWeekIndex,
            wallet: newExp.wallet || 'Ví chính',
            note: newExp.note,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          const savedExpense: Expense = data.expense;

          setMonths((prev) =>
            prev.map((m) => {
              if (m.id === activeMonth.id) {
                return {
                  ...m,
                  expenses: [savedExpense, ...m.expenses],
                };
              }
              return m;
            })
          );
          return savedExpense;
        }
      } catch (err) {
        console.error('Lỗi khi gửi API chi tiêu:', err);
      }

      const fallbackExpense: Expense = {
        id: `exp-${Date.now()}`,
        monthId: activeMonth.id,
        amount: newExp.amount,
        category: newExp.category,
        description: newExp.description,
        date: todayStr,
        weekIndex: calculatedWeekIndex,
        wallet: newExp.wallet || 'Ví chính',
        note: newExp.note,
      };

      setMonths((prev) =>
        prev.map((m) => {
          if (m.id === activeMonth.id) {
            return {
              ...m,
              expenses: [fallbackExpense, ...m.expenses],
            };
          }
          return m;
        })
      );

      return fallbackExpense;
    }, 'Đang lưu khoản chi...');
  };

  // Xóa khoản chi (xóa khỏi database)
  const deleteExpense = async (expenseId: string) => {
    return executeWithLoading(async () => {
      setMonths((prev) =>
        prev.map((m) => ({
          ...m,
          expenses: m.expenses.filter((e) => e.id !== expenseId),
        }))
      );

      try {
        await fetch(`/api/expenses/${expenseId}`, {
          method: 'DELETE',
        });
      } catch (err) {
        console.error('Lỗi xóa chi tiêu:', err);
      }
    }, 'Đang xóa khoản chi...');
  };

  // Thêm chi phí cố định cho tháng hiện tại
  const addFixedExpense = async (name: string, amount: number, icon?: string) => {
    if (!activeMonth) return;

    return executeWithLoading(async () => {
      try {
        const res = await fetch('/api/fixed-expenses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            monthId: activeMonth.id,
            name,
            amount,
            icon: icon || '💡',
          }),
        });

        if (res.ok) {
          const data = await res.json();
          const newItem: FixedExpense = data.fixedExpense;
          setMonths((prev) =>
            prev.map((m) => (m.id === activeMonth.id ? { ...m, fixedExpenses: [...m.fixedExpenses, newItem] } : m))
          );
        }
      } catch (err) {
        console.error('Lỗi thêm cố định:', err);
      }
    }, 'Đang lưu chi phí cố định...');
  };

  // Xóa chi phí cố định
  const deleteFixedExpense = async (fixedId: string) => {
    if (!activeMonth) return;

    return executeWithLoading(async () => {
      setMonths((prev) =>
        prev.map((m) =>
          m.id === activeMonth.id
            ? { ...m, fixedExpenses: m.fixedExpenses.filter((f) => f.id !== fixedId) }
            : m
        )
      );

      try {
        await fetch(`/api/fixed-expenses/${fixedId}`, {
          method: 'DELETE',
        });
      } catch (err) {
        console.error('Lỗi xóa cố định:', err);
      }
    }, 'Đang xóa chi phí cố định...');
  };

  // Tạo tháng mới với ngân sách khóa (lưu vào database)
  const createNewMonth = async ({
    year,
    monthNumber,
    initialMoney,
    fixedExpenses,
    lockedWeeklyBudget,
    preferFourWeeks = true,
  }: {
    year: number;
    monthNumber: number;
    initialMoney: number;
    fixedExpenses: FixedExpense[];
    lockedWeeklyBudget: number;
    preferFourWeeks?: boolean;
  }): Promise<MonthData> => {
    return executeWithLoading(async () => {
      const mStr = monthNumber < 10 ? `0${monthNumber}` : `${monthNumber}`;
      const newMonthId = `${year}-${mStr}`;
      const monthName = `Tháng ${monthNumber}, ${year}`;
      const generatedWeeks = generateWeeksForMonth(year, monthNumber, preferFourWeeks);

      const localNewMonth: MonthData = {
        id: newMonthId,
        name: monthName,
        year,
        monthNumber,
        initialMoney,
        fixedExpenses,
        lockedWeeklyBudget,
        weeks: generatedWeeks,
        expenses: [],
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
      };

      try {
        const res = await fetch('/api/months', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            year,
            monthNumber,
            initialMoney,
            fixedExpenses,
            lockedWeeklyBudget,
            preferFourWeeks,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          await refreshFromDB();
          setActiveMonthId(newMonthId);
          setIsFirstTimeEmpty(false);
          return data.month;
        }
      } catch (err) {
        console.error('Lỗi khi gửi API tạo tháng:', err);
      }

      setMonths((prev) => {
        const updated = prev.map((m) => (m.status === 'ACTIVE' ? { ...m, status: 'ARCHIVED' as const } : m));
        const filtered = updated.filter((m) => m.id !== newMonthId);
        return [localNewMonth, ...filtered];
      });

      setActiveMonthId(newMonthId);
      setIsFirstTimeEmpty(false);
      return localNewMonth;
    }, 'Đang chốt ngân sách tháng mới...');
  };

  const archiveMonth = (monthId: string) => {
    setMonths((prev) =>
      prev.map((m) => (m.id === monthId ? { ...m, status: 'ARCHIVED' as const } : m))
    );
  };

  const clearAllDataForEmptyState = () => {
    setIsFirstTimeEmpty(true);
    setMonths([]);
    setActiveMonthId('');
  };

  return (
    <FinanceContext.Provider
      value={{
        months,
        activeMonthId,
        activeMonth,
        activeMonthSummary,
        allMonthsSummaries,
        isLoaded,
        isFirstTimeEmpty,
        isApiLoading,
        apiLoadingText,
        setActiveMonthId,
        addExpense,
        deleteExpense,
        addFixedExpense,
        deleteFixedExpense,
        createNewMonth,
        archiveMonth,
        refreshFromDB,
        clearAllDataForEmptyState,
      }}
    >
      <GlobalLoading />
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
