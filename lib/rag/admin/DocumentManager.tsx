'use client';

import { useEffect, useState, useCallback } from 'react';
import FileUploader from './FileUploader';

interface Document {
  id: string;
  original_name: string;
  file_size: number;
  status: 'pending' | 'processing' | 'done' | 'error';
  error_message: string | null;
  chunk_count: number;
  created_at: string;
}

interface Props {
  categoryId: string;
  categoryName: string;
  categoryColor: string;
}

const STATUS_LABEL: Record<string, { icon: string; text: string; color: string }> = {
  pending:    { icon: '⏳', text: '대기중',    color: '#9ca3af' },
  processing: { icon: '⚙️', text: '임베딩중', color: '#3b82f6' },
  done:       { icon: '✅', text: '완료',       color: '#10b981' },
  error:      { icon: '❌', text: '오류',       color: '#ef4444' },
};

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
}

export default function DocumentManager({ categoryId, categoryName, categoryColor }: Props) {
  const [docs, setDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchDocs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/rag/admin/documents?categoryId=${categoryId}`);
      const data = await res.json();
      setDocs(data.documents ?? []);
    } finally {
      setLoading(false);
    }
  }, [categoryId]);

  useEffect(() => { fetchDocs(); }, [fetchDocs]);

  // processing 상태 문서가 있으면 3초마다 폴링
  useEffect(() => {
    const hasProcessing = docs.some(d => d.status === 'pending' || d.status === 'processing');
    if (!hasProcessing) return;
    const timer = setInterval(fetchDocs, 3000);
    return () => clearInterval(timer);
  }, [docs, fetchDocs]);

  async function handleDelete(id: string, name: string) {
    if (!confirm(`"${name}"을(를) 삭제하시겠습니까?`)) return;
    const res = await fetch(`/api/rag/admin/documents?id=${id}`, { method: 'DELETE' });
    if (res.ok) fetchDocs();
    else alert('삭제 실패');
  }

  const totalChunks = docs.filter(d => d.status === 'done').reduce((s, d) => s + d.chunk_count, 0);

  return (
    <div style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
      {/* 헤더 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <span style={{ fontSize: '20px' }}>📂</span>
        <div>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#111827' }}>{categoryName}</h3>
          <span style={{ fontSize: '12px', color: '#6b7280' }}>문서 {docs.length}개 · 총 {totalChunks.toLocaleString()}청크</span>
        </div>
        <button
          onClick={fetchDocs}
          style={{ marginLeft: 'auto', padding: '4px 10px', border: '1px solid #e5e7eb', borderRadius: '6px', background: 'white', cursor: 'pointer', fontSize: '12px', color: '#6b7280' }}
        >새로고침</button>
      </div>

      {/* 파일 업로더 */}
      <FileUploader categoryId={categoryId} onUploaded={fetchDocs} />

      {/* 문서 목록 */}
      {loading && docs.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#9ca3af', padding: '30px', fontSize: '13px' }}>로딩 중...</div>
      ) : docs.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#9ca3af', padding: '30px', fontSize: '13px' }}>
          등록된 문서가 없습니다.<br />위에서 파일을 업로드해주세요.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {docs.map(doc => {
            const s = STATUS_LABEL[doc.status] ?? STATUS_LABEL.error;
            return (
              <div key={doc.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
                <span style={{ fontSize: '18px', flexShrink: 0 }}>
                  {doc.original_name.endsWith('.pdf') ? '📄' : doc.original_name.endsWith('.docx') ? '📝' : '📃'}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {doc.original_name}
                  </div>
                  <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>
                    {formatBytes(doc.file_size)}
                    {doc.status === 'done' && ` · ${doc.chunk_count}청크`}
                    {doc.error_message && ` · ${doc.error_message}`}
                  </div>
                </div>
                <span style={{ fontSize: '11px', color: s.color, fontWeight: 600, flexShrink: 0 }}>
                  {s.icon} {s.text}
                </span>
                <button
                  onClick={() => handleDelete(doc.id, doc.original_name)}
                  style={{ padding: '4px 8px', border: '1px solid #fca5a5', borderRadius: '5px', background: 'white', color: '#ef4444', cursor: 'pointer', fontSize: '11px', flexShrink: 0 }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#fef2f2'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'white'; }}
                >삭제</button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
