import { TemplateConfig } from '../../types';

export const emailReplyConfig: TemplateConfig = {
  id: 'email-reply',
  name: '메일 회신',
  icon: '📧',
  description: '공식 업무 이메일에 대한 회신을 자동으로 작성합니다',
  category: '문서',
  apiPath: '/api/templates/email-reply',
  fields: [
    {
      key: 'originalMail',
      label: '원본 메일 내용',
      type: 'textarea',
      placeholder: '회신할 메일 내용을 붙여넣기 하세요...',
      required: true,
      rows: 6,
    },
    {
      key: 'replyDirection',
      label: '회신 방향',
      type: 'textarea',
      placeholder: '예: 협조 요청에 동의, 일정 조율 필요, 담당자 연결 안내 등',
      required: true,
      rows: 3,
    },
    {
      key: 'tone',
      label: '회신 어조',
      type: 'select',
      options: [
        { value: 'formal', label: '공식적 (대외 기관)' },
        { value: 'semi-formal', label: '준공식적 (협력기관)' },
        { value: 'internal', label: '내부 업무' },
      ],
    },
    {
      key: 'senderInfo',
      label: '발신자 정보',
      type: 'text',
      placeholder: '예: 홍길동 주무관 / 기획예산과',
    },
  ],
};
