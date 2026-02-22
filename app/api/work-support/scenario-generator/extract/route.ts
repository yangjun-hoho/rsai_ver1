import { NextRequest } from 'next/server';
// @ts-expect-error: pdf-parse does not have type definitions
import pdfParse from 'pdf-parse';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return Response.json({ error: '파일이 없습니다.' }, { status: 400 });
    }

    const allowedTypes = ['application/pdf', 'text/plain'];
    if (!allowedTypes.includes(file.type)) {
      return Response.json({ error: 'PDF 또는 TXT 파일만 업로드 가능합니다.' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let text = '';

    if (file.type === 'text/plain') {
      text = buffer.toString('utf-8');
    } else {
      // PDF 파싱
      const parsed = await pdfParse(buffer);
      text = parsed.text;
    }

    // 빈 텍스트 처리
    if (!text.trim()) {
      return Response.json({ error: '파일에서 텍스트를 추출할 수 없습니다.' }, { status: 422 });
    }

    return Response.json({ text: text.trim() });
  } catch (error) {
    console.error('[extract route error]', error);
    return Response.json({ error: '파일 처리 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
