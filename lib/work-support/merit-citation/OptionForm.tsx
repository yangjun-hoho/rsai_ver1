'use client';

import { useState } from 'react';

interface OptionFormProps {
  onSubmit: (options: Record<string, unknown>) => void;
  isLoading: boolean;
}

const labelStyle: React.CSSProperties = { fontSize: '0.78rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '0.25rem', display: 'block' };
const selectStyle: React.CSSProperties = { width: '100%', padding: '0.4rem 0.6rem', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '0.8rem', background: 'var(--input-background)', color: 'var(--text-primary)' };
const textareaStyle: React.CSSProperties = { ...selectStyle, resize: 'vertical', minHeight: '100px', fontFamily: 'inherit' };

export default function MeritCitationOptionForm({ onSubmit, isLoading }: OptionFormProps) {
  const [formState, setFormState] = useState({
    targetType: '공무원',
    meritField: '',
    majorAchievements: '',
  });

  const update = (key: string, value: string) => setFormState(prev => ({ ...prev, [key]: value }));

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit(formState);
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div style={{ paddingBottom: '0.6rem', marginBottom: '0.25rem', borderBottom: '1px solid var(--border-color)' }}>
        <h2 style={{ margin: 0, fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-secondary)' }}>Merit Citation Settings</h2>
      </div>

      <div>
        <label style={labelStyle}>공적 대상</label>
        <select style={selectStyle} value={formState.targetType} onChange={e => update('targetType', e.target.value)}>
          {['공무원', '일반인', '단체'].map(v => <option key={v}>{v}</option>)}
        </select>
      </div>

      <div>
        <label style={labelStyle}>공적 분야 *</label>
        <input
          style={selectStyle}
          type="text"
          placeholder="예: 사회복지, 교육, 환경, 행정혁신..."
          value={formState.meritField}
          onChange={e => update('meritField', e.target.value)}
          required
        />
      </div>

      <div>
        <label style={labelStyle}>주요 실적 *</label>
        <textarea
          style={textareaStyle}
          placeholder="주요 업무 실적, 성과, 기여 내용을 입력해주세요.&#10;예: 취약계층 복지 서비스 개선으로 수혜자 200명 지원, 행정 절차 간소화로 민원 처리 시간 30% 단축..."
          value={formState.majorAchievements}
          onChange={e => update('majorAchievements', e.target.value)}
          required
        />
      </div>

      <button
        type="submit"
        style={{ width: '100%', padding: '0.6rem', background: 'var(--focus-color)', color: 'white', border: 'none', borderRadius: '6px', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer', opacity: isLoading ? 0.7 : 1 }}
        disabled={isLoading}
      >
        {isLoading ? '생성 중...' : '✨ 공적조서 생성'}
      </button>
    </form>
  );
}
