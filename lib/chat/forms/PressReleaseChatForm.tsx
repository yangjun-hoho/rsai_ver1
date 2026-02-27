'use client';

import { useState } from 'react';
import { S } from './chatFormStyles';
import TitleSelector from '@/lib/work-support/press-release/TitleSelector';

interface Props {
  onSubmit: (data: Record<string, unknown>) => void;
  onCancel: () => void;
  isLoading: boolean;
  onLoadingChange?: (loading: boolean) => void;
}

export default function PressReleaseChatForm({ onSubmit, onCancel, isLoading, onLoadingChange }: Props) {
  const [coreContent, setCoreContent] = useState('');
  const [keywords, setKeywords]       = useState(['', '', '', '', '', '']);
  const [step, setStep]               = useState<'input' | 'selectTitle'>('input');
  const [titles, setTitles]           = useState<string[]>([]);
  const [selectedTitle, setSelectedTitle] = useState('');
  const [generating, setGenerating]   = useState(false);
  const [savedContent, setSavedContent]   = useState('');
  const [savedKeywords, setSavedKeywords] = useState<string[]>([]);

  const len = coreContent.trim().length;
  const isValid = len > 0 && len <= 1000;
  const busy = isLoading || generating;

  function updateKeyword(i: number, v: string) {
    const next = [...keywords];
    next[i] = v;
    setKeywords(next);
  }

  async function handleGenerateTitles(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid || busy) return;
    const cleanedKeywords = keywords.map(k => k.trim()).filter(Boolean);
    setSavedContent(coreContent.trim());
    setSavedKeywords(cleanedKeywords);
    setGenerating(true);
    try {
      const res = await fetch('/api/work-support/press-release', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'generateTitles', coreContent: coreContent.trim(), keywords: cleanedKeywords }),
      });
      const result = await res.json();
      if (result.titles?.length) {
        setTitles(result.titles);
        setStep('selectTitle');
      }
    } catch { /* ignore */ }
    finally { setGenerating(false); }
  }

  async function handleSelectTitle(title: string) {
    if (busy) return;
    setSelectedTitle(title);
    setGenerating(true);
    onLoadingChange?.(true);
    try {
      const res = await fetch('/api/work-support/press-release', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'generatePressRelease', title, coreContent: savedContent, keywords: savedKeywords }),
      });
      const result = await res.json();
      if (result.pressRelease) {
        onSubmit({ pressRelease: result.pressRelease });
      }
    } catch { /* ignore */ }
    finally { setGenerating(false); onLoadingChange?.(false); }
  }

  if (step === 'selectTitle') {
    return (
      <div style={S.card}>
        <div style={S.header}>
          <h3 style={S.h3}>📰 보도자료 생성</h3>
          <p style={S.desc}>
            {generating ? '보도자료를 생성하고 있습니다...' : '제목을 선택하면 보도자료가 자동 생성됩니다'}
          </p>
        </div>
        <div style={{ ...S.content }}>
          <TitleSelector
            titles={titles}
            onSelect={handleSelectTitle}
            isLoading={generating}
            selectedTitle={selectedTitle}
            onBack={() => { setStep('input'); setSelectedTitle(''); }}
          />
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleGenerateTitles} style={S.card}>
      <div style={S.header}>
        <h3 style={S.h3}>📰 보도자료 생성</h3>
        <p style={S.desc}>핵심 내용과 키워드를 입력하세요</p>
      </div>

      <div style={S.content}>
        {/* 핵심 내용 */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
            <label style={{ ...S.label, marginBottom: 0 }}>핵심 내용 *</label>
            <span style={{
              fontSize: '0.78rem', padding: '0.1rem 0.35rem', borderRadius: '10px',
              background: isValid ? '#d4edda' : len > 0 ? '#f8d7da' : '#e9ecef',
              color: isValid ? '#155724' : len > 0 ? '#721c24' : '#6c757d',
            }}>
              {len}/1000자
            </span>
          </div>
          <textarea
            style={{ ...S.input, resize: 'vertical', minHeight: '80px', lineHeight: 1.4 }}
            placeholder={'보도자료의 핵심 내용을 작성해주세요. (최대 1000자)\n\n예시: 남양주시가 새로운 AI 기반 업무지원 서비스를 출시합니다...'}
            value={coreContent}
            onChange={e => setCoreContent(e.target.value)}
            disabled={busy}
          />
        </div>

        {/* 핵심 키워드 */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
            <label style={{ ...S.label, marginBottom: 0 }}>핵심 키워드 (선택)</label>
            <span style={{ fontSize: '0.78rem', color: '#6c757d' }}>{keywords.filter(k => k.trim()).length}/6개</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.35rem' }}>
            {keywords.map((kw, i) => (
              <input
                key={i}
                type="text"
                style={{ ...S.input, borderColor: kw.trim() ? '#28a745' : '#e9e9e7', background: kw.trim() ? '#f8fff8' : 'white' }}
                placeholder={`키워드 ${i + 1}`}
                value={kw}
                onChange={e => updateKeyword(i, e.target.value)}
                maxLength={20}
                disabled={busy}
              />
            ))}
          </div>
        </div>
      </div>

      <div style={S.actions}>
        <button type="button" style={S.cancelBtn} onClick={onCancel} disabled={busy}>취소</button>
        <button type="submit" style={{ ...S.submitBtn, opacity: !isValid || busy ? 0.5 : 1 }} disabled={!isValid || busy}>
          {generating ? '제목 생성 중...' : '제목 생성하기'}
        </button>
      </div>
    </form>
  );
}
