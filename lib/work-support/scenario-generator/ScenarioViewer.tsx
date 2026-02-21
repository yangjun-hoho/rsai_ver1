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
  scenario: '시나리오',
  speech: '연설문',
  lecture: '강의 대본',
};

export default function ScenarioViewer({ script, template }: ScenarioViewerProps) {
  function handleCopy() {
    navigator.clipboard.writeText(script.content);
    alert('클립보드에 복사되었습니다.');
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* 정보 바 */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <div style={{ background: '#eef2ff', padding: '0.35rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', color: 'var(--focus-color)', fontWeight: '500' }}>
          📋 {templateLabels[template] || template}
        </div>
        <div style={{ background: '#f0fdf4', padding: '0.35rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', color: '#16a34a', fontWeight: '500' }}>
          ⏱️ 약 {script.estimatedDuration}분
        </div>
        <div style={{ background: '#fefce8', padding: '0.35rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', color: '#d97706', fontWeight: '500' }}>
          📝 {(script.metadata.generatedLength as number) || script.content.length}자
        </div>
        <button onClick={handleCopy} style={{ marginLeft: 'auto', padding: '0.35rem 0.75rem', background: 'var(--focus-color)', color: 'white', border: 'none', borderRadius: '5px', fontSize: '0.75rem', cursor: 'pointer' }}>
          복사
        </button>
      </div>

      {/* 대본 내용 */}
      <div style={{ background: 'white', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1.5rem', lineHeight: 1.9, fontSize: '0.875rem', color: 'var(--text-primary)', whiteSpace: 'pre-line', fontFamily: 'inherit' }}>
        {script.content}
      </div>

      {/* 팁 */}
      {script.tips && script.tips.length > 0 && (
        <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '8px', padding: '0.75rem 1rem' }}>
          <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.8rem', fontWeight: '600', color: '#0369a1' }}>💡 발표 팁</h4>
          <ul style={{ margin: 0, paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
            {script.tips.map((tip, i) => (
              <li key={i} style={{ fontSize: '0.78rem', color: '#0369a1', lineHeight: 1.5 }}>{tip}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
