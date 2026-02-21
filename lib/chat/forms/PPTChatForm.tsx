'use client';

import { useState, useRef } from 'react';
import { S } from './chatFormStyles';

interface Props {
  onSubmit: (data: Record<string, unknown>) => void;
  onCancel: () => void;
  isLoading: boolean;
}

export default function PPTChatForm({ onSubmit, onCancel, isLoading }: Props) {
  const [title, setTitle]                 = useState('');
  const [content, setContent]             = useState('');
  const [slideCount, setSlideCount]       = useState(15);
  const [template, setTemplate]           = useState('business');
  const [includeTitle, setIncludeTitle]   = useState(true);
  const [includeIndex, setIncludeIndex]   = useState(true);
  const [includeConclusion, setIncludeConclusion] = useState(true);
  const [uploadedFile, setUploadedFile]   = useState<File | null>(null);
  const [isUploading, setIsUploading]     = useState(false);
  const [activeTab, setActiveTab]         = useState<'text' | 'file'>('text');
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setIsUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/work-support/ppt-converter/upload', { method: 'POST', body: fd });
      const result = await res.json();
      setContent(result.content as string);
      setUploadedFile(file);
      setActiveTab('text');
    } catch {
      alert('파일 업로드 실패');
    } finally {
      setIsUploading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim() || !title.trim()) return;
    onSubmit({ content, title, slideCount, includeTitle, includeIndex, includeConclusion, template });
  }

  const tabStyle = (active: boolean) => ({
    flex: 1, padding: '0.4rem', border: 'none',
    borderBottom: `2px solid ${active ? '#2383e2' : 'transparent'}`,
    background: 'none',
    color: active ? '#2383e2' : '#9b9a97',
    fontSize: '0.75rem', cursor: 'pointer',
    fontWeight: active ? 600 : 400,
  } as React.CSSProperties);

  return (
    <form onSubmit={handleSubmit} style={S.card}>
      <div style={S.header}>
        <h3 style={S.h3}>🖥️ PPT 생성</h3>
        <p style={S.desc}>내용을 입력하면 프레젠테이션으로 변환됩니다</p>
      </div>

      <div style={S.content}>
        {/* PPT 제목 */}
        <div>
          <label style={S.label}>PPT 제목 *</label>
          <input
            type="text"
            style={S.input}
            placeholder="프레젠테이션 제목"
            value={title}
            onChange={e => setTitle(e.target.value)}
            disabled={isLoading}
            required
          />
        </div>

        {/* 탭 */}
        <div style={{ borderBottom: '1px solid #e9e9e7', display: 'flex' }}>
          <button type="button" style={tabStyle(activeTab === 'text')} onClick={() => setActiveTab('text')}>📝 텍스트 입력</button>
          <button type="button" style={tabStyle(activeTab === 'file')} onClick={() => setActiveTab('file')}>📎 파일 업로드</button>
        </div>

        {activeTab === 'text' && (
          <div>
            <textarea
              style={{ ...S.input, resize: 'vertical', minHeight: '90px', lineHeight: 1.4 }}
              placeholder="PPT로 변환할 내용을 입력하세요..."
              value={content}
              onChange={e => setContent(e.target.value)}
              disabled={isLoading}
            />
            <span style={{ fontSize: '0.65rem', color: '#9b9a97' }}>{content.length}자</span>
          </div>
        )}

        {activeTab === 'file' && (
          <div
            style={{ border: '1px dashed #d1d5db', borderRadius: '4px', background: '#fafafa', cursor: 'pointer', padding: '0.75rem', textAlign: 'center' }}
            onClick={() => fileRef.current?.click()}
          >
            <span style={{ fontSize: '1.25rem', display: 'block', marginBottom: '0.25rem' }}>{isUploading ? '⏳' : '📎'}</span>
            <p style={{ margin: 0, fontSize: '0.7rem', color: '#6b6b6b' }}>
              {isUploading ? '파일 처리 중...' : 'PDF, TXT, DOCX 파일을 클릭하여 업로드'}
            </p>
            {uploadedFile && <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.65rem', color: '#28a745' }}>✓ {uploadedFile.name}</p>}
            <input ref={fileRef} type="file" accept=".pdf,.txt,.docx" style={{ display: 'none' }} onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} disabled={isUploading} />
          </div>
        )}

        {/* 슬라이드 수 + 템플릿 */}
        <div style={S.row}>
          <div>
            <label style={S.label}>슬라이드 수: {slideCount}</label>
            <input type="range" min={5} max={30} value={slideCount} onChange={e => setSlideCount(Number(e.target.value))} style={{ width: '100%' }} />
          </div>
          <div>
            <label style={S.label}>템플릿</label>
            <select style={S.input} value={template} onChange={e => setTemplate(e.target.value)} disabled={isLoading}>
              <option value="business">비즈니스</option>
              <option value="academic">학술</option>
              <option value="creative">창의</option>
            </select>
          </div>
        </div>

        {/* 포함 요소 */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          {[
            { label: '제목 슬라이드', state: includeTitle, set: setIncludeTitle },
            { label: '목차',          state: includeIndex, set: setIncludeIndex },
            { label: '결론',          state: includeConclusion, set: setIncludeConclusion },
          ].map(item => (
            <label key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.7rem', color: '#37352f', cursor: 'pointer' }}>
              <input type="checkbox" checked={item.state} onChange={e => item.set(e.target.checked)} />
              {item.label}
            </label>
          ))}
        </div>
      </div>

      <div style={S.actions}>
        <button type="button" style={S.cancelBtn} onClick={onCancel} disabled={isLoading}>취소</button>
        <button type="submit" style={{ ...S.submitBtn, opacity: !content.trim() || !title.trim() || isLoading ? 0.5 : 1 }} disabled={!content.trim() || !title.trim() || isLoading}>
          {isLoading ? '생성 중...' : 'PPT 생성'}
        </button>
      </div>
    </form>
  );
}
