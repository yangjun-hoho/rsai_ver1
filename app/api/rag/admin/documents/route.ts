import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import { ragDb } from '@/lib/rag/db';
import { invalidateCache } from '@/lib/rag/vectorCache';

// GET /api/rag/admin/documents?categoryId=xxx
export async function GET(request: NextRequest) {
  const categoryId = request.nextUrl.searchParams.get('categoryId');
  if (!categoryId) return NextResponse.json({ error: 'categoryId 필요' }, { status: 400 });

  try {
    const documents = ragDb.getDocuments(categoryId);
    return NextResponse.json({ documents });
  } catch (error) {
    console.error('[rag/documents GET]', error);
    return NextResponse.json({ error: '문서 조회 실패' }, { status: 500 });
  }
}

// DELETE /api/rag/admin/documents?id=xxx
export async function DELETE(request: NextRequest) {
  const id = request.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id 필요' }, { status: 400 });

  try {
    const doc = ragDb.getDocument(id);
    if (!doc) return NextResponse.json({ error: '문서를 찾을 수 없습니다.' }, { status: 404 });

    // 원본 파일 삭제
    if (fs.existsSync(doc.file_path)) fs.unlinkSync(doc.file_path);

    // DB 삭제 (chunks는 CASCADE 삭제)
    ragDb.deleteDocument(id);

    // 벡터 캐시 무효화
    invalidateCache(doc.category_id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[rag/documents DELETE]', error);
    return NextResponse.json({ error: '문서 삭제 실패' }, { status: 500 });
  }
}
