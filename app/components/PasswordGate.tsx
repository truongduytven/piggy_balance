'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Lock, Eye, EyeOff, ShieldCheck, UserPlus, LogIn, KeyRound } from 'lucide-react';
import { useAuth, SAVED_USERNAME_KEY } from '../context/AuthContext';

interface PasswordGateProps {
  children: React.ReactNode;
}

export const PasswordGate: React.FC<PasswordGateProps> = ({ children }) => {
  const { currentUser, isLoading: isAuthLoading, login, register } = useAuth();

  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Login form state
  const [loginUsername, setLoginUsername] = useState<string>('');
  const [loginPassword, setLoginPassword] = useState<string>('');
  const [showLoginPassword, setShowLoginPassword] = useState<boolean>(false);
  const [rememberUsername, setRememberUsername] = useState<boolean>(true);

  // Register form state
  const [regUsername, setRegUsername] = useState<string>('');
  const [regPassword, setRegPassword] = useState<string>('');
  const [regPasswordKey, setRegPasswordKey] = useState<string>('');
  const [showRegPassword, setShowRegPassword] = useState<boolean>(false);

  // Status & error
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Autofill tên đăng nhập từ lần trước
  useEffect(() => {
    try {
      const saved = localStorage.getItem(SAVED_USERNAME_KEY);
      if (saved) {
        setLoginUsername(saved);
      }
    } catch {}
  }, []);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginUsername.trim() || !loginPassword.trim()) {
      setErrorMessage('Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu nha!');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    const res = await login(loginUsername.trim(), loginPassword);
    if (!res.success) {
      setErrorMessage(res.message || 'Đăng nhập không thành công');
      setIsSubmitting(false);
    } else {
      if (rememberUsername) {
        localStorage.setItem(SAVED_USERNAME_KEY, loginUsername.trim());
      } else {
        localStorage.removeItem(SAVED_USERNAME_KEY);
      }
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regUsername.trim() || !regPassword.trim() || !regPasswordKey.trim()) {
      setErrorMessage('Vui lòng điền đủ tên, mật khẩu và mã bảo mật PASSWORD_KEY!');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    const res = await register(regUsername.trim(), regPassword, regPasswordKey.trim());
    if (!res.success) {
      setErrorMessage(res.message || 'Đăng ký không thành công');
      setIsSubmitting(false);
    } else {
      setIsSubmitting(false);
    }
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-[#FFFDF8] flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-3 border-[#6FCF97] border-t-transparent animate-spin" />
      </div>
    );
  }

  // Đã đăng nhập hợp lệ (phiên 1 tuần)
  if (currentUser) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen w-full bg-[#FFFDF8] flex flex-col items-center justify-center p-4 text-center select-none animate-fade-in">
      <div className="w-full max-w-sm bg-white rounded-[36px] p-7 shadow-[0_20px_50px_rgba(61,64,91,0.06)] border border-[#FFF0F4] flex flex-col items-center relative overflow-hidden">
        {/* Nền blur hoa văn nhẹ */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFF0F4] rounded-full blur-2xl pointer-events-none opacity-60" />

        {/* Mascot con heo đáng yêu */}
        <div className="relative w-20 h-20 mb-3 rounded-full overflow-hidden shadow-inner ring-4 ring-[#FF8FAB]/25 animate-float-slow">
          <Image
            src="/images/piggy.jpg"
            alt="Piggy Mascot"
            fill
            className="object-cover"
            priority
          />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#EBF8F1] text-[#58B880] text-[11px] font-bold mb-2 tracking-wide">
          <ShieldCheck size={13} />
          <span>Bảo mật cá nhân 1 tuần</span>
        </div>

        <h1 className="text-xl font-black text-[#3D405B] mb-0.5">Cozy Money 🐷</h1>
        <p className="text-xs font-semibold text-[#7A7D8C] mb-5 max-w-xs leading-relaxed">
          {mode === 'login'
            ? 'Đăng nhập để vào cuốn sổ tài chính của bạn.'
            : 'Tạo tài khoản mới với mã bảo mật hệ thống.'}
        </p>

        {/* ===================== FORM ĐĂNG NHẬP ===================== */}
        {mode === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="w-full space-y-3">
            {/* Tên đăng nhập */}
            <div>
              <input
                type="text"
                placeholder="Tên đăng nhập..."
                value={loginUsername}
                onChange={(e) => {
                  setLoginUsername(e.target.value);
                  setErrorMessage('');
                }}
                className="w-full bg-[#F8F9FA] border border-gray-200 rounded-2xl py-3 pl-4 pr-4 text-sm font-bold text-[#3D405B] focus:outline-none focus:border-[#6FCF97] focus:bg-white transition-all placeholder:text-gray-400 placeholder:font-normal"
                autoComplete="username"
                autoFocus={!loginUsername}
              />
            </div>

            {/* Mật khẩu */}
            <div className="relative">
              <input
                type={showLoginPassword ? 'text' : 'password'}
                placeholder="Mật khẩu..."
                value={loginPassword}
                onChange={(e) => {
                  setLoginPassword(e.target.value);
                  setErrorMessage('');
                }}
                className="w-full bg-[#F8F9FA] border border-gray-200 rounded-2xl py-3 pl-4 pr-11 text-sm font-bold text-[#3D405B] focus:outline-none focus:border-[#6FCF97] focus:bg-white transition-all placeholder:text-gray-400 placeholder:font-normal"
                autoComplete="current-password"
                autoFocus={!!loginUsername}
              />
              <button
                type="button"
                onClick={() => setShowLoginPassword(!showLoginPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#7A7D8C] hover:text-[#3D405B] transition-colors"
                tabIndex={-1}
              >
                {showLoginPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Ghi nhớ tên đăng nhập */}
            <div className="flex items-center justify-between px-1 text-[11px] text-[#7A7D8C]">
              <label className="flex items-center gap-1.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberUsername}
                  onChange={(e) => setRememberUsername(e.target.checked)}
                  className="rounded text-[#6FCF97] focus:ring-[#6FCF97] accent-[#6FCF97] w-3.5 h-3.5"
                />
                <span className="font-semibold">Ghi nhớ tên đăng nhập</span>
              </label>
              <span className="text-[10px] text-[#A7A9B4]">Lưu 7 ngày</span>
            </div>

            {errorMessage && (
              <div className="p-2.5 rounded-xl bg-[#FFEAEA] border border-[#FF7B7B]/30 text-xs font-bold text-[#FF7B7B] animate-fade-in text-left">
                {errorMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-[#6FCF97] hover:bg-[#58B880] disabled:opacity-60 text-white font-extrabold text-sm rounded-2xl flex items-center justify-center gap-2 shadow-[0_8px_25px_rgba(111,207,151,0.35)] active:scale-98 transition-all mt-2"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
              ) : (
                <>
                  <LogIn size={16} />
                  <span>Đăng nhập vào sổ tay</span>
                </>
              )}
            </button>

            {/* Nút đăng ký nhỏ gọn phía dưới */}
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setErrorMessage('');
                }}
                className="text-[11px] text-[#A7A9B4] hover:text-[#6FCF97] font-medium transition-colors underline underline-offset-2"
              >
                Chưa có tài khoản? Đăng ký (yêu cầu mã bí mật)
              </button>
            </div>
          </form>
        ) : (
          /* ===================== FORM ĐĂNG KÝ (NHỎ GỌN) ===================== */
          <form onSubmit={handleRegisterSubmit} className="w-full space-y-2.5 text-left">
            <div>
              <label className="text-[11px] font-bold text-[#7A7D8C] block mb-1">
                Tên đăng nhập mới
              </label>
              <input
                type="text"
                placeholder="Ví dụ: Joshua, Alice..."
                value={regUsername}
                onChange={(e) => {
                  setRegUsername(e.target.value);
                  setErrorMessage('');
                }}
                className="w-full bg-[#F8F9FA] border border-gray-200 rounded-xl py-2 px-3 text-xs font-bold text-[#3D405B] focus:outline-none focus:border-[#6FCF97]"
                autoFocus
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-[#7A7D8C] block mb-1">Mật khẩu</label>
              <div className="relative">
                <input
                  type={showRegPassword ? 'text' : 'password'}
                  placeholder="Tối thiểu 4 ký tự..."
                  value={regPassword}
                  onChange={(e) => {
                    setRegPassword(e.target.value);
                    setErrorMessage('');
                  }}
                  className="w-full bg-[#F8F9FA] border border-gray-200 rounded-xl py-2 pl-3 pr-9 text-xs font-bold text-[#3D405B] focus:outline-none focus:border-[#6FCF97]"
                />
                <button
                  type="button"
                  onClick={() => setShowRegPassword(!showRegPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                >
                  {showRegPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-[#E5A800] flex items-center gap-1">
                  <KeyRound size={12} />
                  <span>Mã bảo mật PASSWORD_KEY</span>
                </label>
              </div>
              <input
                type="password"
                placeholder="Nhập mã bí mật hệ thống..."
                value={regPasswordKey}
                onChange={(e) => {
                  setRegPasswordKey(e.target.value);
                  setErrorMessage('');
                }}
                className="w-full bg-[#FFFBF0] border border-[#FFD166] rounded-xl py-2 px-3 text-xs font-bold text-[#3D405B] focus:outline-none focus:border-[#E5A800]"
              />
              <span className="text-[10px] text-[#A7A9B4] mt-0.5 block">
                Chỉ người có mã bí mật mới có thể mở sổ mới.
              </span>
            </div>

            {errorMessage && (
              <div className="p-2 rounded-xl bg-[#FFEAEA] border border-[#FF7B7B]/30 text-xs font-bold text-[#FF7B7B] animate-fade-in">
                {errorMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-1 py-3 bg-[#6FCF97] hover:bg-[#58B880] disabled:opacity-60 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs transition-all"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
              ) : (
                <>
                  <UserPlus size={14} />
                  <span>Tạo tài khoản & Đăng nhập</span>
                </>
              )}
            </button>

            <div className="pt-1 text-center">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMessage('');
                }}
                className="text-[11px] text-[#7A7D8C] hover:text-[#3D405B] font-semibold transition-colors"
              >
                ← Đã có tài khoản? Quay lại đăng nhập
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
