'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

export interface Slide {
  slideNumber: number;
  type: 'title' | 'index' | 'content' | 'conclusion';
  title: string;
  subtitle?: string;
  content: string;
  bulletPoints: string[];
  notes?: string;
}

export type TemplateId = 'template1' | 'template2';

export const TEMPLATES: { id: TemplateId; label: string; desc: string }[] = [
  { id: 'template1', label: '기획조정실', desc: '네이비 스트립' },
  { id: 'template2', label: '교통국',     desc: '퍼플 모던' },
];

interface PPTViewerProps {
  slides: Slide[];
  onSlidesChange: (slides: Slide[]) => void;
  onDownload?: () => void;
  isDownloading?: boolean;
  onTemplateChange?: (t: TemplateId) => void;
  defaultTemplate?: TemplateId;
}

/* ══════════════════════════════════════════════════════
   템플릿 1 색상 (기획조정실 – 네이비 스트립)
══════════════════════════════════════════════════════ */
const T1 = {
  navy:  '#1D3A8F', green: '#149B40',
  red:   '#C00000', gold:  '#FFC000',
  blue:  '#5B9BD5', gray:  '#6B7280',
  light: '#EEF2FF',
};

/* ══════════════════════════════════════════════════════
   템플릿 2 색상 (교통국 – 퍼플 모던)
══════════════════════════════════════════════════════ */
const T2 = {
  purple: '#7030A0', blue:  '#0070C0',
  navy:   '#1D3A8F', green: '#149B40',
  gray:   '#6B7280', light: '#F5F0FA',
  stripe: '#5B9BD5',
};

/* ────────── 공통 유틸 ────────── */
function px(n: number, s: number) { return `${Math.round(n * s)}px`; }

/* ══════════════════════════════════════════════════════
   TEMPLATE 1 SlideView
══════════════════════════════════════════════════════ */
function T1LeftStrip({ isFullscreen }: { isFullscreen: boolean }) {
  const w = isFullscreen ? '160px' : '90px';
  return (
    <div style={{ width: w, flexShrink: 0, background: T1.navy, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '12px 0', gap: '6px', overflow: 'hidden' }}>
      <span style={{ color: T1.gold, fontWeight: 900, fontSize: isFullscreen ? '26px' : '14px', letterSpacing: '0.02em', fontFamily: "'맑은 고딕', sans-serif" }}>2026</span>
      <span style={{ color: 'white', fontWeight: 800, fontSize: isFullscreen ? '15px' : '9px', writingMode: 'vertical-lr', letterSpacing: '0.18em', opacity: 0.85, fontFamily: "'맑은 고딕', sans-serif" }}>NAMYANGJU</span>
    </div>
  );
}

function SlideViewT1({ slide, isFullscreen }: { slide: Slide; isFullscreen: boolean }) {
  const s = isFullscreen ? 1 : 0.56;

  if (slide.type === 'title') {
    return (
      <div style={{ height: '100%', overflow: 'hidden', borderRadius: isFullscreen ? 0 : '12px', boxShadow: isFullscreen ? 'none' : '0 8px 32px rgba(0,0,0,0.15)', backgroundImage: 'url(/ppt-template/bg-title.png)', backgroundSize: 'cover', backgroundPosition: 'center', display: 'flex', flexDirection: 'column' }}>
        <div style={{ height: px(8, s), background: T1.green, flexShrink: 0 }} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: isFullscreen ? '3rem 4rem' : '1.5rem 2rem', gap: isFullscreen ? '20px' : '10px' }}>
          <div style={{ fontSize: px(13, s), color: T1.gray, letterSpacing: '0.12em', fontFamily: "'맑은 고딕', sans-serif" }}>남양주시청</div>
          <div style={{ width: px(50, s), height: '3px', background: T1.navy, borderRadius: '2px' }} />
          <h1 style={{ margin: 0, fontSize: px(38, s), fontWeight: 900, color: T1.navy, lineHeight: 1.25, fontFamily: "'맑은 고딕', sans-serif" }}>{slide.title}</h1>
          {slide.subtitle && <p style={{ margin: 0, fontSize: px(18, s), color: '#374151', lineHeight: 1.5, fontFamily: "'맑은 고딕', sans-serif" }}>{slide.subtitle}</p>}
        </div>
        <div style={{ background: T1.navy, flexShrink: 0, padding: isFullscreen ? '10px 28px' : '6px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: px(11, s), fontFamily: "'맑은 고딕', sans-serif" }}>기획조정실</span>
          <span style={{ color: T1.gold, fontSize: px(11, s), fontWeight: 700, fontFamily: "'맑은 고딕', sans-serif" }}>2026</span>
        </div>
      </div>
    );
  }

  if (slide.type === 'index') {
    return (
      <div style={{ display: 'flex', height: '100%', overflow: 'hidden', borderRadius: isFullscreen ? 0 : '12px', boxShadow: isFullscreen ? 'none' : '0 8px 32px rgba(0,0,0,0.15)' }}>
        <T1LeftStrip isFullscreen={isFullscreen} />
        <div style={{ flex: 1, background: 'white', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ background: T1.navy, flexShrink: 0, padding: isFullscreen ? '13px 20px' : '7px 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '4px', height: px(20, s), background: T1.gold, borderRadius: '2px' }} />
            <h2 style={{ margin: 0, fontSize: px(21, s), fontWeight: 700, color: 'white', fontFamily: "'맑은 고딕', sans-serif" }}>목차</h2>
          </div>
          <div style={{ flex: 1, padding: isFullscreen ? '1.2rem 1.5rem' : '0.6rem 0.8rem', display: 'flex', flexDirection: 'column', gap: isFullscreen ? '10px' : '5px', overflow: 'hidden' }}>
            {slide.bulletPoints.map((pt, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: isFullscreen ? '12px' : '7px', padding: isFullscreen ? '9px 14px' : '5px 8px', background: T1.light, borderRadius: '6px', borderLeft: `3px solid ${T1.navy}` }}>
                <span style={{ width: px(26, s), height: px(26, s), background: T1.navy, color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: px(12, s), fontWeight: 700, flexShrink: 0, fontFamily: "'맑은 고딕', sans-serif" }}>{i + 1}</span>
                <span style={{ fontSize: px(15, s), color: '#1F2937', fontWeight: 500, fontFamily: "'맑은 고딕', sans-serif" }}>{pt}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (slide.type === 'conclusion') {
    return (
      <div style={{ display: 'flex', height: '100%', overflow: 'hidden', borderRadius: isFullscreen ? 0 : '12px', boxShadow: isFullscreen ? 'none' : '0 8px 32px rgba(0,0,0,0.15)' }}>
        <T1LeftStrip isFullscreen={isFullscreen} />
        <div style={{ flex: 1, background: 'white', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ background: T1.navy, flexShrink: 0, padding: isFullscreen ? '13px 20px' : '7px 12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ background: T1.green, color: 'white', fontWeight: 700, fontSize: px(11, s), padding: isFullscreen ? '3px 12px' : '2px 7px', borderRadius: '4px', fontFamily: "'맑은 고딕', sans-serif" }}>결론</span>
            <h2 style={{ margin: 0, fontSize: px(19, s), fontWeight: 700, color: 'white', fontFamily: "'맑은 고딕', sans-serif" }}>{slide.title}</h2>
          </div>
          <div style={{ flex: 1, padding: isFullscreen ? '1.2rem 1.5rem' : '0.6rem 0.8rem', display: 'flex', flexDirection: 'column', gap: isFullscreen ? '10px' : '5px', overflow: 'hidden' }}>
            {slide.content && <p style={{ margin: 0, fontSize: px(13, s), color: '#374151', fontStyle: 'italic', lineHeight: 1.6, borderLeft: `3px solid ${T1.blue}`, paddingLeft: isFullscreen ? '12px' : '7px', fontFamily: "'맑은 고딕', sans-serif" }}>{slide.content}</p>}
            {slide.bulletPoints.map((pt, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: isFullscreen ? '10px' : '6px' }}>
                <span style={{ color: T1.green, fontWeight: 700, fontSize: px(16, s), flexShrink: 0 }}>✓</span>
                <span style={{ fontSize: px(14, s), color: '#1F2937', lineHeight: 1.55, fontFamily: "'맑은 고딕', sans-serif" }}>{pt}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* 본문 */
  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden', borderRadius: isFullscreen ? 0 : '12px', boxShadow: isFullscreen ? 'none' : '0 8px 32px rgba(0,0,0,0.15)' }}>
      <T1LeftStrip isFullscreen={isFullscreen} />
      <div style={{ flex: 1, background: 'white', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: isFullscreen ? '5px 16px' : '3px 10px', borderBottom: `2px solid ${T1.navy}`, flexShrink: 0 }}>
          <span style={{ fontSize: px(10, s), color: T1.gray, fontFamily: "'맑은 고딕', sans-serif" }}>기획조정실</span>
          <span style={{ fontSize: px(10, s), color: T1.gray, fontFamily: "'맑은 고딕', sans-serif" }}>{slide.slideNumber}</span>
        </div>
        <div style={{ background: T1.navy, flexShrink: 0, padding: isFullscreen ? '11px 18px' : '6px 11px' }}>
          <h2 style={{ margin: 0, fontSize: px(21, s), fontWeight: 700, color: 'white', lineHeight: 1.3, fontFamily: "'맑은 고딕', sans-serif" }}>{slide.title}</h2>
        </div>
        <div style={{ flex: 1, overflow: 'hidden', padding: isFullscreen ? '1rem 1.25rem' : '0.5rem 0.7rem', display: 'flex', flexDirection: 'column', gap: isFullscreen ? '8px' : '4px' }}>
          {slide.content && <p style={{ margin: 0, fontSize: px(12, s), color: '#374151', fontStyle: 'italic', lineHeight: 1.6, paddingBottom: isFullscreen ? '6px' : '4px', borderBottom: '1px solid #E5E7EB', fontFamily: "'맑은 고딕', sans-serif" }}>{slide.content}</p>}
          {slide.bulletPoints.map((pt, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: isFullscreen ? '10px' : '6px' }}>
              <div style={{ width: '3px', flexShrink: 0, height: isFullscreen ? '18px' : '12px', background: i % 2 === 0 ? T1.navy : T1.gold, borderRadius: '2px', marginTop: '3px' }} />
              <div style={{ width: px(8, s), height: px(8, s), borderRadius: '50%', flexShrink: 0, background: i % 2 === 0 ? T1.navy : T1.gold, marginTop: isFullscreen ? '5px' : '3px' }} />
              <span style={{ fontSize: px(13, s), color: '#1F2937', lineHeight: 1.55, fontFamily: "'맑은 고딕', sans-serif" }}>{pt}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   TEMPLATE 2 SlideView (교통국 – 퍼플 모던)
══════════════════════════════════════════════════════ */
function SlideViewT2({ slide, isFullscreen }: { slide: Slide; isFullscreen: boolean }) {
  const s = isFullscreen ? 1 : 0.56;

  if (slide.type === 'title') {
    return (
      <div style={{ height: '100%', overflow: 'hidden', borderRadius: isFullscreen ? 0 : '12px', boxShadow: isFullscreen ? 'none' : '0 8px 32px rgba(0,0,0,0.15)', background: 'white', display: 'flex', flexDirection: 'column', position: 'relative' }}>
        {/* 배경 이미지 (우측 장식) */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'url(/ppt-template/bg2-content.png)', backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.18 }} />
        {/* 상단 퍼플 바 */}
        <div style={{ height: px(7, s), background: T2.purple, flexShrink: 0, position: 'relative', zIndex: 1 }} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: isFullscreen ? '3rem 4rem' : '1.5rem 2rem', gap: isFullscreen ? '18px' : '9px', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: px(10, s) }}>
            <div style={{ width: px(4, s), height: px(30, s), background: T2.purple, borderRadius: '2px' }} />
            <span style={{ fontSize: px(13, s), color: T2.gray, letterSpacing: '0.1em', fontFamily: "'맑은 고딕', sans-serif" }}>남양주시</span>
          </div>
          <h1 style={{ margin: 0, fontSize: px(36, s), fontWeight: 900, color: T2.navy, lineHeight: 1.25, fontFamily: "'맑은 고딕', sans-serif" }}>{slide.title}</h1>
          {slide.subtitle && <p style={{ margin: 0, fontSize: px(17, s), color: T2.purple, lineHeight: 1.5, fontWeight: 600, fontFamily: "'맑은 고딕', sans-serif" }}>{slide.subtitle}</p>}
        </div>
        {/* 하단 스트라이프 바 */}
        <div style={{ flexShrink: 0, display: 'flex', position: 'relative', zIndex: 1 }}>
          <div style={{ flex: 2, height: px(10, s), background: T2.blue }} />
          <div style={{ flex: 1, height: px(10, s), background: T2.green }} />
          <div style={{ flex: 3, height: px(10, s), background: T2.purple }} />
        </div>
      </div>
    );
  }

  if (slide.type === 'index') {
    return (
      <div style={{ height: '100%', overflow: 'hidden', borderRadius: isFullscreen ? 0 : '12px', boxShadow: isFullscreen ? 'none' : '0 8px 32px rgba(0,0,0,0.15)', background: 'white', display: 'flex', flexDirection: 'column' }}>
        {/* 상단 컬러 바 */}
        <div style={{ display: 'flex', flexShrink: 0 }}>
          <div style={{ flex: 3, height: px(6, s), background: T2.purple }} />
          <div style={{ flex: 1, height: px(6, s), background: T2.blue }} />
          <div style={{ flex: 1, height: px(6, s), background: T2.green }} />
        </div>
        <div style={{ padding: isFullscreen ? '14px 20px' : '8px 12px', display: 'flex', alignItems: 'center', gap: '10px', borderBottom: `1px solid #E5E7EB`, flexShrink: 0 }}>
          <span style={{ background: T2.purple, color: 'white', fontWeight: 700, fontSize: px(12, s), padding: isFullscreen ? '4px 14px' : '2px 8px', borderRadius: '4px', fontFamily: "'맑은 고딕', sans-serif" }}>목차</span>
          <span style={{ fontSize: px(11, s), color: T2.gray, fontFamily: "'맑은 고딕', sans-serif" }}>TABLE OF CONTENTS</span>
        </div>
        <div style={{ flex: 1, padding: isFullscreen ? '1.2rem 1.5rem' : '0.6rem 0.8rem', display: 'flex', flexDirection: 'column', gap: isFullscreen ? '8px' : '4px', overflow: 'hidden' }}>
          {slide.bulletPoints.map((pt, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: isFullscreen ? '12px' : '7px', padding: isFullscreen ? '8px 12px' : '4px 8px', borderRadius: '6px', background: i % 2 === 0 ? T2.light : 'white', border: `1px solid ${i % 2 === 0 ? T2.purple + '33' : '#E5E7EB'}` }}>
              <span style={{ width: px(32, s), height: px(24, s), background: T2.purple, color: 'white', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: px(10, s), fontWeight: 700, flexShrink: 0, fontFamily: 'Arial, sans-serif', letterSpacing: '0.05em' }}>
                {String(i + 1).padStart(3, '0')}
              </span>
              <span style={{ fontSize: px(14, s), color: '#1F2937', fontWeight: 500, fontFamily: "'맑은 고딕', sans-serif" }}>{pt}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (slide.type === 'conclusion') {
    return (
      <div style={{ height: '100%', overflow: 'hidden', borderRadius: isFullscreen ? 0 : '12px', boxShadow: isFullscreen ? 'none' : '0 8px 32px rgba(0,0,0,0.15)', background: 'white', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', flexShrink: 0 }}>
          <div style={{ flex: 3, height: px(6, s), background: T2.purple }} />
          <div style={{ flex: 1, height: px(6, s), background: T2.blue }} />
          <div style={{ flex: 1, height: px(6, s), background: T2.green }} />
        </div>
        <div style={{ background: `linear-gradient(135deg, ${T2.purple}, ${T2.blue})`, flexShrink: 0, padding: isFullscreen ? '13px 20px' : '7px 12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ background: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 700, fontSize: px(11, s), padding: isFullscreen ? '3px 12px' : '2px 7px', borderRadius: '20px', fontFamily: "'맑은 고딕', sans-serif" }}>결론</span>
          <h2 style={{ margin: 0, fontSize: px(19, s), fontWeight: 700, color: 'white', fontFamily: "'맑은 고딕', sans-serif" }}>{slide.title}</h2>
        </div>
        <div style={{ flex: 1, padding: isFullscreen ? '1.2rem 1.5rem' : '0.6rem 0.8rem', display: 'flex', flexDirection: 'column', gap: isFullscreen ? '10px' : '5px', overflow: 'hidden' }}>
          {slide.content && <p style={{ margin: 0, fontSize: px(13, s), color: '#374151', fontStyle: 'italic', lineHeight: 1.6, borderLeft: `3px solid ${T2.purple}`, paddingLeft: isFullscreen ? '12px' : '7px', fontFamily: "'맑은 고딕', sans-serif" }}>{slide.content}</p>}
          {slide.bulletPoints.map((pt, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: isFullscreen ? '10px' : '6px' }}>
              <span style={{ color: T2.green, fontWeight: 700, fontSize: px(16, s), flexShrink: 0 }}>✓</span>
              <span style={{ fontSize: px(14, s), color: '#1F2937', lineHeight: 1.55, fontFamily: "'맑은 고딕', sans-serif" }}>{pt}</span>
            </div>
          ))}
        </div>
        <div style={{ flexShrink: 0, display: 'flex' }}>
          <div style={{ flex: 2, height: px(8, s), background: T2.blue }} />
          <div style={{ flex: 1, height: px(8, s), background: T2.green }} />
          <div style={{ flex: 3, height: px(8, s), background: T2.purple }} />
        </div>
      </div>
    );
  }

  /* 본문 */
  return (
    <div style={{ height: '100%', overflow: 'hidden', borderRadius: isFullscreen ? 0 : '12px', boxShadow: isFullscreen ? 'none' : '0 8px 32px rgba(0,0,0,0.15)', background: 'white', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'url(/ppt-template/bg2-content.png)', backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.08 }} />
      {/* 상단 컬러 바 */}
      <div style={{ display: 'flex', flexShrink: 0, position: 'relative', zIndex: 1 }}>
        <div style={{ flex: 3, height: px(5, s), background: T2.purple }} />
        <div style={{ flex: 1, height: px(5, s), background: T2.blue }} />
        <div style={{ flex: 1, height: px(5, s), background: T2.green }} />
      </div>
      {/* 헤더 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: isFullscreen ? '5px 16px' : '3px 10px', borderBottom: `1px solid #E5E7EB`, flexShrink: 0, position: 'relative', zIndex: 1 }}>
        <span style={{ fontSize: px(10, s), color: T2.gray, fontFamily: "'맑은 고딕', sans-serif" }}>교통국</span>
        <span style={{ fontSize: px(10, s), color: T2.gray, fontFamily: "'맑은 고딕', sans-serif" }}>{slide.slideNumber}</span>
      </div>
      {/* 제목 박스 */}
      <div style={{ background: `linear-gradient(90deg, ${T2.purple}, ${T2.blue}88)`, flexShrink: 0, padding: isFullscreen ? '11px 18px' : '6px 11px', display: 'flex', alignItems: 'center', gap: '8px', position: 'relative', zIndex: 1 }}>
        <div style={{ width: '4px', height: px(22, s), background: T2.green, borderRadius: '2px', flexShrink: 0 }} />
        <h2 style={{ margin: 0, fontSize: px(20, s), fontWeight: 700, color: 'white', lineHeight: 1.3, fontFamily: "'맑은 고딕', sans-serif" }}>{slide.title}</h2>
      </div>
      {/* 내용 */}
      <div style={{ flex: 1, overflow: 'hidden', padding: isFullscreen ? '1rem 1.25rem' : '0.5rem 0.7rem', display: 'flex', flexDirection: 'column', gap: isFullscreen ? '8px' : '4px', position: 'relative', zIndex: 1 }}>
        {slide.content && <p style={{ margin: 0, fontSize: px(12, s), color: '#374151', fontStyle: 'italic', lineHeight: 1.6, paddingBottom: isFullscreen ? '6px' : '4px', borderBottom: '1px solid #E5E7EB', fontFamily: "'맑은 고딕', sans-serif" }}>{slide.content}</p>}
        {slide.bulletPoints.map((pt, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: isFullscreen ? '10px' : '6px' }}>
            <div style={{ width: '3px', flexShrink: 0, height: isFullscreen ? '18px' : '12px', background: i % 2 === 0 ? T2.purple : T2.blue, borderRadius: '2px', marginTop: '3px' }} />
            <div style={{ width: px(8, s), height: px(8, s), borderRadius: '50%', flexShrink: 0, background: i % 2 === 0 ? T2.purple : T2.blue, marginTop: isFullscreen ? '5px' : '3px' }} />
            <span style={{ fontSize: px(13, s), color: '#1F2937', lineHeight: 1.55, fontFamily: "'맑은 고딕', sans-serif" }}>{pt}</span>
          </div>
        ))}
      </div>
      {/* 하단 스트라이프 */}
      <div style={{ flexShrink: 0, display: 'flex', position: 'relative', zIndex: 1 }}>
        <div style={{ flex: 2, height: px(6, s), background: T2.blue }} />
        <div style={{ flex: 1, height: px(6, s), background: T2.green }} />
        <div style={{ flex: 3, height: px(6, s), background: T2.purple }} />
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   편집 패널
══════════════════════════════════════════════════════ */
function EditPanel({ slide, onSave, onCancel }: { slide: Slide; onSave: (s: Slide) => void; onCancel: () => void }) {
  const [draft, setDraft] = useState<Slide>({ ...slide, bulletPoints: [...slide.bulletPoints] });
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', padding: '0.75rem', background: '#F9FAFB', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
      <div>
        <label style={{ fontSize: '0.72rem', fontWeight: '600', color: '#6B7280', display: 'block', marginBottom: '0.25rem' }}>제목</label>
        <input value={draft.title} onChange={e => setDraft(p => ({ ...p, title: e.target.value }))} style={{ width: '100%', padding: '0.35rem 0.5rem', border: '1px solid #D1D5DB', borderRadius: '5px', fontSize: '0.82rem', boxSizing: 'border-box' }} />
      </div>
      {draft.type === 'title' && (
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
          <button type="button" onClick={() => setDraft(p => ({ ...p, bulletPoints: [...p.bulletPoints, ''] }))} style={{ fontSize: '0.7rem', color: T2.purple, background: 'none', border: 'none', cursor: 'pointer' }}>+ 추가</button>
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
        <button type="button" onClick={() => onSave(draft)} style={{ padding: '0.35rem 0.75rem', background: T2.purple, color: 'white', border: 'none', borderRadius: '5px', fontSize: '0.78rem', cursor: 'pointer', fontWeight: '600' }}>저장</button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   메인 PPTViewer
══════════════════════════════════════════════════════ */
export default function PPTViewer({
  slides, onSlidesChange, onDownload, isDownloading,
  onTemplateChange, defaultTemplate = 'template1',
}: PPTViewerProps) {
  const [current, setCurrent]       = useState(0);
  const [editMode, setEditMode]     = useState(false);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [template, setTemplate]     = useState<TemplateId>(defaultTemplate);

  const previewContainerRef = useRef<HTMLDivElement>(null);
  const [previewW, setPreviewW] = useState(0);
  const SLIDE_W = 960;
  const SLIDE_H = 540;
  const previewScale = previewW > 0 ? previewW / SLIDE_W : 0;

  const slide = slides[current];

  const goNext = useCallback(() => setCurrent(c => Math.min(slides.length - 1, c + 1)), [slides.length]);
  const goPrev = useCallback(() => setCurrent(c => Math.max(0, c - 1)), []);

  useEffect(() => {
    const el = previewContainerRef.current;
    if (!el) return;
    const obs = new ResizeObserver(([entry]) => setPreviewW(Math.round(entry.contentRect.width)));
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  function changeTemplate(t: TemplateId) {
    setTemplate(t);
    onTemplateChange?.(t);
  }

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!fullscreen) return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') goNext();
      if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   goPrev();
      if (e.key === 'Escape') setFullscreen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [fullscreen, goNext, goPrev]);

  function handleSaveEdit(updated: Slide) {
    if (editingIdx === null) return;
    onSlidesChange(slides.map((s, i) => i === editingIdx ? updated : s));
    setEditingIdx(null);
  }

  if (!slide) return null;

  const accentColor = template === 'template1' ? T1.navy : T2.purple;

  return (
    <>
      {/* 전체화면 모달 */}
      {fullscreen && (
        <div style={{ position: 'fixed', inset: 0, background: '#000', zIndex: 9999, display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            {template === 'template1' ? <SlideViewT1 slide={slide} isFullscreen={true} /> : <SlideViewT2 slide={slide} isFullscreen={true} />}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2rem', padding: '1rem', background: 'rgba(0,0,0,0.8)' }}>
            <button onClick={goPrev} disabled={current === 0} style={{ padding: '0.5rem 1.5rem', background: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '6px', cursor: current === 0 ? 'not-allowed' : 'pointer', opacity: current === 0 ? 0.4 : 1 }}>← 이전</button>
            <span style={{ color: 'rgba(255,255,255,0.7)' }}>{current + 1} / {slides.length}</span>
            <button onClick={goNext} disabled={current === slides.length - 1} style={{ padding: '0.5rem 1.5rem', background: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '6px', cursor: current === slides.length - 1 ? 'not-allowed' : 'pointer', opacity: current === slides.length - 1 ? 0.4 : 1 }}>다음 →</button>
            <button onClick={() => setFullscreen(false)} style={{ padding: '0.5rem 1rem', background: 'rgba(239,68,68,0.3)', color: 'white', border: '1px solid rgba(239,68,68,0.5)', borderRadius: '6px', cursor: 'pointer' }}>✕ 닫기</button>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* 상단 컨트롤 바 */}
        <div style={{ padding: '0.6rem 0.75rem', background: 'white', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0, flexWrap: 'nowrap' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
            {current + 1} / {slides.length}
          </span>

          {/* ── 템플릿 선택기 ── */}
          <div style={{ display: 'flex', gap: '2px', background: '#F3F4F6', borderRadius: '6px', padding: '2px', marginLeft: '4px' }}>
            {TEMPLATES.map(t => (
              <button
                key={t.id}
                onClick={() => changeTemplate(t.id)}
                title={t.desc}
                style={{
                  padding: '3px 8px', border: 'none', borderRadius: '4px', fontSize: '0.7rem',
                  fontWeight: template === t.id ? 700 : 400,
                  background: template === t.id ? (t.id === 'template1' ? T1.navy : T2.purple) : 'transparent',
                  color: template === t.id ? 'white' : '#6B7280',
                  cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.15s',
                }}
              >{t.label}</button>
            ))}
          </div>

          <button
            onClick={() => { setEditMode(m => !m); setEditingIdx(null); }}
            style={{ padding: '0.3rem 0.65rem', background: editMode ? accentColor : 'white', color: editMode ? 'white' : 'var(--text-secondary)', border: `1px solid ${editMode ? 'transparent' : 'var(--border-color)'}`, borderRadius: '4px', fontSize: '0.72rem', cursor: 'pointer', whiteSpace: 'nowrap' }}
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
              style={{ padding: '0.3rem 0.65rem', background: accentColor, color: 'white', border: 'none', borderRadius: '4px', fontSize: '0.72rem', cursor: 'pointer', whiteSpace: 'nowrap' }}
            >
              복사
            </button>
            {onDownload && (
              <button
                onClick={onDownload}
                disabled={isDownloading}
                style={{ padding: '0.3rem 0.65rem', background: isDownloading ? '#aaa' : T1.green, color: 'white', border: 'none', borderRadius: '4px', fontSize: '0.72rem', cursor: isDownloading ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap' }}
              >
                {isDownloading ? '생성 중...' : '⬇️ 다운로드'}
              </button>
            )}
          </div>
        </div>

        {/* 슬라이드 미리보기 */}
        <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', background: '#E5E7EB', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div
            ref={previewContainerRef}
            style={{ width: '100%', aspectRatio: '16/9', position: 'relative', overflow: 'hidden', borderRadius: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.15)', background: 'white', flexShrink: 0 }}
          >
            {previewScale > 0 && (
              <div style={{ width: SLIDE_W, height: SLIDE_H, transform: `scale(${previewScale})`, transformOrigin: 'top left', position: 'absolute', top: 0, left: 0 }}>
                {template === 'template1' ? <SlideViewT1 slide={slide} isFullscreen={true} /> : <SlideViewT2 slide={slide} isFullscreen={true} />}
              </div>
            )}
          </div>
          {editMode && (
            editingIdx === current
              ? <EditPanel slide={slides[current]} onSave={handleSaveEdit} onCancel={() => setEditingIdx(null)} />
              : <button onClick={() => setEditingIdx(current)} style={{ padding: '0.4rem', background: 'white', border: '1px dashed #D1D5DB', borderRadius: '6px', fontSize: '0.78rem', color: '#6B7280', cursor: 'pointer' }}>✏️ 이 슬라이드 편집</button>
          )}
          {slide.notes && (
            <div style={{ padding: '0.6rem 0.75rem', background: '#fdfaeeff', border: '1px solid #fd978aff', borderRadius: '6px', fontSize: '0.75rem', color: '#4d2c18ff' }}>
              <strong>발표자 노트:</strong> {slide.notes}
            </div>
          )}
        </div>

        {/* 썸네일 & 네비게이션 */}
        <div style={{ flexShrink: 0, background: 'white', borderTop: '1px solid #E5E7EB' }}>
          <div style={{ display: 'flex', gap: '0.3rem', padding: '0.5rem', overflowX: 'auto' }}>
            {slides.map((s, i) => (
              <button key={i} onClick={() => { setCurrent(i); setEditingIdx(null); }}
                style={{ flexShrink: 0, width: '100px', height: '40px', border: i === current ? `2px solid ${accentColor}` : '2px solid transparent', borderRadius: '4px', overflow: 'hidden', cursor: 'pointer', padding: 0, background: s.type === 'title' || s.type === 'index' ? accentColor : 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1px' }}
              >
                <span style={{ fontSize: '0.8rem', color: s.type === 'title' || s.type === 'index' ? 'white' : accentColor, fontWeight: '700', textAlign: 'center', padding: '0 2px', lineHeight: 1.2, overflow: 'hidden', maxHeight: '20px', display: 'block', width: '100%', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.title}</span>
                <span style={{ fontSize: '0.7rem', color: s.type === 'title' || s.type === 'index' ? 'rgba(255,255,255,0.7)' : '#9CA3AF' }}>{i + 1}</span>
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem', borderTop: '1px solid #F3F4F6' }}>
            <button onClick={goPrev} disabled={current === 0} style={{ padding: '0.3rem 0.75rem', background: current === 0 ? '#F3F4F6' : accentColor, color: current === 0 ? '#9CA3AF' : 'white', border: 'none', borderRadius: '5px', fontSize: '0.78rem', cursor: current === 0 ? 'not-allowed' : 'pointer' }}>← 이전</button>
            <span style={{ flex: 1, textAlign: 'center', fontSize: '0.75rem', color: '#6B7280' }}>{current + 1} / {slides.length}</span>
            <button onClick={goNext} disabled={current === slides.length - 1} style={{ padding: '0.3rem 0.75rem', background: current === slides.length - 1 ? '#F3F4F6' : accentColor, color: current === slides.length - 1 ? '#9CA3AF' : 'white', border: 'none', borderRadius: '5px', fontSize: '0.78rem', cursor: current === slides.length - 1 ? 'not-allowed' : 'pointer' }}>다음 →</button>
          </div>
        </div>
      </div>
    </>
  );
}
