'use client';

import { useState, useRef } from 'react';

const MAX_CHARS = 8000;

interface PPTInputFormProps {
  onGenerate: (data: {
    content: string; title: string; slideCount: number;
    includeTitle: boolean; includeIndex: boolean; includeConclusion: boolean;
  }) => void;
  onFileUpload: (file: File) => Promise<string>;
  isGenerating: boolean;
  uploadedFileInfo: { name: string; size: number } | null;
}

const inputStyle: React.CSSProperties = { width: '100%', padding: '0.4rem 0.6rem', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '0.8rem', background: 'var(--input-background)', color: 'var(--text-primary)', boxSizing: 'border-box' };
const labelStyle: React.CSSProperties = { fontSize: '0.78rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '0.25rem', display: 'block' };

export default function PPTInputForm({ onGenerate, onFileUpload, isGenerating, uploadedFileInfo }: PPTInputFormProps) {
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [slideCount, setSlideCount] = useState(10);
  const [includeTitle, setIncludeTitle] = useState(true);
  const [includeIndex, setIncludeIndex] = useState(true);
  const [includeConclusion, setIncludeConclusion] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [activeTab, setActiveTab] = useState<'file' | 'text'>('text');
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(file: File) {
    setIsUploading(true);
    try {
      const extracted = await onFileUpload(file);
      setContent(extracted.slice(0, MAX_CHARS));
      setActiveTab('text');
    } catch (err) {
      alert(err instanceof Error ? err.message : '파일 업로드 실패');
    } finally {
      setIsUploading(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileChange(file);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) { alert('변환할 내용을 입력하세요.'); return; }
    if (!title.trim()) { alert('PPT 제목을 입력하세요.'); return; }
    onGenerate({ content, title, slideCount, includeTitle, includeIndex, includeConclusion });
  }

  const charRatio = content.length / MAX_CHARS;
  const charColor = charRatio > 0.9 ? '#EF4444' : charRatio > 0.7 ? '#F59E0B' : 'var(--text-muted)';

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div style={{ paddingBottom: '0.6rem', borderBottom: '1px solid var(--border-color)' }}>
        <h2 style={{ margin: 0, fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-secondary)' }}>PPT Converter Settings</h2>
      </div>

      <div>
        <label style={labelStyle}>PPT 제목 *</label>
        <input style={inputStyle} type="text" placeholder="프레젠테이션 제목" value={title} onChange={e => setTitle(e.target.value)} required />
      </div>

      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)' }}>
        {(['text', 'file'] as const).map(tab => (
          <button key={tab} type="button" onClick={() => setActiveTab(tab)} style={{ flex: 1, padding: '0.4rem', border: 'none', borderBottom: `2px solid ${activeTab === tab ? 'var(--focus-color)' : 'transparent'}`, background: 'none', color: activeTab === tab ? 'var(--focus-color)' : 'var(--text-muted)', fontSize: '0.78rem', cursor: 'pointer', fontWeight: activeTab === tab ? '600' : '400' }}>
            {tab === 'text' ? '📝 텍스트 입력' : '📎 파일 업로드'}
          </button>
        ))}
      </div>

      {activeTab === 'text' && (
        <div>
          <label style={labelStyle}>변환할 내용</label>
          <textarea
            style={{ ...inputStyle, resize: 'vertical', minHeight: '150px', fontFamily: 'inherit' }}
            placeholder="PPT로 변환할 내용을 입력하세요..."
            value={content}
            onChange={e => setContent(e.target.value.slice(0, MAX_CHARS))}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <span style={{ fontSize: '0.7rem', color: charColor }}>{content.length.toLocaleString()} / {MAX_CHARS.toLocaleString()}자</span>
          </div>
        </div>
      )}

      {activeTab === 'file' && (
        <div>
          <div
            style={{ border: `2px dashed ${isDragging ? 'var(--focus-color)' : 'var(--border-color)'}`, borderRadius: '8px', padding: '1.5rem', textAlign: 'center', cursor: 'pointer', background: isDragging ? '#eef2ff' : 'white', transition: 'all 0.2s' }}
            onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <span style={{ fontSize: '2rem', display: 'block', marginBottom: '0.5rem' }}>{isUploading ? '⏳' : '📎'}</span>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{isUploading ? '파일 처리 중...' : 'PDF, TXT, DOCX 파일을 드래그하거나 클릭하세요'}</p>
            {uploadedFileInfo && <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.72rem', color: 'var(--success-color, #059669)' }}>✓ {uploadedFileInfo.name} ({(uploadedFileInfo.size / 1024).toFixed(1)}KB)</p>}
          </div>
          <input ref={fileInputRef} type="file" accept=".pdf,.txt,.docx" style={{ display: 'none' }} onChange={e => e.target.files?.[0] && handleFileChange(e.target.files[0])} />
        </div>
      )}

      <div>
        <label style={labelStyle}>슬라이드 수: <strong>{slideCount}개</strong></label>
        <input type="range" min="3" max="20" value={slideCount} onChange={e => setSlideCount(Number(e.target.value))} style={{ width: '100%', accentColor: 'var(--focus-color)' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
          <span>3</span><span>20</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        {[
          { key: 'includeTitle', label: '제목 슬라이드', state: includeTitle, set: setIncludeTitle },
          { key: 'includeIndex', label: '목차', state: includeIndex, set: setIncludeIndex },
          { key: 'includeConclusion', label: '결론', state: includeConclusion, set: setIncludeConclusion },
        ].map(item => (
          <label key={item.key} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <input type="checkbox" checked={item.state} onChange={e => item.set(e.target.checked)} />
            {item.label}
          </label>
        ))}
      </div>

      <button type="submit" style={{ width: '100%', padding: '0.65rem', background: 'var(--focus-color)', color: 'white', border: 'none', borderRadius: '6px', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer', opacity: isGenerating || isUploading ? 0.7 : 1 }} disabled={isGenerating || isUploading}>
        {isGenerating ? '⏳ 생성 중...' : '🖥️ PPT 생성'}
      </button>
    </form>
  );
}
