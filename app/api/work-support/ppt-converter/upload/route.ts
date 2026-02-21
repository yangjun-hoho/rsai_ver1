import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: '파일을 업로드해주세요.' }, { status: 400 });
    }

    const fileName = file.name.toLowerCase();
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let extractedText = '';

    if (fileName.endsWith('.txt')) {
      extractedText = buffer.toString('utf-8');
    } else if (fileName.endsWith('.pdf')) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const pdfParse = require('pdf-parse');
        const pdfData = await pdfParse(buffer);
        extractedText = pdfData.text;
      } catch (err) {
        console.error('[PDF parse error]', err);
        return NextResponse.json({ error: 'PDF 파일 처리 중 오류가 발생했습니다.' }, { status: 500 });
      }
    } else if (fileName.endsWith('.docx')) {
      try {
        const mammoth = await import('mammoth');
        const result = await mammoth.extractRawText({ buffer });
        extractedText = result.value;
      } catch (err) {
        console.error('[DOCX parse error]', err);
        return NextResponse.json({ error: 'DOCX 파일 처리 중 오류가 발생했습니다.' }, { status: 500 });
      }
    } else {
      return NextResponse.json(
        { error: 'TXT, PDF, DOCX 파일만 지원합니다.' },
        { status: 400 }
      );
    }

    if (!extractedText.trim()) {
      return NextResponse.json({ error: '파일에서 텍스트를 추출할 수 없습니다.' }, { status: 400 });
    }

    return NextResponse.json({
      text: extractedText.trim(),
      fileName: file.name,
      fileSize: file.size,
    });
  } catch (error) {
    console.error('[ppt-converter upload API error]', error);
    return NextResponse.json({ error: '파일 업로드 처리 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
