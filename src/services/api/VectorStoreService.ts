/**
 * Vector store abstraction для проектного RAG.
 *
 * Стратегия:
 *   • если задана переменная окружения `QDRANT_URL` — используем Qdrant
 *     через прямой HTTP REST API (без клиентских библиотек, без новых
 *     npm-зависимостей);
 *   • иначе — graceful fallback: ничего в vector store не пишем,
 *     RetrievalService переключается на keyword retrieval по Mongo.
 *
 * Контракт graceful-degradation:
 *   • любой Qdrant-сбой не должен ломать ingestion — chunks всё равно
 *     записываются в Mongo (vector retrieval просто будет пустым,
 *     keyword fallback подхватит запрос).
 */

const QDRANT_URL = process.env.QDRANT_URL || '';
const QDRANT_API_KEY = process.env.QDRANT_API_KEY || '';
const COLLECTION = process.env.QDRANT_COLLECTION || 'iiset_projects';
const VECTOR_SIZE = Number(process.env.EMBEDDING_DIM || 1024); // BAAI/bge-m3-multi
const HTTP_TIMEOUT_MS = 7000;

export interface VectorUpsertItem {
  /**
   * Stable id для точки. ОБЯЗАТЕЛЬНО UUID (или unsigned integer).
   * Mongo ObjectId как id Qdrant НЕ принимает — будет 400.
   */
  id: string;
  vector: number[];
  payload: {
    /**
     * Mongo `_id` соответствующего ProjectChunk. Хранится в payload,
     * чтобы при поиске поднять оригинальный документ.
     */
    chunkId?: string;
    projectId: string;
    sourceId: string;
    userEmail: string;
    chunkIndex: number;
    text: string;
    page?: number;
    sectionTitle?: string;
    sheet?: string;
    rowRange?: string;
    url?: string;
  };
}

export interface VectorSearchHit {
  id: string;
  score: number;
  payload: VectorUpsertItem['payload'];
}

async function qfetch(
  path: string,
  init: RequestInit & { json?: any } = {},
): Promise<Response | null> {
  if (!QDRANT_URL) return null;
  const url = QDRANT_URL.replace(/\/+$/, '') + path;
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), HTTP_TIMEOUT_MS);
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (QDRANT_API_KEY) headers['api-key'] = QDRANT_API_KEY;
    const res = await fetch(url, {
      ...init,
      headers: { ...headers, ...(init.headers as any) },
      body: init.json ? JSON.stringify(init.json) : init.body,
      signal: ctrl.signal,
    });
    return res;
  } catch (e) {
    console.error('[QDRANT] fetch failed', path, e);
    return null;
  } finally {
    clearTimeout(t);
  }
}

class VectorStoreService {
  isEnabled(): boolean {
    return !!QDRANT_URL;
  }

  collectionName(): string {
    return COLLECTION;
  }

  /** Создаёт collection, если её ещё нет. Idempotent. */
  async ensureCollection(): Promise<boolean> {
    if (!QDRANT_URL) return false;
    // Проверяем существование collection.
    const probe = await qfetch(`/collections/${COLLECTION}`, { method: 'GET' });
    if (probe && probe.ok) return true;
    // Создаём с параметрами по умолчанию.
    const create = await qfetch(`/collections/${COLLECTION}`, {
      method: 'PUT',
      json: {
        vectors: {
          size: VECTOR_SIZE,
          distance: 'Cosine',
        },
      },
    });
    if (!create || !create.ok) {
      console.error(
        '[QDRANT] ensureCollection failed',
        create?.status,
      );
      return false;
    }
    return true;
  }

  /** Upsert набора точек. Возвращает кол-во успешно записанных. */
  async upsertChunks(items: VectorUpsertItem[]): Promise<number> {
    if (!QDRANT_URL || !items.length) return 0;
    const ok = await this.ensureCollection();
    if (!ok) return 0;
    const points = items
      .filter((i) => Array.isArray(i.vector) && i.vector.length > 0)
      .map((i) => ({
        id: i.id,
        vector: i.vector,
        payload: i.payload,
      }));
    if (!points.length) return 0;
    const res = await qfetch(`/collections/${COLLECTION}/points?wait=true`, {
      method: 'PUT',
      json: { points },
    });
    if (!res || !res.ok) {
      // Подтягиваем тело ошибки, чтобы видеть конкретную причину 4xx:
      // обычно «invalid point ID», «vector size mismatch», «collection
      // not found». Обрезаем до 1k, чтобы не залить логи payload-ом.
      const errorText = res ? await res.text().catch(() => '') : '';
      console.error(
        '[QDRANT] upsert failed',
        res?.status,
        errorText.slice(0, 1000),
      );
      return 0;
    }
    return points.length;
  }

  /**
   * Поиск top-K по `queryEmbedding`, отфильтрованный по `projectId`
   * и `userEmail` — обязательная защита от cross-tenant утечек.
   */
  async search(
    projectId: string,
    userEmail: string,
    queryEmbedding: number[],
    topK = 24,
  ): Promise<VectorSearchHit[]> {
    if (!QDRANT_URL || !Array.isArray(queryEmbedding) || !queryEmbedding.length)
      return [];
    const filter = {
      must: [
        { key: 'projectId', match: { value: projectId } },
        { key: 'userEmail', match: { value: userEmail } },
      ],
    };
    const res = await qfetch(`/collections/${COLLECTION}/points/search`, {
      method: 'POST',
      json: {
        vector: queryEmbedding,
        limit: topK,
        with_payload: true,
        filter,
      },
    });
    if (!res || !res.ok) return [];
    const data: any = await res.json().catch(() => null);
    const result = data?.result;
    if (!Array.isArray(result)) return [];
    return result.map((r: any) => ({
      // Возвращаем НЕ qdrant point id (UUID), а Mongo chunk _id из
      // payload — это то, чем оперирует Retrieval/dedupe слой. Fallback
      // на qdrant id оставлен на случай старых точек без payload.chunkId.
      id: String(r?.payload?.chunkId ?? r.id),
      score: typeof r.score === 'number' ? r.score : 0,
      payload: r.payload || {},
    }));
  }

  /** Удалить все точки конкретного source-а проекта. */
  async deleteSource(
    projectId: string,
    sourceId: string,
    userEmail: string,
  ): Promise<boolean> {
    if (!QDRANT_URL) return false;
    const filter = {
      must: [
        { key: 'projectId', match: { value: projectId } },
        { key: 'sourceId', match: { value: sourceId } },
        { key: 'userEmail', match: { value: userEmail } },
      ],
    };
    const res = await qfetch(
      `/collections/${COLLECTION}/points/delete?wait=true`,
      { method: 'POST', json: { filter } },
    );
    return !!(res && res.ok);
  }

  /** Удалить все точки проекта (cascade при delete project). */
  async deleteProject(
    projectId: string,
    userEmail: string,
  ): Promise<boolean> {
    if (!QDRANT_URL) return false;
    const filter = {
      must: [
        { key: 'projectId', match: { value: projectId } },
        { key: 'userEmail', match: { value: userEmail } },
      ],
    };
    const res = await qfetch(
      `/collections/${COLLECTION}/points/delete?wait=true`,
      { method: 'POST', json: { filter } },
    );
    return !!(res && res.ok);
  }
}

export const vectorStoreService = new VectorStoreService();
