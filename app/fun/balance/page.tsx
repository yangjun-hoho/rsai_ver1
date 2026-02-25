'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const QUESTIONS = [
  { q: '어느 쪽이 더 나은가?', a: '야근 2시간 (내일 칼퇴)', b: '정시 퇴근 (내일 야근 가능성)' },
  { q: '더 두려운 것은?', a: '연간 감사 🔍', b: '국정감사 📺' },
  { q: '어느 상사가 낫나요?', a: '꼼꼼하지만 깐깐한 상사', b: '루즈하지만 잔소리 없는 상사' },
  { q: '더 나은 처우는?', a: '월급 10% 인상', b: '매년 5일 추가 연차' },
  { q: '어느 쪽이 더 힘드나요?', a: '악성 민원인 응대', b: '내부 결재 반려 3번' },
  { q: '더 선호하는 것은?', a: '재택근무 가능 (연봉 동결)', b: '매일 출근 (연봉 200만원 인상)' },
  { q: '어느 쪽이 낫나요?', a: '조용하고 아는 척 안 하는 팀장', b: '활발하지만 사사건건 간섭하는 팀장' },
  { q: '더 선호하는 복지는?', a: '단합 워크숍 전액 지원 (의무참가)', b: '복지 포인트 30만원 (개인 자유)' },
  { q: '어느 부서가 나은가요?', a: '업무량 많지만 인정받는 핵심부서', b: '한산하지만 빛이 안 나는 한직 부서' },
  { q: '더 힘든 상황은?', a: '아는 사람 하나 없는 타 지역 전출', b: '복잡한 인간관계의 현 부서 잔류' },
];

export default function BalancePage() {
  const router = useRouter();
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<'a' | 'b' | null>(null);
  const [votes, setVotes] = useState<{ a: number; b: number }[]>(
    QUESTIONS.map(() => ({ a: Math.floor(30 + Math.random() * 40), b: Math.floor(30 + Math.random() * 40) }))
  );
  const [done, setDone] = useState(false);
  const [userChoices, setUserChoices] = useState<('a' | 'b')[]>([]);

  useEffect(() => { document.title = '밸런스 게임 | FuN fUn'; }, []);

  function choose(opt: 'a' | 'b') {
    if (selected) return;
    setSelected(opt);
    const newVotes = votes.map((v, i) => i === idx ? { ...v, [opt]: v[opt] + 1 } : v);
    setVotes(newVotes);
    setUserChoices([...userChoices, opt]);
    setTimeout(() => {
      if (idx + 1 >= QUESTIONS.length) setDone(true);
      else { setIdx(idx + 1); setSelected(null); }
    }, 1800);
  }

  function reset() {
    setIdx(0); setSelected(null); setDone(false); setUserChoices([]);
    setVotes(QUESTIONS.map(() => ({ a: Math.floor(30 + Math.random() * 40), b: Math.floor(30 + Math.random() * 40) })));
  }

  const q = QUESTIONS[idx];
  const v = votes[idx];
  const total = v.a + v.b;
  const pctA = Math.round((v.a / total) * 100);
  const pctB = 100 - pctA;

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)', padding: '1.5rem 1rem' }}>
      <div style={{ maxWidth: '520px', margin: '0 auto' }}>
        <button onClick={() => router.push('/fun')} style={{ marginBottom: '1.5rem', padding: '0.5rem 1rem', background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', color: '#374151' }}>
          ← FuN fUn 홈
        </button>

        <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 4px 16px rgba(139,92,246,0.15)' }}>
          <h1 style={{ margin: '0 0 0.25rem 0', fontSize: '1.5rem', fontWeight: 900, color: '#5b21b6' }}>⚖️ 공무원 밸런스 게임</h1>
          <p style={{ margin: 0, color: '#6b7280', fontSize: '0.88rem' }}>공무원만 이해하는 고난이도 밸런스!</p>
        </div>

        {!done ? (
          <div style={{ background: 'white', borderRadius: '20px', padding: '2rem 1.5rem', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '0.8rem', color: '#8b5cf6', fontWeight: 700 }}>{idx + 1} / {QUESTIONS.length}</span>
              <div style={{ flex: 1, margin: '0 0.75rem', height: '6px', background: '#ede9fe', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${((idx) / QUESTIONS.length) * 100}%`, background: 'linear-gradient(90deg, #8b5cf6, #ec4899)', borderRadius: '3px', transition: 'width 0.3s' }} />
              </div>
              <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>⚖️</span>
            </div>

            <h2 style={{ textAlign: 'center', fontSize: '1rem', fontWeight: 700, color: '#374151', marginBottom: '1.5rem', lineHeight: 1.5 }}>{q.q}</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {(['a', 'b'] as const).map(opt => {
                const text = opt === 'a' ? q.a : q.b;
                const pct = opt === 'a' ? pctA : pctB;
                const isChosen = selected === opt;
                const otherChosen = selected && selected !== opt;

                return (
                  <div key={opt}>
                    <button
                      onClick={() => choose(opt)}
                      disabled={!!selected}
                      style={{
                        width: '100%', padding: '1rem 1.25rem', borderRadius: '12px',
                        border: `2px solid ${isChosen ? '#8b5cf6' : otherChosen ? '#e5e7eb' : '#e5e7eb'}`,
                        background: isChosen ? '#f5f3ff' : otherChosen ? '#fafafa' : 'white',
                        color: otherChosen ? '#9ca3af' : '#1f2937',
                        cursor: selected ? 'default' : 'pointer',
                        fontSize: '0.92rem', fontWeight: 600, textAlign: 'left', transition: 'all 0.2s',
                        opacity: otherChosen ? 0.6 : 1,
                      }}
                    >
                      <span style={{ display: 'inline-block', padding: '0.2rem 0.6rem', background: opt === 'a' ? '#8b5cf6' : '#ec4899', color: 'white', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 800, marginRight: '0.6rem' }}>{opt.toUpperCase()}</span>
                      {text}
                    </button>
                    {selected && (
                      <div style={{ marginTop: '0.35rem', padding: '0 0.25rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.2rem' }}>
                          <span>{opt === 'a' ? '나도 A' : '나도 B'}</span>
                          <span style={{ fontWeight: 700, color: '#8b5cf6' }}>{pct}%</span>
                        </div>
                        <div style={{ height: '6px', background: '#f3f4f6', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${pct}%`, background: opt === 'a' ? '#8b5cf6' : '#ec4899', borderRadius: '3px', transition: 'width 0.5s' }} />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div style={{ background: 'white', borderRadius: '20px', padding: '2rem 1.5rem', textAlign: 'center', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
            <div style={{ fontSize: '4rem', marginBottom: '0.5rem' }}>🎊</div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#5b21b6', marginBottom: '1rem' }}>게임 완료!</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1.5rem' }}>
              {QUESTIONS.map((q, i) => (
                <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', padding: '0.5rem 0.75rem', background: '#f5f3ff', borderRadius: '8px', fontSize: '0.8rem', textAlign: 'left' }}>
                  <span style={{ padding: '0.15rem 0.5rem', background: userChoices[i] === 'a' ? '#8b5cf6' : '#ec4899', color: 'white', borderRadius: '4px', fontWeight: 800, flexShrink: 0 }}>{(userChoices[i] || '?').toUpperCase()}</span>
                  <span style={{ color: '#374151' }}>{userChoices[i] === 'a' ? q.a : q.b}</span>
                </div>
              ))}
            </div>
            <button onClick={reset} style={{ width: '100%', padding: '0.85rem', background: 'linear-gradient(90deg, #8b5cf6, #ec4899)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '1rem', fontWeight: 800, cursor: 'pointer' }}>
              다시 하기 🎮
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
