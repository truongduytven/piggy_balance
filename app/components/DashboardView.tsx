'use client';

import React from 'react';
import { Plus } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { HeroCard } from './HeroCard';
import { SpendingChart } from './SpendingChart';
import { CategorySummary } from './CategorySummary';
import { RecentMonths } from './RecentMonths';
import { EmptyState } from './EmptyState';

interface DashboardViewProps {
  onNavigateToMonth: (monthId?: string) => void;
  onOpenAddExpense: () => void;
  onOpenNewMonthWizard: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigateToMonth,
  onOpenAddExpense,
  onOpenNewMonthWizard,
}) => {
  const { activeMonthSummary, isFirstTimeEmpty, months, setActiveMonthId } = useFinance();

  if (isFirstTimeEmpty || months.length === 0 || !activeMonthSummary) {
    return <EmptyState type="no-months" onAction={onOpenNewMonthWizard} />;
  }

  const handleSelectRecentMonth = (monthId: string) => {
    setActiveMonthId(monthId);
    onNavigateToMonth(monthId);
  };

  return (
    <div className="space-y-4 pb-24 px-4 pt-1 animate-fade-in">
      {/* Lời chào đầu trang */}
      <div className="px-1 pt-1 pb-1">
        <h2 className="text-xl font-black text-[#3D405B]">Xin chào 👋</h2>
        <p className="text-xs font-semibold text-[#7A7D8C] mt-0.5">
          Quản lý tiền của bạn thật nhẹ nhàng nhé.
        </p>
      </div>

      {/* Hero Card trọng tâm câu hỏi tuần */}
      <HeroCard
        summary={activeMonthSummary}
        onViewMonthDetail={() => onNavigateToMonth(activeMonthSummary.month.id)}
      />

      {/* Biểu đồ chi tiêu 3 tháng */}
      <SpendingChart />

      {/* Danh mục: Tiền đã đi đâu? */}
      <CategorySummary summary={activeMonthSummary} />

      {/* Lịch sử các tháng trước */}
      <RecentMonths onSelectMonth={handleSelectRecentMonth} />

      {/* Nút nổi thêm chi tiêu nhanh */}
      <div className="pt-2">
        <button
          onClick={onOpenAddExpense}
          className="w-full py-4 rounded-2xl bg-[#6FCF97] hover:bg-[#58B880] text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-[0_8px_25px_rgba(111,207,151,0.35)] active:scale-98 transition-all"
        >
          <Plus size={18} />
          <span>+ Thêm khoản chi</span>
        </button>
      </div>
    </div>
  );
};
