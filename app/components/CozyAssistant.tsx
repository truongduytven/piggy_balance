'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import {
  X,
  Send,
  Sparkles,
  Check,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useFinance } from '../context/FinanceContext';
import { parseAIIntent, ParsedExpenseData } from '../lib/aiParser';
import { formatVND } from '../lib/financeCalculations';
import { CATEGORIES } from '../lib/constants';
import { ExpenseCategory, ChatMessage } from '../types/finance';

interface CozyAssistantProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CozyAssistant: React.FC<CozyAssistantProps> = ({
  isOpen,
  onClose,
}) => {
  const { activeMonth, activeMonthSummary, addExpense, isApiLoading } = useFinance();

  const [inputVal, setInputVal] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'cozy',
      text: 'Hello 👋 Mình là Cozy, trợ lý tiền bạc nhỏ của bạn! Hôm nay mình giúp gì cho bạn nè?',
      timestamp: 'Vừa xong',
    },
  ]);
  const [pendingExpense, setPendingExpense] = useState<ParsedExpenseData | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Xử lý gửi tin nhắn
  const handleSendMessage = (textToSend?: string) => {
    const query = (textToSend || inputVal).trim();
    if (!query) return;

    // Tin nhắn người dùng
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: 'Vừa xong',
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputVal('');

    // Dùng Intent + Parser độc lập
    setTimeout(() => {
      processAIResponse(query);
    }, 350);
  };

  // Logic phản hồi qua Intent + Parser độc lập
  const processAIResponse = (userText: string) => {
    const parsed = parseAIIntent(userText);
    const summary = activeMonthSummary;

    const weeklyRemaining = summary?.currentWeekSummary?.remaining ?? 0;
    const weeklyBudget = summary?.month.lockedWeeklyBudget ?? 1_500_000;
    const monthlySpent = summary?.totalSpent ?? 0;
    const fixedExpensesTotal = summary?.totalFixed ?? 0;

    switch (parsed.intent) {
      case 'CHECK_WEEKLY_REMAINING': {
        addCozyMessage(
          `Tuần này bạn còn ${formatVND(weeklyRemaining)} để tiêu nha 🌱 Hãy giữ tốc độ chi tiêu nhẹ nhàng nhé!`
        );
        break;
      }

      case 'CHECK_WEEKLY_BUDGET': {
        addCozyMessage(
          `Ngân sách tuần của bạn đang được chốt ở mức ${formatVND(weeklyBudget)} 🔒 Mỗi tuần là một khởi đầu hoàn toàn độc lập nha!`
        );
        break;
      }

      case 'CHECK_MONTHLY_SPENT': {
        addCozyMessage(
          `Tháng này bạn đã tiêu ${formatVND(monthlySpent)} rồi nè. Số dư khả dụng còn lại là ${formatVND(
            summary?.remainingMonth ?? 0
          )}.`
        );
        break;
      }

      case 'CHECK_FIXED_EXPENSES': {
        const fixedList =
          activeMonth?.fixedExpenses.map((f) => `${f.name}: ${formatVND(f.amount)}`).join(', ') ||
          'Không có';
        addCozyMessage(
          `Tháng này bạn có ${formatVND(fixedExpensesTotal)} chi phí cố định (${fixedList}). Phần tiền này đã được để riêng rồi nên bạn cứ yên tâm chi tiêu nhé!`
        );
        break;
      }

      case 'CHECK_MONTHLY_SUMMARY': {
        addCozyMessage(
          `Tình hình ${activeMonth?.name || 'tháng này'}:\n` +
            `• Ban đầu: ${formatVND(summary?.initialMoney ?? 0)}\n` +
            `• Cố định: ${formatVND(fixedExpensesTotal)}\n` +
            `• Đã chi tiêu: ${formatVND(monthlySpent)}\n` +
            `• Còn lại: ${formatVND(summary?.remainingMonth ?? 0)} 🌱`,
          {
            type: 'summary',
          }
        );
        break;
      }

      case 'CONSULT_PURCHASE': {
        if (parsed.consultData) {
          const { item, amount, category } = parsed.consultData;
          const remainingMonth = summary?.remainingMonth ?? 0;
          const weeklyRemaining = summary?.currentWeekSummary?.remaining ?? 0;
          const afterPurchaseWeekly = weeklyRemaining - amount;
          const percentOfWeekly =
            weeklyRemaining > 0 ? Math.round((amount / weeklyRemaining) * 100) : 100;

          let verdict: 'safe' | 'caution' | 'weekly_over' | 'monthly_over' = 'safe';
          let verdictLabel = 'Rất an toàn để mua 🎉';
          let verdictColor = '#6FCF97';
          let textMessage = '';
          let adviceText = '';

          // Kịch bản 1: Vượt toàn bộ số tiền còn lại của cả tháng
          if (amount > remainingMonth) {
            verdict = 'monthly_over';
            verdictLabel = 'Không nên mua lúc này 🚫';
            verdictColor = '#FF7B7B';
            textMessage = `Cozy khuyên bạn chưa nên mua ${item} (${formatVND(amount)}) lúc này nha 🥺`;
            adviceText = `Món này vượt quá toàn bộ số tiền còn lại của cả tháng (${formatVND(remainingMonth)}). Mua bây giờ sẽ khiến bạn bị thâm hụt tài chính nghiêm trọng!`;
          }
          // Kịch bản 2: Vượt ngân sách tuần hiện tại
          else if (amount > weeklyRemaining) {
            verdict = 'weekly_over';
            verdictLabel = 'Vượt ngân sách tuần này ⚠️';
            verdictColor = '#FFA502';
            const overAmount = amount - weeklyRemaining;
            textMessage = `Mua ${item} (${formatVND(amount)}) sẽ làm tuần này bị vượt định mức đó 👀`;
            adviceText = `Tuần này bạn còn ${formatVND(weeklyRemaining)}. Nếu mua ngay, tuần này sẽ bị âm ${formatVND(overAmount)}. Vì ngân sách tuần độc lập và không dồn tiền, Cozy khuyên bạn nên để dành sang tuần sau nhé!`;
          }
          // Kịch bản 3: Chiếm hơn 65% số tiền còn lại của tuần
          else if (percentOfWeekly > 65) {
            verdict = 'caution';
            verdictLabel = 'Cần cân nhắc kỹ 🧐';
            verdictColor = '#FFD166';
            textMessage = `Bạn vẫn đủ tiền mua ${item}, nhưng sẽ hụt kha khá tiền tuần này nè!`;
            adviceText = `Món này chiếm tới ${percentOfWeekly}% số tiền còn lại của tuần. Sau khi mua, bạn chỉ còn ${formatVND(afterPurchaseWeekly)} để tiêu cho các ngày còn lại thôi. Cân nhắc xem có thực sự cần gấp không nha 🌱`;
          }
          // Kịch bản 4: An toàn
          else {
            verdict = 'safe';
            verdictLabel = 'Hoàn toàn mua được! 🌱';
            verdictColor = '#6FCF97';
            textMessage = `Duyệt nè! Bạn có thể thoải mái mua ${item} (${formatVND(amount)}) nha 🎉`;
            adviceText = `Món này chỉ chiếm ${percentOfWeekly}% số tiền tuần còn lại. Sau khi mua bạn vẫn còn ${formatVND(afterPurchaseWeekly)} rất dư dả. Thưởng cho bản thân một chút cũng xứng đáng!`;
          }

          addCozyMessage(textMessage, {
            type: 'purchase_advice',
            adviceData: {
              item,
              amount,
              category,
              weeklyRemaining,
              afterPurchaseWeekly,
              percentOfWeeklyRemaining: percentOfWeekly,
              remainingMonth,
              verdict,
              verdictLabel,
              verdictColor,
              advice: adviceText,
            },
          });
        }
        break;
      }

      case 'ADD_EXPENSE': {
        if (parsed.expenseData) {
          setPendingExpense(parsed.expenseData);
          addCozyMessage(`Để mình ghi lại nhé 👀 Bạn kiểm tra thông tin bên dưới nha:`, {
            type: 'confirmation',
            data: {
              amount: parsed.expenseData.amount,
              category: parsed.expenseData.category,
              description: parsed.expenseData.description,
              date: 'Hôm nay',
              wallet: 'Ví chính',
            },
          });
        }
        break;
      }

      case 'AMBIGUOUS_AMOUNT': {
        if (parsed.expenseData) {
          setPendingExpense(parsed.expenseData);
          addCozyMessage(
            `Bạn muốn ghi khoản chi ${formatVND(parsed.expenseData.amount)} cho mục nào nè?`
          );
        }
        break;
      }

      case 'HELP': {
        addCozyMessage(
          `Bạn có thể gõ tự nhiên hoặc chọn các lệnh nhanh sau:\n` +
            `• "chi 50k ăn sáng"\n` +
            `• "chi 30k cà phê"\n` +
            `• "tuần này còn bao nhiêu"\n` +
            `• "ngân sách tuần"\n` +
            `• "tháng này đã tiêu bao nhiêu"\n` +
            `• "chi phí cố định"`
        );
        break;
      }

      case 'GREETING': {
        addCozyMessage('Chào bạn nè! Chúc bạn một ngày chi tiêu thật thông minh và an yên nha 🌱');
        break;
      }

      default: {
        addCozyMessage(
          `Cozy chưa hiểu rõ lắm 🥺 Bạn thử gõ "chi 50k ăn sáng" hoặc chọn gợi ý bên dưới nha!`
        );
      }
    }
  };

  const addCozyMessage = (
    text: string,
    card?: ChatMessage['card']
  ) => {
    const cozyMsg: ChatMessage = {
      id: `cozy-${Date.now()}`,
      sender: 'cozy',
      text,
      timestamp: 'Vừa xong',
      card,
    };
    setMessages((prev) => [...prev, cozyMsg]);
  };

  // Xác nhận lưu khoản chi từ Card
  const handleConfirmExpense = async (expenseData?: ParsedExpenseData, msgId?: string) => {
    const dataToSave = expenseData || pendingExpense;
    if (!dataToSave) return;

    // Ẩn xác nhận nếu đã xác nhận ở Cozy AI: đánh dấu message card là đã xác nhận
    if (msgId) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === msgId && m.card
            ? {
                ...m,
                card: {
                  ...m.card,
                  isConfirmed: true,
                  status: 'confirmed',
                },
              }
            : m
        )
      );
    } else {
      setMessages((prev) =>
        prev.map((m) =>
          m.card?.type === 'confirmation' && !m.card.isConfirmed
            ? {
                ...m,
                card: {
                  ...m.card,
                  isConfirmed: true,
                  status: 'confirmed',
                },
              }
            : m
        )
      );
    }

    setPendingExpense(null);

    await addExpense({
      amount: dataToSave.amount,
      category: dataToSave.category,
      description: dataToSave.description,
      wallet: 'Ví chính',
    });

    try {
      confetti({
        particleCount: 25,
        spread: 40,
        origin: { y: 0.8 },
        colors: ['#FF8FAB', '#6FCF97'],
      });
    } catch {}

    const newWeeklyRemaining = Math.max(
      0,
      (activeMonthSummary?.currentWeekSummary?.remaining ?? 0) - dataToSave.amount
    );

    setTimeout(() => {
      addCozyMessage(
        `Đã ghi nhận ${formatVND(dataToSave.amount)} tiền ${dataToSave.description} 🌱\n` +
          `Tuần này bạn còn ${formatVND(newWeeklyRemaining)} để tiêu nha!`
      );
    }, 300);
  };

  const handleCancelExpense = (msgId?: string) => {
    if (msgId) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === msgId && m.card
            ? {
                ...m,
                card: {
                  ...m.card,
                  status: 'cancelled',
                },
              }
            : m
        )
      );
    } else {
      setMessages((prev) =>
        prev.map((m) =>
          m.card?.type === 'confirmation' && !m.card.isConfirmed
            ? {
                ...m,
                card: {
                  ...m.card,
                  status: 'cancelled',
                },
              }
            : m
        )
      );
    }
    setPendingExpense(null);
    addCozyMessage('Đã hủy khoản chi này rồi nha!');
  };

  // Chọn danh mục cho trường hợp số tiền mơ hồ
  const handleSelectAmbiguousCategory = (category: ExpenseCategory) => {
    if (!pendingExpense) return;
    const updated: ParsedExpenseData = {
      ...pendingExpense,
      category,
      description: CATEGORIES[category].name,
    };
    setPendingExpense(updated);
    addCozyMessage(`Để mình ghi lại nhé 👀 Bạn kiểm tra thông tin bên dưới nha:`, {
      type: 'confirmation',
      data: {
        amount: updated.amount,
        category: updated.category,
        description: updated.description,
        date: 'Hôm nay',
        wallet: 'Ví chính',
      },
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end max-w-[500px] mx-auto bg-black/40 backdrop-blur-xs animate-fade-in">
      <div className="w-full h-full sm:h-[90vh] bg-[#FFFDF8] rounded-t-[32px] shadow-2xl flex flex-col overflow-hidden animate-slide-up">
        {/* Chat Header */}
        <div className="p-4 bg-white border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-11 h-11 rounded-2xl overflow-hidden ring-2 ring-[#FF8FAB]/40">
              <Image
                src="/images/piggy.jpg"
                alt="Cozy Mascot"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-extrabold text-[#3D405B] text-base">Cozy AI</h3>
                <span className="text-xs">🐷</span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-[#58B880] font-semibold">
                <span className="w-2 h-2 rounded-full bg-[#6FCF97] animate-pulse" />
                <span>Trợ lý tiền bạc nhỏ • Đang hoạt động</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Khung chat messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[82%] rounded-[22px] px-4 py-3 text-xs leading-relaxed ${
                    isUser
                      ? 'bg-[#6FCF97] text-white font-semibold rounded-br-xs shadow-xs'
                      : 'bg-white text-[#3D405B] rounded-bl-xs border border-[#FF8FAB]/20 cozy-card-shadow'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>
                </div>

                {/* Confirmation Card nếu có */}
                {msg.card?.type === 'confirmation' && msg.card.data && (
                  <div className="w-72 bg-[#FFF8E7] rounded-2xl p-4 mt-2 border border-[#FFD166]/40 shadow-xs animate-fade-in">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">
                        {msg.card.data.category
                          ? CATEGORIES[msg.card.data.category].icon
                          : '🍜'}
                      </span>
                      <span className="text-xs font-bold text-[#E5A800]">
                        {msg.card.data.category
                          ? CATEGORIES[msg.card.data.category].name
                          : 'Khoản chi'}
                      </span>
                    </div>

                    <div className="my-1.5">
                      <h4 className="font-extrabold text-[#3D405B] text-sm">
                        {msg.card.data.description}
                      </h4>
                      <div className="text-xl font-black text-[#3D405B] mt-0.5">
                        {formatVND(msg.card.data.amount || 0)}
                      </div>
                    </div>

                    <div className="text-[10px] text-[#7A7D8C] mb-3">
                      {msg.card.data.date} • {msg.card.data.wallet}
                    </div>

                    {/* Ẩn xác nhận nếu đã xác nhận ở Cozy AI */}
                    {msg.card.isConfirmed || msg.card.status === 'confirmed' ? (
                      <div className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#EBF8F1] dark:!bg-[#162E21] text-[#58B880] text-xs font-bold border border-[#6FCF97]/30">
                        <Check size={14} strokeWidth={3} />
                        <span>Đã xác nhận & ghi vào sổ</span>
                      </div>
                    ) : msg.card.status === 'cancelled' ? (
                      <div className="py-2 px-3 rounded-xl bg-gray-100 dark:!bg-white/5 text-gray-400 text-xs font-bold text-center italic">
                        Đã hủy khoản chi này
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleCancelExpense(msg.id)}
                          disabled={isApiLoading}
                          className="flex-1 py-2 rounded-xl bg-white dark:!bg-[#1E202C] text-[#7A7D8C] dark:!text-[#9DA1B4] text-xs font-bold border border-gray-200 dark:!border-white/10 hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                          Hủy
                        </button>
                        <button
                          onClick={() =>
                            handleConfirmExpense(
                              {
                                amount: msg.card?.data?.amount || 0,
                                category: msg.card?.data?.category || 'food',
                                description: msg.card?.data?.description || 'Ăn uống',
                              },
                              msg.id
                            )
                          }
                          disabled={isApiLoading}
                          className="flex-1 py-2 rounded-xl bg-[#6FCF97] hover:bg-[#58B880] text-white text-xs font-bold transition-colors shadow-xs flex items-center justify-center gap-1.5 disabled:opacity-50"
                        >
                          {isApiLoading ? (
                            <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                          ) : null}
                          <span>Xác nhận</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Purchase Advice Card nếu có */}
                {msg.card?.type === 'purchase_advice' && msg.card.adviceData && (
                  <div className="w-[300px] xs:w-80 bg-white dark:!bg-[#1E202C] rounded-[22px] p-4 mt-2 border border-gray-200/90 dark:!border-white/10 shadow-md animate-fade-in space-y-3">
                    {/* Header món đồ & Verdict badge */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xl shrink-0">
                          {CATEGORIES[msg.card.adviceData.category]?.icon || '🛍️'}
                        </span>
                        <span className="text-xs font-black text-[#3D405B] dark:!text-white truncate">
                          {msg.card.adviceData.item}
                        </span>
                      </div>
                      <span
                        className={`text-[10px] font-black px-2.5 py-1 rounded-full shrink-0 border ${
                          msg.card.adviceData.verdict === 'safe'
                            ? 'bg-[#EBF8F1] dark:!bg-[#162E21] text-[#58B880] dark:!text-[#6FCF97] border-[#6FCF97]/30'
                            : msg.card.adviceData.verdict === 'caution'
                            ? 'bg-[#FFF8E7] dark:!bg-[#2D2413] text-[#E5A800] dark:!text-[#FFD166] border-[#FFD166]/30'
                            : msg.card.adviceData.verdict === 'weekly_over'
                            ? 'bg-[#FFF5E5] dark:!bg-[#2D2413] text-[#FB8500] dark:!text-[#FFA502] border-[#FFA502]/30'
                            : 'bg-[#FFEAEA] dark:!bg-[#361A20] text-[#FF7B7B] dark:!text-[#FF8FAB] border-[#FF7B7B]/30'
                        }`}
                      >
                        {msg.card.adviceData.verdictLabel}
                      </span>
                    </div>

                    {/* Giá dự kiến */}
                    <div className="p-2.5 rounded-xl bg-[#F8F9FA] dark:!bg-[#242838] flex items-center justify-between">
                      <span className="text-[11px] font-bold text-[#7A7D8C] dark:!text-[#9DA1B4]">
                        Giá dự kiến:
                      </span>
                      <span className="text-base font-black text-[#3D405B] dark:!text-white">
                        {formatVND(msg.card.adviceData.amount)}
                      </span>
                    </div>

                    {/* Mô phỏng số dư tuần */}
                    <div className="space-y-1.5 text-[11px]">
                      <div className="flex justify-between text-[#7A7D8C] dark:!text-[#9DA1B4]">
                        <span>Tiền còn lại tuần này:</span>
                        <strong className="text-[#3D405B] dark:!text-white">
                          {formatVND(msg.card.adviceData.weeklyRemaining)}
                        </strong>
                      </div>
                      <div className="flex justify-between text-[#7A7D8C] dark:!text-[#9DA1B4]">
                        <span>Sau khi mua còn:</span>
                        <strong
                          className={`font-black ${
                            msg.card.adviceData.afterPurchaseWeekly < 0
                              ? 'text-[#FF7B7B]'
                              : 'text-[#58B880] dark:!text-[#6FCF97]'
                          }`}
                        >
                          {formatVND(msg.card.adviceData.afterPurchaseWeekly)}
                        </strong>
                      </div>
                      <div className="flex justify-between text-[#7A7D8C] dark:!text-[#9DA1B4]">
                        <span>Tỷ lệ ngân sách tuần:</span>
                        <strong className="text-[#3D405B] dark:!text-white">
                          {msg.card.adviceData.percentOfWeeklyRemaining}%
                        </strong>
                      </div>
                    </div>

                    {/* Lời khuyên chi tiết từ Cozy */}
                    <div className="p-2.5 rounded-xl bg-[#FFF8E7] dark:!bg-[#2D2413] border border-[#FFD166]/30 text-[11px] leading-relaxed text-[#3D405B] dark:!text-white">
                      💡 {msg.card.adviceData.advice}
                    </div>

                    {/* Nút hành động nhanh: Ẩn xác nhận nếu đã xác nhận ở Cozy AI (ghi trực tiếp) */}
                    {msg.card.isConfirmed ? (
                      <div className="w-full py-2.5 rounded-xl bg-[#EBF8F1] dark:!bg-[#162E21] text-[#58B880] text-xs font-bold border border-[#6FCF97]/30 flex items-center justify-center gap-1.5">
                        <Check size={14} strokeWidth={3} />
                        <span>✓ Đã ghi vào sổ chi tiêu</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          const item = msg.card?.adviceData?.item || 'Mua sắm';
                          const amount = msg.card?.adviceData?.amount || 0;
                          const category = msg.card?.adviceData?.category || 'shopping';

                          // Đánh dấu thẻ advice này là đã xác nhận
                          setMessages((prev) =>
                            prev.map((m) =>
                              m.id === msg.id && m.card
                                ? { ...m, card: { ...m.card, isConfirmed: true, status: 'confirmed' } }
                                : m
                            )
                          );

                          // Ghi trực tiếp vì người dùng đã xác nhận quyết định mua ở Cozy AI
                          handleConfirmExpense({
                            amount,
                            category,
                            description: item,
                          });
                        }}
                        disabled={isApiLoading}
                        className="w-full py-2.5 rounded-xl bg-[#6FCF97] hover:bg-[#58B880] disabled:opacity-50 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5"
                      >
                        {isApiLoading ? (
                          <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                        ) : (
                          <span>💸 Quyết định mua & ghi vào sổ</span>
                        )}
                      </button>
                    )}
                  </div>
                )}

                <span className="text-[9px] text-[#A7A9B4] px-1 mt-1 font-medium">
                  {msg.timestamp}
                </span>
              </div>
            );
          })}

          {/* Lựa chọn danh mục khi nhập số tiền mơ hồ */}
          {pendingExpense && !pendingExpense.category && (
            <div className="p-3 bg-white rounded-2xl border border-[#FF8FAB]/20 max-w-[85%]">
              <span className="text-xs font-bold text-[#3D405B] block mb-2">
                Chọn danh mục cho {formatVND(pendingExpense.amount)}:
              </span>
              <div className="grid grid-cols-2 gap-2">
                {(['food', 'transport', 'shopping', 'entertainment'] as ExpenseCategory[]).map(
                  (cat) => (
                    <button
                      key={cat}
                      onClick={() => handleSelectAmbiguousCategory(cat)}
                      className="p-2 rounded-xl border border-gray-100 flex items-center gap-2 text-xs font-bold text-[#3D405B] hover:bg-[#F9F9FB]"
                    >
                      <span>{CATEGORIES[cat].icon}</span>
                      <span>{CATEGORIES[cat].name}</span>
                    </button>
                  )
                )}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Thanh gợi ý câu lệnh nhanh */}
        <div className="px-4 py-2 bg-white/70 border-t border-gray-100 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          <button
            onClick={() => handleSendMessage('mua tai nghe 1tr2 được không?')}
            className="px-3 py-1 rounded-full bg-[#EBF8F1] text-[#58B880] text-[11px] font-bold whitespace-nowrap hover:bg-[#D9F3E4] transition-colors"
          >
            🧠 Có nên mua không?
          </button>
          <button
            onClick={() => handleSendMessage('chi 50k ăn sáng')}
            className="px-3 py-1 rounded-full bg-[#FFF0F4] text-[#FB6F92] text-[11px] font-bold whitespace-nowrap hover:bg-[#FFE0E9] transition-colors"
          >
            💸 Ghi khoản chi
          </button>
          <button
            onClick={() => handleSendMessage('tuần này còn bao nhiêu')}
            className="px-3 py-1 rounded-full bg-[#EBF8F1] text-[#58B880] text-[11px] font-bold whitespace-nowrap hover:bg-[#D9F3E4] transition-colors"
          >
            💰 Còn bao nhiêu tuần này?
          </button>
          <button
            onClick={() => handleSendMessage('tháng này')}
            className="px-3 py-1 rounded-full bg-[#F4F0FC] text-[#9C88FF] text-[11px] font-bold whitespace-nowrap hover:bg-[#EBE4FA] transition-colors"
          >
            📊 Xem tháng này
          </button>
          <button
            onClick={() => handleSendMessage('chi phí cố định')}
            className="px-3 py-1 rounded-full bg-[#FFF8E7] text-[#E5A800] text-[11px] font-bold whitespace-nowrap hover:bg-[#FFF0D4] transition-colors"
          >
            🧾 Chi phí cố định
          </button>
        </div>

        {/* Khung nhập tin nhắn */}
        <div className="p-3 bg-white border-t border-gray-100 flex items-center gap-2">
          <input
            type="text"
            placeholder="Nhập 'chi 50k ăn sáng' hoặc câu hỏi..."
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            className="flex-1 bg-[#F8F9FA] border border-gray-200 rounded-full py-3 px-4 text-xs font-semibold text-[#3D405B] focus:outline-none focus:border-[#6FCF97] focus:bg-white transition-all"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputVal.trim()}
            className="w-11 h-11 rounded-full bg-[#6FCF97] disabled:bg-gray-200 text-white flex items-center justify-center shadow-xs active:scale-95 transition-all"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
