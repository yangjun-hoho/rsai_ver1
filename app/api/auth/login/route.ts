import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { findUserByNickname } from '@/lib/app-db/users';
import { signSession, COOKIE_NAME } from '@/lib/auth/session';

export async function POST(req: NextRequest) {
  try {
    const { nickname, password } = await req.json() as { nickname: string; password: string };

    const user = findUserByNickname(nickname?.trim());
    if (!user) {
      return NextResponse.json({ error: '별칭 또는 비밀번호가 올바르지 않습니다' }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return NextResponse.json({ error: '별칭 또는 비밀번호가 올바르지 않습니다' }, { status: 401 });
    }

    const token = await signSession({ userId: user.id, nickname: user.nickname, role: user.role });
    const res = NextResponse.json({ id: user.id, nickname: user.nickname, role: user.role });
    res.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });
    return res;
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 });
  }
}
