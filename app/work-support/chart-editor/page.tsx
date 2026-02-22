'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ChartEditor from '@/lib/work-support/chart-editor/ChartEditor';

export default function ChartEditorPage() {
  const router = useRouter();

  useEffect(() => {
    document.title = '차트 에디터 | 아레스 AI';
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', background: '#f9fafb' }}>

      {/* ── Header ── */}
      <header style={{
        height: '52px', background: '#ffffff', borderBottom: '1px solid #e5e7eb',
        display: 'flex', alignItems: 'center', padding: '0 20px', gap: '12px',
        flexShrink: 0, boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
      }}>
        <button
          onClick={() => router.back()}
          aria-label="이전 페이지로 돌아가기"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: '32px', height: '32px', background: 'transparent',
            border: '1px solid #e5e7eb', borderRadius: '7px',
            cursor: 'pointer', color: '#6b7280', flexShrink: 0,
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = '#f3f4f6';
            e.currentTarget.style.borderColor = '#d1d5db';
            e.currentTarget.style.color = '#374151';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.borderColor = '#e5e7eb';
            e.currentTarget.style.color = '#6b7280';
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '18px' }}>📊</span>
          <span style={{ fontSize: '15px', fontWeight: 600, color: '#111827' }}>차트 에디터</span>
          <span style={{ fontSize: '11px', padding: '2px 7px', background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: '20px', color: '#6b7280', fontWeight: 500 }}>
            Chart.js
          </span>
        </div>

        <div style={{ flex: 1 }} />

        <span style={{ fontSize: '11px', color: '#9ca3af' }}>실시간 차트 편집기</span>
      </header>

      <div style={{ flex: 1, overflow: 'hidden', minHeight: 0 }}>
        <ChartEditor />
      </div>
    </div>
  );
}
