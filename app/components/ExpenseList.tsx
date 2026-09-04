'use client';

import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Expense, ExpenseCategory } from '../types/finance';
import { CATEGORIES } from '../lib/constants';
import { formatVND } from '../lib/financeCalculations';
import { useFinance } from '../context/FinanceContext';

interface ExpenseListProps {
  expenses: Expense[];
  currentWeekIndex: number;
}

export const ExpenseList: React.FC<ExpenseListProps> = ({ expenses, currentWeekIndex }) => {
  const { deleteExpense } = useFinance();
  const [filter, setFilter] = useState<string>('all');

  const filterTabs = [
    { id: 'all', label: 'Tất cả' },
    { id: 'current_week', label: 'Tuần này' },
    { id: 'food', label: 'Ăn uống' },
    { id: 'transport', label: 'Di chuyển' },
    { id: 'shopping', label: 'Mua sắm' },
    { id: 'entertainment', label: 'Giải trí' },
    { id: 'other', label: 'Khác' },
  ];

  const filteredExpenses = expenses.filter((exp) => {
    if (filter === 'all') return true;
    if (filter === 'current_week') return exp.weekIndex === currentWeekIndex;
    return exp.category === filter;
  });

  return (
    <div className="bg-white rounded-[28px] p-5 cozy-card-shadow border border-[#3D405B]/5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-extrabold text-[#3D405B] text-base">Lịch sử chi tiêu</h3>
        <span className="text-[11px] font-bold text-[#6FCF97]">
          {filteredExpenses.length} khoản chi
        </span>
      </div>

      {/* Filter tabs cuộn ngang mượt mà */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-3 -mx-1 px-1 scrollbar-none">
        {filterTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
              filter === tab.id
                ? 'bg-[#6FCF97] text-white shadow-xs scale-102'
                : 'bg-gray-100 text-[#7A7D8C] hover:bg-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Danh sách khoản chi */}
      {filteredExpenses.length === 0 ? (
        <div className="py-8 text-center">
          <span className="text-3xl block mb-2">🎉</span>
          <p className="text-xs font-bold text-[#3D405B]">Tuần này chưa tiêu gì cả</p>
          <p className="text-[11px] text-[#A7A9B4] mt-1">
            Không chi tiêu chính là cách tiết kiệm tốt nhất!
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredExpenses.map((exp) => {
            const meta = CATEGORIES[exp.category] || CATEGORIES.other;

            return (
              <div
                key={exp.id}
                className="p-3 rounded-2xl border border-gray-100 flex items-center justify-between hover:bg-[#FDFDFD] transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl shrink-0 category-icon-box"
                    style={{ backgroundColor: meta.bgColor }}
                  >
                    <span>{meta.icon}</span>
                  </div>

                  <div>
                    <h4 className="font-extrabold text-[#3D405B] text-xs leading-tight">
                      {exp.description}
                    </h4>
                    <p className="text-[10px] text-[#A7A9B4] mt-0.5">
                      {exp.date} • Tuần {exp.weekIndex + 1}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-xs font-black text-[#FF7B7B] block">
                      -{formatVND(exp.amount)}
                    </span>
                    <span className="text-[10px] text-[#A7A9B4] block mt-0.5">
                      {exp.wallet || 'Ví chính'}
                    </span>
                  </div>

                  <button
                    onClick={() => deleteExpense(exp.id)}
                    className="opacity-0 group-hover:opacity-100 focus:opacity-100 w-7 h-7 rounded-lg bg-gray-100 text-gray-400 hover:text-[#FF7B7B] hover:bg-[#FFEAEA] flex items-center justify-center transition-all"
                    title="Xóa khoản chi"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
