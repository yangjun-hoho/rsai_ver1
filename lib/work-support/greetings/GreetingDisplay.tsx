'use client';

import { useState } from 'react';
import { exportGreetingToODT } from './greetingOdtExporter';

interface GreetingDisplayProps {
  greetingText: string;
  greetingType?: string;
  isLoading: boolean;
}

const greetingCSS = `
  .greeting-doc-container {
    background: white;
    color: #000;
    font-family: 'Noto Sans KR', 'Malgun Gothic', sans-serif;
    line-height: 1.6;
    max-width: 800px;
    margin: 0 auto;
    padding: 0 1rem 2rem 1rem;
  }
  .greeting-doc-header {
    text-align: center;
    margin-bottom: 1.5rem;
    padding: 1.5rem 0 1rem 0;
    position: relative;
  }
  .greeting-doc-header::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 12px;
    background: linear-gradient(150deg, #1e40af 79.5%, white 79.5%, white 80.5%, #22c55e 80.5%);
  }
  .greeting-doc-header::after {
    content: '';
    position: absolute;
    bottom: 0; left: 0; right: 0;
    height: 6px;
    background: rgb(96, 100, 109);
  }
  .greeting-doc-title {
    font-size: 2.3rem;
    font-weight: bold;
    margin: 3px 0 3px 0;
    line-height: 1.3;
    color: #000;
  }
  .greeting-doc-body {
    padding: 1.5rem 0.5rem;
    font-size: 1rem;
    line-height: 2.0;
    color: #1a1a1a;
    white-space: pre-line;
    text-align: justify;
  }
`;

export default function GreetingDisplay({ greetingText, greetingType, isLoading }: GreetingDisplayProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(greetingText);
    alert('클립보드에 복사되었습니다.');
  }

  async function handleDownload() {
    setIsDownloading(true);
    try {
      await exportGreetingToODT(greetingText, greetingType || '인사말씀');
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <style>{greetingCSS}</style>

      {/* 툴바 */}
      <div style={{ padding: '0.75rem 1rem', background: 'white', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.4rem' }}>
          <button onClick={handleCopy} disabled={!greetingText} style={{ padding: '0.3rem 0.65rem', background: greetingText ? 'var(--focus-color)' : '#aaa', color: 'white', border: 'none', borderRadius: '4px', fontSize: '0.72rem', cursor: greetingText ? 'pointer' : 'not-allowed' }}>복사</button>
          <button onClick={handleDownload} disabled={!greetingText || isDownloading} style={{ padding: '0.3rem 0.65rem', background: greetingText && !isDownloading ? '#16a34a' : '#aaa', color: 'white', border: 'none', borderRadius: '4px', fontSize: '0.72rem', cursor: greetingText && !isDownloading ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            {isDownloading ? '생성 중...' : 'ODT'}
          </button>
        </div>
      </div>

      {/* 콘텐츠 */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', background: '#f8f8f4' }}>
        {isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '1rem' }}>
            <div className="loading-spinner" />
            <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.9rem' }}>인사말씀을 생성하고 있습니다...</p>
          </div>
        ) : greetingText ? (
          <div className="greeting-doc-container">
            <div className="greeting-doc-header">
              <h1 className="greeting-doc-title">{greetingType || '인사말씀'}</h1>
            </div>
            <div className="greeting-doc-body">{greetingText}</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <span style={{ fontSize: '3rem', opacity: 0.5 }}>🎤</span>
            <h3 style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '1.1rem' }}>인사말씀 생성 대기 중</h3>
            <p style={{ margin: 0, fontSize: '0.85rem', lineHeight: 1.6 }}>
              왼쪽 설정을 선택하고<br />&apos;인사말씀 생성&apos; 버튼을 클릭하세요.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem', alignItems: 'flex-start' }}>
              {['공식 행사 인사말로 구조화', '청중 맞춤 표현 사용', '계절감과 시기 반영', '인용구 자동 삽입'].map(feature => (
                <div key={feature} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  <span style={{ color: 'var(--success-color)' }}>✓</span>
                  {feature}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
