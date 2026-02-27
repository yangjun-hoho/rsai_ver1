'use client';

import { useState, useCallback } from 'react';

// 클라이언트용 하드코딩 패턴 (서버 DB와 동일한 기본값)
const CLIENT_PATTERNS = [
  { type: '주민등록번호', regex: /\d{6}-[1-4]\d{6}/, hint: '숫자 패턴이 주민번호와 유사합니다. 관리번호라면 앞에 문자를 붙여 구분해 주세요 (예: 관리번호: 880101-A)' },
  { type: '주민등록번호', regex: /(?<!\d)\d{6}[1-4]\d{6}(?!\d)/, hint: '숫자 패턴이 주민번호와 유사합니다. 관리번호라면 앞에 문자를 붙여 구분해 주세요' },
  { type: '휴대전화번호', regex: /01[016789]-?\d{3,4}-?\d{4}/, hint: '전화번호 형식이 감지됐습니다. 부서명과 함께 "스마트도시과 대표: 031-0000" 처럼 입력해 주세요' },
  { type: '일반전화번호', regex: /0\d{1,2}-\d{3,4}-\d{4}/, hint: '전화번호 형식이 감지됐습니다. 번호 앞에 용도를 표기해 주세요 (예: 대표전화: 02-...)' },
  { type: '계좌번호', regex: /\d{3,4}-\d{2,6}-\d{4,8}/, hint: '계좌번호 형식이 감지됐습니다. 예산코드라면 "예산코드 110-300" 형식으로 구분해 주세요' },
  { type: '이메일 주소', regex: /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/, hint: '이메일 주소가 포함되어 있습니다. 이메일 대신 "담당자 홍길동 주무관"처럼 이름으로 표기해 주세요' },
];

function detectPii(text: string): { type: string; hint: string } | null {
  for (const { type, regex, hint } of CLIENT_PATTERNS) {
    if (regex.test(text)) return { type, hint };
  }
  return null;
}

export function usePiiSafeInput(initialValue = '') {
  const [value, setValue] = useState(initialValue);
  const [warning, setWarning] = useState<string | null>(null);
  const [isClean, setIsClean] = useState(true);

  const onChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const text = e.target.value;
    setValue(text);
    const detected = detectPii(text);
    if (detected) {
      setWarning(`⚠️ ${detected.type} 패턴이 감지됐습니다. ${detected.hint}`);
      setIsClean(false);
    } else {
      setWarning(null);
      setIsClean(true);
    }
  }, []);

  const reset = useCallback(() => {
    setValue(initialValue);
    setWarning(null);
    setIsClean(true);
  }, [initialValue]);

  return { value, onChange, warning, isClean, setValue, reset };
}
