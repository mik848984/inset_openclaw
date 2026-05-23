/**
 * Ingestion pipeline для проектного RAG.
 *
 * Шаги:
 *   1) parseFile(buffer, name, mime): на основе расширения извлекает
 *      текст (txt/md/csv/json/pdf/docx/xlsx/xls) и возвращает либо
 *      плоский text, либо segments[] с page/sheet metadata.
 *   2) ingestParsedText: для каждого сегмента — chunkText, embed,
 *      Mongo ProjectChunk, Qdrant upsert.
 *
 * Дизайн graceful-degradation:
 *   • embeddings выключены — ingestion всё равно проходит, retrieval
 *     переключается на keyword;
 *   • Qdrant выключен — то же;
 *   • parse failed — source помечается как `error`/`unsupported`
 *     c понятным errorCode.
 *
 * Парсеры PDF/DOCX/XLSX загружаются динамически (`await import(...)`),
 * чтобы тяжёлые библиотеки (pdfjs-dist) не тянулись в bundle для
 * запросов без файлов.
 */

import ProjectChunk from '@/models/projectChunk';
import { chunkText, csvToReadable, jsonToReadable } from '@/utils/textChunker';
import { embeddingService } from '@/services/api/EmbeddingService';
import { vectorStoreService } from '@/services/api/VectorStoreService';

export type IngestionErrorCode =
  | 'unsupported_format'
  | 'empty_document'
  | 'pdf_text_not_extractable'
  | 'parse_failed'
  | 'ingestion_failed'
  | 'embedding_failed'
  | 'vector_store_failed';

export interface ParsedSegment {
  text: string;
  page?: number;
  sheet?: string;
  rowRange?: string;
  sectionTitle?: string;
}

export interface ParsedSource {
  /** Полный текст (объединение всех сегментов). Используется для preview/summary. */
  text: string;
  textPreview: string;
  summary: string;
  /** Сегменты для chunk-инга с metadata. Если undefined — фиксируется только text. */
  segments?: ParsedSegment[];
  /** Если формат не поддерживается, status в БД будет 'unsupported'. */
  unsupportedReason?: string;
  /** Машинно-читаемый код для UI/тестов. */
  errorCode?: IngestionErrorCode;
}

const SUPPORTED_TEXT_EXT = new Set(['txt', 'md', 'markdown', 'log']);
const SUPPORTED_CSV_EXT = new Set(['csv', 'tsv']);
const SUPPORTED_JSON_EXT = new Set(['json']);
const SUPPORTED_PDF_EXT = new Set(['pdf']);
const SUPPORTED_DOCX_EXT = new Set(['docx']);
const SUPPORTED_XLSX_EXT = new Set(['xlsx', 'xls']);

// Лимит размера читаемого текста, чтобы не свалить сервер на гигантском
// pptx/xlsx. ~5 млн символов ≈ 1–2 млн токенов; режется на MAX_CHUNKS
// в chunkText, лишнее не индексируем.
const MAX_TEXT_CHARS = 5_000_000;

// Лимит строк на лист XLSX. Защита от мегатаблиц.
const MAX_XLSX_ROWS_PER_SHEET = 2_000;

export function extOf(name: string, mime?: string): string {
  const fromName = (name || '').split('.').pop()?.toLowerCase() || '';
  if (fromName) return fromName;
  if (mime?.includes('pdf')) return 'pdf';
  if (mime?.includes('wordprocessingml') || mime?.includes('msword'))
    return 'docx';
  if (
    mime?.includes('spreadsheetml') ||
    mime?.includes('ms-excel') ||
    mime?.includes('excel')
  )
    return 'xlsx';
  if (mime?.includes('csv')) return 'csv';
  if (mime?.includes('json')) return 'json';
  if (mime?.startsWith('text/')) return 'txt';
  return '';
}

function buildParsed(
  text: string,
  segments?: ParsedSegment[],
): ParsedSource {
  const trimmed = text.length > MAX_TEXT_CHARS ? text.slice(0, MAX_TEXT_CHARS) : text;
  const cleaned = trimmed.trim();
  if (!cleaned) {
    return {
      text: '',
      textPreview: '',
      summary: '',
      unsupportedReason: 'Файл пустой.',
      errorCode: 'empty_document',
    };
  }
  return {
    text: cleaned,
    textPreview: cleaned.slice(0, 600),
    summary: cleaned.slice(0, 360),
    segments: segments?.filter((s) => s.text && s.text.trim().length > 0),
  };
}

function unsupported(
  reason: string,
  errorCode: IngestionErrorCode = 'unsupported_format',
): ParsedSource {
  return {
    text: '',
    textPreview: '',
    summary: '',
    unsupportedReason: reason,
    errorCode,
  };
}

// ── Parsers per-format ────────────────────────────────────────────

async function parsePdfBuffer(buffer: Buffer): Promise<ParsedSource> {
  try {
    // pdf-parse v2 — ESM-only, поэтому динамический import.
    const mod: any = await import('pdf-parse');
    const PDFParse = mod.PDFParse || mod.default?.PDFParse;
    if (!PDFParse) {
      return unsupported(
        'PDF-парсер недоступен в этой сборке.',
        'parse_failed',
      );
    }
    const parser = new PDFParse({ data: new Uint8Array(buffer) });
    const result = await parser.getText();
    const segments: ParsedSegment[] = (result?.pages || [])
      .map((p: { num: number; text: string }) => ({
        page: p.num,
        text: (p.text || '').trim(),
      }))
      .filter((s: ParsedSegment) => s.text.length > 0);
    const fullText = segments.map((s) => s.text).join('\n\n');
    if (!fullText.trim()) {
      return unsupported(
        'PDF не содержит извлекаемого текста. OCR пока не поддерживается.',
        'pdf_text_not_extractable',
      );
    }
    return buildParsed(fullText, segments);
  } catch (e) {
    console.error('[INGEST] pdf parse failed', e);
    return unsupported('Не удалось прочитать PDF.', 'parse_failed');
  }
}

async function parseDocxBuffer(buffer: Buffer): Promise<ParsedSource> {
  try {
    const mod: any = await import('mammoth');
    const mammoth = mod.default ?? mod;
    const result = await mammoth.extractRawText({ buffer });
    const text = (result?.value || '').trim();
    if (!text) {
      return unsupported(
        'Документ DOCX не содержит текста.',
        'empty_document',
      );
    }
    return buildParsed(text, [{ text }]);
  } catch (e) {
    console.error('[INGEST] docx parse failed', e);
    return unsupported('Не удалось прочитать DOCX.', 'parse_failed');
  }
}

async function parseXlsxBuffer(buffer: Buffer): Promise<ParsedSource> {
  try {
    const XLSX: any = await import('xlsx');
    const wb = XLSX.read(buffer, { type: 'buffer' });
    const segments: ParsedSegment[] = [];
    let combined = '';

    for (const sheetName of wb.SheetNames as string[]) {
      const sheet = wb.Sheets[sheetName];
      if (!sheet) continue;
      const rows: any[][] = XLSX.utils.sheet_to_json(sheet, {
        header: 1,
        blankrows: false,
        defval: '',
      });
      if (!rows.length) continue;

      const limitedRows = rows.slice(0, MAX_XLSX_ROWS_PER_SHEET);
      const header = (limitedRows[0] || []).map((c: any) =>
        String(c ?? '').trim(),
      );
      const dataRows = limitedRows.slice(1);
      const hasUsableHeader = header.some((h) => h.length > 0);

      const parts: string[] = [];
      const startRowIdx = 2; // листовые номера строк (1-based, с учётом header)
      dataRows.forEach((row, i) => {
        if (!Array.isArray(row)) return;
        const cells: string[] = [];
        for (let j = 0; j < Math.max(header.length, row.length); j++) {
          const v = row[j];
          if (v === undefined || v === null || v === '') continue;
          const valueStr = String(v).trim();
          if (!valueStr) continue;
          if (hasUsableHeader && header[j]) {
            cells.push(`${header[j]}: ${valueStr}`);
          } else {
            cells.push(valueStr);
          }
        }
        if (cells.length === 0) return;
        parts.push(
          `Лист «${sheetName}», строка ${startRowIdx + i}\n${cells.join('\n')}`,
        );
      });

      const sheetText = parts.join('\n\n');
      if (sheetText) {
        segments.push({
          text: sheetText,
          sheet: sheetName,
          rowRange: `1-${startRowIdx + dataRows.length - 1}`,
        });
        combined += (combined ? '\n\n' : '') + sheetText;
      }

      if (combined.length >= MAX_TEXT_CHARS) break;
    }

    if (!combined.trim()) {
      return unsupported(
        'Таблица не содержит данных для индексации.',
        'empty_document',
      );
    }
    return buildParsed(combined, segments);
  } catch (e) {
    console.error('[INGEST] xlsx parse failed', e);
    return unsupported('Не удалось прочитать XLSX.', 'parse_failed');
  }
}

/**
 * Превращает буфер файла в читаемый текст и сегменты с metadata.
 * Поддерживается: txt, md, log, csv, tsv, json, pdf, docx, xlsx, xls.
 */
export async function parseFile(
  buffer: Buffer,
  fileName: string,
  mime?: string,
): Promise<ParsedSource> {
  const ext = extOf(fileName, mime);

  if (SUPPORTED_PDF_EXT.has(ext)) return parsePdfBuffer(buffer);
  if (SUPPORTED_DOCX_EXT.has(ext)) return parseDocxBuffer(buffer);
  if (SUPPORTED_XLSX_EXT.has(ext)) return parseXlsxBuffer(buffer);

  // Текстовые форматы — синхронно через utf8.
  try {
    const raw = buffer.toString('utf8');

    if (SUPPORTED_CSV_EXT.has(ext)) {
      return buildParsed(csvToReadable(raw));
    }
    if (SUPPORTED_JSON_EXT.has(ext)) {
      let asText: string;
      try {
        asText = jsonToReadable(JSON.parse(raw));
      } catch {
        asText = raw;
      }
      return buildParsed(asText);
    }
    if (SUPPORTED_TEXT_EXT.has(ext) || ext === '') {
      return buildParsed(raw);
    }
    return unsupported(`Формат .${ext} не поддерживается.`);
  } catch (e) {
    console.error('[INGEST] text parse failed', e);
    return unsupported('Не удалось прочитать файл.', 'parse_failed');
  }
}

export interface IngestionPlan {
  projectId: string;
  sourceId: string;
  userId: string;
  userEmail: string;
  /** Плоский текст. Используется, если segments не передан. */
  text?: string;
  /** Сегменты с metadata (PDF/XLSX). Каждый чанкится отдельно. */
  segments?: ParsedSegment[];
  url?: string;
  sectionTitle?: string;
}

/**
 * Чанкит текст (или сегменты) и пишет ProjectChunk + Qdrant points.
 * Возвращает количество созданных чанков.
 */
export async function ingestParsedText(
  plan: IngestionPlan,
): Promise<number> {
  // Сборка единого массива «чанк + metadata». Если segments переданы —
  // каждый сегмент чанкится отдельно, его page/sheet/rowRange попадают
  // в metadata каждого получившегося чанка. Иначе — обычный plain-text.
  type DocRow = {
    project: string;
    source: string;
    user: string;
    userEmail: string;
    chunkIndex: number;
    text: string;
    page?: number;
    sheet?: string;
    rowRange?: string;
    sectionTitle?: string;
    url?: string;
    startChar?: number;
    endChar?: number;
    embeddingProvider?: 'deepinfra';
    embeddingModel?: string;
  };

  const rows: DocRow[] = [];
  let globalIndex = 0;
  const baseMeta = {
    project: plan.projectId,
    source: plan.sourceId,
    user: plan.userId,
    userEmail: plan.userEmail,
    url: plan.url,
    embeddingProvider: embeddingService.isConfigured()
      ? ('deepinfra' as const)
      : undefined,
    embeddingModel: embeddingService.isConfigured()
      ? embeddingService.modelId()
      : undefined,
  };

  const segments: ParsedSegment[] =
    plan.segments && plan.segments.length > 0
      ? plan.segments
      : plan.text
      ? [{ text: plan.text, sectionTitle: plan.sectionTitle }]
      : [];

  for (const seg of segments) {
    const chunks = chunkText(seg.text);
    for (const c of chunks) {
      rows.push({
        ...baseMeta,
        chunkIndex: globalIndex++,
        text: c.text,
        page: seg.page,
        sheet: seg.sheet,
        rowRange: seg.rowRange,
        sectionTitle: seg.sectionTitle || plan.sectionTitle || c.sectionTitle,
        startChar: c.startChar,
        endChar: c.endChar,
      });
    }
  }

  if (rows.length === 0) return 0;

  // 1) Mongo insert
  const inserted = await ProjectChunk.insertMany(rows);

  // 2) Embeddings → Qdrant (если доступно)
  if (
    embeddingService.isConfigured() &&
    vectorStoreService.isEnabled() &&
    inserted.length > 0
  ) {
    try {
      const texts = rows.map((r) => r.text);
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
      // Не валим ingestion — chunks уже в Mongo, retrieval работает
      // через keyword fallback.
      console.error('[INGEST] vector upsert failed', e);
    }
  }

  return rows.length;
}
