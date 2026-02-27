import { NextResponse } from 'next/server';
import { getActivePiiPatterns, logPiiDetection } from '@/lib/app-db/pii-patterns';

// 1분 모듈 레벨 캐시
let cachedPatterns: { type: string; regex: RegExp; hint: string }[] | null = null;
let cacheExpiry = 0;

function getPatterns() {
  const now = Date.now();
  if (cachedPatterns && now < cacheExpiry) return cachedPatterns;

  const rows = getActivePiiPatterns();
  cachedPatterns = rows.map(r => ({
    type: r.type,
    regex: new RegExp(r.regex),
    hint: r.hint,
  }));
  cacheExpiry = now + 60 * 1000;
  return cachedPatterns;
}

// 캐시 무효화 (패턴 변경 시 호출)
export function invalidatePiiCache() {
  cachedPatterns = null;
  cacheExpiry = 0;
}

export function checkPii(text: string): { detected: boolean; type?: string; hint?: string } {
  for (const { type, regex, hint } of getPatterns()) {
    if (regex.test(text)) return { detected: true, type, hint };
  }
  return { detected: false };
}

// API route에서 사용 — 감지 시 400 강제 차단 + 로그 기록
export function rejectIfPii(fields: string[], path: string): NextResponse | null {
  for (const field of fields) {
    if (!field) continue;
    const result = checkPii(field);
    if (result.detected) {
      logPiiDetection(result.type!, path);
      return NextResponse.json(
        {
          error: '개인정보가 포함된 것 같습니다',
          type: result.type,
          hint: result.hint,
        },
        { status: 400 }
      );
    }
  }
  return null;
}
