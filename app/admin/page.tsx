'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type Tab = 'dashboard' | 'users' | 'posts' | 'pii';

interface Stats { totalUsers: number; todayJoined: number; totalPosts: number; piiThisMonth: number; recentUsers: AdminUser[]; recentPosts: RecentPost[]; recentPiiLogs: PiiLog[]; }
interface AdminUser { id: number; nickname: string; role: string; is_active: number; created_at: string; }
interface AdminPost { id: number; title: string; nickname: string; views: number; is_pinned: number; created_at: string; }
interface RecentPost { id: number; title: string; nickname: string; created_at: string; }
interface PiiLog { pattern_type: string; path: string; detected_at: string; }
interface PiiPattern { id: number; type: string; regex: string; hint: string; is_active: number; }

const S = {
  card: { background: 'white', borderRadius: '10px', border: '1px solid #e9e9e7', padding: '1.25rem 1.5rem' } as React.CSSProperties,
  th: { padding: '0.6rem 0.75rem', fontSize: '0.75rem', fontWeight: 700, color: '#6b7280', textAlign: 'left', borderBottom: '1px solid #e9e9e7', whiteSpace: 'nowrap' } as React.CSSProperties,
  td: { padding: '0.6rem 0.75rem', fontSize: '0.82rem', color: '#37352f', borderBottom: '1px solid #f5f5f3', verticalAlign: 'middle' } as React.CSSProperties,
  btn: (color = '#37352f') => ({ padding: '0.3rem 0.65rem', background: color, color: 'white', border: 'none', borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600 } as React.CSSProperties),
  outBtn: { padding: '0.3rem 0.65rem', background: 'none', border: '1px solid #e0e0e0', borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer', color: '#6b7280' } as React.CSSProperties,
  input: { width: '100%', padding: '0.55rem 0.75rem', border: '1px solid #e0e0e0', borderRadius: '8px', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' } as React.CSSProperties,
};

// ── 대시보드 탭 ────────────────────────────────────────────
function DashboardTab() {
  const [stats, setStats] = useState<Stats | null>(null);
  useEffect(() => { fetch('/api/admin/stats').then(r => r.json()).then(setStats); }, []);
  if (!stats) return <div style={{ color: '#9b9a97' }}>불러오는 중...</div>;
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: '전체 회원', value: stats.totalUsers, icon: '👥' },
          { label: '오늘 가입', value: stats.todayJoined, icon: '🆕' },
          { label: '전체 게시글', value: stats.totalPosts, icon: '📋' },
          { label: 'PII 감지 (이번달)', value: stats.piiThisMonth, icon: '🛡️' },
        ].map(c => (
          <div key={c.label} style={S.card}>
            <div style={{ fontSize: '1.4rem', marginBottom: '0.4rem' }}>{c.icon}</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#37352f' }}>{c.value}</div>
            <div style={{ fontSize: '0.78rem', color: '#9b9a97', marginTop: '0.2rem' }}>{c.label}</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
        <div style={S.card}>
          <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#37352f', margin: '0 0 0.75rem 0' }}>최근 가입자</h3>
          {stats.recentUsers.map((u: AdminUser) => (
            <div key={u.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0', borderBottom: '1px solid #f5f5f3', fontSize: '0.82rem' }}>
              <span>{u.nickname} {u.role === 'admin' && <span style={{ fontSize: '0.7rem', background: '#fef3c7', color: '#92400e', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>관리자</span>}</span>
              <span style={{ color: '#9b9a97' }}>{u.created_at.slice(0, 10)}</span>
            </div>
          ))}
        </div>
        <div style={S.card}>
          <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#37352f', margin: '0 0 0.75rem 0' }}>최근 게시글</h3>
          {stats.recentPosts.map((p: RecentPost) => (
            <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0', borderBottom: '1px solid #f5f5f3', fontSize: '0.82rem' }}>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '60%' }}>{p.title}</span>
              <span style={{ color: '#9b9a97', flexShrink: 0 }}>{p.nickname}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={S.card}>
        <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#37352f', margin: '0 0 0.75rem 0' }}>PII 감지 최근 로그</h3>
        {stats.recentPiiLogs.length === 0 ? <div style={{ color: '#9b9a97', fontSize: '0.82rem' }}>감지 내역 없음</div> : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr><th style={S.th}>종류</th><th style={S.th}>경로</th><th style={S.th}>감지 시각</th></tr></thead>
            <tbody>
              {stats.recentPiiLogs.map((l: PiiLog, i) => (
                <tr key={i}><td style={S.td}>{l.pattern_type}</td><td style={S.td}>{l.path}</td><td style={S.td}>{l.detected_at.slice(0, 16)}</td></tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ── 사용자 관리 탭 ─────────────────────────────────────────
function UsersTab() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState('');
  const load = useCallback(() => {
    const q = search ? `?search=${encodeURIComponent(search)}` : '';
    fetch(`/api/admin/users${q}`).then(r => r.json()).then(setUsers);
  }, [search]);
  useEffect(() => { load(); }, [load]);

  async function toggleRole(u: AdminUser) {
    const newRole = u.role === 'admin' ? 'user' : 'admin';
    if (!confirm(`${u.nickname}의 역할을 ${newRole === 'admin' ? '관리자' : '일반사용자'}로 변경하시겠습니까?`)) return;
    await fetch(`/api/admin/users/${u.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ role: newRole }) });
    load();
  }
  async function toggleActive(u: AdminUser) {
    const action = u.is_active ? '비활성화' : '활성화';
    if (!confirm(`${u.nickname} 계정을 ${action}하시겠습니까?`)) return;
    await fetch(`/api/admin/users/${u.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ is_active: u.is_active ? 0 : 1 }) });
    load();
  }
  async function handleDelete(u: AdminUser) {
    if (!confirm(`${u.nickname} 계정을 탈퇴 처리하시겠습니까? 게시글도 삭제됩니다.`)) return;
    await fetch(`/api/admin/users/${u.id}`, { method: 'DELETE' });
    load();
  }

  return (
    <div style={S.card}>
      <div style={{ marginBottom: '1rem' }}>
        <input style={{ ...S.input, maxWidth: '300px' }} placeholder="별칭으로 검색..." value={search}
          onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && load()} />
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead><tr>
          <th style={S.th}>별칭</th><th style={S.th}>역할</th><th style={S.th}>가입일</th><th style={S.th}>상태</th><th style={S.th}>액션</th>
        </tr></thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id}>
              <td style={S.td}>{u.nickname}</td>
              <td style={S.td}><span style={{ fontSize: '0.72rem', padding: '0.15rem 0.5rem', borderRadius: '4px', background: u.role === 'admin' ? '#fef3c7' : '#f3f4f6', color: u.role === 'admin' ? '#92400e' : '#6b7280' }}>{u.role === 'admin' ? '관리자' : '일반사용자'}</span></td>
              <td style={S.td}>{u.created_at.slice(0, 10)}</td>
              <td style={S.td}><span style={{ fontSize: '0.72rem', color: u.is_active ? '#16a34a' : '#dc2626' }}>{u.is_active ? '활성' : '비활성'}</span></td>
              <td style={S.td}>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <button style={S.outBtn} onClick={() => toggleRole(u)}>{u.role === 'admin' ? '권한 해제' : '관리자 권한'}</button>
                  <button style={S.outBtn} onClick={() => toggleActive(u)}>{u.is_active ? '비활성화' : '활성화'}</button>
                  <button style={S.btn('#ef4444')} onClick={() => handleDelete(u)}>탈퇴</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── 게시판 관리 탭 ─────────────────────────────────────────
function PostsTab() {
  const [posts, setPosts] = useState<AdminPost[]>([]);
  const [search, setSearch] = useState('');
  const load = useCallback(() => {
    const q = search ? `?search=${encodeURIComponent(search)}` : '';
    fetch(`/api/admin/posts${q}`).then(r => r.json()).then(setPosts);
  }, [search]);
  useEffect(() => { load(); }, [load]);

  async function togglePin(p: AdminPost) {
    await fetch(`/api/admin/posts/${p.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ is_pinned: p.is_pinned ? 0 : 1 }) });
    load();
  }
  async function handleDelete(p: AdminPost) {
    if (!confirm('이 게시글을 삭제하시겠습니까?')) return;
    await fetch(`/api/admin/posts/${p.id}`, { method: 'DELETE' });
    load();
  }

  return (
    <div style={S.card}>
      <div style={{ marginBottom: '1rem' }}>
        <input style={{ ...S.input, maxWidth: '300px' }} placeholder="제목/작성자 검색..." value={search}
          onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && load()} />
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead><tr>
          <th style={S.th}>제목</th><th style={S.th}>작성자</th><th style={S.th}>조회</th><th style={S.th}>작성일</th><th style={S.th}>액션</th>
        </tr></thead>
        <tbody>
          {posts.map(p => (
            <tr key={p.id}>
              <td style={S.td}>{p.is_pinned ? '📌 ' : ''}<Link href={`/board/${p.id}`} style={{ color: '#37352f', textDecoration: 'none' }}>{p.title}</Link></td>
              <td style={S.td}>{p.nickname}</td>
              <td style={S.td}>{p.views}</td>
              <td style={S.td}>{p.created_at.slice(0, 10)}</td>
              <td style={S.td}>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <button style={S.outBtn} onClick={() => togglePin(p)}>{p.is_pinned ? '공지 해제' : '공지 설정'}</button>
                  <button style={S.btn('#ef4444')} onClick={() => handleDelete(p)}>삭제</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── PII 필터 탭 ────────────────────────────────────────────
function PiiTab() {
  const [patterns, setPatterns] = useState<PiiPattern[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ type: '', regex: '', hint: '' });
  const [testInput, setTestInput] = useState('');
  const [testResult, setTestResult] = useState<string | null>(null);
  const [editId, setEditId] = useState<number | null>(null);

  const load = () => fetch('/api/admin/pii-patterns').then(r => r.json()).then(setPatterns);
  useEffect(() => { load(); }, []);

  async function handleSave() {
    if (!form.type || !form.regex || !form.hint) return alert('모든 필드를 입력해주세요');
    const url = editId ? `/api/admin/pii-patterns/${editId}` : '/api/admin/pii-patterns';
    const method = editId ? 'PUT' : 'POST';
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    const data = await res.json();
    if (!res.ok) return alert(data.error);
    setShowForm(false); setEditId(null); setForm({ type: '', regex: '', hint: '' }); load();
  }
  async function toggleActive(p: PiiPattern) {
    await fetch(`/api/admin/pii-patterns/${p.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ is_active: p.is_active ? 0 : 1 }) });
    load();
  }
  async function handleDelete(id: number) {
    if (!confirm('이 패턴을 삭제하시겠습니까?')) return;
    await fetch(`/api/admin/pii-patterns/${id}`, { method: 'DELETE' });
    load();
  }
  function startEdit(p: PiiPattern) {
    setEditId(p.id); setForm({ type: p.type, regex: p.regex, hint: p.hint }); setShowForm(true);
  }
  function handleTest() {
    if (!testInput) return;
    let found: string | null = null;
    for (const p of patterns.filter(p => p.is_active)) {
      try { if (new RegExp(p.regex).test(testInput)) { found = p.type; break; } } catch { /* skip */ }
    }
    setTestResult(found ? `⚠️ ${found} 패턴 감지됨` : '✅ 감지된 패턴 없음');
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={S.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ margin: 0, fontSize: '0.88rem', fontWeight: 700 }}>PII 패턴 목록</h3>
          <button style={S.btn()} onClick={() => { setShowForm(!showForm); setEditId(null); setForm({ type: '', regex: '', hint: '' }); }}>
            {showForm ? '취소' : '+ 새 패턴 추가'}
          </button>
        </div>

        {showForm && (
          <div style={{ background: '#f7f6f3', borderRadius: '8px', padding: '1rem', marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
              <div><label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: '0.3rem' }}>종류명</label>
                <input style={S.input} placeholder="예: 여권번호" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} /></div>
              <div><label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: '0.3rem' }}>정규식</label>
                <input style={S.input} placeholder="예: [A-Z]\d{8}" value={form.regex} onChange={e => setForm(f => ({ ...f, regex: e.target.value }))} /></div>
            </div>
            <div><label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: '0.3rem' }}>수정 안내 메시지</label>
              <input style={S.input} placeholder="감지 시 사용자에게 표시할 안내 메시지" value={form.hint} onChange={e => setForm(f => ({ ...f, hint: e.target.value }))} /></div>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button style={S.outBtn} onClick={() => { setShowForm(false); setEditId(null); }}>취소</button>
              <button style={S.btn()} onClick={handleSave}>{editId ? '수정' : '저장'}</button>
            </div>
          </div>
        )}

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr>
            <th style={S.th}>활성</th><th style={S.th}>종류</th><th style={S.th}>정규식</th><th style={S.th}>안내 메시지</th><th style={S.th}>액션</th>
          </tr></thead>
          <tbody>
            {patterns.map(p => (
              <tr key={p.id}>
                <td style={S.td}><button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem' }} onClick={() => toggleActive(p)}>{p.is_active ? '✅' : '❌'}</button></td>
                <td style={S.td}>{p.type}</td>
                <td style={{ ...S.td, fontFamily: 'monospace', fontSize: '0.75rem', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.regex}</td>
                <td style={{ ...S.td, maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.hint}</td>
                <td style={S.td}>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <button style={S.outBtn} onClick={() => startEdit(p)}>수정</button>
                    <button style={S.btn('#ef4444')} onClick={() => handleDelete(p.id)}>삭제</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={S.card}>
        <h3 style={{ margin: '0 0 0.75rem 0', fontSize: '0.88rem', fontWeight: 700 }}>패턴 테스트</h3>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <input style={{ ...S.input, flex: 1 }} placeholder="테스트할 문자열 입력..." value={testInput} onChange={e => setTestInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleTest()} />
          <button style={S.btn()} onClick={handleTest}>테스트</button>
        </div>
        {testResult && <div style={{ padding: '0.6rem 0.75rem', background: testResult.startsWith('✅') ? '#f0fdf4' : '#fef2f2', border: `1px solid ${testResult.startsWith('✅') ? '#bbf7d0' : '#fecaca'}`, borderRadius: '8px', fontSize: '0.85rem', color: testResult.startsWith('✅') ? '#16a34a' : '#dc2626' }}>{testResult}</div>}
      </div>
    </div>
  );
}

// ── 메인 관리자 페이지 ─────────────────────────────────────
export default function AdminPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('dashboard');
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    document.title = '관리자 패널 | 아레스 AI';
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      if (!d.user || d.user.role !== 'admin') { router.push('/'); return; }
      setChecking(false);
    });
  }, [router]);

  if (checking) return <div style={{ minHeight: '100vh', background: '#faf9f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ color: '#9b9a97' }}>확인 중...</div></div>;

  const TABS: { id: Tab; label: string }[] = [
    { id: 'dashboard', label: '📊 대시보드' },
    { id: 'users',     label: '👥 사용자 관리' },
    { id: 'posts',     label: '📋 게시판 관리' },
    { id: 'pii',       label: '🛡️ PII 필터' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#faf9f5' }}>
      {/* 헤더 */}
      <div style={{ background: 'white', borderBottom: '1px solid #e9e9e7', padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '1rem', fontWeight: 700, color: '#37352f' }}>⚙️ 관리자 패널</span>
        <Link href="/" style={{ fontSize: '0.82rem', color: '#9b9a97', textDecoration: 'none' }}>← 메인으로</Link>
      </div>

      <div style={{ display: 'flex', minHeight: 'calc(100vh - 49px)' }}>
        {/* 사이드 탭 */}
        <div style={{ width: '180px', background: 'white', borderRight: '1px solid #e9e9e7', padding: '1rem 0.75rem', flexShrink: 0 }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{ width: '100%', padding: '0.55rem 0.75rem', background: tab === t.id ? '#f0f0ee' : 'none', border: 'none', borderRadius: '6px', fontSize: '0.83rem', fontWeight: tab === t.id ? 700 : 400, color: '#37352f', cursor: 'pointer', textAlign: 'left', marginBottom: '0.2rem' }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* 콘텐츠 */}
        <div style={{ flex: 1, padding: '1.5rem', overflow: 'auto' }}>
          {tab === 'dashboard' && <DashboardTab />}
          {tab === 'users'     && <UsersTab />}
          {tab === 'posts'     && <PostsTab />}
          {tab === 'pii'       && <PiiTab />}
        </div>
      </div>
    </div>
  );
}
