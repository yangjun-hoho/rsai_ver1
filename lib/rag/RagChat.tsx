'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
}

interface Source {
  index: number;
  docName: string;
  chunk: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: Source[];
}

interface Props {
  categoryId: string;
  onBack: () => void;
}

export default function RagChat({ categoryId, onBack }: Props) {
  const [category, setCategory] = useState<Category | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [docNames, setDocNames] = useState<string[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 카테고리 정보 조회
  useEffect(() => {
    fetch('/api/rag/admin/categories')
      .then(r => r.json())
      .then(data => {
        const found = (data.categories ?? []).find((c: Category) => c.id === categoryId);
        setCategory(found ?? null);
      })
      .catch(() => {});
  }, [categoryId]);

  // 문서 목록 조회
  useEffect(() => {
    fetch(`/api/rag/admin/documents?categoryId=${categoryId}`)
      .then(r => r.json())
      .then(data => {
        const names = (data.documents ?? [])
          .filter((d: { status: string }) => d.status === 'done')
          .map((d: { original_name: string }) => d.original_name);
        setDocNames(names);
      })
      .catch(() => {});
  }, [categoryId]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const sendMessage = useCallback(async () => {
    const question = input.trim();
    if (!question || isLoading) return;

    const userMsg: Message = { role: 'user', content: question };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const history = messages.slice(-6).map(m => ({ role: m.role, content: m.content }));

    try {
      const res = await fetch('/api/rag/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoryId, question, history }),
      });

      if (!res.body) throw new Error('스트림 없음');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let assistantContent = '';
      let sources: Message['sources'] = [];

      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value);
        const lines = text.split('\n').filter(l => l.startsWith('data: '));

        for (const line of lines) {
          try {
            const json = JSON.parse(line.slice(6));
            if (json.type === 'chunk') {
              assistantContent += json.content;
              setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = { role: 'assistant', content: assistantContent };
                return updated;
              });
            } else if (json.type === 'sources') {
              sources = json.sources;
            } else if (json.type === 'done') {
              setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = { role: 'assistant', content: assistantContent, sources };
                return updated;
              });
            }
          } catch { /* ignore parse errors */ }
        }
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'assistant', content: '오류가 발생했습니다. 다시 시도해주세요.' }]);
    } finally {
      setIsLoading(false);
      textareaRef.current?.focus();
    }
  }, [input, isLoading, messages, categoryId]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  }

  if (!category) return null;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#f9f9f7' }}>
      {/* 헤더 */}
      <div style={{ padding: '12px 20px', borderBottom: '1px solid #e9e9e7', background: 'white', flexShrink: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          onClick={onBack}
          style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 10px', border: '1px solid #e5e7eb', borderRadius: '7px', background: 'white', cursor: 'pointer', color: '#6b7280', fontSize: '13px' }}
          onMouseEnter={e => { e.currentTarget.style.background = '#f9fafb'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'white'; }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          뒤로
        </button>
        <span style={{ fontSize: '20px' }}>{category.icon}</span>
        <div>
          <span style={{ fontSize: '15px', fontWeight: 700, color: '#111827' }}>{category.name} RAG</span>
          <span style={{ fontSize: '11px', color: '#9ca3af', marginLeft: '8px' }}>문서 기반 AI 답변</span>
        </div>
        <div style={{ marginLeft: 'auto', padding: '3px 10px', borderRadius: '20px', background: category.color + '18', color: category.color, fontSize: '11px', fontWeight: 600 }}>
          {docNames.length}개 문서 등록됨
        </div>
      </div>

      {/* 본문: 좌우 분할 */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* 좌측: 소개 + 문서 목록 */}
        <div style={{ width: '400px', flexShrink: 0, borderRight: '1px solid #e9e9e7', background: 'white', overflowY: 'auto', padding: '16px' }}>
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>시스템 소개</div>
            <p style={{ fontSize: '13px', color: '#374151', lineHeight: 1.6, margin: 0 }}>{category.description || '등록된 문서를 기반으로 AI가 답변합니다.'}</p>
          </div>
          <div style={{ height: '1px', background: '#f3f4f6', margin: '12px 0' }} />
          <div style={{ fontSize: '14px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>등록 문서</div>
          {docNames.length === 0 ? (
            <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>등록된 문서가 없습니다.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {docNames.map((name, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#374151', padding: '4px 0' }}>
                  <span style={{ color: category.color }}>•</span>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 우측: 채팅 */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* 메시지 영역 */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
            {messages.length === 0 && (
              <div style={{ textAlign: 'center', color: '#9ca3af', paddingTop: '60px' }}>
                <div style={{ fontSize: '40px', marginBottom: '12px' }}>{category.icon}</div>
                <div style={{ fontSize: '15px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>{category.name} 문서에 대해 질문해보세요</div>
                <div style={{ fontSize: '13px' }}>등록된 문서를 기반으로 정확한 답변을 제공합니다.</div>
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} style={{ marginBottom: '16px', display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '80%', padding: '10px 14px', borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  background: msg.role === 'user' ? category.color : 'white',
                  color: msg.role === 'user' ? 'white' : '#111827',
                  fontSize: '13px', lineHeight: 1.6, border: msg.role === 'assistant' ? '1px solid #e9e9e7' : 'none',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                }}>
                  {msg.content || (isLoading && i === messages.length - 1 ? '▍' : '')}
                </div>
                {msg.sources && msg.sources.length > 0 && (
                  <div style={{ marginTop: '8px', width: '100%', maxWidth: '80%' }}>
                    <details>
                      <summary style={{
                        cursor: 'pointer', userSelect: 'none', fontSize: '12px', fontWeight: 600,
                        color: '#6b7280', display: 'flex', alignItems: 'center', gap: '5px',
                        padding: '6px 10px', background: '#f8fafc', border: '1px solid #e2e8f0',
                        borderRadius: '8px', listStyle: 'none',
                      }}>
                        <span>📚</span>
                        <span>참고 문서 {msg.sources.length}개</span>
                        <span style={{ marginLeft: 'auto', fontSize: '10px', color: '#94a3b8' }}>클릭하여 펼치기 ▾</span>
                      </summary>
                      <div style={{ marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {msg.sources.map((s) => (
                          <div key={s.index} style={{
                            border: '1px solid #e2e8f0', borderRadius: '10px',
                            background: 'white', overflow: 'hidden',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                          }}>
                            <div style={{
                              display: 'flex', alignItems: 'center', gap: '8px',
                              padding: '8px 12px', background: '#f8fafc',
                              borderBottom: '1px solid #e2e8f0',
                            }}>
                              <span style={{
                                width: '20px', height: '20px', borderRadius: '50%',
                                background: category.color, color: 'white',
                                fontSize: '10px', fontWeight: 700,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                flexShrink: 0,
                              }}>{s.index}</span>
                              <span style={{ fontSize: '12px', fontWeight: 600, color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {s.docName.endsWith('.pdf') ? '📄' : s.docName.endsWith('.docx') ? '📝' : '📃'} {s.docName}
                              </span>
                            </div>
                            <div style={{
                              padding: '10px 14px', fontSize: '12px', color: '#4b5563',
                              lineHeight: 1.7, whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                              maxHeight: '300px', overflowY: 'auto',
                              background: 'white',
                            }}>
                              {s.chunk}
                            </div>
                          </div>
                        ))}
                      </div>
                    </details>
                  </div>
                )}
              </div>
            ))}
            {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#9ca3af', fontSize: '13px' }}>
                <span style={{ animation: 'pulse 1s infinite' }}>⚙️</span> 답변 생성 중...
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* 입력 영역 */}
          <div style={{ padding: '12px 16px', borderTop: '1px solid #e9e9e7', background: 'white', flexShrink: 0 }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', background: '#f9fafb', border: '1.5px solid #e5e7eb', borderRadius: '12px', padding: '8px 12px' }}>
              <textarea
                ref={textareaRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`${category.name} 관련 질문을 입력하세요... (Enter 전송, Shift+Enter 줄바꿈)`}
                rows={1}
                disabled={isLoading}
                style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', resize: 'none', fontSize: '13px', color: '#111827', lineHeight: 1.5, maxHeight: '120px', overflowY: 'auto', fontFamily: 'inherit' }}
                onInput={e => {
                  const t = e.currentTarget;
                  t.style.height = 'auto';
                  t.style.height = Math.min(t.scrollHeight, 120) + 'px';
                }}
              />
              <button
                onClick={sendMessage}
                disabled={isLoading || !input.trim()}
                style={{
                  width: '32px', height: '32px', borderRadius: '8px', border: 'none',
                  background: input.trim() && !isLoading ? category.color : '#e5e7eb',
                  color: 'white', cursor: input.trim() && !isLoading ? 'pointer' : 'not-allowed',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  transition: 'background 0.15s',
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
