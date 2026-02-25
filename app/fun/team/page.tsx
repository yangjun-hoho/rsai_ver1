'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const TEAM_COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

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
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #ecfeff 0%, #cffafe 100%)', padding: '1.5rem 1rem' }}>
      <div style={{ maxWidth: '560px', margin: '0 auto' }}>
        <button onClick={() => router.push('/fun')} style={{ marginBottom: '1.5rem', padding: '0.5rem 1rem', background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', color: '#374151' }}>
          ← FuN fUn 홈
        </button>

        <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 4px 16px rgba(6,182,212,0.15)' }}>
          <h1 style={{ margin: '0 0 0.25rem 0', fontSize: '1.5rem', fontWeight: 900, color: '#0e7490' }}>👥 팀 랜덤 배정기</h1>
          <p style={{ margin: 0, color: '#6b7280', fontSize: '0.88rem' }}>눈치 없이 공정하게 팀을 나눠드립니다!</p>
        </div>

        <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#374151', marginBottom: '0.5rem' }}>
            참가자 이름 입력 <span style={{ color: '#9ca3af', fontWeight: 400 }}>(한 줄에 한 명)</span>
          </label>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={'홍길동\n이순신\n강감찬\n세종대왕\n유관순\n안중근'}
            rows={8}
            style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '0.9rem', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit', lineHeight: 1.6 }}
          />
          <div style={{ fontSize: '0.78rem', color: '#9ca3af', marginTop: '0.25rem' }}>
            현재 {names.length}명 입력됨
          </div>

          <div style={{ marginTop: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#374151', marginBottom: '0.5rem' }}>팀 수</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {[2, 3, 4, 5, 6].map(n => (
                <button key={n} onClick={() => setTeamCount(n)}
                  style={{ flex: 1, padding: '0.55rem', background: teamCount === n ? '#06b6d4' : '#f3f4f6', color: teamCount === n ? 'white' : '#374151', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: teamCount === n ? 800 : 400, fontSize: '0.9rem' }}>
                  {n}팀
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={makeTeams}
            disabled={names.length < teamCount || animating}
            style={{ width: '100%', marginTop: '1.25rem', padding: '0.85rem', background: names.length < teamCount ? '#9ca3af' : 'linear-gradient(90deg, #06b6d4, #0284c7)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '1rem', fontWeight: 800, cursor: names.length < teamCount ? 'not-allowed' : 'pointer' }}>
            {animating ? '배정 중... 🎲' : names.length < teamCount ? `최소 ${teamCount}명이 필요합니다` : '팀 배정하기! 🎯'}
          </button>
        </div>

        {teams.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: teamCount <= 3 ? '1fr' : '1fr 1fr', gap: '0.75rem' }}>
            {teams.map((team, ti) => (
              <div key={ti} style={{ background: 'white', borderRadius: '14px', padding: '1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderTop: `4px solid ${TEAM_COLORS[ti]}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: TEAM_COLORS[ti], display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 900, fontSize: '0.85rem' }}>{ti + 1}</div>
                  <span style={{ fontWeight: 800, fontSize: '1rem', color: TEAM_COLORS[ti] }}>{ti + 1}팀</span>
                  <span style={{ fontSize: '0.78rem', color: '#9ca3af' }}>({team.length}명)</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  {team.map((name, ni) => (
                    <div key={ni} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.6rem', background: TEAM_COLORS[ti] + '11', borderRadius: '6px', fontSize: '0.88rem', color: '#1f2937', fontWeight: 500 }}>
                      <span style={{ color: TEAM_COLORS[ti], fontWeight: 700, fontSize: '0.75rem' }}>{ni + 1}.</span>
                      {name}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {teams.length > 0 && !animating && (
          <button onClick={makeTeams} style={{ width: '100%', marginTop: '0.75rem', padding: '0.7rem', background: '#ecfeff', color: '#0e7490', border: '2px solid #06b6d4', borderRadius: '10px', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer' }}>
            🔀 다시 배정하기
          </button>
        )}
      </div>
    </div>
  );
}
