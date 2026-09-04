'use client';

import React, { useState } from 'react';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { DashboardView } from './components/DashboardView';
import { MonthlyDetailView } from './components/MonthlyDetailView';
import { SettingsView } from './components/SettingsView';
import { ExpenseModal } from './components/ExpenseModal';
import { CozyAssistant } from './components/CozyAssistant';
import { NewMonthWizard } from './components/NewMonthWizard';
import { useFinance } from './context/FinanceContext';

export default function AppHome() {
  const { isLoaded } = useFinance();

  const [currentTab, setCurrentTab] = useState<'home' | 'month' | 'ai' | 'settings'>('home');
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isNewMonthWizardOpen, setIsNewMonthWizardOpen] = useState(false);
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#FFFDF8] flex flex-col items-center justify-center p-6">
        <div className="w-12 h-12 rounded-full border-4 border-[#6FCF97] border-t-transparent animate-spin mb-3" />
        <p className="text-xs font-bold text-[#7A7D8C]">Đang kết nối cơ sở dữ liệu Cozy Money... 🌱</p>
      </div>
    );
  }

  const handleTabChange = (tab: 'home' | 'month' | 'ai' | 'settings') => {
    if (tab === 'ai') {
      setIsAiDrawerOpen(true);
      return;
    }
    setCurrentTab(tab);
  };

  return (
    <main className="min-h-screen bg-[#FFFDF8] flex flex-col relative max-w-[500px] mx-auto shadow-sm">
      {/* Top Header */}
      <Header />

      {/* Main Content Area */}
      <div className="flex-1">
        {currentTab === 'home' && (
          <DashboardView
            onNavigateToMonth={() => setCurrentTab('month')}
            onOpenAddExpense={() => setIsExpenseModalOpen(true)}
            onOpenNewMonthWizard={() => setIsNewMonthWizardOpen(true)}
          />
        )}

        {currentTab === 'month' && (
          <MonthlyDetailView
            onBackToHome={() => setCurrentTab('home')}
            onOpenAddExpense={() => setIsExpenseModalOpen(true)}
          />
        )}

        {currentTab === 'settings' && (
          <SettingsView onOpenNewMonthWizard={() => setIsNewMonthWizardOpen(true)} />
        )}
      </div>

      {/* Cozy AI Chat Drawer (Mở độc quyền qua Tab Cozy AI phía dưới) */}
      <CozyAssistant
        isOpen={isAiDrawerOpen}
        onClose={() => setIsAiDrawerOpen(false)}
      />

      {/* Modal thêm khoản chi */}
      <ExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
      />

      {/* Wizard tạo tháng mới & chốt ngân sách */}
      <NewMonthWizard
        isOpen={isNewMonthWizardOpen}
        onClose={() => setIsNewMonthWizardOpen(false)}
      />

      {/* Bottom Navigation */}
      <BottomNav currentTab={currentTab} onTabChange={handleTabChange} />
    </main>
  );
}
