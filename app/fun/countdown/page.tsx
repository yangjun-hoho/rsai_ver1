'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

function getMessages(pct: number): { emoji: string; msg: string } {
  if (pct >= 100) return { emoji: '🎉', msg: '퇴근이다!! 어서 짐 싸세요!!' };
  if (pct >= 90)  return { emoji: '🏃', msg: '거의 다 왔어요! 마지막 스퍼트!' };
  if (pct >= 75)  return { emoji: '😤', msg: '4분의 3 돌파! 끝이 보입니다!' };
  if (pct >= 50)  return { emoji: '😊', msg: '반환점 돌파! 이제 내리막이에요~' };
  if (pct >= 25)  return { emoji: '☕', msg: '커피 한 잔 마시며 버텨봐요!' };
  if (pct >= 10)  return { emoji: '😑', msg: '아직 한참 남았어요... 파이팅!' };
  return { emoji: '😴', msg: '이제 막 시작했네요... 긴 하루의 시작...' };
}

export default function CountdownPage() {
  const router = useRouter();
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('18:00');
  const [now, setNow] = useState(new Date());
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => { document.title = '퇴근 카운트다운 | FuN fUn'; }, []);

  useEffect(() => {
    timerRef.current = setInterval(() => setNow(new Date()), 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  function parseTime(t: string, base: Date) {
    const [h, m] = t.split(':').map(Number);
    const d = new Date(base);
    d.setHours(h, m, 0, 0);
    return d;
  }

  const start = parseTime(startTime, now);
  const end = parseTime(endTime, now);
  const totalMs = end.getTime() - start.getTime();
  const elapsedMs = now.getTime() - start.getTime();
  const remainMs = Math.max(0, end.getTime() - now.getTime());

  const pct = totalMs > 0 ? Math.min(100, Math.max(0, (elapsedMs / totalMs) * 100)) : 0;
  const { emoji, msg } = getMessages(pct);

  const hh = Math.floor(remainMs / 3600000);
  const mm = Math.floor((remainMs % 3600000) / 60000);
  const ss = Math.floor((remainMs % 60000) / 1000);
  const fmt = (n: number) => String(n).padStart(2, '0');

  const nowStr = `${fmt(now.getHours())}:${fmt(now.getMinutes())}:${fmt(now.getSeconds())}`;

  // 퇴근 후
  const done = remainMs === 0;

  const barColor = pct >= 90 ? '#10b981' : pct >= 50 ? '#f59e0b' : pct >= 25 ? '#3b82f6' : '#ef4444';

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #fef2f2 0%, #fff1f2 100%)', padding: '1.5rem 1rem' }}>
      <div style={{ maxWidth: '480px', margin: '0 auto' }}>
        <button onClick={() => router.push('/fun')} style={{ marginBottom: '1.5rem', padding: '0.5rem 1rem', background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', color: '#374151' }}>
          ← FuN fUn 홈
        </button>

        <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 4px 16px rgba(239,68,68,0.15)' }}>
          <h1 style={{ margin: '0 0 0.25rem 0', fontSize: '1.5rem', fontWeight: 900, color: '#991b1b' }}>⏰ 퇴근 카운트다운</h1>
          <p style={{ margin: 0, color: '#6b7280', fontSize: '0.88rem' }}>버텨라! 퇴근까지 남은 시간</p>
        </div>

        {/* 현재 시각 */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '2rem 1.5rem', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: '1rem' }}>
          <div style={{ fontSize: '0.8rem', color: '#9ca3af', marginBottom: '0.25rem' }}>현재 시각</div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: '#374151', letterSpacing: '0.05em', marginBottom: '1.5rem' }}>{nowStr}</div>

          {/* 카운트다운 */}
          <div style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '0.5rem' }}>퇴근까지 남은 시간</div>
          {done ? (
            <div style={{ fontSize: '3rem', fontWeight: 900, color: '#10b981', marginBottom: '1rem' }}>🎉 퇴근!</div>
          ) : (
            <div style={{ fontSize: '3rem', fontWeight: 900, color: '#ef4444', fontVariantNumeric: 'tabular-nums', marginBottom: '1rem', letterSpacing: '0.05em' }}>
              {fmt(hh)}:{fmt(mm)}:{fmt(ss)}
            </div>
          )}

          {/* 프로그레스 바 */}
          <div style={{ background: '#f3f4f6', borderRadius: '20px', height: '20px', overflow: 'hidden', marginBottom: '0.5rem', position: 'relative' }}>
            <div style={{ height: '100%', width: `${pct}%`, background: `linear-gradient(90deg, ${barColor}cc, ${barColor})`, borderRadius: '20px', transition: 'width 1s linear' }} />
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 700, color: 'white', textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
              {pct.toFixed(1)}%
            </div>
          </div>

          {/* 메시지 */}
          <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', background: '#f9fafb', borderRadius: '10px', fontSize: '0.9rem', color: '#374151' }}>
            <span style={{ fontSize: '1.5rem' }}>{emoji}</span>{' '}
            <span style={{ fontWeight: 600 }}>{msg}</span>
          </div>
        </div>

        {/* 시간 설정 */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#374151', marginBottom: '0.75rem' }}>⚙️ 시간 설정</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ fontSize: '0.78rem', color: '#6b7280', display: 'block', marginBottom: '0.25rem' }}>출근 시간</label>
              <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)}
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '1rem', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ fontSize: '0.78rem', color: '#6b7280', display: 'block', marginBottom: '0.25rem' }}>퇴근 시간</label>
              <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)}
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '1rem', boxSizing: 'border-box' }} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
            {[['08:00','17:00'], ['09:00','18:00'], ['10:00','19:00']].map(([s, e]) => (
              <button key={s} onClick={() => { setStartTime(s); setEndTime(e); }}
                style={{ flex: 1, padding: '0.4rem', background: startTime === s ? '#fef2f2' : '#f9fafb', border: `1px solid ${startTime === s ? '#ef4444' : '#e5e7eb'}`, borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', color: startTime === s ? '#ef4444' : '#6b7280', fontWeight: startTime === s ? 700 : 400 }}>
                {s}~{e}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
