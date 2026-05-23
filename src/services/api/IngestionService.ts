/**
 * Ingestion pipeline для проектного RAG.
 *
 * Шаги:
 *   1) parseRawText: на основе mime / extension возвращает читаемый текст
 *      или сообщает `unsupported`.
 *   2) chunkText: дробит на пересекающиеся фрагменты с метаданными.
 *   3) embedBatch: получает векторы через DeepInfra (или пустые если выкл.).
 *   4) Mongo: вставляет ProjectChunk пачкой.
 *   5) Qdrant (если есть): upsertChunks для vector retrieval.
 *
 * Дизайн graceful-degradation:
 *   • embeddings выключены — ingestion всё равно проходит, retrieval
 *     переключается на keyword;
 *   • Qdrant выключен — то же;
 *   • parse failed — source помечается как `error`/`unsupported`.
 */

import ProjectChunk from '@/models/projectChunk';
import { chunkText, csvToReadable, jsonToReadable } from '@/utils/textChunker';
import { embeddingService } from '@/services/api/EmbeddingService';
import { vectorStoreService } from '@/services/api/VectorStoreService';

export interface ParsedSource {
  text: string;
  textPreview: string;
  summary: string;
  /** Если формат не поддерживается, status в результате будет 'unsupported'. */
  unsupportedReason?: string;
}

const SUPPORTED_TEXT_EXT = new Set(['txt', 'md', 'markdown', 'log']);
const SUPPORTED_CSV_EXT = new Set(['csv', 'tsv']);
const SUPPORTED_JSON_EXT = new Set(['json']);
const UNSUPPORTED_NEEDS_PARSER = new Set([
  'pdf',
  'docx',
  'doc',
  'xlsx',
  'xls',
  'pptx',
  'ppt',
  'rtf',
]);

export function extOf(name: string, mime?: string): string {
  const fromName = (name || '').split('.').pop()?.toLowerCase() || '';
  if (fromName) return fromName;
  if (mime?.includes('pdf')) return 'pdf';
  if (mime?.includes('word') || mime?.includes('officedocument'))
    return 'docx';
  if (mime?.includes('csv')) return 'csv';
  if (mime?.includes('json')) return 'json';
  if (mime?.startsWith('text/')) return 'txt';
  return '';
}

/**
 * Превращает буфер файла в читаемый текст. Поддерживаются txt/md/csv/json
 * без дополнительных зависимостей. PDF/DOCX/XLSX — `unsupported`, источник
 * остаётся в проекте, но не индексируется.
 */
export function parseFile(
  buffer: Buffer,
  fileName: string,
  mime?: string,
): ParsedSource {
  const ext = extOf(fileName, mime);
  const fallback: ParsedSource = {
    text: '',
    textPreview: '',
    summary: '',
    unsupportedReason: '',
  };

  if (UNSUPPORTED_NEEDS_PARSER.has(ext)) {
    return {
      ...fallback,
      unsupportedReason:
        'Этот формат пока не индексируется. Поддерживаются txt, md, csv, json. ' +
        'Скоро добавим PDF, DOCX, XLSX.',
    };
  }

  let text = '';
  try {
    const raw = buffer.toString('utf8');
    if (SUPPORTED_CSV_EXT.has(ext)) {
      text = csvToReadable(raw);
    } else if (SUPPORTED_JSON_EXT.has(ext)) {
      try {
        const parsed = JSON.parse(raw);
        text = jsonToReadable(parsed);
      } catch {
        text = raw;
      }
    } else if (SUPPORTED_TEXT_EXT.has(ext) || ext === '') {
      text = raw;
    } else {
      return {
        ...fallback,
        unsupportedReason: `Формат .${ext} не поддерживается в этой версии.`,
      };
    }
  } catch (e) {
    return {
      ...fallback,
      unsupportedReason: 'Не удалось прочитать файл.',
    };
  }

  const trimmed = text.trim();
  if (!trimmed) {
    return {
      ...fallback,
      unsupportedReason: 'Файл пустой.',
    };
  }
  return {
    text: trimmed,
    textPreview: trimmed.slice(0, 600),
    summary: trimmed.slice(0, 360),
  };
}

export interface IngestionPlan {
  projectId: string;
  sourceId: string;
  userId: string;
  userEmail: string;
  text: string;
  url?: string;
  sectionTitle?: string;
}

/**
 * Чанкит текст и пишет ProjectChunk + Qdrant points.
 * Возвращает количество созданных чанков.
 */
export async function ingestParsedText(
  plan: IngestionPlan,
): Promise<number> {
  const chunks = chunkText(plan.text);
  if (chunks.length === 0) return 0;

  // 1) Mongo insert
  const docs = chunks.map((c) => ({
    project: plan.projectId,
    source: plan.sourceId,
    user: plan.userId,
    userEmail: plan.userEmail,
    chunkIndex: c.index,
    text: c.text,
    sectionTitle: plan.sectionTitle || c.sectionTitle,
    url: plan.url,
    startChar: c.startChar,
    endChar: c.endChar,
    embeddingProvider: embeddingService.isConfigured()
      ? 'deepinfra'
      : undefined,
    embeddingModel: embeddingService.isConfigured()
      ? embeddingService.modelId()
      : undefined,
  }));
  const inserted = await ProjectChunk.insertMany(docs);

  // 2) Embeddings → Qdrant (если доступно)
  if (
    embeddingService.isConfigured() &&
    vectorStoreService.isEnabled() &&
    inserted.length > 0
  ) {
    try {
      const texts = chunks.map((c) => c.text);
      const vectors = await embeddingService.embedBatch(texts);
      const points = inserted
        .map((doc: any, idx: number) => {
          const vec = vectors[idx];
          if (!Array.isArray(vec) || vec.length === 0) return null;
          return {
            id: String(doc._id),
            vector: vec,
            payload: {
              projectId: String(plan.projectId),
              sourceId: String(plan.sourceId),
              userEmail: plan.userEmail,
              chunkIndex: doc.chunkIndex,
              text: doc.text,
              page: doc.page,
              sectionTitle: doc.sectionTitle,
              sheet: doc.sheet,
              rowRange: doc.rowRange,
              url: doc.url,
            },
          };
        })
        .filter(Boolean) as any[];
      if (points.length > 0) {
        const upserted = await vectorStoreService.upsertChunks(points);
        // Привязываем vectorId == chunkId для лёгкого manual purge.
        if (upserted > 0) {
          await Promise.all(
            inserted.map((doc: any) =>
              ProjectChunk.updateOne(
                { _id: doc._id },
                { $set: { vectorId: String(doc._id) } },
              ),
            ),
          );
        }
      }
    } catch (e) {
      console.error('[INGEST] vector upsert failed', e);
    }
  }

  return chunks.length;
}
