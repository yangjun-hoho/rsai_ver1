import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const MODEL = 'gemini-2.5-flash-image';

function buildEditPrompt(instruction: string, hasMask: boolean): string {
  const maskInstruction = hasMask
    ? '\n\nIMPORTANT: Apply changes ONLY where the mask image shows white pixels (value 255). Leave all other areas completely unchanged. Respect the mask boundaries precisely and maintain seamless blending at the edges.'
    : '';

  return `Edit this image according to the following instruction: ${instruction}

Maintain the original image's lighting, perspective, and overall composition. Make the changes look natural and seamlessly integrated.${maskInstruction}

Preserve image quality and ensure the edit looks professional and realistic.`;
}

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Gemini API 키가 설정되지 않았습니다.' }, { status: 500 });
    }

    const body = await request.json();
    const { tool, prompt, originalImage, referenceImages, maskImage, temperature, aspectRatio } = body;

    if (!prompt?.trim()) {
      return NextResponse.json({ error: '프롬프트를 입력해주세요.' }, { status: 400 });
    }

    const genAI = new GoogleGenAI({ apiKey });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const contents: any[] = [];

    if (tool === 'generate') {
      // 텍스트 프롬프트 먼저
      contents.push({ text: prompt });
      // 참조 이미지 추가
      if (referenceImages?.length > 0) {
        for (const img of referenceImages) {
          contents.push({ inlineData: { mimeType: 'image/png', data: img } });
        }
      }
    } else {
      // edit / mask 모드
      if (!originalImage) {
        return NextResponse.json({ error: '편집할 이미지가 없습니다.' }, { status: 400 });
      }
      contents.push({ text: buildEditPrompt(prompt, !!maskImage) });
      contents.push({ inlineData: { mimeType: 'image/png', data: originalImage } });
      if (maskImage) {
        contents.push({ inlineData: { mimeType: 'image/png', data: maskImage } });
      }
      if (referenceImages?.length > 0) {
        for (const img of referenceImages) {
          contents.push({ inlineData: { mimeType: 'image/png', data: img } });
        }
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const config: any = {
      model: MODEL,
      contents,
    };

    // aspectRatio가 있을 때만 generationConfig 추가
    if (aspectRatio) {
      config.generationConfig = { aspectRatio };
    }

    if (temperature !== undefined) {
      config.generationConfig = { ...config.generationConfig, temperature };
    }

    const response = await genAI.models.generateContent(config);

    if (!response?.candidates?.length) {
      console.error('[nano-banana] No candidates in response:', response);
      return NextResponse.json({ error: '이미지를 생성하지 못했습니다.' }, { status: 500 });
    }

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return NextResponse.json({
          image: part.inlineData.data,
          mimeType: part.inlineData.mimeType ?? 'image/png',
        });
      }
    }

    return NextResponse.json({ error: '응답에 이미지가 없습니다.' }, { status: 500 });
  } catch (error) {
    console.error('[nano-banana] error:', error);
    const msg = error instanceof Error ? error.message : '서버 오류가 발생했습니다.';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
