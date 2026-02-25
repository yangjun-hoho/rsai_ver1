'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const QUESTIONS = [
  /* E/I */
  { id: 1, dim: 'EI', q: '퇴근 후 무엇이 더 끌리나요?', a: '동료들과 회식 한 잔!', b: '집에서 혼자 넷플릭스 정주행' },
  { id: 2, dim: 'EI', q: '회의 중 좋은 아이디어가 떠오르면?', a: '바로 손 들고 발언한다', b: '메모해두고 나중에 정리해서 말한다' },
  { id: 3, dim: 'EI', q: '새 업무를 시작할 때?', a: '팀원들과 함께 브레인스토밍', b: '혼자 먼저 구상하고 정리' },
  { id: 4, dim: 'EI', q: '점심시간이라면?', a: '동료들과 왁자지껄 함께 식사', b: '혼자 조용히, 또는 짧게 먹고 충전' },
  { id: 5, dim: 'EI', q: '낯선 사람이 많은 행사에서?', a: '먼저 다가가 말 건네기', b: '아는 사람 찾거나 조용히 관찰' },
  /* S/N */
  { id: 6, dim: 'SN', q: '보고서를 쓸 때 나는?', a: '현황 데이터와 수치부터 정리', b: '전체 방향과 스토리를 먼저 잡는다' },
  { id: 7, dim: 'SN', q: '새 시스템 도입 제안을 들으면?', a: '현재 업무에 얼마나 실용적인가 따진다', b: '미래 가능성과 발전성이 먼저 보인다' },
  { id: 8, dim: 'SN', q: '문제 해결 방식은?', a: '과거 검증된 방법을 먼저 찾는다', b: '창의적인 새로운 방법을 시도해본다' },
  { id: 9, dim: 'SN', q: '업무 설명을 들을 때 집중하는 것은?', a: '구체적인 절차와 단계별 방법', b: '전체 맥락과 목적, 큰 그림' },
  { id: 10, dim: 'SN', q: '아이디어를 제안할 때 강조하는 건?', a: '현실적이고 실행 가능한 방안', b: '가능성과 잠재력, 미래 비전' },
  /* T/F */
  { id: 11, dim: 'TF', q: '동료가 실수로 민원을 일으켰을 때?', a: '원인을 분석하고 재발 방지책 먼저', b: '일단 "괜찮아?" 위로가 먼저' },
  { id: 12, dim: 'TF', q: '중요한 의사결정 시 더 중요한 것은?', a: '객관적 데이터와 논리', b: '팀 분위기와 구성원 감정' },
  { id: 13, dim: 'TF', q: '부당한 지시를 받았을 때?', a: '논리적으로 반박하고 설득한다', b: '상황을 고려해 부드럽게 의견을 낸다' },
  { id: 14, dim: 'TF', q: '팀원을 평가할 때?', a: '성과와 결과물 위주로 평가', b: '노력과 과정도 함께 고려' },
  { id: 15, dim: 'TF', q: '팀 내 갈등 해결 방식은?', a: '사실 기반으로 토론해서 결론을 낸다', b: '서로의 입장을 이해하고 공감부터' },
  /* J/P */
  { id: 16, dim: 'JP', q: '업무 스타일은?', a: '미리 계획 세우고 순서대로 처리', b: '상황에 따라 유연하게 대응' },
  { id: 17, dim: 'JP', q: '마감 처리 방식은?', a: '미리미리 여유 있게 끝낸다', b: '마감 전날 집중력 폭발시킨다' },
  { id: 18, dim: 'JP', q: '갑작스러운 일정 변경이 생기면?', a: '스트레스 받고 계획 재정비가 필요하다', b: '유연하게 받아들이고 즉흥 대응' },
  { id: 19, dim: 'JP', q: '책상 상태는?', a: '항상 정리정돈, 제자리에 있어야 안심', b: '필요한 것들이 손 닿는 곳에 나와있다' },
  { id: 20, dim: 'JP', q: '업무 계획서 작성 스타일은?', a: '세세한 일정까지 다 적는다', b: '큰 흐름만 잡고 세부는 나중에' },
];

const DIM_LABELS: Record<string, { label: string; color: string }> = {
  EI: { label: 'E · I', color: '#6366f1' },
  SN: { label: 'S · N', color: '#10b981' },
  TF: { label: 'T · F', color: '#f59e0b' },
  JP: { label: 'J · P', color: '#ef4444' },
};

const RESULTS: Record<string, { emoji: string; name: string; desc: string; tip: string }> = {
  ISTJ: { emoji: '📋', name: '청렴결백 원칙주의자', desc: '규정과 원칙을 목숨보다 소중히 여기는 공무원의 정석! 업무 완성도가 압도적이며, 당신이 있어 조직이 돌아갑니다.', tip: '가끔은 유연성도 발휘해봐요~' },
  ISFJ: { emoji: '🛡️', name: '든든한 팀의 수호자', desc: '남 챙기다 정작 본인은 밥도 못 먹는 타입. 팀원들이 당신을 가장 믿고 의지합니다.', tip: '본인도 챙겨야 오래 달릴 수 있어요!' },
  INFJ: { emoji: '🌱', name: '선의의 조직 옹호자', desc: '팀 분위기를 항상 살피고 구성원의 성장을 돕습니다. 조용하지만 영향력이 크죠.', tip: '완벽주의 조금 내려놓으면 더 편해요' },
  INTJ: { emoji: '♟️', name: '용의주도한 전략가', desc: '5년 뒤 부서 발전 계획을 이미 그려놓은 타입. 장기 계획과 시스템 개선의 달인.', tip: '가끔 팀원들 의견도 들어봐요~' },
  ISTP: { emoji: '🔧', name: '만능 문제해결사', desc: '현장에서 빛나는 실용주의자. 말보다 행동으로 문제를 해결합니다.', tip: '보고서도 좀 써줘요 부탁해요 ㅠ' },
  ISFP: { emoji: '🎨', name: '조화로운 팀의 윤활유', desc: '팀원 모두와 사이좋게 지내는 평화주의자. 갈등 없는 팀 분위기의 숨은 주역.', tip: '본인의 의견도 좀 더 표현해봐요!' },
  INFP: { emoji: '🌟', name: '열정적인 이상주의자', desc: '행정의 의미와 가치를 깊이 생각합니다. 민원인 한 명 한 명을 진심으로 대합니다.', tip: '현실적인 것도 놓치지 말아요~' },
  INTP: { emoji: '🔬', name: '논리적 분석 전문가', desc: '문제의 근본 원인을 파고드는 타입. 정책 분석 보고서의 달인입니다.', tip: '결론을 좀 더 빨리 내봐요 ㅋ' },
  ESTP: { emoji: '⚡', name: '추진력 넘치는 행동파', desc: '회의보다 실행! 생각보다 행동! 추진력이 넘쳐 조직에 활력을 불어넣습니다.', tip: '계획도 좀 세우면 금상첨화~' },
  ESFP: { emoji: '🎉', name: '팀 분위기 메이커', desc: '당신이 있으면 회식이 두 배 재미있어집니다. 낙관적인 에너지로 팀을 밝게 해요.', tip: '집중력이 필요할 땐 조금 조용히 ㅎ' },
  ENFP: { emoji: '💡', name: '창의적인 아이디어뱅크', desc: '하루에도 아이디어가 수십 개! 새로운 시도를 두려워하지 않습니다.', tip: '마무리도 잘 해줘야 인정받아요~' },
  ENTP: { emoji: '💬', name: '논쟁을 즐기는 혁신가', desc: '회의에서 항상 "그런데 말이죠..."를 외치는 타입. 조직 혁신의 불씨를 당깁니다.', tip: '남의 의견도 끝까지 들어봐요~' },
  ESTJ: { emoji: '⚖️', name: '원칙주의 관리자', desc: '규정대로, 절차대로. 당신이 있으면 감사 걱정 없습니다. 조직의 든든한 기둥.', tip: '가끔은 융통성도 발휘해봐요~' },
  ESFJ: { emoji: '🤝', name: '따뜻한 팀의 허브', desc: '생일도 다 기억하고 팀 화합을 위해 헌신합니다. 모두가 좋아하는 그 분.', tip: 'NO라고도 말할 줄 알아야 해요!' },
  ENFJ: { emoji: '🏆', name: '팀을 이끄는 리더형', desc: '팀원의 강점을 찾아주고 성장을 이끄는 타고난 리더. 미래의 과장님 후보.', tip: '본인 업무도 잊지 마세요~' },
  ENTJ: { emoji: '👑', name: '대담한 통솔자', desc: '비효율을 보면 참지 못하는 개혁파. 회의를 주도하고 결론을 만들어냅니다.', tip: '팀원들 페이스도 맞춰줘요~' },
};

export default function MBTIPage() {
  const router = useRouter();
  const [current, setCurrent] = useState(0);          // 현재 문항 인덱스
  const [answers, setAnswers] = useState<('a' | 'b')[]>([]); // 답변 배열
  const [selected, setSelected] = useState<'a' | 'b' | null>(null); // 선택 직후 강조
  const [result, setResult] = useState<string | null>(null);

  useEffect(() => { document.title = 'MBTI 테스트 | FuN fUn'; }, []);

  const q = QUESTIONS[current];
  const isLast = current === QUESTIONS.length - 1;
  const dim = DIM_LABELS[q?.dim ?? 'EI'];

  function choose(opt: 'a' | 'b') {
    if (selected !== null) return; // 이미 선택 중이면 무시
    setSelected(opt);

    setTimeout(() => {
      const newAnswers = [...answers];
      newAnswers[current] = opt;
      setAnswers(newAnswers);
      setSelected(null);

      if (isLast) {
        // 결과 계산
        let E = 0, I = 0, S = 0, N = 0, T = 0, F = 0, J = 0, P = 0;
        QUESTIONS.forEach((question, idx) => {
          const ans = newAnswers[idx];
          if (!ans) return;
          if (question.dim === 'EI') ans === 'a' ? E++ : I++;
          if (question.dim === 'SN') ans === 'b' ? N++ : S++;
          if (question.dim === 'TF') ans === 'a' ? T++ : F++;
          if (question.dim === 'JP') ans === 'a' ? J++ : P++;
        });
        setResult(`${E >= I ? 'E' : 'I'}${S >= N ? 'S' : 'N'}${T >= F ? 'T' : 'F'}${J >= P ? 'J' : 'P'}`);
      } else {
        setCurrent(prev => prev + 1);
      }
    }, 500);
  }

  function goBack() {
    if (selected !== null) return;
    if (current > 0) {
      setCurrent(prev => prev - 1);
    }
  }

  function reset() {
    setCurrent(0);
    setAnswers([]);
    setSelected(null);
    setResult(null);
  }

  const res = result ? RESULTS[result] : null;

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #eef2ff 0%, #f5f3ff 100%)', padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column' }}>
      <div style={{ maxWidth: '520px', margin: '0 auto', width: '100%' }}>
        <button onClick={() => router.push('/fun')} style={{ marginBottom: '1.5rem', padding: '0.5rem 1rem', background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', color: '#374151' }}>
          ← FuN fUn 홈
        </button>

        {!result ? (
          <>
            {/* 헤더 + 진행바 */}
            <div style={{ background: 'white', borderRadius: '16px', padding: '1.25rem 1.5rem', marginBottom: '1.25rem', boxShadow: '0 4px 16px rgba(99,102,241,0.12)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <h1 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900, color: '#4338ca' }}>🧠 공무원 MBTI 테스트</h1>
                <span style={{ padding: '0.2rem 0.75rem', background: dim.color + '18', color: dim.color, borderRadius: '20px', fontSize: '0.8rem', fontWeight: 800 }}>
                  {dim.label}
                </span>
              </div>
              <div style={{ background: '#eef2ff', borderRadius: '8px', height: '8px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${((current + 1) / QUESTIONS.length) * 100}%`, background: `linear-gradient(90deg, ${dim.color}, #8b5cf6)`, borderRadius: '8px', transition: 'width 0.4s ease' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.4rem' }}>
                <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Q{current + 1} / {QUESTIONS.length}</span>
                <span style={{ fontSize: '0.75rem', color: '#6366f1', fontWeight: 700 }}>{Math.round(((current + 1) / QUESTIONS.length) * 100)}%</span>
              </div>
            </div>

            {/* 질문 카드 */}
            <div style={{ background: 'white', borderRadius: '16px', padding: '2rem 1.5rem', boxShadow: '0 2px 12px rgba(99,102,241,0.1)' }}>
              <p style={{ margin: '0 0 1.75rem 0', fontWeight: 700, color: '#1f2937', fontSize: '1.05rem', lineHeight: 1.65, textAlign: 'center' }}>
                {q.q}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {(['a', 'b'] as const).map(opt => {
                  const isChosen = selected === opt || answers[current] === opt;
                  const isOther = selected !== null && selected !== opt;
                  return (
                    <button
                      key={opt}
                      onClick={() => choose(opt)}
                      disabled={selected !== null}
                      style={{
                        padding: '0.85rem 1.25rem',
                        borderRadius: '12px',
                        border: `2px solid ${isChosen ? '#6366f1' : '#e5e7eb'}`,
                        background: isChosen ? '#eef2ff' : isOther ? '#f9fafb' : 'white',
                        color: isChosen ? '#4338ca' : isOther ? '#9ca3af' : '#374151',
                        fontWeight: isChosen ? 700 : 500,
                        cursor: selected !== null ? 'not-allowed' : 'pointer',
                        fontSize: '0.92rem',
                        textAlign: 'left',
                        transition: 'all 0.15s',
                        opacity: isOther ? 0.5 : 1,
                        transform: isChosen ? 'scale(1.01)' : 'scale(1)',
                      }}
                    >
                      <span style={{ fontWeight: 800, marginRight: '0.5rem', color: isChosen ? '#6366f1' : '#9ca3af' }}>
                        {opt === 'a' ? 'A' : 'B'}
                      </span>
                      {opt === 'a' ? q.a : q.b}
                    </button>
                  );
                })}
              </div>

              {/* 이전 버튼 */}
              {current > 0 && selected === null && (
                <button
                  onClick={goBack}
                  style={{ marginTop: '1.25rem', padding: '0.55rem 1.25rem', background: 'none', border: '1px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer', fontSize: '0.82rem', color: '#6b7280' }}
                >
                  ← 이전 문항으로
                </button>
              )}
            </div>
          </>
        ) : res ? (
          <div style={{ background: 'white', borderRadius: '20px', padding: '2.5rem 2rem', textAlign: 'center', boxShadow: '0 8px 32px rgba(99,102,241,0.2)' }}>
            <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>{res.emoji}</div>
            <div style={{ display: 'inline-block', padding: '0.4rem 1.25rem', background: 'linear-gradient(90deg, #6366f1, #8b5cf6)', color: 'white', borderRadius: '20px', fontSize: '1.5rem', fontWeight: 900, marginBottom: '0.75rem' }}>{result}</div>
            <h2 style={{ margin: '0.5rem 0 1rem 0', fontSize: '1.3rem', fontWeight: 800, color: '#1f2937' }}>{res.name}</h2>
            <p style={{ color: '#4b5563', lineHeight: 1.7, marginBottom: '1.25rem', fontSize: '0.95rem' }}>{res.desc}</p>
            <div style={{ padding: '0.75rem 1.25rem', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '10px', color: '#92400e', fontSize: '0.85rem', marginBottom: '2rem' }}>
              💡 {res.tip}
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={reset} style={{ flex: 1, padding: '0.75rem', background: '#eef2ff', color: '#6366f1', border: '2px solid #6366f1', borderRadius: '10px', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer' }}>다시 하기</button>
              <button onClick={() => router.push('/fun')} style={{ flex: 1, padding: '0.75rem', background: 'linear-gradient(90deg, #6366f1, #8b5cf6)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer' }}>FuN fUn 홈</button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
