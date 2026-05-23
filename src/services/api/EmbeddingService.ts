/**
 * Embedding service для проектного RAG.
 *
 * Использует DeepInfra OpenAI-совместимый эндпоинт /v1/openai/embeddings.
 * По умолчанию модель `BAAI/bge-m3-multi` (multilingual, 1024d).
 *
 * Контракт graceful-degradation:
 *   • если DEEPINFRA_API_KEY отсутствует — embedBatch вернёт [] для всех
 *     текстов, retrieval сам переключится на keyword fallback;
 *   • любая HTTP-ошибка → возвращаем пустые вектора без throw;
 *   • batch до 64 текстов за раз — DeepInfra принимает массив input.
 */

const DEFAULT_MODEL = process.env.EMBEDDING_MODEL || 'BAAI/bge-m3-multi';
const DEEPINFRA_EMBEDDINGS_URL =
  'https://api.deepinfra.com/v1/openai/embeddings';
const BATCH_SIZE = 32;
const TIMEOUT_MS = 12000;

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
      console.error('[EMBED] non-ok status', r.status);
      return null;
    }
    return await r.json();
  } catch (e) {
    console.error('[EMBED] fetch failed', e);
    return null;
  } finally {
    clearTimeout(t);
  }
}

class EmbeddingService {
  isConfigured(): boolean {
    return !!process.env.DEEPINFRA_API_KEY;
  }

  modelId(): string {
    return DEFAULT_MODEL;
  }

  /** Embed единичной строки. Возвращает [] при сбое/неконфигурации. */
  async embedText(text: string): Promise<number[]> {
    const v = await this.embedBatch([text]);
    return v[0] || [];
  }

  /**
   * Embed массива строк. Возвращает массив векторов того же размера —
   * битые ответы заполняются пустыми массивами, чтобы вызывающий код
   * мог сопоставлять index → chunk без сдвига.
   */
  async embedBatch(texts: string[]): Promise<number[][]> {
    const apiKey = process.env.DEEPINFRA_API_KEY;
    if (!apiKey) return texts.map(() => []);
    if (!texts.length) return [];

    const results: number[][] = new Array(texts.length).fill(0).map(() => []);

    for (let i = 0; i < texts.length; i += BATCH_SIZE) {
      const slice = texts.slice(i, i + BATCH_SIZE);
      const payload = {
        model: DEFAULT_MODEL,
        input: slice,
        encoding_format: 'float',
      };
      const json = await fetchJsonWithTimeout(
        DEEPINFRA_EMBEDDINGS_URL,
        payload,
        TIMEOUT_MS,
        apiKey,
      );
      if (!json || !Array.isArray(json.data)) continue;
      for (let k = 0; k < slice.length; k++) {
        const item = json.data[k];
        const vec = item && Array.isArray(item.embedding) ? item.embedding : [];
        results[i + k] = vec;
      }
    }
    return results;
  }
}

export const embeddingService = new EmbeddingService();
