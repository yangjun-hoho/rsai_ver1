'use client';

import { useState, useEffect, useCallback } from 'react';

export interface Slide {
  slideNumber: number;
  type: 'title' | 'index' | 'content' | 'conclusion';
  title: string;
  subtitle?: string;
  content: string;
  bulletPoints: string[];
  notes?: string;
}

interface PPTViewerProps {
  slides: Slide[];
  onSlidesChange: (slides: Slide[]) => void;
  onDownload?: () => void;
  isDownloading?: boolean;
}

const STYLE = {
  titleBg: 'linear-gradient(135deg, #1E40AF 0%, #2563EB 100%)',
  titleText: '#FFFFFF', titleSub: 'rgba(255,255,255,0.8)',
  headerBg: 'linear-gradient(135deg, #ffffff 0%, #ffffff 100%)',
  headerText: '#FFFFFF',
  bg: '#F8FAFF', accent: '#2563EB', titleColor: '#1E40AF', contentColor: '#374151',
  bulletSymbol: '▶',
};

function SlideView({ slide, tpl, isFullscreen }: { slide: Slide; tpl: typeof STYLE; isFullscreen: boolean }) {
  const baseFontTitle = isFullscreen ? '2.8rem' : '1.5rem';
  const baseFontSub = isFullscreen ? '1.4rem' : '0.9rem';
  const baseFontContent = isFullscreen ? '1.1rem' : '0.82rem';
  const baseFontBullet = isFullscreen ? '1rem' : '0.8rem';

  if (slide.type === 'title') {
    return (
      <div style={{ background: tpl.titleBg, borderRadius: isFullscreen ? 0 : '12px', padding: isFullscreen ? '4rem 6rem' : '2.5rem', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', boxShadow: isFullscreen ? 'none' : '0 8px 32px rgba(0,0,0,0.15)' }}>
        <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', marginBottom: '1rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Presentation</div>
        <h1 style={{ margin: '0 0 1rem 0', fontSize: baseFontTitle, fontWeight: '800', color: tpl.titleText, lineHeight: 1.2, textShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>{slide.title}</h1>
        {slide.subtitle && <p style={{ margin: '0 0 1.5rem 0', fontSize: baseFontSub, color: tpl.titleSub, lineHeight: 1.4 }}>{slide.subtitle}</p>}
        <div style={{ width: '60px', height: '3px', background: 'rgba(255,255,255,0.5)', borderRadius: '2px' }} />
      </div>
    );
  }

  if (slide.type === 'index') {
    return (
      <div style={{ background: tpl.bg, borderRadius: isFullscreen ? 0 : '12px', padding: isFullscreen ? '3rem 5rem' : '2rem', height: '100%', boxShadow: isFullscreen ? 'none' : '0 8px 32px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div style={{ width: '6px', height: '2rem', background: tpl.accent, borderRadius: '3px' }} />
          <h2 style={{ margin: 0, fontSize: baseFontTitle, fontWeight: '700', color: tpl.titleColor }}>목차</h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {slide.bulletPoints.map((pt, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.5rem 0.75rem', borderRadius: '6px', background: 'white', border: `1px solid ${tpl.accent}22` }}>
              <span style={{ minWidth: '28px', height: '28px', background: tpl.accent, color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: '700' }}>{i + 1}</span>
              <span style={{ fontSize: baseFontContent, color: tpl.contentColor, fontWeight: '500' }}>{pt}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (slide.type === 'conclusion') {
    return (
      <div style={{ background: tpl.bg, borderRadius: isFullscreen ? 0 : '12px', padding: isFullscreen ? '3rem 5rem' : '2rem', height: '100%', boxShadow: isFullscreen ? 'none' : '0 8px 32px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ background: tpl.accent, color: 'white', display: 'inline-block', padding: '0.2rem 0.75rem', borderRadius: '4px', fontSize: '0.72rem', fontWeight: '700', marginBottom: '0.75rem', alignSelf: 'flex-start' }}>결론</div>
        <h2 style={{ margin: '0 0 0.75rem 0', fontSize: baseFontTitle, fontWeight: '700', color: tpl.titleColor, lineHeight: 1.3 }}>{slide.title}</h2>
        {slide.content && <p style={{ margin: '0 0 1rem 0', fontSize: baseFontContent, color: tpl.contentColor, lineHeight: 1.6, fontStyle: 'italic' }}>{slide.content}</p>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {slide.bulletPoints.map((pt, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
              <span style={{ color: tpl.accent, fontWeight: '700', fontSize: baseFontBullet, marginTop: '0.1rem' }}>✓</span>
              <span style={{ fontSize: baseFontBullet, color: tpl.contentColor, lineHeight: 1.5 }}>{pt}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // content
  return (
    <div style={{ background: tpl.bg, borderRadius: isFullscreen ? 0 : '12px', padding: isFullscreen ? '3rem 5rem' : '2rem', height: '100%', boxShadow: isFullscreen ? 'none' : '0 8px 32px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
        <div style={{ width: '4px', height: '1.8rem', background: tpl.accent, borderRadius: '2px' }} />
        <h2 style={{ margin: 0, fontSize: baseFontTitle, fontWeight: '700', color: tpl.titleColor, lineHeight: 1.3 }}>{slide.title}</h2>
      </div>
      <div style={{ height: '1px', background: `${tpl.accent}33`, marginBottom: '0.75rem' }} />
      {slide.content && <p style={{ margin: '0 0 0.75rem 0', fontSize: baseFontContent, color: tpl.contentColor, lineHeight: 1.6, fontStyle: 'italic' }}>{slide.content}</p>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
        {slide.bulletPoints.map((pt, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
            <span style={{ color: tpl.accent, fontWeight: '700', fontSize: baseFontBullet, marginTop: '0.15rem', flexShrink: 0 }}>{tpl.bulletSymbol}</span>
            <span style={{ fontSize: baseFontBullet, color: tpl.contentColor, lineHeight: 1.5 }}>{pt}</span>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 'auto', paddingTop: '0.5rem', textAlign: 'right', fontSize: '0.65rem', color: '#9CA3AF' }}>
        {slide.slideNumber}
      </div>
    </div>
  );
}

function EditPanel({ slide, onSave, onCancel }: { slide: Slide; onSave: (s: Slide) => void; onCancel: () => void }) {
  const [draft, setDraft] = useState<Slide>({ ...slide, bulletPoints: [...slide.bulletPoints] });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', padding: '0.75rem', background: '#F9FAFB', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
      <div>
        <label style={{ fontSize: '0.72rem', fontWeight: '600', color: '#6B7280', display: 'block', marginBottom: '0.25rem' }}>제목</label>
        <input value={draft.title} onChange={e => setDraft(p => ({ ...p, title: e.target.value }))} style={{ width: '100%', padding: '0.35rem 0.5rem', border: '1px solid #D1D5DB', borderRadius: '5px', fontSize: '0.82rem', boxSizing: 'border-box' }} />
      </div>
      {(draft.type === 'title') && (
        <div>
          <label style={{ fontSize: '0.72rem', fontWeight: '600', color: '#6B7280', display: 'block', marginBottom: '0.25rem' }}>부제목</label>
          <input value={draft.subtitle ?? ''} onChange={e => setDraft(p => ({ ...p, subtitle: e.target.value }))} style={{ width: '100%', padding: '0.35rem 0.5rem', border: '1px solid #D1D5DB', borderRadius: '5px', fontSize: '0.82rem', boxSizing: 'border-box' }} />
        </div>
      )}
      <div>
        <label style={{ fontSize: '0.72rem', fontWeight: '600', color: '#6B7280', display: 'block', marginBottom: '0.25rem' }}>설명</label>
        <textarea value={draft.content} onChange={e => setDraft(p => ({ ...p, content: e.target.value }))} rows={2} style={{ width: '100%', padding: '0.35rem 0.5rem', border: '1px solid #D1D5DB', borderRadius: '5px', fontSize: '0.82rem', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' }} />
      </div>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
          <label style={{ fontSize: '0.72rem', fontWeight: '600', color: '#6B7280' }}>불릿 포인트</label>
          <button type="button" onClick={() => setDraft(p => ({ ...p, bulletPoints: [...p.bulletPoints, ''] }))} style={{ fontSize: '0.7rem', color: '#2563EB', background: 'none', border: 'none', cursor: 'pointer', padding: '0' }}>+ 추가</button>
        </div>
        {draft.bulletPoints.map((pt, i) => (
          <div key={i} style={{ display: 'flex', gap: '0.3rem', marginBottom: '0.3rem' }}>
            <input value={pt} onChange={e => setDraft(p => { const bp = [...p.bulletPoints]; bp[i] = e.target.value; return { ...p, bulletPoints: bp }; })} style={{ flex: 1, padding: '0.3rem 0.5rem', border: '1px solid #D1D5DB', borderRadius: '5px', fontSize: '0.78rem', boxSizing: 'border-box' }} />
            <button type="button" onClick={() => setDraft(p => ({ ...p, bulletPoints: p.bulletPoints.filter((_, j) => j !== i) }))} style={{ padding: '0.3rem 0.5rem', background: '#FEE2E2', color: '#EF4444', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}>✕</button>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
        <button type="button" onClick={onCancel} style={{ padding: '0.35rem 0.75rem', background: 'white', border: '1px solid #D1D5DB', borderRadius: '5px', fontSize: '0.78rem', cursor: 'pointer' }}>취소</button>
        <button type="button" onClick={() => onSave(draft)} style={{ padding: '0.35rem 0.75rem', background: '#2563EB', color: 'white', border: 'none', borderRadius: '5px', fontSize: '0.78rem', cursor: 'pointer', fontWeight: '600' }}>저장</button>
      </div>
    </div>
  );
}

export default function PPTViewer({ slides, onSlidesChange, onDownload, isDownloading }: PPTViewerProps) {
  const [current, setCurrent] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [fullscreen, setFullscreen] = useState(false);

  const tpl = STYLE;
  const slide = slides[current];

  const goNext = useCallback(() => setCurrent(c => Math.min(slides.length - 1, c + 1)), [slides.length]);
  const goPrev = useCallback(() => setCurrent(c => Math.max(0, c - 1)), []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (fullscreen) {
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') goNext();
        if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') goPrev();
        if (e.key === 'Escape') setFullscreen(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [fullscreen, goNext, goPrev]);

  function handleSaveEdit(updated: Slide) {
    if (editingIdx === null) return;
    const next = slides.map((s, i) => i === editingIdx ? updated : s);
    onSlidesChange(next);
    setEditingIdx(null);
  }

  if (!slide) return null;

  return (
    <>
      {/* 전체화면 모달 */}
      {fullscreen && (
        <div style={{ position: 'fixed', inset: 0, background: '#000', zIndex: 9999, display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <SlideView slide={slide} tpl={tpl} isFullscreen={true} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2rem', padding: '1rem', background: 'rgba(0,0,0,0.8)' }}>
            <button onClick={goPrev} disabled={current === 0} style={{ padding: '0.5rem 1.5rem', background: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '6px', cursor: current === 0 ? 'not-allowed' : 'pointer', fontSize: '0.9rem', opacity: current === 0 ? 0.4 : 1 }}>← 이전</button>
            <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>{current + 1} / {slides.length}</span>
            <button onClick={goNext} disabled={current === slides.length - 1} style={{ padding: '0.5rem 1.5rem', background: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '6px', cursor: current === slides.length - 1 ? 'not-allowed' : 'pointer', fontSize: '0.9rem', opacity: current === slides.length - 1 ? 0.4 : 1 }}>다음 →</button>
            <button onClick={() => setFullscreen(false)} style={{ padding: '0.5rem 1rem', background: 'rgba(239,68,68,0.3)', color: 'white', border: '1px solid rgba(239,68,68,0.5)', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}>✕ 닫기</button>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* 상단 컨트롤 바 */}
        <div style={{ padding: '0.75rem 1rem', background: 'white', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0, flexWrap: 'nowrap' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-secondary)', whiteSpace: 'nowrap', marginRight: '0.25rem' }}>
            {current + 1} / {slides.length}
          </span>
          <button
            onClick={() => { setEditMode(m => !m); setEditingIdx(null); }}
            style={{ padding: '0.3rem 0.65rem', background: editMode ? 'var(--focus-color)' : 'white', color: editMode ? 'white' : 'var(--text-secondary)', border: `1px solid ${editMode ? 'transparent' : 'var(--border-color)'}`, borderRadius: '4px', fontSize: '0.72rem', cursor: 'pointer', whiteSpace: 'nowrap' }}
          >
            {editMode ? '✓ 완료' : '✏️ 편집'}
          </button>
          <button
            onClick={() => setFullscreen(true)}
            style={{ padding: '0.3rem 0.65rem', background: 'white', color: 'var(--text-secondary)', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '0.72rem', cursor: 'pointer', whiteSpace: 'nowrap' }}
          >
            ⛶ 전체화면
          </button>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.4rem' }}>
            <button
              onClick={() => navigator.clipboard.writeText(slides.map(s => `[${s.slideNumber}] ${s.title}\n${s.content}\n${s.bulletPoints.join('\n')}`).join('\n\n')).then(() => alert('복사 완료'))}
              style={{ padding: '0.3rem 0.65rem', background: 'var(--focus-color)', color: 'white', border: 'none', borderRadius: '4px', fontSize: '0.72rem', cursor: 'pointer', whiteSpace: 'nowrap' }}
            >
              복사
            </button>
            {onDownload && (
              <button
                onClick={onDownload}
                disabled={isDownloading}
                style={{ padding: '0.3rem 0.65rem', background: isDownloading ? '#aaa' : '#16a34a', color: 'white', border: 'none', borderRadius: '4px', fontSize: '0.72rem', cursor: isDownloading ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap' }}
              >
                {isDownloading ? '생성 중...' : '⬇️ 다운로드'}
              </button>
            )}
          </div>
        </div>

        {/* 슬라이드 미리보기 */}
        <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', background: '#E5E7EB', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ aspectRatio: '16/9', maxHeight: '340px', alignSelf: 'stretch' }}>
            <SlideView slide={slide} tpl={tpl} isFullscreen={false} />
          </div>

          {/* 편집 패널 */}
          {editMode && (
            editingIdx === current
              ? <EditPanel slide={slides[current]} onSave={handleSaveEdit} onCancel={() => setEditingIdx(null)} />
              : <button onClick={() => setEditingIdx(current)} style={{ padding: '0.4rem', background: 'white', border: '1px dashed #D1D5DB', borderRadius: '6px', fontSize: '0.78rem', color: '#6B7280', cursor: 'pointer' }}>✏️ 이 슬라이드 편집</button>
          )}

          {/* 슬라이드 노트 */}
          {slide.notes && (
            <div style={{ padding: '0.6rem 0.75rem', background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '6px', fontSize: '0.75rem', color: '#92400E' }}>
              <strong>발표자 노트:</strong> {slide.notes}
            </div>
          )}
        </div>

        {/* 썸네일 & 네비게이션 */}
        <div style={{ flexShrink: 0, background: 'white', borderTop: '1px solid #E5E7EB' }}>
          <div style={{ display: 'flex', gap: '0.3rem', padding: '0.5rem', overflowX: 'auto' }}>
            {slides.map((s, i) => (
              <button
                key={i}
                onClick={() => { setCurrent(i); setEditingIdx(null); }}
                style={{
                  flexShrink: 0, width: '64px', height: '40px',
                  border: i === current ? `2px solid ${tpl.accent}` : '2px solid transparent',
                  borderRadius: '4px', overflow: 'hidden', cursor: 'pointer', padding: 0,
                  background: s.type === 'title' || s.type === 'index' ? tpl.accent : tpl.bg,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1px',
                }}
              >
                <span style={{ fontSize: '0.5rem', color: s.type === 'title' || s.type === 'index' ? 'white' : tpl.titleColor, fontWeight: '700', textAlign: 'center', padding: '0 2px', lineHeight: 1.2, overflow: 'hidden', maxHeight: '20px', display: 'block', width: '100%', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.title}</span>
                <span style={{ fontSize: '0.45rem', color: s.type === 'title' || s.type === 'index' ? 'rgba(255,255,255,0.7)' : '#9CA3AF' }}>{i + 1}</span>
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem', borderTop: '1px solid #F3F4F6' }}>
            <button onClick={goPrev} disabled={current === 0} style={{ padding: '0.3rem 0.75rem', background: current === 0 ? '#F3F4F6' : tpl.accent, color: current === 0 ? '#9CA3AF' : 'white', border: 'none', borderRadius: '5px', fontSize: '0.78rem', cursor: current === 0 ? 'not-allowed' : 'pointer' }}>← 이전</button>
            <span style={{ flex: 1, textAlign: 'center', fontSize: '0.75rem', color: '#6B7280' }}>{current + 1} / {slides.length}</span>
            <button onClick={goNext} disabled={current === slides.length - 1} style={{ padding: '0.3rem 0.75rem', background: current === slides.length - 1 ? '#F3F4F6' : tpl.accent, color: current === slides.length - 1 ? '#9CA3AF' : 'white', border: 'none', borderRadius: '5px', fontSize: '0.78rem', cursor: current === slides.length - 1 ? 'not-allowed' : 'pointer' }}>다음 →</button>
          </div>
        </div>
      </div>
    </>
  );
}
