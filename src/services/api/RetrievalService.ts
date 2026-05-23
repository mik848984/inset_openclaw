/**
 * RetrievalService — hybrid retrieval для проектного RAG.
 *
 * Пайплайн:
 *   1) embed query (DeepInfra). Если embeddings выключены → шаг 2 даст 0.
 *   2) vector search в Qdrant (если QDRANT_URL задан и embedding получен).
 *   3) keyword search в Mongo (`$text` если индекс работает, иначе `$regex`).
 *   4) merge + dedupe по chunk-id.
 *   5) rerank (Qwen3-Reranker-8B). Graceful: если нет — пропускаем.
 *   6) top 8–12 финальных чанков с metadata.
 *
 * Контракт: ничего не throw в production-пути. Если backbone недоступен,
 * возвращаем хоть что-то по keyword fallback. Если совсем пусто — `[]`.
 */

import ProjectChunk from '@/models/projectChunk';
import { embeddingService } from '@/services/api/EmbeddingService';
import { vectorStoreService } from '@/services/api/VectorStoreService';
import {
  rerankerService,
  RerankCandidate,
} from '@/services/api/RerankerService';

export interface RetrievedChunk {
  _id: string;
  sourceId: string;
  projectId: string;
  text: string;
  page?: number;
  sectionTitle?: string;
  sheet?: string;
  rowRange?: string;
  url?: string;
  score: number;
  via: 'vector' | 'keyword' | 'rerank';
}

interface RetrievalOpts {
  projectId: string;
  userEmail: string;
  query: string;
  topVector?: number;
  topKeyword?: number;
  topFinal?: number;
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Простейшая extraction терминов: длинные слова, обрезанные до 24 char. */
function extractTerms(query: string): string[] {
  const words = (query || '')
    .toLowerCase()
    .normalize('NFKC')
    .split(/[^\p{L}\p{N}]+/u)
    .filter((w) => w.length >= 3 && w.length <= 24);
  return Array.from(new Set(words)).slice(0, 8);
}

class RetrievalService {
  isHybrid(): boolean {
    return vectorStoreService.isEnabled() && embeddingService.isConfigured();
  }

  async retrieve(opts: RetrievalOpts): Promise<RetrievedChunk[]> {
    const {
      projectId,
      userEmail,
      query,
      topVector = 30,
      topKeyword = 30,
      topFinal = 10,
    } = opts;
    if (!projectId || !userEmail || !query) return [];

    // ── 1) Vector search ────────────────────────────────────────
    let vectorHits: RetrievedChunk[] = [];
    try {
      if (this.isHybrid()) {
        const qVec = await embeddingService.embedText(query);
        if (qVec.length > 0) {
          const hits = await vectorStoreService.search(
            projectId,
            userEmail,
            qVec,
            topVector,
          );
          vectorHits = hits.map((h) => ({
            _id: h.id,
            sourceId: String(h.payload?.sourceId || ''),
            projectId: String(h.payload?.projectId || ''),
            text: String(h.payload?.text || ''),
            page: h.payload?.page,
            sectionTitle: h.payload?.sectionTitle,
            sheet: h.payload?.sheet,
            rowRange: h.payload?.rowRange,
            url: h.payload?.url,
            score: h.score,
            via: 'vector',
          }));
        }
      }
    } catch (e) {
      console.error('[RETRIEVAL] vector stage failed', e);
    }

    // ── 2) Keyword search в Mongo ───────────────────────────────
    let keywordHits: RetrievedChunk[] = [];
    try {
      const terms = extractTerms(query);
      if (terms.length > 0) {
        const regex = new RegExp(terms.map(escapeRegex).join('|'), 'i');
        const docs = await ProjectChunk.find({
          project: projectId,
          userEmail,
          text: { $regex: regex },
        })
          .sort({ chunkIndex: 1 })
          .limit(topKeyword)
          .lean();
        keywordHits = docs.map((d: any) => ({
          _id: String(d._id),
          sourceId: String(d.source),
          projectId: String(d.project),
          text: String(d.text || ''),
          page: d.page,
          sectionTitle: d.sectionTitle,
          sheet: d.sheet,
          rowRange: d.rowRange,
          url: d.url,
          score: 0.5, // лёгкая базовая, чтобы при rerank-fallback не падать в 0
          via: 'keyword',
        }));
      }
    } catch (e) {
      console.error('[RETRIEVAL] keyword stage failed', e);
    }

    // ── 3) Merge & dedupe ───────────────────────────────────────
    const seen = new Set<string>();
    const merged: RetrievedChunk[] = [];
    for (const h of [...vectorHits, ...keywordHits]) {
      if (!h._id) continue;
      if (seen.has(h._id)) continue;
      seen.add(h._id);
      merged.push(h);
    }
    if (!merged.length) return [];

    // ── 4) Rerank top 30 ───────────────────────────────────────
    let reranked: RetrievedChunk[] = merged;
    try {
      if (rerankerService.isConfigured()) {
        const candidates: RerankCandidate<RetrievedChunk>[] = merged
          .slice(0, 30)
          .map((c) => ({
            text: c.text,
            payload: c,
            baseScore: c.score,
          }));
        const ranked = await rerankerService.rerank(query, candidates, topFinal);
        reranked = ranked.map((r) => ({
          ...r.payload,
          score: r.baseScore ?? r.payload.score,
          via: 'rerank',
        }));
      }
    } catch (e) {
      console.error('[RETRIEVAL] rerank stage failed', e);
    }

    return reranked.slice(0, topFinal);
  }
}

export const retrievalService = new RetrievalService();
