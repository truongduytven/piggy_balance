'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Plus, Trash2, ShieldCheck, PlusCircle } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatVND } from '../lib/financeCalculations';

interface SettingsViewProps {
  onOpenNewMonthWizard: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onOpenNewMonthWizard }) => {
  const { activeMonth, addFixedExpense, deleteFixedExpense } = useFinance();

  const [newFixedName, setNewFixedName] = useState('');
  const [newFixedAmount, setNewFixedAmount] = useState('');

  const handleAddFixed = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseInt(newFixedAmount.replace(/\D/g, ''), 10);
    if (!newFixedName.trim() || isNaN(amt) || amt <= 0) return;

    await addFixedExpense(newFixedName.trim(), amt);
    setNewFixedName('');
    setNewFixedAmount('');
  };

  return (
    <div className="space-y-4 pb-28 px-4 pt-2 animate-fade-in">
      <div className="px-1">
        <h2 className="text-xl font-black text-[#3D405B]">Cài đặt & Tài chính</h2>
        <p className="text-xs font-semibold text-[#7A7D8C] mt-0.5">
          Tự do tùy chỉnh kế hoạch tài chính cá nhân
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
                className="px-3.5 bg-[#6FCF97] hover:bg-[#58B880] text-white rounded-xl text-xs font-bold"
              >
                Thêm
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
