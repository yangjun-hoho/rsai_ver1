import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface Slide {
  type: 'title' | 'index' | 'content' | 'conclusion';
  title: string;
  content: string[];
  notes?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      text,
      slideCount = 10,
      template = 'default',
      hasTitle = true,
      hasIndex = true,
      hasConclusion = true,
    } = body;

    if (!text?.trim()) {
      return NextResponse.json({ error: '변환할 텍스트를 입력해주세요.' }, { status: 400 });
    }

    const contentSlideCount =
      slideCount - (hasTitle ? 1 : 0) - (hasIndex ? 1 : 0) - (hasConclusion ? 1 : 0);

    const systemPrompt = `당신은 프레젠테이션 슬라이드 구성 전문가입니다.
주어진 텍스트를 분석하여 효과적인 슬라이드 구성을 JSON 형식으로 생성합니다.

슬라이드 구성 규칙:
- 각 슬라이드는 명확한 제목과 핵심 포인트로 구성
- 한 슬라이드당 불릿 포인트 3-5개
- 간결하고 명확한 표현 사용
- 논리적인 흐름 유지

반드시 다음 JSON 형식으로만 응답하세요:
{
  "slides": [
    {
      "type": "title|index|content|conclusion",
      "title": "슬라이드 제목",
      "content": ["포인트1", "포인트2", "포인트3"],
      "notes": "발표자 노트 (선택사항)"
    }
  ]
}`;

    const userPrompt = `다음 텍스트를 ${slideCount}개 슬라이드로 구성해주세요:

${text.slice(0, 3000)}

슬라이드 구성:
${hasTitle ? '- 첫 슬라이드: title 타입 (제목 슬라이드)' : ''}
${hasIndex ? '- 두 번째 슬라이드: index 타입 (목차)' : ''}
- 본문: content 타입 슬라이드 ${contentSlideCount}개
${hasConclusion ? '- 마지막 슬라이드: conclusion 타입 (결론/마무리)' : ''}

템플릿: ${template}
JSON 형식으로만 응답하세요.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 3000,
      response_format: { type: 'json_object' },
    });

    const raw = completion.choices[0]?.message?.content?.trim() || '{}';
    let result: { slides: Slide[] };

    try {
      result = JSON.parse(raw);
    } catch {
      result = {
        slides: [
          { type: 'title', title: '프레젠테이션', content: ['생성된 내용을 확인하세요'] },
          { type: 'content', title: '주요 내용', content: [text.slice(0, 100)] },
        ],
      };
    }

    if (!result.slides || result.slides.length === 0) {
      result.slides = [
        { type: 'title', title: '프레젠테이션', content: ['내용을 입력하여 슬라이드를 생성하세요'] },
      ];
    }

    return NextResponse.json({ slides: result.slides });
  } catch (error) {
    console.error('[ppt-converter generate API error]', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
