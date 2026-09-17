'use client';

import React from 'react';
import { ArrowRight } from 'lucide-react';
import { MonthSummary } from '../types/finance';
import { formatVND } from '../lib/financeCalculations';
import { getSpendingRoast } from '../lib/roastMessages';

interface HeroCardProps {
  summary: MonthSummary;
  onViewMonthDetail: () => void;
}

export const HeroCard: React.FC<HeroCardProps> = ({ summary, onViewMonthDetail }) => {
  const currentWeek = summary.currentWeekSummary;

  const weeklyRemaining = currentWeek ? currentWeek.remaining : 0;
  const weeklySpent = currentWeek ? currentWeek.spent : 0;
  const weeklyBudget = summary.month.lockedWeeklyBudget;
  const percentSpent = currentWeek ? Math.min(100, currentWeek.percentSpent) : 0;

  // Lấy câu cảnh báo/chửi yêu thức tỉnh người dùng tùy theo mức độ chi tiêu tuần
  const roast = getSpendingRoast(
    currentWeek ? currentWeek.percentSpent : 0,
    weeklySpent,
    weeklyRemaining
  );

  return (
    <div className="bg-white rounded-[28px] p-5 sm:p-6 cozy-card-shadow border border-[#6FCF97]/20 relative overflow-hidden transition-all">
      {/* Nền gradient hoa văn mềm mại tiệp màu theme */}
      <div className="absolute top-0 right-0 w-44 h-44 bg-[#EBF8F1] rounded-full blur-3xl -mr-12 -mt-12 pointer-events-none opacity-60" />

      {/* Header của HeroCard */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#6FCF97] animate-pulse" />
          <span className="text-xs font-bold text-[#7A7D8C] tracking-wide">
            Tuần này bạn còn bao nhiêu tiền?
          </span>
        </div>
        <span className="text-[11px] font-bold text-[#58B880] bg-[#EBF8F1] px-2.5 py-0.5 rounded-full border border-[#6FCF97]/20">
          {currentWeek?.week.name || 'Tuần này'}
        </span>
      </div>

      {/* Con số trọng tâm to nhất ứng dụng: Tiền khả dụng tuần này */}
      <div className="my-2">
        <div className="text-4xl xs:text-[46px] font-black tracking-tight text-[#3D405B] leading-none">
          {formatVND(weeklyRemaining)}
        </div>
        <p className="text-xs font-semibold text-[#6FCF97] mt-2 flex items-center gap-1.5">
          <span>Khả dụng để tiêu tuần này</span>
          <span className="text-[10px] text-[#A7A9B4]">
            • ({currentWeek?.week.startDate} → {currentWeek?.week.endDate})
          </span>
        </p>
      </div>

      {/* Thanh tiến độ chi tiêu tuần */}
      <div className="mt-4 mb-2">
        <div className="w-full h-3.5 bg-[#F1F2F6] rounded-full overflow-hidden p-0.5">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              percentSpent > 100
                ? 'bg-[#FF7B7B]'
                : percentSpent > 80
                ? 'bg-[#FFD166]'
                : 'bg-[#6FCF97]'
            }`}
            style={{ width: `${Math.min(100, Math.max(5, percentSpent))}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-1.5 text-xs text-[#7A7D8C] font-semibold">
          <span>
            Đã chi: <strong className="text-[#3D405B]">{formatVND(weeklySpent)}</strong>
          </span>
          <span>
            Hạn mức tuần: <strong className="text-[#3D405B]">{formatVND(weeklyBudget)}</strong>
          </span>
        </div>
      </div>

      {/* CÂU CHỬI CẢNH BÁO / ĐỘNG VIÊN DÍ DỎM (DUYÊN DÁNG, THỨC TỈNH NGƯỜI DÙNG) */}
      <div
        className={`my-3.5 p-3 rounded-2xl border flex items-start gap-2.5 transition-all shadow-2xs ${roast.badgeBg} ${roast.badgeBorder}`}
      >
        <span className="text-xl shrink-0 leading-none select-none mt-0.5">
          {roast.emoji}
        </span>
        <div className="flex-1">
          <div className={`text-[11px] font-black uppercase tracking-wide mb-0.5 ${roast.badgeText}`}>
            {roast.title}
          </div>
          <p className="text-xs font-bold text-[#3D405B] leading-relaxed">
            {roast.message}
          </p>
        </div>
      </div>

      {/* 3 ô tóm tắt mini */}
      <div className="grid grid-cols-3 gap-2 py-3 border-t border-gray-100">
        <div className="text-center p-2 rounded-xl bg-[#F8F9FA]">
          <span className="text-[10px] font-semibold text-[#A7A9B4] block">Thu nhập</span>
          <span className="text-xs font-bold text-[#3D405B] mt-0.5 block">
            {formatVND(summary.initialMoney)}
          </span>
        </div>

        <div className="text-center p-2 rounded-xl bg-[#FFF8E7]">
          <span className="text-[10px] font-semibold text-[#E5A800] block">Cố định</span>
          <span className="text-xs font-bold text-[#FF7B7B] mt-0.5 block">
            -{formatVND(summary.totalFixed)}
          </span>
        </div>

        <div className="text-center p-2 rounded-xl bg-[#F4F0FC]">
          <span className="text-[10px] font-semibold text-[#9C88FF] block">Ngân sách tuần</span>
          <span className="text-xs font-bold text-[#3D405B] mt-0.5 block">
            {formatVND(weeklyBudget)}
          </span>
        </div>
      </div>

      {/* Nút xem chi tiết tháng */}
      <button
        onClick={onViewMonthDetail}
        className="w-full mt-2 py-3.5 px-4 rounded-2xl bg-[#6FCF97] hover:bg-[#58B880] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-[0_6px_20px_rgba(111,207,151,0.3)] active:scale-98 transition-all"
      >
        <span>Xem chi tiết tháng</span>
        <ArrowRight size={16} />
      </button>
    </div>
  );
};
