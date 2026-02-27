import { NextRequest, NextResponse } from 'next/server';
import { verifySession, COOKIE_NAME } from '@/lib/auth/session';
import { getPosts, createPost } from '@/lib/app-db/board';

export async function GET(req: NextRequest) {
  const page = Number(req.nextUrl.searchParams.get('page') || 1);
  const data = getPosts(page);
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  const session = token ? await verifySession(token) : null;
  if (!session) return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 });

  const { title, content } = await req.json() as { title: string; content: string };
  if (!title?.trim() || !content?.trim()) {
    return NextResponse.json({ error: '제목과 내용을 입력해주세요' }, { status: 400 });
  }
  const post = createPost(session.userId, title.trim(), content.trim());
  return NextResponse.json(post, { status: 201 });
}
