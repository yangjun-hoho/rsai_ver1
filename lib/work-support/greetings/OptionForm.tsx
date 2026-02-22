'use client';

import { useState } from 'react';
import { optionData } from './templates';

interface OptionFormProps {
  onSubmit: (options: Record<string, unknown>) => void;
  isLoading: boolean;
}

const labelStyle: React.CSSProperties = { display: 'block', marginBottom: '0.5rem', fontWeight: '400', fontSize: '0.75rem', color: '#303592' };
const inputStyle: React.CSSProperties = { width: '100%', padding: '0.3rem', border: '1px solid #ddd', borderRadius: '5px', color: '#160a72', fontSize: '0.75rem', fontWeight: '500', boxSizing: 'border-box' };
const textareaStyle: React.CSSProperties = { ...inputStyle, resize: 'vertical', height: '70px', minHeight: '70px', fontFamily: 'inherit' };

export default function OptionForm({ onSubmit, isLoading }: OptionFormProps) {
  const [formState, setFormState] = useState({
    speechCategory: '일반 행사',
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
    if (!formState.specificSituation) {
      alert('구체적 명칭을 입력해주세요.');
      return;
    }
    onSubmit(formState);
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>

      <div style={{ paddingBottom: '0.6rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
        <h2 style={{ margin: 0, fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-secondary)' }}>Greeting Settings</h2>
      </div>

      {/* 구체적 명칭 */}
      <div style={{ marginBottom: '1rem' }}>
        <label style={labelStyle}>구체적 명칭</label>
        <input
          style={inputStyle}
          type="text"
          placeholder="예> 제14회 남양주 북한강 축제, 2025 시민의 날 기념식 등"
          value={formState.specificSituation}
          onChange={e => update('specificSituation', e.target.value)}
          disabled={isLoading}
        />
      </div>

      {/* 상황 선택 + 인사말 성격 */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>상황 선택</label>
          <select style={inputStyle} value={formState.speechCategory} onChange={e => update('speechCategory', e.target.value)} disabled={isLoading}>
            {optionData.speechCategories.map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>인사말 성격</label>
          <select style={inputStyle} value={formState.greetingType} onChange={e => update('greetingType', e.target.value)} disabled={isLoading}>
            {optionData.greetingTypes.map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>
      </div>

      {/* 연설자 선택 + 주요 청중 */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>연설자 선택</label>
          <select style={inputStyle} value={formState.speaker} onChange={e => update('speaker', e.target.value)} disabled={isLoading}>
            {optionData.speakers.map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>주요 청중</label>
          <select style={inputStyle} value={formState.audienceType} onChange={e => update('audienceType', e.target.value)} disabled={isLoading}>
            {optionData.audienceTypes.map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>
      </div>

      {/* 인용구 유형 + 인용구 성격 */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>인용구 유형</label>
          <select style={inputStyle} value={formState.quoteType1} onChange={e => update('quoteType1', e.target.value)} disabled={isLoading}>
            {optionData.quoteTypes1.map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>인용구 성격</label>
          <select style={inputStyle} value={formState.quoteType2} onChange={e => update('quoteType2', e.target.value)} disabled={isLoading}>
            {optionData.quoteTypes2.map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>
      </div>

      {/* 계절/시기 선택 + 말씀 길이 */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>계절/시기 선택</label>
          <select style={inputStyle} value={formState.season} onChange={e => update('season', e.target.value)} disabled={isLoading}>
            {optionData.seasons.map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>말씀 길이</label>
          <select style={inputStyle} value={formState.speechLength} onChange={e => update('speechLength', e.target.value)} disabled={isLoading}>
            {optionData.speechLengths.map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>
      </div>

      {/* 추가 내용 */}
      <div style={{ marginBottom: '1rem' }}>
        <label style={labelStyle}>추가 내용</label>
        <textarea
          style={textareaStyle}
          placeholder="전달사항, 특이사항, 지역 현안, 예산 및 지원 내역에 대한 내용을 입력하세요."
          value={formState.coreContent}
          onChange={e => update('coreContent', e.target.value)}
          disabled={isLoading}
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        style={{ width: '100%', padding: '0.3rem', background: isLoading ? '#aaa' : '#4676B8', color: 'white', border: 'none', borderRadius: '5px', fontSize: '1rem', fontWeight: '600', cursor: isLoading ? 'not-allowed' : 'pointer' }}
      >
        {isLoading ? '생성 중...' : '인사말씀 생성하기'}
      </button>
    </form>
  );
}
