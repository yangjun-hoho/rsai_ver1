export interface ScenarioTemplate {
  id: string;
  name: string;
  icon: string;
  description: string;
  placeholder: string;
  tips: string[];
}

export const templates: ScenarioTemplate[] = [
  {
    id: 'presentation',
    name: '발표 대본',
    icon: '📊',
    description: '프레젠테이션을 위한 체계적인 발표 대본',
    placeholder: '발표 주제와 핵심 내용을 입력하세요.\n예) 2024년 남양주시 관광 활성화 사업 성과 보고',
    tips: [
      '도입부에서 청중의 관심을 끄는 질문이나 사실로 시작하세요',
      '각 섹션은 전환 멘트로 자연스럽게 연결하세요',
      '마무리에서 핵심 메시지를 다시 한번 강조하세요',
    ],
  },
  {
    id: 'speech',
    name: '연설문',
    icon: '🎤',
    description: '공식 행사를 위한 격식 있는 연설문',
    placeholder: '연설의 목적과 주요 메시지를 입력하세요.\n예) 시민의 날 기념 시장 연설 - 시민과 함께하는 남양주',
    tips: [
      '청중에 대한 감사와 존중으로 시작하세요',
      '감동적인 사례나 이야기를 포함하세요',
      '행동을 촉구하는 강력한 마무리로 끝내세요',
    ],
  },
  {
    id: 'lecture',
    name: '강의 대본',
    icon: '📚',
    description: '교육적 효과를 극대화하는 강의 대본',
    placeholder: '강의 주제와 학습 목표를 입력하세요.\n예) 공공행정의 이해 - 지방자치의 역할과 시민 참여',
    tips: [
      '학습 목표를 명확히 제시하세요',
      '예시와 사례를 풍부하게 활용하세요',
      '중간중간 질문으로 참여를 유도하세요',
    ],
  },
  {
    id: 'ceremony',
    name: '행사 사회',
    icon: '🎙️',
    description: '행사 진행을 위한 사회 대본',
    placeholder: '행사 유형과 순서를 입력하세요.\n예) 남양주시 체육대회 개회식 사회 (내빈 소개, 개회선언, 선서 등)',
    tips: [
      '각 순서 전환 시 자연스러운 연결 멘트를 준비하세요',
      '시간 안배를 고려한 간결한 표현을 사용하세요',
      '돌발 상황에 대비한 여유 멘트를 준비하세요',
    ],
  },
];

export const templateUtils = {
  getTemplate(id: string): ScenarioTemplate | undefined {
    return templates.find((t) => t.id === id);
  },

  generatePromptContext(templateId: string, style: string, audience: string): string {
    const template = templateUtils.getTemplate(templateId);
    const parts: string[] = [];
    if (template) parts.push(`대본 유형: ${template.name}`);
    if (style) parts.push(`발표 스타일: ${style}`);
    if (audience) parts.push(`대상 청중: ${audience}`);
    return parts.join('\n');
  },

  validateSettings(templateId: string, content: string): string | null {
    if (!templateId) return '대본 유형을 선택해주세요.';
    if (!content?.trim()) return '내용을 입력해주세요.';
    if (content.trim().length < 10) return '내용을 더 상세히 입력해주세요.';
    return null;
  },
};
