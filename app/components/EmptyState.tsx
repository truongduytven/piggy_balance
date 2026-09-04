'use client';

import React from 'react';
import Image from 'next/image';
import { Plus } from 'lucide-react';

interface EmptyStateProps {
  type: 'no-months' | 'no-expenses' | 'no-fixed';
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ type, onAction }) => {
  if (type === 'no-months') {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center p-6 text-center animate-fade-in">
        <div className="w-24 h-24 rounded-full bg-[#FFF0F4] flex items-center justify-center mb-5 p-2 ring-4 ring-[#FF8FAB]/20 animate-float-slow">
          <Image
            src="/images/piggy.jpg"
            alt="Piggy Mascot"
            width={72}
            height={72}
            className="rounded-full object-cover"
          />
        </div>

        <h3 className="text-xl font-extrabold text-[#3D405B] mb-1.5">
          Chưa có tháng nào cả 🌱
        </h3>

        <p className="text-sm text-[#7A7D8C] max-w-xs leading-relaxed mb-6">
          Bắt đầu quản lý tiền tháng này nhé! Cozy sẽ luôn đồng hành bên bạn.
        </p>

        <div className="w-full max-w-xs">
          <button
            onClick={onAction}
            className="w-full py-4 bg-[#6FCF97] hover:bg-[#58B880] text-white font-extrabold text-sm rounded-2xl flex items-center justify-center gap-2 shadow-[0_8px_25px_rgba(111,207,151,0.35)] active:scale-98 transition-all"
          >
            <Plus size={18} />
            <span> Tạo chu kỳ tháng đầu tiên</span>
          </button>
        </div>
      </div>
    );
  }

  if (type === 'no-expenses') {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-gray-100 cozy-card-shadow">
        <span className="text-4xl block mb-2">🎉</span>
        <h4 className="font-extrabold text-[#3D405B] text-sm">Chưa có khoản chi tiêu nào</h4>
        <p className="text-xs text-[#7A7D8C] mt-1 max-w-xs mx-auto">
          Chưa chi tiêu gì cả! Hãy bắt đầu ghi chép khi có phát sinh chi tiêu nhé 🌱
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 text-center bg-white rounded-3xl border border-gray-100">
      <span className="text-3xl block mb-2">🧾</span>
      <h4 className="font-extrabold text-[#3D405B] text-sm">Bạn chưa có khoản cố định nào</h4>
      <p className="text-xs text-[#7A7D8C] mt-1 mb-4">
        Các khoản như tiền nhà, mạng, điện thoại sẽ được tách riêng để không ảnh hưởng ngân sách tuần.
      </p>
      {onAction && (
        <button
          onClick={onAction}
          className="py-2.5 px-4 bg-[#6FCF97] text-white font-bold text-xs rounded-xl hover:bg-[#58B880] transition-colors"
        >
          + Thêm chi phí cố định
        </button>
      )}
    </div>
  );
};
