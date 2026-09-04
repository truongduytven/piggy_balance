'use client';

import React, { useState } from 'react';
import { ArrowLeft, Plus, Calendar, CheckCircle2 } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { MonthlySummaryCard } from './MonthlySummaryCard';
import { LockedBudgetRuleCard } from './LockedBudgetRuleCard';
import { WeeklyBudgetCards } from './WeeklyBudgetCards';
import { ExpenseList } from './ExpenseList';

interface MonthlyDetailViewProps {
  onBackToHome: () => void;
  onOpenAddExpense: () => void;
}

export const MonthlyDetailView: React.FC<MonthlyDetailViewProps> = ({
  onBackToHome,
  onOpenAddExpense,
}) => {
  const { activeMonthSummary } = useFinance();
  const [selectedWeekIndex, setSelectedWeekIndex] = useState<number | null>(null);

  if (!activeMonthSummary) {
    return (
      <div className="p-8 text-center">
        <p className="text-sm font-bold text-[#7A7D8C]">Không tìm thấy dữ liệu tháng này</p>
        <button
          onClick={onBackToHome}
          className="mt-4 px-4 py-2 bg-[#6FCF97] text-white rounded-xl text-xs font-bold"
        >
          Quay lại trang chủ
        </button>
      </div>
    );
  }

  const { month, weeksSummary } = activeMonthSummary;
  const currentWeekIdx = weeksSummary.findIndex((w) => w.week.isCurrent);

  return (
    <div className="space-y-4 pb-28 px-4 pt-1 animate-fade-in">
      {/* Navigation Header */}
      <div className="flex items-center justify-between pt-1">
        <button
          onClick={onBackToHome}
          className="flex items-center gap-1 text-xs font-bold text-[#7A7D8C] hover:text-[#3D405B] transition-colors py-1.5 px-2 -ml-2 rounded-xl hover:bg-gray-100"
        >
          <ArrowLeft size={16} />
          <span>Quay lại</span>
        </button>

        <button
          onClick={onOpenAddExpense}
          className="flex items-center gap-1.5 bg-[#6FCF97] hover:bg-[#58B880] text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-xs active:scale-95 transition-all"
        >
          <Plus size={14} />
          <span>Thêm chi tiêu</span>
        </button>
      </div>

      {/* Tiêu đề trang & Trạng thái */}
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-black text-[#3D405B] tracking-tight">{month.name}</h2>
          <span
            className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
              month.status === 'ACTIVE'
                ? 'bg-[#EBF8F1] text-[#58B880] border-[#6FCF97]/30'
                : 'bg-gray-100 text-gray-500 border-gray-200'
            }`}
          >
            {month.status === 'ACTIVE' ? 'Đang diễn ra' : 'Lịch sử'}
          </span>
        </div>
        <p className="text-xs font-medium text-[#7A7D8C] mt-1">
          {activeMonthSummary.statusLabel}
        </p>
      </div>

      {/* 1. Tổng quan dòng tiền tháng */}
      <MonthlySummaryCard summary={activeMonthSummary} />

      {/* 2. Thẻ Quy tắc vàng ngân sách tuần chốt */}
      <LockedBudgetRuleCard lockedWeeklyBudget={month.lockedWeeklyBudget} />

      {/* 3. Tiến độ chi tiêu 4 tuần độc lập */}
      <WeeklyBudgetCards
        weeksSummary={weeksSummary}
        onSelectWeek={(idx) => setSelectedWeekIndex(idx === selectedWeekIndex ? null : idx)}
        selectedWeekIndex={selectedWeekIndex}
      />

      {/* 4. Lịch sử chi tiêu kèm bộ lọc */}
      <ExpenseList
        expenses={month.expenses}
        currentWeekIndex={selectedWeekIndex !== null ? selectedWeekIndex : currentWeekIdx !== -1 ? currentWeekIdx : 0}
      />
    </div>
  );
};
