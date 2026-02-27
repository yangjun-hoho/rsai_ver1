'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function BoardWritePage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { document.title = '글쓰기 | 자유게시판'; }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/board/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      router.push(`/board/${data.id}`);
    } catch {
      setError('서버 오류가 발생했습니다');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#faf9f5' }}>
      <div style={{ background: 'white', borderBottom: '1px solid #e9e9e7', padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button onClick={() => router.back()} style={{ fontSize: '0.85rem', color: '#9b9a97', background: 'none', border: 'none', cursor: 'pointer' }}>← 목록</button>
        <span style={{ fontSize: '1rem', fontWeight: 700, color: '#37352f' }}>글쓰기</span>
      </div>

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '1.5rem 1rem' }}>
        <form onSubmit={handleSubmit} style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', border: '1px solid #e9e9e7' }}>
          <input
            type="text" value={title} onChange={e => setTitle(e.target.value)}
            placeholder="제목을 입력하세요" required maxLength={100}
            style={{ width: '100%', padding: '0.7rem 0', border: 'none', borderBottom: '1px solid #e9e9e7', fontSize: '1.1rem', fontWeight: 600, outline: 'none', marginBottom: '1rem', boxSizing: 'border-box' }}
          />
          <textarea
            value={content} onChange={e => setContent(e.target.value)}
            placeholder="내용을 입력하세요..." required
            style={{ width: '100%', minHeight: '300px', padding: '0.5rem 0', border: 'none', fontSize: '0.95rem', outline: 'none', resize: 'vertical', lineHeight: 1.7, boxSizing: 'border-box' }}
          />

          {error && (
            <div style={{ padding: '0.6rem 0.75rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#dc2626', fontSize: '0.83rem', marginTop: '1rem' }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem', borderTop: '1px solid #f0f0ee', paddingTop: '1rem' }}>
            <button type="button" onClick={() => router.back()}
              style={{ padding: '0.6rem 1.25rem', background: 'none', border: '1px solid #e0e0e0', borderRadius: '8px', fontSize: '0.875rem', cursor: 'pointer', color: '#6b7280' }}>
              취소
            </button>
            <button type="submit" disabled={loading}
              style={{ padding: '0.6rem 1.5rem', background: '#37352f', color: 'white', border: 'none', borderRadius: '8px', fontSize: '0.875rem', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
              {loading ? '등록 중...' : '등록'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
