'use client';

import { useState } from 'react';
import { TemplateConfig } from './types';
import { TEMPLATES, TEMPLATE_CATEGORIES } from './registry';

interface TemplateGalleryProps {
  onSelect: (template: TemplateConfig) => void;
}

export default function TemplateGallery({ onSelect }: TemplateGalleryProps) {
  const [selectedCategory, setSelectedCategory] = useState('전체');

  const filtered = selectedCategory === '전체'
    ? TEMPLATES
    : TEMPLATES.filter(t => t.category === selectedCategory);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#f9f9f7' }}>
      {/* 헤더 */}
      <div style={{ padding: '1.25rem 2rem 1rem', borderBottom: '1px solid #e9e9e7', background: 'white', flexShrink: 0 }}>
        <h2 style={{ margin: '0 0 0.2rem', fontSize: '1.1rem', fontWeight: '700', color: '#1a1a1a' }}>📁 템플릿</h2>
        <p style={{ margin: 0, fontSize: '0.82rem', color: '#6b6b6b' }}>업무에 맞는 템플릿을 선택하여 AI 답변을 자동 생성하세요</p>
      </div>

      {/* 카테고리 필터 */}
      <div style={{ padding: '0.75rem 2rem', background: 'white', borderBottom: '1px solid #e9e9e7', display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
        {TEMPLATE_CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            style={{
              padding: '0.25rem 0.75rem',
              borderRadius: '20px',
              border: `1px solid ${selectedCategory === cat ? '#0066cc' : '#e0e0e0'}`,
              background: selectedCategory === cat ? '#0066cc' : 'white',
              color: selectedCategory === cat ? 'white' : '#555',
              fontSize: '0.78rem',
              cursor: 'pointer',
              fontWeight: selectedCategory === cat ? 600 : 400,
              transition: 'all 0.15s',
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 카드 그리드 */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem 2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
          {filtered.map(template => (
            <button
              key={template.id}
              onClick={() => onSelect(template)}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                padding: '1.25rem', background: 'white', border: '1px solid #e9e9e7',
                borderRadius: '10px', cursor: 'pointer', textAlign: 'left',
                transition: 'all 0.15s', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = '#0066cc';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,102,204,0.12)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = '#e9e9e7';
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <span style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{template.icon}</span>
              <span style={{ fontSize: '0.9rem', fontWeight: '700', color: '#1a1a1a', marginBottom: '0.3rem' }}>
                {template.name}
              </span>
              <span style={{ fontSize: '0.72rem', color: '#6b6b6b', lineHeight: 1.5, flex: 1 }}>
                {template.description}
              </span>
              <span style={{ marginTop: '0.75rem', padding: '0.15rem 0.5rem', background: '#f0f4ff', color: '#0066cc', borderRadius: '4px', fontSize: '0.65rem', fontWeight: '600' }}>
                {template.category}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
