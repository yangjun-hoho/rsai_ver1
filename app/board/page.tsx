'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Post { id: number; title: string; nickname: string; views: number; created_at: string; }
interface Me { id: number; nickname: string; role: string; }

export default function BoardPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [me, setMe] = useState<Me | null>(null);

  useEffect(() => { document.title = '자유게시판 | 아레스 AI'; }, []);

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => setMe(d.user));
  }, []);

  const loadPosts = useCallback(() => {
    fetch(`/api/board/posts?page=${page}`)
      .then(r => r.json())
      .then(d => { setPosts(d.posts); setTotal(d.total); setTotalPages(d.totalPages); });
  }, [page]);

  useEffect(() => { loadPosts(); }, [loadPosts]);

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    setMe(null);
    router.refresh();
  }

  function formatDate(s: string) {
    return new Date(s).toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' });
  }

  return (
    <div style={{ minHeight: '100vh', background: '#faf9f5' }}>
      {/* 헤더 */}
      <div style={{ background: 'white', borderBottom: '1px solid #e9e9e7', padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link href="/" style={{ fontSize: '0.85rem', color: '#9b9a97', textDecoration: 'none' }}>← 메인</Link>
          <span style={{ fontSize: '1rem', fontWeight: 700, color: '#37352f' }}>📋 자유게시판</span>
          <span style={{ fontSize: '0.78rem', color: '#9b9a97' }}>총 {total}개</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {me ? (
            <>
              <span style={{ fontSize: '0.85rem', color: '#37352f' }}>{me.nickname}</span>
              <Link href="/my" style={{ fontSize: '0.82rem', color: '#2383e2', textDecoration: 'none' }}>나의 메뉴</Link>
              <button onClick={handleLogout} style={{ fontSize: '0.82rem', color: '#9b9a97', background: 'none', border: 'none', cursor: 'pointer' }}>로그아웃</button>
            </>
          ) : (
            <>
              <Link href="/login" style={{ fontSize: '0.82rem', color: '#2383e2', textDecoration: 'none' }}>로그인</Link>
              <Link href="/register" style={{ fontSize: '0.82rem', color: '#9b9a97', textDecoration: 'none' }}>회원가입</Link>
            </>
          )}
        </div>
      </div>

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '1.5rem 1rem' }}>
        {/* 글쓰기 버튼 */}
        {me && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
            <button onClick={() => router.push('/board/write')}
              style={{ padding: '0.55rem 1.25rem', background: '#37352f', color: 'white', border: 'none', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>
              + 글쓰기
            </button>
          </div>
        )}

        {/* 게시글 목록 */}
        <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e9e9e7' }}>
          {posts.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#9b9a97', fontSize: '0.9rem' }}>
              아직 게시글이 없습니다. 첫 글을 작성해보세요!
            </div>
          ) : posts.map((post, i) => (
            <div key={post.id}
              onClick={() => router.push(`/board/${post.id}`)}
              style={{ padding: '0.9rem 1.25rem', borderBottom: i < posts.length - 1 ? '1px solid #f0f0ee' : 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem', transition: 'background 0.1s' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#f9f9f7')}
              onMouseLeave={e => (e.currentTarget.style.background = 'white')}
            >
              <span style={{ fontSize: '0.75rem', color: '#c0c0bd', minWidth: '30px', textAlign: 'right' }}>{total - (page - 1) * 15 - i}</span>
              <span style={{ flex: 1, fontSize: '0.9rem', color: '#37352f', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{post.title}</span>
              <span style={{ fontSize: '0.78rem', color: '#9b9a97', flexShrink: 0 }}>{post.nickname}</span>
              <span style={{ fontSize: '0.75rem', color: '#c0c0bd', flexShrink: 0 }}>조회 {post.views}</span>
              <span style={{ fontSize: '0.75rem', color: '#c0c0bd', flexShrink: 0 }}>{formatDate(post.created_at)}</span>
            </div>
          ))}
        </div>

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.35rem', marginTop: '1.25rem' }}>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)}
                style={{ width: '32px', height: '32px', borderRadius: '6px', border: '1px solid', fontSize: '0.82rem', cursor: 'pointer',
                  borderColor: p === page ? '#37352f' : '#e0e0e0',
                  background: p === page ? '#37352f' : 'white',
                  color: p === page ? 'white' : '#37352f' }}>
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
