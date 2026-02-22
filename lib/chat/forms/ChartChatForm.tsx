'use client';

import { useState } from 'react';
import { S } from './chatFormStyles';

interface Props {
  onSubmit: (data: Record<string, unknown>) => void;
  onCancel: () => void;
  isLoading: boolean;
}

const CHART_TYPES = [
  { value: '',          label: '자동 선택 (AI 추천)' },
  { value: 'bar',       label: '📊 막대 차트' },
  { value: 'line',      label: '📈 선 차트' },
  { value: 'pie',       label: '🥧 파이 차트' },
  { value: 'doughnut',  label: '🍩 도넛 차트' },
  { value: 'radar',     label: '🕸️ 레이더 차트' },
  { value: 'polarArea', label: '🎯 극지 차트' },
];

const COLOR_THEMES = [
  { value: '',        label: '자동 선택' },
  { value: 'blue',    label: '🔵 블루' },
  { value: 'red',     label: '🔴 레드' },
  { value: 'green',   label: '🟢 그린' },
  { value: 'yellow',  label: '🟡 옐로우' },
  { value: 'purple',  label: '🟣 퍼플' },
  { value: 'rainbow', label: '🌈 레인보우' },
  { value: 'ocean',   label: '🌊 오션' },
  { value: 'sunset',  label: '🌅 선셋' },
];

const PLACEHOLDER = `예시:
총무과: 150
민원과: 230
세무과: 180
건설과: 120

또는 CSV, 표, 자연어 형태도 가능합니다.`;

export default function ChartChatForm({ onSubmit, onCancel, isLoading }: Props) {
  const [userInput, setUserInput]   = useState('');
  const [title, setTitle]           = useState('');
  const [chartType, setChartType]   = useState('');
  const [colorTheme, setColorTheme] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!userInput.trim() || isLoading) return;
    onSubmit({ userInput, title, chartType, colorTheme });
  }

  return (
    <form onSubmit={handleSubmit} style={S.card}>
      {/* 헤더 */}
      <div style={S.header}>
        <h3 style={S.h3}>📊 AI 차트 생성</h3>
        <p style={S.desc}>데이터를 입력하면 AI가 자동으로 차트를 그려줍니다</p>
      </div>

      {/* 입력 필드 */}
      <div style={S.content}>
        {/* 데이터 입력 */}
        <div>
          <label style={S.label}>
            데이터 입력 <span style={{ color: '#e53e3e' }}>*</span>
          </label>
          <textarea
            value={userInput}
            onChange={e => setUserInput(e.target.value)}
            placeholder={PLACEHOLDER}
            required
            rows={6}
            style={{ ...S.input, resize: 'vertical' }}
          />
        </div>

        {/* 차트 제목 */}
        <div>
          <label style={S.label}>차트 제목 (선택)</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="예: 부서별 민원 처리 건수"
            style={S.input}
          />
        </div>

        {/* 차트 유형 + 색상 테마 */}
        <div style={S.row}>
          <div>
            <label style={S.label}>차트 유형</label>
            <select
              value={chartType}
              onChange={e => setChartType(e.target.value)}
              style={S.input}
            >
              {CHART_TYPES.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={S.label}>색상 테마</label>
            <select
              value={colorTheme}
              onChange={e => setColorTheme(e.target.value)}
              style={S.input}
            >
              {COLOR_THEMES.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 버튼 */}
      <div style={S.actions}>
        <button type="button" onClick={onCancel} style={S.cancelBtn}>
          취소
        </button>
        <button
          type="submit"
          disabled={!userInput.trim() || isLoading}
          style={{ ...S.submitBtn, opacity: !userInput.trim() || isLoading ? 0.5 : 1 }}
        >
          {isLoading ? '⏳ 생성 중...' : '📊 차트 생성'}
        </button>
      </div>
    </form>
  );
}
