'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

function hashNum(seed: number, min: number, max: number) {
  let h = seed;
  h = ((h >> 16) ^ h) * 0x45d9f3b;
  h = ((h >> 16) ^ h) * 0x45d9f3b;
  h = (h >> 16) ^ h;
  return min + (Math.abs(h) % (max - min + 1));
}

const WORK_MSGS = [
  ['오늘은 민원이 나를 비껴가는 날. 평화롭고 순조로운 업무를 기대하세요.', 5],
  ['보고서 한 번에 통과! 상사의 칭찬이 들려올 것 같습니다.', 4],
  ['오전은 순조롭지만 오후에 갑작스러운 업무가 생길 수 있어요.', 3],
  ['오늘 결재가 3번 반려될 수도... 꼼꼼히 확인 후 제출하세요!', 2],
  ['악성 민원의 기운이 감지됩니다. 심호흡하고 대응하세요.', 1],
  ['아이디어가 넘쳐나는 날! 창의적인 기획을 시도해보세요.', 5],
  ['산더미 같은 업무... 하나씩 처리하면 반드시 끝납니다.', 2],
  ['오늘은 모든 일이 착착 맞아떨어지는 날입니다!', 5],
];

const PEOPLE_MSGS = [
  ['팀원과의 관계가 원만한 날. 소소한 칭찬 한 마디가 팀 분위기를 바꿉니다.', 5],
  ['상사의 기분이 좋을 것 같아요. 보고서 제출하기 딱 좋은 날!', 4],
  ['동료의 고민을 들어줄 기회가 생길 수 있어요.', 3],
  ['오늘은 뭔가 말이 꼬이기 쉬운 날. 신중하게 발언하세요.', 2],
  ['팀 내 갈등의 기운이... 중재자 역할이 필요할 수도 있어요.', 2],
  ['새로운 인연이 생길 수도 있는 날. 먼저 인사해보세요!', 4],
  ['상사가 깐깐한 하루. 꼼꼼하게 준비해 당당하게 보고하세요.', 3],
  ['팀워크가 빛나는 날! 협업 프로젝트를 시작하기 좋아요.', 5],
];

const LUNCH_MSGS = [
  ['오늘의 점심은 한식이 좋습니다. 따뜻한 국밥으로 에너지 충전!', 5],
  ['중식이 최고의 선택! 짬뽕의 기운이 업무 스트레스를 날려줍니다.', 4],
  ['가볍게 분식으로! 떡볶이가 기분을 업시켜 줄 것 같아요.', 4],
  ['일식의 날. 정갈한 도시락이나 초밥으로 기분 전환!', 4],
  ['오늘은 혼밥이 최고. 조용히 혼자만의 점심 시간을 가져보세요.', 3],
  ['팀원들과 함께 먹으면 배가 더 맛있는 날!', 5],
  ['편의점 도시락도 나쁘지 않아요. 간단하게 해결하고 산책을!', 3],
  ['오늘은 뭘 먹어도 맛있는 날! 평소에 못 간 맛집에 도전해봐요.', 5],
];

const LEAVE_MSGS = [
  ['오늘은 칼퇴의 기운이 강합니다! 이미 짐은 싸두세요.', 5],
  ['정시 퇴근 가능성 높음. 퇴근 후 계획을 세워두세요!', 4],
  ['오후 늦게 갑자기 일이 생길 수 있어요. 마음의 준비를...', 2],
  ['야근의 기운이 느껴집니다. 오전에 최대한 업무를 끝내두세요!', 1],
  ['미리 업무를 처리해두면 정시 퇴근이 가능해요.', 3],
  ['상사의 퇴근이 빠를 것 같은 날. 따라서 나올 기회!', 5],
  ['오늘은 자원해서 일찍 퇴근하는 행운의 날?', 4],
  ['퇴근 후 맛있는 저녁과 함께 피로를 풀어보세요!', 5],
];

function getFortune(date: Date) {
  const seed = date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
  const wi = hashNum(seed * 7, 0, WORK_MSGS.length - 1);
  const pi = hashNum(seed * 13, 0, PEOPLE_MSGS.length - 1);
  const li = hashNum(seed * 19, 0, LUNCH_MSGS.length - 1);
  const qi = hashNum(seed * 31, 0, LEAVE_MSGS.length - 1);
  return {
    work:   { msg: WORK_MSGS[wi][0]   as string, stars: WORK_MSGS[wi][1]   as number },
    people: { msg: PEOPLE_MSGS[pi][0] as string, stars: PEOPLE_MSGS[pi][1] as number },
    lunch:  { msg: LUNCH_MSGS[li][0]  as string, stars: LUNCH_MSGS[li][1]  as number },
    leave:  { msg: LEAVE_MSGS[qi][0]  as string, stars: LEAVE_MSGS[qi][1]  as number },
  };
}

function Stars({ n }: { n: number }) {
  return (
    <span style={{ letterSpacing: '2px', fontSize: '1rem' }}>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} style={{ color: i < n ? '#f59e0b' : '#d1d5db' }}>★</span>
      ))}
    </span>
  );
}

export default function FortunePage() {
  const router = useRouter();
  const [date] = useState(new Date());
  const fortune = getFortune(date);
  const dateStr = `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;

  useEffect(() => { document.title = '오늘의 운세 | FuN fUn'; }, []);

  const cards = [
    { emoji: '💼', label: '업무운', data: fortune.work,   color: '#3b82f6', bg: '#eff6ff' },
    { emoji: '🤝', label: '대인관계운', data: fortune.people, color: '#10b981', bg: '#ecfdf5' },
    { emoji: '🍱', label: '점심운', data: fortune.lunch,  color: '#f59e0b', bg: '#fffbeb' },
    { emoji: '🏠', label: '퇴근운', data: fortune.leave,  color: '#8b5cf6', bg: '#f5f3ff' },
  ];

  const totalStars = cards.reduce((s, c) => s + c.data.stars, 0);
  const avgStars = totalStars / cards.length;

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #fdf4ff 0%, #f5f0ff 100%)', padding: '1.5rem 1rem' }}>
      <div style={{ maxWidth: '480px', margin: '0 auto' }}>
        <button onClick={() => router.push('/fun')} style={{ marginBottom: '1.5rem', padding: '0.5rem 1rem', background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', color: '#374151' }}>
          ← FuN fUn 홈
        </button>

        <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 4px 16px rgba(236,72,153,0.15)', textAlign: 'center' }}>
          <h1 style={{ margin: '0 0 0.25rem 0', fontSize: '1.5rem', fontWeight: 900, color: '#9d174d' }}>🔮 오늘의 업무 운세</h1>
          <p style={{ margin: 0, color: '#6b7280', fontSize: '0.88rem' }}>{dateStr}</p>

          <div style={{ margin: '1rem 0 0.5rem 0', fontSize: '0.9rem', color: '#374151' }}>오늘의 종합 운세</div>
          <Stars n={Math.round(avgStars)} />
          <div style={{ fontSize: '0.78rem', color: '#9ca3af', marginTop: '0.25rem' }}>
            {avgStars >= 4.5 ? '최고의 하루!' : avgStars >= 3.5 ? '순조로운 하루' : avgStars >= 2.5 ? '평범한 하루' : '조심스러운 하루'}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {cards.map(c => (
            <div key={c.label} style={{ background: 'white', borderRadius: '14px', padding: '1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderLeft: `4px solid ${c.color}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1.3rem' }}>{c.emoji}</span>
                  <span style={{ fontWeight: 800, color: '#1f2937', fontSize: '0.95rem' }}>{c.label}</span>
                </div>
                <Stars n={c.data.stars} />
              </div>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#4b5563', lineHeight: 1.6 }}>{c.data.msg}</p>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'white', borderRadius: '12px', textAlign: 'center', color: '#9ca3af', fontSize: '0.78rem', boxShadow: '0 2px 4px rgba(0,0,0,0.04)' }}>
          🔮 오늘의 운세는 날짜를 기반으로 생성됩니다.<br />재미로만 즐겨주세요!
        </div>
      </div>
    </div>
  );
}
