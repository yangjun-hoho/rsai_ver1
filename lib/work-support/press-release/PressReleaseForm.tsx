'use client';

import { useState } from 'react';

interface PressReleaseFormProps {
  onSubmit: (data: Record<string, unknown>) => void;
  isLoading: boolean;
}

const labelStyle: React.CSSProperties = { fontSize: '0.78rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '0.25rem', display: 'block' };
const inputStyle: React.CSSProperties = { width: '100%', padding: '0.4rem 0.6rem', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '0.8rem', background: 'var(--input-background)', color: 'var(--text-primary)', boxSizing: 'border-box' };

export default function PressReleaseForm({ onSubmit, isLoading }: PressReleaseFormProps) {
  const [coreContent, setCoreContent] = useState('');
  const [keywords, setKeywords] = useState(['', '', '', '', '']);

  function updateKeyword(index: number, value: string) {
    const next = [...keywords];
    next[index] = value;
    setKeywords(next);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const filteredKeywords = keywords.filter(k => k.trim());
    if (filteredKeywords.length < 3) { alert('최소 3개 이상의 키워드를 입력해주세요.'); return; }
    onSubmit({ coreContent, keywords: filteredKeywords });
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '0.25rem' }}>
        <h2 style={{ color: 'white', margin: 0, fontSize: '0.9rem', fontWeight: '600' }}>📰 보도자료 설정</h2>
      </div>

      <div>
        <label style={labelStyle}>핵심 내용 * (20자 이상)</label>
        <textarea
          style={{ ...inputStyle, resize: 'vertical', minHeight: '120px', fontFamily: 'inherit' }}
          placeholder="보도자료의 핵심 내용을 입력해주세요.&#10;예: 남양주시가 2024년부터 취약계층 의료비 지원 사업을 대폭 확대하여 연간 5,000명에게 1인당 최대 200만원을 지원한다."
          value={coreContent}
          onChange={e => setCoreContent(e.target.value)}
          required
          minLength={20}
        />
        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{coreContent.length}자</span>
      </div>

      <div>
        <label style={labelStyle}>핵심 키워드 * (최소 3개)</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          {keywords.map((kw, i) => (
            <input
              key={i}
              style={inputStyle}
              type="text"
              placeholder={`키워드 ${i + 1}${i < 3 ? ' (필수)' : ' (선택)'}`}
              value={kw}
              onChange={e => updateKeyword(i, e.target.value)}
              required={i < 3}
            />
          ))}
        </div>
      </div>

      <button type="submit" style={{ width: '100%', padding: '0.6rem', background: 'var(--focus-color)', color: 'white', border: 'none', borderRadius: '6px', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer', opacity: isLoading ? 0.7 : 1 }} disabled={isLoading}>
        {isLoading ? '제목 생성 중...' : '📋 제목 후보 생성'}
      </button>
    </form>
  );
}
