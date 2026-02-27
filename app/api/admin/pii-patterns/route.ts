import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/adminAuth';
import { getPiiPatterns, createPiiPattern } from '@/lib/app-db/pii-patterns';
import { invalidatePiiCache } from '@/lib/security/piiFilter';

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (auth.error) return auth.error;
  return NextResponse.json(getPiiPatterns());
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (auth.error) return auth.error;
  const { type, regex, hint } = await req.json();
  if (!type || !regex || !hint) return NextResponse.json({ error: '모든 필드를 입력해주세요' }, { status: 400 });
  // 정규식 유효성 검사
  try { new RegExp(regex); } catch {
    return NextResponse.json({ error: '유효하지 않은 정규식입니다' }, { status: 400 });
  }
  const pattern = createPiiPattern(type, regex, hint);
  invalidatePiiCache();
  return NextResponse.json(pattern, { status: 201 });
}
