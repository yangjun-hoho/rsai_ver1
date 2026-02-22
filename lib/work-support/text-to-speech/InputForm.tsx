'use client';

import { useState, useRef } from 'react';

interface TTSInputFormProps {
  currentText: string;
  selectedVoice: string;
  speechRate: number;
  speechPitch: number;
  isGenerating: boolean;
  onGenerate: (data: { text: string; voice: string; rate: number; pitch: number; language: string }) => void;
}

const voices = [
  { id: 'ko-KR-SunHiNeural', name: '선희 (여성, 한국어)', gender: 'female', lang: 'ko' },
  { id: 'ko-KR-InJoonNeural', name: '인준 (남성, 한국어)', gender: 'male', lang: 'ko' },
  { id: 'ko-KR-HyunsuNeural', name: '현수 (남성, 한국어)', gender: 'male', lang: 'ko' },
  { id: 'en-US-JennyNeural', name: 'Jenny (여성, 영어)', gender: 'female', lang: 'en' },
  { id: 'en-US-GuyNeural', name: 'Guy (남성, 영어)', gender: 'male', lang: 'en' },
];

const inputStyle: React.CSSProperties = { width: '100%', padding: '0.4rem 0.6rem', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '0.8rem', background: 'var(--input-background)', color: 'var(--text-primary)', boxSizing: 'border-box' };
const labelStyle: React.CSSProperties = { fontSize: '0.78rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '0.25rem', display: 'block' };

export default function TTSInputForm({ isGenerating, onGenerate }: TTSInputFormProps) {
  const [text, setText] = useState('');
  const [voice, setVoice] = useState('ko-KR-SunHiNeural');
  const [rate, setRate] = useState(0);
  const [pitch, setPitch] = useState(0);
  const [activeTab, setActiveTab] = useState<'settings' | 'text' | 'file'>('settings');
  const fileRef = useRef<HTMLInputElement>(null);

  const selectedLang = voices.find(v => v.id === voice)?.lang || 'ko';
  const filteredVoices = voices.filter(v => v.lang === selectedLang);

  function handleFileChange(file: File) {
    const reader = new FileReader();
    reader.onload = e => { if (typeof e.target?.result === 'string') { setText(e.target.result); setActiveTab('text'); } };
    reader.readAsText(file, 'utf-8');
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) { alert('변환할 텍스트를 입력해주세요.'); return; }
    onGenerate({ text, voice, rate, pitch, language: selectedLang });
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div style={{ paddingBottom: '0.6rem', borderBottom: '1px solid var(--border-color)' }}>
        <h2 style={{ margin: 0, fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-secondary)' }}>Text-to-Speech Settings</h2>
      </div>

      {/* 탭 */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)' }}>
        {(['settings', 'text', 'file'] as const).map(tab => (
          <button key={tab} type="button" onClick={() => setActiveTab(tab)} style={{ flex: 1, padding: '0.4rem 0.25rem', border: 'none', borderBottom: `2px solid ${activeTab === tab ? 'var(--focus-color)' : 'transparent'}`, background: 'none', color: activeTab === tab ? 'var(--focus-color)' : 'var(--text-muted)', fontSize: '0.72rem', cursor: 'pointer', fontWeight: activeTab === tab ? '600' : '400' }}>
            {tab === 'settings' ? '⚙️ 설정' : tab === 'text' ? '📝 텍스트' : '📎 파일'}
          </button>
        ))}
      </div>

      {activeTab === 'settings' && (
        <>
          <div>
            <label style={labelStyle}>언어</label>
            <select style={inputStyle} value={selectedLang} onChange={e => { const lang = e.target.value; setVoice(voices.find(v => v.lang === lang)?.id || 'ko-KR-SunHiNeural'); }}>
              <option value="ko">한국어</option>
              <option value="en">영어</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>음성 선택</label>
            <select style={inputStyle} value={voice} onChange={e => setVoice(e.target.value)}>
              {filteredVoices.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>속도: {rate > 0 ? `+${rate}%` : `${rate}%`}</label>
            <input type="range" min="-50" max="100" step="5" value={rate} onChange={e => setRate(Number(e.target.value))} style={{ width: '100%' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--text-muted)' }}>
              <span>느리게</span><span>보통</span><span>빠르게</span>
            </div>
          </div>
          <div>
            <label style={labelStyle}>음높이: {pitch > 0 ? `+${pitch}Hz` : `${pitch}Hz`}</label>
            <input type="range" min="-50" max="50" step="5" value={pitch} onChange={e => setPitch(Number(e.target.value))} style={{ width: '100%' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--text-muted)' }}>
              <span>낮게</span><span>보통</span><span>높게</span>
            </div>
          </div>
        </>
      )}

      {activeTab === 'text' && (
        <div>
          <label style={labelStyle}>변환할 텍스트 *</label>
          <textarea style={{ ...inputStyle, resize: 'vertical', minHeight: '200px', fontFamily: 'inherit' }} placeholder="음성으로 변환할 텍스트를 입력하세요..." value={text} onChange={e => setText(e.target.value)} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            <span>{text.length}자</span><span>최대 5,000자</span>
          </div>
        </div>
      )}

      {activeTab === 'file' && (
        <div>
          <div style={{ border: '2px dashed var(--border-color)', borderRadius: '8px', padding: '1.5rem', textAlign: 'center', cursor: 'pointer' }} onClick={() => fileRef.current?.click()}>
            <span style={{ fontSize: '2rem', display: 'block', marginBottom: '0.5rem' }}>📎</span>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>TXT 파일을 클릭하여 업로드</p>
          </div>
          <input ref={fileRef} type="file" accept=".txt" style={{ display: 'none' }} onChange={e => e.target.files?.[0] && handleFileChange(e.target.files[0])} />
        </div>
      )}

      <button type="submit" style={{ width: '100%', padding: '0.65rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer', opacity: isGenerating ? 0.7 : 1 }} disabled={isGenerating}>
        {isGenerating ? '변환 중...' : '🔊 음성 변환'}
      </button>
    </form>
  );
}
