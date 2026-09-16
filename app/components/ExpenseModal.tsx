'use client';

import React, { useState } from 'react';
import { X, Sparkles, Plus, Check } from 'lucide-react';
import confetti from 'canvas-confetti';
import { ExpenseCategory } from '../types/finance';
import { CATEGORIES, WALLETS } from '../lib/constants';
import { useFinance } from '../context/FinanceContext';
import { formatVND, getTodayDateString } from '../lib/financeCalculations';
import { getSpendingRoast, RoastInfo } from '../lib/roastMessages';
import { CozySelect } from './CozySelect';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExpenseModal: React.FC<ExpenseModalProps> = ({ isOpen, onClose }) => {
  const { addExpense, activeMonth, activeMonthSummary, isApiLoading } = useFinance();

  const [amountStr, setAmountStr] = useState<string>('');
  const [category, setCategory] = useState<ExpenseCategory>('food');
  const [description, setDescription] = useState<string>('');
  const [wallet, setWallet] = useState<string>('Ví chính');
  const [date, setDate] = useState<string>(getTodayDateString());
  const [showSuccessToast, setShowSuccessToast] = useState<boolean>(false);
  const [submittedRoast, setSubmittedRoast] = useState<RoastInfo | null>(null);

  if (!isOpen) return null;

  const quickAmounts = [30_000, 50_000, 100_000, 200_000, 500_000];

  const handleQuickAmount = (val: number) => {
    setAmountStr(val.toString());
  };

  const inputAmount = parseInt(amountStr.replace(/\D/g, ''), 10) || 0;
  const currentWeeklyRemaining = activeMonthSummary?.currentWeekSummary?.remaining ?? 0;
  const currentWeeklyBudget = activeMonthSummary?.month.lockedWeeklyBudget ?? 1;
  const currentWeeklySpent = activeMonthSummary?.currentWeekSummary?.spent ?? 0;

  const projectedSpent = currentWeeklySpent + inputAmount;
  const projectedRemaining = currentWeeklyRemaining - inputAmount;
  const projectedPercent =
    currentWeeklyBudget > 0 ? (projectedSpent / currentWeeklyBudget) * 100 : 0;
  const projectedRoast =
    inputAmount > 0
      ? getSpendingRoast(projectedPercent, projectedSpent, projectedRemaining)
      : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isApiLoading) return;
    const amount = parseInt(amountStr.replace(/\D/g, ''), 10);
    if (isNaN(amount) || amount <= 0) {
      alert('Vui lòng nhập số tiền hợp lệ nha!');
      return;
    }

    const finalDesc = description.trim() || CATEGORIES[category].name;

    await addExpense({
      amount,
      category,
      description: finalDesc,
      wallet,
      date,
    });

    setSubmittedRoast(projectedRoast);

    // Bắn pháo hoa ăn mừng nhẹ nhàng nếu không bị over
    if (!projectedRoast || projectedRoast.level !== 'over') {
      try {
        confetti({
          particleCount: 35,
          spread: 50,
          origin: { y: 0.7 },
          colors: ['#6FCF97', '#FF8FAB', '#FFD166'],
        });
      } catch {}
    }

    setShowSuccessToast(true);
    setTimeout(() => {
      setShowSuccessToast(false);
      onClose();
      // Reset form
      setAmountStr('');
      setDescription('');
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-xs p-0 sm:p-4 animate-fade-in">
      <div className="w-full max-w-[430px] bg-white rounded-t-[32px] sm:rounded-[32px] p-6 shadow-2xl max-h-[92vh] overflow-y-auto animate-slide-up relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <span className="text-2xl">💸</span>
            <h3 className="font-extrabold text-[#3D405B] text-lg">Ghi khoản chi mới</h3>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Số tiền */}
          <div>
            <label className="text-xs font-bold text-[#7A7D8C] block mb-1.5">Số tiền chi</label>
            <div className="relative">
              <input
                type="number"
                placeholder="70000"
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                className="w-full bg-[#F8F9FA] border border-gray-200 rounded-2xl py-3.5 px-4 text-xl font-black text-[#3D405B] focus:outline-none focus:border-[#6FCF97] focus:bg-white transition-all placeholder:text-gray-300"
                autoFocus
                required
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-[#7A7D8C]">
                VND
              </span>
            </div>

            {/* Phím tắt chọn nhanh */}
            <div className="flex items-center gap-1.5 mt-2 overflow-x-auto pb-1 scrollbar-none">
              {quickAmounts.map((qVal) => (
                <button
                  key={qVal}
                  type="button"
                  onClick={() => handleQuickAmount(qVal)}
                  className="px-2.5 py-1 rounded-full bg-[#EBF8F1] text-[#58B880] text-[11px] font-bold whitespace-nowrap hover:bg-[#D9F3E4] transition-colors"
                >
                  +{formatVND(qVal)}
                </button>
              ))}
            </div>

            {/* Cảnh báo / Câu chửi yêu thời gian thực khi đang nhập số tiền */}
            {projectedRoast && inputAmount > 0 && (
              <div
                className={`mt-2.5 p-3 rounded-2xl border text-xs flex items-start gap-2.5 animate-fade-in ${projectedRoast.badgeBg} ${projectedRoast.badgeBorder}`}
              >
                <span className="text-xl select-none mt-0.5">{projectedRoast.emoji}</span>
                <div className="flex-1">
                  <div className={`text-[10px] font-black uppercase tracking-wider ${projectedRoast.badgeText}`}>
                    {projectedRoast.title} • {projectedRemaining < 0 ? `Vượt ${formatVND(Math.abs(projectedRemaining))}` : `Còn ${formatVND(projectedRemaining)}`}
                  </div>
                  <p className="text-xs font-bold text-[#3D405B] mt-0.5 leading-snug">
                    {projectedRoast.message}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Danh mục */}
          <div>
            <label className="text-xs font-bold text-[#7A7D8C] block mb-1.5">Danh mục</label>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(CATEGORIES) as ExpenseCategory[]).map((catKey) => {
                const item = CATEGORIES[catKey];
                const isSelected = category === catKey;

                return (
                  <button
                    key={catKey}
                    type="button"
                    onClick={() => setCategory(catKey)}
                    className={`p-2.5 rounded-2xl border text-left flex flex-col items-center justify-center gap-1 transition-all ${
                      isSelected
                        ? 'border-[#6FCF97] bg-[#EBF8F1] ring-2 ring-[#6FCF97]/30 scale-102'
                        : 'border-gray-100 bg-[#FDFDFD] hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span className="text-[11px] font-bold text-[#3D405B]">{item.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mô tả */}
          <div>
            <label className="text-xs font-bold text-[#7A7D8C] block mb-1.5">Mô tả khoản chi</label>
            <input
              type="text"
              placeholder="Ăn trưa bún bò, cà phê..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#F8F9FA] border border-gray-200 rounded-2xl py-3 px-4 text-sm font-semibold text-[#3D405B] focus:outline-none focus:border-[#6FCF97] focus:bg-white transition-all"
            />
          </div>

          {/* Nguồn tiền / Ví & Ngày */}
          <div className="grid grid-cols-2 gap-3">
            <CozySelect
              label="Nguồn chi"
              value={wallet}
              onChange={(val) => setWallet(String(val))}
              options={WALLETS.map((w) => ({ value: w, label: w }))}
            />

            <div>
              <label className="text-xs font-bold text-[#7A7D8C] block mb-1.5">Ngày chi</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-[#F8F9FA] border border-gray-200 rounded-2xl py-3 px-3 text-xs font-bold text-[#3D405B] focus:outline-none focus:border-[#6FCF97]"
              />
            </div>
          </div>

          {/* Nút submit */}
          <button
            type="submit"
            disabled={isApiLoading}
            className="w-full mt-3 py-4 rounded-2xl bg-[#6FCF97] hover:bg-[#58B880] disabled:opacity-50 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-[0_8px_25px_rgba(111,207,151,0.35)] active:scale-98 transition-all"
          >
            {isApiLoading ? (
              <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
            ) : (
              <Plus size={18} />
            )}
            <span>{isApiLoading ? 'Đang lưu...' : 'Lưu khoản chi'}</span>
          </button>
        </form>

        {/* Toast thông báo vui nhộn kèm câu nhắc nhở */}
        {showSuccessToast && (
          <div className="absolute inset-0 bg-white/95 backdrop-blur-xs rounded-[32px] flex flex-col items-center justify-center p-6 text-center animate-fade-in z-20">
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 shadow-inner ${
                submittedRoast && submittedRoast.level === 'over'
                  ? 'bg-[#FFEAEA] text-[#FF7B7B]'
                  : submittedRoast && submittedRoast.level === 'warning'
                  ? 'bg-[#FFF8E7] text-[#E5A800]'
                  : 'bg-[#EBF8F1] text-[#58B880]'
              }`}
            >
              {submittedRoast && (submittedRoast.level === 'over' || submittedRoast.level === 'warning') ? (
                <span className="text-2xl select-none">{submittedRoast.emoji}</span>
              ) : (
                <Check size={32} strokeWidth={3} />
              )}
            </div>
            <h4 className="text-base font-extrabold text-[#3D405B]">
              Đã ghi nhận -{formatVND(parseInt(amountStr.replace(/\D/g, ''), 10) || 0)}
            </h4>
            <p className="text-xs font-bold text-[#3D405B] mt-2 max-w-[290px] leading-relaxed">
              {submittedRoast ? submittedRoast.message : 'Ngân sách tuần đã được cập nhật!'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
