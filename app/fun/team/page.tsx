'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const TEAM_COLORS = ['#0078D4', '#d13438', '#107c10', '#ca5010', '#744da9', '#008272'];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const MS_FONT = '"Segoe UI", -apple-system, BlinkMacSystemFont, "Malgun Gothic", sans-serif';

export default function TeamPage() {
  const router = useRouter();
  const [input, setInput] = useState('');
  const [teamCount, setTeamCount] = useState(2);
  const [teams, setTeams] = useState<string[][]>([]);
  const [animating, setAnimating] = useState(false);

  useEffect(() => { document.title = '팀 랜덤 배정기 | FuN fUn'; }, []);

  const names = input.split('\n').map(n => n.trim()).filter(Boolean);

  function makeTeams() {
    if (names.length < teamCount) return;
    setAnimating(true);
    setTeams([]);
    const shuffled = shuffle(names);
    const result: string[][] = Array.from({ length: teamCount }, () => []);
    shuffled.forEach((name, i) => result[i % teamCount].push(name));

    let count = 0;
    const interval = setInterval(() => {
      count++;
      const tempShuffled = shuffle(names);
      const temp: string[][] = Array.from({ length: teamCount }, () => []);
      tempShuffled.forEach((name, i) => temp[i % teamCount].push(name));
      setTeams(temp);
      if (count >= 10) {
        clearInterval(interval);
        setTeams(result);
        setAnimating(false);
      }
    }, 100);
  }

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
          <span style={{ color: '#323130', fontSize: '0.82rem', fontWeight: 600 }}>팀 랜덤 배정기</span>
        </div>
        {names.length > 0 && (
          <span style={{ color: '#605e5c', fontSize: '0.78rem', fontWeight: 600, marginRight: '1rem' }}>{names.length}명</span>
        )}
        <button onClick={() => router.push('/')} style={{ padding: '0.35rem 0.85rem', background: 'transparent', border: '1px solid #8a8886', borderRadius: '2px', cursor: 'pointer', color: '#323130', fontSize: '0.78rem' }}
          onMouseEnter={e => e.currentTarget.style.background = '#f3f2f1'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>메인 채팅</button>
      </nav>

      {/* ── Hero ── */}
      <div style={{ background: 'linear-gradient(135deg, #003344 0%, #008272 100%)', padding: '1rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', textAlign: 'center' }}>
        <div style={{ fontSize: '1.75rem', filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.3))' }}>👥</div>
        <div>
          <p style={{ color: '#99e6de', fontSize: '0.62rem', letterSpacing: '1.5px', textTransform: 'uppercase', margin: '0 0 0.15rem', fontWeight: 600 }}>랜덤 · 팀배정</p>
          <h1 style={{ color: 'white', fontSize: '1.1rem', fontWeight: 700, margin: '0 0 0.1rem', letterSpacing: '-0.3px' }}>팀 랜덤 배정기</h1>
          <p style={{ color: '#b3f0ea', margin: 0, fontSize: '0.72rem' }}>눈치 없이 공정하게 팀을 나눠드립니다!</p>
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{ padding: '1.5rem 2rem 3rem', maxWidth: '600px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1px' }}>

        {/* 입력 카드 */}
        <div style={{ background: 'white', border: '1px solid #edebe9', padding: '1.5rem' }}>
          <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#323130', marginBottom: '0.5rem' }}>
            참가자 이름 입력
            <span style={{ color: '#a19f9d', fontWeight: 400, fontSize: '0.72rem', marginLeft: '0.5rem' }}>(한 줄에 한 명)</span>
          </label>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={'홍길동\n이순신\n강감찬\n세종대왕\n유관순\n안중근'}
            rows={8}
            style={{
              width: '100%', padding: '0.65rem 0.75rem',
              border: '1px solid #8a8886', borderRadius: '2px',
              fontSize: '0.88rem', resize: 'vertical', boxSizing: 'border-box',
              fontFamily: MS_FONT, lineHeight: 1.6, outline: 'none',
              transition: 'border-color 0.12s', color: '#323130',
            }}
            onFocus={e => e.currentTarget.style.borderColor = '#0078D4'}
            onBlur={e => e.currentTarget.style.borderColor = '#8a8886'}
          />
          <div style={{ fontSize: '0.72rem', color: '#a19f9d', marginTop: '0.3rem' }}>현재 {names.length}명 입력됨</div>

          {/* 팀 수 선택 */}
          <div style={{ marginTop: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#323130', marginBottom: '0.5rem' }}>팀 수</label>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              {[2, 3, 4, 5, 6].map(n => (
                <button
                  key={n}
                  onClick={() => setTeamCount(n)}
                  style={{
                    flex: 1, padding: '0.45rem',
                    background: teamCount === n ? '#0078D4' : 'transparent',
                    color: teamCount === n ? 'white' : '#323130',
                    border: `1px solid ${teamCount === n ? '#0078D4' : '#8a8886'}`,
                    borderRadius: '2px',
                    cursor: 'pointer', fontWeight: teamCount === n ? 700 : 400,
                    fontSize: '0.88rem', transition: 'all 0.12s',
                  }}
                >{n}팀</button>
              ))}
            </div>
          </div>

          <button
            onClick={makeTeams}
            disabled={names.length < teamCount || animating}
            style={{
              width: '100%', marginTop: '1.1rem', padding: '0.6rem',
              background: names.length < teamCount ? '#f3f2f1' : '#0078D4',
              color: names.length < teamCount ? '#a19f9d' : 'white',
              border: `1px solid ${names.length < teamCount ? '#edebe9' : '#0078D4'}`,
              borderRadius: '2px',
              fontSize: '0.88rem', fontWeight: 600,
              cursor: names.length < teamCount ? 'not-allowed' : 'pointer',
              transition: 'all 0.12s',
            }}
            onMouseEnter={e => { if (names.length >= teamCount && !animating) e.currentTarget.style.background = '#106ebe'; }}
            onMouseLeave={e => { if (names.length >= teamCount && !animating) e.currentTarget.style.background = '#0078D4'; }}
          >
            {animating ? '배정 중... 🎲' : names.length < teamCount ? `최소 ${teamCount}명이 필요합니다` : '팀 배정하기! 🎯'}
          </button>
        </div>

        {/* 결과 팀 카드 */}
        {teams.length > 0 && (
          <>
            <div style={{
              display: 'grid',
              gridTemplateColumns: teamCount <= 3 ? '1fr' : '1fr 1fr',
              gap: '1px', background: '#edebe9', border: '1px solid #edebe9',
            }}>
              {teams.map((team, ti) => (
                <div key={ti} style={{
                  background: 'white', padding: '1.1rem 1.25rem',
                  borderTop: `3px solid ${TEAM_COLORS[ti]}`,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <div style={{
                      width: '26px', height: '26px',
                      background: TEAM_COLORS[ti],
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'white', fontWeight: 700, fontSize: '0.82rem',
                    }}>{ti + 1}</div>
                    <span style={{ fontWeight: 700, fontSize: '0.92rem', color: TEAM_COLORS[ti] }}>{ti + 1}팀</span>
                    <span style={{ fontSize: '0.72rem', color: '#a19f9d' }}>({team.length}명)</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                    {team.map((name, ni) => (
                      <div key={ni} style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        padding: '0.35rem 0.6rem',
                        background: `${TEAM_COLORS[ti]}0d`,
                        border: `1px solid ${TEAM_COLORS[ti]}25`,
                        fontSize: '0.85rem', color: '#323130',
                      }}>
                        <span style={{ color: TEAM_COLORS[ti], fontWeight: 700, fontSize: '0.7rem' }}>{ni + 1}.</span>
                        {name}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {!animating && (
              <div style={{ background: 'white', border: '1px solid #edebe9', padding: '0.75rem 1.25rem', textAlign: 'center' }}>
                <button
                  onClick={makeTeams}
                  style={{ padding: '0.45rem 1.5rem', background: 'transparent', color: '#0078D4', border: '1px solid #0078D4', borderRadius: '2px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600 }}
                  onMouseEnter={e => e.currentTarget.style.background = '#0078D408'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >🔀 다시 배정하기</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
