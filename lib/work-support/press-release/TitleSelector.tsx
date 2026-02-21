'use client';

interface TitleSelectorProps {
  titles: string[];
  onSelect: (title: string) => void;
  isLoading: boolean;
  onBack: () => void;
}

export default function TitleSelector({ titles, onSelect, isLoading, onBack }: TitleSelectorProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', borderRadius: '8px', padding: '0.75rem 1rem' }}>
        <h2 style={{ color: 'white', margin: 0, fontSize: '0.9rem', fontWeight: '600' }}>📋 제목 선택</h2>
        <p style={{ color: 'rgba(255,255,255,0.85)', margin: '0.25rem 0 0 0', fontSize: '0.75rem' }}>원하는 제목을 클릭하여 선택하세요</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {titles.map((title, index) => (
          <button
            key={index}
            onClick={() => !isLoading && onSelect(title)}
            disabled={isLoading}
            style={{
              padding: '0.75rem 1rem',
              background: 'white',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              textAlign: 'left',
              fontSize: '0.82rem',
              color: 'var(--text-primary)',
              lineHeight: 1.4,
              transition: 'all 0.2s ease',
              opacity: isLoading ? 0.6 : 1,
            }}
            onMouseEnter={e => { if (!isLoading) { e.currentTarget.style.borderColor = 'var(--focus-color)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(99,102,241,0.15)'; } }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            <span style={{ color: 'var(--text-muted)', marginRight: '0.5rem', fontSize: '0.75rem' }}>{index + 1}.</span>
            {title}
          </button>
        ))}
      </div>

      <button onClick={onBack} style={{ padding: '0.5rem', background: 'white', color: 'var(--text-secondary)', border: '1px solid var(--border-color)', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}>
        ← 다시 작성하기
      </button>
    </div>
  );
}
