import { getAppDb } from './db';

export interface UserSettings {
  user_id: number;
  preferred_model: string;
  theme: string;
  updated_at: string;
}

export function getSettings(userId: number): UserSettings {
  const db = getAppDb();
  db.prepare(`INSERT OR IGNORE INTO user_settings (user_id) VALUES (?)`).run(userId);
  return db.prepare(`SELECT * FROM user_settings WHERE user_id = ?`).get(userId) as UserSettings;
}

export function updateSettings(userId: number, data: Partial<Pick<UserSettings, 'preferred_model' | 'theme'>>): UserSettings {
  const db = getAppDb();
  const fields = Object.keys(data).map(k => `${k} = ?`).join(', ');
  const values = Object.values(data);
  db.prepare(`UPDATE user_settings SET ${fields}, updated_at = datetime('now') WHERE user_id = ?`).run(...values, userId);
  return getSettings(userId);
}
