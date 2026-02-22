import { NextRequest, NextResponse } from 'next/server';

interface Slide {
  slideNumber: number;
  type: string;
  title: string;
  subtitle?: string;
  content: string;
  bulletPoints: string[];
  notes?: string;
}

const TPL = { bg: 'FFFFFF', accent: '2563EB', titleColor: '1E40AF', contentColor: '374151', font: 'Arial' };

export async function POST(request: NextRequest) {
  try {
    const { slides, title = '프레젠테이션' } = await request.json() as {
      slides: Slide[];
      title: string;
    };

    if (!slides?.length) {
      return NextResponse.json({ error: '슬라이드 데이터가 없습니다.' }, { status: 400 });
    }

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const PptxGenJS = require('pptxgenjs');
    const pptx = new PptxGenJS();

    pptx.layout = 'LAYOUT_WIDE';
    pptx.title = title;
    pptx.author = 'ARES AI';

    for (const slide of slides) {
      const pSlide = pptx.addSlide();
      pSlide.background = { color: TPL.bg };

      // 상단 accent bar
      pSlide.addShape(pptx.ShapeType.rect, {
        x: 0, y: 0, w: '100%', h: 0.12,
        fill: { color: TPL.accent },
        line: { type: 'none' },
      });

      if (slide.type === 'title') {
        pSlide.background = { color: TPL.accent };
        pSlide.addText(slide.title, {
          x: 0.8, y: 1.8, w: 8.4, h: 1.2,
          fontSize: 36, bold: true, color: 'FFFFFF',
          fontFace: TPL.font, align: 'center',
        });
        if (slide.subtitle) {
          pSlide.addText(slide.subtitle, {
            x: 0.8, y: 3.2, w: 8.4, h: 0.7,
            fontSize: 20, color: 'FFFFFFCC',
            fontFace: TPL.font, align: 'center',
          });
        }
      } else if (slide.type === 'index') {
        pSlide.addText('목차', {
          x: 0.5, y: 0.3, w: 9, h: 0.7,
          fontSize: 28, bold: true, color: TPL.titleColor, fontFace: TPL.font,
        });
        slide.bulletPoints.forEach((point, idx) => {
          pSlide.addText(`${idx + 1}. ${point}`, {
            x: 0.8, y: 1.2 + idx * 0.55, w: 8.5, h: 0.5,
            fontSize: 16, color: TPL.contentColor, fontFace: TPL.font,
          });
        });
      } else if (slide.type === 'conclusion') {
        pSlide.addText('결론', {
          x: 0.5, y: 0.3, w: 2, h: 0.5,
          fontSize: 13, bold: true, color: 'FFFFFF', fontFace: TPL.font, align: 'center',
          fill: { color: TPL.accent },
        });
        pSlide.addText(slide.title, {
          x: 0.5, y: 1.0, w: 9, h: 0.9,
          fontSize: 26, bold: true, color: TPL.titleColor, fontFace: TPL.font,
        });
        if (slide.content) {
          pSlide.addText(slide.content, {
            x: 0.5, y: 2.0, w: 9, h: 0.7,
            fontSize: 14, color: TPL.contentColor, fontFace: TPL.font,
          });
        }
        slide.bulletPoints.forEach((point, idx) => {
          pSlide.addText(`✓  ${point}`, {
            x: 0.7, y: 2.9 + idx * 0.48, w: 8.5, h: 0.44,
            fontSize: 14, color: TPL.accent, bold: true, fontFace: TPL.font,
          });
        });
      } else {
        pSlide.addText(slide.title, {
          x: 0.5, y: 0.25, w: 9, h: 0.8,
          fontSize: 24, bold: true, color: TPL.titleColor, fontFace: TPL.font,
        });
        pSlide.addShape(pptx.ShapeType.rect, {
          x: 0.5, y: 1.1, w: 9, h: 0.04,
          fill: { color: TPL.accent + '33' }, line: { type: 'none' },
        });
        if (slide.content) {
          pSlide.addText(slide.content, {
            x: 0.5, y: 1.25, w: 9, h: 0.6,
            fontSize: 13, color: TPL.contentColor, italic: true, fontFace: TPL.font,
          });
        }
        const bulletStart = slide.content ? 2.0 : 1.4;
        slide.bulletPoints.forEach((point, idx) => {
          pSlide.addShape(pptx.ShapeType.ellipse, {
            x: 0.5, y: bulletStart + idx * 0.5 + 0.14, w: 0.12, h: 0.12,
            fill: { color: TPL.accent }, line: { type: 'none' },
          });
          pSlide.addText(point, {
            x: 0.75, y: bulletStart + idx * 0.5, w: 8.7, h: 0.46,
            fontSize: 13, color: TPL.contentColor, fontFace: TPL.font,
          });
        });
      }

      pSlide.addText(`${slide.slideNumber}`, {
        x: 9.2, y: 5.1, w: 0.6, h: 0.3,
        fontSize: 10, color: '9CA3AF', fontFace: TPL.font, align: 'right',
      });
    }

    const pptxBuffer = await pptx.write({ outputType: 'nodebuffer' });
    const safeTitle = title.replace(/[^a-zA-Z0-9가-힣_\-]/g, '_');

    return new NextResponse(pptxBuffer as Buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(safeTitle)}.pptx"`,
      },
    });
  } catch (error) {
    console.error('[ppt download error]', error);
    return NextResponse.json({ error: 'PPT 파일 생성 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
