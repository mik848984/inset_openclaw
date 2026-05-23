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
// beginning of the response stream. The marker has THREE compatible shapes:
//
//   v1 (legacy):
//     __IISET_SOURCES__=[{...}, {...}]\n
//
//   v2:
//     __IISET_SOURCES__={"sources":[...],"images":[...],"followUps":[...]}\n
//
//   v3 (current — adds advanced search widgets):
//     __IISET_SOURCES__={
//       "sources":[...], "images":[...], "followUps":[...],
//       "intent":"comparison|code|news|general|...",
//       "summary":{...},
//       "comparison":{...},   // только если intent=comparison
//       "codeFix":{...},      // только если intent=code
//       "newsTimeline":[...]  // только если intent=news
//     }\n
//
// The marker is stripped from the visible answer and parsed into structured
// fields. Старые v1 / v2 сообщения по-прежнему разбираются корректно.

export type SearchIntent =
  | 'general'
  | 'news'
  | 'comparison'
  | 'code'
  | 'weather'
  | 'places'
  | 'shopping'
  | 'image'
  | 'video'
  | 'scholar';

export interface SearchSummary {
  totalSources: number;
  readSources: number;
  domains: string[];
  intent: SearchIntent;
  generatedAt: string;
}

export interface ComparisonWidget {
  query: string;
  criteria: string[];
  note: string;
}

export interface CodeFixWidget {
  query: string;
  detectedStack: string[];
  safetyNote: string;
}

export interface NewsTimelineItem {
  title: string;
  url: string;
  domain: string;
  date?: string;
  snippet?: string;
}

export type SearchNewsItem = NewsTimelineItem;

/** Compact "Knowledge Graph"-style entity card (Serper /search response). */
export interface SearchKnowledgeGraph {
  title: string;
  type?: string;
  description?: string;
  imageUrl?: string;
  website?: string;
  attributes?: Array<{ label: string; value: string }>;
}

/** «Что ещё спрашивают» — Serper peopleAlsoAsk. */
export interface PeopleAlsoAskItem {
  question: string;
  snippet?: string;
  url?: string;
  domain?: string;
}

/** Места (Serper /places). */
export interface SearchPlaceItem {
  title: string;
  address?: string;
  rating?: number;
  ratingCount?: number;
  category?: string;
  url?: string;
  domain?: string;
  latitude?: number;
  longitude?: number;
  mapsUrl?: string;
}

/** Карточки покупок (Serper /shopping). */
export interface SearchProductItem {
  title: string;
  source?: string;
  url: string;
  price?: string;
  rating?: number;
  ratingCount?: number;
  imageUrl?: string;
  domain?: string;
}

/** Научные публикации (Serper /scholar). */
export interface SearchScholarItem {
  title: string;
  url: string;
  domain?: string;
  snippet?: string;
  authors?: string;
  year?: string;
  citedBy?: number;
}

/** Видео (Serper /videos). */
export interface SearchVideoItem {
  title: string;
  url: string;
  source?: string;
  domain?: string;
  date?: string;
  imageUrl?: string;
  channel?: string;
  duration?: string;
}

export type FollowUp = string;

export interface SearchWidgetMeta {
  sources: ISource[];
  images: SearchImage[];
  followUps: FollowUp[];
  intent: SearchIntent | null;
  summary: SearchSummary | null;
  comparison: ComparisonWidget | null;
  codeFix: CodeFixWidget | null;
  newsTimeline: NewsTimelineItem[];
  knowledgeGraph: SearchKnowledgeGraph | null;
  peopleAlsoAsk: PeopleAlsoAskItem[];
  news: SearchNewsItem[];
  places: SearchPlaceItem[];
  shopping: SearchProductItem[];
  scholar: SearchScholarItem[];
  videos: SearchVideoItem[];
}

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

// ─── v3 widget coercion helpers ───────────────────────────────────

const VALID_INTENTS: ReadonlyArray<SearchIntent> = [
  'general',
  'news',
  'comparison',
  'code',
  'weather',
  'places',
  'shopping',
  'image',
  'video',
  'scholar',
];

function coerceIntent(value: any): SearchIntent | null {
  if (typeof value !== 'string') return null;
  const v = value.toLowerCase() as SearchIntent;
  return (VALID_INTENTS as readonly string[]).includes(v) ? v : null;
}

function coerceSummary(raw: any): SearchSummary | null {
  if (!raw || typeof raw !== 'object') return null;
  const intent = coerceIntent(raw.intent) || 'general';
  const totalSources =
    typeof raw.totalSources === 'number' && raw.totalSources >= 0
      ? raw.totalSources
      : 0;
  const readSources =
    typeof raw.readSources === 'number' && raw.readSources >= 0
      ? raw.readSources
      : 0;
  const domains = Array.isArray(raw.domains)
    ? (raw.domains as any[])
        .filter((d) => typeof d === 'string' && d.trim().length > 0)
        .map((d: string) => d.trim())
        .slice(0, 12)
    : [];
  const generatedAt =
    typeof raw.generatedAt === 'string' ? raw.generatedAt : '';
  return { totalSources, readSources, domains, intent, generatedAt };
}

function coerceComparison(raw: any): ComparisonWidget | null {
  if (!raw || typeof raw !== 'object') return null;
  const query = typeof raw.query === 'string' ? raw.query.slice(0, 240) : '';
  const criteria = Array.isArray(raw.criteria)
    ? (raw.criteria as any[])
        .filter((c) => typeof c === 'string' && c.trim().length > 0)
        .map((c: string) => c.trim().slice(0, 80))
        .slice(0, 8)
    : [];
  const note = typeof raw.note === 'string' ? raw.note.slice(0, 240) : '';
  if (!query && criteria.length === 0 && !note) return null;
  return { query, criteria, note };
}

function coerceCodeFix(raw: any): CodeFixWidget | null {
  if (!raw || typeof raw !== 'object') return null;
  const query = typeof raw.query === 'string' ? raw.query.slice(0, 240) : '';
  const detectedStack = Array.isArray(raw.detectedStack)
    ? (raw.detectedStack as any[])
        .filter((s) => typeof s === 'string' && s.trim().length > 0)
        .map((s: string) => s.trim().slice(0, 40))
        .slice(0, 6)
    : [];
  const safetyNote =
    typeof raw.safetyNote === 'string' ? raw.safetyNote.slice(0, 240) : '';
  if (!query && detectedStack.length === 0 && !safetyNote) return null;
  return { query, detectedStack, safetyNote };
}

function coerceNewsItem(raw: any): NewsTimelineItem | null {
  if (!raw || typeof raw !== 'object') return null;
  if (typeof raw.url !== 'string' || raw.url.length === 0) return null;
  return {
    title:
      typeof raw.title === 'string' ? raw.title.slice(0, 200) : raw.url,
    url: raw.url,
    domain: typeof raw.domain === 'string' ? raw.domain : '',
    date: typeof raw.date === 'string' ? raw.date.slice(0, 60) : undefined,
    snippet:
      typeof raw.snippet === 'string' ? raw.snippet.slice(0, 240) : undefined,
  };
}

function coerceKnowledgeGraph(raw: any): SearchKnowledgeGraph | null {
  if (!raw || typeof raw !== 'object') return null;
  const title =
    typeof raw.title === 'string' ? raw.title.slice(0, 200) : '';
  if (!title) return null;
  const attributes = Array.isArray(raw.attributes)
    ? (raw.attributes as any[])
        .map((a: any) =>
          a && typeof a.label === 'string' && typeof a.value === 'string'
            ? { label: a.label.slice(0, 60), value: a.value.slice(0, 160) }
            : null,
        )
        .filter(
          (a): a is { label: string; value: string } => a !== null,
        )
        .slice(0, 8)
    : undefined;
  return {
    title,
    type: typeof raw.type === 'string' ? raw.type.slice(0, 80) : undefined,
    description:
      typeof raw.description === 'string'
        ? raw.description.slice(0, 600)
        : undefined,
    imageUrl:
      typeof raw.imageUrl === 'string' && raw.imageUrl.length > 0
        ? raw.imageUrl
        : undefined,
    website:
      typeof raw.website === 'string' && raw.website.length > 0
        ? raw.website
        : undefined,
    attributes,
  };
}

function coercePAA(raw: any): PeopleAlsoAskItem | null {
  if (!raw || typeof raw !== 'object') return null;
  const question =
    typeof raw.question === 'string' ? raw.question.slice(0, 240) : '';
  if (!question) return null;
  return {
    question,
    snippet:
      typeof raw.snippet === 'string' ? raw.snippet.slice(0, 320) : undefined,
    url:
      typeof raw.url === 'string' && raw.url.length > 0 ? raw.url : undefined,
    domain:
      typeof raw.domain === 'string' && raw.domain.length > 0
        ? raw.domain
        : undefined,
  };
}

function coercePlace(raw: any): SearchPlaceItem | null {
  if (!raw || typeof raw !== 'object') return null;
  const title =
    typeof raw.title === 'string' ? raw.title.slice(0, 200) : '';
  if (!title) return null;
  return {
    title,
    address:
      typeof raw.address === 'string' ? raw.address.slice(0, 240) : undefined,
    rating: typeof raw.rating === 'number' ? raw.rating : undefined,
    ratingCount:
      typeof raw.ratingCount === 'number' ? raw.ratingCount : undefined,
    category:
      typeof raw.category === 'string'
        ? raw.category.slice(0, 80)
        : undefined,
    url: typeof raw.url === 'string' ? raw.url : undefined,
    domain: typeof raw.domain === 'string' ? raw.domain : undefined,
    latitude: typeof raw.latitude === 'number' ? raw.latitude : undefined,
    longitude:
      typeof raw.longitude === 'number' ? raw.longitude : undefined,
    mapsUrl:
      typeof raw.mapsUrl === 'string' ? raw.mapsUrl : undefined,
  };
}

function coerceProduct(raw: any): SearchProductItem | null {
  if (!raw || typeof raw !== 'object') return null;
  if (typeof raw.url !== 'string' || raw.url.length === 0) return null;
  return {
    title:
      typeof raw.title === 'string' ? raw.title.slice(0, 200) : raw.url,
    source:
      typeof raw.source === 'string' ? raw.source.slice(0, 80) : undefined,
    url: raw.url,
    price: typeof raw.price === 'string' ? raw.price.slice(0, 60) : undefined,
    rating: typeof raw.rating === 'number' ? raw.rating : undefined,
    ratingCount:
      typeof raw.ratingCount === 'number' ? raw.ratingCount : undefined,
    imageUrl:
      typeof raw.imageUrl === 'string' && raw.imageUrl.length > 0
        ? raw.imageUrl
        : undefined,
    domain:
      typeof raw.domain === 'string' && raw.domain.length > 0
        ? raw.domain
        : undefined,
  };
}

function coerceScholar(raw: any): SearchScholarItem | null {
  if (!raw || typeof raw !== 'object') return null;
  if (typeof raw.url !== 'string' || raw.url.length === 0) return null;
  return {
    title:
      typeof raw.title === 'string' ? raw.title.slice(0, 240) : raw.url,
    url: raw.url,
    domain: typeof raw.domain === 'string' ? raw.domain : undefined,
    snippet:
      typeof raw.snippet === 'string'
        ? raw.snippet.slice(0, 280)
        : undefined,
    authors:
      typeof raw.authors === 'string'
        ? raw.authors.slice(0, 200)
        : undefined,
    year: typeof raw.year === 'string' ? raw.year.slice(0, 16) : undefined,
    citedBy:
      typeof raw.citedBy === 'number' && raw.citedBy >= 0
        ? raw.citedBy
        : undefined,
  };
}

function coerceVideo(raw: any): SearchVideoItem | null {
  if (!raw || typeof raw !== 'object') return null;
  if (typeof raw.url !== 'string' || raw.url.length === 0) return null;
  return {
    title:
      typeof raw.title === 'string' ? raw.title.slice(0, 200) : raw.url,
    url: raw.url,
    source:
      typeof raw.source === 'string' ? raw.source.slice(0, 80) : undefined,
    domain:
      typeof raw.domain === 'string' && raw.domain.length > 0
        ? raw.domain
        : undefined,
    date: typeof raw.date === 'string' ? raw.date.slice(0, 60) : undefined,
    imageUrl:
      typeof raw.imageUrl === 'string' && raw.imageUrl.length > 0
        ? raw.imageUrl
        : undefined,
    channel:
      typeof raw.channel === 'string'
        ? raw.channel.slice(0, 80)
        : undefined,
    duration:
      typeof raw.duration === 'string'
        ? raw.duration.slice(0, 32)
        : undefined,
  };
}

/**
 * Parse the sources marker from text. Returns clean content + structured
 * search metadata: sources, images, followUps плюс v3-расширения
 * (intent, summary, comparison, codeFix, newsTimeline). Marker отсутствует
 * или JSON битый → возвращаем content без изменений и пустые поля.
 *
 * Backward-compatible:
 *   - v1 (массив) → только sources
 *   - v2 (объект без intent) → sources/images/followUps, остальное пустое
 *   - v3 → все поля
 */
export function parseSourcesFromContent(text: string): {
  cleanContent: string;
  sources: ISource[];
  images: SearchImage[];
  followUps: string[];
  intent: SearchIntent | null;
  summary: SearchSummary | null;
  comparison: ComparisonWidget | null;
  codeFix: CodeFixWidget | null;
  newsTimeline: NewsTimelineItem[];
  knowledgeGraph: SearchKnowledgeGraph | null;
  peopleAlsoAsk: PeopleAlsoAskItem[];
  news: SearchNewsItem[];
  places: SearchPlaceItem[];
  shopping: SearchProductItem[];
  scholar: SearchScholarItem[];
  videos: SearchVideoItem[];
} {
  const empty = {
    cleanContent: text,
    sources: [] as ISource[],
    images: [] as SearchImage[],
    followUps: [] as string[],
    intent: null as SearchIntent | null,
    summary: null as SearchSummary | null,
    comparison: null as ComparisonWidget | null,
    codeFix: null as CodeFixWidget | null,
    newsTimeline: [] as NewsTimelineItem[],
    knowledgeGraph: null as SearchKnowledgeGraph | null,
    peopleAlsoAsk: [] as PeopleAlsoAskItem[],
    news: [] as SearchNewsItem[],
    places: [] as SearchPlaceItem[],
    shopping: [] as SearchProductItem[],
    scholar: [] as SearchScholarItem[],
    videos: [] as SearchVideoItem[],
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
      ...empty,
      cleanContent,
      sources,
    };
  }

  // v2 / v3 — object
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

    // v3 widgets
    const intent = coerceIntent(parsed.intent);
    const summary = coerceSummary(parsed.summary);
    const comparison = coerceComparison(parsed.comparison);
    const codeFix = coerceCodeFix(parsed.codeFix);
    const newsTimeline = Array.isArray(parsed.newsTimeline)
      ? (parsed.newsTimeline as any[])
          .map((it: any) => coerceNewsItem(it))
          .filter((it): it is NewsTimelineItem => it !== null)
          .slice(0, 8)
      : [];

    // v4 widgets — knowledgeGraph / PAA / specialized endpoint payloads
    const knowledgeGraph = coerceKnowledgeGraph(parsed.knowledgeGraph);
    const peopleAlsoAsk = Array.isArray(parsed.peopleAlsoAsk)
      ? (parsed.peopleAlsoAsk as any[])
          .map((it: any) => coercePAA(it))
          .filter((it): it is PeopleAlsoAskItem => it !== null)
          .slice(0, 4)
      : [];
    const news = Array.isArray(parsed.news)
      ? (parsed.news as any[])
          .map((it: any) => coerceNewsItem(it))
          .filter((it): it is NewsTimelineItem => it !== null)
          .slice(0, 5)
      : [];
    const places = Array.isArray(parsed.places)
      ? (parsed.places as any[])
          .map((it: any) => coercePlace(it))
          .filter((it): it is SearchPlaceItem => it !== null)
          .slice(0, 5)
      : [];
    const shopping = Array.isArray(parsed.shopping)
      ? (parsed.shopping as any[])
          .map((it: any) => coerceProduct(it))
          .filter((it): it is SearchProductItem => it !== null)
          .slice(0, 5)
      : [];
    const scholar = Array.isArray(parsed.scholar)
      ? (parsed.scholar as any[])
          .map((it: any) => coerceScholar(it))
          .filter((it): it is SearchScholarItem => it !== null)
          .slice(0, 5)
      : [];
    const videos = Array.isArray(parsed.videos)
      ? (parsed.videos as any[])
          .map((it: any) => coerceVideo(it))
          .filter((it): it is SearchVideoItem => it !== null)
          .slice(0, 5)
      : [];

    return {
      cleanContent,
      sources,
      images,
      followUps,
      intent,
      summary,
      comparison,
      codeFix,
      newsTimeline,
      knowledgeGraph,
      peopleAlsoAsk,
      news,
      places,
      shopping,
      scholar,
      videos,
    };
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
