'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

const W = 600, H = 420;
const PAD = 50;
const SPEED = 380; // px/sec
const PATH_COLORS = ['#0078D4', '#d13438', '#107c10', '#ca5010', '#744da9', '#008272'];
const MS_FONT = '"Segoe UI", -apple-system, BlinkMacSystemFont, "Malgun Gothic", sans-serif';
const ACCENT = '#ca5010';

// ── 사다리 생성 ──────────────────────────────────────────
function generateLadder(count: number, seed: number) {
  const cols = count, rows = 8;
  const lines: { r: number; c: number }[] = [];
  let rng = seed;
  function rand() { rng = (rng * 1664525 + 1013904223) & 0xffffffff; return Math.abs(rng) / 0x80000000; }
  for (let r = 0; r < rows; r++) {
    let c = 0;
    while (c < cols - 1) {
      if (rand() > 0.55) { lines.push({ r, c }); c += 2; } else c++;
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

// ── 좌표 변환 ────────────────────────────────────────────
function colX(c: number, cols: number) { return PAD + (c * (W - 2 * PAD)) / (cols - 1); }
function rowY(r: number, rows: number) { return PAD + (r * (H - 2 * PAD)) / (rows + 1); }

// {r,c} 경로 → 픽셀 좌표 배열 (r+1 offset: r=-1이 rowY(0)=상단)
function toPixels(path: { r: number; c: number }[], cols: number, rows: number) {
  return path.map(({ r, c }) => ({ x: colX(c, cols), y: rowY(r + 1, rows) }));
}

// 각 세그먼트 길이 계산
function segLengths(pts: { x: number; y: number }[]) {
  return pts.slice(1).map((p, i) => {
    const dx = p.x - pts[i].x, dy = p.y - pts[i].y;
    return Math.sqrt(dx * dx + dy * dy);
  });
}

// dist 픽셀까지 경로를 그리고 선 끝 좌표 반환
function drawPartialPath(
  ctx: CanvasRenderingContext2D,
  pts: { x: number; y: number }[],
  lens: number[],
  dist: number,
  color: string,
) {
  let tipX = pts[pts.length - 1].x, tipY = pts[pts.length - 1].y;

  ctx.save();
  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.shadowColor = color;
  ctx.shadowBlur = 6;
  ctx.moveTo(pts[0].x, pts[0].y);

  let rem = dist;
  for (let i = 0; i < lens.length; i++) {
    if (rem <= 0) break;
    if (rem >= lens[i]) {
      ctx.lineTo(pts[i + 1].x, pts[i + 1].y);
      tipX = pts[i + 1].x; tipY = pts[i + 1].y;
      rem -= lens[i];
    } else {
      const t = rem / lens[i];
      tipX = pts[i].x + (pts[i + 1].x - pts[i].x) * t;
      tipY = pts[i].y + (pts[i + 1].y - pts[i].y) * t;
      ctx.lineTo(tipX, tipY);
      rem = 0;
    }
  }
  ctx.stroke();
  ctx.restore();

  return { tipX, tipY };
}

// ── 캔버스 전체 렌더 ─────────────────────────────────────
function renderScene(
  ctx: CanvasRenderingContext2D,
  ldr: ReturnType<typeof generateLadder>,
  names: string[],
  dests: string[],
  fullPaths: { r: number; c: number }[][],
  results: number[],
  revealed: boolean[],
  animIdx: number | null,
  animDist: number,
) {
  const { cols, rows, lines } = ldr;
  ctx.clearRect(0, 0, W, H);

  // 세로선
  for (let c = 0; c < cols; c++) {
    ctx.beginPath();
    ctx.strokeStyle = '#e1dfdd';
    ctx.lineWidth = 2;
    ctx.moveTo(colX(c, cols), rowY(0, rows));
    ctx.lineTo(colX(c, cols), rowY(rows + 1, rows));
    ctx.stroke();
  }

  // 가로선 (횡목)
  lines.forEach(({ r, c }) => {
    ctx.beginPath();
    ctx.strokeStyle = '#b0adab';
    ctx.lineWidth = 2.5;
    const y = rowY(r + 1, rows);
    ctx.moveTo(colX(c, cols), y);
    ctx.lineTo(colX(c + 1, cols), y);
    ctx.stroke();
  });

  // 이름 라벨
  names.forEach((name, c) => {
    ctx.fillStyle = ACCENT;
    ctx.font = 'bold 13px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(name || `${c + 1}번`, colX(c, cols), rowY(-1, rows) + 36);
  });

  // 목적지 라벨
  dests.forEach((dest, i) => {
    ctx.fillStyle = '#323130';
    ctx.font = '12px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(dest || `${i + 1}`, colX(i, cols), rowY(rows + 1, rows) + 10);
  });

  // 이미 공개된 경로 (완전히 그림)
  revealed.forEach((rev, i) => {
    if (!rev) return;
    const pts = toPixels(fullPaths[i], cols, rows);
    const lens = segLengths(pts);
    const total = lens.reduce((a, b) => a + b, 0);
    drawPartialPath(ctx, pts, lens, total + 1, PATH_COLORS[i % PATH_COLORS.length]);
  });

  // 애니메이션 중인 경로 (부분 그림 + 발광 도트)
  if (animIdx !== null && fullPaths[animIdx]) {
    const pts = toPixels(fullPaths[animIdx], cols, rows);
    const lens = segLengths(pts);
    const color = PATH_COLORS[animIdx % PATH_COLORS.length];
    const { tipX, tipY } = drawPartialPath(ctx, pts, lens, animDist, color);

    // 바깥 글로우
    const grad = ctx.createRadialGradient(tipX, tipY, 0, tipX, tipY, 14);
    grad.addColorStop(0, color + 'cc');
    grad.addColorStop(0.5, color + '55');
    grad.addColorStop(1, color + '00');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(tipX, tipY, 14, 0, Math.PI * 2);
    ctx.fill();

    // 흰 중심 도트
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(tipX, tipY, 4.5, 0, Math.PI * 2);
    ctx.fill();

    // 색상 테두리
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }
}

// ── 컴포넌트 ─────────────────────────────────────────────
export default function LadderPage() {
  const router = useRouter();
  const [names, setNames] = useState<string[]>(['', '']);
  const [dests, setDests]  = useState<string[]>(['', '']);
  const [step, setStep]    = useState<'setup' | 'play' | 'result'>('setup');

  const [ladder,    setLadder]    = useState<ReturnType<typeof generateLadder> | null>(null);
  const [fullPaths, setFullPaths] = useState<{ r: number; c: number }[][]>([]);
  const [results,   setResults]   = useState<number[]>([]);
  const [revealed,  setRevealed]  = useState<boolean[]>([]);
  const [animating, setAnimating] = useState<number | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef    = useRef<number | null>(null);

  // RAF에서 stale closure를 피하기 위한 refs
  const ladderRef    = useRef(ladder);
  const namesRef     = useRef(names);
  const destsRef     = useRef(dests);
  const fullPathsRef = useRef(fullPaths);
  const resultsRef   = useRef(results);
  const revealedRef  = useRef(revealed);

  useEffect(() => { ladderRef.current    = ladder;    }, [ladder]);
  useEffect(() => { namesRef.current     = names;     }, [names]);
  useEffect(() => { destsRef.current     = dests;     }, [dests]);
  useEffect(() => { fullPathsRef.current = fullPaths; }, [fullPaths]);
  useEffect(() => { resultsRef.current   = results;   }, [results]);
  useEffect(() => { revealedRef.current  = revealed;  }, [revealed]);

  useEffect(() => { document.title = '사다리게임 | FuN fUn'; }, []);

  // 정적 렌더 (애니메이션 없을 때)
  useEffect(() => {
    if (!ladder || !canvasRef.current || animating !== null) return;
    const ctx = canvasRef.current.getContext('2d')!;
    renderScene(ctx, ladder, names, dests, fullPaths, results, revealed, null, 0);
  }, [ladder, names, dests, fullPaths, results, revealed, animating]);

  function buildGame() {
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    const n = names.length;
    const ld = generateLadder(n, Date.now());
    const fps: { r: number; c: number }[][] = [];
    const rs: number[] = [];
    for (let i = 0; i < n; i++) {
      const { path, result } = tracePath(ld.cols, ld.rows, ld.lines, i);
      fps.push(path);
      rs.push(result);
    }
    setLadder(ld); setFullPaths(fps); setResults(rs);
    setRevealed(new Array(n).fill(false)); setAnimating(null); setStep('play');
  }

  function handleReveal(i: number) {
    if (revealed[i] || animating !== null) return;
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }

    const ldr = ladderRef.current!;
    const pts = toPixels(fullPathsRef.current[i], ldr.cols, ldr.rows);
    const lens = segLengths(pts);
    const total = lens.reduce((a, b) => a + b, 0);

    let dist = 0;
    let lastTime = -1;
    setAnimating(i);

    function frame(now: number) {
      if (lastTime < 0) lastTime = now;
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;
      dist += SPEED * dt;

      const ctx = canvasRef.current?.getContext('2d');
      if (ctx) {
        renderScene(
          ctx,
          ladderRef.current!,
          namesRef.current,
          destsRef.current,
          fullPathsRef.current,
          resultsRef.current,
          revealedRef.current,
          i, dist,
        );
      }

      if (dist < total) {
        rafRef.current = requestAnimationFrame(frame);
      } else {
        // 애니메이션 완료
        rafRef.current = null;
        setAnimating(null);
        setRevealed(prev => {
          const next = [...prev];
          next[i] = true;
          if (next.every(Boolean)) setStep('result');
          return next;
        });
      }
    }

    rafRef.current = requestAnimationFrame(frame);
  }

  const count = names.length;

  return (
    <div style={{ position: 'fixed', inset: 0, overflowY: 'auto', background: '#f3f2f1', fontFamily: MS_FONT, color: '#323130' }}>

      {/* ── Nav ── */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 200, height: '48px', background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(20px)', borderBottom: '1px solid #edebe9', display: 'flex', alignItems: 'center', padding: '0 2rem' }}>
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
          <button onClick={() => { if (rafRef.current) cancelAnimationFrame(rafRef.current); setStep('setup'); setAnimating(null); }}
            style={{ padding: '0.35rem 0.85rem', background: 'transparent', border: '1px solid #8a8886', borderRadius: '2px', cursor: 'pointer', color: '#323130', fontSize: '0.78rem', marginRight: '0.5rem' }}
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
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#323130', marginBottom: '0.6rem' }}>참가 인원 수</div>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                {[2, 3, 4, 5, 6].map(n => (
                  <button key={n}
                    onClick={() => { setNames(Array(n).fill('')); setDests(Array(n).fill('')); }}
                    style={{ flex: 1, padding: '0.5rem', background: count === n ? '#0078D4' : 'transparent', color: count === n ? 'white' : '#323130', border: `1px solid ${count === n ? '#0078D4' : '#8a8886'}`, borderRadius: '2px', cursor: 'pointer', fontWeight: count === n ? 700 : 400, fontSize: '0.88rem', transition: 'all 0.12s' }}
                  >{n}명</button>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#605e5c', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>참가자 이름</div>
                {names.map((n, i) => (
                  <input key={i} value={n}
                    onChange={e => { const a = [...names]; a[i] = e.target.value; setNames(a); }}
                    placeholder={`참가자 ${i + 1}`}
                    style={{ width: '100%', padding: '0.45rem 0.65rem', border: '1px solid #8a8886', borderRadius: '2px', marginBottom: '0.35rem', fontSize: '0.85rem', boxSizing: 'border-box', outline: 'none' }}
                    onFocus={e => e.currentTarget.style.borderColor = ACCENT}
                    onBlur={e => e.currentTarget.style.borderColor = '#8a8886'} />
                ))}
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#605e5c', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>목적지 (결과)</div>
                {dests.map((d, i) => (
                  <input key={i} value={d}
                    onChange={e => { const a = [...dests]; a[i] = e.target.value; setDests(a); }}
                    placeholder={`결과 ${i + 1}`}
                    style={{ width: '100%', padding: '0.45rem 0.65rem', border: '1px solid #8a8886', borderRadius: '2px', marginBottom: '0.35rem', fontSize: '0.85rem', boxSizing: 'border-box', outline: 'none' }}
                    onFocus={e => e.currentTarget.style.borderColor = ACCENT}
                    onBlur={e => e.currentTarget.style.borderColor = '#8a8886'} />
                ))}
              </div>
            </div>

            <button onClick={buildGame}
              style={{ width: '100%', padding: '0.6rem', background: '#0078D4', color: 'white', border: 'none', borderRadius: '2px', fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer' }}
              onMouseEnter={e => e.currentTarget.style.background = '#106ebe'}
              onMouseLeave={e => e.currentTarget.style.background = '#0078D4'}
            >사다리 생성! 🪜</button>
          </div>
        )}

        {(step === 'play' || step === 'result') && ladder && (
          <div style={{ background: 'white', border: '1px solid #edebe9', padding: '1.5rem' }}>
            <canvas ref={canvasRef} width={W} height={H}
              style={{ width: '100%', maxWidth: W, display: 'block', margin: '0 auto', border: '1px solid #edebe9' }} />

            {/* 안내 문구 */}
            {animating !== null && (
              <div style={{ textAlign: 'center', marginTop: '0.75rem', fontSize: '0.8rem', color: ACCENT, fontWeight: 600 }}>
                🎯 {names[animating] || `${animating + 1}번`} 경로 이동 중...
              </div>
            )}

            <div style={{ marginTop: '1.25rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center' }}>
              {names.map((name, i) => (
                <button key={i}
                  onClick={() => handleReveal(i)}
                  disabled={revealed[i] || animating !== null}
                  style={{
                    padding: '0.45rem 1.1rem',
                    background: revealed[i] ? PATH_COLORS[i % PATH_COLORS.length] : animating === i ? PATH_COLORS[i % PATH_COLORS.length] + '22' : 'transparent',
                    color: revealed[i] ? 'white' : animating !== null ? '#a19f9d' : '#323130',
                    border: `1px solid ${revealed[i] ? PATH_COLORS[i % PATH_COLORS.length] : animating !== null ? '#d0cece' : '#8a8886'}`,
                    borderRadius: '2px',
                    cursor: revealed[i] || animating !== null ? 'default' : 'pointer',
                    fontWeight: 600, fontSize: '0.82rem', transition: 'all 0.12s',
                  }}
                  onMouseEnter={e => { if (!revealed[i] && animating === null) e.currentTarget.style.background = '#f3f2f1'; }}
                  onMouseLeave={e => { if (!revealed[i] && animating === null) e.currentTarget.style.background = 'transparent'; }}
                >
                  {name || `${i + 1}번`} {revealed[i] ? '→ ' + (dests[results[i]] || `결과${results[i] + 1}`) : animating !== null && animating !== i ? '' : '공개!'}
                </button>
              ))}
            </div>

            {step === 'result' && (
              <div style={{ marginTop: '1.25rem', padding: '1rem 1.25rem', background: '#f3f2f1', border: '1px solid #edebe9', borderLeft: `4px solid ${ACCENT}` }}>
                <div style={{ fontWeight: 700, color: '#323130', marginBottom: '0.6rem', fontSize: '0.88rem' }}>🎉 최종 결과</div>
                {names.map((name, i) => (
                  <div key={i} style={{ padding: '0.4rem 0.25rem', borderBottom: '1px solid #edebe9', fontSize: '0.88rem', color: '#323130', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontWeight: 700, color: PATH_COLORS[i % PATH_COLORS.length] }}>{name || `${i + 1}번`}</span>
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
