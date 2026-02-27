import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/adminAuth';
import { getAdminUsers } from '@/lib/app-db/admin';

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (auth.error) return auth.error;
  const search = req.nextUrl.searchParams.get('search') || undefined;
  return NextResponse.json(getAdminUsers(search));
}
