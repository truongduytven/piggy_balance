import { ExpenseCategory } from '../types/finance';

export type AIIntent =
  | 'CHECK_WEEKLY_REMAINING'
  | 'CHECK_WEEKLY_BUDGET'
  | 'CHECK_MONTHLY_SPENT'
  | 'CHECK_FIXED_EXPENSES'
  | 'CHECK_MONTHLY_SUMMARY'
  | 'CONSULT_PURCHASE'
  | 'HELP'
  | 'GREETING'
  | 'ADD_EXPENSE'
  | 'AMBIGUOUS_AMOUNT'
  | 'UNKNOWN';

export interface ParsedExpenseData {
  amount: number;
  category: ExpenseCategory;
  description: string;
}

export interface ConsultPurchaseData {
  item: string;
  amount: number;
  category: ExpenseCategory;
}

export interface AIParsedResult {
  intent: AIIntent;
  confidence: number;
  expenseData?: ParsedExpenseData;
  consultData?: ConsultPurchaseData;
  rawText: string;
}

// Từ điển ánh xạ từ khóa tiếng Việt sang danh mục
const CATEGORY_KEYWORDS: Record<ExpenseCategory, string[]> = {
  food: [
    'ăn', 'uống', 'sáng', 'trưa', 'tối', 'cơm', 'phở', 'bún', 'bánh mì',
    'cà phê', 'cafe', 'cf', 'trà sữa', 'đồ ăn', 'nước', 'sinh tố', 'lẩu',
    'nướng', 'snack', 'chè', 'pizza', 'gà rán', 'mì gói',
  ],
  transport: [
    'grab', 'taxi', 'be', 'gojek', 'xe', 'xăng', 'bus', 'buýt',
    'gửi xe', 'vé xe', 'rửa xe', 'di chuyển', 'tàu', 'máy bay',
  ],
  shopping: [
    'mua', 'áo', 'quần', 'giày', 'dép', 'đồ', 'sắm', 'shopee',
    'lazada', 'tiki', 'tiktok', 'mỹ phẩm', 'son', 'sách', 'túi', 'balo',
    'tai nghe', 'chuột', 'bàn phím', 'máy tính', 'điện thoại', 'loa',
    'đồng hồ', 'nồi', 'quạt', 'đèn',
  ],
  entertainment: [
    'game', 'chơi', 'đi chơi', 'phim', 'netflix', 'cinema', 'rạp',
    'karaoke', 'du lịch', 'xem phim', 'bar', 'pub', 'steam', 'playstation',
  ],
  bills: [
    'điện', 'nước', 'internet', 'wifi', 'điện thoại', 'tiền nhà',
    'thuê nhà', 'nạp thẻ', '4g', 'phí quản lý', 'rác',
  ],
  other: [],
};

/**
 * Trích xuất và chuẩn hóa số tiền tiếng Việt sang number
 * Hỗ trợ: 1tr2, 2tr5, 50k, 50K, 50.000, 50,000, 50000, 1tr, 1 triệu, 1.5tr, 1.5 triệu, 70 ngàn, 70 nghìn
 */
export function parseAmount(text: string): { amount: number; matchedText: string } | null {
  const clean = text.toLowerCase().trim();

  // Pattern 1: Dạng ghép triệu + số lẻ (vd: 1tr2 = 1.200.000, 2tr5 = 2.500.000, 1 triệu 2 = 1.200.000, 1tr250 = 1.250.000)
  const compoundMillionMatch = clean.match(/(\d+)\s*(?:tr|triệu|trieu)\s*(\d{1,3})\b/i);
  if (compoundMillionMatch) {
    const mainMillion = parseInt(compoundMillionMatch[1], 10);
    const fractionStr = compoundMillionMatch[2];
    let fractionNum = parseInt(fractionStr, 10);
    if (fractionStr.length === 1) fractionNum *= 100_000;
    else if (fractionStr.length === 2) fractionNum *= 10_000;
    else if (fractionStr.length === 3) fractionNum *= 1_000;

    return {
      amount: mainMillion * 1_000_000 + fractionNum,
      matchedText: compoundMillionMatch[0],
    };
  }

  // Pattern 2: Triệu / tr (vd: 1.5tr, 1,5tr, 1.5 triệu, 2tr, 2 triệu)
  const millionMatch = clean.match(/(\d+(?:[.,]\d+)?)\s*(?:tr|triệu|trieu)\b/i);
  if (millionMatch) {
    const num = parseFloat(millionMatch[1].replace(',', '.'));
    if (!isNaN(num)) {
      return {
        amount: Math.round(num * 1_000_000),
        matchedText: millionMatch[0],
      };
    }
  }

  // Pattern 3: k / ngàn / nghìn (vd: 50k, 100k, 70 ngàn, 70 nghìn, 50.5k)
  const thousandMatch = clean.match(/(\d+(?:[.,]\d+)?)\s*(?:k|ngàn|nghin|nghìn)\b/i);
  if (thousandMatch) {
    const num = parseFloat(thousandMatch[1].replace(',', '.'));
    if (!isNaN(num)) {
      return {
        amount: Math.round(num * 1_000),
        matchedText: thousandMatch[0],
      };
    }
  }

  // Pattern 4: Số phân cách dấu chấm/phẩy (vd: 50.000, 50,000, 1.500.000, 100000)
  const standardNumberMatch = clean.match(/\b(\d{1,3}(?:[.,]\d{3})+|\d{4,9})\s*(?:đ|vnd|dong|đồng)?\b/i);
  if (standardNumberMatch) {
    const rawDigits = standardNumberMatch[1].replace(/[.,]/g, '');
    const num = parseInt(rawDigits, 10);
    if (!isNaN(num) && num > 0) {
      return {
        amount: num,
        matchedText: standardNumberMatch[0],
      };
    }
  }

  return null;
}

/**
 * Nhận diện danh mục dựa vào từ điển từ khóa
 */
export function parseCategory(text: string): ExpenseCategory {
  const clean = text.toLowerCase();
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS) as [ExpenseCategory, string[]][]) {
    for (const kw of keywords) {
      // Tìm từ khóa nguyên từ hoặc có ranh giới
      const regex = new RegExp(`(^|\\s)${kw}(\\s|$)`, 'i');
      if (regex.test(clean) || clean.includes(kw)) {
        return category;
      }
    }
  }
  return 'other';
}

/**
 * Tạo mô tả ngắn gọn sạch đẹp cho khoản chi
 */
export function generateDescription(
  text: string,
  category: ExpenseCategory,
  amountText: string
): string {
  let desc = text
    .replace(new RegExp(amountText, 'gi'), '')
    .replace(/\b(chi|tiêu|mua|hết|khoản|tiền|cho|vào)\b/gi, '')
    .trim();

  // Làm sạch các dấu câu thừa
  desc = desc.replace(/^[-:,\s]+|[-:,\s]+$/g, '');

  if (desc.length >= 2) {
    // Viết hoa chữ cái đầu
    return desc.charAt(0).toUpperCase() + desc.slice(1);
  }

  // Dự phòng theo danh mục
  switch (category) {
    case 'food':
      return 'Ăn uống';
    case 'transport':
      return 'Di chuyển';
    case 'shopping':
      return 'Mua sắm';
    case 'entertainment':
      return 'Giải trí';
    case 'bills':
      return 'Chi phí hóa đơn';
    default:
      return 'Chi tiêu cá nhân';
  }
}

/**
 * Bộ xử lý Intent kết hợp Parser
 */
export function parseAIIntent(rawText: string): AIParsedResult {
  const text = rawText.trim().toLowerCase();

  // 1. Kiểm tra các câu lệnh cố định phổ biến
  if (
    text.includes('tuần này còn bao nhiêu') ||
    text.includes('còn bao nhiêu tuần này') ||
    text.includes('còn bao nhiêu tiền') ||
    text === 'còn bao nhiêu'
  ) {
    return { intent: 'CHECK_WEEKLY_REMAINING', confidence: 1.0, rawText };
  }

  if (
    text.includes('ngân sách tuần') ||
    text.includes('hạn mức tuần') ||
    text === 'ngân sách'
  ) {
    return { intent: 'CHECK_WEEKLY_BUDGET', confidence: 1.0, rawText };
  }

  if (
    text.includes('tháng này đã tiêu bao nhiêu') ||
    text.includes('đã tiêu bao nhiêu') ||
    text.includes('tiêu bao nhiêu tháng này')
  ) {
    return { intent: 'CHECK_MONTHLY_SPENT', confidence: 1.0, rawText };
  }

  if (
    text.includes('chi phí cố định') ||
    text.includes('khoản cố định') ||
    text.includes('cố định')
  ) {
    return { intent: 'CHECK_FIXED_EXPENSES', confidence: 1.0, rawText };
  }

  if (
    text === 'tháng này' ||
    text.includes('tổng quan tháng') ||
    text.includes('tình hình tháng')
  ) {
    return { intent: 'CHECK_MONTHLY_SUMMARY', confidence: 0.95, rawText };
  }

  if (
    text.includes('giúp tôi') ||
    text.includes('hướng dẫn') ||
    text.includes('làm được gì') ||
    text === 'help' ||
    text === '?'
  ) {
    return { intent: 'HELP', confidence: 1.0, rawText };
  }

  if (
    text === 'hi' ||
    text === 'hello' ||
    text.includes('xin chào') ||
    text.includes('chào cozy') ||
    text.includes('chào piggy')
  ) {
    return { intent: 'GREETING', confidence: 0.9, rawText };
  }

  // 2. Kiểm tra câu hỏi tư vấn mua sắm: "Tôi có nên mua không?"
  const isConsultQuestion =
    text.includes('được không') ||
    text.includes('được ko') ||
    text.includes('được k') ||
    text.includes('ổn không') ||
    text.includes('ổn ko') ||
    text.includes('có nên') ||
    text.includes('nên mua') ||
    text.includes('tính mua') ||
    text.includes('định mua') ||
    text.includes('muốn mua') ||
    text.includes('hợp lý không') ||
    text.includes('hợp lí không');

  const parsedAmount = parseAmount(text);

  if (isConsultQuestion && parsedAmount) {
    // Tách và làm sạch từ khóa theo từ nguyên vẹn
    let rawItem = text.replace(new RegExp(parsedAmount.matchedText, 'gi'), '');
    rawItem = rawItem.replace(/[?!,.:;]+/g, ' ');

    const stopWordSet = new Set([
      'cozy', 'piggy', 'ơi', 'à', 'ạ', 'nhỉ', 'ta', 'nè', 'hả', 'vậy', 'nào', 'giùm', 'hộ',
      'có', 'nên', 'tính', 'định', 'muốn', 'hỏi', 'xem', 'mua', 'sắm', 'tậu', 'chi', 'cho',
      'được', 'không', 'ko', 'k', 'ổn', 'hợp', 'lý', 'lí'
    ]);

    const remainingTokens = rawItem
      .split(/\s+/)
      .filter((token) => token && !stopWordSet.has(token.toLowerCase()));

    let item = remainingTokens.join(' ').trim();

    if (item.length >= 2) {
      item = item.charAt(0).toUpperCase() + item.slice(1);
    } else {
      item = 'Món đồ này';
    }

    const category = parseCategory(text);

    return {
      intent: 'CONSULT_PURCHASE',
      confidence: 0.98,
      consultData: {
        item,
        amount: parsedAmount.amount,
        category,
      },
      rawText,
    };
  }

  // 3. Phân tích khoản chi: kiểm tra xem có số tiền hay không
  if (parsedAmount) {
    // Nếu chỉ có đúng mỗi số tiền (ví dụ người dùng gõ "50k" hoặc "100000")
    const words = text.split(/\s+/).filter(Boolean);
    const isOnlyAmount =
      words.length <= 2 &&
      text.replace(parsedAmount.matchedText, '').trim().length === 0;

    if (isOnlyAmount) {
      return {
        intent: 'AMBIGUOUS_AMOUNT',
        confidence: 0.85,
        expenseData: {
          amount: parsedAmount.amount,
          category: 'other',
          description: 'Khoản chi',
        },
        rawText,
      };
    }

    // Có số tiền và có mô tả hoặc hành động chi tiêu
    const category = parseCategory(text);
    const description = generateDescription(text, category, parsedAmount.matchedText);

    return {
      intent: 'ADD_EXPENSE',
      confidence: 0.95,
      expenseData: {
        amount: parsedAmount.amount,
        category,
        description,
      },
      rawText,
    };
  }

  return { intent: 'UNKNOWN', confidence: 0.2, rawText };
}
