'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AuthUser } from '../lib/auth';

export const SAVED_USERNAME_KEY = 'cozy_saved_username';

interface AuthContextType {
  currentUser: AuthUser | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (
    username: string,
    password: string,
    passwordKey: string,
    displayName?: string
  ) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Kiểm tra phiên đăng nhập 7 ngày khi mở app
  const checkSession = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated && data.user) {
          setCurrentUser(data.user);
          // Ghi nhớ tên đăng nhập
          localStorage.setItem(SAVED_USERNAME_KEY, data.user.username);
          return;
        }
      }
      setCurrentUser(null);
    } catch {
      setCurrentUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const login = async (username: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setCurrentUser(data.user);
        // Lưu tên đăng nhập cho lần sau tự fill
        localStorage.setItem(SAVED_USERNAME_KEY, data.user.username);
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message || 'Đăng nhập không thành công' };
    } catch {
      return { success: false, message: 'Lỗi kết nối đến máy chủ' };
    }
  };

  const register = async (
    username: string,
    password: string,
    passwordKey: string,
    displayName?: string
  ) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, passwordKey, displayName }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setCurrentUser(data.user);
        localStorage.setItem(SAVED_USERNAME_KEY, data.user.username);
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message || 'Đăng ký không thành công' };
    } catch {
      return { success: false, message: 'Lỗi kết nối đến máy chủ' };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {}
    setCurrentUser(null);
    window.location.reload();
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
