'use client';

import { useState, useRef, useCallback } from 'react';

interface InputFormProps {
  currentContent: string;
  currentTemplate: string;
  currentSettings: Record<string, unknown>;
  isGenerating: boolean;
  onGenerate: (data: { content: string; template: string; settings: Record<string, unknown> }) => void;
}

const templates = [
  { value: 'presentation', label: '발표(PT)',   icon: '🎯' },
  { value: 'meeting',      label: '회의 진행',  icon: '👥' },
  { value: 'mc',           label: '사회자',     icon: '🎤' },
  { value: 'briefing',     label: '브리핑',     icon: '📢' },
  { value: 'lecture',      label: '강의',       icon: '📚' },
  { value: 'debate',       label: '토론',       icon: '💬' },
];

const styles = [
  { value: 'conversational', label: '대화형' },
  { value: 'formal',         label: '격식' },
  { value: 'casual',         label: '편안함' },
];

const audiences = [
  { value: 'colleagues', label: '동료' },
  { value: 'citizens',   label: '시민' },
  { value: 'students',   label: '학생' },
  { value: 'general',    label: '일반' },
];

const durations = [
  { value: 'short',  label: '짧게 (3-5분)' },
  { value: 'medium', label: '보통 (5-10분)' },
  { value: 'long',   label: '길게 (10-15분)' },
];

const SAMPLE_TEXT = `우리 부서의 2024년 디지털 전환 프로젝트 결과를 공유드리겠습니다.

주요 성과:
1. 업무 자동화로 30% 효율성 증대
2. 클라우드 전환으로 운영비 25% 절감
3. 모바일 앱 도입으로 민원 만족도 40% 향상

향후 계획:
- AI 도구 도입으로 추가 생산성 향상
- 데이터 분석 역량 강화
- 직원 디지털 스킬 교육 확대`;

const sel: React.CSSProperties = {
  width: '100%', padding: '0.45rem 0.5rem',
  border: '1px solid #d1d5db', borderRadius: '6px',
  fontSize: '0.82rem', background: '#f9fafb',
  color: '#374151', fontFamily: 'inherit',
};

const lbl: React.CSSProperties = {
  fontSize: '0.82rem', fontWeight: 600, color: '#374151',
};

export default function ScenarioInputForm({ currentContent, currentTemplate, isGenerating, onGenerate }: InputFormProps) {
  const [content, setContent]     = useState(currentContent);
  const [template, setTemplate]   = useState(currentTemplate || 'presentation');
  const [style, setStyle]         = useState('formal');
  const [audience, setAudience]   = useState('general');
  const [duration, setDuration]   = useState('medium');

  // 파일 업로드 상태
  const [uploadedFile, setUploadedFile]       = useState<File | null>(null);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [isDragging, setIsDragging]           = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 텍스트 통계
  const chars = content.length;
  const words = content.trim() ? content.trim().split(/\s+/).length : 0;
  const estMin = Math.ceil(content.replace(/\s/g, '').length / 300);

  // 파일 처리
  async function processFile(file: File) {
    const allowed = ['application/pdf', 'text/plain'];
    if (!allowed.includes(file.type)) {
      alert('PDF 또는 TXT 파일만 업로드 가능합니다.');
      return;
    }
    setIsProcessingFile(true);
    setUploadedFile(file);
    try {
      if (file.type === 'text/plain') {
        // TXT: 클라이언트에서 직접 읽기
        const text = await file.text();
        setContent(text);
      } else {
        // PDF: 서버 API로 처리
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch('/api/work-support/scenario-generator/extract', {
          method: 'POST',
          body: formData,
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error((err as { error?: string }).error || '파일 처리 실패');
        }
        const data = await res.json();
        setContent(data.text);
      }
    } catch (err) {
      alert('파일 처리 중 오류가 발생했습니다: ' + (err instanceof Error ? err.message : '알 수 없는 오류'));
      setUploadedFile(null);
    } finally {
      setIsProcessingFile(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = '';
  }

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  }, []);

  function removeFile() {
    setUploadedFile(null);
    setContent('');
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim() || isGenerating) return;
    onGenerate({ content, template, settings: { style, audience, duration } });
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%' }}>

      {/* ── 헤더 ─────────────────────────────────────────────────────────── */}
      <div style={{ paddingBottom: '0.6rem', borderBottom: '1px solid var(--border-color)' }}>
        <h2 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Script Settings</h2>
      </div>

      {/* ── 상황 설정 ──────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <span style={lbl}>상황 설정</span>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
          {templates.map(t => {
            const selected = template === t.value;
            return (
              <label
                key={t.value}
                style={{
                  display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
                  gap: '0.4rem', padding: '0.3rem 0.5rem',
                  border: `1px solid ${selected ? '#f22a2a' : '#e5e7eb'}`,
                  borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s',
                  background: selected ? '#f5cdcd' : '#f9fafb',
                  boxShadow: selected ? '0 0 0 3px rgba(99,102,241,0.1)' : 'none',
                }}
                onMouseEnter={e => { if (!selected) { (e.currentTarget as HTMLElement).style.borderColor = '#6366f1'; (e.currentTarget as HTMLElement).style.background = '#eff6ff'; } }}
                onMouseLeave={e => { if (!selected) { (e.currentTarget as HTMLElement).style.borderColor = '#e5e7eb'; (e.currentTarget as HTMLElement).style.background = '#f9fafb'; } }}
              >
                <input type="radio" name="template" value={t.value} checked={selected} onChange={() => setTemplate(t.value)} style={{ display: 'none' }} />
                <span style={{ fontSize: '1.1rem' }}>{t.icon}</span>
                <span style={{ fontSize: '0.78rem', color: selected ? '#6366f1' : '#6b7280', fontWeight: selected ? 600 : 400 }}>{t.label}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* ── 기본 설정 ──────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <span style={lbl}>기본 설정</span>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
          <select value={style}    onChange={e => setStyle(e.target.value)}    style={sel}>
            {styles.map(s   => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <select value={audience} onChange={e => setAudience(e.target.value)} style={sel}>
            {audiences.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
          </select>
          <select value={duration} onChange={e => setDuration(e.target.value)} style={sel}>
            {durations.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
          </select>
        </div>
      </div>

      {/* ── 파일 업로드 ────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <span style={lbl}>파일 업로드 (선택)</span>
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          style={{
            border: `2px dashed ${isDragging ? '#6366f1' : '#d1d5db'}`,
            borderRadius: '8px', padding: '0.75rem',
            background: isDragging ? '#eff6ff' : '#f9fafb',
            transition: 'all 0.2s',
          }}
        >
          {uploadedFile ? (
            /* 업로드된 파일 표시 */
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0.75rem', background: 'white', borderRadius: '6px', border: '1px solid #d1d5db' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#374151', fontSize: '0.82rem' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>
                <span>{uploadedFile.name}</span>
              </div>
              <button
                type="button" onClick={removeFile}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.25rem', border: 'none', borderRadius: '4px', background: 'transparent', color: '#6b7280', cursor: 'pointer' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#fee2e2'; (e.currentTarget as HTMLElement).style.color = '#dc2626'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#6b7280'; }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
          ) : (
            /* 업로드 영역 */
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.txt"
                onChange={handleFileChange}
                disabled={isGenerating || isProcessingFile}
                style={{ display: 'none' }}
                id="scenario-file-input"
              />
              <label
                htmlFor="scenario-file-input"
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', padding: '0.75rem', cursor: 'pointer', color: '#6b7280', fontSize: '0.82rem', textAlign: 'center' }}
              >
                {isProcessingFile ? (
                  <>
                    <div style={{ width: '24px', height: '24px', border: '2px solid #e5e7eb', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                    <span>파일 처리 중...</span>
                  </>
                ) : (
                  <>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ opacity: 0.5 }}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                    <span>PDF 또는 TXT 파일을 드래그하거나 클릭하여 업로드</span>
                  </>
                )}
              </label>
            </>
          )}
        </div>
      </div>

      {/* ── 원본 텍스트 ────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1, minHeight: 0 }}>
        <span style={lbl}>원본 텍스트</span>
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="대본으로 변환할 텍스트를 입력하세요..."
          disabled={isGenerating}
          style={{
            flex: 1, minHeight: '120px', padding: '0.75rem',
            border: '1px solid #d1d5db', borderRadius: '6px',
            fontSize: '0.85rem', fontFamily: 'inherit',
            resize: 'none', background: '#f9fafb', color: '#37352f', lineHeight: 1.6,
            outline: 'none',
          }}
          onFocus={e => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.1)'; }}
          onBlur={e => { e.currentTarget.style.borderColor = '#d1d5db'; e.currentTarget.style.boxShadow = 'none'; }}
        />

        {/* 텍스트 액션 버튼 */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
          {content ? (
            <button
              type="button" onClick={() => setContent('')}
              style={{ padding: '0.3rem 0.7rem', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '0.75rem', background: 'white', cursor: 'pointer', color: '#6b7280' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#f3f4f6'; (e.currentTarget as HTMLElement).style.borderColor = '#6366f1'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'white'; (e.currentTarget as HTMLElement).style.borderColor = '#d1d5db'; }}
            >
              지우기
            </button>
          ) : (
            <button
              type="button" onClick={() => setContent(SAMPLE_TEXT)}
              style={{ padding: '0.3rem 0.7rem', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '0.75rem', background: 'white', cursor: 'pointer', color: '#6b7280' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#f3f4f6'; (e.currentTarget as HTMLElement).style.borderColor = '#6366f1'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'white'; (e.currentTarget as HTMLElement).style.borderColor = '#d1d5db'; }}
            >
              샘플
            </button>
          )}
        </div>

        {/* 텍스트 통계 */}
        {chars > 0 && (
          <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', color: '#6b7280', padding: '0.4rem 0.6rem', background: '#f3f4f6', borderRadius: '4px' }}>
            <span>글자: {chars.toLocaleString()}</span>
            <span>단어: {words.toLocaleString()}</span>
            <span>예상: {estMin}분</span>
          </div>
        )}
      </div>

      {/* ── 생성 버튼 ──────────────────────────────────────────────────────── */}
      <button
        type="submit"
        disabled={!content.trim() || isGenerating}
        style={{
          width: '100%', padding: '0.75rem',
          background: !content.trim() || isGenerating ? '#9ca3af' : '#6366f1',
          color: 'white', border: 'none', borderRadius: '6px',
          fontSize: '0.9rem', fontWeight: 600, cursor: !content.trim() || isGenerating ? 'not-allowed' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
          transition: 'all 0.2s', transform: 'translateY(0)',
        }}
        onMouseEnter={e => { if (content.trim() && !isGenerating) { (e.currentTarget as HTMLElement).style.background = '#4f46e5'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 12px rgba(99,102,241,0.3)'; } }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = !content.trim() || isGenerating ? '#9ca3af' : '#6366f1'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}
      >
        {isGenerating ? (
          <>
            <div style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 1s linear infinite', flexShrink: 0 }} />
            생성 중...
          </>
        ) : '📝 대본 생성'}
      </button>

      {/* spin 애니메이션 */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </form>
  );
}
