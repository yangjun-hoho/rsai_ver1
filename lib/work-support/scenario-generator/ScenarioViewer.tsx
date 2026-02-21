'use client';

interface ScriptData {
  content: string;
  estimatedDuration: number;
  tips: string[];
  metadata: Record<string, unknown>;
}

interface ScenarioViewerProps {
  script: ScriptData;
  originalContent: string;
  template: string;
  settings: Record<string, unknown>;
}

const templateLabels: Record<string, string> = {
  presentation: '발표 대본',
  scenario:     '시나리오',
  speech:       '연설문',
  lecture:      '강의 대본',
};

const scenarioCSS = `
  .scenario-doc-container {
    background: white;
    color: #000;
    font-family: 'Noto Sans KR', 'Malgun Gothic', sans-serif;
    line-height: 1.6;
    max-width: 800px;
    margin: 0 auto;
    padding: 0 1rem 2rem 1rem;
  }
  .scenario-doc-header {
    text-align: center;
    margin-bottom: 1.5rem;
    padding: 1.5rem 0 1rem 0;
    position: relative;
  }
  .scenario-doc-header::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 12px;
    background: linear-gradient(150deg, #1e40af 79.5%, white 79.5%, white 80.5%, #22c55e 80.5%);
  }
  .scenario-doc-header::after {
    content: '';
    position: absolute;
    bottom: 0; left: 0; right: 0;
    height: 6px;
    background: rgb(96, 100, 109);
  }
  .scenario-doc-title {
    font-size: 2.3rem;
    font-weight: bold;
    margin: 3px 0 3px 0;
    line-height: 1.3;
    color: #000;
  }
  .scenario-doc-body {
    padding: 1.5rem 0.5rem;
    font-size: 1rem;
    line-height: 2.0;
    color: #1a1a1a;
    white-space: pre-line;
  }
`;

export default function ScenarioViewer({ script, template }: ScenarioViewerProps) {
  function handleCopy() {
    navigator.clipboard.writeText(script.content);
    alert('클립보드에 복사되었습니다.');
  }

  const titleLabel = templateLabels[template] || template || '시나리오';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <style>{scenarioCSS}</style>

      {/* 툴바 */}
      <div style={{ padding: '0.75rem 1rem', background: 'white', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.4rem' }}>
          <button
            onClick={handleCopy}
            disabled={!script.content}
            style={{ padding: '0.3rem 0.65rem', background: script.content ? 'var(--focus-color)' : '#aaa', color: 'white', border: 'none', borderRadius: '4px', fontSize: '0.72rem', cursor: script.content ? 'pointer' : 'not-allowed' }}
          >
            복사
          </button>
        </div>
      </div>

      {/* 콘텐츠 */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', background: '#f8f8f4' }}>
        <div className="scenario-doc-container">
          <div className="scenario-doc-header">
            <h1 className="scenario-doc-title">{titleLabel}</h1>
          </div>
          <div className="scenario-doc-body">{script.content}</div>
        </div>
      </div>
    </div>
  );
}
