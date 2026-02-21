'use client';

import { useState } from 'react';
import { S } from './chatFormStyles';

interface Props {
  onSubmit: (data: Record<string, unknown>) => void;
  onCancel: () => void;
  isLoading: boolean;
}

export default function PressReleaseChatForm({ onSubmit, onCancel, isLoading }: Props) {
  const [coreContent, setCoreContent] = useState('');
  const [keywords, setKeywords]       = useState(['', '', '', '', '', '']);

  const len = coreContent.trim().length;
  const isValid = len > 0 && len <= 1000;

  function updateKeyword(i: number, v: string) {
    const next = [...keywords];
    next[i] = v;
    setKeywords(next);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) return;
    onSubmit({ coreContent: coreContent.trim(), keywords: keywords.map(k => k.trim()).filter(Boolean) });
  }

  return (
    <form onSubmit={handleSubmit} style={S.card}>
      <div style={S.header}>
        <h3 style={S.h3}>📰 보도자료 생성</h3>
        <p style={S.desc}>핵심 내용과 키워드를 입력하세요</p>
      </div>

      <div style={S.content}>
        {/* 핵심 내용 */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
            <label style={{ ...S.label, marginBottom: 0 }}>핵심 내용 *</label>
            <span style={{
              fontSize: '0.65rem',
              padding: '0.1rem 0.35rem',
              borderRadius: '10px',
              background: isValid ? '#d4edda' : len > 0 ? '#f8d7da' : '#e9ecef',
              color: isValid ? '#155724' : len > 0 ? '#721c24' : '#6c757d',
            }}>
              {len}/1000자
            </span>
          </div>
          <textarea
            style={{ ...S.input, resize: 'vertical', minHeight: '80px', lineHeight: 1.4 }}
            placeholder={'보도자료의 핵심 내용을 작성해주세요. (최대 1000자)\n\n예시: 남양주시가 새로운 AI 기반 업무지원 서비스를 출시합니다...'}
            value={coreContent}
            onChange={e => setCoreContent(e.target.value)}
            disabled={isLoading}
          />
          <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.65rem', color: '#6c757d' }}>
            💡 구체적인 내용일수록 더 정확한 보도자료가 생성됩니다.
          </p>
        </div>

        {/* 핵심 키워드 */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
            <label style={{ ...S.label, marginBottom: 0 }}>핵심 키워드 (선택)</label>
            <span style={{ fontSize: '0.65rem', color: '#6c757d' }}>
              {keywords.filter(k => k.trim()).length}/6개
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.35rem' }}>
            {keywords.map((kw, i) => (
              <input
                key={i}
                type="text"
                style={{
                  ...S.input,
                  borderColor: kw.trim() ? '#28a745' : '#e9e9e7',
                  background: kw.trim() ? '#f8fff8' : 'white',
                }}
                placeholder={`키워드 ${i + 1}`}
                value={kw}
                onChange={e => updateKeyword(i, e.target.value)}
                maxLength={20}
                disabled={isLoading}
              />
            ))}
          </div>
        </div>

        {/* 상태 */}
        <div style={{ background: '#f8f9fa', padding: '0.4rem 0.6rem', borderRadius: '3px', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.65rem', color: isValid ? '#28a745' : '#dc3545' }}>
            {isValid ? '✅' : '❌'} 핵심내용 (1-1000자)
          </span>
          <span style={{ fontSize: '0.65rem', color: '#28a745' }}>✅ 키워드 (선택사항)</span>
        </div>
      </div>

      <div style={S.actions}>
        <button type="button" style={S.cancelBtn} onClick={onCancel} disabled={isLoading}>취소</button>
        <button type="submit" style={{ ...S.submitBtn, opacity: !isValid || isLoading ? 0.5 : 1 }} disabled={!isValid || isLoading}>
          {isLoading ? '생성 중...' : '보도자료 생성'}
        </button>
      </div>
    </form>
  );
}
