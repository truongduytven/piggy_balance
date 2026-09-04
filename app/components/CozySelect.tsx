'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface SelectOption {
  value: string | number;
  label: string;
  icon?: string;
}

interface CozySelectProps {
  label?: string;
  value: string | number;
  options: SelectOption[];
  onChange: (value: any) => void;
  placeholder?: string;
  className?: string;
}

export const CozySelect: React.FC<CozySelectProps> = ({
  label,
  value,
  options,
  onChange,
  placeholder = 'Chọn...',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // Đóng dropdown khi bấm ra ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (val: string | number) => {
    onChange(val);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {label && (
        <label className="text-xs font-bold text-[#7A7D8C] block mb-1.5">
          {label}
        </label>
      )}

      {/* Button hiển thị giá trị hiện tại */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-[#F8F9FA] border rounded-2xl py-3 px-3.5 text-xs font-bold text-[#3D405B] flex items-center justify-between transition-all active:scale-99 ${
          isOpen
            ? 'border-[#6FCF97] bg-white ring-2 ring-[#6FCF97]/20'
            : 'border-gray-200 hover:border-gray-300'
        }`}
      >
        <div className="flex items-center gap-2 truncate">
          {selectedOption?.icon && <span>{selectedOption.icon}</span>}
          <span className="truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <ChevronDown
          size={16}
          className={`text-[#7A7D8C] shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-[#6FCF97]' : ''
          }`}
        />
      </button>

      {/* Menu dropdown custom nổi ngay bên dưới button */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-2xl border border-[#6FCF97]/20 dark:border-white/10 shadow-[0_12px_30px_rgba(61,64,91,0.12)] dark:shadow-[0_16px_36px_rgba(0,0,0,0.6)] p-1.5 z-50 max-h-52 overflow-y-auto animate-fade-in scrollbar-none">
          <div className="space-y-1">
            {options.map((option) => {
              const isSelected = option.value === value;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className={`w-full px-3 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-all ${
                    isSelected
                      ? 'bg-[#EBF8F1] text-[#58B880]'
                      : 'text-[#3D405B] hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    {option.icon && <span>{option.icon}</span>}
                    <span className="truncate">{option.label}</span>
                  </div>
                  {isSelected && <Check size={14} strokeWidth={2.5} />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
