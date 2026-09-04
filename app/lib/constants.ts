import { CategoryMeta, ExpenseCategory } from '../types/finance';

export const CATEGORIES: Record<ExpenseCategory, CategoryMeta> = {
  food: {
    id: 'food',
    name: 'Ăn uống',
    icon: '🍜',
    color: '#FF9F43',
    bgColor: '#FFF0E0',
  },
  transport: {
    id: 'transport',
    name: 'Di chuyển',
    icon: '🚌',
    color: '#00D2D3',
    bgColor: '#E0F9F9',
  },
  shopping: {
    id: 'shopping',
    name: 'Mua sắm',
    icon: '🛍️',
    color: '#FF6B8B',
    bgColor: '#FFEBF0',
  },
  entertainment: {
    id: 'entertainment',
    name: 'Giải trí',
    icon: '🎮',
    color: '#9C88FF',
    bgColor: '#F0EDFF',
  },
  bills: {
    id: 'bills',
    name: 'Cố định/Hóa đơn',
    icon: '💡',
    color: '#FFA502',
    bgColor: '#FFF5E5',
  },
  other: {
    id: 'other',
    name: 'Khác',
    icon: '📦',
    color: '#747D8C',
    bgColor: '#F1F2F6',
  },
};

export const WALLETS = ['Ví chính', 'Ví Cozy', 'Thẻ Visa', 'Tiền mặt'];
