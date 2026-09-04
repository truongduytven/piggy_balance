'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type ThemeMode = 'light' | 'dark';
export type ColorTheme = 'green' | 'pink' | 'blue' | 'lavender' | 'amber';

export interface ThemeOption {
  id: ColorTheme;
  name: string;
  primary: string;
  lightBg: string;
  icon: string;
}

export const COLOR_THEMES: ThemeOption[] = [
  { id: 'green', name: 'Mầm xanh', primary: '#6FCF97', lightBg: '#EBF8F1', icon: '🌱' },
  { id: 'pink', name: 'Hồng phấn', primary: '#FF8FAB', lightBg: '#FFF0F4', icon: '🌸' },
  { id: 'blue', name: 'Biển xanh', primary: '#48CAE4', lightBg: '#E8F8FC', icon: '🌊' },
  { id: 'lavender', name: 'Oải hương', primary: '#B8A1E5', lightBg: '#F4F0FC', icon: '💜' },
  { id: 'amber', name: 'Mật ong', primary: '#FFA502', lightBg: '#FFF5E5', icon: '🍯' },
];

interface ThemeContextType {
  mode: ThemeMode;
  colorTheme: ColorTheme;
  setMode: (mode: ThemeMode) => void;
  setColorTheme: (theme: ColorTheme) => void;
  toggleMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const MODE_STORAGE_KEY = 'cozy_money_theme_mode';
const THEME_STORAGE_KEY = 'cozy_money_color_theme';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setModeState] = useState<ThemeMode>('light');
  const [colorTheme, setColorThemeState] = useState<ColorTheme>('green');

  useEffect(() => {
    try {
      const savedMode = localStorage.getItem(MODE_STORAGE_KEY) as ThemeMode;
      const savedColor = localStorage.getItem(THEME_STORAGE_KEY) as ColorTheme;

      if (savedMode === 'dark' || savedMode === 'light') {
        setModeState(savedMode);
      } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setModeState('dark');
      }

      if (savedColor && COLOR_THEMES.some((t) => t.id === savedColor)) {
        setColorThemeState(savedColor);
      }
    } catch {}
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (mode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    root.setAttribute('data-color-theme', colorTheme);
  }, [mode, colorTheme]);

  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode);
    try {
      localStorage.setItem(MODE_STORAGE_KEY, newMode);
    } catch {}
  };

  const setColorTheme = (newColor: ColorTheme) => {
    setColorThemeState(newColor);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, newColor);
    } catch {}
  };

  const toggleMode = () => {
    setMode(mode === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ mode, colorTheme, setMode, setColorTheme, toggleMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
