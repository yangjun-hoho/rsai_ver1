# 템플릿 기능 설계 문서

## 개요

공무원 업무에 특화된 AI 템플릿 도구. 반복적으로 사용하는 행정 문서/답변을 구조화된 입력창과 AI 생성 결과창으로 처리한다.

---

## 사용자 경험 흐름

```
사이드바 [템플릿] 클릭
  → 갤러리 화면 (카드 그리드) 표시
      → 카테고리 필터 (전체 / 민원 / 문서 / 기타)
      → 템플릿 카드 클릭
          → 실행 화면 (split-view)
              └ 좌측(360px): 구조화 입력창 (필드 자동 생성)
              └ 우측(나머지): AI 생성 결과 (섹션별 카드)
```

---

## 파일 구조

```
lib/
  templates/
    types.ts                          # 공통 타입 정의
    registry.ts                       # 전체 템플릿 목록 (여기에만 추가하면 됨)
    TemplateGallery.tsx               # 카드 그리드 갤러리 화면
    TemplateRunner.tsx                # split-view 실행 화면
    TemplateView.tsx                  # 갤러리 ↔ 실행 화면 전환 관리
    templates/
      civil-complaint/               # 국민신문고
        config.ts                    # 메타데이터 + 입력 필드 정의
      email-reply/                   # 메일 회신
        config.ts
      official-doc/                  # 공문서 작성
        config.ts

app/
  api/
    templates/
      civil-complaint/
        route.ts                     # Gemini API 호출 → 구조화 JSON 반환
      email-reply/
        route.ts
      official-doc/
        route.ts
```

---

## 타입 정의 (types.ts)

```typescript
TemplateField   // 입력 필드 1개 (key, label, type, placeholder, options, required, rows)
TemplateConfig  // 템플릿 메타데이터 + fields 배열
OutputSection   // AI 결과 섹션 1개 { title, content }
TemplateResult  // API 응답 { sections: OutputSection[] }
```

---

## API 응답 포맷 (모든 템플릿 공통)

```json
{
  "sections": [
    { "title": "섹션 제목", "content": "내용" },
    { "title": "섹션 제목", "content": "내용" }
  ]
}
```

OutputSection 배열로 통일하면 UI(TemplateRunner 우측)가 단일 컴포넌트로 모든 템플릿을 렌더링할 수 있다.

---

## 현재 구현된 템플릿 3종

| 템플릿 | ID | 카테고리 | 입력 필드 | 출력 섹션 |
|--------|-----|---------|-----------|-----------|
| 국민신문고 | `civil-complaint` | 민원 | 민원 분류, 민원 내용, 답변 핵심, 담당부서 | 민원 내용 요약 / 검토 결과 / 마무리 인사 |
| 메일 회신 | `email-reply` | 문서 | 원본 메일, 회신 방향, 어조, 발신자 | 메일 제목 / 인사 및 맥락 / 본문 / 마무리 및 서명 |
| 공문서 작성 | `official-doc` | 문서 | 공문 유형, 수신기관, 제목, 주요 내용, 기안부서 | 문서 정보 / 목적 및 근거 / 주요 내용 / 붙임 및 협조 |

---

## 새 템플릿 추가 방법

### 1단계: config.ts 작성

```
lib/templates/templates/새템플릿이름/config.ts
```

```typescript
import { TemplateConfig } from '../../types';

export const myTemplateConfig: TemplateConfig = {
  id: 'my-template',
  name: '템플릿 이름',
  icon: '📌',
  description: '템플릿 설명',
  category: '민원' | '문서' | '기타',
  apiPath: '/api/templates/my-template',
  fields: [
    { key: 'fieldName', label: '필드 라벨', type: 'text' | 'textarea' | 'select', required: true },
    // ...
  ],
};
```

### 2단계: API route 작성

```
app/api/templates/새템플릿이름/route.ts
```

- Gemini REST API (`gemini-2.0-flash-lite`) 사용
- 응답은 반드시 `{ sections: [{ title, content }] }` JSON 형식
- JSON 추출은 `raw.match(/\{[\s\S]*\}/)` 패턴 사용

### 3단계: registry.ts에 등록

```typescript
// lib/templates/registry.ts
import { myTemplateConfig } from './templates/my-template/config';

export const TEMPLATES: TemplateConfig[] = [
  civilComplaintConfig,
  emailReplyConfig,
  officialDocConfig,
  myTemplateConfig,  // ← 이 한 줄만 추가
];
```

→ 갤러리에 자동으로 카드가 생성됨.

---

## 통합 방식 (app/page.tsx)

- `ToolId`에 `'templates'` 추가 (Sidebar.tsx)
- `activeMode === 'templates'`일 때 chat+preview 영역을 `<TemplateView />`로 교체
- 사이드바에서 다시 클릭하면 토글 off → 일반 채팅 화면으로 복귀

---

## 추가 예정 템플릿 아이디어

- 전화민원 답변 메모 (통화 내용 → 처리 결과 정리)
- 보도자료 요약 (보도자료 원문 → 핵심 요약 3줄)
- 회의록 작성 (안건·발언 내용 → 공식 회의록)
- 민원인 안내문 (처리 내용 → SMS/안내문 문구)
- 업무 인수인계서 (업무 현황 → 인수인계 문서)
