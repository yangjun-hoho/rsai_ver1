import { NextRequest, NextResponse } from 'next/server';
import { verifySession, COOKIE_NAME } from '@/lib/auth/session';

export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return NextResponse.json({ user: null });
  const session = await verifySession(token);
  if (!session) return NextResponse.json({ user: null });
  return NextResponse.json({ user: { id: session.userId, nickname: session.nickname, role: session.role } });
}
