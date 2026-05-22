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
// beginning of the response stream. The marker has TWO compatible shapes:
//
//   v1 (legacy):
//     __IISET_SOURCES__=[{...}, {...}]\n
//
//   v2 (current):
//     __IISET_SOURCES__={"sources":[...],"images":[...],"followUps":[...]}\n
//
// The marker is stripped from the visible answer and parsed into structured
// fields. v1 messages from before the upgrade still parse cleanly into
// sources only (images/followUps empty).

export interface ISource {
  title: string;
  url: string;
  domain?: string;
  snippet?: string;
  index?: number;
}

export interface SearchImage {
  title?: string;
  imageUrl: string;
  sourceUrl?: string;
  domain?: string;
}

// Match either a JSON array or a JSON object after the marker name.
// The capture group greedily reaches to the next newline, then we use a
// balanced parser to find the real end of the payload. Newline keeps the
// regex anchor cheap and predictable.
const SOURCES_COMPLETE_RE = /__IISET_SOURCES__=([\[\{][\s\S]*?[\]\}])\s*\n?/;
// Partial trailing marker (opening bracket without close yet) — hidden until full.
// Matches both `__IISET_SOURCES__=[partial...` and `__IISET_SOURCES__={partial...`.
const SOURCES_PARTIAL_RE = /__IISET_SOURCES__=?[\[\{]?[^\]\}]*$/;

// Find the index of the matching closing bracket/brace, handling nested
// strings and escapes. `text[start]` must be `[` or `{`. Returns the index
// of the close bracket, or -1 if not balanced.
function findBalancedEnd(text: string, start: number): number {
  const openCh = text[start];
  const closeCh = openCh === '[' ? ']' : openCh === '{' ? '}' : '';
  if (!closeCh) return -1;
  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let i = start; i < text.length; i++) {
    const ch = text[i];
    if (escaped) {
      escaped = false;
      continue;
    }
    if (inString) {
      if (ch === '\\') escaped = true;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') {
      inString = true;
      continue;
    }
    if (ch === openCh) depth++;
    else if (ch === closeCh) {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

// Extract `{full marker prefix..close..optional \n}` slice and the inner
// JSON payload. Returns null if no complete marker is found.
function locateMarker(
  text: string,
): { markerSlice: string; payload: string } | null {
  const prefix = '__IISET_SOURCES__=';
  const idx = text.indexOf(prefix);
  if (idx === -1) return null;
  const start = idx + prefix.length;
  const openCh = text[start];
  if (openCh !== '[' && openCh !== '{') return null;
  const end = findBalancedEnd(text, start);
  if (end === -1) return null;
  let cursor = end + 1;
  // consume one trailing \n if present
  if (text[cursor] === '\n') cursor++;
  return {
    markerSlice: text.slice(idx, cursor),
    payload: text.slice(start, end + 1),
  };
}

/**
 * Remove a sources marker from text — both completed and partial forms.
 * Streaming-safe: hides partial marker until it's fully received.
 */
export function stripSourcesMarker(text: string): string {
  if (!text) return text;
  // Prefer the balanced locator (works for both array and object payloads).
  const loc = locateMarker(text);
  if (loc) {
    return text.split(loc.markerSlice).join('');
  }
  // Fallback for legacy: regex form (only completes when payload is short).
  return text.replace(SOURCES_COMPLETE_RE, '').replace(SOURCES_PARTIAL_RE, '');
}

function coerceSource(s: any, i: number): ISource | null {
  if (!s || typeof s.url !== 'string' || s.url.length === 0) return null;
  return {
    title: typeof s.title === 'string' ? s.title : s.url,
    url: s.url,
    domain: typeof s.domain === 'string' ? s.domain : undefined,
    snippet: typeof s.snippet === 'string' ? s.snippet : undefined,
    index: typeof s.index === 'number' ? s.index : i + 1,
  };
}

function coerceImage(img: any): SearchImage | null {
  if (!img) return null;
  const imageUrl =
    typeof img.imageUrl === 'string' && img.imageUrl.length > 0
      ? img.imageUrl
      : typeof img.image === 'string' && img.image.length > 0
        ? img.image
        : '';
  if (!imageUrl) return null;
  const sourceUrl =
    typeof img.sourceUrl === 'string' && img.sourceUrl.length > 0
      ? img.sourceUrl
      : typeof img.link === 'string' && img.link.length > 0
        ? img.link
        : undefined;
  return {
    title: typeof img.title === 'string' ? img.title : undefined,
    imageUrl,
    sourceUrl,
    domain: typeof img.domain === 'string' ? img.domain : undefined,
  };
}

/**
 * Parse the sources marker from text. Returns clean content + structured
 * search metadata (sources / images / followUps). If the marker is missing
 * or malformed JSON, returns content unchanged and empty arrays.
 *
 * Backward-compatible: a legacy `[...]` payload becomes `{sources: [...]}`
 * with empty `images` and `followUps`.
 */
export function parseSourcesFromContent(text: string): {
  cleanContent: string;
  sources: ISource[];
  images: SearchImage[];
  followUps: string[];
} {
  const empty = {
    cleanContent: text,
    sources: [] as ISource[],
    images: [] as SearchImage[],
    followUps: [] as string[],
  };
  if (!text) return empty;

  const loc = locateMarker(text);
  if (!loc) return empty;

  const cleanContent = text.split(loc.markerSlice).join('');

  let parsed: any;
  try {
    parsed = JSON.parse(loc.payload);
  } catch {
    return { ...empty, cleanContent };
  }

  // v1 — bare array
  if (Array.isArray(parsed)) {
    const sources = parsed
      .map((s: any, i: number) => coerceSource(s, i))
      .filter((s): s is ISource => s !== null)
      .slice(0, 8);
    return {
      cleanContent,
      sources,
      images: [],
      followUps: [],
    };
  }

  // v2 — object { sources, images, followUps }
  if (parsed && typeof parsed === 'object') {
    const rawSources = Array.isArray(parsed.sources) ? parsed.sources : [];
    const rawImages = Array.isArray(parsed.images) ? parsed.images : [];
    const rawFollowUps = Array.isArray(parsed.followUps)
      ? parsed.followUps
      : [];

    const sources = rawSources
      .map((s: any, i: number) => coerceSource(s, i))
      .filter((s: ISource | null): s is ISource => s !== null)
      .slice(0, 8);

    const seenImg = new Set<string>();
    const images = rawImages
      .map((img: any) => coerceImage(img))
      .filter((img: SearchImage | null): img is SearchImage => {
        if (!img) return false;
        if (seenImg.has(img.imageUrl)) return false;
        seenImg.add(img.imageUrl);
        return true;
      })
      .slice(0, 6);

    const followUps = rawFollowUps
      .filter((q: any) => typeof q === 'string' && q.trim().length > 0)
      .map((q: string) => q.trim().slice(0, 120))
      .slice(0, 4);

    return { cleanContent, sources, images, followUps };
  }

  return { ...empty, cleanContent };
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
