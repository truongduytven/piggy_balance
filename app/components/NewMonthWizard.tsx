'use client';

import React, { useState, useMemo } from 'react';
import { X, Check, Lock, ArrowRight, ArrowLeft, Plus, Trash2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { FixedExpense } from '../types/finance';
import { useFinance } from '../context/FinanceContext';
import { formatVND, generateWeeksForMonth } from '../lib/financeCalculations';
import { CozySelect } from './CozySelect';

interface NewMonthWizardProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewMonthWizard: React.FC<NewMonthWizardProps> = ({ isOpen, onClose }) => {
  const { createNewMonth, isApiLoading } = useFinance();

  const currentDate = new Date();
  const currentMonthNum = currentDate.getMonth() + 1;
  const currentYearNum = currentDate.getFullYear();

  const [step, setStep] = useState<number>(1);
  const [initialMoneyStr, setInitialMoneyStr] = useState<string>('');
  const [fixedItems, setFixedItems] = useState<FixedExpense[]>([]);
  const [newFixedName, setNewFixedName] = useState<string>('');
  const [newFixedAmount, setNewFixedAmount] = useState<string>('');

  const [monthNumber, setMonthNumber] = useState<number>(currentMonthNum);
  const [year, setYear] = useState<number>(currentYearNum);
  const [customWeeklyBudget, setCustomWeeklyBudget] = useState<string>('');

  // Tính toán các tuần thực tế theo lịch của tháng
  const calculatedWeeks = useMemo(
    () => generateWeeksForMonth(year, monthNumber),
    [year, monthNumber]
  );
  const weeksCount = calculatedWeeks.length;

  if (!isOpen) return null;

  // Tính toán các thông số
  const initialMoney = parseInt(initialMoneyStr.replace(/\D/g, ''), 10) || 0;
  const totalFixed = fixedItems.reduce((acc, cur) => acc + cur.amount, 0);
  const availableBudget = Math.max(0, initialMoney - totalFixed);
  const autoSuggestedWeeklyBudget =
    weeksCount > 0 ? Math.round(availableBudget / weeksCount / 10_000) * 10_000 : 0;

  const finalWeeklyBudget = customWeeklyBudget
    ? parseInt(customWeeklyBudget.replace(/\D/g, ''), 10) || autoSuggestedWeeklyBudget
    : autoSuggestedWeeklyBudget;

  const handleAddFixedItem = () => {
    const amt = parseInt(newFixedAmount.replace(/\D/g, ''), 10);
    if (!newFixedName.trim() || isNaN(amt) || amt <= 0) return;

    setFixedItems((prev) => [
      ...prev,
      {
        id: `fx-new-${Date.now()}`,
        name: newFixedName.trim(),
        amount: amt,
        icon: '💡',
        isPaid: true,
      },
    ]);
    setNewFixedName('');
    setNewFixedAmount('');
  };

  const handleRemoveFixed = (id: string) => {
    setFixedItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleFinishLockBudget = async () => {
    if (finalWeeklyBudget <= 0) {
      alert('Vui lòng nhập ngân sách tuần hợp lệ!');
      return;
    }

    await createNewMonth({
      year,
      monthNumber,
      initialMoney,
      fixedExpenses: fixedItems,
      lockedWeeklyBudget: finalWeeklyBudget,
    });

    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#6FCF97', '#FF8FAB', '#FFD166'],
      });
    } catch { }

    setStep(7);
    setTimeout(() => {
      onClose();
      setStep(1);
      setInitialMoneyStr('');
      setFixedItems([]);
      setCustomWeeklyBudget('');
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fade-in">
      <div className="w-full max-w-[420px] bg-white rounded-[32px] p-6 shadow-2xl relative max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🌱</span>
            <h3 className="font-extrabold text-[#3D405B] text-base">Khởi tạo chu kỳ tháng</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500"
          >
            <X size={16} />
          </button>
        </div>

        {/* Tiến độ bước */}
        <div className="flex items-center gap-1.5 mb-6">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full transition-all ${step >= s ? 'bg-[#6FCF97]' : 'bg-gray-100'
                }`}
            />
          ))}
        </div>

        {/* BƯỚC 1: Thu nhập tháng */}
        {step === 1 && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <span className="text-xs font-bold text-[#6FCF97] uppercase tracking-wider">
                Bước 1 / 3
              </span>
              <h4 className="text-lg font-black text-[#3D405B] mt-1">
                Tháng này bạn có bao nhiêu tiền?
              </h4>
              <p className="text-xs text-[#7A7D8C] mt-1">
                Nhập số tiền ban đầu (lương, thưởng hoặc tổng quỹ chi tiêu trong tháng).
              </p>
            </div>

            <div>
              <label className="text-xs font-bold text-[#7A7D8C] block mb-1.5">
                Số tiền ban đầu (VND)
              </label>
              <input
                type="number"
                value={initialMoneyStr}
                onChange={(e) => setInitialMoneyStr(e.target.value)}
                placeholder="Ví dụ: 10000000"
                className="w-full bg-[#F8F9FA] border border-gray-200 rounded-2xl py-3.5 px-4 text-xl font-black text-[#3D405B] focus:outline-none focus:border-[#6FCF97]"
                autoFocus
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <CozySelect
                label="Tháng"
                value={monthNumber}
                onChange={(val) => setMonthNumber(Number(val))}
                options={Array.from({ length: 12 }, (_, i) => ({
                  value: i + 1,
                  label: `Tháng ${i + 1}`,
                }))}
              />

              <CozySelect
                label="Năm"
                value={year}
                onChange={(val) => setYear(Number(val))}
                options={[
                  { value: 2025, label: '2025' },
                  { value: 2026, label: '2026' },
                  { value: 2027, label: '2027' },
                  { value: 2028, label: '2028' },
                ]}
              />
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={initialMoney <= 0}
              className="w-full mt-4 py-3.5 bg-[#6FCF97] hover:bg-[#58B880] disabled:opacity-50 text-white font-bold text-sm rounded-2xl flex items-center justify-center gap-2 transition-all shadow-xs"
            >
              <span>Tiếp theo: Chi phí cố định</span>
              <ArrowRight size={16} />
            </button>
          </div>
        )}

        {/* BƯỚC 2: Chi phí cố định */}
        {step === 2 && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <span className="text-xs font-bold text-[#6FCF97] uppercase tracking-wider">
                Bước 2 / 3
              </span>
              <h4 className="text-lg font-black text-[#3D405B] mt-1">
                Chi phí cố định tháng này là bao nhiêu?
              </h4>
              <p className="text-xs text-[#7A7D8C] mt-1">
                Thêm các khoản chi cố định (như tiền thuê nhà, mạng, điện thoại, hóa đơn...).
              </p>
            </div>

            {/* Danh sách các khoản cố định người dùng tự thêm */}
            {fixedItems.length > 0 ? (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {fixedItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-gray-100 bg-[#FDFDFD]"
                  >
                    <div className="flex items-center gap-2">
                      <span>{item.icon || '💡'}</span>
                      <span className="text-xs font-bold text-[#3D405B]">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-[#FF7B7B]">
                        {formatVND(item.amount)}
                      </span>
                      <button
                        onClick={() => handleRemoveFixed(item.id)}
                        className="text-gray-400 hover:text-[#FF7B7B] p-1"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-gray-50 text-center text-xs text-[#7A7D8C]">
                Chưa có khoản cố định nào. Bạn hãy tự nhập các khoản bên dưới nhé!
              </div>
            )}

            {/* Thêm khoản cố định mới */}
            <div className="p-3 rounded-2xl bg-[#F8F9FA] border border-gray-200/80 space-y-2">
              <span className="text-[11px] font-bold text-[#7A7D8C] block">
                + Tự thêm khoản cố định
              </span>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  placeholder="Tên (vd: Tiền nhà)"
                  value={newFixedName}
                  onChange={(e) => setNewFixedName(e.target.value)}
                  className="flex-1 bg-white border border-gray-200 rounded-xl px-2.5 py-2 text-xs font-semibold"
                />
                <input
                  type="number"
                  placeholder="Số tiền"
                  value={newFixedAmount}
                  onChange={(e) => setNewFixedAmount(e.target.value)}
                  className="w-full sm:w-28 bg-white border border-gray-200 rounded-xl px-2.5 py-2 text-xs font-semibold"
                />
                <button
                  type="button"
                  onClick={handleAddFixedItem}
                  className="px-4 py-2 bg-[#6FCF97] text-white rounded-xl text-xs font-bold hover:bg-[#58B880]"
                >
                  Thêm
                </button>
              </div>
            </div>

            <div className="p-3 bg-[#FFF8E7] rounded-2xl flex items-center justify-between">
              <span className="text-xs font-bold text-[#E5A800]">Tổng cố định:</span>
              <span className="text-sm font-black text-[#3D405B]">{formatVND(totalFixed)}</span>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setStep(1)}
                className="py-3.5 px-4 bg-gray-100 text-[#7A7D8C] font-bold text-xs rounded-2xl"
              >
                <ArrowLeft size={16} />
              </button>
              <button
                onClick={() => setStep(3)}
                className="flex-1 py-3.5 bg-[#6FCF97] hover:bg-[#58B880] text-white font-bold text-sm rounded-2xl flex items-center justify-center gap-2 shadow-xs"
              >
                <span>Tiếp theo: Tính ngân sách tuần</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* BƯỚC 3: Đề xuất & Chốt ngân sách tuần */}
        {step === 3 && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <span className="text-xs font-bold text-[#6FCF97] uppercase tracking-wider">
                Bước 3 / 3
              </span>
              <h4 className="text-lg font-black text-[#3D405B] mt-1">Chốt ngân sách tuần 🔒</h4>
              <p className="text-xs text-[#7A7D8C] mt-1">
                Ngân sách này sau khi chốt sẽ được khóa cố định độc lập cho từng tuần.
              </p>
            </div>

            {/* Công thức tính toán */}
            <div className="p-4 bg-[#F8F9FA] rounded-2xl space-y-2 border border-gray-100 text-xs">
              <div className="flex justify-between text-[#7A7D8C]">
                <span>Tiền ban đầu:</span>
                <strong className="text-[#3D405B]">{formatVND(initialMoney)}</strong>
              </div>
              <div className="flex justify-between text-[#7A7D8C]">
                <span>Chi phí cố định:</span>
                <strong className="text-[#FF7B7B]">-{formatVND(totalFixed)}</strong>
              </div>
              <div className="flex justify-between border-t border-gray-200 pt-2 font-bold text-[#3D405B]">
                <span>Khả dụng cho các tuần:</span>
                <strong className="text-[#58B880]">{formatVND(availableBudget)}</strong>
              </div>
            </div>

            {/* Thẻ ngân sách chốt - Có thể tùy chỉnh nếu muốn */}
            <div className="p-5 rounded-2xl bg-[#EBF8F1] border border-[#6FCF97]/30 text-center">
              <span className="text-xs font-bold text-[#58B880] block mb-1">
                Ngân sách tuần đề xuất ({weeksCount} tuần theo lịch thực tế)
              </span>
              <div className="text-3xl font-black text-[#3D405B]">
                {formatVND(finalWeeklyBudget)}
                <span className="text-xs font-semibold text-[#7A7D8C]"> / tuần 🌱</span>
              </div>

              {/* Danh sách các tuần thực tế theo lịch */}
              <div className="mt-3 pt-3 border-t border-[#6FCF97]/20 flex flex-wrap justify-center gap-1.5 text-[11px]">
                {calculatedWeeks.map((w) => (
                  <span
                    key={w.index}
                    className={`px-2.5 py-1 rounded-xl font-bold flex items-center gap-1 transition-all ${
                      w.isCurrent
                        ? 'bg-[#6FCF97] text-white shadow-xs'
                        : 'bg-white text-[#3D405B] border border-gray-200'
                    }`}
                  >
                    <span>{w.name}:</span>
                    <span className="font-medium opacity-90">{w.startDate} - {w.endDate}</span>
                    {w.isCurrent && <span className="text-[10px]">✨</span>}
                  </span>
                ))}
              </div>

              {/* Tùy chỉnh ngân sách nếu muốn */}
              <div className="mt-3.5 text-left">
                <label className="text-[11px] font-bold text-[#7A7D8C] block mb-1">
                  Hoặc tự chỉnh ngân sách tuần (nếu muốn):
                </label>
                <input
                  type="number"
                  placeholder={autoSuggestedWeeklyBudget.toString()}
                  value={customWeeklyBudget}
                  onChange={(e) => setCustomWeeklyBudget(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-[#3D405B] focus:outline-none focus:border-[#6FCF97]"
                />
              </div>

              {/* Bảng phân bổ & Khoản tích lũy dôi dư */}
              <div className="mt-3 pt-3 border-t border-[#6FCF97]/20 text-xs space-y-1.5 text-left">
                <div className="flex justify-between text-[#7A7D8C]">
                  <span>Tổng ngân sách {weeksCount} tuần:</span>
                  <strong className="text-[#3D405B]">{formatVND(finalWeeklyBudget * weeksCount)}</strong>
                </div>
                {availableBudget - finalWeeklyBudget * weeksCount > 0 ? (
                  <div className="flex justify-between items-center bg-white/80 px-2.5 py-1.5 rounded-xl border border-[#6FCF97]/30 text-[#2E7D32] font-bold">
                    <span className="flex items-center gap-1">
                      <span>🏦</span>
                      <span>Quỹ tích lũy / Dôi dư:</span>
                    </span>
                    <strong className="text-sm text-[#58B880]">
                      {formatVND(availableBudget - finalWeeklyBudget * weeksCount)}
                    </strong>
                  </div>
                ) : availableBudget - finalWeeklyBudget * weeksCount < 0 ? (
                  <div className="text-[11px] text-[#FF7B7B] font-semibold">
                    ⚠️ Ngân sách các tuần đang vượt quá số tiền khả dụng ({formatVND(finalWeeklyBudget * weeksCount - availableBudget)})
                  </div>
                ) : (
                  <div className="text-[11px] text-[#7A7D8C] italic">
                    Phân bổ trọn vẹn 100% số tiền khả dụng cho {weeksCount} tuần.
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setStep(2)}
                className="py-3.5 px-4 bg-gray-100 text-[#7A7D8C] font-bold text-xs rounded-2xl"
              >
                <ArrowLeft size={16} />
              </button>
              <button
                onClick={handleFinishLockBudget}
                disabled={isApiLoading}
                className="flex-1 py-4 bg-[#6FCF97] hover:bg-[#58B880] disabled:opacity-50 text-white font-extrabold text-sm rounded-2xl flex items-center justify-center gap-2 shadow-[0_8px_25px_rgba(111,207,151,0.35)] active:scale-98 transition-all"
              >
                {isApiLoading ? (
                  <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                ) : (
                  <Lock size={16} />
                )}
                <span>{isApiLoading ? 'Đang lưu...' : 'Chốt ngân sách'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Thành công */}
        {step === 7 && (
          <div className="py-10 text-center animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-[#EBF8F1] flex items-center justify-center text-[#58B880] mx-auto mb-3 shadow-inner">
              <Check size={32} strokeWidth={3} />
            </div>
            <h4 className="text-lg font-extrabold text-[#3D405B]">
              Ngân sách tuần đã được chốt!
            </h4>
            <p className="text-sm font-bold text-[#6FCF97] mt-1">
              {formatVND(finalWeeklyBudget)} / tuần
            </p>
            <p className="text-xs text-[#7A7D8C] mt-2">Đã lưu vào cơ sở dữ liệu thành công!</p>
          </div>
        )}
      </div>
    </div>
  );
};
