'use client';

import React from 'react';
import { PiggyBank, Calendar } from 'lucide-react';
import { MonthSummary } from '../types/finance';
import { formatVND } from '../lib/financeCalculations';

interface MonthlySummaryCardProps {
  summary: MonthSummary;
}

export const MonthlySummaryCard: React.FC<MonthlySummaryCardProps> = ({ summary }) => {
  return (
    <div className="bg-white rounded-[28px] p-6 cozy-card-shadow border border-[#6FCF97]/15 relative overflow-hidden">
      {/* Header dòng tiền */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-extrabold text-[#3D405B] text-base">Tổng quan dòng tiền</h2>
        <span className="text-[11px] font-bold text-[#A7A9B4] flex items-center gap-1">
          <Calendar size={12} />
          <span>{summary.month.weeks.length} tuần</span>
        </span>
      </div>

      {/* Còn lại thực tế tháng */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-xs text-[#7A7D8C] font-semibold block">Còn lại thực tế tháng</span>
          <div className="text-3xl font-black text-[#3D405B] mt-0.5 tracking-tight">
            {formatVND(summary.remainingMonth)}
          </div>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-[#EBF8F1] flex items-center justify-center text-[#58B880] border border-[#6FCF97]/20 shadow-xs">
          <PiggyBank size={24} />
        </div>
      </div>

      {/* Bảng phân bổ 4 ô chi tiết */}
      <div className="grid grid-cols-2 gap-3 py-3 border-t border-b border-gray-100">
        <div>
          <span className="text-[11px] font-semibold text-[#A7A9B4] block">Ban đầu</span>
          <span className="text-sm font-extrabold text-[#3D405B] block mt-0.5">
            {formatVND(summary.initialMoney)}
          </span>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#A7A9B4] block">Cố định đã trừ</span>
            <span className="text-[10px] text-[#A7A9B4]">Nhà, net</span>
          </div>
          <span className="text-sm font-extrabold text-[#FF7B7B] block mt-0.5">
            -{formatVND(summary.totalFixed)}
          </span>
        </div>

        <div>
          <span className="text-[11px] font-semibold text-[#A7A9B4] block">
            Khả dụng ({summary.month.weeks.length} tuần)
          </span>
          <span className="text-sm font-extrabold text-[#3D405B] block mt-0.5">
            {formatVND(summary.availableBudget)}
          </span>
        </div>

        <div>
          <span className="text-[11px] font-semibold text-[#A7A9B4] block">Đã chi tiêu</span>
          <span className="text-sm font-extrabold text-[#FF7B7B] block mt-0.5">
            -{formatVND(summary.totalSpent)}
          </span>
        </div>
      </div>

      {/* Phân rã Quỹ tích lũy dôi dư & Ngân sách các tuần */}
      {summary.unallocatedSavings > 0 && (
        <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-gray-100 text-xs">
          <div className="bg-[#F8F9FA] p-2.5 rounded-xl">
            <span className="text-[10px] font-bold text-[#7A7D8C] block">
              🏦 Quỹ tích lũy / Dôi dư
            </span>
            <strong className="text-xs font-black text-[#3D405B] block mt-0.5">
              {formatVND(summary.unallocatedSavings)}
            </strong>
          </div>
          <div className="bg-[#EBF8F1] p-2.5 rounded-xl border border-[#6FCF97]/20">
            <span className="text-[10px] font-bold text-[#58B880] block">
              📅 Ngân sách tuần còn
            </span>
            <strong className="text-xs font-black text-[#58B880] block mt-0.5">
              {formatVND(summary.totalWeeksRemaining)}
            </strong>
          </div>
        </div>
      )}

      {/* Tiến độ tổng tháng */}
      <div className="mt-4">
        <div className="w-full h-3 bg-[#F1F2F6] rounded-full overflow-hidden p-0.5">
          <div
            className="h-full rounded-full bg-[#6FCF97] transition-all duration-700"
            style={{ width: `${Math.min(100, Math.max(5, summary.percentMonthSpent))}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-1.5 text-[11px] text-[#7A7D8C] font-semibold">
          <span>Đã tiêu {summary.percentMonthSpent}%</span>
          <span className="text-[#58B880]">Tốc độ tiêu an toàn</span>
        </div>
      </div>
    </div>
  );
};
