'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface ChartDataRow {
  항목: string;
  값: number;
}

type ChartType = 'bar' | 'line' | 'pie' | 'doughnut' | 'radar' | 'polarArea' | 'scatter';
type ColorTheme = 'blue' | 'red' | 'green' | 'yellow' | 'purple' | 'rainbow' | 'ocean' | 'sunset';

export interface ChartSpec {
  title?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  chartType?: ChartType;
  colorTheme?: ColorTheme;
  data?: ChartDataRow[];
}

const colorPalettes: Record<ColorTheme, string[]> = {
  blue:    ['#4285F4', '#1976D2', '#0D47A1', '#42A5F5', '#64B5F6', '#90CAF9', '#BBDEFB', '#E3F2FD'],
  red:     ['#F44336', '#D32F2F', '#B71C1C', '#EF5350', '#E57373', '#FFCDD2', '#FFEBEE', '#FCE4EC'],
  green:   ['#4CAF50', '#388E3C', '#1B5E20', '#66BB6A', '#81C784', '#A5D6A7', '#C8E6C9', '#E8F5E8'],
  yellow:  ['#FF9800', '#F57C00', '#E65100', '#FFB74D', '#FFCC02', '#FFE082', '#FFF3C4', '#FFFDE7'],
  purple:  ['#9C27B0', '#7B1FA2', '#4A148C', '#BA68C8', '#CE93D8', '#E1BEE7', '#F3E5F5', '#FCE4EC'],
  rainbow: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'],
  ocean:   ['#006994', '#13829B', '#4CB5AE', '#9CCCB4', '#C7E8CA', '#E8F6F3', '#B8E6E1', '#7DD3C0'],
  sunset:  ['#FF7F7F', '#FF9F40', '#FFCD56', '#4BC0C0', '#9966FF', '#C9CBCF', '#FF6384', '#FF9F40'],
};

const chartTypeOptions = [
  { value: 'bar',       label: '📊 막대 차트' },
  { value: 'line',      label: '📈 선 차트' },
  { value: 'pie',       label: '🥧 파이 차트' },
  { value: 'doughnut',  label: '🍩 도넛 차트' },
  { value: 'radar',     label: '🕸️ 레이더 차트' },
  { value: 'polarArea', label: '🎯 극지 차트' },
  { value: 'scatter',   label: '🔵 산점도' },
];

const colorThemeOptions = [
  { value: 'blue',    label: '🔵 블루 계열' },
  { value: 'red',     label: '🔴 레드 계열' },
  { value: 'green',   label: '🟢 그린 계열' },
  { value: 'yellow',  label: '🟡 옐로우 계열' },
  { value: 'purple',  label: '🟣 퍼플 계열' },
  { value: 'rainbow', label: '🌈 레인보우' },
  { value: 'ocean',   label: '🌊 오션 블루' },
  { value: 'sunset',  label: '🌅 선셋' },
];

const circularChartTypes = ['pie', 'doughnut', 'polarArea', 'radar'];

const DEFAULT_DATA: ChartDataRow[] = [
  { 항목: '총무과', 값: 150 },
  { 항목: '민원과', 값: 230 },
  { 항목: '세무과', 값: 180 },
  { 항목: '건설과', 값: 120 },
  { 항목: '교통과', 값: 120 },
  { 항목: '복지과', 값: 200 },
];

export default function ChartEditor({ initialData }: { initialData?: ChartSpec }) {
  // 차트 설정 (initialData가 있으면 해당 값으로 초기화)
  const [chartTitle, setChartTitle]           = useState(initialData?.title      ?? '부서별 매출 현황');
  const [xAxisLabel, setXAxisLabel]           = useState(initialData?.xAxisLabel ?? '부서명');
  const [yAxisLabel, setYAxisLabel]           = useState(initialData?.yAxisLabel ?? '예산액 (백만원)');
  const [chartType, setChartType]             = useState<ChartType>(initialData?.chartType   ?? 'bar');
  const [colorTheme, setColorTheme]           = useState<ColorTheme>(initialData?.colorTheme ?? 'blue');

  // 스타일 설정
  const [barThickness, setBarThickness]             = useState(30);
  const [maxBarThickness, setMaxBarThickness]       = useState(50);
  const [titleFontSize, setTitleFontSize]           = useState(16);
  const [axisTitleFontSize, setAxisTitleFontSize]   = useState(12);
  const [axisLabelFontSize, setAxisLabelFontSize]   = useState(10);
  const [showGrid, setShowGrid]                     = useState(true);
  const [animationDuration, setAnimationDuration]   = useState(1000);
  const [borderWidth, setBorderWidth]               = useState(1);

  // 데이터 (initialData가 있으면 해당 데이터로 초기화)
  const [chartData, setChartData] = useState<ChartDataRow[]>(initialData?.data ?? DEFAULT_DATA);

  // 차트 상태
  const canvasRef     = useRef<HTMLCanvasElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const chartRef      = useRef<any>(null);
  const [chartReady, setChartReady] = useState(false);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 최신 상태를 ref로 유지 (클로저 문제 방지)
  const stateRef = useRef({
    chartTitle, xAxisLabel, yAxisLabel, chartType, colorTheme,
    barThickness, maxBarThickness, titleFontSize, axisTitleFontSize,
    axisLabelFontSize, showGrid, animationDuration, borderWidth, chartData,
  });

  useEffect(() => {
    stateRef.current = {
      chartTitle, xAxisLabel, yAxisLabel, chartType, colorTheme,
      barThickness, maxBarThickness, titleFontSize, axisTitleFontSize,
      axisLabelFontSize, showGrid, animationDuration, borderWidth, chartData,
    };
  });

  // Chart.js CDN 로드
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((window as any).Chart) {
      const t = setTimeout(() => setChartReady(true), 0);
      return () => clearTimeout(t);
    }
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js';
    script.onload = () => setChartReady(true);
    document.head.appendChild(script);
  }, []);

  // 차트 생성/업데이트
  const updateChart = useCallback(() => {
    const s = stateRef.current;
    const canvas = canvasRef.current;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ChartJS = (window as any).Chart;
    if (!canvas || !ChartJS) return;

    const colors = colorPalettes[s.colorTheme] || colorPalettes.blue;
    const labels = s.chartData.map(item => item.항목);
    const values = s.chartData.map(item => Number(item.값) || 0);
    const isCircular = circularChartTypes.includes(s.chartType);

    if (chartRef.current) {
      chartRef.current.destroy();
      chartRef.current = null;
    }

    const config = {
      type: s.chartType,
      data: {
        labels,
        datasets: [{
          label: s.yAxisLabel,
          data: values,
          backgroundColor: s.chartType === 'line' ? 'rgba(0,0,0,0)' : colors.slice(0, values.length),
          borderColor: colors[0],
          borderWidth: s.chartType === 'line' ? 3 : s.borderWidth,
          fill: s.chartType === 'line' ? false : true,
          tension: s.chartType === 'line' ? 0.4 : 0,
          pointBackgroundColor: s.chartType === 'line' ? colors[0] : undefined,
          pointBorderColor: s.chartType === 'line' ? '#fff' : undefined,
          pointBorderWidth: s.chartType === 'line' ? 2 : undefined,
          pointRadius: s.chartType === 'line' ? 6 : undefined,
          barThickness: s.chartType === 'bar' ? Number(s.barThickness) : undefined,
          maxBarThickness: s.chartType === 'bar' ? s.maxBarThickness : undefined,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: s.chartTitle,
            font: { size: s.titleFontSize, weight: 'bold' as const },
            color: '#333',
          },
          legend: {
            display: isCircular,
            position: 'bottom' as const,
            labels: { font: { size: s.axisLabelFontSize } },
          },
        },
        scales: {
          x: {
            display: !isCircular,
            title: {
              display: true,
              text: s.xAxisLabel,
              font: { size: s.axisTitleFontSize, weight: 'bold' as const },
            },
            ticks: { font: { size: s.axisLabelFontSize } },
            grid: { display: s.showGrid, color: 'rgba(0,0,0,0.1)' },
          },
          y: {
            display: !isCircular,
            title: {
              display: true,
              text: s.yAxisLabel,
              font: { size: s.axisTitleFontSize, weight: 'bold' as const },
            },
            ticks: { font: { size: s.axisLabelFontSize } },
            grid: { display: s.showGrid, color: 'rgba(0,0,0,0.1)' },
            beginAtZero: true,
          },
        },
        animation: {
          duration: s.animationDuration,
          easing: 'easeInOutQuart' as const,
        },
      },
    };

    chartRef.current = new ChartJS(canvas, config);
  }, []);

  const debouncedUpdate = useCallback(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => updateChart(), 100);
  }, [updateChart]);

  // 차트 준비되면 초기 렌더링
  useEffect(() => {
    if (!chartReady) return;
    const timer = setTimeout(() => updateChart(), 300);
    return () => clearTimeout(timer);
  }, [chartReady, updateChart]);

  // 상태 변경 시 차트 업데이트
  useEffect(() => {
    if (!chartReady) return;
    debouncedUpdate();
  }, [
    chartTitle, xAxisLabel, yAxisLabel, chartType, colorTheme,
    barThickness, maxBarThickness, titleFontSize, axisTitleFontSize,
    axisLabelFontSize, showGrid, animationDuration, borderWidth,
    chartData, chartReady, debouncedUpdate,
  ]);

  // 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (chartRef.current) chartRef.current.destroy();
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  const addRow = () => {
    setChartData(prev => [...prev, { 항목: `새 항목 ${prev.length + 1}`, 값: 0 }]);
  };

  const removeRow = (index: number) => {
    setChartData(prev => {
      if (prev.length <= 1) return prev;
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleDataChange = (index: number, field: '항목' | '값', value: string) => {
    setChartData(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: field === '값' ? (Number(value) || 0) : value,
      };
      return updated;
    });
  };

  const saveChart = () => {
    if (chartRef.current) {
      const link = document.createElement('a');
      link.download = `${chartTitle.replace(/\s+/g, '_')}.png`;
      link.href = chartRef.current.toBase64Image();
      link.click();
    }
  };

  return (
    <>
      <style>{`
        .ce-container {
          display: grid;
          grid-template-columns: 1fr 1fr 2fr;
          gap: 16px;
          height: 100%;
          padding: 16px;
          background: #faf9f5;
          font-family: 'Malgun Gothic', Arial, sans-serif;
          box-sizing: border-box;
        }
        .ce-left {
          display: flex;
          flex-direction: column;
          gap: 16px;
          overflow-y: auto;
          max-height: 100%;
          scrollbar-width: thin;
          scrollbar-color: #ccc transparent;
        }
        .ce-data {
          display: flex;
          flex-direction: column;
          gap: 16px;
          overflow-y: auto;
          max-height: 100%;
          scrollbar-width: thin;
          scrollbar-color: #ccc transparent;
        }
        .ce-preview {
          display: flex;
          flex-direction: column;
          min-height: 0;
        }
        .ce-card {
          background: white;
          border-radius: 10px;
          padding: 16px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.07);
          border: 1px solid rgba(0,0,0,0.06);
          box-sizing: border-box;
        }
        .ce-chart-card {
          background: white;
          border-radius: 10px;
          padding: 16px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.07);
          border: 1px solid rgba(0,0,0,0.06);
          flex: 1;
          display: flex;
          flex-direction: column;
          min-height: 0;
        }
        .ce-section-title {
          font-size: 0.8rem;
          font-weight: 500;
          color: #333;
          margin: 0 0 12px 0;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .ce-form-group {
          margin-bottom: 8px;
          width: 100%;
          box-sizing: border-box;
        }
        .ce-label {
          display: block;
          font-size: 0.7rem;
          font-weight: 300;
          color: #555;
          margin-bottom: 4px;
        }
        .ce-input {
          width: 100%;
          padding: 8px 10px;
          border: 1px solid #ddd;
          border-radius: 5px;
          font-size: 0.7rem;
          transition: border-color 0.2s;
          background: #fafafa;
          box-sizing: border-box;
        }
        .ce-input:focus {
          outline: none;
          border-color: #667eea;
          background: white;
          box-shadow: 0 0 0 3px rgba(102,126,234,0.1);
        }
        .ce-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        .ce-style-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
        }
        .ce-number-input {
          width: 100%;
          padding: 5px 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 0.7rem;
          background: #fafafa;
          box-sizing: border-box;
          text-align: center;
        }
        .ce-number-input:focus {
          outline: none;
          border-color: #667eea;
          background: white;
          box-shadow: 0 0 0 3px rgba(102,126,234,0.1);
        }
        .ce-checkbox-group {
          grid-column: 1 / -1;
        }
        .ce-checkbox-label {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.75rem;
          cursor: pointer;
        }
        .ce-data-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
          padding-bottom: 8px;
          border-bottom: 1px solid #f1f3f4;
        }
        .ce-add-btn {
          background: linear-gradient(135deg, #28a745, #20c997);
          color: white;
          border: none;
          padding: 7px 12px;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 500;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 5px;
          transition: all 0.2s;
          box-shadow: 0 2px 4px rgba(40,167,69,0.2);
        }
        .ce-add-btn:hover {
          background: linear-gradient(135deg, #218838, #1ea085);
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(40,167,69,0.3);
        }
        .ce-data-table {
          border: 1px solid #e9ecef;
          border-radius: 8px;
          overflow: hidden;
          margin-bottom: 16px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.04);
        }
        .ce-table-header {
          display: grid;
          grid-template-columns: 1fr 1fr 50px;
          background: linear-gradient(135deg, #f8f9fa, #e9ecef);
          font-weight: 400;
          font-size: 0.7rem;
          color: #495057;
          border-bottom: 2px solid #dee2e6;
        }
        .ce-table-row {
          display: grid;
          grid-template-columns: 1fr 1fr 50px;
          border-bottom: 1px solid #f8f9fa;
          transition: background 0.2s;
        }
        .ce-table-row:last-child { border-bottom: none; }
        .ce-table-row:hover { background: #f8f9fa; }
        .ce-table-row:nth-child(even) { background: #fdfdfd; }
        .ce-table-row:nth-child(even):hover { background: #f8f9fa; }
        .ce-table-cell {
          padding: 5px 9px;
          display: flex;
          align-items: center;
          border-right: 1px solid #f1f3f4;
          min-height: 44px;
        }
        .ce-table-cell:last-child {
          border-right: none;
          justify-content: center;
        }
        .ce-table-input {
          width: 100%;
          padding: 6px 8px;
          border: 1px solid #ddd;
          border-radius: 5px;
          font-size: 0.75rem;
          background: white;
          transition: all 0.2s;
          box-sizing: border-box;
        }
        .ce-table-input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102,126,234,0.15);
        }
        .ce-table-input[type="number"] {
          text-align: center;
          font-weight: 500;
        }
        .ce-remove-btn {
          background: linear-gradient(135deg, #dc3545, #c82333);
          color: white;
          border: none;
          padding: 6px 8px;
          border-radius: 5px;
          font-size: 0.75rem;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 26px;
          height: 26px;
          box-shadow: 0 2px 4px rgba(220,53,69,0.2);
        }
        .ce-remove-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, #c82333, #a71e2a);
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(220,53,69,0.3);
        }
        .ce-remove-btn:disabled {
          background: #e9ecef;
          color: #6c757d;
          cursor: not-allowed;
          box-shadow: none;
        }
        .ce-action-buttons {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }
        .ce-btn {
          padding: 8px 14px;
          border: none;
          border-radius: 6px;
          font-size: 0.72rem;
          font-weight: 400;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          transition: all 0.2s;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .ce-btn-primary {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
        }
        .ce-btn-primary:hover {
          background: linear-gradient(135deg, #5a6fd8, #6a42a0);
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(102,126,234,0.3);
        }
        .ce-btn-secondary {
          background: linear-gradient(135deg, #6c757d, #5a6268);
          color: white;
        }
        .ce-btn-secondary:hover {
          background: linear-gradient(135deg, #5a6268, #495057);
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(108,117,125,0.3);
        }
        .ce-btn:active { transform: translateY(0); }
        .ce-chart-container {
          flex: 1;
          position: relative;
          height: 480px;
          margin-bottom: 12px;
        }
        .ce-chart-container canvas {
          max-width: 100%;
        }
        .ce-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: #6c757d;
          gap: 10px;
        }
        .ce-loading-icon {
          font-size: 2rem;
          animation: ce-spin 1s linear infinite;
        }
        @keyframes ce-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .ce-info-alert {
          background: #d1ecf1;
          color: #0c5460;
          padding: 10px 14px;
          border-radius: 6px;
          border: 1px solid #bee5eb;
          font-size: 0.82rem;
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }
        @media (max-width: 1200px) {
          .ce-container { grid-template-columns: 1fr 1fr 1.5fr; }
        }
        @media (max-width: 1024px) {
          .ce-container {
            grid-template-columns: 1fr;
            height: auto;
          }
          .ce-left, .ce-data { max-height: none; overflow-y: visible; }
          .ce-chart-container { height: 350px; }
        }
        @media (max-width: 768px) {
          .ce-container { padding: 8px; gap: 10px; }
          .ce-action-buttons { grid-template-columns: 1fr; }
          .ce-chart-container { height: 280px; }
          .ce-grid-2, .ce-style-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="ce-container">
        {/* 1열: 차트 설정 + 스타일 설정 */}
        <div className="ce-left">
          {/* 차트 설정 */}
          <div className="ce-card">
            <h3 className="ce-section-title">⚙️ 차트 설정</h3>

            <div className="ce-form-group">
              <label className="ce-label">차트 제목</label>
              <input
                type="text"
                className="ce-input"
                value={chartTitle}
                onChange={e => setChartTitle(e.target.value)}
                placeholder="차트 제목을 입력하세요"
              />
            </div>

            <div className="ce-grid-2">
              <div className="ce-form-group">
                <label className="ce-label">차트 타입</label>
                <select
                  className="ce-input"
                  value={chartType}
                  onChange={e => setChartType(e.target.value as ChartType)}
                >
                  {chartTypeOptions.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
              <div className="ce-form-group">
                <label className="ce-label">색상 테마</label>
                <select
                  className="ce-input"
                  value={colorTheme}
                  onChange={e => setColorTheme(e.target.value as ColorTheme)}
                >
                  {colorThemeOptions.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="ce-grid-2">
              <div className="ce-form-group">
                <label className="ce-label">X축 라벨</label>
                <input
                  type="text"
                  className="ce-input"
                  value={xAxisLabel}
                  onChange={e => setXAxisLabel(e.target.value)}
                  placeholder="X축 라벨"
                />
              </div>
              <div className="ce-form-group">
                <label className="ce-label">Y축 라벨</label>
                <input
                  type="text"
                  className="ce-input"
                  value={yAxisLabel}
                  onChange={e => setYAxisLabel(e.target.value)}
                  placeholder="Y축 라벨"
                />
              </div>
            </div>
          </div>

          {/* 스타일 설정 */}
          <div className="ce-card">
            <h3 className="ce-section-title">🎨 스타일 설정</h3>
            <div className="ce-style-grid">
              {chartType === 'bar' && (
                <>
                  <div className="ce-form-group">
                    <label className="ce-label">막대 두께 (px)</label>
                    <input
                      type="number" min={10} max={80}
                      className="ce-number-input"
                      value={barThickness}
                      onChange={e => setBarThickness(Number(e.target.value))}
                    />
                  </div>
                  <div className="ce-form-group">
                    <label className="ce-label">최대 막대 두께 (px)</label>
                    <input
                      type="number" min={20} max={100}
                      className="ce-number-input"
                      value={maxBarThickness}
                      onChange={e => setMaxBarThickness(Number(e.target.value))}
                    />
                  </div>
                </>
              )}
              <div className="ce-form-group">
                <label className="ce-label">제목 폰트 크기 (px)</label>
                <input
                  type="number" min={10} max={24}
                  className="ce-number-input"
                  value={titleFontSize}
                  onChange={e => setTitleFontSize(Number(e.target.value))}
                />
              </div>
              <div className="ce-form-group">
                <label className="ce-label">축 제목 폰트 크기 (px)</label>
                <input
                  type="number" min={8} max={18}
                  className="ce-number-input"
                  value={axisTitleFontSize}
                  onChange={e => setAxisTitleFontSize(Number(e.target.value))}
                />
              </div>
              <div className="ce-form-group">
                <label className="ce-label">축 라벨 폰트 크기 (px)</label>
                <input
                  type="number" min={6} max={16}
                  className="ce-number-input"
                  value={axisLabelFontSize}
                  onChange={e => setAxisLabelFontSize(Number(e.target.value))}
                />
              </div>
              <div className="ce-form-group">
                <label className="ce-label">테두리 두께 (px)</label>
                <input
                  type="number" min={0} max={5}
                  className="ce-number-input"
                  value={borderWidth}
                  onChange={e => setBorderWidth(Number(e.target.value))}
                />
              </div>
              <div className="ce-form-group">
                <label className="ce-label">애니메이션 시간 (ms)</label>
                <input
                  type="number" min={0} max={3000} step={100}
                  className="ce-number-input"
                  value={animationDuration}
                  onChange={e => setAnimationDuration(Number(e.target.value))}
                />
              </div>
              <div className="ce-form-group ce-checkbox-group">
                <label className="ce-checkbox-label">
                  <input
                    type="checkbox"
                    checked={showGrid}
                    onChange={e => setShowGrid(e.target.checked)}
                    style={{ width: 16, height: 16, accentColor: '#667eea', cursor: 'pointer' }}
                  />
                  격자 표시
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* 2열: 데이터 입력 */}
        <div className="ce-data">
          <div className="ce-card">
            <div className="ce-data-header">
              <h3 className="ce-section-title" style={{ margin: 0 }}>📋 데이터 입력</h3>
              <button className="ce-add-btn" onClick={addRow}>
                + 행 추가
              </button>
            </div>

            <div className="ce-data-table">
              <div className="ce-table-header">
                <div className="ce-table-cell">{xAxisLabel}</div>
                <div className="ce-table-cell">{yAxisLabel}</div>
                <div className="ce-table-cell">작업</div>
              </div>
              {chartData.map((row, index) => (
                <div key={index} className="ce-table-row">
                  <div className="ce-table-cell">
                    <input
                      type="text"
                      className="ce-table-input"
                      value={row.항목}
                      onChange={e => handleDataChange(index, '항목', e.target.value)}
                      placeholder="항목명"
                    />
                  </div>
                  <div className="ce-table-cell">
                    <input
                      type="number"
                      className="ce-table-input"
                      value={row.값}
                      onChange={e => handleDataChange(index, '값', e.target.value)}
                      placeholder="0"
                    />
                  </div>
                  <div className="ce-table-cell">
                    <button
                      className="ce-remove-btn"
                      onClick={() => removeRow(index)}
                      disabled={chartData.length <= 1}
                      title="행 삭제"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="ce-action-buttons">
              <button className="ce-btn ce-btn-primary" onClick={debouncedUpdate}>
                🔄 수동 새로고침
              </button>
              <button className="ce-btn ce-btn-secondary" onClick={saveChart}>
                💾 차트 저장
              </button>
            </div>
          </div>
        </div>

        {/* 3열: 실시간 차트 미리보기 */}
        <div className="ce-preview">
          <div className="ce-chart-card">
            <h3 className="ce-section-title">📊 실시간 차트 미리보기</h3>

            <div className="ce-chart-container">
              {!chartReady ? (
                <div className="ce-loading">
                  <span className="ce-loading-icon">⏳</span>
                  <p style={{ margin: 0, fontSize: '0.9rem' }}>Chart.js를 로딩하는 중...</p>
                </div>
              ) : (
                <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
              )}
            </div>

            <div className="ce-info-alert">
              ℹ️ 좌측에서 설정과 데이터를 변경하면 차트가 실시간으로 업데이트됩니다.
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
