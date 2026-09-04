'use client';

import React from 'react';
import { useFinance } from '../context/FinanceContext';

export const GlobalLoading: React.FC = () => {
  const { isApiLoading, apiLoadingText } = useFinance();

  if (!isApiLoading) return null;

  return (
    <div className="fixed inset-x-0 top-0 z-[99999] pointer-events-none transition-all duration-300">
      {/* 1. Top glowing animated gradient bar */}
      <div className="relative h-[3.5px] w-full bg-[#EBF8F1] dark:bg-[#1A222D] overflow-hidden shadow-[0_1px_8px_rgba(111,207,151,0.5)]">
        <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-[#6FCF97] via-[#FFD166] to-[#FF8FAB] animate-loading-progress" />
      </div>

      {/* 2. Floating cozy status badge */}
      <div className="flex justify-center mt-3">
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/95 dark:!bg-[#1E202C]/95 backdrop-blur-md shadow-lg border border-[#6FCF97]/40 dark:!border-white/10 text-xs font-extrabold text-[#3D405B] dark:!text-white animate-fade-in">
          <div className="w-3.5 h-3.5 rounded-full border-2 border-[#6FCF97] border-t-transparent animate-spin" />
          <span className="tracking-tight">{apiLoadingText || 'Đang xử lý...'}</span>
          <span className="text-[10px]">🌱</span>
        </div>
      </div>
    </div>
  );
};
