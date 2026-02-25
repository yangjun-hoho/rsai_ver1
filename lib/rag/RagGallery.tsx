'use client';

import { useEffect, useState } from 'react';

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  document_count: number;
  chunk_count: number;
}

interface Props {
  onSelectCategory: (categoryId: string) => void;
  onAdmin: () => void;
  onClose?: () => void;
}

export default function RagGallery({ onSelectCategory, onAdmin, onClose }: Props) {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetch('/api/rag/admin/categories')
      .then(r => r.json())
      .then(data => { setCategories(data.categories ?? []); })
      .catch(() => {});
  }, []);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#f9f9f7' }}>
      {/* 헤더 */}
      <div style={{ padding: '1.25rem 2rem 1rem', borderBottom: '1px solid #e9e9e7', background: 'white', flexShrink: 0, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ margin: '0 0 0.2rem', fontSize: '1.1rem', fontWeight: 700, color: '#1a1a1a' }}>🧠 RAG 지식 검색</h2>
          <p style={{ margin: 0, fontSize: '0.82rem', color: '#6b6b6b' }}>카테고리를 선택하면 등록된 문서를 기반으로 AI가 답변합니다</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={onAdmin}
            style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '0.35rem 0.85rem', background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '7px', cursor: 'pointer', color: '#0369a1', fontSize: '0.78rem', fontWeight: 600 }}
            onMouseEnter={e => { e.currentTarget.style.background = '#e0f2fe'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#f0f9ff'; }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
            관리자
          </button>
          <button
            onClick={onClose}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.35rem 0.75rem', background: 'transparent', border: '1px solid #e0e0e0', borderRadius: '7px', cursor: 'pointer', color: '#6b6b6b', fontSize: '0.78rem', fontWeight: 500 }}
            onMouseEnter={e => { e.currentTarget.style.background = '#f9f9f7'; e.currentTarget.style.color = '#1a1a1a'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#6b6b6b'; }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            홈
          </button>
        </div>
      </div>

      {/* 카드 그리드 */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '2rem' }}>
        {categories.length === 0 ? (
          <div style={{ textAlign: 'center', paddingTop: '60px', color: '#9ca3af' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>📂</div>
            <div style={{ fontSize: '15px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>등록된 카테고리가 없습니다</div>
            <div style={{ fontSize: '13px', marginBottom: '16px' }}>관리자 페이지에서 카테고리를 추가해주세요.</div>
            <button
              onClick={onAdmin}
              style={{ padding: '8px 18px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
            >
              관리자 페이지로 이동
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem' }}>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                  padding: '1.1rem', background: 'white', border: '1.5px solid #e9e9e7',
                  borderRadius: '12px', cursor: 'pointer', textAlign: 'left',
                  transition: 'all 0.15s', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = cat.color;
                  e.currentTarget.style.boxShadow = `0 4px 16px ${cat.color}22`;
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = '#e9e9e7';
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: cat.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', marginBottom: '12px' }}>
                  {cat.icon}
                </div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: '#1a1a1a', marginBottom: '6px' }}>{cat.name}</div>
                <div style={{ fontSize: '12px', color: '#6b6b6b', lineHeight: 1.5, marginBottom: '16px' }}>{cat.description || '등록된 문서를 기반으로 AI가 답변합니다.'}</div>
                <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                  <span style={{ fontSize: '11px', padding: '3px 8px', background: cat.color + '14', color: cat.color, borderRadius: '20px', fontWeight: 600 }}>
                    문서 {cat.document_count}개
                  </span>
                  {cat.chunk_count > 0 && (
                    <span style={{ fontSize: '11px', padding: '3px 8px', background: '#f3f4f6', color: '#6b7280', borderRadius: '20px' }}>
                      {cat.chunk_count.toLocaleString()}청크
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
