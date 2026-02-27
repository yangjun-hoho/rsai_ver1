import { getAppDb } from './db';

export interface User {
  id: number;
  nickname: string;
  password: string;
  role: 'user' | 'admin';
  created_at: string;
}

export function createUser(nickname: string, hashedPassword: string): User {
  const db = getAppDb();
  const stmt = db.prepare(`INSERT INTO users (nickname, password) VALUES (?, ?) RETURNING *`);
  const user = stmt.get(nickname, hashedPassword) as User;
  // 기본 설정 생성
  db.prepare(`INSERT OR IGNORE INTO user_settings (user_id) VALUES (?)`).run(user.id);
  return user;
}

export function findUserByNickname(nickname: string): User | undefined {
  return getAppDb().prepare(`SELECT * FROM users WHERE nickname = ?`).get(nickname) as User | undefined;
}

export function findUserById(id: number): User | undefined {
  return getAppDb().prepare(`SELECT * FROM users WHERE id = ?`).get(id) as User | undefined;
}
