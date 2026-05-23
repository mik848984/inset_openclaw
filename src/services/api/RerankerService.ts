/**
 * Reranker service (Qwen/Qwen3-Reranker-8B через DeepInfra).
 *
 * Контракт:
 *   • если DEEPINFRA_API_KEY отсутствует или endpoint не доступен —
 *     graceful no-op: возвращаем кандидаты в исходном порядке;
 *   • никакого throw в production-пути.
 *
 * Note: DeepInfra reranker имеет официальный rerank endpoint
 *   POST https://api.deepinfra.com/v1/inference/Qwen/Qwen3-Reranker-8B
 * с телом `{ queries: [...], documents: [...] }` и ответом
 * `{ scores: [[s, s, ...]] }`. Запросы держим короткие — top-N кандидатов.
 */

const DEFAULT_MODEL =
  process.env.RERANKER_MODEL || 'Qwen/Qwen3-Reranker-8B';
const TIMEOUT_MS = 12000;

export interface RerankCandidate<T = any> {
  /** Текст, который ранжируем. */
  text: string;
  /** Произвольная нагрузка (chunk-id, metadata и т.п.). */
  payload: T;
  /** Оценка из предыдущего этапа (vector/keyword) — используется для tie-break. */
  baseScore?: number;
}

async function fetchJsonWithTimeout(
  url: string,
  body: any,
  timeoutMs: number,
  apiKey: string,
): Promise<any> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const r = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      signal: ctrl.signal,
    });
    if (!r.ok) {
      console.error('[RERANK] non-ok status', r.status);
      return null;
    }
    return await r.json();
  } catch (e) {
    console.error('[RERANK] fetch failed', e);
    return null;
  } finally {
    clearTimeout(t);
  }
}

class RerankerService {
  isConfigured(): boolean {
    return !!process.env.DEEPINFRA_API_KEY;
  }

  modelId(): string {
    return DEFAULT_MODEL;
  }

  /**
   * Возвращает кандидатов, отсортированных по убыванию релевантности
   * relative `query`. Если reranker недоступен — возвращает исходный
   * массив без изменений.
   */
  async rerank<T = any>(
    query: string,
    candidates: RerankCandidate<T>[],
    topK = 12,
  ): Promise<RerankCandidate<T>[]> {
    const apiKey = process.env.DEEPINFRA_API_KEY;
    if (!apiKey || !candidates.length) {
      return candidates.slice(0, topK);
    }
    const safeCandidates = candidates.slice(0, 30);
    const payload = {
      queries: [query],
      documents: safeCandidates.map((c) => c.text.slice(0, 4000)),
    };
    const json = await fetchJsonWithTimeout(
      `https://api.deepinfra.com/v1/inference/${DEFAULT_MODEL}`,
      payload,
      TIMEOUT_MS,
      apiKey,
    );
    const scores: number[] | undefined =
      json &&
      Array.isArray(json.scores) &&
      Array.isArray(json.scores[0])
        ? json.scores[0]
        : Array.isArray(json?.scores)
          ? json.scores
          : undefined;
    if (!scores) {
      return safeCandidates.slice(0, topK);
    }
    const scored = safeCandidates.map((c, i) => ({
      ...c,
      baseScore: scores[i] ?? c.baseScore ?? 0,
    }));
    scored.sort(
      (a, b) => (b.baseScore || 0) - (a.baseScore || 0),
    );
    return scored.slice(0, topK);
  }
}

export const rerankerService = new RerankerService();
