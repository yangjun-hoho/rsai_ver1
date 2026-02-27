'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const FACES = ['⚀','⚁','⚂','⚃','⚄','⚅'];
const COLORS = ['#0078D4','#d13438','#107c10','#ca5010','#744da9','#008272'];

const MS_FONT = '"Segoe UI", -apple-system, BlinkMacSystemFont, "Malgun Gothic", sans-serif';

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
    <div style={{ position: 'fixed', inset: 0, overflowY: 'auto', background: '#f3f2f1', fontFamily: MS_FONT, color: '#323130' }}>

      {/* ── Nav ── */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 200, height: '48px', background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(20px)', borderBottom: '1px solid #edebe9', display: 'flex', alignItems: 'center', padding: '0 2rem', gap: '0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flex: 1, cursor: 'pointer' }} onClick={() => router.push('/fun')}>
          <svg width="14" height="14" viewBox="0 0 23 23" fill="none" style={{ flexShrink: 0 }}>
            <rect x="0" y="0" width="10" height="10" fill="#f25022"/><rect x="12" y="0" width="10" height="10" fill="#7fba00"/>
            <rect x="0" y="12" width="10" height="10" fill="#00a4ef"/><rect x="12" y="12" width="10" height="10" fill="#ffb900"/>
          </svg>
          <span style={{ color: '#0078D4', fontSize: '0.82rem', fontWeight: 600 }}>FuN fUn</span>
          <span style={{ color: '#a19f9d', fontSize: '0.82rem', margin: '0 0.2rem' }}>›</span>
          <span style={{ color: '#323130', fontSize: '0.82rem', fontWeight: 600 }}>주사위 굴리기</span>
        </div>
        <button onClick={() => router.push('/')} style={{ padding: '0.35rem 0.85rem', background: 'transparent', border: '1px solid #8a8886', borderRadius: '2px', cursor: 'pointer', color: '#323130', fontSize: '0.78rem' }}
          onMouseEnter={e => e.currentTarget.style.background = '#f3f2f1'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>메인 채팅</button>
      </nav>

      {/* ── Hero ── */}
      <div style={{ background: 'linear-gradient(135deg, #003966 0%, #0078D4 100%)', padding: '1rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', textAlign: 'center' }}>
        <div style={{ fontSize: '1.75rem', filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.3))' }}>🎲</div>
        <div>
          <p style={{ color: '#a8d4f5', fontSize: '0.62rem', letterSpacing: '1.5px', textTransform: 'uppercase', margin: '0 0 0.15rem', fontWeight: 600 }}>랜덤 · 주사위</p>
          <h1 style={{ color: 'white', fontSize: '1.1rem', fontWeight: 700, margin: '0 0 0.1rem', letterSpacing: '-0.3px' }}>주사위 굴리기</h1>
          <p style={{ color: '#c7e3f7', margin: 0, fontSize: '0.72rem' }}>공정한 결정을 위한 주사위!</p>
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{ padding: '1.5rem 2rem 3rem', maxWidth: '560px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1px' }}>

        {/* 주사위 수 선택 */}
        <div style={{ background: 'white', border: '1px solid #edebe9', padding: '1rem 1.25rem' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#323130', marginBottom: '0.6rem' }}>주사위 수</div>
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            {[1,2,3,4,5,6].map(n => (
              <button
                key={n}
                onClick={() => updateCount(n)}
                style={{
                  flex: 1, padding: '0.45rem',
                  background: count === n ? '#0078D4' : 'transparent',
                  color: count === n ? 'white' : '#323130',
                  border: `1px solid ${count === n ? '#0078D4' : '#8a8886'}`,
                  borderRadius: '2px',
                  cursor: 'pointer', fontWeight: count === n ? 700 : 400,
                  fontSize: '0.88rem', transition: 'all 0.12s',
                }}
              >{n}</button>
            ))}
          </div>
        </div>

        {/* 주사위 표시 */}
        <div style={{ background: 'white', border: '1px solid #edebe9', padding: '2rem 1.5rem', textAlign: 'center' }}>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '1.75rem' }}>
            {dice.map((d, i) => (
              <div key={i} style={{
                width: '84px', height: '84px',
                border: `2px solid ${d.color}`,
                borderTop: `4px solid ${d.color}`,
                background: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '3rem',
                transition: d.rolling ? 'none' : 'all 0.25s',
                transform: d.rolling ? `rotate(${Math.random() * 30 - 15}deg) scale(1.05)` : 'rotate(0deg) scale(1)',
                boxShadow: d.rolling ? `0 4px 16px ${d.color}40` : `0 2px 8px ${d.color}20`,
              }}>
                {FACES[d.value - 1]}
              </div>
            ))}
          </div>

          {count > 1 && (
            <div style={{
              display: 'inline-flex', alignItems: 'baseline', gap: '0.5rem',
              padding: '0.45rem 1.25rem',
              background: '#f3f2f1', border: '1px solid #edebe9',
              marginBottom: '1.25rem',
            }}>
              <span style={{ fontSize: '0.78rem', color: '#605e5c' }}>합계</span>
              <strong style={{ fontSize: '1.75rem', color: '#0078D4', fontWeight: 900 }}>{total}</strong>
              <span style={{ fontSize: '0.72rem', color: '#605e5c' }}>평균 {(total / count).toFixed(1)}</span>
            </div>
          )}

          <div>
            <button
              onClick={roll}
              disabled={rolling}
              style={{
                padding: '0.55rem 2rem',
                background: rolling ? '#f3f2f1' : '#0078D4',
                color: rolling ? '#a19f9d' : 'white',
                border: `1px solid ${rolling ? '#edebe9' : '#0078D4'}`,
                borderRadius: '2px',
                fontSize: '0.88rem', fontWeight: 600,
                cursor: rolling ? 'not-allowed' : 'pointer',
                transition: 'all 0.12s',
              }}
              onMouseEnter={e => { if (!rolling) e.currentTarget.style.background = '#106ebe'; }}
              onMouseLeave={e => { if (!rolling) e.currentTarget.style.background = '#0078D4'; }}
            >
              {rolling ? '굴리는 중... 🎲' : '굴리기! 🎲'}
            </button>
          </div>
        </div>

        {/* 기록 */}
        {history.length > 0 && (
          <div style={{ background: 'white', border: '1px solid #edebe9', padding: '1rem 1.25rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#323130', marginBottom: '0.6rem' }}>최근 합계 기록</div>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {history.map((h, i) => (
                <span key={i} style={{
                  padding: '0.25rem 0.65rem',
                  background: i === 0 ? '#0078D4' : '#f3f2f1',
                  color: i === 0 ? 'white' : '#605e5c',
                  fontSize: '0.82rem',
                  fontWeight: i === 0 ? 700 : 400,
                  border: `1px solid ${i === 0 ? '#0078D4' : '#edebe9'}`,
                }}>
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
