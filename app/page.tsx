'use client';

import { useState, useCallback, useEffect } from 'react';
import Sidebar, { type ToolId } from '@/lib/chat/Sidebar';
import ChatHeader from '@/lib/chat/ChatHeader';
import ChatArea from '@/lib/chat/ChatArea';
import InputArea from '@/lib/chat/InputArea';
import type { Message } from '@/lib/chat/MessageBubble';

const AVAILABLE_MODELS = [
  { id: 'gpt-4o-mini',           name: 'OpenAI',    size: 'API', badge: 'API' },
  { id: 'gemini-2.5-flash-lite', name: 'GoogleAI',  size: 'API', badge: 'API' },
];

const LS_KEY = 'ares-ai-messages';

function newId() {
  return Math.random().toString(36).slice(2);
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeMode, setActiveMode] = useState<ToolId | null>(null);
  const [selectedModel, setSelectedModel] = useState('gpt-4o-mini');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    document.title = '아레스 AI';
    try {
      const saved = localStorage.getItem(LS_KEY);
      if (saved) setMessages(JSON.parse(saved));
    } catch { /* ignore */ }
  }, []);

  function saveMessages(msgs: Message[]) {
    try { localStorage.setItem(LS_KEY, JSON.stringify(msgs)); } catch { /* ignore */ }
  }

  function updateLastAssistant(content: string) {
    setMessages(prev => {
      const next = [...prev];
      for (let i = next.length - 1; i >= 0; i--) {
        if (next[i].role === 'assistant') {
          next[i] = { ...next[i], content };
          break;
        }
      }
      saveMessages(next);
      return next;
    });
  }

  function handleToolClick(toolId: ToolId) {
    setActiveMode(prev => prev === toolId ? null : toolId);
  }

  // 일반 채팅 전송 (SSE 스트리밍)
  const handleSend = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;
    setError('');

    const userMsg: Message = { id: newId(), role: 'user', content: text };
    const assistantMsg: Message = { id: newId(), role: 'assistant', content: '' };

    let currentMessages: Message[] = [];
    setMessages(prev => {
      currentMessages = [...prev, userMsg, assistantMsg];
      saveMessages(currentMessages);
      return currentMessages;
    });
    setIsLoading(true);

    // 스트리밍 참조용으로 이전 메시지(userMsg 포함) 스냅샷
    const historyForApi = [...messages, userMsg].map(m => ({ role: m.role, content: m.content }));

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: historyForApi, model: selectedModel }),
      });

      if (!response.ok) throw new Error('API 응답 오류');

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        for (const line of chunk.split('\n').filter(l => l.trim())) {
          if (!line.startsWith('data:')) continue;
          const data = line.slice(5).trim();
          if (data === '[DONE]') continue;
          try {
            const parsed = JSON.parse(data);
            if (parsed.error) throw new Error(parsed.error);
            if (parsed.content) {
              accumulated += parsed.content;
              updateLastAssistant(accumulated);
            }
          } catch { /* skip */ }
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : '오류가 발생했습니다.';
      updateLastAssistant(`❌ ${msg}`);
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, selectedModel, isLoading]);

  // 도구 폼 제출 핸들러
  const handleToolSubmit = useCallback(async (toolId: ToolId, data: Record<string, unknown>) => {
    setActiveMode(null);
    setIsLoading(true);
    setError('');

    const toolLabels: Record<string, string> = {
      report: '📝 보고서',
      ppt: '🖥️ PPT',
      scenario: '🎭 시나리오',
      'merit-citation': '🏆 공적조서',
      greetings: '💬 인사말씀',
      'press-release': '📰 보도자료',
    };
    const label = toolLabels[toolId] || toolId;

    const userMsg: Message = { id: newId(), role: 'user', content: `${label} 생성 요청` };
    const assistantMsg: Message = { id: newId(), role: 'assistant', content: `${label}을(를) 생성하고 있습니다...` };

    setMessages(prev => {
      const next = [...prev, userMsg, assistantMsg];
      saveMessages(next);
      return next;
    });

    try {
      let apiUrl = '';
      let body: Record<string, unknown> = data;

      if (toolId === 'report') {
        apiUrl = '/api/work-support/report';
        body = {
          title: String(data.reportTitle || ''),
          reportType: String(data.selectedReportType || ''),
          detailType: String(data.selectedDetailType || ''),
          reportLength: String(data.selectedLength || 'standard'),
        };
      } else if (toolId === 'ppt') {
        apiUrl = '/api/work-support/ppt-converter/generate';
        body = {
          content: String(data.content || ''),
          title: String(data.title || ''),
          slideCount: Number(data.slideCount) || 10,
          includeTitle: Boolean(data.includeTitle),
          includeIndex: Boolean(data.includeIndex),
          includeConclusion: Boolean(data.includeConclusion),
          template: String(data.template || 'professional'),
        };
      } else if (toolId === 'scenario') {
        apiUrl = '/api/work-support/scenario-generator';
        const settings = (data.settings as Record<string, unknown>) || {};
        body = {
          templateType: String(data.template || 'presentation'),
          content: String(data.content || ''),
          style: String(settings.style || 'formal'),
          audience: String(settings.audience || 'general'),
        };
      } else if (toolId === 'merit-citation') {
        apiUrl = '/api/work-support/merit-citation';
      } else if (toolId === 'greetings') {
        apiUrl = '/api/work-support/greetings';
      } else if (toolId === 'press-release') {
        apiUrl = '/api/work-support/press-release';
        body = { action: 'generateAll', coreContent: data.coreContent, keywords: data.keywords };
      }

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error((errData as { error?: string }).error || '생성에 실패했습니다.');
      }

      const result = await response.json();
      let summary = `✅ **${label} 생성 완료**\n\n`;

      if (toolId === 'report' && result.title) {
        summary += `📋 **제목:** ${result.title}\n`;
        summary += `📄 **섹션 수:** ${result.sections?.length || 0}개\n`;
        summary += `\n[보고서 페이지에서 확인하기](/work-support/report)`;
        try { localStorage.setItem('generated-report', JSON.stringify(result)); } catch { /* ignore */ }
      } else if (toolId === 'ppt' && result.slides) {
        summary += `📊 **슬라이드 수:** ${result.slides.length}개\n`;
        summary += `\n[PPT 변환기에서 확인하기](/work-support/ppt-converter)`;
        try { localStorage.setItem('generated-ppt', JSON.stringify(result)); } catch { /* ignore */ }
      } else if (toolId === 'scenario' && result.content) {
        summary += `📋 **템플릿:** ${result.metadata?.template || ''}\n`;
        summary += `📝 **단어 수:** ${result.metadata?.wordCount || ''}개\n\n`;
        summary += `\`\`\`\n${String(result.content).slice(0, 500)}${String(result.content).length > 500 ? '...' : ''}\n\`\`\``;
      } else if (toolId === 'merit-citation' && result.title) {
        summary += `📋 **제목:** ${result.title}\n\n`;
        summary += String(result.citation || '').slice(0, 500);
      } else if (toolId === 'greetings' && result.title) {
        summary += `📋 **제목:** ${result.title}\n\n`;
        summary += String(result.greeting || '').slice(0, 500);
      } else if (toolId === 'press-release' && result.titles) {
        summary += `📋 **제목:** ${result.titles[0]}\n`;
        summary += `📝 **생성된 제목 수:** ${result.titles.length}개`;
      }

      updateLastAssistant(summary);
    } catch (err) {
      const msg = err instanceof Error ? err.message : '생성 중 오류가 발생했습니다.';
      updateLastAssistant(`❌ ${label} 생성 실패: ${msg}`);
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleClear() {
    if (window.confirm('모든 대화 내역을 삭제하시겠습니까?')) {
      setMessages([]);
      try { localStorage.removeItem(LS_KEY); } catch { /* ignore */ }
    }
  }

  function handleExport() {
    const text = messages
      .map(m => `[${m.role === 'user' ? '사용자' : 'AI'}]\n${m.content}`)
      .join('\n\n---\n\n');
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'row',
      height: '100vh',
      background: '#ffffff',
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
      overflow: 'hidden',
    }}>
      <Sidebar activeMode={activeMode} onToolClick={handleToolClick} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        <ChatHeader
          models={AVAILABLE_MODELS}
          selectedModel={selectedModel}
          onClear={handleClear}
          onExport={handleExport}
        />

        <ChatArea messages={messages} isLoading={isLoading} />

        {error && (
          <div style={{ padding: '0.5rem 2rem', background: '#fee', borderTop: '1px solid #fcc', color: '#e03e3e', fontSize: '0.875rem', flexShrink: 0 }}>
            ⚠️ {error}
          </div>
        )}

        <InputArea
          activeMode={activeMode}
          selectedModel={selectedModel}
          models={AVAILABLE_MODELS}
          isLoading={isLoading}
          onSend={handleSend}
          onModelChange={setSelectedModel}
          onCloseMode={() => setActiveMode(null)}
          onToolSubmit={handleToolSubmit}
        />
      </div>
    </div>
  );
}
