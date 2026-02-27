'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

interface Post { id: number; user_id: number; title: string; content: string; nickname: string; views: number; created_at: string; }
interface Me { id: number; nickname: string; role: string; }

export default function BoardDetailPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [me, setMe] = useState<Me | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => setMe(d.user));
    fetch(`/api/board/posts/${id}`)
      .then(r => { if (r.status === 404) { setNotFound(true); return null; } return r.json(); })
      .then(d => { if (d) { setPost(d); document.title = `${d.title} | 자유게시판`; } });
  }, [id]);

  async function handleDelete() {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    const res = await fetch(`/api/board/posts/${id}`, { method: 'DELETE' });
    if (res.ok) router.push('/board');
  }

  function formatDate(s: string) {
    return new Date(s).toLocaleString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
  }

  if (notFound) return (
    <div style={{ minHeight: '100vh', background: '#faf9f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>😢</div>
        <p style={{ color: '#9b9a97' }}>존재하지 않는 게시글입니다</p>
        <button onClick={() => router.push('/board')} style={{ marginTop: '1rem', padding: '0.5rem 1.25rem', background: '#37352f', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>목록으로</button>
      </div>
    </div>
  );

  if (!post) return (
    <div style={{ minHeight: '100vh', background: '#faf9f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#9b9a97' }}>불러오는 중...</div>
    </div>
  );

  const canDelete = me && (me.id === post.user_id || me.role === 'admin');

  return (
    <div style={{ minHeight: '100vh', background: '#faf9f5' }}>
      <div style={{ background: 'white', borderBottom: '1px solid #e9e9e7', padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button onClick={() => router.push('/board')} style={{ fontSize: '0.85rem', color: '#9b9a97', background: 'none', border: 'none', cursor: 'pointer' }}>← 목록</button>
        <span style={{ fontSize: '1rem', fontWeight: 700, color: '#37352f' }}>📋 자유게시판</span>
      </div>

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '1.5rem 1rem' }}>
        <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e9e9e7', overflow: 'hidden' }}>
          {/* 글 헤더 */}
          <div style={{ padding: '1.5rem', borderBottom: '1px solid #f0f0ee' }}>
            <h1 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#37352f', margin: '0 0 0.75rem 0', lineHeight: 1.4 }}>{post.title}</h1>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: '#9b9a97' }}>
                <span>{post.nickname}</span>
                <span>{formatDate(post.created_at)}</span>
                <span>조회 {post.views}</span>
              </div>
              {canDelete && (
                <button onClick={handleDelete}
                  style={{ fontSize: '0.78rem', color: '#ef4444', background: 'none', border: '1px solid #fecaca', borderRadius: '6px', padding: '0.25rem 0.75rem', cursor: 'pointer' }}>
                  삭제
                </button>
              )}
            </div>
          </div>

          {/* 글 본문 */}
          <div style={{ padding: '1.5rem', fontSize: '0.95rem', color: '#37352f', lineHeight: 1.8, whiteSpace: 'pre-wrap', minHeight: '200px' }}>
            {post.content}
          </div>
        </div>
      </div>
    </div>
  );
}
