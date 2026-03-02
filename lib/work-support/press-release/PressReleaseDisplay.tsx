'use client';

import { useState } from 'react';
import Image from 'next/image';
import { exportPressReleaseToODT, type PressReleaseSimpleData } from './pressReleaseOdtExporter';

interface PressReleaseDisplayProps {
  data: Record<string, unknown>;
  isLoading?: boolean;
}

const prCSS = `
  .pr-doc-container {
    background: white;
    color: #000;
    font-family: 'Noto Sans KR', 'Malgun Gothic', sans-serif;
    line-height: 1.6;
    max-width: 800px;
    margin: 0 auto;
    padding: 0 1rem 2rem 1rem;
  }
  .pr-doc-header {
    text-align: center;
    margin-bottom: 1.5rem;
    padding: 0.5rem 0 1rem 0;
    position: relative;
  }
  .pr-doc-header::after {
    content: '';
    position: absolute;
    bottom: 0; left: 0; right: 0;
    height: 6px;
    background: rgb(96, 100, 109);
  }
  .pr-doc-big-title {
    font-size: 2.3rem;
    font-weight: bold;
    margin: 3px 0 3px 0;
    line-height: 1.3;
    color: #000;
    letter-spacing: 0.4rem;
  }
  .pr-doc-article-title {
    font-size: 1.2rem;
    font-weight: 700;
    color: #111;
    margin: 1.5rem 0 0 0;
    padding: 0 0.5rem;
    line-height: 1.6;
    text-align: center;
    word-break: keep-all;
  }
  .pr-doc-body {
    padding: 1.5rem 0.5rem;
    font-size: 1rem;
    line-height: 2.0;
    color: #1a1a1a;
  }
  .pr-doc-paragraph {
    margin: 0 0 1rem 0;
    text-align: justify;
    word-break: keep-all;
  }
  .pr-doc-paragraph:last-child {
    margin-bottom: 0;
  }
`;

export default function PressReleaseDisplay({ data, isLoading }: PressReleaseDisplayProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const pr = data as PressReleaseSimpleData;
  const hasContent = !!(pr.title || (pr.paragraphs && pr.paragraphs.length > 0));

  function buildPlainText(): string {
    const lines: string[] = ['보도자료', ''];
    if (pr.title) lines.push(pr.title, '');
    (pr.paragraphs || []).forEach((p: string) => lines.push(p, ''));
    return lines.join('\n').trim();
  }

  function handleCopy() {
    navigator.clipboard.writeText(buildPlainText());
    alert('클립보드에 복사되었습니다.');
  }

  async function handleDownload() {
    setIsDownloading(true);
    try {
      await exportPressReleaseToODT(pr);
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <style>{prCSS}</style>

      {/* 툴바 */}
      <div style={{ padding: '0.75rem 1rem', background: 'white', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.4rem' }}>
          <button
            onClick={handleCopy}
            disabled={!hasContent}
            style={{ padding: '0.3rem 0.65rem', background: hasContent ? 'var(--focus-color)' : '#aaa', color: 'white', border: 'none', borderRadius: '4px', fontSize: '0.72rem', cursor: hasContent ? 'pointer' : 'not-allowed' }}
          >
            복사
          </button>
          <button
            onClick={handleDownload}
            disabled={!hasContent || isDownloading}
            style={{ padding: '0.3rem 0.65rem', background: hasContent && !isDownloading ? '#16a34a' : '#aaa', color: 'white', border: 'none', borderRadius: '4px', fontSize: '0.72rem', cursor: hasContent && !isDownloading ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
          >
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
            <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.9rem' }}>보도자료를 생성하고 있습니다...</p>
          </div>
        ) : hasContent ? (
          <div className="pr-doc-container">
            <Image src="/images/head-report.png" alt="헤더" width={900} height={100} style={{ width: '100%', height: 'auto', display: 'block', marginBottom: '0.1rem' }} />
            <div className="pr-doc-header">
              <h1 className="pr-doc-big-title">보도자료</h1>
            </div>
            {pr.title && <h2 className="pr-doc-article-title">{pr.title}</h2>}
            <div className="pr-doc-body">
              {(pr.paragraphs || []).map((paragraph: string, i: number) => (
                <p key={i} className="pr-doc-paragraph">{paragraph}</p>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <span style={{ fontSize: '3rem', opacity: 0.5 }}>📰</span>
            <h3 style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '1.1rem' }}>보도자료 생성 대기 중</h3>
            <p style={{ margin: 0, fontSize: '0.85rem', lineHeight: 1.6 }}>
              왼쪽 폼을 작성하고<br />제목을 선택하면 보도자료가 생성됩니다.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem', alignItems: 'flex-start' }}>
              {['실제 보도자료 형식으로 자동 작성', '5W1H 기반 리드 문단', '담당부서 연락처 자동 포함', 'ODT 파일 다운로드 지원'].map(f => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  <span style={{ color: 'var(--success-color)' }}>✓</span>{f}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
