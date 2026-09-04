'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Lock, Eye, EyeOff, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';

interface PasswordGateProps {
  children: React.ReactNode;
}

const AUTH_KEY = 'cozy_money_auth_session_v1';

export const PasswordGate: React.FC<PasswordGateProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(true);
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(AUTH_KEY);
      if (stored) {
        const session = JSON.parse(stored);
        if (session.authenticated && session.expiresAt && Date.now() < session.expiresAt) {
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem(AUTH_KEY);
        }
      }
    } catch {
      localStorage.removeItem(AUTH_KEY);
    } finally {
      setIsChecking(false);
    }
  }, []);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordInput.trim()) {
      setErrorMessage('Vui lòng nhập mật khẩu nha!');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passwordInput.trim() }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // Lưu session 1 ngày (24 giờ)
        const sessionData = {
          authenticated: true,
          expiresAt: data.expiresAt || Date.now() + 24 * 60 * 60 * 1000,
        };
        localStorage.setItem(AUTH_KEY, JSON.stringify(sessionData));
        setIsAuthenticated(true);
      } else {
        setErrorMessage(data.message || 'Mật khẩu chưa đúng, bạn thử lại nha 🥺');
      }
    } catch (err) {
      setErrorMessage('Không thể kết nối đến máy chủ xác thực');
    } finally {
      setIsLoading(false);
    }
  };

  if (isChecking) {
    return (
      <div className="min-h-screen bg-[#FFFDF8] flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-3 border-[#6FCF97] border-t-transparent animate-spin" />
      </div>
    );
  }

  // Nếu đã xác thực thành công (duy trì session 1 ngày)
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // Màn hình nhập mật khẩu bảo mật
  return (
    <div className="min-h-screen w-full bg-[#FFFDF8] flex flex-col items-center justify-center p-6 text-center select-none animate-fade-in">
      <div className="w-full max-w-sm bg-white rounded-[36px] p-8 shadow-[0_20px_50px_rgba(61,64,91,0.06)] border border-[#FFF0F4] flex flex-col items-center relative overflow-hidden">
        {/* Nền blur hoa văn nhẹ */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFF0F4] rounded-full blur-2xl pointer-events-none opacity-60" />

        {/* Mascot con heo đáng yêu */}
        <div className="relative w-24 h-24 mb-5 rounded-full overflow-hidden shadow-inner ring-4 ring-[#FF8FAB]/25 animate-float-slow">
          <Image
            src="/images/piggy.jpg"
            alt="Piggy Mascot"
            fill
            className="object-cover"
            priority
          />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EBF8F1] text-[#58B880] text-[11px] font-bold mb-3 tracking-wide">
          <ShieldCheck size={13} />
          <span>Bảo vệ quyền riêng tư</span>
        </div>

        <h1 className="text-xl font-black text-[#3D405B] mb-1">
          Cozy Money 🐷
        </h1>
        <p className="text-xs font-semibold text-[#7A7D8C] mb-6 max-w-xs leading-relaxed">
          Nhập mật khẩu để mở khóa cuốn sổ tài chính cá nhân của bạn.
        </p>

        <form onSubmit={handleVerify} className="w-full space-y-3">
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Nhập mật khẩu truy cập..."
              value={passwordInput}
              onChange={(e) => {
                setPasswordInput(e.target.value);
                setErrorMessage('');
              }}
              className="w-full bg-[#F8F9FA] border border-gray-200 rounded-2xl py-3.5 pl-4 pr-11 text-sm font-bold text-[#3D405B] focus:outline-none focus:border-[#6FCF97] focus:bg-white transition-all placeholder:text-gray-400 placeholder:font-normal"
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#7A7D8C] hover:text-[#3D405B] transition-colors"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {errorMessage && (
            <div className="p-2.5 rounded-xl bg-[#FFEAEA] border border-[#FF7B7B]/30 text-xs font-bold text-[#FF7B7B] animate-fade-in">
              {errorMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-[#6FCF97] hover:bg-[#58B880] disabled:opacity-60 text-white font-extrabold text-sm rounded-2xl flex items-center justify-center gap-2 shadow-[0_8px_25px_rgba(111,207,151,0.35)] active:scale-98 transition-all"
          >
            {isLoading ? (
              <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
            ) : (
              <>
                <Lock size={16} />
                <span>Mở khóa sổ tay</span>
              </>
            )}
          </button>
        </form>

        <p className="text-[10px] text-[#A7A9B4] mt-5">
          Phiên đăng nhập được lưu an toàn trong 24 giờ.
        </p>
      </div>
    </div>
  );
};
