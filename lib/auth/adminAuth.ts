import { NextRequest, NextResponse } from 'next/server';
import { verifySession, COOKIE_NAME } from './session';

export async function requireAdmin(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  const session = token ? await verifySession(token) : null;
  if (!session) return { error: NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 }) };
  if (session.role !== 'admin') return { error: NextResponse.json({ error: '관리자 권한이 필요합니다' }, { status: 403 }) };
  return { session };
}
