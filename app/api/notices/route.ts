import { NextResponse } from 'next/server';
import { getAppDb } from '@/lib/app-db/db';

export async function GET() {
  const db = getAppDb();
  const notice = db.prepare(
    `SELECT id, title, content, created_at FROM notices WHERE is_active = 1 ORDER BY id DESC LIMIT 1`
  ).get() as { id: number; title: string; content: string; created_at: string } | undefined;
  return NextResponse.json({ notice: notice ?? null });
}
