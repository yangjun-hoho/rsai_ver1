import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/adminAuth';
import { updatePost, adminDeletePost } from '@/lib/app-db/admin';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(req);
  if (auth.error) return auth.error;
  const { id } = await params;
  const body = await req.json();
  const updated = updatePost(Number(id), body);
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(req);
  if (auth.error) return auth.error;
  const { id } = await params;
  const ok = adminDeletePost(Number(id));
  return ok ? NextResponse.json({ ok: true }) : NextResponse.json({ error: '게시글을 찾을 수 없습니다' }, { status: 404 });
}
