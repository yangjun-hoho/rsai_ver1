# 남양주시 스마트도시과 AI-Agent 프로젝트 설계 문서

> 공무원 업무 효율화를 위한 AI 통합 플랫폼

---

## 1. 프로젝트 개요

| 항목 | 내용 |
|------|------|
| 프로젝트명 | 아레스 AI (ARES AI) |
| 대상 | 남양주시 스마트도시과 공무원 |
| 목적 | AI를 활용한 업무 자동화 및 생산성 향상 |
| 프레임워크 | Next.js 16 App Router |
| 배포 환경 | 로컬 / 내부망 |

---

## 2. 기술 스택

| 구분 | 기술 |
|------|------|
| Frontend | Next.js 16 (App Router), React 19, TypeScript |
| AI - 채팅 | OpenAI GPT-4o-mini, Google Gemini 2.0 Flash Lite |
| AI - 업무도구 | Gemini 2.0 Flash Lite (보고서/보도자료/인사말 등) |
| RAG | OpenAI text-embedding-3-small + SQLite (better-sqlite3) |
| TTS | Edge TTS (Microsoft, edge-tts CLI) |
| 문서 파싱 | pdf-parse, mammoth (Word) |
| 지도 | Leaflet + V-World API |
| 스타일링 | Inline CSS (style prop 방식) |

---

## 3. 서비스 구조

```
아레스 AI
├── 메인 채팅 (/)                  ← SSE 스트리밍 AI 채팅
├── 업무지원 도구 (/work-support/)  ← AI 업무 특화 툴 모음
├── RAG 지식베이스 (사이드바)        ← 문서 검색 증강
└── FuN fUn (/fun/)                ← 직원 휴식 미니앱
```

---

## 4. 주요 기능

### 4-1. 메인 채팅
- GPT-4o-mini / Gemini 2.0 Flash Lite 선택 가능
- SSE(Server-Sent Events) 기반 실시간 스트리밍
- 대화 이력 localStorage 저장/불러오기
- 채팅 내에서 업무도구 폼 직접 호출

### 4-2. 업무지원 도구 (10종)

| 도구 | 설명 |
|------|------|
| 보고서 작성 | 유형/길이 선택 → AI 초안 생성 + 에디터 |
| PPT 생성 | 텍스트 or 파일 업로드 → 슬라이드 변환 |
| 인사말 작성 | 행사 유형별 템플릿 기반 인사말 |
| 공적조서 | 대상/직급 입력 → 표창 공적 문안 |
| 보도자료 | 입력 → 제목 후보 3개 선택 → 전문 생성 |
| 시나리오 생성 | 행사/상황별 진행 시나리오 |
| 텍스트 음성변환 | Edge TTS, 다양한 음성/속도 |
| 연속지적도 | Leaflet + V-World 주소 검색 지적도 |
| Nano Banana AI | AI 이미지 생성 (일일 10회 제한) |
| 화면 녹화 | 브라우저 기반 화면 캡처 |

### 4-3. RAG 지식베이스
- 관리자 UI에서 카테고리/문서 CRUD
- 문서 업로드 → 500자 청크 → OpenAI 임베딩 → SQLite 저장
- 채팅 시 유사 문서 검색 후 컨텍스트 주입
- 뷰: 갤러리 / 채팅 / 관리자

### 4-4. FuN fUn (직원 휴식 코너)
공무원 특화 10종 미니앱

| 앱 | 앱 |
|----|-----|
| MBTI 테스트 | 사다리 게임 |
| 점심메뉴 룰렛 | 퇴근 카운트다운 |
| 밸런스 게임 | 오늘의 운세 |
| 팀 랜덤 배정 | 주사위 굴리기 |
| 가위바위보 | 스트레스 해소 |

---

## 5. 디렉토리 구조

```
rsai_ver1/
├── app/
│   ├── page.tsx                    # 메인 채팅 페이지
│   ├── api/
│   │   ├── chat/route.ts           # 채팅 SSE API (OpenAI + Gemini)
│   │   ├── rag/                    # RAG API (query, admin)
│   │   └── work-support/           # 업무도구 API
│   ├── work-support/               # 업무도구 독립 페이지
│   └── fun/                        # FuN fUn 미니앱
│
├── lib/
│   ├── chat/                       # 채팅 UI 컴포넌트
│   │   ├── Sidebar.tsx
│   │   ├── ChatArea.tsx
│   │   ├── ChatHeader.tsx
│   │   ├── MessageBubble.tsx
│   │   ├── InputArea.tsx
│   │   └── forms/                  # 채팅 내 업무도구 폼
│   ├── work-support/               # 업무도구 UI 컴포넌트
│   └── rag/                        # RAG UI 컴포넌트 + DB
│
├── data/
│   └── rag.db                      # SQLite RAG 데이터베이스
│
├── public/
│   └── images/                     # 정적 이미지
│
└── docs/                           # 설계 문서
```

---

## 6. API 설계 원칙

- 모든 API: `app/api/` 하위 `route.ts` (Next.js Route Handler)
- 스트리밍: `ReadableStream` + `text/event-stream`
- Gemini: SDK 없이 REST API 직접 호출
- 환경변수: `OPENAI_API_KEY`, `GEMINI_API_KEY`, `VWORLD_API_KEY`

---

## 7. 주요 설계 결정

| 결정 | 이유 |
|------|------|
| App Router 전용 | 최신 Next.js 패턴, 레이아웃 공유 |
| 전부 `use client` | 인터랙티브 UI 위주, 서버 컴포넌트 불필요 |
| Inline CSS | 외부 CSS 파일 없이 컴포넌트 자급자족 |
| SQLite | 외부 DB 없이 단일 파일로 RAG 운용 |
| Gemini REST | google-generativeai 패키지 의존성 제거 |
| Edge TTS | 무료 고품질 한국어 TTS |

---

*최종 업데이트: 2026-02-27*
