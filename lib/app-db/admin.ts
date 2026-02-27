import { getAppDb } from './db';

// ── 대시보드 통계 ──────────────────────────────────────────
export function getStats() {
  const db = getAppDb();
  const { totalUsers }   = db.prepare(`SELECT COUNT(*) as totalUsers FROM users`).get() as { totalUsers: number };
  const { todayJoined }  = db.prepare(`SELECT COUNT(*) as todayJoined FROM users WHERE date(created_at) = date('now')`).get() as { todayJoined: number };
  const { totalPosts }   = db.prepare(`SELECT COUNT(*) as totalPosts FROM posts`).get() as { totalPosts: number };
  const { piiThisMonth } = db.prepare(
    `SELECT COUNT(*) as piiThisMonth FROM pii_logs WHERE strftime('%Y-%m', detected_at) = strftime('%Y-%m', 'now')`
  ).get() as { piiThisMonth: number };

  const recentUsers = db.prepare(`SELECT id, nickname, role, is_active, created_at FROM users ORDER BY created_at DESC LIMIT 5`).all();
  const recentPosts = db.prepare(
    `SELECT p.id, p.title, u.nickname, p.created_at FROM posts p JOIN users u ON p.user_id = u.id ORDER BY p.created_at DESC LIMIT 5`
  ).all();
  const recentPiiLogs = db.prepare(`SELECT pattern_type, path, detected_at FROM pii_logs ORDER BY detected_at DESC LIMIT 10`).all();

  return { totalUsers, todayJoined, totalPosts, piiThisMonth, recentUsers, recentPosts, recentPiiLogs };
}

// ── 사용자 관리 ────────────────────────────────────────────
export function getAdminUsers(search?: string) {
  const db = getAppDb();
  if (search) {
    return db.prepare(`SELECT id, nickname, role, is_active, created_at FROM users WHERE nickname LIKE ? ORDER BY created_at DESC`)
      .all(`%${search}%`);
  }
  return db.prepare(`SELECT id, nickname, role, is_active, created_at FROM users ORDER BY created_at DESC`).all();
}

export function updateUser(id: number, data: { role?: string; is_active?: number }) {
  const db = getAppDb();
  if (data.role !== undefined) {
    db.prepare(`UPDATE users SET role = ? WHERE id = ?`).run(data.role, id);
  }
  if (data.is_active !== undefined) {
    db.prepare(`UPDATE users SET is_active = ? WHERE id = ?`).run(data.is_active, id);
  }
  return db.prepare(`SELECT id, nickname, role, is_active, created_at FROM users WHERE id = ?`).get(id);
}

export function deleteUser(id: number): boolean {
  const result = getAppDb().prepare(`DELETE FROM users WHERE id = ?`).run(id);
  return result.changes > 0;
}

// ── 게시판 관리 ────────────────────────────────────────────
export function getAdminPosts(search?: string) {
  const db = getAppDb();
  if (search) {
    return db.prepare(`
      SELECT p.id, p.title, p.views, p.is_pinned, p.created_at, u.nickname
      FROM posts p JOIN users u ON p.user_id = u.id
      WHERE p.title LIKE ? OR u.nickname LIKE ?
      ORDER BY p.is_pinned DESC, p.created_at DESC
    `).all(`%${search}%`, `%${search}%`);
  }
  return db.prepare(`
    SELECT p.id, p.title, p.views, p.is_pinned, p.created_at, u.nickname
    FROM posts p JOIN users u ON p.user_id = u.id
    ORDER BY p.is_pinned DESC, p.created_at DESC
  `).all();
}

export function updatePost(id: number, data: { is_pinned?: number }) {
  const db = getAppDb();
  if (data.is_pinned !== undefined) {
    db.prepare(`UPDATE posts SET is_pinned = ? WHERE id = ?`).run(data.is_pinned, id);
  }
  return db.prepare(`SELECT id, title, is_pinned FROM posts WHERE id = ?`).get(id);
}

export function adminDeletePost(id: number): boolean {
  const result = getAppDb().prepare(`DELETE FROM posts WHERE id = ?`).run(id);
  return result.changes > 0;
}
