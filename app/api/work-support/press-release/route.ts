import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function generateTitles(coreContent: string, keywords: string[]): Promise<string[]> {
  const keywordText = keywords.filter(Boolean).join(', ');

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `당신은 대한민국 지방자치단체 보도자료 제목 작성 전문가입니다.
남양주시 공식 보도자료에 사용될 간결하고 핵심을 담은 제목 5개를 생성합니다.
각 제목은 서로 다른 스타일로 작성하세요:
1. 핵심 사실 중심형
2. 숫자/성과 강조형
3. 시민 혜택 중심형
4. 행정 목적 강조형
5. 미래지향/희망 메시지형`,
      },
      {
        role: 'user',
        content: `다음 내용으로 보도자료 제목 5개를 생성해주세요:

핵심 내용: ${coreContent}
${keywordText ? `키워드: ${keywordText}` : ''}

각 제목은 새 줄에 작성하고, 번호(1. 2. 3. ...)를 붙여주세요. 제목만 작성하세요.`,
      },
    ],
    temperature: 0.9,
    max_tokens: 500,
  });

  const raw = completion.choices[0]?.message?.content?.trim() || '';
  const lines = raw.split('\n').filter((l) => /^\d+\./.test(l.trim()));
  return lines.map((l) => l.replace(/^\d+\.\s*/, '').trim()).filter(Boolean);
}

async function generatePressRelease(
  title: string,
  coreContent: string,
  keywords: string[]
): Promise<object> {
  const keywordText = keywords.filter(Boolean).join(', ');

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `당신은 대한민국 지방자치단체 공식 보도자료 작성 전문가입니다.
남양주시 공식 보도자료를 작성합니다. 반드시 다음 JSON 형식으로 응답하세요:
{
  "metadata": {
    "department": "담당 부서명",
    "contact": "담당자 연락처",
    "date": "배포일"
  },
  "title": "보도자료 제목",
  "lead": "첫 문단 (핵심 내용 요약, 5W1H 포함)",
  "body": [
    {
      "subtitle": "소제목",
      "content": "내용"
    }
  ],
  "conclusion": "마무리 문단 (시장 코멘트 또는 기대 효과)",
  "contact": {
    "name": "담당자명",
    "department": "부서",
    "phone": "전화번호",
    "email": "이메일"
  }
}`,
      },
      {
        role: 'user',
        content: `다음 내용으로 공식 보도자료를 작성해주세요:

제목: ${title}
핵심 내용: ${coreContent}
${keywordText ? `키워드: ${keywordText}` : ''}

JSON 형식으로만 응답하세요. 마크다운 코드 블록 없이 순수 JSON만 출력하세요.`,
      },
    ],
    temperature: 0.7,
    max_tokens: 2000,
    response_format: { type: 'json_object' },
  });

  const raw = completion.choices[0]?.message?.content?.trim() || '{}';
  try {
    return JSON.parse(raw);
  } catch {
    return { error: 'JSON 파싱 실패', raw };
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, coreContent, keywords = [], title } = body;

    if (!action || !coreContent) {
      return NextResponse.json({ error: 'action과 핵심 내용을 입력해주세요.' }, { status: 400 });
    }

    if (action === 'generateTitles') {
      const titles = await generateTitles(coreContent, keywords);
      return NextResponse.json({ titles });
    }

    if (action === 'generatePressRelease') {
      if (!title) {
        return NextResponse.json({ error: '제목을 선택해주세요.' }, { status: 400 });
      }
      const pressRelease = await generatePressRelease(title, coreContent, keywords);
      return NextResponse.json({ pressRelease });
    }

    return NextResponse.json({ error: '유효하지 않은 action입니다.' }, { status: 400 });
  } catch (error) {
    console.error('[press-release API error]', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
