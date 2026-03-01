'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';

interface Post { id: number; user_id: number; title: string; content: string; nickname: string; views: number; created_at: string; }
interface Me { id: number; nickname: string; role: string; }
interface Comment { id: number; author: string; content: string; is_ai: number; created_at: string; }

export default function BoardDetailPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [me, setMe] = useState<Me | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const fetchedId = useRef<string | null>(null);

  const fetchComments = useCallback(() => {
    fetch(`/api/board/posts/${id}/comments`)
      .then(r => r.ok ? r.json() : [])
      .then(d => setComments(Array.isArray(d) ? d : []));
  }, [id]);

  useEffect(() => {
    if (fetchedId.current === id) return;
    fetchedId.current = id;
    fetch('/api/auth/me').then(r => r.json()).then(d => setMe(d.user));
    fetch(`/api/board/posts/${id}`)
      .then(r => { if (r.status === 404) { setNotFound(true); return null; } return r.json(); })
      .then(d => { if (d) { setPost(d); document.title = `${d.title} | 자유게시판`; } });
    fetchComments();
  }, [id, fetchComments]);

  // AI 댓글이 생성되는 동안 폴링 (최대 15초, 3초 간격)
  useEffect(() => {
    if (!post) return;
    const hasAi = comments.some(c => c.is_ai === 1);
    if (hasAi) return;

    let tries = 0;
    const iv = setInterval(() => {
      tries++;
      fetchComments();
      if (tries >= 5) clearInterval(iv);
    }, 3000);
    return () => clearInterval(iv);
  }, [post, comments, fetchComments]);

  async function handleDelete() {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    const res = await fetch(`/api/board/posts/${id}`, { method: 'DELETE' });
    if (res.ok) router.push('/board');
  }

  async function submitComment() {
    if (!commentText.trim() || submitting) return;
    setSubmitting(true);
    const res = await fetch(`/api/board/posts/${id}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: commentText.trim() }),
    });
    if (res.ok) {
      setCommentText('');
      fetchComments();
    }
    setSubmitting(false);
  }

  function handleCommentSubmit(e: React.FormEvent) {
    e.preventDefault();
    void submitComment();
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
        {/* 게시글 */}
        <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e9e9e7', overflow: 'hidden' }}>
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
          <div style={{ padding: '1.5rem', fontSize: '0.95rem', color: '#37352f', lineHeight: 1.8, whiteSpace: 'pre-wrap', minHeight: '200px' }}>
            {post.content}
          </div>
        </div>

        {/* 댓글 섹션 */}
        <div style={{ marginTop: '1.25rem', background: 'white', borderRadius: '12px', border: '1px solid #e9e9e7', overflow: 'hidden' }}>
          <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #f0f0ee', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#37352f' }}>댓글</span>
            <span style={{ fontSize: '0.82rem', color: '#9b9a97', background: '#f0f0ee', borderRadius: '10px', padding: '0.1rem 0.5rem' }}>{comments.length}</span>
          </div>

          {/* 댓글 목록 */}
          <div>
            {comments.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#b0aeab', fontSize: '0.85rem' }}>
                첫 번째 댓글을 남겨보세요
              </div>
            ) : (
              comments.map((c, i) => (
                <div key={c.id} style={{
                  padding: '1rem 1.5rem',
                  borderBottom: i < comments.length - 1 ? '1px solid #f5f5f3' : 'none',
                  background: c.is_ai === 1 ? 'linear-gradient(135deg, #f0f7ff, #f8faff)' : 'white',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                    {c.is_ai === 1 ? (
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0078D4', background: '#e8f3ff', border: '1px solid #bfdbfe', borderRadius: '4px', padding: '0.1rem 0.4rem' }}>
                        🤖 AI 어시스턴트
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#37352f' }}>{c.author}</span>
                    )}
                    <span style={{ fontSize: '0.75rem', color: '#b0aeab' }}>{formatDate(c.created_at)}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.88rem', color: '#37352f', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{c.content}</p>
                </div>
              ))
            )}
          </div>

          {/* 댓글 입력 */}
          {me ? (
            <form onSubmit={handleCommentSubmit} style={{ padding: '1rem 1.5rem', borderTop: '1px solid #f0f0ee', display: 'flex', gap: '0.75rem' }}>
              <textarea
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void submitComment(); } }}
                placeholder="댓글을 입력하세요 (Enter로 등록, Shift+Enter 줄바꿈)"
                rows={2}
                style={{
                  flex: 1, resize: 'none', border: '1px solid #e9e9e7', borderRadius: '8px',
                  padding: '0.6rem 0.9rem', fontSize: '0.88rem', color: '#37352f',
                  outline: 'none', fontFamily: 'inherit', lineHeight: 1.6,
                }}
                onFocus={e => e.currentTarget.style.borderColor = '#37352f'}
                onBlur={e => e.currentTarget.style.borderColor = '#e9e9e7'}
              />
              <button type="submit" disabled={submitting || !commentText.trim()}
                style={{
                  alignSelf: 'flex-end', padding: '0.55rem 1.1rem',
                  background: commentText.trim() ? '#37352f' : '#e9e9e7',
                  color: commentText.trim() ? 'white' : '#b0aeab',
                  border: 'none', borderRadius: '8px', fontSize: '0.85rem',
                  fontWeight: 600, cursor: commentText.trim() ? 'pointer' : 'default',
                  transition: 'all 0.15s', whiteSpace: 'nowrap',
                }}>
                {submitting ? '등록 중' : '등록'}
              </button>
            </form>
          ) : (
            <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #f0f0ee', textAlign: 'center', fontSize: '0.85rem', color: '#9b9a97' }}>
              댓글을 작성하려면{' '}
              <button onClick={() => router.push('/login')} style={{ color: '#37352f', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>로그인</button>
              이 필요합니다
            </div>
          )}
        </div>

        <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={() => router.push('/board')} style={{ fontSize: '0.85rem', color: '#9b9a97', background: 'none', border: '1px solid #e9e9e7', borderRadius: '6px', padding: '0.35rem 0.9rem', cursor: 'pointer' }}>← 목록</button>
        </div>
      </div>
    </div>
  );
}
