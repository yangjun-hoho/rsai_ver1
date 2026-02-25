# FuN fUn 코너 설계 문서

## 개요
공무원들이 잠깐 머리를 식힐 수 있는 가볍고 재미있는 미니 프로그램 모음.
완전 클라이언트사이드 (API 없음).

## 라우팅
```
/fun                    ← 랜딩 페이지 (카드 그리드)
/fun/mbti               ← MBTI 성격 테스트 (20문항)
/fun/ladder             ← 사다리게임
/fun/lunch              ← 점심메뉴 결정 룰렛
/fun/countdown          ← 퇴근 카운트다운
/fun/balance            ← 공무원 밸런스게임
/fun/fortune            ← 오늘의 업무 운세
/fun/team               ← 팀 랜덤 배정기
```

## 파일 구조
```
app/fun/
├── page.tsx            ← 랜딩 (카드 7개)
├── mbti/page.tsx
├── ladder/page.tsx
├── lunch/page.tsx
├── countdown/page.tsx
├── balance/page.tsx
├── fortune/page.tsx
└── team/page.tsx
```

## 사이드바
`lib/chat/Sidebar.tsx` SHORTCUTS 배열에 추가:
```ts
{ id: 'fun', label: 'FuN fUn', icon: '🎮', path: '/fun' }
```

## 각 프로그램 상세

### 1. MBTI 테스트
- 20문항 양자택일
- E/I, S/N, T/F, J/P 점수 집계
- 결과: 16가지 유형 + 공무원 버전 설명

### 2. 사다리게임
- 이름 2~8개 입력
- 목적지 입력 (같은 수)
- SVG 사다리 생성 + 경로 애니메이션

### 3. 점심 룰렛
- CSS 스피닝 휠
- 기본 항목: 한식/중식/일식/양식/분식/패스트푸드
- 항목 추가/삭제 가능

### 4. 퇴근 카운트다운
- 퇴근 시간 설정 (기본 18:00)
- 실시간 HH:MM:SS 카운트다운
- 진행바 + 상태 메시지

### 5. 공무원 밸런스게임
- 10개 시나리오 (공무원 공감 상황)
- 양자택일 → 퍼센트 결과 표시
- 예: "야근 vs 당직", "감사 vs 국감"

### 6. 오늘의 운세
- 날짜 기반 해시로 의사난수 생성
- 업무운 / 대인관계운 / 점심운 / 퇴근운
- 별점(1~5) + 한줄 코멘트

### 7. 팀 랜덤 배정기
- 이름 목록 입력
- 팀 수 선택 (2~6)
- 셔플 애니메이션 후 팀 배정 결과
