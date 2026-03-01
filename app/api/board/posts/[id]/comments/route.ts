import { NextRequest, NextResponse } from 'next/server';
import { verifySession, COOKIE_NAME } from '@/lib/auth/session';
import { getComments, createComment, getPost } from '@/lib/app-db/board';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const postId = Number(id);
  const post = getPost(postId);
  if (!post) return NextResponse.json({ error: '존재하지 않는 글입니다' }, { status: 404 });
  return NextResponse.json(getComments(postId));
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  const session = token ? await verifySession(token) : null;
  if (!session) return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 });

  const { id } = await params;
  const postId = Number(id);
  const post = getPost(postId);
  if (!post) return NextResponse.json({ error: '존재하지 않는 글입니다' }, { status: 404 });

  const { content } = await req.json() as { content: string };
  if (!content?.trim()) return NextResponse.json({ error: '댓글 내용을 입력해주세요' }, { status: 400 });

  const comment = createComment(postId, session.nickname, content.trim());
  return NextResponse.json(comment, { status: 201 });
}
