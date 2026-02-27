import { getAppDb } from './db';

export interface PiiPattern {
  id: number;
  type: string;
  regex: string;
  hint: string;
  is_active: number;
  created_at: string;
}

export function getPiiPatterns(): PiiPattern[] {
  return getAppDb().prepare(`SELECT * FROM pii_patterns ORDER BY id`).all() as PiiPattern[];
}

export function getActivePiiPatterns(): PiiPattern[] {
  return getAppDb().prepare(`SELECT * FROM pii_patterns WHERE is_active = 1 ORDER BY id`).all() as PiiPattern[];
}

export function createPiiPattern(type: string, regex: string, hint: string): PiiPattern {
  const db = getAppDb();
  const result = db.prepare(`INSERT INTO pii_patterns (type, regex, hint) VALUES (?, ?, ?)`).run(type, regex, hint);
  return db.prepare(`SELECT * FROM pii_patterns WHERE id = ?`).get(result.lastInsertRowid) as PiiPattern;
}

export function updatePiiPattern(id: number, data: Partial<{ type: string; regex: string; hint: string; is_active: number }>): PiiPattern | undefined {
  const db = getAppDb();
  const fields = Object.keys(data).map(k => `${k} = ?`).join(', ');
  const values = Object.values(data);
  db.prepare(`UPDATE pii_patterns SET ${fields} WHERE id = ?`).run(...values, id);
  return db.prepare(`SELECT * FROM pii_patterns WHERE id = ?`).get(id) as PiiPattern | undefined;
}

export function deletePiiPattern(id: number): boolean {
  const result = getAppDb().prepare(`DELETE FROM pii_patterns WHERE id = ?`).run(id);
  return result.changes > 0;
}

export function logPiiDetection(patternType: string, path: string): void {
  getAppDb().prepare(`INSERT INTO pii_logs (pattern_type, path) VALUES (?, ?)`).run(patternType, path);
}

export function getPiiLogCount(thisMonth = true): number {
  const db = getAppDb();
  if (thisMonth) {
    const { count } = db.prepare(
      `SELECT COUNT(*) as count FROM pii_logs WHERE strftime('%Y-%m', detected_at) = strftime('%Y-%m', 'now')`
    ).get() as { count: number };
    return count;
  }
  const { count } = db.prepare(`SELECT COUNT(*) as count FROM pii_logs`).get() as { count: number };
  return count;
}
