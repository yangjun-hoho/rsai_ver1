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

const MS_FONT = '"Segoe UI", -apple-system, BlinkMacSystemFont, "Malgun Gothic", sans-serif';
const COLOR_A = '#744da9';
const COLOR_B = '#d13438';

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
          <span style={{ color: '#323130', fontSize: '0.82rem', fontWeight: 600 }}>밸런스 게임</span>
        </div>
        {!done && (
          <span style={{ color: '#605e5c', fontSize: '0.78rem', fontWeight: 600, marginRight: '1rem' }}>{idx + 1} / {QUESTIONS.length}</span>
        )}
        <button onClick={() => router.push('/')} style={{ padding: '0.35rem 0.85rem', background: 'transparent', border: '1px solid #8a8886', borderRadius: '2px', cursor: 'pointer', color: '#323130', fontSize: '0.78rem' }}
          onMouseEnter={e => e.currentTarget.style.background = '#f3f2f1'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>메인 채팅</button>
      </nav>

      {/* ── Hero ── */}
      <div style={{ background: 'linear-gradient(135deg, #1a0a3d 0%, #744da9 100%)', padding: '1rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', textAlign: 'center' }}>
        <div style={{ fontSize: '1.75rem', filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.3))' }}>⚖️</div>
        <div>
          <p style={{ color: '#d8b4fe', fontSize: '0.62rem', letterSpacing: '1.5px', textTransform: 'uppercase', margin: '0 0 0.15rem', fontWeight: 600 }}>선택 · 밸런스게임</p>
          <h1 style={{ color: 'white', fontSize: '1.1rem', fontWeight: 700, margin: '0 0 0.1rem', letterSpacing: '-0.3px' }}>공무원 밸런스 게임</h1>
          <p style={{ color: '#c4b5fd', margin: 0, fontSize: '0.72rem' }}>공무원만 이해하는 고난이도 선택!</p>
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{ padding: '1.5rem 2rem 3rem', maxWidth: '560px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1px' }}>

        {!done ? (
          <>
            {/* 진행 바 */}
            <div style={{ background: 'white', border: '1px solid #edebe9', padding: '0.85rem 1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.72rem', color: '#605e5c', fontWeight: 600 }}>Q{idx + 1}</span>
                <span style={{ fontSize: '0.72rem', color: COLOR_A, fontWeight: 600 }}>{Math.round((idx / QUESTIONS.length) * 100)}% 완료</span>
              </div>
              <div style={{ height: '4px', background: '#f3f2f1', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${((idx) / QUESTIONS.length) * 100}%`, background: COLOR_A, transition: 'width 0.35s' }} />
              </div>
            </div>

            {/* 질문 */}
            <div style={{ background: 'white', border: '1px solid #edebe9', padding: '2rem 1.5rem' }}>
              <h2 style={{ textAlign: 'center', fontSize: '1.05rem', fontWeight: 700, color: '#323130', marginBottom: '1.75rem', lineHeight: 1.55 }}>
                ⚖️ {q.q}
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {(['a', 'b'] as const).map(opt => {
                  const text = opt === 'a' ? q.a : q.b;
                  const pct = opt === 'a' ? pctA : pctB;
                  const isChosen = selected === opt;
                  const otherChosen = selected && selected !== opt;
                  const optColor = opt === 'a' ? COLOR_A : COLOR_B;

                  return (
                    <div key={opt}>
                      <button
                        onClick={() => choose(opt)}
                        disabled={!!selected}
                        style={{
                          width: '100%', padding: '1rem 1.25rem',
                          border: `1.5px solid ${isChosen ? optColor : otherChosen ? '#edebe9' : '#edebe9'}`,
                          background: isChosen ? `${optColor}0d` : otherChosen ? '#faf9f8' : 'white',
                          color: otherChosen ? '#a19f9d' : '#323130',
                          cursor: selected ? 'default' : 'pointer',
                          fontSize: '0.88rem', fontWeight: isChosen ? 600 : 400, textAlign: 'left', transition: 'all 0.15s',
                          opacity: otherChosen ? 0.55 : 1,
                          borderRadius: '2px',
                        }}
                        onMouseEnter={e => { if (!selected) { e.currentTarget.style.borderColor = optColor; e.currentTarget.style.background = `${optColor}08`; } }}
                        onMouseLeave={e => { if (!isChosen) { e.currentTarget.style.borderColor = '#edebe9'; e.currentTarget.style.background = 'white'; } }}
                      >
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                          width: '22px', height: '22px',
                          background: isChosen ? optColor : '#f3f2f1',
                          color: isChosen ? 'white' : '#605e5c',
                          borderRadius: '2px', fontSize: '0.72rem', fontWeight: 700, marginRight: '0.75rem',
                          transition: 'all 0.15s', flexShrink: 0,
                        }}>{opt.toUpperCase()}</span>
                        {text}
                      </button>
                      {selected && (
                        <div style={{ marginTop: '0.3rem', padding: '0 0.25rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#605e5c', marginBottom: '0.2rem' }}>
                            <span>{opt === 'a' ? '나도 A' : '나도 B'}</span>
                            <span style={{ fontWeight: 700, color: optColor }}>{pct}%</span>
                          </div>
                          <div style={{ height: '3px', background: '#f3f2f1', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${pct}%`, background: optColor, transition: 'width 0.55s ease' }} />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        ) : (
          <>
            {/* 완료 */}
            <div style={{ background: 'white', border: '1px solid #edebe9', padding: '2rem 1.5rem', textAlign: 'center' }}>
              <div style={{ fontSize: '3.5rem', marginBottom: '0.5rem' }}>🎊</div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#323130', marginBottom: '1.5rem' }}>게임 완료!</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1.5rem', textAlign: 'left' }}>
                {QUESTIONS.map((question, i) => (
                  <div key={i} style={{
                    display: 'flex', gap: '0.6rem', alignItems: 'center',
                    padding: '0.55rem 0.85rem',
                    background: userChoices[i] === 'a' ? `${COLOR_A}0a` : `${COLOR_B}0a`,
                    border: `1px solid ${userChoices[i] === 'a' ? COLOR_A : COLOR_B}30`,
                    fontSize: '0.8rem', borderRadius: '2px',
                  }}>
                    <span style={{
                      padding: '0.18rem 0.5rem',
                      background: userChoices[i] === 'a' ? COLOR_A : COLOR_B,
                      color: 'white', borderRadius: '2px',
                      fontWeight: 700, flexShrink: 0, fontSize: '0.7rem',
                    }}>{(userChoices[i] || '?').toUpperCase()}</span>
                    <span style={{ color: '#323130', lineHeight: 1.4 }}>{userChoices[i] === 'a' ? question.a : question.b}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={reset}
                style={{ padding: '0.55rem 1.75rem', background: '#0078D4', color: 'white', border: 'none', borderRadius: '2px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600 }}
                onMouseEnter={e => e.currentTarget.style.background = '#106ebe'}
                onMouseLeave={e => e.currentTarget.style.background = '#0078D4'}
              >다시 하기 🎮</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
