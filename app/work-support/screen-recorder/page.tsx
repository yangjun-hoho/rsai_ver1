'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

type Quality = '4k' | '2k' | 'fhd' | 'hd' | 'sd';
type Framerate = '15' | '24' | '30' | '60';

const RESOLUTIONS: Record<Quality, { width: number; height: number }> = {
  '4k': { width: 3840, height: 2160 },
  '2k': { width: 2560, height: 1440 },
  fhd: { width: 1920, height: 1080 },
  hd:  { width: 1280, height: 720 },
  sd:  { width: 854,  height: 480 },
};

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

const BG      = '#111827';
const PANEL   = '#1f2937';
const BORDER  = '#374151';
const MUTED   = '#9ca3af';
const TEXT    = '#f3f4f6';

export default function ScreenRecorderPage() {
  const router = useRouter();

  // ── Media refs ─────────────────────────────────────────────────
  const mrRef             = useRef<MediaRecorder | null>(null);
  const chunksRef         = useRef<Blob[]>([]);
  const streamRef         = useRef<MediaStream | null>(null);
  const startTimeRef      = useRef(0);
  const pausedTimeRef     = useRef(0);
  const pauseStartRef     = useRef(0);
  const intervalRef       = useRef<ReturnType<typeof setInterval> | null>(null);
  const downloadFnRef     = useRef<(() => void) | null>(null);

  // ── State refs (for use inside stable callbacks) ───────────────
  const isRecordingRef = useRef(false);
  const isPausedRef    = useRef(false);

  // ── UI State ───────────────────────────────────────────────────
  const [showGuide, setShowGuide]       = useState(false);
  const [isRecording, setIsRecording]   = useState(false);
  const [isPaused, setIsPaused]         = useState(false);
  const [canDownload, setCanDownload]   = useState(false);
  const [timer, setTimer]               = useState('00:00:00');
  const [recordTime, setRecordTime]     = useState('00:00:00');
  const [fileSize, setFileSize]         = useState('0 MB');
  const [resolution, setResolution]     = useState('-');
  const [codec, setCodec]               = useState('VP8/VP9');
  const [statusText, setStatusText]     = useState('준비됨');
  const [errorMsg, setErrorMsg]         = useState('');
  const [showError, setShowError]       = useState(false);

  // ── Settings ───────────────────────────────────────────────────
  const [quality, setQuality]           = useState<Quality>('fhd');
  const [framerate, setFramerate]       = useState<Framerate>('30');
  const [includeMic, setIncludeMic]     = useState(false);
  const [includeSystem, setIncludeSystem] = useState(true);

  useEffect(() => {
    document.title = '화면 녹화 | 아레스 AI';
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, []);

  function showErr(msg: string) {
    setErrorMsg(msg);
    setShowError(true);
    setTimeout(() => setShowError(false), 5000);
  }

  function startTimerLoop() {
    intervalRef.current = setInterval(() => {
      if (isPausedRef.current) return;
      const elapsed = (Date.now() - startTimeRef.current - pausedTimeRef.current) / 1000;
      const fmt = formatTime(elapsed);
      setTimer(fmt);
      setRecordTime(fmt);
      setFileSize(`${(elapsed * 0.5).toFixed(1)} MB`);
    }, 100);
  }

  async function startRecording() {
    if (!navigator.mediaDevices?.getDisplayMedia) {
      showErr('이 브라우저는 화면 녹화를 지원하지 않습니다.');
      return;
    }

    try {
      const res = RESOLUTIONS[quality];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const displayStream = await (navigator.mediaDevices as any).getDisplayMedia({
        video: { width: { ideal: res.width }, height: { ideal: res.height }, frameRate: { ideal: parseInt(framerate) } },
        audio: includeSystem ? { echoCancellation: false, noiseSuppression: false, sampleRate: 44100 } : false,
      }).catch((err: Error) => {
        showErr(err.name === 'NotAllowedError' ? '화면 공유 권한이 거부되었습니다.' : '화면 공유를 시작할 수 없습니다.');
        throw err;
      });

      if (includeMic) {
        try {
          const micStream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
          displayStream.addTrack(micStream.getAudioTracks()[0]);
        } catch {
          showErr('마이크 접근 실패');
        }
      }

      displayStream.getVideoTracks()[0].addEventListener('ended', stopRecording);

      const mimeType = ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm']
        .find(t => MediaRecorder.isTypeSupported(t));
      if (!mimeType) {
        showErr('WebM 녹화를 지원하지 않습니다.');
        displayStream.getTracks().forEach((t: MediaStreamTrack) => t.stop());
        return;
      }

      chunksRef.current = [];
      const mr = new MediaRecorder(displayStream, { mimeType, videoBitsPerSecond: 2_500_000 });

      mr.ondataavailable = (e) => { if (e.data?.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        const url  = URL.createObjectURL(blob);
        const ts   = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
        downloadFnRef.current = () => {
          const a = document.createElement('a');
          a.href = url; a.download = `screen_recording_${ts}.webm`; a.click();
          URL.revokeObjectURL(url);
        };
        setCanDownload(true);
      };

      mr.start(100);
      mrRef.current         = mr;
      streamRef.current     = displayStream;
      startTimeRef.current  = Date.now();
      pausedTimeRef.current = 0;
      startTimerLoop();

      const settings = displayStream.getVideoTracks()[0].getSettings();
      setResolution(`${settings.width ?? '?'}×${settings.height ?? '?'}`);
      setCodec(mimeType.includes('vp9') ? 'VP9/Opus' : 'VP8/Opus');

      isRecordingRef.current = true;
      isPausedRef.current    = false;
      setIsRecording(true);
      setIsPaused(false);
      setCanDownload(false);
      setStatusText('녹화 중');
    } catch (err) {
      if (err instanceof Error && err.message) showErr('녹화 시작 오류: ' + err.message);
      streamRef.current?.getTracks().forEach(t => t.stop());
    }
  }

  function stopRecording() {
    try {
      if (mrRef.current?.state !== 'inactive') mrRef.current?.stop();
      streamRef.current?.getTracks().forEach(t => t.stop());
      if (intervalRef.current) clearInterval(intervalRef.current);
    } catch { showErr('녹화 중지 오류'); }

    isRecordingRef.current = false;
    isPausedRef.current    = false;
    setIsRecording(false);
    setIsPaused(false);
    setStatusText('준비됨');
  }

  function pauseRecording() {
    if (mrRef.current?.state !== 'recording') return;
    mrRef.current.pause();
    isPausedRef.current  = true;
    pauseStartRef.current = Date.now();
    setIsPaused(true);
    setStatusText('일시정지');
  }

  function resumeRecording() {
    if (mrRef.current?.state !== 'paused') return;
    mrRef.current.resume();
    isPausedRef.current    = false;
    pausedTimeRef.current += Date.now() - pauseStartRef.current;
    setIsPaused(false);
    setStatusText('녹화 중');
  }

  // Keyboard shortcuts — use refs so handlers are always stable
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!e.altKey) return;
      if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        if (!isRecordingRef.current) startRecording();
        else stopRecording();
      } else if (e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        if (isRecordingRef.current && !isPausedRef.current) pauseRecording();
        else if (isPausedRef.current) resumeRecording();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quality, framerate, includeMic, includeSystem]);

  // ── Helpers ────────────────────────────────────────────────────
  const btnStyle = (bg: string, fg: string, disabled = false) => ({
    width: '100%', padding: '10px 12px', background: disabled ? '#374151' : bg, color: disabled ? MUTED : fg,
    border: 'none', borderRadius: '8px', cursor: disabled ? 'not-allowed' : 'pointer',
    fontSize: '13px', fontWeight: 600, opacity: disabled ? 0.5 : 1,
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
  } as React.CSSProperties);

  return (
    <div style={{ position: 'fixed', inset: 0, background: BG, color: TEXT, display: 'flex', flexDirection: 'column', fontFamily: 'inherit', overflow: 'hidden', zIndex: 50 }}>

      {/* ── Keyframe styles ── */}
      <style>{`
        @keyframes recPulse  { 0%,100%{opacity:1} 50%{opacity:.25} }
        @keyframes dotPulse  { 0%,100%{opacity:1} 50%{opacity:.4}  }
        select:focus { outline: none; border-color: #ef4444 !important; }
        ::-webkit-scrollbar { width: 5px; } ::-webkit-scrollbar-thumb { background: #374151; border-radius: 3px; }
      `}</style>

      {/* ── Header ── */}
      <header style={{ height: '52px', background: PANEL, borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 18px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => router.back()}
            style={{ width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#374151', border: 'none', borderRadius: '6px', color: MUTED, cursor: 'pointer' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#4b5563'; e.currentTarget.style.color = TEXT; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#374151'; e.currentTarget.style.color = MUTED; }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          </button>
          <span style={{ fontSize: '18px' }}>🎬</span>
          <span style={{ fontSize: '15px', fontWeight: 600 }}>Screen Recorder</span>
          <span style={{ fontSize: '10px', padding: '2px 6px', background: '#374151', borderRadius: '4px', color: MUTED }}>v1.0</span>
        </div>

        {isRecording && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', padding: '4px 12px', borderRadius: '20px' }}>
            <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#ef4444', animation: 'recPulse 1s infinite' }} />
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#ef4444', letterSpacing: '1px' }}>REC</span>
          </div>
        )}
      </header>

      {/* ── Body ── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* ── Left: Settings ── */}
        <div style={{ width: '210px', background: PANEL, borderRight: `1px solid ${BORDER}`, overflowY: 'auto', flexShrink: 0 }}>
          <Section label="품질">
            <StyledSelect value={quality} onChange={e => setQuality(e.target.value as Quality)} disabled={isRecording}>
              <option value="4k">4K (3840×2160)</option>
              <option value="2k">2K (2560×1440)</option>
              <option value="fhd">Full HD (1080p)</option>
              <option value="hd">HD (720p)</option>
              <option value="sd">SD (480p)</option>
            </StyledSelect>
          </Section>

          <Section label="프레임레이트">
            <StyledSelect value={framerate} onChange={e => setFramerate(e.target.value as Framerate)} disabled={isRecording}>
              <option value="15">15 FPS</option>
              <option value="24">24 FPS</option>
              <option value="30">30 FPS</option>
              <option value="60">60 FPS</option>
            </StyledSelect>
          </Section>

          <Section label="오디오">
            <CheckRow label="시스템 소리" checked={includeSystem} onChange={setIncludeSystem} disabled={isRecording} />
            <CheckRow label="마이크"      checked={includeMic}    onChange={setIncludeMic}    disabled={isRecording} />
          </Section>

          <div style={{ margin: '14px', background: '#374151', borderRadius: '8px', padding: '12px 14px' }}>
            <div style={{ fontSize: '11px', fontWeight: 600, color: MUTED, marginBottom: '8px' }}>⌨️ 단축키</div>
            <ShortcutRow keys={['Alt', 'R']} label="녹화 / 중지" />
            <ShortcutRow keys={['Alt', 'P']} label="일시정지 / 재개" />
          </div>
        </div>

        {/* ── Center: Preview ── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '18px', gap: '14px', overflow: 'hidden', minWidth: 0 }}>

          {showError && (
            <div style={{ padding: '9px 14px', borderRadius: '7px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171', fontSize: '12px' }}>
              {errorMsg}
            </div>
          )}

          {/* Status bar */}
          <div style={{ padding: '10px 14px', background: PANEL, borderRadius: '8px', border: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0, background: isRecording ? '#ef4444' : '#10b981', animation: `dotPulse ${isRecording ? '1s' : '2s'} infinite` }} />
            <span style={{ fontSize: '13px', fontWeight: 500 }}>{statusText}</span>
          </div>

          {/* Main display */}
          <div style={{ flex: 1, background: PANEL, borderRadius: '12px', border: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
            <div style={{ width: '72%', maxWidth: '420px', aspectRatio: '16/9', background: '#0d1117', borderRadius: '8px', border: `1.5px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
              {isRecording ? (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '52px', fontFamily: '"Courier New", monospace', fontWeight: 700, color: '#eab308', letterSpacing: '3px' }}>{timer}</div>
                  <div style={{ fontSize: '12px', color: MUTED, marginTop: '10px' }}>화면이 녹화되고 있습니다</div>
                </div>
              ) : isPaused ? (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '52px', fontFamily: '"Courier New", monospace', fontWeight: 700, color: '#f59e0b', letterSpacing: '3px' }}>{timer}</div>
                  <div style={{ fontSize: '12px', color: MUTED, marginTop: '10px' }}>일시정지 — 재개 버튼을 클릭하세요</div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', color: MUTED }}>
                  <div style={{ fontSize: '36px', marginBottom: '10px' }}>🎬</div>
                  <div style={{ fontSize: '14px', fontWeight: 500, color: '#d1d5db' }}>녹화 준비됨</div>
                  <div style={{ fontSize: '11px', marginTop: '5px' }}>아래 버튼을 눌러 시작하세요</div>
                </div>
              )}

              {isRecording && (
                <div style={{ position: 'absolute', top: '10px', left: '10px', display: 'flex', alignItems: 'center', gap: '5px', background: 'rgba(239,68,68,0.18)', padding: '3px 8px', borderRadius: '4px' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ef4444', animation: 'recPulse 1s infinite' }} />
                  <span style={{ fontSize: '10px', fontWeight: 700, color: '#ef4444', letterSpacing: '1px' }}>REC</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Right: Info + Controls ── */}
        <div style={{ width: '190px', background: PANEL, borderLeft: `1px solid ${BORDER}`, display: 'flex', flexDirection: 'column', flexShrink: 0 }}>

          <Section label="정보">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '7px' }}>
              {([['시간', recordTime], ['크기', fileSize], ['해상도', resolution], ['코덱', codec]] as [string, string][]).map(([label, value]) => (
                <div key={label} style={{ background: '#111827', borderRadius: '6px', padding: '8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '10px', color: MUTED, marginBottom: '3px' }}>{label}</div>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: '#eab308', wordBreak: 'break-all' }}>{value}</div>
                </div>
              ))}
            </div>
          </Section>

          <Section label="사용법">
            {['① 품질 · FPS 선택', '② 녹화 버튼 클릭', '③ 화면 선택 확인', '④ 완료 후 다운로드'].map(s => (
              <div key={s} style={{ fontSize: '11px', color: '#d1d5db', lineHeight: 1.9 }}>{s}</div>
            ))}
          </Section>

          {/* Controls */}
          <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '7px' }}>
            {!isRecording ? (
              <button style={btnStyle('#ef4444', '#fff')} onClick={() => setShowGuide(true)}
                onMouseEnter={e => (e.currentTarget.style.background = '#dc2626')}
                onMouseLeave={e => (e.currentTarget.style.background = '#ef4444')}>
                <span style={{ fontSize: '10px' }}>●</span> 녹화 시작
              </button>
            ) : (
              <button style={btnStyle('#6b7280', '#fff')} onClick={stopRecording}
                onMouseEnter={e => (e.currentTarget.style.background = '#4b5563')}
                onMouseLeave={e => (e.currentTarget.style.background = '#6b7280')}>
                <span style={{ fontSize: '10px' }}>■</span> 중지
              </button>
            )}

            {isRecording && !isPaused && (
              <button style={btnStyle('#f59e0b', '#000')} onClick={pauseRecording}
                onMouseEnter={e => (e.currentTarget.style.background = '#d97706')}
                onMouseLeave={e => (e.currentTarget.style.background = '#f59e0b')}>
                ⏸ 일시정지
              </button>
            )}

            {isPaused && (
              <button style={btnStyle('#10b981', '#fff')} onClick={resumeRecording}
                onMouseEnter={e => (e.currentTarget.style.background = '#059669')}
                onMouseLeave={e => (e.currentTarget.style.background = '#10b981')}>
                ▶ 재개
              </button>
            )}

            <button
              style={btnStyle('#3b82f6', '#fff', !canDownload)}
              onClick={() => downloadFnRef.current?.()}
              disabled={!canDownload}
              onMouseEnter={e => { if (canDownload) e.currentTarget.style.background = '#2563eb'; }}
              onMouseLeave={e => { if (canDownload) e.currentTarget.style.background = '#3b82f6'; }}
            >
              ↓ 다운로드
            </button>
          </div>
        </div>
      </div>

      {/* ── 녹화 대상 선택 안내 모달 ── */}
      {showGuide && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}
          onClick={() => setShowGuide(false)}>
          <div style={{ background: PANEL, borderRadius: '14px', padding: '28px', width: '360px', border: `1px solid ${BORDER}`, boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: '22px', marginBottom: '12px', textAlign: 'center' }}>🎬</div>
            <h3 style={{ margin: '0 0 6px', fontSize: '15px', fontWeight: 700, textAlign: 'center', color: TEXT }}>녹화할 대상 선택</h3>
            <p style={{ margin: '0 0 20px', fontSize: '12px', color: MUTED, textAlign: 'center', lineHeight: 1.6 }}>
              확인 버튼을 누르면 브라우저에서<br/>녹화할 대상을 선택(공유)하는 창이 열립니다.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '22px' }}>
              {[
                { icon: '🖥️', label: '전체 화면', desc: '모니터 화면 전체를 녹화합니다' },
                { icon: '🪟', label: '특정 창',   desc: '앱 창 하나만 선택해서 녹화합니다' },
                { icon: '🌐', label: '브라우저 탭', desc: '열려있는 탭 하나만 녹화합니다' },
              ].map(({ icon, label, desc }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', background: '#111827', borderRadius: '8px', border: `1px solid ${BORDER}` }}>
                  <span style={{ fontSize: '18px', flexShrink: 0 }}>{icon}</span>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: TEXT }}>{label}</div>
                    <div style={{ fontSize: '11px', color: MUTED, marginTop: '1px' }}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setShowGuide(false)}
                style={{ flex: 1, padding: '10px', background: '#374151', border: 'none', borderRadius: '8px', color: MUTED, fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                onMouseEnter={e => (e.currentTarget.style.background = '#4b5563')}
                onMouseLeave={e => (e.currentTarget.style.background = '#374151')}
              >취소</button>
              <button
                onClick={() => { setShowGuide(false); startRecording(); }}
                style={{ flex: 2, padding: '10px', background: '#ef4444', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                onMouseEnter={e => (e.currentTarget.style.background = '#dc2626')}
                onMouseLeave={e => (e.currentTarget.style.background = '#ef4444')}
              >녹화 대상 선택하기</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Sub-components ─────────────────────────────────────────── */

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ padding: '14px 14px', borderBottom: `1px solid ${BORDER}` }}>
      <div style={{ fontSize: '10px', fontWeight: 600, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>{label}</div>
      {children}
    </div>
  );
}

function StyledSelect({ value, onChange, disabled, children }: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  disabled: boolean;
  children: React.ReactNode;
}) {
  return (
    <select value={value} onChange={onChange} disabled={disabled} style={{
      width: '100%', padding: '7px 10px', background: '#111827', border: `1px solid ${BORDER}`,
      borderRadius: '6px', color: TEXT, fontSize: '12px',
      cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1,
    }}>
      {children}
    </select>
  );
}

function CheckRow({ label, checked, onChange, disabled }: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled: boolean;
}) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: disabled ? 'not-allowed' : 'pointer', padding: '4px 0', fontSize: '12px', opacity: disabled ? 0.5 : 1, marginBottom: '2px' }}>
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} disabled={disabled} style={{ width: '13px', height: '13px', accentColor: '#ef4444' }} />
      {label}
    </label>
  );
}

function ShortcutRow({ keys, label }: { keys: string[]; label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#d1d5db', marginBottom: '5px', flexWrap: 'wrap' }}>
      {keys.map((k, i) => (
        <span key={k}>
          <kbd style={{ background: '#1f2937', padding: '1px 5px', borderRadius: '3px', border: `1px solid #4b5563`, fontFamily: 'monospace', fontSize: '10px' }}>{k}</kbd>
          {i < keys.length - 1 && <span style={{ margin: '0 1px' }}>+</span>}
        </span>
      ))}
      <span style={{ marginLeft: '4px' }}>{label}</span>
    </div>
  );
}
