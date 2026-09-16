export interface RoastInfo {
  level: 'safe' | 'moderate' | 'warning' | 'over';
  title: string;
  message: string;
  emoji: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
}

/**
 * Tạo câu nhắc nhở / cảnh báo xéo xắt, hài hước khi chi tiêu
 * Không tục tĩu nhưng cực kỳ duyên và thức tỉnh người dùng!
 */
export function getSpendingRoast(
  percentSpent: number,
  spent: number,
  remaining: number
): RoastInfo {
  if (percentSpent > 100 || remaining < 0) {
    const overRoasts = [
      'Ủa rồi tuần sau ăn không khí uống nước lã hả bạn ơi?! Cháy túi rồi kìa! 💸',
      'Tiêu như chưa từng được tiêu vậy! Nhịn ăn trừ bữa tuần sau đi chứ còn gì nữa 🥲',
      'Ví khóc thét rồi đại gia ơi! Bớt quẹt thẻ mua sắm lại giùm một cái! 💀',
      'Sài tiền như lá mít thế này thì chuẩn bị tinh thần húp mì tôm nha! 🍜',
      'Lố ngân sách rồi kìa má! Ví rỗng tuếch rồi còn định tiêu tiếp nữa hả? 🤦‍♂️',
    ];
    const idx = Math.abs(Math.round(Math.abs(remaining) / 50000)) % overRoasts.length;
    return {
      level: 'over',
      title: 'Cháy túi rồi đại gia ơi!',
      message: overRoasts[idx],
      emoji: '💀',
      badgeBg: 'bg-[#FFEAEA]',
      badgeText: 'text-[#FF7B7B]',
      badgeBorder: 'border-[#FF7B7B]/30',
    };
  }

  if (percentSpent >= 80) {
    const warningRoasts = [
      'Báo động đỏ: Sắp cháy ví rồi, tém tém cái nết mua sắm lại ngay! 👀',
      'Bàn tay vàng trong làng tiêu tiền, sắp chạm đáy rồi đấy tỉnh táo lại đi! 🚨',
      'Tiêu vừa vừa thôi má ơi, còn mấy ngày nữa mới sang tuần mới đó! 😱',
      'Đèn vàng nhấp nháy rồi! Định biến cái ví thành sa mạc hoang vu hả? 🌵',
      'Ví đang thở oxy rồi, làm ơn từ chối mọi kèo trà sữa giùm cái! 🧋',
    ];
    const idx = Math.abs(Math.round(percentSpent)) % warningRoasts.length;
    return {
      level: 'warning',
      title: 'Báo động: Sắp cạn ví!',
      message: warningRoasts[idx],
      emoji: '🚨',
      badgeBg: 'bg-[#FFF8E7]',
      badgeText: 'text-[#E5A800]',
      badgeBorder: 'border-[#FFD166]/40',
    };
  }

  if (percentSpent >= 50) {
    const moderateRoasts = [
      'Mới nửa tuần mà bay hơn nửa tiền rồi, phanh gấp lại giùm cái đi! 🛑',
      'Nhìn lại ví đi bạn trẻ, tốc độ tiêu tiền còn nhanh hơn người yêu cũ trở mặt! 📉',
      'Tiền chứ có phải lá mít đâu mà tiêu hăng say thế, kìm chế lại! 🤨',
      'Đã bay nửa ngân sách tuần rồi, đi đứng mua sắm cẩn thận kẻo rỗng túi! ⚠️',
    ];
    const idx = Math.abs(Math.round(percentSpent)) % moderateRoasts.length;
    return {
      level: 'moderate',
      title: 'Đang tiêu hơi nhanh nha!',
      message: moderateRoasts[idx],
      emoji: '👀',
      badgeBg: 'bg-[#EEF8FC]',
      badgeText: 'text-[#0096C7]',
      badgeBorder: 'border-[#8ECAE6]/40',
    };
  }

  const safePraises = [
    'Ví vẫn thở khỏe re! Khen nhẹ một câu vì sự kiềm chế siêu đẳng này ✨',
    'Được của nó đấy! Cứ giữ cái nết tiết kiệm này thì sớm thành đại gia thôi 🐷',
    'Ngoan lắm, chi tiêu biết nghĩ cho tương lai đấy. Tiếp tục phát huy nhé! 🌱',
    'Tiến độ rất đẹp! Bạn đang làm chủ đồng tiền của mình cực kỳ chuẩn chỉ 👏',
  ];
  const idx = Math.abs(Math.round(percentSpent + spent)) % safePraises.length;
  return {
    level: 'safe',
    title: 'Đang kiểm soát rất tốt!',
    message: safePraises[idx],
    emoji: '🌱',
    badgeBg: 'bg-[#EBF8F1]',
    badgeText: 'text-[#58B880]',
    badgeBorder: 'border-[#6FCF97]/25',
  };
}
