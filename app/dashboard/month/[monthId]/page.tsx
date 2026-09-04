'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useFinance } from '../../../context/FinanceContext';
import { Header } from '../../../components/Header';
import { MonthlyDetailView } from '../../../components/MonthlyDetailView';
import { BottomNav } from '../../../components/BottomNav';
import { ExpenseModal } from '../../../components/ExpenseModal';
import { CozyAssistant } from '../../../components/CozyAssistant';

export default function MonthDetailPage() {
  const params = useParams();
  const router = useRouter();
  const monthId = params?.monthId as string;

  const { setActiveMonthId, isLoaded } = useFinance();
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);

  useEffect(() => {
    if (monthId) {
      setActiveMonthId(monthId);
    }
  }, [monthId, setActiveMonthId]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#FFFDF8] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-3 border-[#6FCF97] border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#FFFDF8] flex flex-col relative max-w-[500px] mx-auto shadow-sm">
      <Header />

      <div className="flex-1">
        <MonthlyDetailView
          onBackToHome={() => router.push('/')}
          onOpenAddExpense={() => setIsExpenseModalOpen(true)}
        />
      </div>

      <CozyAssistant
        isOpen={isAiDrawerOpen}
        onClose={() => setIsAiDrawerOpen(false)}
      />

      <ExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
      />

      <BottomNav
        currentTab="month"
        onTabChange={(tab) => {
          if (tab === 'home') router.push('/');
          if (tab === 'ai') setIsAiDrawerOpen(true);
          if (tab === 'settings') router.push('/');
        }}
      />
    </main>
  );
}
