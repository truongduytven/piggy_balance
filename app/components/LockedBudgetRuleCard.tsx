'use client';

import React from 'react';
import { Lock, Sparkles, Lightbulb } from 'lucide-react';
import { formatVND } from '../lib/financeCalculations';

interface LockedBudgetRuleCardProps {
  lockedWeeklyBudget: number;
}

export const LockedBudgetRuleCard: React.FC<LockedBudgetRuleCardProps> = ({
  lockedWeeklyBudget,
}) => {
  return (
    <div className="bg-[#FFF8E7] rounded-[28px] p-5 border border-[#FFD166]/40 shadow-xs relative overflow-hidden">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-[#E5A800] shadow-xs">
            <Lock size={16} />
          </div>
          <span className="font-extrabold text-[#3D405B] text-sm">
            Ngân sách chốt tuần
          </span>
        </div>
        <span className="text-[10px] font-bold text-[#E5A800] bg-white px-2.5 py-0.5 rounded-full border border-[#FFD166]/40">
          Quy tắc vàng 🔒
        </span>
      </div>

      <div className="mt-2 mb-3">
        <div className="text-2xl font-black text-[#3D405B] flex items-baseline gap-1.5">
          <span>{formatVND(lockedWeeklyBudget)}</span>
          <span className="text-xs font-semibold text-[#7A7D8C]">/ tuần</span>
        </div>
      </div>

      <div className="p-3 bg-white/80 rounded-2xl border border-[#FFD166]/30 flex items-start gap-2.5">
        <Lightbulb size={16} className="text-[#FFA502] shrink-0 mt-0.5" />
        <p className="text-xs text-[#3D405B] leading-relaxed">
          <strong className="font-bold">Nguyên tắc tự do:</strong> Ngân sách tuần sẽ{' '}
          <u className="underline decoration-[#FFA502] decoration-2 font-bold">không dồn lại</u> khi tiêu thừa hay thiếu. Mỗi tuần mới là một khởi đầu hoàn toàn độc lập.
        </p>
      </div>
    </div>
  );
};
