'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Smartphone, Monitor, Sparkles } from 'lucide-react';

interface DesktopGuardProps {
  children: React.ReactNode;
}

export const DesktopGuard: React.FC<DesktopGuardProps> = ({ children }) => {
  const [isSimulatorMode, setIsSimulatorMode] = useState<boolean>(false);
  const [windowWidth, setWindowWidth] = useState<number>(0);
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Tránh flash mismatch lúc SSR
  if (!mounted) {
    return <div className="min-h-screen bg-[#FFFDF8]">{children}</div>;
  }

  const isWideScreen = windowWidth > 500;

  // Nếu màn hình nhỏ hơn hoặc bằng 500px (màn hình điện thoại chuẩn)
  if (!isWideScreen) {
    return <div className="min-h-screen bg-[#FFFDF8] max-w-[500px] mx-auto">{children}</div>;
  }

  // Nếu là màn hình rộng (> 500px) nhưng người dùng bật chế độ Mobile Simulator
  if (isSimulatorMode) {
    return (
      <div className="min-h-screen bg-[#F4EFE6] dark:bg-[#0D0F15] py-6 px-4 flex flex-col items-center justify-center transition-colors">
        <div className="mb-4 flex items-center justify-between w-full max-w-[420px] bg-white/80 dark:bg-[#1B1E2B]/90 backdrop-blur-md px-4 py-2.5 rounded-full border border-[#6FCF97]/30 dark:border-white/10 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#3D405B] dark:text-[#F3F4F8]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#6FCF97] animate-ping" />
            <span>Mô phỏng điện thoại di động</span>
          </div>
          <button
            onClick={() => setIsSimulatorMode(false)}
            className="text-xs bg-[#FFF0F4] dark:bg-[#311B24] text-[#FB6F92] dark:text-[#FF8FAB] font-semibold px-3 py-1 rounded-full hover:bg-[#FFE3EC] dark:hover:bg-[#42212E] transition-colors"
          >
            Đóng mô phỏng
          </button>
        </div>

        {/* Khung mô phỏng điện thoại iPhone */}
        <div className="w-full max-w-[414px] h-[850px] max-h-[90vh] bg-white dark:bg-[#12141D] rounded-[44px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.4)] border-[8px] border-[#2E3147] dark:border-[#1E202C] overflow-hidden flex flex-col relative">
          {/* Dynamic Island / Tai thỏ nhỏ */}
          <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-28 h-5 bg-[#2E3147] dark:bg-[#1E202C] rounded-full z-50 flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-[#1c1d29] dark:bg-[#14161F] mr-2" />
            <div className="w-2 h-2 rounded-full bg-[#242738] dark:bg-[#181A24]" />
          </div>

          <div className="flex-1 overflow-y-auto overflow-x-hidden pt-6">
            {children}
          </div>
        </div>
      </div>
    );
  }

  // Màn hình > 500px: Chỉ hiển thị màn hình thông báo theo đúng yêu cầu:
  // "khi dài hơn mobile chỉ show màn hình với text. Ứng dụng chưa phục vụ trên website, vui lòng chuyển sang dạng mobile."
  return (
    <div className="min-h-screen w-full bg-[#FFFDF8] dark:bg-[#12141D] flex flex-col items-center justify-center p-6 text-center select-none transition-colors">
      <div className="max-w-md bg-white dark:bg-[#1B1E2B] rounded-[32px] p-8 md:p-10 shadow-[0_15px_40px_rgba(61,64,91,0.06)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] border border-[#FFF0F4] dark:border-white/10 flex flex-col items-center">
        {/* Linh vật Piggy đáng yêu */}
        <div className="relative w-28 h-28 mb-6 rounded-full overflow-hidden shadow-inner ring-4 ring-[#FF8FAB]/20">
          <Image
            src="/images/piggy.jpg"
            alt="Piggy Mascot"
            fill
            className="object-cover"
            priority
          />
        </div>

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFF0F4] text-[#FB6F92] text-xs font-bold mb-4 tracking-wide uppercase">
          <Smartphone size={14} />
          <span>Phiên bản Mobile First</span>
        </div>

        <h1 className="text-xl md:text-2xl font-black text-[#3D405B] leading-snug mb-3">
          Ứng dụng chưa phục vụ trên website
        </h1>

        <p className="text-base font-semibold text-[#6FCF97] mb-2">
          Vui lòng chuyển sang dạng mobile
        </p>

        <p className="text-sm text-[#7A7D8C] leading-relaxed mb-8">
          Cozy Money được thiết kế trọn vẹn dành riêng cho trải nghiệm thao tác một tay trên điện thoại di động. Hãy mở website trên điện thoại hoặc thu nhỏ cửa sổ trình duyệt (width ≤ 500px) bạn nhé! 🌱
        </p>

        {/* Nút mô phỏng để người dùng duyệt thử nghiệm trên laptop */}
        <button
          onClick={() => setIsSimulatorMode(true)}
          className="w-full flex items-center justify-center gap-2 bg-[#6FCF97] hover:bg-[#58B880] text-white font-bold text-sm py-3.5 px-6 rounded-2xl shadow-[0_8px_20px_rgba(111,207,151,0.3)] active:scale-98 transition-all"
        >
          <Sparkles size={18} />
          <span>Mở chế độ mô phỏng điện thoại</span>
        </button>
      </div>

      <div className="mt-6 text-xs text-[#A7A9B4] flex items-center gap-1.5">
        <Monitor size={14} />
        <span>Kích thước hiện tại: {windowWidth}px &gt; 500px</span>
      </div>
    </div>
  );
};
