'use client';

import React from 'react';
import { Calendar, ChevronRight } from 'lucide-react';
import { WeekSummary } from '../types/finance';
import { formatVND } from '../lib/financeCalculations';

interface WeeklyBudgetCardsProps {
  weeksSummary: WeekSummary[];
  onSelectWeek?: (weekIndex: number) => void;
  selectedWeekIndex?: number | null;
}

export const WeeklyBudgetCards: React.FC<WeeklyBudgetCardsProps> = ({
  weeksSummary,
  onSelectWeek,
  selectedWeekIndex,
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <h3 className="font-extrabold text-[#3D405B] text-base">
          Tiến độ chi tiêu {weeksSummary.length} tuần
        </h3>
        <span className="text-[11px] font-semibold text-[#A7A9B4]">Tháng này</span>
      </div>

      <div className="space-y-3">
        {weeksSummary.map((item, idx) => {
          const isSelected = selectedWeekIndex === idx;
          const isCurrent = item.week.isCurrent;

          // Màu thanh tiến độ
          let progressColor = 'bg-[#6FCF97]';
          let statusBadgeBg = 'bg-[#EBF8F1] text-[#58B880] border-[#6FCF97]/20';

          if (item.status === 'unused') {
            progressColor = 'bg-gray-300';
            statusBadgeBg = 'bg-gray-100 text-gray-500 border-gray-200';
          } else if (item.status === 'over') {
            progressColor = 'bg-[#FF7B7B]';
            statusBadgeBg = 'bg-[#FFEAEA] text-[#FF7B7B] border-[#FF7B7B]/20';
          } else if (item.status === 'warning') {
            progressColor = 'bg-[#FFD166]';
            statusBadgeBg = 'bg-[#FFF8E7] text-[#E5A800] border-[#FFD166]/30';
          } else if (item.status === 'moderate') {
            progressColor = 'bg-[#8ECAE6]';
            statusBadgeBg = 'bg-[#EEF8FC] text-[#0096C7] border-[#8ECAE6]/30';
          }

          return (
            <div
              key={item.week.index}
              onClick={() => onSelectWeek && onSelectWeek(idx)}
              className={`bg-white rounded-[24px] p-4.5 cozy-card-shadow border transition-all cursor-pointer ${
                isSelected
                  ? 'border-[#6FCF97] ring-2 ring-[#6FCF97]/30'
                  : isCurrent
                  ? 'border-[#6FCF97]/30'
                  : 'border-gray-100'
              }`}
            >
              {/* Header tuần */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <h4 className="font-black text-[#3D405B] text-sm">
                    {item.week.name}
                  </h4>
                  <span className="text-[11px] font-medium text-[#7A7D8C]">
                    ({item.week.startDate} → {item.week.endDate})
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  {isCurrent && (
                    <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-[#EBF8F1] text-[#58B880] border border-[#6FCF97]/30">
                      Tuần hiện tại
                    </span>
                  )}
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusBadgeBg}`}
                  >
                    {item.status === 'unused' ? 'Kế hoạch' : item.statusLabel}
                  </span>
                </div>
              </div>

              {/* Con số chi tiêu vs còn lại */}
              <div className="flex items-baseline justify-between my-2">
                <div>
                  <span className="text-[10px] text-[#A7A9B4] block font-semibold">Đã tiêu</span>
                  <div className="text-base font-black text-[#3D405B]">
                    {formatVND(item.spent)}{' '}
                    <span className="text-[11px] font-normal text-[#A7A9B4]">
                      / {formatVND(item.lockedBudget)}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-[#A7A9B4] block font-semibold">Còn lại</span>
                  <div
                    className={`text-lg font-black ${
                      item.remaining < 0
                        ? 'text-[#FF7B7B]'
                        : item.remaining === 0
                        ? 'text-gray-400'
                        : 'text-[#58B880]'
                    }`}
                  >
                    {formatVND(item.remaining)}
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2.5 bg-[#F1F2F6] rounded-full overflow-hidden p-0.5 my-2">
                <div
                  className={`h-full rounded-full ${progressColor} transition-all duration-500`}
                  style={{ width: `${Math.min(100, Math.max(item.spent > 0 ? 5 : 0, item.percentSpent))}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] font-semibold text-[#7A7D8C] mt-1">
                <span>
                  {item.statusIcon} {item.statusLabel}
                </span>
                <span>{item.percentSpent}% định mức</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
