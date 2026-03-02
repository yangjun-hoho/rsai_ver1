import { NextRequest, NextResponse } from 'next/server';
import { getAppDb } from '@/lib/app-db/db';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json() as { title?: string; content?: string; is_active?: number };
  const db = getAppDb();

  if (body.is_active !== undefined) {
    db.prepare(`UPDATE notices SET is_active = ? WHERE id = ?`).run(body.is_active, id);
  } else {
    if (!body.title?.trim() || !body.content?.trim()) {
      return NextResponse.json({ error: '제목과 내용을 입력하세요.' }, { status: 400 });
    }
    db.prepare(`UPDATE notices SET title = ?, content = ? WHERE id = ?`).run(
      body.title.trim(), body.content.trim(), id
    );
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getAppDb();
  db.prepare(`DELETE FROM notices WHERE id = ?`).run(id);
  return NextResponse.json({ ok: true });
}
