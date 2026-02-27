import { NextRequest, NextResponse } from 'next/server';
import { verifySession, COOKIE_NAME } from '@/lib/auth/session';
import { getPost, deletePost } from '@/lib/app-db/board';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = getPost(Number(id));
  if (!post) return NextResponse.json({ error: '존재하지 않는 글입니다' }, { status: 404 });
  return NextResponse.json(post);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  const session = token ? await verifySession(token) : null;
  if (!session) return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 });

  const { id } = await params;
  const ok = deletePost(Number(id), session.userId, session.role);
  if (!ok) return NextResponse.json({ error: '삭제 권한이 없거나 글이 존재하지 않습니다' }, { status: 403 });
  return NextResponse.json({ ok: true });
}
