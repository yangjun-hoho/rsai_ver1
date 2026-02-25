'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

const LEVELS = [
  { min: 0,   max: 10,  emoji: '😌', label: '평온',     color: '#10b981', msg: '아직 여유롭네요. 업무가 잘 되고 있군요!' },
  { min: 11,  max: 30,  emoji: '🙂', label: '보통',     color: '#3b82f6', msg: '적당한 긴장감! 업무 효율이 최고조입니다.' },
  { min: 31,  max: 60,  emoji: '😤', label: '스트레스', color: '#f59e0b', msg: '조금 쌓이고 있군요... 커피 한 잔 어때요?' },
  { min: 61,  max: 100, emoji: '😡', label: '분노',     color: '#ef4444', msg: '으아아악!! 민원인이 또 왔나요?!' },
  { min: 101, max: 200, emoji: '🤯', label: '폭발',     color: '#7c3aed', msg: '결재가 또 반려됐나요? 국감이에요?!' },
  { min: 201, max: 500, emoji: '💀', label: '한계초월', color: '#1f2937', msg: '이 정도면 이미 전설... 고생하셨습니다.' },
];

const CLICK_MSGS = [
  '후련하다!', '또 눌러!', '시원해!', '한 번 더!', '아직 부족해!',
  '화가 풀려!', '누를수록 좋아!', '이게 뭔지 알아?', '계속 눌러!', '잠깐, 숨 쉬어요!',
];

const SPARKS = ['💢','💥','⚡','🔥','✨','💫'];

interface Particle { id: number; x: number; y: number; emoji: string; vx: number; vy: number; }

export default function StressPage() {
  const router = useRouter();
  const [count, setCount] = useState(0);
  const [pressing, setPressing] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [floatMsg, setFloatMsg] = useState('');
  const [shake, setShake] = useState(false);
  const pIdRef = useRef(0);
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => { document.title = '스트레스 해소 | FuN fUn'; }, []);

  // 파티클 제거
  useEffect(() => {
    if (particles.length === 0) return;
    const t = setTimeout(() => setParticles(prev => prev.slice(-6)), 600);
    return () => clearTimeout(t);
  }, [particles]);

  function getLevel(n: number) {
    return LEVELS.find(l => n >= l.min && n <= l.max) || LEVELS[LEVELS.length - 1];
  }

  function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
    const newCount = count + 1;
    setCount(newCount);
    setPressing(true);
    setShake(true);
    setTimeout(() => { setPressing(false); setShake(false); }, 150);

    // 파티클 추가
    const rect = btnRef.current?.getBoundingClientRect();
    if (rect) {
      const n = Math.min(3, Math.floor(newCount / 20) + 1);
      const newPs: Particle[] = Array.from({ length: n }, () => ({
        id: pIdRef.current++,
        x: e.clientX - rect.left + (Math.random() - 0.5) * 40,
        y: e.clientY - rect.top + (Math.random() - 0.5) * 20,
        emoji: SPARKS[Math.floor(Math.random() * SPARKS.length)],
        vx: (Math.random() - 0.5) * 60,
        vy: -(Math.random() * 40 + 20),
      }));
      setParticles(prev => [...prev, ...newPs].slice(-12));
    }

    // 플로팅 메시지
    if (newCount % 5 === 0) {
      setFloatMsg(CLICK_MSGS[Math.floor(Math.random() * CLICK_MSGS.length)]);
      setTimeout(() => setFloatMsg(''), 1200);
    }
  }

  const level = getLevel(count);
  const nextLevel = LEVELS.find(l => l.min > count);
  const progress = nextLevel
    ? ((count - level.min) / (nextLevel.min - level.min)) * 100
    : 100;

  return (
    <div style={{ minHeight: '100vh', background: `linear-gradient(135deg, ${level.color}11 0%, ${level.color}22 100%)`, padding: '1.5rem 1rem', transition: 'background 0.5s' }}>
      <div style={{ maxWidth: '440px', margin: '0 auto' }}>
        <button onClick={() => router.push('/fun')} style={{ marginBottom: '1.5rem', padding: '0.5rem 1rem', background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', color: '#374151' }}>
          ← FuN fUn 홈
        </button>

        <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', marginBottom: '1.25rem', boxShadow: `0 4px 16px ${level.color}33`, transition: 'box-shadow 0.5s' }}>
          <h1 style={{ margin: '0 0 0.25rem 0', fontSize: '1.5rem', fontWeight: 900, color: level.color, transition: 'color 0.5s' }}>😤 스트레스 해소 버튼</h1>
          <p style={{ margin: 0, color: '#6b7280', fontSize: '0.88rem' }}>누르면 스트레스가 풀린다고?!</p>
        </div>

        {/* 레벨 & 메시지 */}
        <div style={{ background: 'white', borderRadius: '12px', padding: '1rem 1.25rem', marginBottom: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ fontSize: '1.4rem', transition: 'all 0.3s', transform: shake ? 'scale(1.2)' : 'scale(1)' }}>{level.emoji}</span>
              <span style={{ fontWeight: 800, color: level.color, fontSize: '0.95rem', transition: 'color 0.5s' }}>{level.label}</span>
            </div>
            <span style={{ fontSize: '1.5rem', fontWeight: 900, color: level.color }}>{count.toLocaleString()}</span>
          </div>
          <div style={{ height: '8px', background: '#f3f4f6', borderRadius: '4px', overflow: 'hidden', marginBottom: '0.5rem' }}>
            <div style={{ height: '100%', width: `${progress}%`, background: `linear-gradient(90deg, ${level.color}aa, ${level.color})`, borderRadius: '4px', transition: 'width 0.2s, background 0.5s' }} />
          </div>
          <p style={{ margin: 0, fontSize: '0.82rem', color: '#4b5563' }}>{level.msg}</p>
        </div>

        {/* 버튼 */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '2.5rem 1.5rem', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', position: 'relative', overflow: 'hidden' }}>
          {/* 파티클 */}
          {particles.map(p => (
            <div key={p.id} style={{
              position: 'absolute', left: `calc(50% + ${p.x}px)`, top: `calc(50% + ${p.y}px)`,
              fontSize: '1.5rem', pointerEvents: 'none', animation: 'float-up 0.6s ease-out forwards',
              transform: `translate(-50%, -50%)`,
            }}>
              {p.emoji}
            </div>
          ))}

          {/* 플로팅 메시지 */}
          {floatMsg && (
            <div style={{ position: 'absolute', top: '1rem', left: '50%', transform: 'translateX(-50%)', background: level.color, color: 'white', padding: '0.4rem 1rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 700, whiteSpace: 'nowrap', animation: 'fade-up 1.2s ease-out forwards', zIndex: 10 }}>
              {floatMsg}
            </div>
          )}

          <button
            ref={btnRef}
            onClick={handleClick}
            style={{
              width: '160px', height: '160px', borderRadius: '50%',
              background: pressing
                ? `radial-gradient(circle, ${level.color}dd, ${level.color})`
                : `radial-gradient(circle at 35% 35%, ${level.color}cc, ${level.color})`,
              border: `6px solid ${level.color}44`,
              color: 'white', fontSize: pressing ? '3.5rem' : '4rem',
              cursor: 'pointer', transition: 'all 0.1s',
              transform: pressing ? 'scale(0.93)' : 'scale(1)',
              boxShadow: pressing
                ? `0 4px 12px ${level.color}44, inset 0 4px 12px rgba(0,0,0,0.2)`
                : `0 10px 32px ${level.color}55, inset 0 -4px 8px rgba(0,0,0,0.1)`,
              userSelect: 'none',
            }}
          >
            {level.emoji}
          </button>

          <div style={{ marginTop: '1.25rem', fontSize: '0.85rem', color: '#9ca3af' }}>
            꾹 누르세요! 총 <strong style={{ color: level.color }}>{count}</strong>번 눌렀어요
          </div>
        </div>

        {/* 초기화 */}
        {count > 0 && (
          <button onClick={() => setCount(0)} style={{ width: '100%', marginTop: '0.75rem', padding: '0.7rem', background: 'white', color: '#9ca3af', border: '1px solid #e5e7eb', borderRadius: '10px', cursor: 'pointer', fontSize: '0.85rem' }}>
            스트레스 초기화 (0으로 리셋)
          </button>
        )}
      </div>

      <style>{`
        @keyframes float-up {
          0% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
          100% { opacity: 0; transform: translate(-50%, calc(-50% - 50px)) scale(1.5); }
        }
        @keyframes fade-up {
          0% { opacity: 1; transform: translateX(-50%) translateY(0); }
          70% { opacity: 1; }
          100% { opacity: 0; transform: translateX(-50%) translateY(-20px); }
        }
      `}</style>
    </div>
  );
}
