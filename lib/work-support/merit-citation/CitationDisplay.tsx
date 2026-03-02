'use client';

import { useState } from 'react';
import Image from 'next/image';
import { exportCitationToODT } from './citationOdtExporter';

interface CitationDisplayProps {
  citationText: string;
  isLoading: boolean;
}

const citationCSS = `
  .citation-doc-container {
    background: white;
    color: #000;
    font-family: 'Noto Sans KR', 'Malgun Gothic', sans-serif;
    line-height: 1.6;
    max-width: 800px;
    margin: 0 auto;
    padding: 0 1rem 2rem 1rem;
  }
  .citation-doc-header {
    text-align: center;
    margin-bottom: 1.5rem;
    padding: 0.5rem 0 1rem 0;
    position: relative;
  }
  .citation-doc-header::after {
    content: '';
    position: absolute;
    bottom: 0; left: 0; right: 0;
    height: 6px;
    background: rgb(96, 100, 109);
  }
  .citation-doc-title {
    font-size: 2.3rem;
    font-weight: bold;
    margin: 3px 0 3px 0;
    line-height: 1.3;
    color: #000;
  }
  .citation-doc-body {
    padding: 1.5rem 0.5rem;
    font-size: 1rem;
    line-height: 2.0;
    color: #1a1a1a;
    white-space: pre-line;
    text-align: justify;
    font-family: serif;
  }
`;

export default function CitationDisplay({ citationText, isLoading }: CitationDisplayProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(citationText);
    alert('클립보드에 복사되었습니다.');
  }

  async function handleDownload() {
    setIsDownloading(true);
    try {
      await exportCitationToODT(citationText);
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <style>{citationCSS}</style>

      {/* 툴바 */}
      <div style={{ padding: '0.75rem 1rem', background: 'white', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.4rem' }}>
          <button onClick={handleCopy} disabled={!citationText} style={{ padding: '0.3rem 0.65rem', background: citationText ? 'var(--focus-color)' : '#aaa', color: 'white', border: 'none', borderRadius: '4px', fontSize: '0.72rem', cursor: citationText ? 'pointer' : 'not-allowed' }}>복사</button>
          <button onClick={handleDownload} disabled={!citationText || isDownloading} style={{ padding: '0.3rem 0.65rem', background: citationText && !isDownloading ? '#16a34a' : '#aaa', color: 'white', border: 'none', borderRadius: '4px', fontSize: '0.72rem', cursor: citationText && !isDownloading ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
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
            <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.9rem' }}>공적조서를 생성하고 있습니다...</p>
          </div>
        ) : citationText ? (
          <div className="citation-doc-container">
            <Image src="/images/head-report.png" alt="헤더" width={800} height={200} style={{ width: '100%', height: 'auto', display: 'block', marginBottom: '0.1rem' }} />
            <div className="citation-doc-header">
              <h1 className="citation-doc-title">공적조서</h1>
            </div>
            <div className="citation-doc-body">{citationText}</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <span style={{ fontSize: '3rem', opacity: 0.5 }}>🏆</span>
            <h3 style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '1.1rem' }}>공적조서 생성 대기 중</h3>
            <p style={{ margin: 0, fontSize: '0.85rem', lineHeight: 1.6 }}>
              왼쪽 설정을 입력하고<br />공적조서 생성 버튼을 클릭하세요.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
