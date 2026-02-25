'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

type RPS = 'rock' | 'paper' | 'scissors';
const CHOICES: { id: RPS; emoji: string; label: string; beats: RPS }[] = [
  { id: 'rock',     emoji: '✊', label: '바위', beats: 'scissors' },
  { id: 'paper',    emoji: '🖐️', label: '보',   beats: 'rock' },
  { id: 'scissors', emoji: '✌️', label: '가위', beats: 'paper' },
];

const AI_COMMENTS: Record<string, string[]> = {
  win:  ['으악! 내가 졌다...','억울해!! 한 판 더!','이럴 수가... 다시 해!','오늘 컨디션이 안 좋네요 🤔'],
  lose: ['하하! 내가 이겼다 😏','AI는 언제나 옳다!','열심히 하세요~ 😄','다음엔 잘 되실 거예요~'],
  draw: ['비겼네요~ 한 번 더!','운명은 평등합니다 ⚖️','동점! 다시 해볼까요?','흥미롭군요...'],
};

export default function RPSPage() {
  const router = useRouter();
  const [myChoice, setMyChoice] = useState<RPS | null>(null);
  const [aiChoice, setAiChoice] = useState<RPS | null>(null);
  const [result, setResult] = useState<'win' | 'lose' | 'draw' | null>(null);
  const [score, setScore] = useState({ win: 0, lose: 0, draw: 0 });
  const [animating, setAnimating] = useState(false);
  const [aiComment, setAiComment] = useState('');
  const [shake, setShake] = useState(false);

  useEffect(() => { document.title = '가위바위보 | FuN fUn'; }, []);

  function play(choice: RPS) {
    if (animating) return;
    setAnimating(true);
    setMyChoice(choice);
    setAiChoice(null);
    setResult(null);
    setShake(true);

    setTimeout(() => setShake(false), 600);

    setTimeout(() => {
      const ai = CHOICES[Math.floor(Math.random() * 3)].id;
      setAiChoice(ai);

      let res: 'win' | 'lose' | 'draw';
      if (choice === ai) res = 'draw';
      else if (CHOICES.find(c => c.id === choice)?.beats === ai) res = 'win';
      else res = 'lose';

      setResult(res);
      setScore(prev => ({ ...prev, [res]: prev[res] + 1 }));
      const comments = AI_COMMENTS[res];
      setAiComment(comments[Math.floor(Math.random() * comments.length)]);
      setAnimating(false);
    }, 800);
  }

  function reset() {
    setMyChoice(null); setAiChoice(null); setResult(null); setAiComment('');
  }

  const total = score.win + score.lose + score.draw;
  const winRate = total > 0 ? Math.round((score.win / total) * 100) : 0;

  const resultConfig = {
    win:  { label: '이겼다! 🎉', color: '#10b981', bg: '#ecfdf5' },
    lose: { label: '졌다... 😭', color: '#ef4444', bg: '#fef2f2' },
    draw: { label: '비겼다~ 🤝', color: '#f59e0b', bg: '#fffbeb' },
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)', padding: '1.5rem 1rem' }}>
      <div style={{ maxWidth: '440px', margin: '0 auto' }}>
        <button onClick={() => router.push('/fun')} style={{ marginBottom: '1.5rem', padding: '0.5rem 1rem', background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', color: '#374151' }}>
          ← FuN fUn 홈
        </button>

        <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', marginBottom: '1.25rem', boxShadow: '0 4px 16px rgba(236,72,153,0.15)' }}>
          <h1 style={{ margin: '0 0 0.25rem 0', fontSize: '1.5rem', fontWeight: 900, color: '#9d174d' }}>✂️ 가위바위보</h1>
          <p style={{ margin: 0, color: '#6b7280', fontSize: '0.88rem' }}>AI를 이겨라! 과연 가능할까?</p>
        </div>

        {/* 전적 */}
        <div style={{ background: 'white', borderRadius: '12px', padding: '1rem 1.25rem', marginBottom: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {[['승', score.win, '#10b981'], ['무', score.draw, '#f59e0b'], ['패', score.lose, '#ef4444']].map(([label, val, color]) => (
            <div key={label as string} style={{ flex: 1, textAlign: 'center', padding: '0.5rem', background: (color as string) + '11', borderRadius: '8px' }}>
              <div style={{ fontSize: '1.3rem', fontWeight: 900, color: color as string }}>{val as number}</div>
              <div style={{ fontSize: '0.72rem', color: '#6b7280' }}>{label as string}</div>
            </div>
          ))}
          <div style={{ flex: 1, textAlign: 'center', padding: '0.5rem', background: '#eef2ff', borderRadius: '8px' }}>
            <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#6366f1' }}>{winRate}%</div>
            <div style={{ fontSize: '0.72rem', color: '#6b7280' }}>승률</div>
          </div>
          {total > 0 && <button onClick={() => setScore({ win: 0, lose: 0, draw: 0 })} style={{ padding: '0.4rem 0.6rem', background: 'none', border: '1px solid #e5e7eb', borderRadius: '6px', cursor: 'pointer', fontSize: '0.72rem', color: '#9ca3af' }}>초기화</button>}
        </div>

        {/* 게임판 */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '2rem 1.5rem', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: '1rem' }}>
          {/* 대결 표시 */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', marginBottom: '1.5rem', minHeight: '100px' }}>
            {/* 내 선택 */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.5rem', fontWeight: 600 }}>나</div>
              <div style={{ fontSize: '4rem', transition: 'all 0.3s', filter: myChoice ? 'none' : 'grayscale(1) opacity(0.3)' }}>
                {myChoice ? CHOICES.find(c => c.id === myChoice)?.emoji : '❓'}
              </div>
              {myChoice && <div style={{ fontSize: '0.8rem', color: '#374151', fontWeight: 700 }}>{CHOICES.find(c => c.id === myChoice)?.label}</div>}
            </div>

            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#d1d5db' }}>VS</div>

            {/* AI 선택 */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.5rem', fontWeight: 600 }}>AI</div>
              <div style={{ fontSize: '4rem', transition: 'all 0.3s', filter: aiChoice ? 'none' : 'grayscale(1) opacity(0.3)',
                animation: animating && !aiChoice ? 'spin 0.5s infinite' : 'none' }}>
                {animating && !aiChoice ? '🎲' : aiChoice ? CHOICES.find(c => c.id === aiChoice)?.emoji : '❓'}
              </div>
              {aiChoice && <div style={{ fontSize: '0.8rem', color: '#374151', fontWeight: 700 }}>{CHOICES.find(c => c.id === aiChoice)?.label}</div>}
            </div>
          </div>

          {/* 결과 */}
          {result && !animating && (
            <div style={{ padding: '0.75rem 1.25rem', background: resultConfig[result].bg, border: `2px solid ${resultConfig[result].color}`, borderRadius: '12px', marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 900, color: resultConfig[result].color }}>{resultConfig[result].label}</div>
              <div style={{ fontSize: '0.82rem', color: '#6b7280', marginTop: '0.25rem' }}>AI: "{aiComment}"</div>
            </div>
          )}

          {/* 선택 버튼 */}
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            {CHOICES.map(c => (
              <button key={c.id} onClick={() => play(c.id)} disabled={animating}
                style={{ flex: 1, padding: '0.85rem 0.5rem', background: myChoice === c.id && result ? resultConfig[result!]?.bg : '#f9fafb', border: `2px solid ${myChoice === c.id ? '#ec4899' : '#e5e7eb'}`, borderRadius: '14px', cursor: animating ? 'not-allowed' : 'pointer', fontSize: '2rem', transition: 'all 0.15s', transform: shake && myChoice === c.id ? 'scale(0.95)' : 'scale(1)' }}
                onMouseEnter={e => { if (!animating) e.currentTarget.style.transform = 'scale(1.08)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
              >
                {c.emoji}
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#374151', marginTop: '0.25rem' }}>{c.label}</div>
              </button>
            ))}
          </div>

          {result && (
            <button onClick={reset} style={{ marginTop: '1rem', padding: '0.5rem 1.5rem', background: '#fdf2f8', color: '#9d174d', border: '1px solid #ec4899', borderRadius: '20px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 700 }}>
              다시 하기
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
