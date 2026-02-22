# ChartEditor AI 연동 기술 보고서

## 개요

사용자가 채팅창에서 데이터를 입력하면 AI가 파싱하여 **ChartEditor**를 자동으로 초기화하고, 미리보기 패널에 인터랙티브 차트를 띄우는 기능이다. 기존 ChartEditor(독립 편집기)에 `initialData` props를 추가하는 **방식 A**로 구현하여, AI가 생성한 데이터로 에디터를 초기화한 뒤 사용자가 직접 수정도 가능하다.

---

## 파일 구조

```
lib/
  work-support/
    chart-editor/
      ChartEditor.tsx           ← initialData prop 추가, ChartSpec 타입 export
  chat/
    forms/
      ChartChatForm.tsx         ← 신규: 차트 생성 폼 (제목/데이터/차트유형/색상)
    InputArea.tsx               ← chart 폼 등록
    Sidebar.tsx                 ← 'chart' ToolId 추가
    PreviewPanel.tsx            ← chart 탭 렌더링 추가

app/
  api/
    chart/
      route.ts                  ← 신규: 자연어 → 차트 JSON 변환 AI API
  page.tsx                      ← chart tool 처리 추가
```

---

## 데이터 흐름

```
[채팅 사이드바] 📊 차트 클릭
        ↓
[InputArea] ChartChatForm 표시
  - 차트 제목 입력
  - 데이터 입력 (자연어 또는 항목:값 형식)
  - 차트 유형 선택 (막대/선/파이 등)
  - 색상 테마 선택
        ↓
[app/page.tsx] handleToolSubmit('chart', data)
        ↓
[POST /api/chart]
  Gemini AI가 자연어 데이터를 파싱하여 JSON 반환:
  {
    title: string,
    xAxisLabel: string,
    yAxisLabel: string,
    chartType: 'bar' | 'line' | 'pie' | ...,
    colorTheme: 'blue' | 'rainbow' | ...,
    data: [{ 항목: string, 값: number }, ...]
  }
        ↓
[previewStore] 'chart' 키로 저장
        ↓
[PreviewPanel] 'chart' 탭 활성화
  → <ChartEditor key={...} initialData={result} />
  → Chart.js 렌더링 + 편집 가능
```

---

## 핵심 구현: ChartEditor initialData Prop

### 변경 전 (데이터 외부 주입 불가)
```tsx
export default function ChartEditor() {
  const [chartTitle, setChartTitle] = useState('부서별 매출 현황');
  const [chartData, setChartData]   = useState([{ 항목: '총무과', 값: 150 }, ...]);
  // 하드코딩된 기본값만 사용
```

### 변경 후 (AI 데이터 주입 가능)
```tsx
export interface ChartSpec {
  title?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  chartType?: ChartType;
  colorTheme?: ColorTheme;
  data?: { 항목: string; 값: number }[];
}

export default function ChartEditor({ initialData }: { initialData?: ChartSpec }) {
  const [chartTitle, setChartTitle] = useState(initialData?.title ?? '제목 없는 차트');
  const [chartData, setChartData]   = useState(initialData?.data ?? [{ 항목: '항목 1', 값: 0 }]);
  // AI 데이터로 초기화 + 이후 사용자 직접 수정 가능
```

### PreviewPanel에서 remount 처리
```tsx
// key에 data를 직렬화하여 새 데이터 도착 시 ChartEditor 강제 리마운트
<ChartEditor
  key={JSON.stringify(data)}
  initialData={data as ChartSpec}
/>
```
→ 같은 데이터면 리마운트 없음, 새 AI 결과가 오면 자동 초기화

---

## API 스펙: POST /api/chart

### Request
```json
{
  "title": "부서별 예산 현황",
  "content": "총무과 150, 민원과 230, 세무과 180, 건설과 120",
  "chartType": "bar",
  "colorTheme": "blue",
  "request": "단위는 백만원"
}
```

### Response
```json
{
  "title": "부서별 예산 현황",
  "xAxisLabel": "부서명",
  "yAxisLabel": "예산액 (백만원)",
  "chartType": "bar",
  "colorTheme": "blue",
  "data": [
    { "항목": "총무과", "값": 150 },
    { "항목": "민원과", "값": 230 },
    { "항목": "세무과", "값": 180 },
    { "항목": "건설과", "값": 120 }
  ]
}
```

### AI 역할
- 자연어 데이터 파싱 ("총무과 150만원" → `{ 항목: "총무과", 값: 150 }`)
- 적절한 X/Y 축 라벨 추론
- 요청사항 반영 (색상, 단위, 정렬 등)
- 모델: `gemini-2.0-flash-lite` (비스트리밍 JSON)

---

## 지원 차트 유형

| 유형 | 값 | 설명 |
|------|----|------|
| 막대 차트 | `bar` | 항목별 비교에 적합 |
| 선 차트 | `line` | 추세/시계열 데이터 |
| 파이 차트 | `pie` | 구성 비율 표시 |
| 도넛 차트 | `doughnut` | 파이 변형, 중앙 여백 |
| 레이더 차트 | `radar` | 다차원 비교 |
| 극지 차트 | `polarArea` | 방사형 면적 |
| 산점도 | `scatter` | XY 분포 |

---

## 입력 데이터 형식 예시

사용자는 자연어로 자유롭게 입력 가능. AI가 파싱.

```
# 자연어
총무과 150만원, 민원과 230만원, 세무과 180만원

# 표 형식
부서명   예산
총무과   150
민원과   230

# 리스트 형식
- 총무과: 150
- 민원과: 230
- 세무과: 180
```

---

## 사용자 워크플로우

1. 사이드바에서 **📊 차트** 클릭
2. 폼에서 데이터 입력 + 차트 유형/색상 선택
3. **차트 생성** 버튼 클릭
4. 미리보기 패널 `📊 차트` 탭에 ChartEditor 자동 표시
5. 에디터에서 데이터, 스타일, 유형 실시간 수정 가능
6. **차트 저장** 버튼으로 PNG 다운로드
