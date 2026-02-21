'use client';

import { useRef, useState, useEffect } from 'react';

interface AudioPlayerProps {
  audioUrl: string;
  currentText: string;
  selectedVoice: string;
  speechRate: number;
  speechPitch: number;
}

export default function AudioPlayer({ audioUrl, currentText, selectedVoice }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const handleEnded = () => setIsPlaying(false);
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    return () => { audio.removeEventListener('ended', handleEnded); audio.removeEventListener('timeupdate', handleTimeUpdate); audio.removeEventListener('loadedmetadata', handleLoadedMetadata); };
  }, [audioUrl]);

  function togglePlay() {
    if (!audioRef.current) return;
    if (isPlaying) { audioRef.current.pause(); setIsPlaying(false); }
    else { audioRef.current.play(); setIsPlaying(true); }
  }

  function handleSeek(e: React.ChangeEvent<HTMLInputElement>) {
    if (!audioRef.current) return;
    const time = Number(e.target.value);
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  }

  function formatTime(s: number) {
    const m = Math.floor(s / 60);
    return `${m}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  }

  function handleDownload() {
    const a = document.createElement('a');
    a.href = audioUrl;
    a.download = 'speech.mp3';
    a.click();
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <audio ref={audioRef} src={audioUrl} />

      {/* 정보 */}
      <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '0.75rem' }}>
        <p style={{ margin: '0 0 0.2rem 0', fontSize: '0.75rem', fontWeight: '600', color: '#16a34a' }}>✓ 음성 생성 완료</p>
        <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text-muted)' }}>음성: {selectedVoice}</p>
      </div>

      {/* 플레이어 */}
      <div style={{ background: 'white', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.25rem' }}>
        {/* 진행 바 */}
        <div style={{ marginBottom: '0.75rem' }}>
          <input type="range" min="0" max={duration || 100} step="0.1" value={currentTime} onChange={handleSeek} style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--focus-color)' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* 컨트롤 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button onClick={() => { if (audioRef.current) { audioRef.current.currentTime = 0; setCurrentTime(0); } }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', padding: '0.25rem' }}>⏮</button>
          <button onClick={togglePlay} style={{ background: 'var(--focus-color)', border: 'none', borderRadius: '50%', width: '44px', height: '44px', cursor: 'pointer', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
            {isPlaying ? '⏸' : '▶'}
          </button>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.4rem', marginLeft: 'auto' }}>
            <span style={{ fontSize: '0.9rem' }}>🔊</span>
            <input type="range" min="0" max="1" step="0.05" value={volume} onChange={e => { const v = Number(e.target.value); setVolume(v); if (audioRef.current) audioRef.current.volume = v; }} style={{ width: '80px', accentColor: 'var(--focus-color)' }} />
          </div>
          <button onClick={handleDownload} style={{ padding: '0.4rem 0.75rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '5px', fontSize: '0.75rem', cursor: 'pointer' }}>
            ⬇ 다운로드
          </button>
        </div>
      </div>

      {/* 텍스트 미리보기 */}
      {currentText && (
        <div style={{ background: '#fafafa', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.75rem' }}>
          <p style={{ margin: '0 0 0.4rem 0', fontSize: '0.72rem', fontWeight: '600', color: 'var(--text-muted)' }}>📝 변환된 텍스트</p>
          <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.6, maxHeight: '100px', overflowY: 'auto', whiteSpace: 'pre-line' }}>{currentText}</p>
        </div>
      )}
    </div>
  );
}
