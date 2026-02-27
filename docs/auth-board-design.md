# 로그인 · 게시판 · 나의 메뉴 설계 문서

> 확장을 고려한 최소 구현 (Phase 1)

---

## 1. 목표

| 기능 | 범위 |
|------|------|
| 회원가입 / 로그인 | 별칭 + 비밀번호, 자유 가입 |
| 나의 메뉴 | 개인 설정 저장 (AI 모델, 테마 등) |
| 자유게시판 | 글 작성 / 목록 / 상세 / 삭제 |

---

## 2. 핵심 개념 — Authentication vs Authorization

이 시스템의 중심은 **인증(Authentication)** 과 **인가(Authorization)** 두 가지다.

### Authentication (인증, AuthN)
> "이 사람이 본인이 맞는가?"

- 사용자가 별칭 + 비밀번호를 입력해 **본인임을 증명**하는 과정
- 로그인 성공 시 JWT(토큰)를 발급하여 이후 요청에서 신원을 확인
- 이 프로젝트에서: `/api/auth/login`, `/api/auth/register`

### Authorization (인가, AuthZ)
> "이 사람이 이 작업을 할 권한이 있는가?"

- 인증된 사용자가 특정 리소스에 **접근 가능한지 판단**하는 과정
- 이 프로젝트에서: `role = 'user' | 'admin'` 으로 권한 분리
  - 일반 사용자: 본인 글만 삭제 가능
  - 관리자: 모든 글 삭제 가능
- 미들웨어(`middleware.ts`)에서 비로그인 사용자를 차단

> **정리**: 로그인 = Authentication / 권한 체크 = Authorization
> 이 둘을 합쳐 **IAM (Identity and Access Management)** 이라 부른다.

---

## 3. 기술 스택 상세

### 인증 방식 — JWT (JSON Web Token)

JWT는 서버에 세션을 저장하지 않고, **토큰 자체에 사용자 정보를 담아** 클라이언트에게 발급하는 방식이다.

```
헤더.페이로드.서명
eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOjEsIm5pY2tuYW1lIjoi...
```

| 구성요소 | 내용 |
|---------|------|
| Header | 알고리즘 정보 (HS256) |
| Payload | userId, nickname, role, 만료시간 |
| Signature | AUTH_SECRET으로 서명 — 위조 방지 |

**이 프로젝트의 JWT Payload 구조:**
```json
{
  "userId": 1,
  "nickname": "홍길동",
  "role": "user",
  "iat": 1706234400,
  "exp": 1706839200
}
```

**JWT vs Session 비교:**

| 항목 | JWT (이 프로젝트) | Session |
|------|-----------------|---------|
| 서버 저장 | 불필요 | DB/메모리에 저장 |
| 확장성 | 서버 여러 대도 동작 | 서버 공유 필요 |
| 토큰 무효화 | 만료 전 강제 무효화 어려움 | 즉시 삭제 가능 |
| 적합한 경우 | API 서버, 내부 서비스 | 전통적인 웹앱 |

### 비밀번호 보안 — bcryptjs + Salt

비밀번호는 절대 평문으로 저장하지 않는다. **bcrypt 해싱** 을 사용한다.

```
원본:  "mypassword123"
Salt:  "$2b$10$N9qo8uLOickgx2ZMRZo..." (랜덤값)
해시:  "$2b$10$N9qo8uLOickgx2ZMRZoHyuEOOmBRSZ..." (복호화 불가)
```

- **Salt**: 같은 비밀번호라도 매번 다른 해시가 생성되게 하는 랜덤값 → 레인보우 테이블 공격 방어
- **Cost Factor (10)**: 해싱 반복 횟수. 높을수록 안전하지만 느림. 10이 표준
- `bcrypt.compare(입력값, 저장된해시)` 로 비교 — 원본 복원 없이 검증

### 쿠키 보안 — httpOnly + sameSite

JWT를 쿠키에 저장할 때 보안 옵션을 설정한다.

```typescript
res.cookies.set('ares-session', token, {
  httpOnly: true,    // JS에서 document.cookie로 접근 불가 → XSS 방어
  sameSite: 'lax',  // 외부 사이트에서 전송 제한 → CSRF 방어
  maxAge: 60 * 60 * 24 * 7,  // 7일 만료
})
```

| 옵션 | 방어하는 공격 | 설명 |
|------|-------------|------|
| `httpOnly` | XSS | 악성 JS가 토큰을 훔치지 못하도록 |
| `sameSite: lax` | CSRF | 다른 사이트에서 몰래 요청 보내는 것 방어 |
| `maxAge` | 세션 영구화 | 일정 기간 후 자동 만료 |

### 권한 관리 — RBAC (Role-Based Access Control)

역할(Role) 기반으로 접근 권한을 관리하는 방식.

```
role = 'user'   → 일반 사용자
role = 'admin'  → 관리자
```

```typescript
// board.ts 삭제 로직
const where = role === 'admin' ? `id = ?` : `id = ? AND user_id = ?`;
```

### Next.js Middleware

Next.js의 `middleware.ts`는 요청이 페이지/API에 도달하기 **전에 가로채는** 레이어다.

```
사용자 요청 → [middleware.ts] → 페이지/API
                ↓
           JWT 쿠키 있음? → 검증 → 통과
           JWT 쿠키 없음? → /login 리다이렉트
```

- Edge Runtime에서 실행 (Node.js가 아님) → `jose` 라이브러리 사용 이유
- 페이지 렌더링 전에 인증 체크 → 보호 경로 접근 차단

### 라이브러리 선택 이유

| 라이브러리 | 선택 이유 |
|-----------|---------|
| `jose` | Edge Runtime 호환 JWT 라이브러리. next-auth 없이 직접 구현 시 표준 선택 |
| `bcryptjs` | 순수 JS 구현 → 네이티브 모듈 설치 불필요. better-sqlite3처럼 빌드 오류 없음 |
| `better-sqlite3` | 이미 RAG에서 사용 중. 동기 API로 코드 단순함 |

---

## 4. DB 구조

### 분리 원칙
```
data/rag.db   ← 기존 RAG (변경 없음)
data/app.db   ← 신규 (사용자 / 게시판)
```

**분리 이유:**
- RAG DB는 AI 전용 (임베딩 벡터, 대용량 텍스트) — 성격이 전혀 다름
- 독립적 백업 및 마이그레이션 가능
- 추후 app.db만 PostgreSQL로 전환해도 RAG는 무관

### app.db 테이블

```sql
-- 사용자
CREATE TABLE users (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  nickname   TEXT    UNIQUE NOT NULL,       -- 별칭 (로그인 ID 겸용)
  password   TEXT    NOT NULL,              -- bcrypt 해시 (평문 저장 금지)
  role       TEXT    DEFAULT 'user',        -- 'user' | 'admin'
  created_at TEXT    DEFAULT (datetime('now'))
);

-- 개인 설정 (users와 1:1 관계)
CREATE TABLE user_settings (
  user_id         INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  preferred_model TEXT    DEFAULT 'gpt-4o-mini',
  theme           TEXT    DEFAULT 'light',
  updated_at      TEXT    DEFAULT (datetime('now'))
);

-- 게시판 글
CREATE TABLE posts (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id    INTEGER REFERENCES users(id) ON DELETE CASCADE,
  title      TEXT    NOT NULL,
  content    TEXT    NOT NULL,
  views      INTEGER DEFAULT 0,
  created_at TEXT    DEFAULT (datetime('now')),
  updated_at TEXT    DEFAULT (datetime('now'))
);
```

---

## 5. 인증 흐름

```
[회원가입]
닉네임+비밀번호 입력
      ↓
bcrypt.hash(비밀번호, 10) → 해시 생성
      ↓
users 테이블에 저장 + user_settings 초기화
      ↓
JWT 생성 → httpOnly 쿠키 set → 로그인 상태

[로그인]
닉네임+비밀번호 입력
      ↓
DB에서 닉네임으로 사용자 조회
      ↓
bcrypt.compare(입력값, DB해시) → 일치 여부
      ↓
JWT 생성 → httpOnly 쿠키 set

[인증 확인 (모든 보호 요청마다)]
요청 도착 → middleware.ts
      ↓
쿠키에서 'ares-session' 추출
      ↓
jose.jwtVerify(token, AUTH_SECRET) → payload 추출
      ↓
성공: 요청 통과 / 실패: /login 리다이렉트 or 401

[로그아웃]
POST /api/auth/logout → 쿠키 maxAge=0 → 즉시 만료
```

---

## 6. 라우트 구조

### 페이지
```
app/
├── login/page.tsx            ← 로그인
├── register/page.tsx         ← 회원가입
├── board/
│   ├── page.tsx              ← 게시판 목록 (페이지네이션)
│   ├── write/page.tsx        ← 글 작성
│   └── [id]/page.tsx         ← 글 상세 + 삭제
└── my/
    └── page.tsx              ← 나의 메뉴 (개인 설정)
```

### API
```
app/api/
├── auth/
│   ├── register/route.ts     POST  회원가입 (닉네임 중복 체크 포함)
│   ├── login/route.ts        POST  로그인
│   ├── logout/route.ts       POST  로그아웃 (쿠키 삭제)
│   └── me/route.ts           GET   현재 로그인 사용자 정보
├── board/
│   └── posts/
│       ├── route.ts          GET(목록+페이지) / POST(작성)
│       └── [id]/route.ts     GET(상세+조회수++) / DELETE(삭제)
└── my/
    └── settings/route.ts     GET(설정 조회) / PUT(설정 수정)
```

### 보호 경로 (middleware.ts 적용)
```
/board/*      → 로그인 필요 (미인증 시 /login 리다이렉트)
/my/*         → 로그인 필요
/api/board/*  → 로그인 필요 (미인증 시 401 응답)
/api/my/*     → 로그인 필요
```

---

## 7. 파일 구조

```
lib/
├── app-db/
│   ├── db.ts          ← app.db 연결 + 테이블 초기화 (WAL 모드)
│   ├── users.ts       ← 사용자 CRUD
│   ├── board.ts       ← 게시글 CRUD (페이지네이션, 조회수)
│   └── settings.ts    ← 설정 조회/수정
└── auth/
    └── session.ts     ← JWT 생성(signSession) / 검증(verifySession)

middleware.ts           ← 보호 경로 인증 게이트
```

---

## 8. 환경변수

```bash
# .env.local
AUTH_SECRET=임의의_긴_랜덤_문자열  # JWT 서명 키 — 유출 금지, 변경 시 전체 세션 무효화
```

---

## 9. 보안 고려사항

| 항목 | 현재 구현 | 비고 |
|------|---------|------|
| 비밀번호 해싱 | bcrypt (cost=10) | 평문 저장 절대 금지 |
| XSS 방어 | httpOnly 쿠키 | JS에서 토큰 접근 불가 |
| CSRF 방어 | sameSite=lax | 외부 사이트 요청 차단 |
| SQL Injection | Prepared Statement | better-sqlite3 기본 제공 |
| 닉네임 중복 | UNIQUE 제약 + 409 응답 | DB 레벨 + API 레벨 이중 체크 |
| 권한 분리 | RBAC (user/admin) | 글 삭제 권한 역할별 분리 |

---

## 10. 확장 포인트 (Phase 2+)

| 항목 | 방법 |
|------|------|
| PostgreSQL 전환 | `lib/app-db/db.ts`만 교체 (나머지 코드 무변경) |
| 댓글 기능 | `comments` 테이블 추가 |
| 파일 첨부 | `post_attachments` 테이블 + `/public/uploads` |
| 관리자 페이지 | `role === 'admin'` 체크 후 `/admin` 라우트 |
| 소셜 로그인 | next-auth로 인증 레이어 교체 |
| Refresh Token | Access Token 단기화 + Refresh Token 별도 관리 |
| 계정 잠금 | 로그인 실패 N회 시 일정 시간 잠금 |

---

*작성일: 2026-02-27*
