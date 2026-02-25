'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const FACES = ['⚀','⚁','⚂','⚃','⚄','⚅'];
const COLORS = ['#6366f1','#f59e0b','#10b981','#ef4444','#8b5cf6','#06b6d4'];

interface Die { value: number; rolling: boolean; color: string; }

export default function DicePage() {
  const router = useRouter();
  const [count, setCount] = useState(2);
  const [dice, setDice] = useState<Die[]>([
    { value: 1, rolling: false, color: COLORS[0] },
    { value: 1, rolling: false, color: COLORS[1] },
  ]);
  const [history, setHistory] = useState<number[]>([]);
  const [rolling, setRolling] = useState(false);

  useEffect(() => { document.title = '주사위 굴리기 | FuN fUn'; }, []);

  function updateCount(n: number) {
    setCount(n);
    setDice(Array.from({ length: n }, (_, i) => ({ value: 1, rolling: false, color: COLORS[i % COLORS.length] })));
  }

  function roll() {
    if (rolling) return;
    setRolling(true);
    setDice(prev => prev.map(d => ({ ...d, rolling: true })));

    let ticks = 0;
    const iv = setInterval(() => {
      ticks++;
      setDice(prev => prev.map(d => ({ ...d, value: Math.ceil(Math.random() * 6) })));
      if (ticks >= 12) {
        clearInterval(iv);
        const final = Array.from({ length: count }, () => Math.ceil(Math.random() * 6));
        setDice(prev => prev.map((d, i) => ({ ...d, value: final[i], rolling: false })));
        setHistory(prev => [final.reduce((a, b) => a + b, 0), ...prev].slice(0, 10));
        setRolling(false);
      }
    }, 80);
  }

  const total = dice.reduce((s, d) => s + d.value, 0);

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)', padding: '1.5rem 1rem' }}>
      <div style={{ maxWidth: '480px', margin: '0 auto' }}>
        <button onClick={() => router.push('/fun')} style={{ marginBottom: '1.5rem', padding: '0.5rem 1rem', background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', color: '#374151' }}>
          ← FuN fUn 홈
        </button>

        <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', marginBottom: '1.25rem', boxShadow: '0 4px 16px rgba(99,102,241,0.15)' }}>
          <h1 style={{ margin: '0 0 0.25rem 0', fontSize: '1.5rem', fontWeight: 900, color: '#4338ca' }}>🎲 주사위 굴리기</h1>
          <p style={{ margin: 0, color: '#6b7280', fontSize: '0.88rem' }}>공정한 결정을 위한 주사위!</p>
        </div>

        {/* 주사위 수 선택 */}
        <div style={{ background: 'white', borderRadius: '12px', padding: '1rem 1.25rem', marginBottom: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#374151', marginBottom: '0.5rem' }}>주사위 수</div>
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            {[1,2,3,4,5,6].map(n => (
              <button key={n} onClick={() => updateCount(n)}
                style={{ flex: 1, padding: '0.45rem', background: count === n ? '#6366f1' : '#f3f4f6', color: count === n ? 'white' : '#374151', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: count === n ? 800 : 400, fontSize: '0.9rem' }}>
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* 주사위 표시 */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '2rem 1.5rem', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
            {dice.map((d, i) => (
              <div key={i} style={{
                width: '80px', height: '80px', borderRadius: '16px',
                background: d.color + '18', border: `3px solid ${d.color}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '3rem',
                transition: d.rolling ? 'none' : 'all 0.2s',
                transform: d.rolling ? `rotate(${Math.random() * 30 - 15}deg) scale(1.05)` : 'rotate(0deg) scale(1)',
                boxShadow: d.rolling ? `0 8px 24px ${d.color}44` : `0 2px 8px ${d.color}22`,
              }}>
                {FACES[d.value - 1]}
              </div>
            ))}
          </div>

          {count > 1 && (
            <div style={{ fontSize: '1rem', color: '#6b7280', marginBottom: '1rem' }}>
              합계: <strong style={{ fontSize: '1.5rem', color: '#4338ca' }}>{total}</strong>
              <span style={{ fontSize: '0.78rem', color: '#9ca3af', marginLeft: '0.4rem' }}>(평균 {(total / count).toFixed(1)})</span>
            </div>
          )}

          <button onClick={roll} disabled={rolling}
            style={{ padding: '0.85rem 3rem', background: rolling ? '#9ca3af' : 'linear-gradient(90deg, #6366f1, #8b5cf6)', color: 'white', border: 'none', borderRadius: '25px', fontSize: '1.1rem', fontWeight: 800, cursor: rolling ? 'not-allowed' : 'pointer', boxShadow: rolling ? 'none' : '0 4px 16px rgba(99,102,241,0.4)' }}>
            {rolling ? '굴리는 중... 🎲' : '굴리기! 🎲'}
          </button>
        </div>

        {/* 기록 */}
        {history.length > 0 && (
          <div style={{ background: 'white', borderRadius: '12px', padding: '1rem 1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#374151', marginBottom: '0.5rem' }}>최근 합계 기록</div>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {history.map((h, i) => (
                <span key={i} style={{ padding: '0.25rem 0.6rem', background: i === 0 ? '#eef2ff' : '#f3f4f6', color: i === 0 ? '#4338ca' : '#6b7280', borderRadius: '20px', fontSize: '0.82rem', fontWeight: i === 0 ? 700 : 400, border: i === 0 ? '1px solid #6366f1' : '1px solid #e5e7eb' }}>
                  {h}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
