'use client';

import React from 'react';
import { Home, Calendar, Sparkles, User } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';

interface BottomNavProps {
  currentTab: 'home' | 'month' | 'ai' | 'settings';
  onTabChange: (tab: 'home' | 'month' | 'ai' | 'settings') => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onTabChange }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-[500px] mx-auto bg-white/95 backdrop-blur-md border-t border-[#3D405B]/5 px-6 py-2.5 flex items-center justify-between z-40 shadow-[0_-4px_20px_rgba(61,64,91,0.04)]">
      {/* Trang chủ */}
      <button
        onClick={() => onTabChange('home')}
        className={`flex flex-col items-center gap-1 transition-all ${currentTab === 'home'
            ? 'text-[#6FCF97] font-bold scale-105'
            : 'text-[#7A7D8C] hover:text-[#3D405B]'
          }`}
      >
        <div
          className={`w-11 h-7 rounded-full flex items-center justify-center transition-colors ${currentTab === 'home' ? 'bg-[#EBF8F1]' : ''
            }`}
        >
          <Home size={20} strokeWidth={currentTab === 'home' ? 2.5 : 2} />
        </div>
        <span className="text-[11px]">Trang chủ</span>
      </button>

      {/* Tháng này */}
      <button
        onClick={() => onTabChange('month')}
        className={`flex flex-col items-center gap-1 transition-all ${currentTab === 'month'
            ? 'text-[#6FCF97] font-bold scale-105'
            : 'text-[#7A7D8C] hover:text-[#3D405B]'
          }`}
      >
        <div
          className={`w-11 h-7 rounded-full flex items-center justify-center transition-colors ${currentTab === 'month' ? 'bg-[#EBF8F1]' : ''
            }`}
        >
          <Calendar size={20} strokeWidth={currentTab === 'month' ? 2.5 : 2} />
        </div>
        <span className="text-[11px]">Tháng này</span>
      </button>

      {/* Piggy AI Assistant */}
      <button
        onClick={() => onTabChange('ai')}
        className={`flex flex-col items-center gap-1 transition-all ${currentTab === 'ai'
            ? 'text-[#FB6F92] font-bold scale-105'
            : 'text-[#7A7D8C] hover:text-[#3D405B]'
          }`}
      >
        <div
          className={`w-11 h-7 rounded-full flex items-center justify-center transition-colors ${currentTab === 'ai' ? 'bg-[#FFF0F4]' : ''
            }`}
        >
          <Sparkles size={20} strokeWidth={currentTab === 'ai' ? 2.5 : 2} />
        </div>
        <span className="text-[11px]">Cozy AI</span>
      </button>

      {/* Tài khoản */}
      <button
        onClick={() => onTabChange('settings')}
        className={`flex flex-col items-center gap-1 transition-all ${currentTab === 'settings'
            ? 'text-[#6FCF97] font-bold scale-105'
            : 'text-[#7A7D8C] hover:text-[#3D405B]'
          }`}
      >
        <div
          className={`w-11 h-7 rounded-full flex items-center justify-center transition-colors ${currentTab === 'settings' ? 'bg-[#EBF8F1]' : ''
            }`}
        >
          <User size={20} strokeWidth={currentTab === 'settings' ? 2.5 : 2} />
        </div>
        <span className="text-[11px]">Tài khoản</span>
      </button>
    </nav>
  );
};
