# 개인정보 입력 차단 시스템 설계 문서 (PII Filter)

> PII = Personally Identifiable Information (개인식별정보)

---

## 1. 목적

사용자가 AI 채팅, 게시판, 각종 입력폼에 **주민번호·전화번호 등 민감한 개인정보를 입력하는 것을 방지**한다.

- 실수로 입력하더라도 서버에 저장되거나 AI에 전송되지 않도록 차단
- 클라이언트(UX 피드백) + 서버(실제 방어) 이중 레이어 구조

---

## 2. 차단 대상 패턴

| 종류 | 패턴 예시 | 정규식 |
|------|---------|--------|
| 주민등록번호 (하이픈 있음) | `123456-1234567` | `\d{6}-[1-4]\d{6}` |
| 주민등록번호 (하이픈 없음) | `1234561234567` | `(?<!\d)\d{6}[1-4]\d{6}(?!\d)` |
| 휴대전화 (하이픈 있음) | `010-1234-5678` | `01[016789]-\d{3,4}-\d{4}` |
| 휴대전화 (하이픈 없음) | `01012345678` | `(?<!\d)01[016789]\d{7,8}(?!\d)` |
| 일반전화 (하이픈 있음) | `02-1234-5678` | `0\d{1,2}-\d{3,4}-\d{4}` |
| 계좌번호 | `110-123-456789` | `\d{3,4}-\d{2,6}-\d{4,8}` |
| 이메일 주소 | `hong@example.com` | `[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}` |

> **Phase 2 추가 검토 패턴**
> - 여권번호 (`M12345678` 형식)
> - 운전면허번호

---

## 3. 아키텍처 — 이중 방어

```
사용자 입력
    │
    ▼
[Layer 1 - 클라이언트]
usePiiSafeInput 훅
- 실시간 패턴 감지
- 경고 메시지 표시
- 제출 버튼 비활성화
    │
    ▼ (그래도 제출할 경우)
[Layer 2 - 서버]
piiFilter 유틸
- 모든 API 입구에서 검사
- 감지 시 400 에러 반환
- 클라이언트 우회 불가
```

**왜 이중으로?**
- 클라이언트만: 개발자 도구로 우회 가능
- 서버만: 사용자가 이유 모르고 제출 → 나쁜 UX
- **둘 다**: 보안 + UX 동시 확보

---

## 4. 구현 파일 계획

```
lib/
└── security/
    ├── piiFilter.ts        ← 서버용 유틸 함수 (패턴 감지 + 에러 반환)
    └── usePiiSafeInput.ts  ← 클라이언트용 React 훅 (실시간 검사)
```

---

## 5. 서버 유틸 — piiFilter.ts

### 역할
- API route에서 요청 body를 받아 PII 패턴 검사
- 감지되면 `{ detected: true, type: '주민번호' }` 반환
- 미감지 시 `{ detected: false }` 반환

### 사용 위치 (적용 대상 API)

| API | 검사 대상 필드 |
|-----|-------------|
| `POST /api/chat` | `messages[].content` |
| `POST /api/board/posts` | `title`, `content` |
| `POST /api/work-support/report` | `title`, `content` |
| `POST /api/work-support/greetings` | 입력 필드 전체 |
| `POST /api/work-support/press-release` | 입력 필드 전체 |
| `POST /api/work-support/merit-citation` | 입력 필드 전체 |
| `POST /api/work-support/scenario-generator` | `content` |
| `POST /api/work-support/ppt-converter/generate` | `content` |
| `POST /api/rag/admin/upload` | 업로드 텍스트 |

### 의사코드
```typescript
const PII_PATTERNS = [
  {
    type: '주민등록번호',
    regex: /\d{6}-[1-4]\d{6}/,
    hint: '숫자 패턴이 주민번호와 유사합니다. 관리번호라면 앞에 문자를 붙여 구분해 주세요 (예: 관리번호: 880101-A)',
  },
  {
    type: '주민등록번호',
    regex: /(?<!\d)\d{6}[1-4]\d{6}(?!\d)/,
    hint: '숫자 패턴이 주민번호와 유사합니다. 관리번호라면 앞에 문자를 붙여 구분해 주세요',
  },
  {
    type: '휴대전화번호',
    regex: /01[016789]-?\d{3,4}-?\d{4}/,
    hint: '전화번호 형식이 감지됐습니다. 부서명과 함께 "스마트도시과 대표: 031-0000" 처럼 입력해 주세요',
  },
  {
    type: '일반전화번호',
    regex: /0\d{1,2}-\d{3,4}-\d{4}/,
    hint: '전화번호 형식이 감지됐습니다. 번호 앞에 용도를 표기해 주세요 (예: 대표전화: 02-...)',
  },
  {
    type: '계좌번호',
    regex: /\d{3,4}-\d{2,6}-\d{4,8}/,
    hint: '계좌번호 형식이 감지됐습니다. 예산코드라면 "예산코드 110-300" 형식으로 구분해 주세요',
  },
  {
    type: '이메일 주소',
    regex: /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/,
    hint: '이메일 주소가 포함되어 있습니다. 이메일 대신 "담당자 홍길동 주무관"처럼 이름으로 표기해 주세요',
  },
];

export function checkPii(text: string): { detected: boolean; type?: string; hint?: string } {
  for (const { type, regex, hint } of PII_PATTERNS) {
    if (regex.test(text)) return { detected: true, type, hint };
  }
  return { detected: false };
}

// API route에서 사용 — 감지 시 400 강제 차단
export function rejectIfPii(fields: string[]): NextResponse | null {
  for (const field of fields) {
    const result = checkPii(field);
    if (result.detected) {
      return NextResponse.json(
        {
          error: `개인정보가 포함된 것 같습니다`,
          type: result.type,
          hint: result.hint,
        },
        { status: 400 }
      );
    }
  }
  return null;
}
```

---

## 6. 클라이언트 훅 — usePiiSafeInput.ts

### 역할
- 기존 `useState` 대신 사용하는 드롭인 대체 훅
- 실시간으로 PII 패턴 감지 → 경고 메시지 반환
- 제출 전 유효성 검사 함수 제공

### 사용 예시
```tsx
// 기존
const [content, setContent] = useState('');

// 변경 후 — 드롭인 교체
const { value: content, onChange, warning, isClean } = usePiiSafeInput('');

// 입력 필드
<textarea value={content} onChange={onChange} />
{warning && <p style={{ color: 'red' }}>{warning}</p>}

// 제출 시
<button disabled={!isClean}>제출</button>
```

### 반환값
| 값 | 타입 | 설명 |
|----|------|------|
| `value` | string | 입력값 |
| `onChange` | handler | input/textarea onChange |
| `warning` | string \| null | 감지된 경우 경고 문구 |
| `isClean` | boolean | PII 없으면 true |

---

## 7. 사용자 경험 (UX) 흐름

```
사용자가 주민번호 입력 시작
    ↓
실시간 감지 (usePiiSafeInput)
    ↓
경고 표시: "⚠️ 주민등록번호 등 개인정보는 입력할 수 없습니다"
제출 버튼 비활성화
    ↓
사용자가 내용 수정
    ↓
경고 사라짐, 제출 버튼 활성화
```

---

## 8. 오탐(False Positive) 정책 — 강제 차단 + 안내

### 정책: 감지 시 무조건 차단, 오탐 예시와 수정 방법 안내

오탐이 발생하더라도 개인정보 보호 원칙상 **강제 차단**한다.
대신 사용자에게 **왜 막혔는지, 어떻게 수정하면 되는지** 명확히 안내한다.

### 오탐 가능 케이스 및 안내 예시

| 패턴 | 오탐 사례 | 안내 메시지 예시 |
|------|---------|---------------|
| 주민번호 | 공문서 관리번호 `880101-A001234` | "숫자 패턴이 주민번호와 유사합니다. 관리번호는 앞에 문자(예: `관리번호: 880101`)를 붙여 구분해 주세요" |
| 전화번호 | 대표번호 `031-5600-0000` | "전화번호 형식이 감지됐습니다. 부서명과 함께 `스마트도시과 대표: 031-0000`처럼 입력해 주세요" |
| 계좌번호 | 예산 코드 `110-300-12345` | "계좌번호 형식이 감지됐습니다. 예산코드라면 `예산코드 110-300` 형식으로 구분해 주세요" |
| 이메일 | 업무 참조 이메일 `hong@nyj.go.kr` | "이메일 주소가 포함되어 있습니다. 이메일 대신 `담당자 홍길동 주무관`처럼 이름으로 표기해 주세요" |

### 사용자에게 표시할 에러 메시지 구조

```
⚠️ 개인정보가 포함된 것 같습니다

감지된 항목: 휴대전화번호

혹시 오탐(실제 개인정보가 아닌 경우)이라면
아래 방법으로 수정 후 다시 제출해 주세요:

  • 전화번호 → 앞뒤에 설명 추가 (예: "대표전화: 031-...")
  • 숫자코드 → 코드유형 명시 (예: "참조번호 12345-...")
  • 이메일   → 담당자 이름으로 대체

[내용 수정하기]
```

---

## 9. 적용 범위 요약

| 위치 | 적용 방식 | 우선순위 |
|------|---------|---------|
| AI 채팅 입력창 | 훅 + 서버 | 🔴 높음 |
| 자유게시판 작성 | 훅 + 서버 | 🔴 높음 |
| 업무지원 도구 입력 | 훅 + 서버 | 🟡 중간 |
| RAG 문서 업로드 | 서버만 | 🟡 중간 |
| 회원가입 (별칭) | 훅만 (서버 불필요) | 🟢 낮음 |

---

## 10. 확장 포인트

- 감지 로그 DB 저장 (어떤 패턴이 얼마나 감지됐는지 통계)
- 관리자 페이지에서 차단 패턴 동적 추가/삭제
- 파일 업로드 시 텍스트 추출 후 PII 스캔

---

*작성일: 2026-02-27*
