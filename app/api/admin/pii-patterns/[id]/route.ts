import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/adminAuth';
import { updatePiiPattern, deletePiiPattern } from '@/lib/app-db/pii-patterns';
import { invalidatePiiCache } from '@/lib/security/piiFilter';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(req);
  if (auth.error) return auth.error;
  const { id } = await params;
  const body = await req.json();
  if (body.regex) {
    try { new RegExp(body.regex); } catch {
      return NextResponse.json({ error: '유효하지 않은 정규식입니다' }, { status: 400 });
    }
  }
  const updated = updatePiiPattern(Number(id), body);
  invalidatePiiCache();
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(req);
  if (auth.error) return auth.error;
  const { id } = await params;
  const ok = deletePiiPattern(Number(id));
  invalidatePiiCache();
  return ok ? NextResponse.json({ ok: true }) : NextResponse.json({ error: '패턴을 찾을 수 없습니다' }, { status: 404 });
}
