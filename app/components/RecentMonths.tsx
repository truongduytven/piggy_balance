'use client';

import React from 'react';
import { History, ChevronRight } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatVND } from '../lib/financeCalculations';

interface RecentMonthsProps {
  onSelectMonth: (monthId: string) => void;
}

export const RecentMonths: React.FC<RecentMonthsProps> = ({ onSelectMonth }) => {
  const { allMonthsSummaries, activeMonthId } = useFinance();

  // Lấy các tháng đã lưu (loại trừ tháng active nếu muốn, hoặc hiển thị danh sách các tháng cũ)
  const historyMonths = allMonthsSummaries.filter((m) => m.month.id !== activeMonthId);

  if (historyMonths.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-[28px] p-5 cozy-card-shadow border border-[#3D405B]/5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-[#F4F0FC] flex items-center justify-center text-[#9C88FF]">
            <History size={16} />
          </div>
          <h2 className="font-extrabold text-[#3D405B] text-base">Tháng gần đây</h2>
        </div>
        <span className="text-[11px] font-semibold text-[#A7A9B4]">Nhìn lại hành trình</span>
      </div>

      <div className="space-y-2.5">
        {historyMonths.map((item) => {
          const isTargetAchieved = item.percentMonthSpent <= 95;

          return (
            <div
              key={item.month.id}
              onClick={() => onSelectMonth(item.month.id)}
              className="p-3.5 rounded-2xl border border-gray-100 flex items-center justify-between hover:bg-[#FDFDFD] active:scale-99 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#F8F9FA] flex items-center justify-center font-black text-xs text-[#3D405B] border border-gray-100">
                  T{item.month.monthNumber}
                </div>
                <div>
                  <h4 className="font-extrabold text-[#3D405B] text-sm leading-tight">
                    {item.month.name}
                  </h4>
                  <p className="text-[11px] text-[#7A7D8C] mt-0.5">
                    Chi: <strong className="text-[#3D405B]">{formatVND(item.totalSpent)}</strong>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                    isTargetAchieved
                      ? 'bg-[#EBF8F1] text-[#58B880] border border-[#6FCF97]/20'
                      : 'bg-[#FFF8E7] text-[#E5A800] border border-[#FFD166]/30'
                  }`}
                >
                  {isTargetAchieved ? 'Đạt mục tiêu' : 'Vừa vặn'}
                </span>
                <ChevronRight size={16} className="text-[#A7A9B4]" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
