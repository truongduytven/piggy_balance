'use client';

import React from 'react';
import { ArrowLeft, PiggyBank, TrendingUp, Calendar, CheckCircle2, ChevronRight, Sparkles } from 'lucide-react';
import { MonthSummary } from '../types/finance';
import { formatVND } from '../lib/financeCalculations';

interface AccumulatedSavingsHistoryProps {
  pastMonthsSummaries: MonthSummary[];
  totalAccumulatedSavings: number;
  currentActiveMonthName?: string;
  onBack: () => void;
  onSelectMonth?: (monthId: string) => void;
}

export const AccumulatedSavingsHistory: React.FC<AccumulatedSavingsHistoryProps> = ({
  pastMonthsSummaries,
  totalAccumulatedSavings,
  currentActiveMonthName,
  onBack,
  onSelectMonth,
}) => {
  // Tìm tháng có số tiền dư tích lũy cao nhất
  const bestMonth = pastMonthsSummaries.reduce<MonthSummary | null>((best, cur) => {
    if (!best) return cur;
    return cur.remainingMonth > best.remainingMonth ? cur : best;
  }, null);

  const monthsWithSurplusCount = pastMonthsSummaries.filter((s) => s.remainingMonth > 0).length;

  return (
    <div className="space-y-4 pb-28 px-4 pt-2 animate-fade-in">
      {/* Header thanh điều hướng quay lại */}
      <div className="flex items-center justify-between pt-1">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-bold text-[#7A7D8C] hover:text-[#3D405B] transition-colors py-1.5 px-2 -ml-2 rounded-xl hover:bg-gray-100"
        >
          <ArrowLeft size={16} />
          <span>Quay lại Tài khoản</span>
        </button>

        <span className="text-[11px] font-bold text-[#58B880] bg-[#EBF8F1] px-3 py-1 rounded-full border border-[#6FCF97]/25 shadow-2xs">
          Heo đất tích lũy
        </span>
      </div>

      {/* Tiêu đề màn hình */}
      <div>
        <h2 className="text-xl font-black text-[#3D405B] tracking-tight">
          Lịch sử tích lũy các tháng
        </h2>
        <p className="text-xs font-semibold text-[#7A7D8C] mt-0.5">
          Tiền dư từ các chu kỳ tháng trước được tự động gom vào đây
        </p>
      </div>

      {/* Thẻ Hero Card Tổng Quỹ Tích Lũy tiệp màu hoàn hảo với Theme */}
      <div className="bg-white rounded-[28px] p-5.5 cozy-card-shadow border border-[#6FCF97]/20 relative overflow-hidden transition-all">
        {/* Nền blur êm ái tiệp màu theme */}
        <div className="absolute top-0 right-0 w-44 h-44 bg-[#EBF8F1] rounded-full blur-3xl -mr-12 -mt-12 pointer-events-none opacity-60" />

        <div className="flex items-center justify-between mb-3 relative">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#EBF8F1] flex items-center justify-center text-[#58B880] border border-[#6FCF97]/20 shadow-2xs">
              <PiggyBank size={18} />
            </div>
            <div>
              <span className="text-[10px] font-bold text-[#7A7D8C] uppercase tracking-wider block">
                Quỹ tích lũy tổng
              </span>
              <span className="text-xs font-black text-[#3D405B]">
                Các tháng đã chốt sổ
              </span>
            </div>
          </div>

          <span className="text-[10px] font-bold text-[#58B880] bg-[#EBF8F1] px-2.5 py-0.5 rounded-full border border-[#6FCF97]/20 shadow-2xs">
            {pastMonthsSummaries.length} chu kỳ chốt
          </span>
        </div>

        {/* Con số tổng tiền tích lũy */}
        <div className="my-2">
          <span className="text-xs font-bold text-[#7A7D8C] block mb-1">
            Tổng quỹ tích lũy hiện có
          </span>
          <div className="text-4xl xs:text-[44px] font-black tracking-tight text-[#3D405B] leading-none">
            {formatVND(totalAccumulatedSavings)}
          </div>
          <p className="text-[11px] font-semibold text-[#7A7D8C] mt-2 flex items-center gap-1.5 flex-wrap">
            <span>Tự động chốt khi sang tháng mới</span>
            <span className="text-[#A7A9B4]">•</span>
            <span className="text-[#58B880]">Không tính tháng {currentActiveMonthName ? currentActiveMonthName.replace('Tháng ', '') : 'hiện tại'} 🌱</span>
          </p>
        </div>

        {/* 3 ô tóm tắt mini tiệp màu theme */}
        <div className="grid grid-cols-3 gap-2 mt-3.5 pt-3.5 border-t border-gray-100 text-center">
          <div className="p-2.5 rounded-2xl bg-[#F8F9FA] border border-gray-100">
            <span className="text-[10px] font-semibold text-[#A7A9B4] block">Số tháng chốt</span>
            <strong className="text-xs font-black text-[#3D405B] mt-0.5 block">
              {pastMonthsSummaries.length} tháng
            </strong>
          </div>

          <div className="p-2.5 rounded-2xl bg-[#F8F9FA] border border-gray-100">
            <span className="text-[10px] font-semibold text-[#A7A9B4] block">Tháng có dư</span>
            <strong className="text-xs font-black text-[#58B880] mt-0.5 block">
              {monthsWithSurplusCount} tháng
            </strong>
          </div>

          <div className="p-2.5 rounded-2xl bg-[#F8F9FA] border border-gray-100">
            <span className="text-[10px] font-semibold text-[#A7A9B4] block">Dư cao nhất</span>
            <strong className="text-xs font-black text-[#3D405B] mt-0.5 block truncate">
              {bestMonth && bestMonth.remainingMonth > 0 ? formatVND(bestMonth.remainingMonth) : '0đ'}
            </strong>
          </div>
        </div>
      </div>

      {/* Danh sách các tháng trước */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-extrabold text-[#3D405B] text-sm">
            Chi tiết từng tháng đã qua ({pastMonthsSummaries.length})
          </h3>
          <span className="text-[11px] font-semibold text-[#A7A9B4]">Mới nhất trước</span>
        </div>

        {pastMonthsSummaries.length > 0 ? (
          <div className="space-y-2.5">
            {pastMonthsSummaries.map((item) => {
              const hasSurplus = item.remainingMonth > 0;

              return (
                <div
                  key={item.month.id}
                  className="bg-white rounded-[24px] p-4.5 cozy-card-shadow border border-gray-100 transition-all hover:border-[#6FCF97]/30"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-base">📅</span>
                      <span className="text-xs font-extrabold text-[#3D405B]">
                        {item.month.name}
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        hasSurplus
                          ? 'bg-[#EBF8F1] text-[#58B880] border-[#6FCF97]/20'
                          : 'bg-gray-100 text-gray-500 border-gray-200'
                      }`}
                    >
                      {hasSurplus ? 'Đã cộng vào quỹ' : 'Đã tiêu hết'}
                    </span>
                  </div>

                  {/* Số tiền dư tích lũy của tháng đó */}
                  <div className="p-3 rounded-2xl bg-[#F8F9FA] flex items-center justify-between my-2 border border-gray-100/80">
                    <div>
                      <span className="text-[10px] font-bold text-[#7A7D8C] block">
                        Số tiền dư chuyển tích lũy:
                      </span>
                      <div
                        className={`text-lg font-black ${
                          hasSurplus ? 'text-[#58B880]' : 'text-[#7A7D8C]'
                        }`}
                      >
                        {hasSurplus ? `+${formatVND(item.remainingMonth)}` : '0đ'}
                      </div>
                    </div>

                    <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-[#58B880] border border-gray-100 shadow-2xs">
                      {hasSurplus ? <Sparkles size={16} /> : <span className="text-sm">🍃</span>}
                    </div>
                  </div>

                  {/* Thông số thu chi của tháng đó */}
                  <div className="grid grid-cols-3 gap-2 text-[11px] pt-1">
                    <div>
                      <span className="text-[#A7A9B4] block">Thu ban đầu:</span>
                      <strong className="text-[#3D405B] font-bold">
                        {formatVND(item.initialMoney)}
                      </strong>
                    </div>

                    <div>
                      <span className="text-[#A7A9B4] block">Cố định:</span>
                      <strong className="text-[#FF7B7B] font-bold">
                        -{formatVND(item.totalFixed)}
                      </strong>
                    </div>

                    <div>
                      <span className="text-[#A7A9B4] block">Đã chi tiêu:</span>
                      <strong className="text-[#FF7B7B] font-bold">
                        -{formatVND(item.totalSpent)}
                      </strong>
                    </div>
                  </div>

                  {/* Nút xem chi tiết tháng nếu có handler */}
                  {onSelectMonth && (
                    <button
                      onClick={() => onSelectMonth(item.month.id)}
                      className="w-full mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-[#7A7D8C] hover:text-[#3D405B] transition-colors"
                    >
                      <span>Xem sổ chi tiêu tháng {item.month.monthNumber}</span>
                      <ChevronRight size={14} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-[28px] p-6 text-center cozy-card-shadow border border-gray-100 space-y-3">
            <div className="w-14 h-14 rounded-full bg-[#EBF8F1] flex items-center justify-center text-2xl mx-auto shadow-inner text-[#58B880]">
              🌱
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-[#3D405B]">
                Chưa có dữ liệu tích lũy từ tháng trước
              </h4>
              <p className="text-xs text-[#7A7D8C] mt-1.5 leading-relaxed max-w-[320px] mx-auto">
                Hiện tại bạn đang ở {currentActiveMonthName || 'tháng hiện tại'}. Khi chu kỳ tháng này kết thúc và bước sang tháng mới, toàn bộ số tiền còn dư chưa tiêu hết sẽ được tự động cộng dồn vào quỹ tích lũy này! 🌱
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
