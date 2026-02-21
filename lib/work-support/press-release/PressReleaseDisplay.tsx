'use client';

interface PressReleaseData {
  metadata?: { releaseDate?: string; department?: string; contact?: string };
  title?: { main?: string; subtitle?: string };
  lead?: { summary?: string; keyPoints?: string[] };
  body?: Array<{ type: string; title?: string; content?: string; speaker?: string; position?: string; data?: Record<string, string> }>;
  conclusion?: { content?: string; futureActions?: string[]; contact?: { department?: string; phone?: string; email?: string } };
}

interface PressReleaseDisplayProps {
  data: Record<string, unknown>;
}

export default function PressReleaseDisplay({ data }: PressReleaseDisplayProps) {
  const pr = data as PressReleaseData;

  function handleCopy() {
    const text = [
      pr.title?.main,
      pr.title?.subtitle,
      '',
      pr.lead?.summary,
      '',
      ...(pr.lead?.keyPoints?.map(p => `• ${p}`) || []),
      '',
      ...(pr.body?.map(b => `[${b.title}]\n${b.content || ''}`) || []),
      '',
      pr.conclusion?.content,
    ].filter(v => v !== undefined).join('\n');
    navigator.clipboard.writeText(text);
    alert('클립보드에 복사되었습니다.');
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
        <h2 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-primary)' }}>생성된 보도자료</h2>
        <button onClick={handleCopy} style={{ padding: '0.35rem 0.75rem', background: 'var(--focus-color)', color: 'white', border: 'none', borderRadius: '5px', fontSize: '0.75rem', cursor: 'pointer' }}>복사</button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto', flex: 1 }}>
        {/* 메타데이터 */}
        {pr.metadata && (
          <div style={{ background: '#f8f9fa', borderRadius: '6px', padding: '0.75rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {pr.metadata.releaseDate && <span>📅 {pr.metadata.releaseDate}</span>}
            {pr.metadata.department && <span style={{ marginLeft: '1rem' }}>🏢 {pr.metadata.department}</span>}
          </div>
        )}

        {/* 제목 */}
        {pr.title && (
          <div style={{ borderBottom: '2px solid #1a1a2e', paddingBottom: '0.75rem' }}>
            <h1 style={{ margin: '0 0 0.25rem 0', fontSize: '1.1rem', fontWeight: '700', color: '#1a1a2e', lineHeight: 1.4 }}>{pr.title.main}</h1>
            {pr.title.subtitle && <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{pr.title.subtitle}</p>}
          </div>
        )}

        {/* 리드 */}
        {pr.lead && (
          <div>
            <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.9rem', lineHeight: 1.7, color: 'var(--text-primary)', fontWeight: '500' }}>{pr.lead.summary}</p>
            {pr.lead.keyPoints && pr.lead.keyPoints.length > 0 && (
              <ul style={{ margin: 0, paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                {pr.lead.keyPoints.map((point, i) => (
                  <li key={i} style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{point}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* 본문 */}
        {pr.body?.map((section, index) => (
          <div key={index} style={{ borderLeft: '3px solid var(--focus-color)', paddingLeft: '0.75rem' }}>
            {section.title && <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', fontWeight: '700', color: 'var(--text-primary)' }}>{section.title}</h3>}
            {section.type === 'quote' ? (
              <div style={{ background: '#f0f0ff', borderRadius: '6px', padding: '0.75rem' }}>
                <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', lineHeight: 1.7, color: 'var(--text-primary)' }}>&quot;{section.content}&quot;</p>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>- {section.position} {section.speaker}</p>
              </div>
            ) : (
              <p style={{ margin: 0, fontSize: '0.85rem', lineHeight: 1.7, color: 'var(--text-secondary)', whiteSpace: 'pre-line' }}>{section.content}</p>
            )}
            {section.data && (
              <div style={{ marginTop: '0.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.35rem' }}>
                {Object.entries(section.data).filter(([, v]) => v).map(([k, v]) => (
                  <div key={k} style={{ background: '#f8f9fa', padding: '0.35rem 0.5rem', borderRadius: '4px', fontSize: '0.72rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>{k === 'budget' ? '예산' : k === 'schedule' ? '일정' : k === 'target' ? '대상' : '장소'}: </span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: '500' }}>{v}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* 결론 */}
        {pr.conclusion && (
          <div style={{ background: '#f8f9fa', borderRadius: '8px', padding: '1rem' }}>
            {pr.conclusion.content && <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', lineHeight: 1.7, color: 'var(--text-secondary)' }}>{pr.conclusion.content}</p>}
            {pr.conclusion.contact && (
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                문의: {pr.conclusion.contact.department} | {pr.conclusion.contact.phone} | {pr.conclusion.contact.email}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
