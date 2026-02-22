'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ScenarioInputForm from '@/lib/work-support/scenario-generator/InputForm';
import ScenarioViewer from '@/lib/work-support/scenario-generator/ScenarioViewer';

interface GeneratedScript {
  content: string;
  estimatedDuration: number;
  tips: string[];
  metadata: Record<string, unknown>;
}

export default function ScenarioGeneratorPage() {
  const router = useRouter();
  const [generatedScript, setGeneratedScript] = useState<GeneratedScript | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [currentContent, setCurrentContent] = useState('');
  const [currentTemplate, setCurrentTemplate] = useState('presentation');
  const [currentSettings, setCurrentSettings] = useState<Record<string, unknown>>({});

  useEffect(() => { document.title = '발표 대본 생성기 | 아레스 AI'; }, []);

  async function handleGenerate(data: { content: string; template: string; settings: Record<string, unknown> }) {
    if (!data.content.trim()) { setErrorMessage('변환할 내용을 입력해주세요.'); return; }
    setIsGenerating(true);
    setErrorMessage('');
    setCurrentContent(data.content);
    setCurrentTemplate(data.template);
    setCurrentSettings(data.settings);
    try {
      const response = await fetch('/api/work-support/scenario-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateType: data.template,
          content:      data.content.trim(),
          style:        String(data.settings.style    || 'formal'),
          audience:     String(data.settings.audience || 'general'),
          duration:     String(data.settings.duration || 'medium'),
        }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || '스크립트 생성에 실패했습니다.');
      }
      const result = await response.json();
      setGeneratedScript({
        content:           result.scenario || result.content || '',
        estimatedDuration: result.estimatedDuration || 0,
        tips:              result.tips || [],
        metadata:          result.metadata || {},
      });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : '오류가 발생했습니다.');
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div className="page-container">
      <header className="page-header">
        <div className="header-content">
          <button className="back-button" onClick={() => router.back()} aria-label="이전 페이지로 돌아가기">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
          <h1>📝 발표 대본 생성기</h1>
        </div>
      </header>
      <div className="page-content">
        <div className="content-container">
          <div className="content-layout">
            <div className="form-section">
              <ScenarioInputForm currentContent={currentContent} currentTemplate={currentTemplate} currentSettings={currentSettings} isGenerating={isGenerating} onGenerate={handleGenerate} />
              {errorMessage && (
                <div className="error-message" role="alert">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
                  </svg>
                  {errorMessage}
                </div>
              )}
            </div>
            <div className="result-section">
              <div style={{ flex: 1, overflowY: 'auto' }}>
                {isGenerating ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '2rem', textAlign: 'center' }}>
                    <div className="loading-spinner" />
                    <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: '500' }}>AI가 대본을 생성하고 있습니다...</p>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      <p>내용 길이: {currentContent.length}자</p>
                    </div>
                  </div>
                ) : generatedScript ? (
                  <ScenarioViewer script={generatedScript} originalContent={currentContent} template={currentTemplate} settings={currentSettings} />
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ opacity: 0.5 }}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/></svg>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '600', color: 'var(--text-secondary)' }}>대본 생성 대기 중</h3>
                    <p style={{ margin: 0, fontSize: '0.85rem', lineHeight: 1.5 }}>원본 텍스트나 문서를 입력하고<br/>대본 생성 버튼을 클릭하여 시작하세요.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
