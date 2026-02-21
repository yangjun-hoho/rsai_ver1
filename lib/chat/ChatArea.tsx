'use client';

import { useEffect, useRef } from 'react';
import MessageBubble, { type Message } from './MessageBubble';

interface ChatAreaProps {
  messages: Message[];
  isLoading: boolean;
}

const STARTER_CARDS = [
  { icon: '📄', title: '문서 생성', desc: '보고서, 기획서 자동 작성' },
  { icon: '📚', title: '문서 분석', desc: 'PDF 또는 텍스트 파일 업로드' },
  { icon: '🖥️', title: 'PPT 생성', desc: 'AI 자동 프레젠테이션 작성' },
  { icon: '✅', title: '작업 자동화', desc: '반복 작업을 AI로 처리' },
];

export default function ChatArea({ messages, isLoading }: ChatAreaProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  return (
    <div
      ref={containerRef}
      style={{
        flex: 1,
        overflowY: 'auto',
        background: '#ffffff',
        padding: '2rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <style>{`
        .chat-markdown h1,.chat-markdown h2,.chat-markdown h3{margin:0.75em 0 0.4em;font-weight:600;line-height:1.3}
        .chat-markdown h1{font-size:1.2rem}
        .chat-markdown h2{font-size:1.05rem}
        .chat-markdown h3{font-size:0.95rem}
        .chat-markdown p{margin:0.4em 0;line-height:1.7}
        .chat-markdown ul,.chat-markdown ol{margin:0.4em 0;padding-left:1.5em}
        .chat-markdown li{margin:0.2em 0}
        .chat-markdown code{background:#f0f0f0;padding:0.1em 0.35em;border-radius:3px;font-size:0.85em;font-family:monospace}
        .chat-markdown pre{background:#1e1e1e;color:#d4d4d4;padding:1em;border-radius:8px;overflow-x:auto;margin:0.5em 0}
        .chat-markdown pre code{background:none;padding:0;font-size:0.8rem}
        .chat-markdown blockquote{border-left:3px solid #d0d0d0;padding-left:1em;color:#6b6b6b;margin:0.5em 0}
        .chat-markdown strong{font-weight:600}
        .chat-markdown table{border-collapse:collapse;width:100%;margin:0.5em 0}
        .chat-markdown th,.chat-markdown td{border:1px solid #e0e0e0;padding:0.4em 0.75em;text-align:left}
        .chat-markdown th{background:#f7f6f3;font-weight:600}
      `}</style>

      {messages.length === 0 ? (
        /* 웰컴 화면 */
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', width: '100%', maxWidth: '800px', paddingTop: '2rem', textAlign: 'center' }}>
          <div style={{
            width: '80px', height: '80px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '1.5rem',
            boxShadow: '0 4px 12px rgba(102,126,234,0.4)',
            fontSize: '2rem',
          }}>
            🤖
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 600, color: '#37352f', margin: '0 0 0.5rem 0' }}>
            아레스 AI-Agent에 오신 것을 환영합니다
          </h2>
          <p style={{ color: '#9b9a97', fontSize: '0.9rem', margin: '0 0 2rem 0' }}>
            무엇을 도와드릴까요?
          </p>

          <div style={{ width: '100%', textAlign: 'left' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#9b9a97', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.6rem' }}>
              시작하기
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
              {STARTER_CARDS.map((card) => (
                <div
                  key={card.title}
                  style={{
                    background: '#fcfcfc',
                    border: '1px solid #e9e9e7',
                    borderRadius: '8px',
                    padding: '0.75rem 1rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.35rem',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = '#f7f6f3';
                    e.currentTarget.style.borderColor = '#d0d0d0';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = '#fcfcfc';
                    e.currentTarget.style.borderColor = '#e9e9e7';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{ fontSize: '1rem' }}>{card.icon}</div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#37352f' }}>{card.title}</div>
                  <div style={{ fontSize: '0.72rem', color: '#9b9a97', lineHeight: 1.4 }}>{card.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* 메시지 목록 */
        <>
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
        </>
      )}
    </div>
  );
}
