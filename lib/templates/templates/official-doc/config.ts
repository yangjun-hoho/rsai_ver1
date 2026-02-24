import { TemplateConfig } from '../../types';

export const nationalComplaintBetaConfig: TemplateConfig = {
  id: 'national-complaint-beta',
  name: '국민신문고 beta',
  icon: '🏛️✨',
  description: '국민신문고 답변을 구조화 서식 + 스트리밍으로 실시간 생성합니다',
  category: '민원',
  apiPath: '/api/templates/national-complaint-beta',
  streaming: true,
  fields: [
    {
      key: 'category',
      label: '민원 분류',
      type: 'select',
      required: true,
      options: [
        { value: '생활불편', label: '생활불편' },
        { value: '행정서비스', label: '행정서비스' },
        { value: '건축/토지', label: '건축/토지' },
        { value: '교통', label: '교통' },
        { value: '환경', label: '환경' },
        { value: '복지', label: '복지' },
        { value: '기타', label: '기타' },
      ],
    },
    {
      key: 'complaintContent',
      label: '민원 내용',
      type: 'textarea',
      placeholder: '민원인이 제출한 내용을 입력하세요...',
      required: true,
      rows: 6,
    },
    {
      key: 'responseKeywords',
      label: '답변 핵심 키워드',
      type: 'checkbox-group',
      options: [
        { value: '현장확인', label: '현장확인' },
        { value: '관련법', label: '관련법' },
        { value: '조치', label: '조치' },
      ],
    },
    {
      key: 'extraKeywords',
      label: '기타 키워드',
      type: 'text',
      placeholder: '예: 민원인 상담 완료, 예산 검토 중',
    },
    {
      key: 'department',
      label: '담당 부서',
      type: 'text',
      placeholder: '예: 도시과, 민원봉사과',
    },
  ],
};
