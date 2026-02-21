'use client';

import { useState } from 'react';

interface Slide {
  slideNumber: number;
  title: string;
  content: string;
  bulletPoints: string[];
  type: string;
  subtitle?: string;
}

interface PPTViewerProps {
  slides: Slide[];
}

const typeColors: Record<string, string> = {
  title: '#1a1a2e',
  index: '#16213e',
  content: '#2563eb',
  conclusion: '#7c3aed',
};

const typeBg: Record<string, string> = {
  title: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
  index: 'linear-gradient(135deg, #16213e 0%, #0f3460 100%)',
  content: 'linear-gradient(135deg, #f8faff 0%, #eef2ff 100%)',
  conclusion: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)',
};

export default function PPTViewer({ slides }: PPTViewerProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slide = slides[currentSlide];
  const isDark = slide.type === 'title' || slide.type === 'index';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* 헤더 */}
      <div style={{ padding: '0.75rem 1rem', background: 'white', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
        <span style={{ fontSize: '0.78rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
          슬라이드 {currentSlide + 1} / {slides.length}
        </span>
        <button onClick={() => navigator.clipboard.writeText(slides.map(s => `[${s.slideNumber}] ${s.title}\n${s.content}\n${s.bulletPoints.join('\n')}`).join('\n\n')).then(() => alert('복사 완료'))} style={{ marginLeft: 'auto', padding: '0.3rem 0.6rem', background: 'var(--focus-color)', color: 'white', border: 'none', borderRadius: '4px', fontSize: '0.72rem', cursor: 'pointer' }}>
          전체 복사
        </button>
      </div>

      {/* 슬라이드 뷰 */}
      <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', background: '#f0f4f8' }}>
        <div style={{ background: typeBg[slide.type] || typeBg.content, borderRadius: '12px', padding: '2.5rem', minHeight: '320px', boxShadow: '0 8px 32px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ fontSize: '0.7rem', color: isDark ? 'rgba(255,255,255,0.5)' : 'var(--text-muted)', marginBottom: '0.5rem' }}>
            {slide.type === 'title' ? '제목' : slide.type === 'index' ? '목차' : slide.type === 'conclusion' ? '결론' : `슬라이드 ${slide.slideNumber}`}
          </div>
          <h2 style={{ margin: '0 0 0.75rem 0', fontSize: '1.4rem', fontWeight: '700', color: isDark ? 'white' : typeColors[slide.type] || '#1a1a2e', lineHeight: 1.3 }}>
            {slide.title}
          </h2>
          {slide.subtitle && <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.9rem', color: isDark ? 'rgba(255,255,255,0.7)' : 'var(--text-secondary)' }}>{slide.subtitle}</p>}
          {slide.content && <p style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', lineHeight: 1.6, color: isDark ? 'rgba(255,255,255,0.85)' : 'var(--text-secondary)' }}>{slide.content}</p>}
          {slide.bulletPoints.length > 0 && (
            <ul style={{ margin: 0, paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              {slide.bulletPoints.map((point, i) => (
                <li key={i} style={{ fontSize: '0.82rem', color: isDark ? 'rgba(255,255,255,0.8)' : 'var(--text-secondary)', lineHeight: 1.5 }}>{point}</li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* 네비게이션 */}
      <div style={{ padding: '0.75rem 1rem', background: 'white', borderTop: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
        <button onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))} disabled={currentSlide === 0} style={{ padding: '0.35rem 0.75rem', background: currentSlide === 0 ? '#f3f4f6' : 'var(--focus-color)', color: currentSlide === 0 ? 'var(--text-muted)' : 'white', border: 'none', borderRadius: '5px', fontSize: '0.78rem', cursor: currentSlide === 0 ? 'not-allowed' : 'pointer' }}>
          ← 이전
        </button>
        <div style={{ flex: 1, display: 'flex', gap: '0.3rem', justifyContent: 'center', overflowX: 'auto' }}>
          {slides.map((_, i) => (
            <button key={i} onClick={() => setCurrentSlide(i)} style={{ width: '24px', height: '24px', borderRadius: '4px', border: 'none', background: i === currentSlide ? 'var(--focus-color)' : '#e5e7eb', color: i === currentSlide ? 'white' : 'var(--text-muted)', fontSize: '0.65rem', cursor: 'pointer', flexShrink: 0 }}>
              {i + 1}
            </button>
          ))}
        </div>
        <button onClick={() => setCurrentSlide(Math.min(slides.length - 1, currentSlide + 1))} disabled={currentSlide === slides.length - 1} style={{ padding: '0.35rem 0.75rem', background: currentSlide === slides.length - 1 ? '#f3f4f6' : 'var(--focus-color)', color: currentSlide === slides.length - 1 ? 'var(--text-muted)' : 'white', border: 'none', borderRadius: '5px', fontSize: '0.78rem', cursor: currentSlide === slides.length - 1 ? 'not-allowed' : 'pointer' }}>
          다음 →
        </button>
      </div>
    </div>
  );
}
