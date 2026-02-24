'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyLeaflet = any;

const PANEL  = '#1f2937';
const BORDER = '#374151';
const MUTED  = '#9ca3af';
const TEXT   = '#f3f4f6';
const BG     = '#111827';
const ACCENT = '#3b82f6';

interface ParcelInfo { [key: string]: string }

const LABEL_MAP: Record<string, string> = {
  pnu: '필지고유번호', jibun: '지번', bonbun: '본번',
  bubun: '부번', addr: '주소', area: '면적(㎡)', bchk: '분류',
};

export default function CadastralMapPage() {
  const router = useRouter();

  // ── refs (map 상태 - 리렌더와 무관하게 유지) ─────────────
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef       = useRef<AnyLeaflet>(null);
  const LRef         = useRef<AnyLeaflet>(null);
  const geoLayerRef  = useRef<AnyLeaflet>(null);
  const fetchingRef  = useRef(false);
  const showLayerRef = useRef(true);

  // ── UI 상태 ──────────────────────────────────────────────
  const [searchInput,    setSearchInput]    = useState('');
  const [selectedParcel, setSelectedParcel] = useState<ParcelInfo | null>(null);
  const [loading,        setLoading]        = useState(false);
  const [status,         setStatus]         = useState('지도를 확대하면 지적도가 표시됩니다 (레벨 15↑)');
  const [showLayer,      setShowLayer]      = useState(true);
  const [zoom,           setZoom]           = useState(16);

  // ── 지적도 fetch (useCallback으로 안정적인 참조 유지) ────
  const fetchCadastral = useCallback(async () => {
    const map = mapRef.current;
    const L   = LRef.current;
    if (!map || !L || fetchingRef.current || !showLayerRef.current) return;

    const currentZoom = map.getZoom();
    setZoom(currentZoom);

    if (currentZoom < 15) {
      geoLayerRef.current?.clearLayers();
      setStatus('더 가까이 확대하면 지적도가 표시됩니다 (레벨 15 이상)');
      return;
    }

    const b    = map.getBounds();
    const bbox = [b.getWest(), b.getSouth(), b.getEast(), b.getNorth()]
      .map((v: number) => v.toFixed(7)).join(',');

    fetchingRef.current = true;
    setLoading(true);
    setStatus('지적도 불러오는 중…');

    try {
      const res  = await fetch(`/api/work-support/cadastral-map?type=cadastral&bbox=${bbox}`);
      const data = await res.json();
      const features = data?.response?.result?.featureCollection?.features ?? [];

      // 기존 레이어 제거 후 새 레이어 추가
      if (geoLayerRef.current) {
        geoLayerRef.current.remove();
        geoLayerRef.current = null;
      }

      if (features.length === 0) {
        const vStatus = data?.response?.status;
        const vError  = data?.response?.error?.text ?? data?.response?.error?.code;
        if (vError) {
          setStatus(`API 오류: ${vError}`);
          console.error('[cadastral] V-World error:', data?.response);
        } else {
          setStatus(vStatus === 'NOT_FOUND' ? '해당 영역에 지적 데이터가 없습니다' : '지적 데이터 없음');
        }
        return;
      }

      const layer = L.geoJSON(
        { type: 'FeatureCollection', features },
        {
          style: { color: '#60a5fa', weight: 1.5, opacity: 0.9, fillColor: '#3b82f6', fillOpacity: 0.07 },
          onEachFeature: (feature: { properties: ParcelInfo }, lyr: AnyLeaflet) => {
            lyr.on({
              click:     () => setSelectedParcel({ ...feature.properties }),
              mouseover: (e: AnyLeaflet) => { e.target.setStyle({ fillOpacity: 0.22, weight: 2.5, color: '#93c5fd' }); },
              mouseout:  (e: AnyLeaflet) => { e.target.setStyle({ fillOpacity: 0.07, weight: 1.5, color: '#60a5fa' }); },
            });
          },
        }
      ).addTo(map);

      geoLayerRef.current = layer;
      setStatus(`${features.length}개 필지 표시됨`);
    } catch {
      setStatus('데이터 로드 실패');
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, []); // refs만 사용하므로 deps 불필요

  // ── Leaflet 초기화 ──────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    let destroyed = false;

    import('leaflet').then(({ default: L }) => {
      if (destroyed || !containerRef.current || mapRef.current) return;

      // 기본 아이콘 경로 수정 (번들러 환경 대응)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const map = L.map(containerRef.current!, { center: [37.5665, 126.9780], zoom: 16, zoomControl: false });
      L.control.zoom({ position: 'bottomright' }).addTo(map);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://openstreetmap.org/copyright">OpenStreetMap</a> | 연속지적도: V-World',
        maxZoom: 20,
      }).addTo(map);

      LRef.current   = L;
      mapRef.current = map;

      map.on('moveend', fetchCadastral);
      fetchCadastral();
    });

    return () => {
      destroyed = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        LRef.current   = null;
        geoLayerRef.current = null;
      }
    };
  }, [fetchCadastral]);

  // ── 레이어 토글 ────────────────────────────────────────
  function toggleLayer() {
    const next = !showLayerRef.current;
    showLayerRef.current = next;
    setShowLayer(next);
    if (!next) {
      if (geoLayerRef.current) { geoLayerRef.current.remove(); geoLayerRef.current = null; }
      setStatus('지적도 레이어 꺼짐');
    } else {
      fetchCadastral();
    }
  }

  // ── 주소 검색 ──────────────────────────────────────────
  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const query = searchInput.trim();
    if (!query) return;
    if (!mapRef.current || !LRef.current) { alert('지도가 아직 로딩 중입니다.'); return; }

    setLoading(true);
    try {
      const res  = await fetch(`/api/work-support/cadastral-map?type=geocode&address=${encodeURIComponent(query)}`);
      const data = await res.json();

      if (data?.response?.status === 'OK') {
        // type=BOTH 응답: result가 배열일 수 있음
        const result = Array.isArray(data.response.result)
          ? data.response.result[0]
          : data.response.result;
        const { x, y } = result.point;
        const lat = parseFloat(y);
        const lng = parseFloat(x);
        mapRef.current.setView([lat, lng], 17);
        LRef.current.marker([lat, lng])
          .addTo(mapRef.current)
          .bindPopup(`<b>${query}</b>`)
          .openPopup();
      } else {
        alert(`주소를 찾을 수 없습니다.\n(응답: ${data?.response?.status ?? 'unknown'})`);
      }
    } catch (err) {
      console.error('[geocode]', err);
      alert('주소 검색 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: BG, color: TEXT, display: 'flex', flexDirection: 'column', fontFamily: 'inherit', zIndex: 50 }}>

      {/* ── 헤더 ── */}
      <header style={{ height: '52px', flexShrink: 0, background: PANEL, borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', gap: '12px', padding: '0 16px' }}>
        <span style={{ fontSize: '18px' }}>🗺️</span>
        <span style={{ fontSize: '15px', fontWeight: 700 }}>연속지적도</span>
        <span style={{ fontSize: '10px', padding: '2px 7px', background: ACCENT, borderRadius: '4px', color: '#fff', fontWeight: 600 }}>V-World</span>

        <form onSubmit={handleSearch} style={{ flex: 1, display: 'flex', gap: '6px', maxWidth: '420px' }}>
          <input
            type="text"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder="주소 입력 (예: 서울특별시 중구 태평로1가)"
            style={{ flex: 1, padding: '6px 12px', background: '#111827', border: `1px solid ${BORDER}`, borderRadius: '7px', color: TEXT, fontSize: '13px', outline: 'none' }}
          />
          <button
            type="submit"
            disabled={loading}
            style={{ padding: '6px 14px', background: ACCENT, border: 'none', borderRadius: '7px', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1 }}
          >검색</button>
        </form>

        <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
          <button
            onClick={toggleLayer}
            style={{ padding: '5px 12px', background: showLayer ? '#1d4ed8' : BORDER, border: 'none', borderRadius: '7px', color: '#fff', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
          >{showLayer ? '🟦 지적도 ON' : '⬜ 지적도 OFF'}</button>

          <button
            onClick={() => router.push('/')}
            style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 10px', background: BORDER, border: 'none', borderRadius: '6px', color: MUTED, cursor: 'pointer', fontSize: '12px' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#4b5563'; e.currentTarget.style.color = TEXT; }}
            onMouseLeave={e => { e.currentTarget.style.background = BORDER; e.currentTarget.style.color = MUTED; }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            홈
          </button>
        </div>
      </header>

      {/* ── 지도 영역 (position:relative로 오버레이 기준점) ── */}
      <div style={{ position: 'relative', flex: 1 }}>

        {/* Leaflet 컨테이너 - position:absolute로 완전히 채움 */}
        <div ref={containerRef} style={{ position: 'absolute', inset: 0 }} />

        {/* 상태바 */}
        <div style={{ position: 'absolute', top: 12, left: 12, zIndex: 1000, background: 'rgba(17,24,39,0.9)', border: `1px solid ${BORDER}`, borderRadius: '8px', padding: '7px 12px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: TEXT, pointerEvents: 'none' }}>
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          {loading
            ? <><span style={{ width: 10, height: 10, border: `2px solid ${ACCENT}`, borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin .8s linear infinite' }} />로딩 중…</>
            : <><span style={{ width: 8, height: 8, borderRadius: '50%', background: showLayer && zoom >= 15 ? '#10b981' : '#6b7280', display: 'inline-block' }} />{status}</>
          }
          <span style={{ color: MUTED }}>줌 {zoom}</span>
        </div>

        {/* 필지 정보 패널 */}
        {selectedParcel && (
          <div style={{ position: 'absolute', top: 12, right: 12, zIndex: 1000, background: 'rgba(31,41,55,0.97)', border: `1px solid ${BORDER}`, borderRadius: '10px', padding: '16px', width: '240px', fontSize: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontWeight: 700, fontSize: '13px' }}>📌 필지 정보</span>
              <button onClick={() => setSelectedParcel(null)} style={{ background: 'none', border: 'none', color: MUTED, cursor: 'pointer', fontSize: '18px', lineHeight: 1 }}>×</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
              {Object.entries(selectedParcel).map(([k, v]) => v ? (
                <div key={k} style={{ display: 'flex', gap: '8px' }}>
                  <span style={{ color: MUTED, flexShrink: 0, width: '80px' }}>{LABEL_MAP[k.toLowerCase()] ?? k}</span>
                  <span style={{ color: TEXT, wordBreak: 'break-all' }}>{v}</span>
                </div>
              ) : null)}
            </div>
          </div>
        )}

        {/* 범례 */}
        <div style={{ position: 'absolute', bottom: 36, left: 12, zIndex: 1000, background: 'rgba(17,24,39,0.9)', border: `1px solid ${BORDER}`, borderRadius: '8px', padding: '8px 12px', fontSize: '11px', color: MUTED, pointerEvents: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
            <span style={{ width: 20, height: 3, background: '#60a5fa', borderRadius: 2, display: 'inline-block' }} />
            연속지적도 필지 경계
          </div>
          <div>필지 클릭 시 상세정보 표시</div>
        </div>
      </div>
    </div>
  );
}
