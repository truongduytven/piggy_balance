'use client';

import React from 'react';
import { ArrowRight, PiggyBank } from 'lucide-react';
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

  // Lấy câu cảnh báo/chửi yêu thức tỉnh người dùng tùy theo mức độ chi tiêu
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
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#EBF8F1] flex items-center justify-center text-[#58B880] border border-[#6FCF97]/20 shadow-2xs">
            <PiggyBank size={17} />
          </div>
          <div>
            <span className="text-[11px] font-bold text-[#7A7D8C] uppercase tracking-wider block">
              Sổ quỹ tháng
            </span>
            <span className="text-xs font-black text-[#3D405B]">
              {summary.month.name}
            </span>
          </div>
        </div>

        <span className="text-[11px] font-bold text-[#58B880] bg-[#EBF8F1] px-3 py-1 rounded-full border border-[#6FCF97]/25 shadow-2xs">
          {currentWeek?.week.name || 'Tuần này'} ({currentWeek?.week.startDate} → {currentWeek?.week.endDate})
        </span>
      </div>

      {/* KHỐI 1: TỔNG SỐ TIỀN HIỆN CÒN (TRỌNG TÂM CẢ THÁNG) */}
      <div className="my-2 pb-3">
        <span className="text-xs font-bold text-[#7A7D8C] block mb-1">
          Tổng số tiền hiện còn
        </span>
        <div className="text-4xl xs:text-[44px] font-black tracking-tight text-[#3D405B] leading-none">
          {formatVND(summary.remainingMonth)}
        </div>
        <p className="text-[11px] font-semibold text-[#7A7D8C] mt-2 flex items-center gap-1.5 flex-wrap">
          <span>Đã chi: <strong className="text-[#FF7B7B]">-{formatVND(summary.totalSpent)}</strong></span>
          <span className="text-[#A7A9B4]">•</span>
          <span className="text-[#58B880]">Tự động trừ khi sài tiếp 🌱</span>
        </p>

        {/* 2 thẻ phân rã nguồn tiền tiệp màu với theme */}
        <div className="grid grid-cols-2 gap-2.5 mt-3 text-xs">
          <div className="bg-[#F8F9FA] p-3 rounded-2xl border border-gray-100">
            <span className="text-[10px] font-bold text-[#7A7D8C] block">
              🏦 Quỹ dôi dư / Tích lũy
            </span>
            <strong className="text-sm font-black text-[#3D405B] block mt-0.5">
              {formatVND(summary.unallocatedSavings)}
            </strong>
            <span className="text-[10px] text-[#A7A9B4] block mt-0.5">
              Ngoài ngân sách tuần
            </span>
          </div>

          <div className="bg-[#F8F9FA] p-3 rounded-2xl border border-gray-100">
            <span className="text-[10px] font-bold text-[#7A7D8C] block">
              📅 Ngân sách các tuần
            </span>
            <strong className="text-sm font-black text-[#58B880] block mt-0.5">
              {formatVND(summary.totalWeeksRemaining)}
            </strong>
            <span className="text-[10px] text-[#A7A9B4] block mt-0.5">
              Còn lại để chi tiêu
            </span>
          </div>
        </div>
      </div>

      {/* KHỐI 2: CHI TIÊU TUẦN NÀY & CÂU CẢNH BÁO/CHỬI YÊU DÍ DỎM */}
      <div className="pt-3.5 border-t border-gray-100">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#6FCF97] animate-pulse" />
            <span className="text-xs font-bold text-[#7A7D8C]">
              Khả dụng tuần này ({currentWeek?.week.name})
            </span>
          </div>
          <span className="text-[10px] font-semibold text-[#A7A9B4]">
            {currentWeek?.week.startDate} → {currentWeek?.week.endDate}
          </span>
        </div>

        {/* Con số tuần to bằng số tiền còn, cực kỳ dễ theo dõi */}
        <div className="my-2 flex items-baseline justify-between gap-2 flex-wrap">
          <div className="text-4xl xs:text-[44px] font-black tracking-tight text-[#3D405B] leading-none">
            {formatVND(weeklyRemaining)}
          </div>
          <span
            className={`text-[11px] font-bold px-2.5 py-1 rounded-full border shrink-0 ${
              percentSpent > 100
                ? 'bg-[#FFEAEA] text-[#FF7B7B] border-[#FF7B7B]/30'
                : percentSpent > 80
                ? 'bg-[#FFF8E7] text-[#E5A800] border-[#FFD166]/40'
                : 'bg-[#EBF8F1] text-[#58B880] border-[#6FCF97]/25'
            }`}
          >
            {percentSpent > 100 ? 'Đã vượt hạn mức' : `Đã tiêu ${Math.round(percentSpent)}%`}
          </span>
        </div>

        {/* Thanh tiến độ chi tiêu tuần */}
        <div className="w-full h-3 bg-[#F1F2F6] rounded-full overflow-hidden p-0.5 mt-2">
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
        <div className="flex items-center justify-between mt-1 text-[11px] text-[#7A7D8C] font-semibold">
          <span>
            Đã chi: <strong className="text-[#3D405B]">{formatVND(weeklySpent)}</strong>
          </span>
          <span>
            Hạn mức tuần: <strong className="text-[#3D405B]">{formatVND(weeklyBudget)}</strong>
          </span>
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
