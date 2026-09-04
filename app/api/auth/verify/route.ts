import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { password } = body;

    const expectedPassword = process.env.PASSWORD_KEY || 'Congchua1802';

    if (!password || password.trim() !== expectedPassword.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: 'Mật khẩu chưa chính xác rồi bạn ơi 🥺 Thử lại nha!',
        },
        { status: 401 }
      );
    }

    // Session hợp lệ 1 ngày (24h = 86,400,000ms)
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000;

    return NextResponse.json({
      success: true,
      message: 'Mở khóa sổ tay thành công 🌱',
      expiresAt,
    });
  } catch (error) {
    console.error('Lỗi xác thực mật khẩu:', error);
    return NextResponse.json(
      { success: false, message: 'Đã có lỗi xảy ra khi xác thực' },
      { status: 500 }
    );
  }
}
