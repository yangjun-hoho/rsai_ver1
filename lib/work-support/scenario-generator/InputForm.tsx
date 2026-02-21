'use client';

import { useState } from 'react';

interface InputFormProps {
  currentContent: string;
  currentTemplate: string;
  currentSettings: Record<string, unknown>;
  isGenerating: boolean;
  onGenerate: (data: { content: string; template: string; settings: Record<string, unknown> }) => void;
}

const selectStyle: React.CSSProperties = { width: '100%', padding: '0.4rem 0.6rem', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '0.8rem', background: 'var(--input-background)', color: 'var(--text-primary)' };
const labelStyle: React.CSSProperties = { fontSize: '0.78rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '0.25rem', display: 'block' };

const templateOptions = [
  { value: 'presentation', label: '📊 발표 대본' },
  { value: 'scenario', label: '🎬 시나리오' },
  { value: 'speech', label: '🎤 연설문' },
  { value: 'lecture', label: '📚 강의 대본' },
];

export default function ScenarioInputForm({ currentContent, currentTemplate, isGenerating, onGenerate }: InputFormProps) {
  const [content, setContent] = useState(currentContent);
  const [template, setTemplate] = useState(currentTemplate || 'presentation');
  const [style, setStyle] = useState('formal');
  const [audience, setAudience] = useState('general');
  const [language, setLanguage] = useState('korean');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onGenerate({ content, template, settings: { style, audience, language } });
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', height: '100%' }}>
      <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '8px', padding: '0.75rem 1rem' }}>
        <h2 style={{ color: 'white', margin: 0, fontSize: '0.9rem', fontWeight: '600' }}>📝 대본 설정</h2>
      </div>

      <div>
        <label style={labelStyle}>대본 유형</label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.35rem' }}>
          {templateOptions.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setTemplate(opt.value)}
              style={{ padding: '0.5rem', border: `2px solid ${template === opt.value ? 'var(--focus-color)' : 'var(--border-color)'}`, borderRadius: '6px', background: template === opt.value ? '#eef2ff' : 'white', color: template === opt.value ? 'var(--focus-color)' : 'var(--text-secondary)', fontSize: '0.78rem', cursor: 'pointer', transition: 'all 0.15s' }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label style={labelStyle}>원본 내용 *</label>
        <textarea
          style={{ ...selectStyle, resize: 'vertical', minHeight: '180px', fontFamily: 'inherit' }}
          placeholder="대본으로 변환할 내용을 입력하세요.&#10;&#10;예) 보고서 내용, 자료 요약, 발표 키워드 등을 입력하면 AI가 대본 형식으로 변환해 드립니다."
          value={content}
          onChange={e => setContent(e.target.value)}
          required
        />
        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{content.length} / 20,000자</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
        <div>
          <label style={labelStyle}>문체</label>
          <select style={selectStyle} value={style} onChange={e => setStyle(e.target.value)}>
            <option value="formal">격식체</option>
            <option value="semi-formal">준격식체</option>
            <option value="casual">친근체</option>
          </select>
        </div>
        <div>
          <label style={labelStyle}>대상 청중</label>
          <select style={selectStyle} value={audience} onChange={e => setAudience(e.target.value)}>
            <option value="general">일반인</option>
            <option value="executives">임원/경영진</option>
            <option value="colleagues">동료</option>
            <option value="customers">고객</option>
            <option value="students">학생</option>
          </select>
        </div>
      </div>

      <button type="submit" style={{ width: '100%', padding: '0.65rem', background: 'var(--focus-color)', color: 'white', border: 'none', borderRadius: '6px', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer', opacity: isGenerating ? 0.7 : 1 }} disabled={isGenerating}>
        {isGenerating ? '생성 중...' : '✨ 대본 생성'}
      </button>
    </form>
  );
}
