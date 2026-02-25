'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

const W = 600, H = 420;
const PAD = 50;

function generateLadder(count: number, seed: number) {
  const cols = count;
  const rows = 8;
  const lines: { r: number; c: number }[] = [];
  let rng = seed;
  function rand() { rng = (rng * 1664525 + 1013904223) & 0xffffffff; return Math.abs(rng) / 0x80000000; }
  for (let r = 0; r < rows; r++) {
    let c = 0;
    while (c < cols - 1) {
      if (rand() > 0.55) { lines.push({ r, c }); c += 2; }
      else c++;
    }
  }
  return { cols, rows, lines };
}

function tracePath(cols: number, rows: number, lines: { r: number; c: number }[], start: number) {
  let c = start;
  const path: { r: number; c: number }[] = [{ r: -1, c }];
  for (let r = 0; r < rows; r++) {
    path.push({ r, c });
    const goRight = lines.find(l => l.r === r && l.c === c);
    const goLeft  = lines.find(l => l.r === r && l.c === c - 1);
    if (goRight) { c++; path.push({ r, c }); }
    else if (goLeft) { c--; path.push({ r, c }); }
  }
  path.push({ r: rows, c });
  return { path, result: c };
}

export default function LadderPage() {
  const router = useRouter();
  const [names, setNames] = useState<string[]>(['', '']);
  const [dests, setDests] = useState<string[]>(['', '']);
  const [step, setStep] = useState<'setup' | 'play' | 'result'>('setup');
  const [ladder, setLadder] = useState<ReturnType<typeof generateLadder> | null>(null);
  const [paths, setPaths] = useState<number[][]>([]);
  const [revealed, setRevealed] = useState<boolean[]>([]);
  const [results, setResults] = useState<number[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => { document.title = '사다리게임 | FuN fUn'; }, []);

  function colX(c: number, cols: number) { return PAD + (c * (W - 2 * PAD)) / (cols - 1); }
  function rowY(r: number, rows: number) { return PAD + (r * (H - 2 * PAD)) / (rows + 1); }

  function buildGame() {
    const n = names.length;
    const ld = generateLadder(n, Date.now());
    const ps: number[][] = [];
    const rs: number[] = [];
    for (let i = 0; i < n; i++) {
      const { path, result } = tracePath(ld.cols, ld.rows, ld.lines, i);
      ps.push(path.map(p => p.c));
      rs.push(result);
    }
    setLadder(ld);
    setPaths(ps);
    setResults(rs);
    setRevealed(new Array(n).fill(false));
    setStep('play');
  }

  useEffect(() => {
    if (!ladder || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d')!;
    const { cols, rows, lines } = ladder;
    ctx.clearRect(0, 0, W, H);

    // 세로선
    for (let c = 0; c < cols; c++) {
      ctx.beginPath();
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 2;
      ctx.moveTo(colX(c, cols), rowY(0, rows));
      ctx.lineTo(colX(c, cols), rowY(rows + 1, rows));
      ctx.stroke();
    }
    // 가로 연결선
    lines.forEach(({ r, c }) => {
      ctx.beginPath();
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2.5;
      const y = rowY(r + 1, rows);
      ctx.moveTo(colX(c, cols), y);
      ctx.lineTo(colX(c + 1, cols), y);
      ctx.stroke();
    });
    // 상단 이름
    names.forEach((name, c) => {
      ctx.fillStyle = '#4338ca';
      ctx.font = 'bold 13px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(name || `${c + 1}번`, colX(c, cols), rowY(-1, rows) + 36);
    });
    // 하단 목적지 (공개된 것만)
    dests.forEach((dest, i) => {
      const destCol = results.indexOf(i) >= 0 ? i : i; // 목적지는 위치 그대로
      ctx.fillStyle = '#374151';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(dest || `${i + 1}`, colX(i, cols), rowY(rows + 1, rows) + 10);
    });

    // 공개된 경로 그리기
    revealed.forEach((rev, i) => {
      if (!rev) return;
      const path = paths[i];
      ctx.beginPath();
      ctx.strokeStyle = `hsl(${i * 60 + 200}, 80%, 50%)`;
      ctx.lineWidth = 4;
      let prevC = path[0];
      ctx.moveTo(colX(prevC, cols), rowY(0, rows));
      path.forEach((c, idx) => {
        const r = idx; // row index in path = idx
        if (idx === 0) return;
        const y = rowY(idx - 1, rows);
        if (c !== prevC) {
          ctx.lineTo(colX(c, cols), y);
        } else {
          ctx.lineTo(colX(c, cols), rowY(idx, rows));
        }
        prevC = c;
      });
      ctx.lineTo(colX(results[i], cols), rowY(rows + 1, rows));
      ctx.stroke();
    });
  }, [ladder, revealed, names, dests, paths, results]);

  const count = names.length;

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)', padding: '1.5rem 1rem' }}>
      <div style={{ maxWidth: '680px', margin: '0 auto' }}>
        <button onClick={() => { setStep('setup'); router.push('/fun'); }} style={{ marginBottom: '1.5rem', padding: '0.5rem 1rem', background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', color: '#374151' }}>
          ← FuN fUn 홈
        </button>

        <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 4px 16px rgba(245,158,11,0.15)' }}>
          <h1 style={{ margin: '0 0 0.25rem 0', fontSize: '1.5rem', fontWeight: 900, color: '#b45309' }}>🪜 사다리 게임</h1>
          <p style={{ margin: 0, color: '#6b7280', fontSize: '0.88rem' }}>오늘 당번 공정하게 결정!</p>
        </div>

        {step === 'setup' && (
          <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
              {[2, 3, 4, 5, 6].map(n => (
                <button key={n} onClick={() => { setNames(Array(n).fill('')); setDests(Array(n).fill('')); }}
                  style={{ flex: 1, padding: '0.5rem', background: count === n ? '#f59e0b' : '#f3f4f6', color: count === n ? 'white' : '#374151', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: count === n ? 700 : 400, fontSize: '0.9rem' }}>{n}명</button>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#6b7280', marginBottom: '0.5rem' }}>참가자 이름</div>
                {names.map((n, i) => (
                  <input key={i} value={n} onChange={e => { const a = [...names]; a[i] = e.target.value; setNames(a); }}
                    placeholder={`참가자 ${i + 1}`}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #e5e7eb', borderRadius: '6px', marginBottom: '0.4rem', fontSize: '0.88rem', boxSizing: 'border-box' }} />
                ))}
              </div>
              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#6b7280', marginBottom: '0.5rem' }}>목적지 (결과)</div>
                {dests.map((d, i) => (
                  <input key={i} value={d} onChange={e => { const a = [...dests]; a[i] = e.target.value; setDests(a); }}
                    placeholder={`결과 ${i + 1}`}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #e5e7eb', borderRadius: '6px', marginBottom: '0.4rem', fontSize: '0.88rem', boxSizing: 'border-box' }} />
                ))}
              </div>
            </div>
            <button onClick={buildGame}
              style={{ width: '100%', padding: '0.85rem', background: 'linear-gradient(90deg, #f59e0b, #f97316)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '1rem', fontWeight: 800, cursor: 'pointer' }}>
              사다리 생성! 🪜
            </button>
          </div>
        )}

        {(step === 'play' || step === 'result') && ladder && (
          <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <canvas ref={canvasRef} width={W} height={H} style={{ width: '100%', maxWidth: W, display: 'block', margin: '0 auto' }} />

            <div style={{ marginTop: '1rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center' }}>
              {names.map((name, i) => (
                <button key={i}
                  onClick={() => {
                    const next = [...revealed];
                    next[i] = true;
                    setRevealed(next);
                    if (next.every(Boolean)) setStep('result');
                  }}
                  disabled={revealed[i]}
                  style={{ padding: '0.5rem 1.25rem', background: revealed[i] ? `hsl(${i * 60 + 200}, 80%, 50%)` : '#f3f4f6', color: revealed[i] ? 'white' : '#374151', border: 'none', borderRadius: '20px', cursor: revealed[i] ? 'default' : 'pointer', fontWeight: 700, fontSize: '0.88rem' }}>
                  {name || `${i + 1}번`} {revealed[i] ? '→ ' + (dests[results[i]] || `결과${results[i] + 1}`) : '공개!'}
                </button>
              ))}
            </div>

            {step === 'result' && (
              <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '10px' }}>
                <div style={{ fontWeight: 800, color: '#92400e', marginBottom: '0.5rem' }}>🎉 결과</div>
                {names.map((name, i) => (
                  <div key={i} style={{ padding: '0.4rem 0', borderBottom: '1px solid #fef3c7', fontSize: '0.9rem', color: '#374151' }}>
                    <strong>{name || `${i + 1}번`}</strong> → <span style={{ color: '#b45309', fontWeight: 700 }}>{dests[results[i]] || `결과 ${results[i] + 1}`}</span>
                  </div>
                ))}
              </div>
            )}

            <button onClick={() => setStep('setup')} style={{ width: '100%', marginTop: '1rem', padding: '0.7rem', background: '#fef3c7', color: '#92400e', border: '2px solid #f59e0b', borderRadius: '10px', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer' }}>
              다시 하기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
