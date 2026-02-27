'use client';

interface TitleSelectorProps {
  titles: string[];
  onSelect: (title: string) => void;
  isLoading: boolean;
  selectedTitle?: string;
  onBack: () => void;
}

export default function TitleSelector({ titles, onSelect, isLoading, selectedTitle, onBack }: TitleSelectorProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {titles.map((title, index) => {
          const isSelected = title === selectedTitle;
          return (
          <button
            key={index}
            onClick={() => !isLoading && onSelect(title)}
            disabled={isLoading}
            style={{
              padding: '0.75rem 1rem',
              background: isSelected ? '#eef2ff' : 'white',
              border: `1px solid ${isSelected ? 'var(--focus-color)' : 'var(--border-color)'}`,
              borderRadius: '8px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              textAlign: 'left',
              fontSize: '0.85rem',
              color: isSelected ? 'var(--focus-color)' : 'var(--text-primary)',
              lineHeight: 1.4,
              transition: 'all 0.2s ease',
              opacity: isLoading ? 0.6 : 1,
              fontWeight: isSelected ? '600' : '500',
            }}
            onMouseEnter={e => { if (!isLoading && !isSelected) { e.currentTarget.style.borderColor = 'var(--focus-color)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(99,102,241,0.15)'; } }}
            onMouseLeave={e => { if (!isSelected) { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.boxShadow = 'none'; } }}
          >
            <span style={{ color: 'var(--text-muted)', marginRight: '0.5rem', fontSize: '0.75rem' }}>{index + 1}.</span>
            {title}
          </button>
          );
        })}
      </div>

      <button onClick={onBack} style={{ padding: '0.5rem', background: 'white', color: 'var(--text-secondary)', border: '1px solid var(--border-color)', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}>
        ← 다시 작성하기
      </button>
    </div>
  );
}
