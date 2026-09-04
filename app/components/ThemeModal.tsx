'use client';

import React from 'react';
import { X, Sun, Moon, Palette, Check, Sparkles } from 'lucide-react';
import { useTheme, COLOR_THEMES, ColorTheme, ThemeMode } from '../context/ThemeContext';

interface ThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ThemeModal: React.FC<ThemeModalProps> = ({ isOpen, onClose }) => {
  const { mode, colorTheme, setMode, setColorTheme } = useTheme();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-sm bg-white dark:bg-[#1E202C] text-[#3D405B] dark:text-[#F3F4F8] rounded-[32px] p-6 shadow-2xl border border-gray-100 dark:border-gray-800 animate-slide-up relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#EBF8F1] dark:bg-[#2A2E3D] flex items-center justify-center text-[#58B880]">
              <Palette size={18} />
            </div>
            <h3 className="font-extrabold text-base">Giao diện & Chủ đề</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 dark:bg-[#2A2E3D] flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-200 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* 1. Chọn chế độ Sáng / Tối (Light / Dark Mode) */}
        <div className="mb-5">
          <label className="text-xs font-bold text-[#7A7D8C] dark:text-[#9DA1B4] block mb-2">
            Chế độ hiển thị (Mode)
          </label>
          <div className="grid grid-cols-2 gap-2 p-1.5 bg-[#F8F9FA] dark:bg-[#13141B] rounded-2xl border border-gray-200/60 dark:border-gray-800">
            <button
              type="button"
              onClick={() => setMode('light')}
              className={`py-3 px-3 rounded-xl flex items-center justify-center gap-2 text-xs font-extrabold transition-all ${
                mode === 'light'
                  ? 'bg-white text-[#3D405B] shadow-sm scale-102 ring-1 ring-gray-200'
                  : 'text-[#7A7D8C] dark:text-[#9DA1B4] hover:text-[#3D405B] dark:hover:text-white'
              }`}
            >
              <Sun size={16} className="text-[#FFA502]" />
              <span>Giao diện sáng</span>
            </button>

            <button
              type="button"
              onClick={() => setMode('dark')}
              className={`py-3 px-3 rounded-xl flex items-center justify-center gap-2 text-xs font-extrabold transition-all ${
                mode === 'dark'
                  ? 'bg-[#2A2E3D] text-white shadow-sm scale-102 ring-1 ring-gray-700'
                  : 'text-[#7A7D8C] dark:text-[#9DA1B4] hover:text-[#3D405B] dark:hover:text-white'
              }`}
            >
              <Moon size={16} className="text-[#9C88FF]" />
              <span>Giao diện tối</span>
            </button>
          </div>
        </div>

        {/* 2. Chọn Tông màu chủ đạo (Color Themes) */}
        <div>
          <label className="text-xs font-bold text-[#7A7D8C] dark:text-[#9DA1B4] block mb-2">
            Tông màu chủ đạo (Theme)
          </label>
          <div className="space-y-2">
            {COLOR_THEMES.map((theme) => {
              const isSelected = colorTheme === theme.id;

              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => setColorTheme(theme.id)}
                  style={
                    isSelected
                      ? {
                          borderColor: theme.primary,
                          boxShadow: `0 0 0 2px ${theme.primary}40`,
                        }
                      : undefined
                  }
                  className={`w-full p-3.5 rounded-2xl border flex items-center justify-between transition-all ${
                    isSelected
                      ? 'bg-black/5 dark:!bg-[#262A3B]'
                      : 'border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-[#252836]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-xs shadow-xs"
                      style={{ backgroundColor: theme.primary, color: '#fff' }}
                    >
                      <span>{theme.icon}</span>
                    </div>
                    <span
                      className={`text-xs font-black ${
                        isSelected
                          ? 'text-[#3D405B] dark:!text-white'
                          : 'text-[#7A7D8C] dark:text-[#9DA1B4]'
                      }`}
                    >
                      {theme.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className="w-4 h-4 rounded-full border border-black/10"
                      style={{ backgroundColor: theme.primary }}
                    />
                    {isSelected && (
                      <div
                        className="w-5 h-5 rounded-full text-white flex items-center justify-center shadow-xs"
                        style={{ backgroundColor: theme.primary }}
                      >
                        <Check size={12} strokeWidth={3} />
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Nút đóng */}
        <button
          onClick={onClose}
          className="w-full mt-6 py-3.5 bg-[#6FCF97] hover:bg-[#58B880] text-white font-extrabold text-xs rounded-2xl shadow-xs transition-all"
        >
          Áp dụng & Đóng
        </button>
      </div>
    </div>
  );
};
