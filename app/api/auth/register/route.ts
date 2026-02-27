import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { createUser, findUserByNickname } from '@/lib/app-db/users';
import { signSession, COOKIE_NAME } from '@/lib/auth/session';

export async function POST(req: NextRequest) {
  try {
    const { nickname, password } = await req.json() as { nickname: string; password: string };

    if (!nickname?.trim() || !password?.trim()) {
      return NextResponse.json({ error: '별칭과 비밀번호를 입력해주세요' }, { status: 400 });
    }
    if (nickname.trim().length < 2 || nickname.trim().length > 20) {
      return NextResponse.json({ error: '별칭은 2~20자 사이여야 합니다' }, { status: 400 });
    }
    if (password.length < 4) {
      return NextResponse.json({ error: '비밀번호는 4자 이상이어야 합니다' }, { status: 400 });
    }
    if (findUserByNickname(nickname.trim())) {
      return NextResponse.json({ error: '이미 사용 중인 별칭입니다' }, { status: 409 });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = createUser(nickname.trim(), hashed);
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
