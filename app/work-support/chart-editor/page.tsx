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
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <header className="page-header">
        <div className="header-content">
          <button className="back-button" onClick={() => router.back()} aria-label="이전 페이지로 돌아가기">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
          <h1>📈 차트 에디터</h1>
        </div>
      </header>
      <div style={{ flex: 1, overflow: 'hidden', minHeight: 0 }}>
        <ChartEditor />
      </div>
    </div>
  );
}
