import { getAppDb } from './db';

export interface Post {
  id: number;
  user_id: number;
  nickname: string;
  title: string;
  content: string;
  views: number;
  created_at: string;
  updated_at: string;
}

const POST_PAGE_SIZE = 15;

export function getPosts(page = 1): { posts: Post[]; total: number; totalPages: number } {
  const db = getAppDb();
  const offset = (page - 1) * POST_PAGE_SIZE;
  const posts = db.prepare(`
    SELECT p.*, u.nickname
    FROM posts p JOIN users u ON p.user_id = u.id
    ORDER BY p.created_at DESC
    LIMIT ? OFFSET ?
  `).all(POST_PAGE_SIZE, offset) as Post[];
  const { total } = db.prepare(`SELECT COUNT(*) as total FROM posts`).get() as { total: number };
  return { posts, total, totalPages: Math.ceil(total / POST_PAGE_SIZE) };
}

export function getPost(id: number): Post | undefined {
  const db = getAppDb();
  db.prepare(`UPDATE posts SET views = views + 1 WHERE id = ?`).run(id);
  return db.prepare(`
    SELECT p.*, u.nickname
    FROM posts p JOIN users u ON p.user_id = u.id
    WHERE p.id = ?
  `).get(id) as Post | undefined;
}

export function createPost(userId: number, title: string, content: string): Post {
  const db = getAppDb();
  const result = db.prepare(`INSERT INTO posts (user_id, title, content) VALUES (?, ?, ?)`).run(userId, title, content);
  return getPost(Number(result.lastInsertRowid)) as Post;
}

export function deletePost(id: number, userId: number, role: string): boolean {
  const db = getAppDb();
  const where = role === 'admin' ? `id = ?` : `id = ? AND user_id = ?`;
  const params = role === 'admin' ? [id] : [id, userId];
  const result = db.prepare(`DELETE FROM posts WHERE ${where}`).run(...params);
  return result.changes > 0;
}
