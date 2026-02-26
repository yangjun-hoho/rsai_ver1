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

const MS_FONT = '"Segoe UI", -apple-system, BlinkMacSystemFont, "Malgun Gothic", sans-serif';

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
    setAnimating(true); setMyChoice(choice); setAiChoice(null); setResult(null); setShake(true);
    setTimeout(() => setShake(false), 600);
    setTimeout(() => {
      const ai = CHOICES[Math.floor(Math.random() * 3)].id;
      setAiChoice(ai);
      let res: 'win' | 'lose' | 'draw';
      if (choice === ai) res = 'draw';
      else if (CHOICES.find(c => c.id === choice)?.beats === ai) res = 'win';
      else res = 'lose';
      setResult(res); setScore(prev => ({ ...prev, [res]: prev[res] + 1 }));
      setAiComment(AI_COMMENTS[res][Math.floor(Math.random() * AI_COMMENTS[res].length)]);
      setAnimating(false);
    }, 800);
  }

  function reset() { setMyChoice(null); setAiChoice(null); setResult(null); setAiComment(''); }

  const total = score.win + score.lose + score.draw;
  const winRate = total > 0 ? Math.round((score.win / total) * 100) : 0;

  const resultConfig = {
    win:  { label: '이겼다! 🎉', color: '#107c10', bg: '#f1fdf1' },
    lose: { label: '졌다... 😭', color: '#d13438', bg: '#fdf1f1' },
    draw: { label: '비겼다~ 🤝', color: '#ca5010', bg: '#fdf6f1' },
  };

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
          <span style={{ color: '#323130', fontSize: '0.82rem', fontWeight: 600 }}>가위바위보</span>
        </div>
        <button onClick={() => router.push('/')} style={{ padding: '0.35rem 0.85rem', background: 'transparent', border: '1px solid #8a8886', borderRadius: '2px', cursor: 'pointer', color: '#323130', fontSize: '0.78rem' }}
          onMouseEnter={e => e.currentTarget.style.background = '#f3f2f1'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>메인 채팅</button>
      </nav>

      {/* ── Hero ── */}
      <div style={{ background: 'linear-gradient(135deg, #6b1a1a 0%, #d13438 100%)', padding: '1rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', textAlign: 'center' }}>
        <div style={{ fontSize: '1.75rem', filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.3))' }}>✂️</div>
        <div>
          <p style={{ color: '#ffc8c8', fontSize: '0.62rem', letterSpacing: '1.5px', textTransform: 'uppercase', margin: '0 0 0.15rem', fontWeight: 600 }}>게임 · 대전</p>
          <h1 style={{ color: 'white', fontSize: '1.1rem', fontWeight: 700, margin: '0 0 0.1rem', letterSpacing: '-0.3px' }}>가위바위보</h1>
          <p style={{ color: '#ffb3b3', fontSize: '0.72rem', margin: 0 }}>AI를 이겨라! 과연 가능할까?</p>
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{ padding: '1.5rem 2rem 3rem', maxWidth: '560px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1px' }}>

        {/* 전적 */}
        <div style={{ background: 'white', border: '1px solid #edebe9', padding: '1.1rem 1.25rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            {[['승', score.win, '#107c10'], ['무', score.draw, '#ca5010'], ['패', score.lose, '#d13438']].map(([label, val, color]) => (
              <div key={label as string} style={{ flex: 1, textAlign: 'center', padding: '0.6rem 0.5rem', background: '#f3f2f1', borderTop: `3px solid ${color}` }}>
                <div style={{ fontSize: '1.35rem', fontWeight: 700, color: color as string }}>{val as number}</div>
                <div style={{ fontSize: '0.7rem', color: '#605e5c', fontWeight: 600 }}>{label as string}</div>
              </div>
            ))}
            <div style={{ flex: 1, textAlign: 'center', padding: '0.6rem 0.5rem', background: '#f3f2f1', borderTop: '3px solid #0078D4' }}>
              <div style={{ fontSize: '1.35rem', fontWeight: 700, color: '#0078D4' }}>{winRate}%</div>
              <div style={{ fontSize: '0.7rem', color: '#605e5c', fontWeight: 600 }}>승률</div>
            </div>
            {total > 0 && <button onClick={() => setScore({ win: 0, lose: 0, draw: 0 })} style={{ padding: '0.45rem 0.65rem', background: 'none', border: '1px solid #8a8886', borderRadius: '2px', cursor: 'pointer', fontSize: '0.72rem', color: '#605e5c' }}>초기화</button>}
          </div>
        </div>

        {/* 대전판 */}
        <div style={{ background: 'white', border: '1px solid #edebe9', padding: '2rem 1.5rem', textAlign: 'center' }}>
          {/* VS */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', marginBottom: '1.5rem', minHeight: '110px' }}>
            <div style={{ textAlign: 'center', flex: 1 }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '1.5px', color: '#8a8886', marginBottom: '0.5rem', textTransform: 'uppercase' }}>나</div>
              <div style={{ fontSize: '3.5rem', filter: myChoice ? 'none' : 'grayscale(1) opacity(0.2)', transform: shake && myChoice ? 'scale(1.15)' : 'scale(1)', transition: 'all 0.2s' }}>{myChoice ? CHOICES.find(c => c.id === myChoice)?.emoji : '❓'}</div>
              {myChoice && <div style={{ fontSize: '0.78rem', color: '#323130', fontWeight: 700, marginTop: '0.35rem' }}>{CHOICES.find(c => c.id === myChoice)?.label}</div>}
            </div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#8a8886', background: '#f3f2f1', padding: '0.4rem 0.75rem', border: '1px solid #edebe9' }}>VS</div>
            <div style={{ textAlign: 'center', flex: 1 }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '1.5px', color: '#8a8886', marginBottom: '0.5rem', textTransform: 'uppercase' }}>AI</div>
              <div style={{ fontSize: '3.5rem', filter: aiChoice ? 'none' : 'grayscale(1) opacity(0.2)', transition: 'all 0.2s' }}>{animating && !aiChoice ? '🎲' : aiChoice ? CHOICES.find(c => c.id === aiChoice)?.emoji : '❓'}</div>
              {aiChoice && <div style={{ fontSize: '0.78rem', color: '#323130', fontWeight: 700, marginTop: '0.35rem' }}>{CHOICES.find(c => c.id === aiChoice)?.label}</div>}
            </div>
          </div>

          {/* 결과 */}
          {result && !animating && (
            <div style={{ padding: '0.85rem 1.25rem', background: resultConfig[result].bg, border: `1px solid ${resultConfig[result].color}40`, marginBottom: '1.25rem', borderLeft: `4px solid ${resultConfig[result].color}` }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: resultConfig[result].color }}>{resultConfig[result].label}</div>
              <div style={{ fontSize: '0.78rem', color: '#605e5c', marginTop: '0.2rem' }}>AI: &ldquo;{aiComment}&rdquo;</div>
            </div>
          )}

          {/* 선택 버튼 */}
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', marginBottom: result ? '1rem' : 0 }}>
            {CHOICES.map(c => (
              <button key={c.id} onClick={() => play(c.id)} disabled={animating}
                style={{ flex: 1, padding: '1rem 0.5rem', background: myChoice === c.id && result ? resultConfig[result!]?.bg : 'white', border: `1.5px solid ${myChoice === c.id ? '#d13438' : '#edebe9'}`, cursor: animating ? 'not-allowed' : 'pointer', fontSize: '2.25rem', transition: 'all 0.12s' }}
                onMouseEnter={e => { if (!animating) { e.currentTarget.style.background = '#f3f2f1'; e.currentTarget.style.borderColor = '#d13438'; } }}
                onMouseLeave={e => { e.currentTarget.style.background = myChoice === c.id && result ? resultConfig[result!]?.bg : 'white'; e.currentTarget.style.borderColor = myChoice === c.id ? '#d13438' : '#edebe9'; }}
              >
                {c.emoji}
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#323130', marginTop: '0.3rem' }}>{c.label}</div>
              </button>
            ))}
          </div>

          {result && (
            <button onClick={reset} style={{ padding: '0.55rem 1.75rem', background: '#0078D4', color: 'white', border: 'none', borderRadius: '2px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600 }}
              onMouseEnter={e => e.currentTarget.style.background = '#106ebe'}
              onMouseLeave={e => e.currentTarget.style.background = '#0078D4'}>다시 하기</button>
          )}
        </div>
      </div>
    </div>
  );
}
