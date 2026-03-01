'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';

export type ToolMode = 'generate' | 'edit' | 'mask';

interface PromptComposerProps {
  isDarkMode: boolean;
  selectedTool: ToolMode;
  currentPrompt: string;
  uploadedImages: string[];
  editReferenceImages: string[];
  isGenerating: boolean;
  temperature: number;
  seed: number | undefined;
  aspectRatio: string;
  showPromptPanel: boolean;
  isUsageLimitReached: boolean;
  dailyUsageLimit: number;
  onSetTool: (tool: ToolMode) => void;
  onSetPrompt: (v: string) => void;
  onGenerate: () => void;
  onFileUpload: (file: File) => void;
  onRemoveUploadedImage: (i: number) => void;
  onRemoveEditReferenceImage: (i: number) => void;
  onSetTemperature: (v: number) => void;
  onSetSeed: (v: number | undefined) => void;
  onSetAspectRatio: (v: string) => void;
  onTogglePanel: () => void;
  onClearSession: () => void;
}

const ASPECT_RATIOS = [
  { value: '1:1', label: '1:1 (1024×1024)', desc: '정사각형' },
  { value: '16:9', label: '16:9 (1344×768)', desc: '가로' },
  { value: '9:16', label: '9:16 (768×1344)', desc: '세로' },
  { value: '4:3', label: '4:3 (1024×768)', desc: '가로' },
  { value: '3:4', label: '3:4 (768×1024)', desc: '세로' },
];

export default function PromptComposer(props: PromptComposerProps) {
  const {
    isDarkMode, selectedTool, currentPrompt, uploadedImages, editReferenceImages,
    isGenerating, temperature, seed, aspectRatio, showPromptPanel, isUsageLimitReached, dailyUsageLimit,
    onSetTool, onSetPrompt, onGenerate, onFileUpload, onRemoveUploadedImage,
    onRemoveEditReferenceImage, onSetTemperature, onSetSeed, onSetAspectRatio,
    onTogglePanel, onClearSession,
  } = props;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const dark = {
    panel: { background: '#0c0e14', borderRight: '1px solid #1f2937' },
    panelH: '#d1d5db', iconBtn: '#9ca3af', iconBtnHover: '#1f2937',
    toolBtn: { background: '#111827', border: '1px solid #374151', color: '#9ca3af' },
    toolBtnActive: { background: 'rgba(234,179,8,.1)', border: '1px solid rgba(234,179,8,.5)', color: '#eab308' },
    label: '#d1d5db', hint: '#6b7280',
    upload: { background: '#1f2937', border: '1px solid #374151', color: '#d1d5db' },
    textarea: { background: '#1f2937', border: '1px solid #374151', color: '#f3f4f6' },
    genBtn: { background: '#eab308', color: '#000' },
    adv: { color: '#9ca3af' },
    select: { background: '#1f2937', border: '1px solid #374151', color: '#f3f4f6' },
    clear: { background: '#1f2937', border: '1px solid #374151', color: '#d1d5db' },
    expand: { background: '#1f2937', border: '1px solid #374151' },
    dot: '#6b7280',
    limit: { background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.3)', color: '#ef4444' },
    preview: { background: '#1f2937' },
  };

  const light = {
    panel: { background: '#ffffff', borderRight: '1px solid #e5e7eb' },
    panelH: '#1f2937', iconBtn: '#6b7280', iconBtnHover: '#f9fafb',
    toolBtn: { background: '#f3f4f6', border: '1px solid #e5e7eb', color: '#6b7280' },
    toolBtnActive: { background: 'rgba(234,179,8,.1)', border: '1px solid rgba(234,179,8,.5)', color: '#ca8a04' },
    label: '#1f2937', hint: '#6b7280',
    upload: { background: '#f3f4f6', border: '1px solid #e5e7eb', color: '#1f2937' },
    textarea: { background: '#ffffff', border: '1px solid #e5e7eb', color: '#1f2937' },
    genBtn: { background: '#eab308', color: '#000' },
    adv: { color: '#6b7280' },
    select: { background: '#ffffff', border: '1px solid #e5e7eb', color: '#1f2937' },
    clear: { background: '#f3f4f6', border: '1px solid #e5e7eb', color: '#1f2937' },
    expand: { background: '#e5e7eb', border: '1px solid #d1d5db' },
    dot: '#9ca3af',
    limit: { background: 'rgba(220,38,38,.1)', border: '1px solid rgba(220,38,38,.3)', color: '#dc2626' },
    preview: { background: '#f9fafb' },
  };
  const t = isDarkMode ? dark : light;

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      onFileUpload(file);
    }
    e.target.value = '';
  }

  function handleKeydown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      onGenerate();
    }
  }

  const refImgs = selectedTool === 'generate' ? uploadedImages : editReferenceImages;
  const removeRefImg = selectedTool === 'generate' ? onRemoveUploadedImage : onRemoveEditReferenceImage;

  const sectionLabel = (s: string) => (
    <div style={{ fontSize: '0.82rem', fontWeight: 500, color: t.label }}>{s}</div>
  );

  // Collapsed
  if (!showPromptPanel) {
    return (
      <div style={{ width: '48px', height: '100%', ...t.panel, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <button
          onClick={onTogglePanel}
          style={{ width: '24px', height: '64px', ...t.expand, borderLeft: 'none', borderRadius: '0 8px 8px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {[0, 1, 2].map(i => <div key={i} style={{ width: '4px', height: '4px', background: t.dot, borderRadius: '50%' }} />)}
          </div>
        </button>
      </div>
    );
  }

  return (
    <div style={{
      width: '310px', height: '100%', flexShrink: 0, ...t.panel,
      display: 'flex', flexDirection: 'column', gap: '0.8rem',
      padding: '1rem', overflowY: 'auto',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.82rem', fontWeight: 500, color: t.panelH }}>모드</span>
        <button onClick={onTogglePanel} style={{ background: 'transparent', border: 'none', color: t.iconBtn, cursor: 'pointer', padding: '0.25rem', borderRadius: '4px', display: 'flex' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>

      {/* Tool Selection */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
        {([
          { id: 'generate' as ToolMode, icon: '✨', label: '생성' },
          { id: 'edit' as ToolMode, icon: '✏️', label: '편집' },
          { id: 'mask' as ToolMode, icon: '🖌️', label: '선택' },
        ]).map(tool => (
          <button
            key={tool.id}
            onClick={() => onSetTool(tool.id)}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem',
              padding: '0.5rem', borderRadius: '8px', cursor: 'pointer',
              fontSize: '0.75rem', fontWeight: 500,
              transition: 'all 0.2s',
              ...(selectedTool === tool.id ? t.toolBtnActive : t.toolBtn),
            }}
          >
            <span style={{ fontSize: '1.1rem' }}>{tool.icon}</span>
            <span>{tool.label}</span>
          </button>
        ))}
      </div>

      {/* Image Upload */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        {sectionLabel(selectedTool === 'generate' ? '참조 이미지' : selectedTool === 'edit' ? '스타일 참조' : '이미지 업로드')}
        <div style={{ fontSize: '0.72rem', color: t.hint }}>
          {selectedTool === 'generate' ? '선택사항, 최대 2개' : selectedTool === 'edit' ? '스타일 참조, 최대 2개' : '편집할 이미지를 업로드하세요'}
        </div>
        <button
          onClick={() => fileInputRef.current?.click()}
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.3rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.82rem', ...t.upload }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          업로드
        </button>
        <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
        {refImgs.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
            {refImgs.map((img, i) => (
              <div key={i} style={{ position: 'relative', borderRadius: '6px', overflow: 'hidden', ...t.preview, minHeight: '90px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Image src={img} alt={`ref ${i + 1}`} unoptimized width={0} height={0} style={{ width: '100%', height: 'auto', objectFit: 'contain', maxHeight: '160px' }} />
                <button
                  onClick={() => removeRefImg(i)}
                  style={{ position: 'absolute', top: '4px', right: '4px', width: '22px', height: '22px', background: 'rgba(239,68,68,.9)', border: 'none', borderRadius: '50%', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Prompt */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        {sectionLabel(selectedTool === 'generate' ? '만들고 싶은 이미지 설명' : '원하는 수정사항 설명')}
        {selectedTool === 'mask' && <div style={{ fontSize: '0.72rem', color: '#ef4444' }}>마스크 영역을 칠한 후 수정할 내용을 입력하세요</div>}
        <textarea
          rows={4}
          value={currentPrompt}
          onChange={(e) => onSetPrompt(e.target.value)}
          onKeyDown={handleKeydown}
          placeholder={selectedTool === 'generate' ? 'A serene landscape with mountains...' : 'Make the sky more dramatic...'}
          style={{
            width: '100%', padding: '0.65rem', borderRadius: '6px', resize: 'none',
            fontSize: '0.82rem', fontFamily: 'inherit', boxSizing: 'border-box',
            outline: 'none', ...t.textarea,
          }}
        />
      </div>

      {/* Generate Button */}
      <button
        onClick={onGenerate}
        disabled={isGenerating || !currentPrompt.trim() || isUsageLimitReached}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
          padding: '0.5rem 1.2rem', borderRadius: '8px', border: 'none', cursor: 'pointer',
          fontWeight: 600, fontSize: '0.875rem', transition: 'all 0.2s',
          ...t.genBtn, opacity: (isGenerating || !currentPrompt.trim() || isUsageLimitReached) ? 0.5 : 1,
        }}
      >
        ✨ {selectedTool === 'generate' ? '생성' : '편집 적용'}
      </button>

      {isUsageLimitReached && (
        <div style={{ ...t.limit, padding: '0.65rem', borderRadius: '6px', fontSize: '0.8rem', textAlign: 'center', lineHeight: 1.4 }}>
          일일 생성 횟수 제한({dailyUsageLimit}회)에 도달했습니다.
        </div>
      )}

      {/* Advanced Settings */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '0.82rem', ...t.adv }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: showAdvanced ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}><polyline points="6 9 12 15 18 9"/></svg>
          고급 설정 보기
        </button>
        {showAdvanced && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ fontSize: '0.72rem', color: t.hint }}>해상도</label>
              <select
                value={aspectRatio}
                onChange={(e) => onSetAspectRatio(e.target.value)}
                style={{ padding: '0.4rem', borderRadius: '4px', fontSize: '0.8rem', ...t.select }}
              >
                {ASPECT_RATIOS.map(r => (
                  <option key={r.value} value={r.value}>{r.label} — {r.desc}</option>
                ))}
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ fontSize: '0.72rem', color: t.hint }}>Temperature: {temperature.toFixed(1)}</label>
              <input
                type="range" min="0" max="1" step="0.1"
                value={temperature}
                onChange={(e) => onSetTemperature(parseFloat(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ fontSize: '0.72rem', color: t.hint }}>Seed (optional)</label>
              <input
                type="number" placeholder="Random"
                value={seed ?? ''}
                onChange={(e) => onSetSeed(e.target.value ? parseInt(e.target.value) : undefined)}
                style={{ padding: '0.4rem', borderRadius: '4px', fontSize: '0.8rem', width: '100%', boxSizing: 'border-box', ...t.select }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Clear */}
      <button
        onClick={onClearSession}
        disabled={isGenerating}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
          padding: '0.45rem 1rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.82rem',
          transition: 'all 0.2s', marginTop: 'auto', ...t.clear,
          opacity: isGenerating ? 0.5 : 1,
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.37"/></svg>
        세션 초기화
      </button>
    </div>
  );
}
