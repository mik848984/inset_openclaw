/**
 * Простой character-based чанкер для проектного RAG.
 *
 * MVP-стратегия:
 *   • размер ~4000 символов (≈ 800–1200 токенов в русском);
 *   • overlap ~300 символов, чтобы не обрезать факты на границе;
 *   • split на параграфах и предложениях когда возможно;
 *   • максимум `MAX_CHUNKS` чанков на источник.
 *
 * Это намеренно лёгкая реализация — без tiktoken и без сложных
 * сегментаторов, чтобы избежать новых зависимостей. Качество улучшим
 * через embeddings + reranker.
 */

const DEFAULT_CHUNK_SIZE = 4000;
const DEFAULT_OVERLAP = 300;
const MAX_CHUNKS = 200;

export interface TextChunk {
  index: number;
  text: string;
  startChar: number;
  endChar: number;
  sectionTitle?: string;
}

/** Нормализует пробелы и переводы строк. */
function normalize(input: string): string {
  return (input || '')
    .replace(/\r\n/g, '\n')
    .replace(/ /g, ' ')
    .replace(/\t/g, '  ')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Бьёт строку на пересекающиеся чанки. Старается резать по двойным
 * переводам строк и точкам, чтобы не ломать факты. Гарантирует
 * `chunks.length <= MAX_CHUNKS`.
 */
export function chunkText(
  raw: string,
  opts: {
    chunkSize?: number;
    overlap?: number;
    maxChunks?: number;
  } = {},
): TextChunk[] {
  const chunkSize = Math.max(800, opts.chunkSize ?? DEFAULT_CHUNK_SIZE);
  const overlap = Math.max(0, Math.min(opts.overlap ?? DEFAULT_OVERLAP, chunkSize / 3));
  const maxChunks = Math.max(1, opts.maxChunks ?? MAX_CHUNKS);

  const text = normalize(raw);
  if (!text) return [];

  const chunks: TextChunk[] = [];
  let cursor = 0;
  while (cursor < text.length && chunks.length < maxChunks) {
    const end = Math.min(cursor + chunkSize, text.length);

    // Стараемся обрезать по паре переводов строк / концу предложения.
    let cut = end;
    if (end < text.length) {
      const slice = text.slice(cursor, end);
      const lastParaBreak = slice.lastIndexOf('\n\n');
      const lastSentence = Math.max(
        slice.lastIndexOf('. '),
        slice.lastIndexOf('! '),
        slice.lastIndexOf('? '),
        slice.lastIndexOf('.\n'),
        slice.lastIndexOf('!\n'),
        slice.lastIndexOf('?\n'),
      );
      const boundary = Math.max(lastParaBreak, lastSentence);
      // Не режем слишком рано — нужно хотя бы 60% от chunkSize.
      if (boundary > chunkSize * 0.6) {
        cut = cursor + boundary + 1;
      }
    }

    chunks.push({
      index: chunks.length,
      text: text.slice(cursor, cut).trim(),
      startChar: cursor,
      endChar: cut,
    });

    if (cut >= text.length) break;
    cursor = Math.max(cut - overlap, cursor + 1);
  }
  return chunks.filter((c) => c.text.length > 0);
}

/**
 * Простой parser для CSV → удобочитаемый markdown-like текст:
 * каждая строка превращается в `Колонка: значение`. Это даёт embeddings
 * чёткий контекст без сложной табличной семантики.
 */
export function csvToReadable(csv: string): string {
  const lines = (csv || '').split(/\r?\n/).filter((l) => l.length > 0);
  if (!lines.length) return '';
  const split = (line: string) =>
    line
      .split(',')
      .map((s) => s.replace(/^"|"$/g, '').replace(/""/g, '"').trim());
  const headers = split(lines[0]);
  const rows = lines.slice(1, 1001).map(split);

  return rows
    .map((row, i) => {
      const parts = headers
        .map((h, j) => (h && row[j] ? `${h}: ${row[j]}` : ''))
        .filter(Boolean);
      return `Строка ${i + 1}\n${parts.join('\n')}`;
    })
    .join('\n\n');
}

/** Простой JSON → читаемый текст по ключам. Объекты разворачиваются на 3 уровня. */
export function jsonToReadable(input: any, depth = 0, maxDepth = 3): string {
  if (input === null || input === undefined) return '';
  if (typeof input === 'string' || typeof input === 'number' || typeof input === 'boolean') {
    return String(input);
  }
  if (depth >= maxDepth) return '[…]';
  if (Array.isArray(input)) {
    return input
      .slice(0, 200)
      .map((v, i) => `- ${jsonToReadable(v, depth + 1, maxDepth)}`)
      .join('\n');
  }
  if (typeof input === 'object') {
    return Object.entries(input)
      .slice(0, 200)
      .map(([k, v]) => `${k}: ${jsonToReadable(v, depth + 1, maxDepth)}`)
      .join('\n');
  }
  return '';
}
