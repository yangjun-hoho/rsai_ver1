import { ragDb } from './db';

export interface VectorEntry {
  id: string;
  documentId: string;
  documentName: string;
  chunkText: string;
  embedding: number[];
}

// 카테고리별 벡터 캐시 (서버 모듈 레벨 - 재시작 전까지 유지)
const cache = new Map<string, VectorEntry[]>();

/** 카테고리 캐시 무효화 (문서 추가/삭제 시 호출) */
export function invalidateCache(categoryId: string) {
  cache.delete(categoryId);
}

/** 카테고리 벡터 가져오기 (없으면 DB에서 로드 후 캐싱) */
export function getCategoryVectors(categoryId: string): VectorEntry[] {
  if (!cache.has(categoryId)) {
    const rows = ragDb.getChunks(categoryId);
    const entries: VectorEntry[] = rows.map(r => ({
      id:           r.id,
      documentId:   r.document_id,
      documentName: r.original_name,
      chunkText:    r.chunk_text,
      embedding:    JSON.parse(r.embedding) as number[],
    }));
    cache.set(categoryId, entries);
  }
  return cache.get(categoryId)!;
}

/** 코사인 유사도 계산 */
export function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot   += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

/** 쿼리 임베딩과 가장 유사한 top-k 청크 반환 */
export function searchSimilar(categoryId: string, queryEmbedding: number[], topK = 5): VectorEntry[] {
  const vectors = getCategoryVectors(categoryId);
  if (vectors.length === 0) return [];

  const scored = vectors.map(v => ({
    ...v,
    score: cosineSimilarity(queryEmbedding, v.embedding),
  }));

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topK);
}
