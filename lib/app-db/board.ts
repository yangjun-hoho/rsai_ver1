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
  comment_count: number;
}

const POST_PAGE_SIZE = 15;

export function getPosts(page = 1): { posts: Post[]; total: number; totalPages: number } {
  const db = getAppDb();
  const offset = (page - 1) * POST_PAGE_SIZE;
  const posts = db.prepare(`
    SELECT p.*, u.nickname,
           (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) AS comment_count
    FROM posts p JOIN users u ON p.user_id = u.id
    ORDER BY p.created_at DESC
    LIMIT ? OFFSET ?
  `).all(POST_PAGE_SIZE, offset) as Post[];
  const { total } = db.prepare(`SELECT COUNT(*) as total FROM posts`).get() as { total: number };
  return { posts, total, totalPages: Math.ceil(total / POST_PAGE_SIZE) };
}

export function getPost(id: number): Post | undefined {
  const db = getAppDb();
  return db.prepare(`
    SELECT p.*, u.nickname
    FROM posts p JOIN users u ON p.user_id = u.id
    WHERE p.id = ?
  `).get(id) as Post | undefined;
}

export function incrementViews(id: number): void {
  const db = getAppDb();
  db.prepare(`UPDATE posts SET views = views + 1 WHERE id = ?`).run(id);
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

/* ── 댓글 ── */

export interface Comment {
  id: number;
  post_id: number;
  author: string;
  content: string;
  is_ai: number;
  created_at: string;
}

export function getComments(postId: number): Comment[] {
  const db = getAppDb();
  return db.prepare(`SELECT * FROM comments WHERE post_id = ? ORDER BY created_at ASC`).all(postId) as Comment[];
}

export function createComment(postId: number, author: string, content: string, isAi = false): Comment {
  const db = getAppDb();
  const result = db.prepare(`INSERT INTO comments (post_id, author, content, is_ai) VALUES (?, ?, ?, ?)`).run(postId, author, content, isAi ? 1 : 0);
  return db.prepare(`SELECT * FROM comments WHERE id = ?`).get(Number(result.lastInsertRowid)) as Comment;
}

export function markAiCommented(postId: number): void {
  const db = getAppDb();
  db.prepare(`UPDATE posts SET ai_commented = 1 WHERE id = ?`).run(postId);
}

export function hasAiComment(postId: number): boolean {
  const db = getAppDb();
  const row = db.prepare(`SELECT ai_commented FROM posts WHERE id = ?`).get(postId) as { ai_commented: number } | undefined;
  return row?.ai_commented === 1;
}
