'use client';

import { useState, useEffect } from 'react';
import type { ToolId } from '@/lib/chat/Sidebar';
import GreetingDisplay from '@/lib/work-support/greetings/GreetingDisplay';
import PressReleaseDisplay from '@/lib/work-support/press-release/PressReleaseDisplay';
import CitationDisplay from '@/lib/work-support/merit-citation/CitationDisplay';
import ReportViewer from '@/lib/work-support/report/ReportViewer';
import ScenarioViewer from '@/lib/work-support/scenario-generator/ScenarioViewer';
import PPTViewer from '@/lib/work-support/ppt-converter/PPTViewer';

interface SlideType {
  slideNumber: number;
  title: string;
  content: string;
  bulletPoints: string[];
  type: 'title' | 'index' | 'content' | 'conclusion';
  subtitle?: string;
  notes?: string;
}

const PREVIEW_TOOL_IDS: ToolId[] = ['report', 'ppt', 'scenario', 'merit-citation', 'greetings', 'press-release'];

const TOOL_EMOJI: Record<string, string> = {
  report:           '📝',
  ppt:              '🖥️',
  scenario:         '🎭',
  'merit-citation': '🏆',
  greetings:        '💬',
  'press-release':  '📰',
};

const TAB_LABELS: Record<string, string> = {
  report:           '보고서',
  ppt:              'PPT',
  scenario:         '시나리오',
  'merit-citation': '공적조서',
  greetings:        '인사말씀',
  'press-release':  '보도자료',
};

export interface PreviewPanelProps {
  tool: ToolId | null;
  data: Record<string, unknown> | null;
  store: Partial<Record<ToolId, Record<string, unknown>>>;
  isLoading: boolean;
  isOpen: boolean;
  onToggle: () => void;
  onTabSwitch: (toolId: ToolId) => void;
  onTabClose: (toolId: ToolId) => void;
}

function PanelLoading({ text }: { text: string }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', height: '100%', gap: '1rem',
    }}>
      <div className="loading-spinner" />
      <p style={{ color: '#9b9a97', margin: 0, fontSize: '0.9rem' }}>{text}</p>
    </div>
  );
}

function PanelEmpty({ emoji, label }: { emoji: string; label: string }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', height: '100%', gap: '0.75rem',
      color: '#b0aea8',
    }}>
      <span style={{ fontSize: '2rem', opacity: 0.45 }}>{emoji}</span>
      <p style={{ margin: 0, fontSize: '0.85rem', textAlign: 'center', lineHeight: 1.6 }}>
        아직 생성된 결과가 없습니다.<br />
        <span style={{ fontSize: '0.78rem', color: '#c8c6c0' }}>{label} 폼에서 생성해보세요.</span>
      </p>
    </div>
  );
}

function PPTPanelView({ data, isLoading }: { data: Record<string, unknown> | null; isLoading: boolean }) {
  const [slides, setSlides] = useState<SlideType[]>((data?.slides as SlideType[]) ?? []);
  const [isDownloading, setIsDownloading] = useState(false);

  // data가 바뀌면 slides 동기화
  useEffect(() => {
    if (data?.slides) setSlides(data.slides as SlideType[]);
  }, [data?.slides]);

  async function handleDownload() {
    if (!slides.length) return;
    setIsDownloading(true);
    try {
      const title = slides.find(s => s.type === 'title')?.title || '프레젠테이션';
      const res = await fetch('/api/work-support/ppt-converter/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slides, title }),
      });
      if (!res.ok) throw new Error('다운로드 실패');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title}.pptx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'PPT 다운로드 중 오류가 발생했습니다.');
    } finally {
      setIsDownloading(false);
    }
  }

  if (isLoading) return <PanelLoading text="PPT를 생성하고 있습니다..." />;
  if (!slides.length) return <PanelEmpty emoji="🖥️" label="PPT" />;

  return (
    <PPTViewer
      slides={slides}
      onSlidesChange={setSlides}
      onDownload={handleDownload}
      isDownloading={isDownloading}
    />
  );
}

export default function PreviewPanel({
  tool, data, store, isLoading, isOpen, onToggle, onTabSwitch, onTabClose,
}: PreviewPanelProps) {
  // 열린 탭: 저장된 데이터가 있거나 현재 이 도구가 로딩 중인 경우
  const openTabs = PREVIEW_TOOL_IDS.filter(id =>
    store[id] !== undefined || (id === tool && isLoading)
  );

  // 활성 탭이 없으면 패널 숨김
  if (!tool) return null;

  const activeEmoji = TOOL_EMOJI[tool] || '🔧';
  const activeLabel = TAB_LABELS[tool] || tool;

  // ── 접힌 상태 (44px 세로 띠) ──────────────────────────────────────────────
  if (!isOpen) {
    return (
      <div style={{
        width: '44px',
        flexShrink: 0,
        borderLeft: '1px solid #e9e9e7',
        background: '#f7f6f3',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: '0.6rem',
        gap: '0.75rem',
        overflow: 'hidden',
      }}>
        {/* 펼치기 버튼 */}
        <button
          onClick={onToggle}
          title="미리보기 펼치기"
          style={{
            width: '30px', height: '30px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: 'none', background: 'transparent', borderRadius: '6px',
            cursor: 'pointer', color: '#555', flexShrink: 0,
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.08)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        <span style={{ fontSize: '1.1rem', lineHeight: 1, flexShrink: 0 }}>{activeEmoji}</span>

        <span style={{
          writingMode: 'vertical-rl',
          textOrientation: 'upright',
          fontSize: '0.7rem',
          color: '#777',
          fontWeight: 500,
          letterSpacing: '0.04em',
          userSelect: 'none',
          whiteSpace: 'nowrap',
        }}>
          {activeLabel}
        </span>

        {/* 탭 개수 뱃지 */}
        {openTabs.length > 1 && (
          <span style={{
            fontSize: '0.6rem', color: '#888',
            background: '#ddd', borderRadius: '999px',
            padding: '0.1rem 0.3rem', fontWeight: 700,
            lineHeight: 1.4,
          }}>
            {openTabs.length}
          </span>
        )}
      </div>
    );
  }

  // ── 펼쳐진 상태 ─────────────────────────────────────────────────────────
  return (
    <div style={{
      flex: 6,
      minWidth: 0,
      borderLeft: '1px solid #e9e9e7',
      background: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* 탭 헤더 */}
      <div style={{
        height: '44px',
        borderBottom: '1px solid #e9e9e7',
        display: 'flex',
        alignItems: 'center',
        flexShrink: 0,
        background: '#f7f6f3',
        padding: '0 0.4rem',
        gap: '0.25rem',
      }}>
        {/* 탭 목록 (가로 스크롤) */}
        <div style={{
          display: 'flex', alignItems: 'center', flex: 1, gap: '0.25rem',
          overflowX: 'auto', overflowY: 'hidden',
        }}>
          {openTabs.map(tabId => {
            const isActive = tabId === tool;
            const isTabLoading = tabId === tool && isLoading;
            return (
              <button
                key={tabId}
                onClick={() => onTabSwitch(tabId)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.28rem',
                  padding: '0.25rem 0.5rem 0.25rem 0.65rem',
                  background: isActive ? '#f4b8b8' : 'transparent',
                  border: isActive ? 'none' : '1px solid transparent',
                  borderRadius: '5px 5px 0px 0px',
                  cursor: 'pointer',
                  fontSize: '0.72rem',
                  color: isActive ? '#ffffff' : '#888',
                  fontWeight: isActive ? 600 : 400,
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = 'rgba(0,0,0,0.06)'; e.currentTarget.style.color = '#37352f'; } }}
                onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#888'; } }}
              >
                <span style={{ fontSize: '0.8rem' }}>{TOOL_EMOJI[tabId]}</span>
                <span>{TAB_LABELS[tabId]}</span>
                {isTabLoading && (
                  <span style={{ opacity: 0.55, fontSize: '0.65rem', marginLeft: '0.1rem' }}>⏳</span>
                )}
                {/* 탭 × 닫기 */}
                <span
                  role="button"
                  onClick={e => { e.stopPropagation(); onTabClose(tabId); }}
                  title={`${TAB_LABELS[tabId]} 닫기`}
                  style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    width: '14px', height: '14px', borderRadius: '3px',
                    marginLeft: '0.2rem',
                    color: '#c0bebb', fontSize: '0.75rem', lineHeight: 1,
                    cursor: 'pointer',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.background = 'rgba(0,0,0,0.1)';
                    (e.currentTarget as HTMLElement).style.color = '#555';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.background = 'transparent';
                    (e.currentTarget as HTMLElement).style.color = '#c0bebb';
                  }}
                >
                  ×
                </span>
              </button>
            );
          })}
        </div>

        {/* 접기 버튼 */}
        <button
          onClick={onToggle}
          title="미리보기 접기"
          style={{
            width: '36px', height: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: 'none', borderLeft: '1px solid #e9e9e7',
            background: 'transparent', cursor: 'pointer',
            color: '#7e7e7e', flexShrink: 0,
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.06)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>

      {/* 콘텐츠 */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        {tool === 'greetings' && (
          isLoading ? (
            <PanelLoading text="인사말씀을 생성하고 있습니다..." />
          ) : !data?.greeting ? (
            <PanelEmpty emoji="💬" label="인사말씀" />
          ) : (
            <GreetingDisplay
              greetingText={String(data.greeting)}
              greetingType={String(data.title || '인사말씀')}
              isLoading={false}
            />
          )
        )}

        {tool === 'press-release' && (
          isLoading ? (
            <PanelLoading text="보도자료를 생성하고 있습니다..." />
          ) : !data || Object.keys(data).length === 0 ? (
            <PanelEmpty emoji="📰" label="보도자료" />
          ) : (
            <PressReleaseDisplay
              data={data}
              isLoading={false}
            />
          )
        )}

        {tool === 'merit-citation' && (
          isLoading ? (
            <PanelLoading text="공적조서를 생성하고 있습니다..." />
          ) : !data?.citation ? (
            <PanelEmpty emoji="🏆" label="공적조서" />
          ) : (
            <CitationDisplay
              citationText={String(data.citation)}
              isLoading={false}
            />
          )
        )}

        {tool === 'report' && (
          isLoading ? (
            <PanelLoading text="보고서를 생성하고 있습니다..." />
          ) : !data ? (
            <PanelEmpty emoji="📝" label="보고서" />
          ) : (
            <ReportViewer reportData={data} />
          )
        )}

        {tool === 'scenario' && (
          isLoading ? (
            <PanelLoading text="시나리오를 생성하고 있습니다..." />
          ) : !data?.content ? (
            <PanelEmpty emoji="🎭" label="시나리오" />
          ) : (
            <ScenarioViewer
              script={{
                content: String(data.content),
                estimatedDuration: 0,
                tips: [],
                metadata: (data.metadata as Record<string, unknown>) || {},
              }}
              originalContent=""
              template={String((data.metadata as Record<string, unknown>)?.template || '')}
              settings={{}}
            />
          )
        )}

        {tool === 'ppt' && (
          <PPTPanelView data={data} isLoading={isLoading} />
        )}

      </div>
    </div>
  );
}
