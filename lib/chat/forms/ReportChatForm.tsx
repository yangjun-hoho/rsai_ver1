'use client';

import { useState } from 'react';
import { S } from './chatFormStyles';

interface Props {
  onSubmit: (data: Record<string, unknown>) => void;
  onCancel: () => void;
  isLoading: boolean;
}

const reportTypes = [
  { id: 'plan',     label: '계획 보고서' },
  { id: 'measure',  label: '대책 보고서' },
  { id: 'status',   label: '상황 보고서' },
  { id: 'analysis', label: '분석 보고서' },
  { id: 'other',    label: '기타 보고서' },
];

const detailTypes: Record<string, { id: string; label: string }[]> = {
  plan:     [{ id: 'basic', label: '기본 계획' }, { id: 'detailed', label: '세부 계획' }, { id: 'business', label: '사업계획' }],
  measure:  [{ id: 'problem', label: '문제해결' }, { id: 'risk', label: '위기관리' }, { id: 'improvement', label: '개선안' }],
  status:   [{ id: 'current', label: '현황' }, { id: 'progress', label: '진행상황' }, { id: 'incident', label: '사건보고' }],
  analysis: [{ id: 'data', label: '데이터분석' }, { id: 'performance', label: '성과분석' }, { id: 'trend', label: '동향분석' }],
  other:    [{ id: 'memo', label: '간략메모' }, { id: 'meeting', label: '회의결과' }, { id: 'work', label: '업무메모' }],
};

const sampleTitles: Record<string, string[]> = {
  plan:     ['2024년 스마트시티 구축 기본계획', '디지털 전환 추진 세부 계획'],
  measure:  ['민원 처리 개선 방안', '위기상황 대응 계획'],
  status:   ['1분기 사업 추진 현황', '주요 업무 진행 현황'],
  analysis: ['빅데이터 분석 보고서', '사업 성과 분석'],
  other:    ['업무 협조 요청', '회의 결과 보고'],
};

const models = [
  { id: 'gemini-2.5-flash-lite', label: 'Gemini 2.5 Flash Lite' },
  { id: 'gpt-5-mini',            label: 'GPT-5 Mini' },
];

export default function ReportChatForm({ onSubmit, onCancel, isLoading }: Props) {
  const [reportTitle, setReportTitle]         = useState('');
  const [reportType, setReportType]           = useState('plan');
  const [detailType, setDetailType]           = useState('basic');
  const [length, setLength]                   = useState('detailed');
  const [selectedModel, setSelectedModel]     = useState('gemini-2.5-flash-lite');

  function handleTypeChange(type: string) {
    setReportType(type);
    setDetailType(detailTypes[type][0].id);
  }

  function setSample() {
    const samples = sampleTitles[reportType] || sampleTitles.plan;
    setReportTitle(samples[Math.floor(Math.random() * samples.length)]);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!reportTitle.trim()) return;
    onSubmit({ reportTitle, selectedReportType: reportType, selectedDetailType: detailType, selectedLength: length, selectedModel });
  }

  return (
    <form onSubmit={handleSubmit} style={S.card}>
      <div style={S.header}>
        <h3 style={S.h3}>📊 보고서 생성</h3>
        <p style={S.desc}>보고서 유형과 제목을 설정하세요</p>
      </div>

      <div style={S.content}>
        {/* 제목 */}
        <div>
          <label style={S.label}>보고서 제목 *</label>
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <input
              type="text"
              style={{ ...S.input, flex: 1 }}
              placeholder="보고서 제목을 입력하세요"
              value={reportTitle}
              onChange={e => setReportTitle(e.target.value)}
              disabled={isLoading}
              required
            />
            <button
              type="button"
              onClick={setSample}
              style={{ padding: '0.4rem 0.6rem', background: '#6c757d', color: 'white', border: 'none', borderRadius: '3px', fontSize: '0.7rem', cursor: 'pointer', whiteSpace: 'nowrap' }}
            >
              예시
            </button>
          </div>
        </div>

        {/* 보고서 유형 + 세부 유형 */}
        <div style={S.row}>
          <div>
            <label style={S.label}>보고서 유형</label>
            <select style={S.input} value={reportType} onChange={e => handleTypeChange(e.target.value)} disabled={isLoading}>
              {reportTypes.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label style={S.label}>세부 유형</label>
            <select style={S.input} value={detailType} onChange={e => setDetailType(e.target.value)} disabled={isLoading}>
              {(detailTypes[reportType] || []).map(dt => <option key={dt.id} value={dt.id}>{dt.label}</option>)}
            </select>
          </div>
        </div>

        {/* 길이 */}
        <div>
          <label style={S.label}>보고서 길이</label>
          <select style={S.input} value={length} onChange={e => setLength(e.target.value)} disabled={isLoading}>
            <option value="brief">간략</option>
            <option value="standard">표준</option>
            <option value="detailed">상세</option>
          </select>
        </div>

        {/* AI 모델 */}
        <div>
          <label style={S.label}>AI 모델</label>
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            {models.map(m => (
              <button
                key={m.id}
                type="button"
                onClick={() => setSelectedModel(m.id)}
                style={{
                  flex: 1, padding: '0.4rem 0.5rem',
                  border: `1px solid ${selectedModel === m.id ? '#2383e2' : '#e0e0e0'}`,
                  borderRadius: '4px',
                  background: selectedModel === m.id ? '#e8f4ff' : 'white',
                  color: selectedModel === m.id ? '#2383e2' : '#6b6b6b',
                  fontSize: '0.68rem', cursor: 'pointer',
                  fontWeight: selectedModel === m.id ? 600 : 400,
                }}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={S.actions}>
        <button type="button" style={S.cancelBtn} onClick={onCancel} disabled={isLoading}>취소</button>
        <button type="submit" style={{ ...S.submitBtn, opacity: isLoading ? 0.5 : 1 }} disabled={isLoading}>
          {isLoading ? '생성 중...' : '보고서 생성'}
        </button>
      </div>
    </form>
  );
}
