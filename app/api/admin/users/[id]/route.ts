import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/adminAuth';
import { updateUser, deleteUser } from '@/lib/app-db/admin';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(req);
  if (auth.error) return auth.error;
  const { id } = await params;
  const body = await req.json();
  const updated = updateUser(Number(id), body);
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(req);
  if (auth.error) return auth.error;
  const { id } = await params;
  // 자기 자신은 삭제 불가
  if (auth.session!.userId === Number(id)) {
    return NextResponse.json({ error: '자신의 계정은 삭제할 수 없습니다' }, { status: 400 });
  }
  const ok = deleteUser(Number(id));
  return ok ? NextResponse.json({ ok: true }) : NextResponse.json({ error: '사용자를 찾을 수 없습니다' }, { status: 404 });
}
