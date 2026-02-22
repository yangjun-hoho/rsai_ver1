'use client';

export interface Generation {
  id: string;
  prompt: string;
  modelVersion: string;
  timestamp: number;
  parameters: { temperature: number; seed?: number };
  imageUrl: string;
}

interface HistoryPanelProps {
  isDarkMode: boolean;
  showHistory: boolean;
  generations: Generation[];
  selectedGenerationId: string | null;
  onTogglePanel: () => void;
  onSelectGeneration: (gen: Generation) => void;
  onSetSelectedId: (id: string) => void;
}

export default function HistoryPanel({
  isDarkMode, showHistory, generations, selectedGenerationId,
  onTogglePanel, onSelectGeneration, onSetSelectedId,
}: HistoryPanelProps) {
  const dark = {
    panel: { background: '#030712', borderLeft: '1px solid #1f2937' },
    header: { color: '#d1d5db' },
    subText: '#9ca3af',
    closeBtn: '#9ca3af',
    emptyText: '#6b7280',
    variantBorder: '#374151',
    variantSelected: '#eab308',
    variantNum: { background: 'rgba(17,24,39,.8)', color: '#d1d5db' },
    details: { background: '#111827', border: '1px solid #374151' },
    detailLabel: '#9ca3af',
    detailText: '#d1d5db',
    dlBtn: { background: '#1f2937', border: '1px solid #374151', color: '#d1d5db' },
    expand: { background: '#1f2937', border: '1px solid #374151' },
    dot: '#6b7280',
  };
  const light = {
    panel: { background: '#ffffff', borderLeft: '1px solid #e5e7eb' },
    header: { color: '#1f2937' },
    subText: '#6b7280',
    closeBtn: '#6b7280',
    emptyText: '#9ca3af',
    variantBorder: '#e5e7eb',
    variantSelected: '#eab308',
    variantNum: { background: 'rgba(255,255,255,.9)', color: '#1f2937' },
    details: { background: '#f9fafb', border: '1px solid #e5e7eb' },
    detailLabel: '#6b7280',
    detailText: '#1f2937',
    dlBtn: { background: '#f9fafb', border: '1px solid #e5e7eb', color: '#1f2937' },
    expand: { background: '#e5e7eb', border: '1px solid #d1d5db' },
    dot: '#9ca3af',
  };
  const t = isDarkMode ? dark : light;

  const selectedGen = generations.find(g => g.id === selectedGenerationId);
  const recentGens = generations.slice(-4);

  function handleDownload() {
    const gen = selectedGen;
    if (!gen) return;
    const a = document.createElement('a');
    a.href = gen.imageUrl;
    a.download = `nano-banana-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  // Collapsed state
  if (!showHistory) {
    return (
      <div style={{ width: '48px', flexShrink: 0, height: '100%', ...t.panel, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <button
          onClick={onTogglePanel}
          style={{ width: '24px', height: '64px', ...t.expand, borderRight: 'none', borderRadius: '8px 0 0 8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {[0, 1, 2].map(i => <div key={i} style={{ width: '4px', height: '4px', background: t.dot, borderRadius: '50%' }} />)}
          </div>
        </button>
      </div>
    );
  }

  return (
    <div style={{ width: '320px', flexShrink: 0, height: '100%', ...t.panel, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '1.25rem 1.25rem 0 1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', flex: 1, overflowY: 'auto', minHeight: 0 }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', ...t.header }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 500, margin: 0, ...t.header }}>History &amp; Variants</h3>
          </div>
          <button onClick={onTogglePanel} style={{ background: 'transparent', border: 'none', color: t.closeBtn, fontSize: '1.4rem', cursor: 'pointer', lineHeight: 1, padding: '0.1rem 0.3rem', borderRadius: '4px' }}>×</button>
        </div>

        {/* Current Variants */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          <h4 style={{ fontSize: '0.72rem', fontWeight: 500, color: t.subText, margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Current Variants</h4>
          {recentGens.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.4rem' }}>🖼️</div>
              <p style={{ fontSize: '0.82rem', color: t.emptyText, margin: 0 }}>No generations yet</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
              {recentGens.map((gen, i) => (
                <button
                  key={gen.id}
                  onClick={() => { onSelectGeneration(gen); onSetSelectedId(gen.id); }}
                  style={{
                    position: 'relative', aspectRatio: '1', borderRadius: '8px', overflow: 'hidden', cursor: 'pointer',
                    border: `2px solid ${selectedGenerationId === gen.id ? t.variantSelected : t.variantBorder}`,
                    background: 'transparent', padding: 0, transition: 'border-color 0.2s',
                  }}
                >
                  <img src={gen.imageUrl} alt={`variant ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{
                    position: 'absolute', top: '0.3rem', left: '0.3rem',
                    fontSize: '0.7rem', padding: '0.2rem 0.4rem', borderRadius: '3px',
                    ...t.variantNum,
                  }}>#{i + 1}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Generation Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1, minHeight: 0 }}>
          <h4 style={{ fontSize: '0.72rem', fontWeight: 500, color: t.subText, margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Generation Details</h4>
          <div style={{ ...t.details, borderRadius: '8px', padding: '0.75rem', overflowY: 'auto', flex: 1, minHeight: '80px' }}>
            {selectedGen ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <div>
                  <div style={{ fontSize: '0.7rem', color: t.detailLabel, marginBottom: '0.2rem' }}>Prompt:</div>
                  <p style={{ fontSize: '0.75rem', color: t.detailText, margin: 0, lineHeight: 1.5, wordBreak: 'break-word' }}>{selectedGen.prompt}</p>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem' }}>
                  <span style={{ color: t.detailLabel }}>Model:</span>
                  <span style={{ color: t.detailText }}>{selectedGen.modelVersion}</span>
                </div>
                {selectedGen.parameters.seed && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem' }}>
                    <span style={{ color: t.detailLabel }}>Seed:</span>
                    <span style={{ color: t.detailText }}>{selectedGen.parameters.seed}</span>
                  </div>
                )}
              </div>
            ) : (
              <p style={{ fontSize: '0.75rem', color: t.subText, margin: 0 }}>Select a generation to view details</p>
            )}
          </div>
        </div>
      </div>

      {/* Download */}
      <div style={{ padding: '1rem 1.25rem', flexShrink: 0 }}>
        <button
          onClick={handleDownload}
          disabled={!selectedGenerationId}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: '0.4rem', padding: '0.5rem', borderRadius: '6px', cursor: selectedGenerationId ? 'pointer' : 'not-allowed',
            fontSize: '0.875rem', transition: 'all 0.2s', ...t.dlBtn,
            opacity: selectedGenerationId ? 1 : 0.5,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Download
        </button>
      </div>
    </div>
  );
}
