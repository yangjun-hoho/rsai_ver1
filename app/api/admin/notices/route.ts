import { NextRequest, NextResponse } from 'next/server';
import { getAppDb } from '@/lib/app-db/db';

interface Notice { id: number; title: string; content: string; is_active: number; created_at: string; }

export async function GET() {
  const db = getAppDb();
  const notices = db.prepare(
    `SELECT id, title, content, is_active, created_at FROM notices ORDER BY id DESC`
  ).all() as Notice[];
  return NextResponse.json({ notices });
}

export async function POST(req: NextRequest) {
  const { title, content } = await req.json() as { title: string; content: string };
  if (!title?.trim() || !content?.trim()) {
    return NextResponse.json({ error: '제목과 내용을 입력하세요.' }, { status: 400 });
  }
  const db = getAppDb();
  const result = db.prepare(
    `INSERT INTO notices (title, content) VALUES (?, ?) RETURNING id`
  ).get(title.trim(), content.trim()) as { id: number };
  return NextResponse.json({ id: result.id });
}
