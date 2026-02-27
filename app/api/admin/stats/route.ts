import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/adminAuth';
import { getStats } from '@/lib/app-db/admin';

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (auth.error) return auth.error;
  return NextResponse.json(getStats());
}
