'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Calendar, Sparkles, LogOut, Sun, Moon, Palette, X } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { useTheme } from '../context/ThemeContext';
import { ThemeModal } from './ThemeModal';

export const Header: React.FC = () => {
  const { activeMonth } = useFinance();
  const { mode } = useTheme();

  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const handleLogout = () => {
    try {
      localStorage.removeItem('cozy_money_auth_session_v1');
      window.location.reload();
    } catch {}
  };

  return (
    <>
      <header className="px-5 pt-4 pb-3 flex items-center justify-between sticky top-0 bg-[#FFFDF8]/90 backdrop-blur-md z-40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white border border-[#FFEBF0] p-1 shadow-sm flex items-center justify-center relative overflow-hidden">
            <Image
              src="/images/piggy.jpg"
              alt="Cozy Money"
              width={34}
              height={34}
              className="rounded-xl object-cover"
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-extrabold text-[#3D405B] text-base leading-none">Cozy Money</h1>
              <span className="inline-block w-2 h-2 rounded-full bg-[#6FCF97]" />
            </div>
            <p className="text-[11px] text-[#7A7D8C] mt-0.5">Quản lý chi tiêu thật nhẹ nhàng</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Tag tháng */}
          {activeMonth && (
            <div className="hidden xs:flex items-center gap-1 bg-white border border-[#6FCF97]/20 px-2.5 py-1 rounded-full text-[11px] font-bold text-[#3D405B] shadow-xs">
              <Calendar size={12} className="text-[#6FCF97]" />
              <span>{activeMonth.name}</span>
            </div>
          )}

          {/* Nút chọn Giao diện (Theme & Dark/Light Mode) thay thế cho icon thông báo */}
          <button
            onClick={() => setShowThemeModal(true)}
            className="w-9 h-9 rounded-full bg-white border border-[#3D405B]/10 flex items-center justify-center text-[#3D405B] shadow-xs hover:bg-[#F9F9FB] active:scale-95 transition-all relative"
            aria-label="Chọn giao diện và chế độ sáng tối"
            title="Đổi giao diện (Theme & Mode)"
          >
            {mode === 'dark' ? (
              <Moon size={17} className="text-[#9C88FF]" />
            ) : (
              <Sun size={17} className="text-[#FFA502]" />
            )}
            {/* Chấm màu báo hiệu theme */}
            <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#6FCF97] border-2 border-white flex items-center justify-center">
              <Sparkles size={7} className="text-white" />
            </span>
          </button>

          {/* Avatar người dùng */}
          <button
            onClick={() => setShowProfileModal(true)}
            className="w-9 h-9 rounded-full overflow-hidden border-2 border-white shadow-sm ring-2 ring-[#6FCF97]/30 hover:ring-[#6FCF97] transition-all relative"
            aria-label="Tài khoản"
          >
            <Image
              src="/images/avatar.jpg"
              alt="User Avatar"
              fill
              className="object-cover"
            />
          </button>
        </div>
      </header>

      {/* Modal tùy chọn Theme và Dark/Light Mode */}
      <ThemeModal
        isOpen={showThemeModal}
        onClose={() => setShowThemeModal(false)}
      />

      {/* Modal Tài khoản */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-xs bg-white rounded-3xl p-5 shadow-2xl border border-[#FFEBF0]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full overflow-hidden relative">
                  <Image src="/images/avatar.jpg" alt="Avatar" fill className="object-cover" />
                </div>
                <div>
                  <h3 className="font-bold text-[#3D405B] text-sm">Chủ sổ tay</h3>
                  <p className="text-[11px] text-[#7A7D8C]">cozymoney.app</p>
                </div>
              </div>
              <button
                onClick={() => setShowProfileModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500"
              >
                <X size={16} />
              </button>
            </div>

            <div className="border-t border-gray-100 pt-3">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[#FFEAEA] hover:bg-[#FFD6D6] text-[#FF7B7B] text-xs font-semibold transition-colors"
              >
                <span className="flex items-center gap-2">
                  <LogOut size={14} />
                  <span>Khóa sổ tay (Đăng xuất)</span>
                </span>
                <span className="text-[10px] font-bold">Khóa</span>
              </button>
            </div>

            <button
              onClick={() => setShowProfileModal(false)}
              className="w-full mt-3 py-2.5 bg-gray-100 text-[#3D405B] font-bold text-xs rounded-xl hover:bg-gray-200 transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </>
  );
};
