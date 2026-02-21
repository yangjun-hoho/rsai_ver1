'use client';

import { useState } from 'react';
import { optionData } from './templates';

interface OptionFormProps {
  onSubmit: (options: Record<string, unknown>) => void;
  isLoading: boolean;
}

const formStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '0.75rem' };
const labelStyle: React.CSSProperties = { fontSize: '0.78rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '0.25rem', display: 'block' };
const selectStyle: React.CSSProperties = { width: '100%', padding: '0.4rem 0.6rem', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '0.8rem', background: 'var(--input-background)', color: 'var(--text-primary)' };
const textareaStyle: React.CSSProperties = { ...selectStyle, resize: 'vertical', minHeight: '80px', fontFamily: 'inherit' };
const btnStyle: React.CSSProperties = { width: '100%', padding: '0.6rem', background: 'var(--focus-color)', color: 'white', border: 'none', borderRadius: '6px', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer', marginTop: '0.5rem' };

export default function OptionForm({ onSubmit, isLoading }: OptionFormProps) {
  const [formState, setFormState] = useState({
    speechCategory: '',
    greetingType: '개회사',
    specificSituation: '',
    speaker: '시장',
    audienceType: '시민',
    quoteType1: '없음',
    quoteType2: '없음',
    season: '없음',
    speechLength: '표준 (1000-1200자)',
    coreContent: '',
  });

  const update = (key: string, value: string) => setFormState(prev => ({ ...prev, [key]: value }));

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    onSubmit(formState);
  }

  return (
    <form onSubmit={handleSubmit} style={formStyle}>
      <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '0.25rem' }}>
        <h2 style={{ color: 'white', margin: 0, fontSize: '0.9rem', fontWeight: '600' }}>🎤 인사말씀 설정</h2>
      </div>

      <div>
        <label style={labelStyle}>행사 유형 *</label>
        <select style={selectStyle} value={formState.speechCategory} onChange={e => update('speechCategory', e.target.value)} required>
          <option value="">선택해주세요</option>
          {optionData.speechCategories.map(v => <option key={v} value={v}>{v}</option>)}
        </select>
      </div>

      <div>
        <label style={labelStyle}>말씀 유형 *</label>
        <select style={selectStyle} value={formState.greetingType} onChange={e => update('greetingType', e.target.value)}>
          {optionData.greetingTypes.map(v => <option key={v} value={v}>{v}</option>)}
        </select>
      </div>

      <div>
        <label style={labelStyle}>구체적 상황 *</label>
        <input style={{ ...selectStyle }} type="text" placeholder="예: 2025년 남양주시 스마트도시 추진단 발대식" value={formState.specificSituation} onChange={e => update('specificSituation', e.target.value)} required />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
        <div>
          <label style={labelStyle}>발언자</label>
          <select style={selectStyle} value={formState.speaker} onChange={e => update('speaker', e.target.value)}>
            {optionData.speakers.map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>청중 유형</label>
          <select style={selectStyle} value={formState.audienceType} onChange={e => update('audienceType', e.target.value)}>
            {optionData.audienceTypes.map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
        <div>
          <label style={labelStyle}>인용구 유형</label>
          <select style={selectStyle} value={formState.quoteType1} onChange={e => update('quoteType1', e.target.value)}>
            {optionData.quoteTypes1.map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>인용구 분위기</label>
          <select style={selectStyle} value={formState.quoteType2} onChange={e => update('quoteType2', e.target.value)}>
            {optionData.quoteTypes2.map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
        <div>
          <label style={labelStyle}>계절/시기</label>
          <select style={selectStyle} value={formState.season} onChange={e => update('season', e.target.value)}>
            {optionData.seasons.map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>말씀 길이</label>
          <select style={selectStyle} value={formState.speechLength} onChange={e => update('speechLength', e.target.value)}>
            {optionData.speechLengths.map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label style={labelStyle}>핵심 내용 (선택)</label>
        <textarea style={textareaStyle} placeholder="포함시키고 싶은 핵심 내용이나 특별한 사항을 입력하세요..." value={formState.coreContent} onChange={e => update('coreContent', e.target.value)} />
      </div>

      <button type="submit" style={{ ...btnStyle, opacity: isLoading ? 0.7 : 1 }} disabled={isLoading}>
        {isLoading ? '생성 중...' : '✨ 인사말씀 생성'}
      </button>
    </form>
  );
}
