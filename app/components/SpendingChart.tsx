'use client';

import React from 'react';
import { BarChart3, TrendingDown } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatVND } from '../lib/financeCalculations';

export const SpendingChart: React.FC = () => {
  const { allMonthsSummaries } = useFinance();

  // Chỉ lấy các tháng thực tế có trong database
  const monthsData = allMonthsSummaries.slice(0, 4).map((summary) => ({
    id: summary.month.id,
    name: summary.month.name,
    spent: summary.totalSpent,
    spentDisplay: formatVND(summary.totalSpent),
    status: summary.status,
  }));

  if (monthsData.length === 0) {
    return null;
  }

  const maxSpent = Math.max(...monthsData.map((m) => m.spent), 1_000_000);
  const bestMonth = [...monthsData].sort((a, b) => a.spent - b.spent)[0];

  return (
    <div className="bg-white rounded-[28px] p-5 cozy-card-shadow border border-[#3D405B]/5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-[#EBF8F1] flex items-center justify-center text-[#58B880]">
            <BarChart3 size={16} />
          </div>
          <h2 className="font-extrabold text-[#3D405B] text-base">Biến động chi tiêu</h2>
        </div>
        <span className="text-[11px] font-semibold text-[#A7A9B4]">
          {monthsData.length} tháng gần nhất
        </span>
      </div>

      {/* Badge điểm nhấn động theo dữ liệu thực tế */}
      {bestMonth && (
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F4F0FC] text-[#9C88FF] text-xs font-bold mb-4">
          <TrendingDown size={14} />
          <span>{bestMonth.name} đang chi tiêu tiết kiệm nhất 🌱</span>
        </div>
      )}

      {/* Biểu đồ thanh ngang tối giản */}
      <div className="space-y-3">
        {monthsData.map((item, index) => {
          const widthPercent =
            item.spent > 0 ? Math.max(20, Math.min(100, (item.spent / maxSpent) * 100)) : 12;

          const barColors = ['bg-[#6FCF97]', 'bg-[#FFD166]', 'bg-[#FF8FAB]', 'bg-[#8ECAE6]'];
          const barColor = barColors[index % barColors.length];

          return (
            <div key={item.id} className="flex items-center gap-3">
              <span className="text-xs font-bold text-[#7A7D8C] w-20 shrink-0 truncate">
                {item.name}
              </span>

              <div className="flex-1 bg-[#F8F9FA] rounded-full h-8 p-1 overflow-hidden">
                <div
                  className={`h-full rounded-full ${barColor} flex items-center justify-end px-3 transition-all duration-700`}
                  style={{ width: `${widthPercent}%` }}
                >
                  <span className="text-[10px] font-extrabold text-white truncate">
                    {item.spentDisplay}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
