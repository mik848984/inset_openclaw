/**
 * Normalize raw LLM output for safe UI display.
 *
 * Some models (DeepSeek-R1, Qwen reasoning, etc.) emit reasoning wrapped in
 * <think>...</think> tags. The default UX must NOT expose those raw tags.
 *
 * stripThinkBlocks  — remove all <think>...</think> content + any unclosed
 *                     trailing <think> stream (so the UI never flashes the
 *                     start of a reasoning block before the close tag arrives).
 * extractThinkBlocks — returns both the cleaned text and the joined reasoning
 *                     payload, for "Размышление" collapsible block.
 */

// Matches closed <think>...</think> blocks (any case, tolerant of whitespace).
const CLOSED_THINK_RE = /<\s*think\s*>[\s\S]*?<\s*\/\s*think\s*>/gi;

// Matches an unclosed <think> ... up to end-of-string (still streaming).
const UNCLOSED_THINK_RE = /<\s*think\s*>[\s\S]*$/i;

// Matches a trailing partial tag opener: "<", "<t", "<th", "<thi", "<thin", "<think"
// without a closing ">" — avoids flashing "<th" before the full <think> arrives.
const PARTIAL_OPEN_TAG_RE = /<\s*[a-zA-Z]*$/;

/**
 * Return text with all <think> blocks removed.
 * Streaming-safe: also removes unclosed tail and partial opening tags.
 */
export function stripThinkBlocks(text: string): string {
  if (!text) return text;
  let result = text;
  result = result.replace(CLOSED_THINK_RE, '');
  result = result.replace(UNCLOSED_THINK_RE, '');
  result = result.replace(PARTIAL_OPEN_TAG_RE, '');
  return result;
}

/**
 * Split raw text into clean output + concatenated reasoning text.
 * Reasoning text from multiple <think> blocks is joined with double newlines.
 * Unclosed trailing reasoning IS included (so reasoning can render live).
 */
export function extractThinkBlocks(text: string): {
  cleanText: string;
  reasoningText: string;
} {
  if (!text) return { cleanText: '', reasoningText: '' };

  const reasoningChunks: string[] = [];

  // 1. Closed blocks
  text.replace(CLOSED_THINK_RE, (_match) => {
    const inner = _match
      .replace(/^<\s*think\s*>/i, '')
      .replace(/<\s*\/\s*think\s*>$/i, '');
    reasoningChunks.push(inner.trim());
    return '';
  });

  // 2. Unclosed tail (still streaming)
  const unclosedMatch = text.match(UNCLOSED_THINK_RE);
  if (unclosedMatch) {
    const inner = unclosedMatch[0].replace(/^<\s*think\s*>/i, '');
    if (inner.trim()) reasoningChunks.push(inner.trim());
  }

  const cleanText = stripThinkBlocks(text);
  const reasoningText = reasoningChunks
    .filter((c) => c.length > 0)
    .join('\n\n');

  return { cleanText, reasoningText };
}

// ─── Sources marker (Perplexity-like source cards) ───────────────
// Backend (ModelsService.webSearchRequest) prepends one line at the
// beginning of the response stream:
//   __IISET_SOURCES__=[{...}, {...}]\n
// The marker is stripped from the visible answer and parsed into ISource[].
//
// Format kept simple JSON-on-one-line so it's robust across chunk boundaries
// (backend ensures the marker fits in a single chunk before LLM text starts).

export interface ISource {
  title: string;
  url: string;
  domain?: string;
  snippet?: string;
  index?: number;
}

const SOURCES_COMPLETE_RE = /__IISET_SOURCES__=(\[[\s\S]*?\])\s*\n?/;
// Partial trailing marker (open bracket without close yet) — hidden until full
const SOURCES_PARTIAL_RE = /__IISET_SOURCES__=?\[?[^\]]*$/;

/**
 * Remove a sources marker from text — both completed and partial forms.
 * Streaming-safe: hides partial marker until it's fully received.
 */
export function stripSourcesMarker(text: string): string {
  if (!text) return text;
  return text.replace(SOURCES_COMPLETE_RE, '').replace(SOURCES_PARTIAL_RE, '');
}

/**
 * Parse the sources marker from text. Returns clean content + sources array.
 * If marker is missing or malformed JSON, returns content unchanged and [].
 */
export function parseSourcesFromContent(text: string): {
  cleanContent: string;
  sources: ISource[];
} {
  if (!text) return { cleanContent: text, sources: [] };
  const match = text.match(SOURCES_COMPLETE_RE);
  if (!match) return { cleanContent: text, sources: [] };
  try {
    const parsed = JSON.parse(match[1]);
    if (!Array.isArray(parsed)) {
      return { cleanContent: text.replace(SOURCES_COMPLETE_RE, ''), sources: [] };
    }
    const sources: ISource[] = parsed
      .filter((s: any) => s && typeof s.url === 'string' && s.url.length > 0)
      .slice(0, 8)
      .map((s: any, i: number) => ({
        title: typeof s.title === 'string' ? s.title : s.url,
        url: s.url,
        domain: typeof s.domain === 'string' ? s.domain : undefined,
        snippet: typeof s.snippet === 'string' ? s.snippet : undefined,
        index: i + 1,
      }));
    return {
      cleanContent: text.replace(SOURCES_COMPLETE_RE, ''),
      sources,
    };
  } catch {
    return { cleanContent: text.replace(SOURCES_COMPLETE_RE, ''), sources: [] };
  }
}

/**
 * Convenience: pick smart slice boundary for streaming flush.
 * Prefers a natural break (space/newline/punctuation) within ~half-to-full
 * of the requested chunk size to avoid mid-word slicing.
 */
export function findFlushBoundary(text: string, max: number): number {
  if (text.length <= max) return text.length;
  const minCut = Math.max(8, Math.floor(max * 0.55));
  for (let i = max; i >= minCut; i--) {
    const c = text[i];
    if (
      c === ' ' ||
      c === '\n' ||
      c === '\t' ||
      c === '.' ||
      c === ',' ||
      c === '!' ||
      c === '?' ||
      c === ':' ||
      c === ';' ||
      c === ')' ||
      c === ']'
    ) {
      return i + 1; // include the boundary character
    }
  }
  return max;
}
