import { NextRequest, NextResponse } from 'next/server';
import { verifySession, COOKIE_NAME } from '@/lib/auth/session';

const PROTECTED = ['/board', '/my', '/api/board', '/api/my'];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isProtected = PROTECTED.some(p => pathname.startsWith(p));
  if (!isProtected) return NextResponse.next();

  const token = req.cookies.get(COOKIE_NAME)?.value;
  const session = token ? await verifySession(token) : null;

  if (!session) {
    // API 요청이면 401 반환
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 });
    }
    // 페이지 요청이면 로그인 페이지로
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/board/:path*', '/my/:path*', '/api/board/:path*', '/api/my/:path*'],
};
