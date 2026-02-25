'use client';

import { useState } from 'react';

const COLOR_PRESETS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444',
  '#8b5cf6', '#ec4899', '#06b6d4', '#f97316',
];

interface Props {
  onCreated: () => void;
  onCancel: () => void;
}

export default function CategoryForm({ onCreated, onCancel }: Props) {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('📁');
  const [color, setColor] = useState(COLOR_PRESETS[0]);
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !icon.trim()) { setError('이름과 아이콘은 필수입니다.'); return; }

    setIsLoading(true);
    setError('');
    try {
      const res = await fetch('/api/rag/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), icon: icon.trim(), color, description: description.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? '생성 실패'); return; }
      onCreated();
    } catch {
      setError('네트워크 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ padding: '12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', marginBottom: '8px' }}>
      <div style={{ fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '10px' }}>새 카테고리</div>

      {/* 이름 */}
      <div style={{ marginBottom: '8px' }}>
        <label style={{ fontSize: '11px', color: '#6b7280', display: 'block', marginBottom: '3px' }}>이름 *</label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="예: 정보공개, 동물복지..."
          maxLength={30}
          style={{ width: '100%', padding: '5px 8px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '12px', outline: 'none', boxSizing: 'border-box' }}
        />
      </div>

      {/* 아이콘 + 색상 */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
        <div style={{ flex: '0 0 70px' }}>
          <label style={{ fontSize: '11px', color: '#6b7280', display: 'block', marginBottom: '3px' }}>아이콘 *</label>
          <input
            type="text"
            value={icon}
            onChange={e => setIcon(e.target.value)}
            maxLength={4}
            style={{ width: '100%', padding: '5px 8px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '18px', textAlign: 'center', outline: 'none', boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: '11px', color: '#6b7280', display: 'block', marginBottom: '3px' }}>색상</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {COLOR_PRESETS.map(c => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                style={{
                  width: '20px', height: '20px', borderRadius: '50%',
                  background: c, border: color === c ? '2px solid #1f2937' : '2px solid transparent',
                  cursor: 'pointer', flexShrink: 0,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* 설명 */}
      <div style={{ marginBottom: '10px' }}>
        <label style={{ fontSize: '11px', color: '#6b7280', display: 'block', marginBottom: '3px' }}>시스템 소개 (선택)</label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="이 카테고리의 용도를 간단히 설명하세요..."
          rows={2}
          style={{ width: '100%', padding: '5px 8px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '12px', resize: 'none', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
        />
      </div>

      {error && <div style={{ fontSize: '11px', color: '#ef4444', marginBottom: '8px' }}>{error}</div>}

      <div style={{ display: 'flex', gap: '6px' }}>
        <button
          type="submit"
          disabled={isLoading}
          style={{ flex: 1, padding: '6px', background: color, color: 'white', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.7 : 1 }}
        >
          {isLoading ? '저장 중...' : '저장'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          style={{ flex: 1, padding: '6px', background: 'white', color: '#6b7280', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}
        >
          취소
        </button>
      </div>
    </form>
  );
}
