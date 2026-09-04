'use client';

import React from 'react';
import { PieChart } from 'lucide-react';
import { CATEGORIES } from '../lib/constants';
import { MonthSummary, ExpenseCategory } from '../types/finance';
import { formatVND } from '../lib/financeCalculations';

interface CategorySummaryProps {
  summary: MonthSummary;
}

export const CategorySummary: React.FC<CategorySummaryProps> = ({ summary }) => {
  const categoryKeys: ExpenseCategory[] = ['food', 'shopping', 'transport', 'entertainment', 'other'];

  return (
    <div className="bg-white rounded-[28px] p-5 cozy-card-shadow border border-[#3D405B]/5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-[#FFF8E7] flex items-center justify-center text-[#FFA502]">
            <PieChart size={16} />
          </div>
          <h2 className="font-extrabold text-[#3D405B] text-base">Tiền đã đi đâu? 👀</h2>
        </div>
        <span className="text-[11px] font-semibold text-[#6FCF97]">Tất cả mục</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {categoryKeys.map((catKey) => {
          const meta = CATEGORIES[catKey];
          const amount = summary.categorySpending[catKey] || 0;

          return (
            <div
              key={catKey}
              className="p-3 rounded-2xl border border-gray-100 flex items-center gap-3 hover:bg-[#FDFDFD] transition-colors"
            >
              <div
                className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl shrink-0 category-icon-box"
                style={{ backgroundColor: meta.bgColor }}
              >
                <span>{meta.icon}</span>
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[11px] font-bold text-[#7A7D8C] block truncate">
                  {meta.name}
                </span>
                <span className="text-xs font-black text-[#3D405B] block truncate mt-0.5">
                  {amount > 0 ? formatVND(amount) : '0đ'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
