'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { Plus, Trash2, ShieldCheck, PiggyBank, Coins, ArrowRight } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatVND } from '../lib/financeCalculations';
import { AccumulatedSavingsHistory } from './AccumulatedSavingsHistory';

interface SettingsViewProps {
  onOpenNewMonthWizard: () => void;
  onNavigateToMonth?: (monthId: string) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  onOpenNewMonthWizard,
  onNavigateToMonth,
}) => {
  const {
    activeMonth,
    activeMonthSummary,
    allMonthsSummaries,
    addFixedExpense,
    deleteFixedExpense,
    isApiLoading,
  } = useFinance();

  const [newFixedName, setNewFixedName] = useState('');
  const [newFixedAmount, setNewFixedAmount] = useState('');
  const [showAccumulatedHistory, setShowAccumulatedHistory] = useState(false);

  // Lọc danh sách các tháng trước (không bao gồm tháng active hiện tại)
  const pastMonthsSummaries = useMemo(() => {
    if (!activeMonth) return [];
    return allMonthsSummaries
      .filter((s) => {
        if (s.month.id === activeMonth.id) return false;
        // So sánh theo năm và tháng để xác định tháng quá khứ
        if (s.month.year < activeMonth.year) return true;
        if (s.month.year === activeMonth.year && s.month.monthNumber < activeMonth.monthNumber) return true;
        return s.month.status === 'COMPLETED' || s.month.status === 'ARCHIVED';
      })
      .sort((a, b) => {
        if (a.month.year !== b.month.year) return b.month.year - a.month.year;
        return b.month.monthNumber - a.month.monthNumber;
      });
  }, [allMonthsSummaries, activeMonth]);

  // Tổng số tiền dư tích lũy từ các tháng trước (chỉ tính tháng trước, không cộng tháng hiện tại)
  const totalAccumulatedSavings = useMemo(() => {
    return pastMonthsSummaries.reduce((sum, s) => sum + Math.max(0, s.remainingMonth), 0);
  }, [pastMonthsSummaries]);

  const handleAddFixed = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseInt(newFixedAmount.replace(/\D/g, ''), 10);
    if (!newFixedName.trim() || isNaN(amt) || amt <= 0) return;

    await addFixedExpense(newFixedName.trim(), amt);
    setNewFixedName('');
    setNewFixedAmount('');
  };

  // Nếu người dùng đang mở xem màn hình chi tiết lịch sử tích lũy
  if (showAccumulatedHistory) {
    return (
      <AccumulatedSavingsHistory
        pastMonthsSummaries={pastMonthsSummaries}
        totalAccumulatedSavings={totalAccumulatedSavings}
        currentActiveMonthName={activeMonth?.name}
        onBack={() => setShowAccumulatedHistory(false)}
        onSelectMonth={onNavigateToMonth}
      />
    );
  }

  return (
    <div className="space-y-4 pb-28 px-4 pt-2 animate-fade-in">
      <div className="px-1">
        <h2 className="text-xl font-black text-[#3D405B]">Tài khoản & Cài đặt</h2>
        <p className="text-xs font-semibold text-[#7A7D8C] mt-0.5">
          Theo dõi tổng số dư tài chính & quản lý chu kỳ sổ tay
        </p>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-[28px] p-5 cozy-card-shadow border border-[#3D405B]/5 flex items-center gap-4">
        <div className="w-14 h-14 rounded-full overflow-hidden relative ring-4 ring-[#6FCF97]/20">
          <Image src="/images/avatar.jpg" alt="Avatar" fill className="object-cover" />
        </div>
        <div>
          <h3 className="font-extrabold text-[#3D405B] text-base">Chủ sổ tay</h3>
          <p className="text-xs text-[#7A7D8C]">cozymoney.app</p>
          <span className="inline-block mt-1 text-[10px] font-bold text-[#58B880] bg-[#EBF8F1] px-2 py-0.5 rounded-full">
            Dữ liệu cá nhân riêng tư 🌱
          </span>
        </div>
      </div>

      {/* THẺ 1: Tổng số tiền hiện còn của tháng hiện tại */}
      {activeMonthSummary && (
        <div className="bg-white rounded-[28px] p-5.5 cozy-card-shadow border border-[#6FCF97]/20 relative overflow-hidden transition-all">
          <div className="absolute top-0 right-0 w-40 h-40 bg-[#EBF8F1] rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none opacity-60" />

          {/* Header thẻ */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#EBF8F1] flex items-center justify-center text-[#58B880] border border-[#6FCF97]/20 shadow-2xs">
                <PiggyBank size={17} />
              </div>
              <div>
                <span className="text-[10px] font-bold text-[#7A7D8C] uppercase tracking-wider block">
                  Tổng quỹ tháng
                </span>
                <span className="text-xs font-black text-[#3D405B]">
                  {activeMonthSummary.month.name}
                </span>
              </div>
            </div>
            <span className="text-[10px] font-bold text-[#58B880] bg-[#EBF8F1] px-2.5 py-0.5 rounded-full border border-[#6FCF97]/25 shadow-2xs">
              Đang hoạt động
            </span>
          </div>

          {/* Con số tổng tiền hiện còn */}
          <div className="my-2">
            <span className="text-xs font-bold text-[#7A7D8C] block mb-1">
              Tổng số tiền hiện còn (Tháng này)
            </span>
            <div className="text-3xl xs:text-4xl font-black tracking-tight text-[#3D405B] leading-none">
              {formatVND(activeMonthSummary.remainingMonth)}
            </div>
            <p className="text-[11px] font-semibold text-[#7A7D8C] mt-2 flex items-center gap-1.5 flex-wrap">
              <span>Đã chi: <strong className="text-[#FF7B7B]">-{formatVND(activeMonthSummary.totalSpent)}</strong></span>
              <span className="text-[#A7A9B4]">•</span>
              <span className="text-[#58B880]">Tự động trừ khi sài tiếp 🌱</span>
            </p>
          </div>

          {/* 2 thẻ phân rã nguồn tiền: Quỹ dôi dư tích lũy & Ngân sách các tuần */}
          <div className="grid grid-cols-2 gap-2.5 mt-3 pt-3 border-t border-gray-100 text-xs">
            <div className="bg-[#F8F9FA] p-3 rounded-2xl border border-gray-100">
              <span className="text-[10px] font-bold text-[#7A7D8C] block">
                🏦 Quỹ dôi dư / Tích lũy
              </span>
              <strong className="text-sm font-black text-[#3D405B] block mt-0.5">
                {formatVND(activeMonthSummary.unallocatedSavings)}
              </strong>
              <span className="text-[10px] text-[#A7A9B4] block mt-0.5">
                Ngoài ngân sách các tuần
              </span>
            </div>

            <div className="bg-[#F8F9FA] p-3 rounded-2xl border border-gray-100">
              <span className="text-[10px] font-bold text-[#7A7D8C] block">
                📅 Ngân sách các tuần
              </span>
              <strong className="text-sm font-black text-[#58B880] block mt-0.5">
                {formatVND(activeMonthSummary.totalWeeksRemaining)}
              </strong>
              <span className="text-[10px] text-[#A7A9B4] block mt-0.5">
                Còn lại để chi tiêu
              </span>
            </div>
          </div>

          {/* 3 thông số tài chính mini */}
          <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-gray-100 text-center">
            <div className="p-2 rounded-xl bg-[#F8F9FA]">
              <span className="text-[10px] font-semibold text-[#A7A9B4] block">Thu nhập</span>
              <span className="text-xs font-bold text-[#3D405B] mt-0.5 block">
                {formatVND(activeMonthSummary.initialMoney)}
              </span>
            </div>

            <div className="p-2 rounded-xl bg-[#FFF8E7]">
              <span className="text-[10px] font-semibold text-[#E5A800] block">Cố định</span>
              <span className="text-xs font-bold text-[#FF7B7B] mt-0.5 block">
                -{formatVND(activeMonthSummary.totalFixed)}
              </span>
            </div>

            <div className="p-2 rounded-xl bg-[#F4F0FC]">
              <span className="text-[10px] font-semibold text-[#9C88FF] block">Hạn mức/tuần</span>
              <span className="text-xs font-bold text-[#3D405B] mt-0.5 block">
                {formatVND(activeMonthSummary.month.lockedWeeklyBudget)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* THẺ 2: Quỹ tích lũy các tháng trước (Tự động cộng dồn số dư từ các tháng cũ) */}
      <div className="bg-white rounded-[28px] p-5.5 cozy-card-shadow border border-[#6FCF97]/20 relative overflow-hidden transition-all">
        <div className="absolute top-0 right-0 w-40 h-40 bg-[#EBF8F1] rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none opacity-60" />

        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#EBF8F1] flex items-center justify-center text-[#58B880] border border-[#6FCF97]/20 shadow-2xs">
              <PiggyBank size={17} />
            </div>
            <div>
              <span className="text-[10px] font-bold text-[#7A7D8C] uppercase tracking-wider block">
                Heo đất tích lũy
              </span>
              <h3 className="font-extrabold text-[#3D405B] text-xs">
                Quỹ tích lũy các tháng trước
              </h3>
            </div>
          </div>
          <span className="text-[10px] font-bold text-[#58B880] bg-[#EBF8F1] px-2.5 py-0.5 rounded-full border border-[#6FCF97]/25 shadow-2xs">
            {pastMonthsSummaries.length} tháng chốt
          </span>
        </div>

        <div className="my-2">
          <div className="text-3xl xs:text-[38px] font-black tracking-tight text-[#3D405B] leading-none">
            {formatVND(totalAccumulatedSavings)}
          </div>
          <p className="text-[11px] font-semibold text-[#7A7D8C] mt-2 flex items-center gap-1">
            <span>Tiền dư chốt sổ từ các tháng trước</span>
            <span>•</span>
            <span className="text-[#58B880]">Không tính tháng {activeMonth?.monthNumber} hiện tại 🌱</span>
          </p>
        </div>

        {/* Nút bấm xem lịch sử tích lũy chi tiết */}
        <button
          onClick={() => setShowAccumulatedHistory(true)}
          className="w-full mt-3 py-3 px-4 rounded-2xl bg-[#EBF8F1] hover:bg-[#DDF4E8] text-[#58B880] font-bold text-xs flex items-center justify-center gap-2 border border-[#6FCF97]/25 active:scale-98 transition-all"
        >
          <span>Xem lịch sử tích lũy chi tiết ({pastMonthsSummaries.length} tháng)</span>
          <ArrowRight size={14} />
        </button>
      </div>

      {/* Quản lý chu kỳ tháng */}
      <div className="bg-white rounded-[28px] p-5 cozy-card-shadow border border-[#3D405B]/5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-[#3D405B] text-sm">Chu kỳ tháng</h3>
          {activeMonth && (
            <span className="text-[11px] font-bold text-[#6FCF97] bg-[#EBF8F1] px-2.5 py-0.5 rounded-full">
              {activeMonth.name}
            </span>
          )}
        </div>

        <button
          onClick={onOpenNewMonthWizard}
          className="w-full py-3.5 bg-[#6FCF97] hover:bg-[#58B880] text-white font-extrabold text-xs rounded-2xl flex items-center justify-center gap-2 shadow-xs transition-all"
        >
          <Plus size={16} />
          <span>Bắt đầu chu kỳ tháng mới</span>
        </button>
      </div>

      {/* Chi phí cố định của tháng hiện tại - Cho phép tự thêm & xóa */}
      {activeMonth && (
        <div className="bg-white rounded-[28px] p-5 cozy-card-shadow border border-[#3D405B]/5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-[#3D405B] text-sm">Chi phí cố định tháng này</h3>
            <span className="text-xs font-bold text-[#FF7B7B]">
              -{formatVND(activeMonth.fixedExpenses.reduce((s, f) => s + f.amount, 0))}
            </span>
          </div>

          {/* Danh sách */}
          {activeMonth.fixedExpenses.length > 0 ? (
            <div className="space-y-2">
              {activeMonth.fixedExpenses.map((fx) => (
                <div
                  key={fx.id}
                  className="p-3 rounded-2xl border border-gray-100 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg">{fx.icon || '💡'}</span>
                    <span className="text-xs font-bold text-[#3D405B]">{fx.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-[#3D405B]">{formatVND(fx.amount)}</span>
                    <button
                      onClick={() => deleteFixedExpense(fx.id)}
                      className="text-gray-400 hover:text-[#FF7B7B] p-1"
                      title="Xóa khoản cố định"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[#7A7D8C] text-center py-2">
              Bạn chưa có khoản cố định nào trong tháng này.
            </p>
          )}

          {/* Form tự thêm khoản cố định */}
          <form onSubmit={handleAddFixed} className="pt-2 border-t border-gray-100 space-y-2">
            <span className="text-[11px] font-bold text-[#7A7D8C] block">
              Thêm khoản chi phí cố định mới
            </span>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Tên khoản (vd: Tiền mạng)"
                value={newFixedName}
                onChange={(e) => setNewFixedName(e.target.value)}
                className="flex-1 bg-[#F8F9FA] border border-gray-200 rounded-xl px-2.5 py-2 text-xs font-semibold"
                required
              />
              <input
                type="number"
                placeholder="Số tiền"
                value={newFixedAmount}
                onChange={(e) => setNewFixedAmount(e.target.value)}
                className="w-28 bg-[#F8F9FA] border border-gray-200 rounded-xl px-2.5 py-2 text-xs font-semibold"
                required
              />
              <button
                type="submit"
                disabled={isApiLoading}
                className="px-3.5 bg-[#6FCF97] hover:bg-[#58B880] disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 min-w-[58px]"
              >
                {isApiLoading ? (
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                ) : (
                  <span>Thêm</span>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Thông điệp bảo mật */}
      <div className="p-4 rounded-2xl bg-[#FFFDF8] border border-dashed border-[#6FCF97]/40 text-center">
        <div className="inline-flex items-center gap-1 text-xs font-bold text-[#58B880] mb-1">
          <ShieldCheck size={14} />
          <span>Dữ liệu lưu trữ riêng tư</span>
        </div>
        <p className="text-[11px] text-[#7A7D8C] leading-relaxed">
          Tất cả các số tiền và thông tin chi tiêu do chính bạn tự nhập và lưu trữ an toàn trong cơ sở dữ liệu.
        </p>
      </div>
    </div>
  );
};
