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

const MS_FONT = '"Segoe UI", -apple-system, BlinkMacSystemFont, "Malgun Gothic", sans-serif';
const ACCENT = '#ca5010';

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

    for (let c = 0; c < cols; c++) {
      ctx.beginPath();
      ctx.strokeStyle = '#edebe9';
      ctx.lineWidth = 2;
      ctx.moveTo(colX(c, cols), rowY(0, rows));
      ctx.lineTo(colX(c, cols), rowY(rows + 1, rows));
      ctx.stroke();
    }
    lines.forEach(({ r, c }) => {
      ctx.beginPath();
      ctx.strokeStyle = '#a19f9d';
      ctx.lineWidth = 2.5;
      const y = rowY(r + 1, rows);
      ctx.moveTo(colX(c, cols), y);
      ctx.lineTo(colX(c + 1, cols), y);
      ctx.stroke();
    });
    names.forEach((name, c) => {
      ctx.fillStyle = ACCENT;
      ctx.font = 'bold 13px "Segoe UI", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(name || `${c + 1}번`, colX(c, cols), rowY(-1, rows) + 36);
    });
    dests.forEach((dest, i) => {
      ctx.fillStyle = '#323130';
      ctx.font = '12px "Segoe UI", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(dest || `${i + 1}`, colX(i, cols), rowY(rows + 1, rows) + 10);
    });

    const PATH_COLORS = ['#0078D4','#d13438','#107c10','#ca5010','#744da9','#008272'];
    revealed.forEach((rev, i) => {
      if (!rev) return;
      const path = paths[i];
      ctx.beginPath();
      ctx.strokeStyle = PATH_COLORS[i % PATH_COLORS.length];
      ctx.lineWidth = 4;
      let prevC = path[0];
      ctx.moveTo(colX(prevC, cols), rowY(0, rows));
      path.forEach((c, idx) => {
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
  const PATH_COLORS = ['#0078D4','#d13438','#107c10','#ca5010','#744da9','#008272'];

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
          <span style={{ color: '#323130', fontSize: '0.82rem', fontWeight: 600 }}>사다리 게임</span>
        </div>
        {step !== 'setup' && (
          <button onClick={() => setStep('setup')} style={{ padding: '0.35rem 0.85rem', background: 'transparent', border: '1px solid #8a8886', borderRadius: '2px', cursor: 'pointer', color: '#323130', fontSize: '0.78rem', marginRight: '0.5rem' }}
            onMouseEnter={e => e.currentTarget.style.background = '#f3f2f1'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>다시 설정</button>
        )}
        <button onClick={() => router.push('/')} style={{ padding: '0.35rem 0.85rem', background: 'transparent', border: '1px solid #8a8886', borderRadius: '2px', cursor: 'pointer', color: '#323130', fontSize: '0.78rem' }}
          onMouseEnter={e => e.currentTarget.style.background = '#f3f2f1'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>메인 채팅</button>
      </nav>

      {/* ── Hero ── */}
      <div style={{ background: 'linear-gradient(135deg, #3d1a00 0%, #ca5010 100%)', padding: '1rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', textAlign: 'center' }}>
        <div style={{ fontSize: '1.75rem', filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.3))' }}>🪜</div>
        <div>
          <p style={{ color: '#fed7aa', fontSize: '0.62rem', letterSpacing: '1.5px', textTransform: 'uppercase', margin: '0 0 0.15rem', fontWeight: 600 }}>랜덤 · 사다리게임</p>
          <h1 style={{ color: 'white', fontSize: '1.1rem', fontWeight: 700, margin: '0 0 0.1rem', letterSpacing: '-0.3px' }}>사다리 게임</h1>
          <p style={{ color: '#fdba74', margin: 0, fontSize: '0.72rem' }}>오늘 당번 공정하게 결정!</p>
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{ padding: '1.5rem 2rem 3rem', maxWidth: '720px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1px' }}>

        {step === 'setup' && (
          <div style={{ background: 'white', border: '1px solid #edebe9', padding: '1.75rem 1.5rem' }}>
            {/* 인원 수 */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#323130', marginBottom: '0.6rem' }}>참가 인원 수</div>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                {[2, 3, 4, 5, 6].map(n => (
                  <button
                    key={n}
                    onClick={() => { setNames(Array(n).fill('')); setDests(Array(n).fill('')); }}
                    style={{
                      flex: 1, padding: '0.5rem',
                      background: count === n ? '#0078D4' : 'transparent',
                      color: count === n ? 'white' : '#323130',
                      border: `1px solid ${count === n ? '#0078D4' : '#8a8886'}`,
                      borderRadius: '2px',
                      cursor: 'pointer', fontWeight: count === n ? 700 : 400,
                      fontSize: '0.88rem', transition: 'all 0.12s',
                    }}
                  >{n}명</button>
                ))}
              </div>
            </div>

            {/* 이름 / 목적지 입력 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#605e5c', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>참가자 이름</div>
                {names.map((n, i) => (
                  <input
                    key={i} value={n}
                    onChange={e => { const a = [...names]; a[i] = e.target.value; setNames(a); }}
                    placeholder={`참가자 ${i + 1}`}
                    style={{ width: '100%', padding: '0.45rem 0.65rem', border: '1px solid #8a8886', borderRadius: '2px', marginBottom: '0.35rem', fontSize: '0.85rem', boxSizing: 'border-box', outline: 'none', transition: 'border-color 0.12s' }}
                    onFocus={e => e.currentTarget.style.borderColor = ACCENT}
                    onBlur={e => e.currentTarget.style.borderColor = '#8a8886'}
                  />
                ))}
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#605e5c', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>목적지 (결과)</div>
                {dests.map((d, i) => (
                  <input
                    key={i} value={d}
                    onChange={e => { const a = [...dests]; a[i] = e.target.value; setDests(a); }}
                    placeholder={`결과 ${i + 1}`}
                    style={{ width: '100%', padding: '0.45rem 0.65rem', border: '1px solid #8a8886', borderRadius: '2px', marginBottom: '0.35rem', fontSize: '0.85rem', boxSizing: 'border-box', outline: 'none', transition: 'border-color 0.12s' }}
                    onFocus={e => e.currentTarget.style.borderColor = ACCENT}
                    onBlur={e => e.currentTarget.style.borderColor = '#8a8886'}
                  />
                ))}
              </div>
            </div>

            <button
              onClick={buildGame}
              style={{ width: '100%', padding: '0.6rem', background: '#0078D4', color: 'white', border: 'none', borderRadius: '2px', fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer' }}
              onMouseEnter={e => e.currentTarget.style.background = '#106ebe'}
              onMouseLeave={e => e.currentTarget.style.background = '#0078D4'}
            >사다리 생성! 🪜</button>
          </div>
        )}

        {(step === 'play' || step === 'result') && ladder && (
          <div style={{ background: 'white', border: '1px solid #edebe9', padding: '1.5rem' }}>
            <canvas
              ref={canvasRef} width={W} height={H}
              style={{ width: '100%', maxWidth: W, display: 'block', margin: '0 auto', border: '1px solid #edebe9' }}
            />

            <div style={{ marginTop: '1.25rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center' }}>
              {names.map((name, i) => (
                <button
                  key={i}
                  onClick={() => {
                    const next = [...revealed];
                    next[i] = true;
                    setRevealed(next);
                    if (next.every(Boolean)) setStep('result');
                  }}
                  disabled={revealed[i]}
                  style={{
                    padding: '0.45rem 1.1rem',
                    background: revealed[i] ? PATH_COLORS[i % PATH_COLORS.length] : 'transparent',
                    color: revealed[i] ? 'white' : '#323130',
                    border: `1px solid ${revealed[i] ? PATH_COLORS[i % PATH_COLORS.length] : '#8a8886'}`,
                    borderRadius: '2px',
                    cursor: revealed[i] ? 'default' : 'pointer',
                    fontWeight: 600, fontSize: '0.82rem',
                    transition: 'all 0.12s',
                  }}
                  onMouseEnter={e => { if (!revealed[i]) e.currentTarget.style.background = '#f3f2f1'; }}
                  onMouseLeave={e => { if (!revealed[i]) e.currentTarget.style.background = 'transparent'; }}
                >
                  {name || `${i + 1}번`} {revealed[i] ? '→ ' + (dests[results[i]] || `결과${results[i] + 1}`) : '공개!'}
                </button>
              ))}
            </div>

            {step === 'result' && (
              <div style={{ marginTop: '1.25rem', padding: '1rem 1.25rem', background: '#f3f2f1', border: '1px solid #edebe9', borderLeft: `4px solid ${ACCENT}` }}>
                <div style={{ fontWeight: 700, color: '#323130', marginBottom: '0.6rem', fontSize: '0.88rem' }}>🎉 최종 결과</div>
                {names.map((name, i) => (
                  <div key={i} style={{
                    padding: '0.4rem 0.25rem',
                    borderBottom: '1px solid #edebe9',
                    fontSize: '0.88rem', color: '#323130',
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                  }}>
                    <span style={{ fontWeight: 700 }}>{name || `${i + 1}번`}</span>
                    <span style={{ color: '#a19f9d' }}>→</span>
                    <span style={{ color: ACCENT, fontWeight: 700 }}>{dests[results[i]] || `결과 ${results[i] + 1}`}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
