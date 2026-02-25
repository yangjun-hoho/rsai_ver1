'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

const DEFAULT_ITEMS = ['한식 🍚', '중식 🥟', '일식 🍣', '양식 🍝', '분식 🍜', '패스트푸드 🍔'];
const COLORS = ['#ef4444','#f97316','#f59e0b','#10b981','#3b82f6','#8b5cf6','#ec4899','#06b6d4'];

export default function LunchPage() {
  const router = useRouter();
  const [items, setItems] = useState(DEFAULT_ITEMS);
  const [newItem, setNewItem] = useState('');
  const [spinning, setSpinning] = useState(false);
  const [angle, setAngle] = useState(0);
  const [result, setResult] = useState<string | null>(null);
  const spinRef = useRef<number>(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => { document.title = '점심메뉴 결정기 | FuN fUn'; }, []);

  const SIZE = 300;
  const CX = SIZE / 2, CY = SIZE / 2, R = SIZE / 2 - 8;

  function drawWheel(ang: number) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const n = items.length;
    const slice = (2 * Math.PI) / n;
    ctx.clearRect(0, 0, SIZE, SIZE);

    items.forEach((item, i) => {
      const start = ang + i * slice;
      const end = start + slice;
      ctx.beginPath();
      ctx.moveTo(CX, CY);
      ctx.arc(CX, CY, R, start, end);
      ctx.closePath();
      ctx.fillStyle = COLORS[i % COLORS.length];
      ctx.fill();
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.save();
      ctx.translate(CX, CY);
      ctx.rotate(start + slice / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = 'white';
      ctx.font = `bold ${n > 6 ? 11 : 13}px sans-serif`;
      ctx.shadowColor = 'rgba(0,0,0,0.3)';
      ctx.shadowBlur = 4;
      ctx.fillText(item, R - 12, 5);
      ctx.restore();
    });

    // 중앙 원
    ctx.beginPath();
    ctx.arc(CX, CY, 24, 0, 2 * Math.PI);
    ctx.fillStyle = 'white';
    ctx.fill();
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#374151';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.shadowBlur = 0;
    ctx.fillText('SPIN', CX, CY + 4);
  }

  useEffect(() => { drawWheel(angle); }, [items, angle]);

  function spin() {
    if (spinning || items.length < 2) return;
    setResult(null);
    setSpinning(true);
    const extraSpins = (5 + Math.random() * 5) * 2 * Math.PI;
    const randStop = Math.random() * 2 * Math.PI;
    const totalAngle = extraSpins + randStop;
    const duration = 3500;
    const start = performance.now();
    const startAngle = angle;

    function animate(now: number) {
      const elapsed = now - start;
      const t = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - t, 4);
      const cur = startAngle + totalAngle * ease;
      spinRef.current = cur;
      drawWheel(cur);

      if (t < 1) {
        requestAnimationFrame(animate);
      } else {
        setAngle(cur % (2 * Math.PI));
        setSpinning(false);
        // 어떤 항목에 멈췄는지 계산 (포인터는 오른쪽 90도 = -PI/2)
        const n = items.length;
        const slice = (2 * Math.PI) / n;
        const normalised = ((- cur % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
        const idx = Math.floor(normalised / slice) % n;
        setResult(items[idx]);
      }
    }
    requestAnimationFrame(animate);
  }

  function addItem() {
    const t = newItem.trim();
    if (!t || items.length >= 8) return;
    setItems([...items, t]);
    setNewItem('');
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)', padding: '1.5rem 1rem' }}>
      <div style={{ maxWidth: '520px', margin: '0 auto' }}>
        <button onClick={() => router.push('/fun')} style={{ marginBottom: '1.5rem', padding: '0.5rem 1rem', background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', color: '#374151' }}>
          ← FuN fUn 홈
        </button>

        <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 4px 16px rgba(16,185,129,0.15)' }}>
          <h1 style={{ margin: '0 0 0.25rem 0', fontSize: '1.5rem', fontWeight: 900, color: '#065f46' }}>🍱 점심메뉴 결정기</h1>
          <p style={{ margin: 0, color: '#6b7280', fontSize: '0.88rem' }}>오늘 뭐 먹을지 룰렛이 결정해드립니다!</p>
        </div>

        {/* 룰렛 */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '2rem 1.5rem', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: '1rem' }}>
          <div style={{ position: 'relative', display: 'inline-block' }}>
            {/* 포인터 */}
            <div style={{ position: 'absolute', right: '-12px', top: '50%', transform: 'translateY(-50%)', width: 0, height: 0, borderTop: '12px solid transparent', borderBottom: '12px solid transparent', borderRight: '20px solid #374151', zIndex: 10 }} />
            <canvas ref={canvasRef} width={SIZE} height={SIZE} onClick={spin} style={{ cursor: spinning ? 'not-allowed' : 'pointer', borderRadius: '50%', boxShadow: '0 4px 24px rgba(0,0,0,0.15)' }} />
          </div>

          <button onClick={spin} disabled={spinning || items.length < 2}
            style={{ marginTop: '1.5rem', padding: '0.75rem 2.5rem', background: spinning ? '#9ca3af' : 'linear-gradient(90deg, #10b981, #059669)', color: 'white', border: 'none', borderRadius: '25px', fontSize: '1rem', fontWeight: 800, cursor: spinning ? 'not-allowed' : 'pointer', boxShadow: spinning ? 'none' : '0 4px 12px rgba(16,185,129,0.4)' }}>
            {spinning ? '돌아가는 중...' : '🎰 돌리기!'}
          </button>

          {result && !spinning && (
            <div style={{ marginTop: '1.25rem', padding: '1rem 1.5rem', background: '#ecfdf5', border: '2px solid #10b981', borderRadius: '12px' }}>
              <div style={{ fontSize: '0.78rem', color: '#065f46', fontWeight: 700, marginBottom: '0.25rem' }}>오늘 점심은...</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#047857' }}>{result}</div>
            </div>
          )}
        </div>

        {/* 항목 관리 */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#374151', marginBottom: '0.75rem' }}>메뉴 목록 관리 (최대 8개)</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.75rem' }}>
            {items.map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.3rem 0.5rem 0.3rem 0.75rem', background: COLORS[i % COLORS.length] + '22', border: `1px solid ${COLORS[i % COLORS.length]}44`, borderRadius: '20px', fontSize: '0.82rem', color: '#374151' }}>
                {item}
                <button onClick={() => setItems(items.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: '0.9rem', padding: '0 2px', lineHeight: 1 }}>✕</button>
              </div>
            ))}
          </div>
          {items.length < 8 && (
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <input value={newItem} onChange={e => setNewItem(e.target.value)} onKeyDown={e => e.key === 'Enter' && addItem()}
                placeholder="새 메뉴 추가"
                style={{ flex: 1, padding: '0.5rem 0.75rem', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '0.88rem' }} />
              <button onClick={addItem} style={{ padding: '0.5rem 0.9rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 700 }}>+</button>
            </div>
          )}
          <button onClick={() => setItems(DEFAULT_ITEMS)} style={{ marginTop: '0.5rem', width: '100%', padding: '0.4rem', background: '#f9fafb', color: '#6b7280', border: '1px solid #e5e7eb', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}>
            기본값으로 초기화
          </button>
        </div>
      </div>
    </div>
  );
}
