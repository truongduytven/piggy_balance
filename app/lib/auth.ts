import crypto from 'crypto';
import { cookies } from 'next/headers';

export interface AuthUser {
  id: string;
  username: string;
  displayName: string;
}

interface JWTPayload extends AuthUser {
  iat: number;
  exp: number;
}

export const AUTH_COOKIE_NAME = 'cozy_auth_token';
export const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60; // 7 ngày (1 tuần)

const SECRET = process.env.JWT_SECRET || process.env.PASSWORD_KEY || 'cozy_money_secret_key_7_days_session';

function base64UrlEncode(str: string): string {
  return Buffer.from(str)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return Buffer.from(base64, 'base64').toString('utf8');
}

/**
 * Tạo token ký HMAC-SHA256 có hiệu lực 7 ngày (1 tuần)
 */
export function signAuthToken(user: AuthUser): string {
  const now = Math.floor(Date.now() / 1000);
  const exp = now + SESSION_MAX_AGE_SECONDS;

  const header = { alg: 'HS256', typ: 'JWT' };
  const payload: JWTPayload = {
    ...user,
    iat: now,
    exp,
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));

  const signature = crypto
    .createHmac('sha256', SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

/**
 * Xác thực token HMAC-SHA256
 */
export function verifyAuthToken(token: string): AuthUser | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [encodedHeader, encodedPayload, signature] = parts;

    const expectedSignature = crypto
      .createHmac('sha256', SECRET)
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

    // So sánh chữ ký an toàn tránh timing attack
    const sigBuf = Buffer.from(signature);
    const expBuf = Buffer.from(expectedSignature);
    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      return null;
    }

    const payload: JWTPayload = JSON.parse(base64UrlDecode(encodedPayload));
    const now = Math.floor(Date.now() / 1000);

    // Kiểm tra hết hạn (sau 7 ngày)
    if (payload.exp && payload.exp < now) {
      return null;
    }

    return {
      id: payload.id,
      username: payload.username,
      displayName: payload.displayName || payload.username,
    };
  } catch {
    return null;
  }
}

/**
 * Lấy thông tin user đăng nhập từ Request (Cookie hoặc Header Authorization)
 */
export async function getAuthUserFromRequest(request?: Request): Promise<AuthUser | null> {
  // 1. Kiểm tra header Authorization: Bearer <token>
  if (request) {
    const authHeader = request.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7).trim();
      const user = verifyAuthToken(token);
      if (user) return user;
    }

    // 2. Kiểm tra Cookie từ header request
    const cookieHeader = request.headers.get('cookie');
    if (cookieHeader) {
      const cookiesArr = cookieHeader.split(';');
      for (const c of cookiesArr) {
        const [k, v] = c.trim().split('=');
        if (k === AUTH_COOKIE_NAME && v) {
          const user = verifyAuthToken(decodeURIComponent(v));
          if (user) return user;
        }
      }
    }
  }

  // 3. Sử dụng next/headers cookies() nếu không có request header
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    if (token) {
      return verifyAuthToken(token);
    }
  } catch {}

  return null;
}
