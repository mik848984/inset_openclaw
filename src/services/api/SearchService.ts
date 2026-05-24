import { modelsService } from '@/services/api/ModelsService';

export type SearchIntent =
  | 'general'
  | 'news'
  | 'comparison'
  | 'shopping'
  | 'local_places'
  | 'research'
  | 'academic'
  | 'patents'
  | 'how_to';

export type SerperEndpoint =
  | 'search'
  | 'news'
  | 'images'
  | 'shopping'
  | 'places'
  | 'scholar'
  | 'patents'
  | 'autocomplete'
  | 'scrape';

export type ProgressStep =
  | 'understand'
  | 'search'
  | 'open'
  | 'compare'
  | 'answer';

export type ProgressStatus = 'pending' | 'running' | 'done' | 'skipped';

export interface SourceCard {
  index: number;
  title: string;
  url: string;
  domain: string;
  snippet?: string;
  source: SerperEndpoint;
  imageUrl?: string;
  thumbnailUrl?: string;
  price?: string;
  rating?: number;
  ratingCount?: number;
  address?: string;
  phone?: string;
  date?: string;
  snippetOnly?: boolean;
}

export type SearchEvent =
  | {
      type: 'progress';
      step: ProgressStep;
      status: ProgressStatus;
      detail?: string;
    }
  | {
      type: 'intent';
      intent: SearchIntent;
      subQueries: string[];
      endpoints: SerperEndpoint[];
    }
  | { type: 'sources'; sources: SourceCard[] }
  | { type: 'answer_delta'; text: string }
  | { type: 'followups'; questions: string[] }
  | { type: 'done' }
  | { type: 'error'; message: string };

export type EventSink = (event: SearchEvent) => void;

const SERPER_BASE = 'https://google.serper.dev';
const SERPER_SCRAPE = 'https://scrape.serper.dev';

const DEFAULT_LOCALE = { gl: 'ru', hl: 'ru' };

const ENDPOINT_TIMEOUT_MS = 9000;
const SCRAPE_TIMEOUT_MS = 12000;

interface RawSerperResult {
  endpoint: SerperEndpoint;
  data: any;
}

// ──────────────────────────────────────────────────────────────────────────────
// Intent classifier — pure heuristics, fast, no extra LLM call before sources.
// ──────────────────────────────────────────────────────────────────────────────

const includesAny = (q: string, words: string[]) =>
  words.some((w) => q.includes(w));

export function classifyIntent(query: string): SearchIntent {
  const q = query.toLowerCase();

  // patents
  if (
    includesAny(q, ['патент', 'изобретен', 'patent', 'invention', 'utility model'])
  ) {
    return 'patents';
  }

  // academic / scholarly
  if (
    includesAny(q, [
      'научн',
      'исследован',
      'paper',
      'arxiv',
      'pubmed',
      'doi',
      'статья про',
      'metaanaly',
      'мета-анализ',
      'rag retrieval',
      'retrieval augmented',
    ])
  ) {
    return 'academic';
  }

  // local_places
  if (
    includesAny(q, [
      'рядом',
      ' возле ',
      ' near me',
      ' near ',
      'где находит',
      'адрес',
      'кафе ',
      'ресторан',
      'клиника',
      'магазин ',
      'парикмахер',
      'салон',
      'аптек',
      'банкомат',
      'отделение',
      'офис ',
    ])
  ) {
    return 'local_places';
  }

  // shopping
  if (
    includesAny(q, [
      'купить',
      'цена',
      'стоит',
      'до 1000',
      'до 5000',
      'до 10000',
      'до 15000',
      'до 20000',
      'до 30000',
      'до 50000',
      '₽',
      ' руб',
      ' usd',
      ' $',
      ' eur',
      ' €',
      'смартфон',
      'наушник',
      'ноутбук',
      'пылесос',
      'товар',
      'модел',
      'лучшие ',
      'топ ',
      'review',
      'обзор ',
    ]) &&
    !includesAny(q, ['рядом', ' возле ', 'адрес'])
  ) {
    // shopping if there's a price / "лучшие" / model intent
    if (
      includesAny(q, [
        'купить',
        'цена',
        'стоит',
        '₽',
        ' руб',
        ' usd',
        ' $',
        ' eur',
        ' €',
        'до ',
        'дешев',
        'недорог',
      ]) ||
      includesAny(q, ['лучшие ', 'топ ', 'best '])
    ) {
      return 'shopping';
    }
  }

  // news
  if (
    includesAny(q, [
      'новости',
      'последние новости',
      'что произошло',
      'что случилось',
      'сегодня',
      'вчера',
      'на этой неделе',
      'в этом месяце',
      'на рынке',
      'сейчас происходит',
      'свежие',
    ])
  ) {
    return 'news';
  }

  // comparison
  if (
    includesAny(q, [
      ' vs ',
      ' vs.',
      ' или ',
      'против ',
      'сравнить',
      'сравнение',
      'какой лучше',
      'что лучше',
      'что выбрать',
      'выбор между',
      'какой банк',
      'какая ',
    ])
  ) {
    return 'comparison';
  }

  // how_to
  if (
    includesAny(q, [
      'как сделать',
      'как настроить',
      'как починить',
      'как установить',
      'пошагово',
      'инструкция',
      'how to ',
      'how do i',
    ])
  ) {
    return 'how_to';
  }

  // research (overview, "что известно про X")
  if (
    includesAny(q, [
      'что известно',
      'обзор',
      'как работает',
      'устройство',
      'механизм',
      'архитектура',
      'overview',
    ])
  ) {
    return 'research';
  }

  return 'general';
}

// ──────────────────────────────────────────────────────────────────────────────
// Sub-query builder + endpoint selection per intent.
// ──────────────────────────────────────────────────────────────────────────────

export function buildSubQueries(query: string, intent: SearchIntent): string[] {
  const base = query.trim();
  const queries: string[] = [base];

  switch (intent) {
    case 'shopping':
      queries.push(`${base} обзор`, `${base} купить`);
      break;
    case 'comparison':
      queries.push(`${base} сравнение`, `${base} плюсы и минусы`);
      break;
    case 'news':
      queries.push(`${base} последние новости`);
      break;
    case 'academic':
      queries.push(`${base} research`, `${base} site:arxiv.org`);
      break;
    case 'patents':
      queries.push(`${base} патент`);
      break;
    case 'local_places':
      // single query is usually enough; places endpoint handles location
      break;
    case 'how_to':
      queries.push(`${base} инструкция`);
      break;
    case 'research':
      queries.push(`${base} как работает`);
      break;
    default:
      break;
  }

  // dedup and limit to 4
  return Array.from(new Set(queries)).slice(0, 4);
}

export function endpointsForIntent(intent: SearchIntent): SerperEndpoint[] {
  switch (intent) {
    case 'shopping':
      return ['shopping', 'images', 'search'];
    case 'news':
      return ['news', 'search'];
    case 'local_places':
      return ['places', 'search'];
    case 'academic':
      return ['scholar', 'search'];
    case 'patents':
      return ['patents', 'search'];
    case 'comparison':
    case 'how_to':
    case 'research':
    case 'general':
    default:
      return ['search'];
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// Serper HTTP layer — generic with timeout + graceful fallback.
// ──────────────────────────────────────────────────────────────────────────────

async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs: number,
): Promise<Response> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: ctrl.signal });
  } finally {
    clearTimeout(t);
  }
}

async function callSerperEndpoint(
  endpoint: SerperEndpoint,
  body: Record<string, any>,
): Promise<any | null> {
  const apiKey = process.env.SERPER_API_KEY;
  if (!apiKey) return null;

  // /autocomplete and /scrape have their own routing
  if (endpoint === 'scrape') {
    try {
      const res = await fetchWithTimeout(
        SERPER_SCRAPE,
        {
          method: 'POST',
          headers: {
            'X-API-KEY': apiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        },
        SCRAPE_TIMEOUT_MS,
      );
      if (!res.ok) return null;
      return await res.json();
    } catch (e) {
      console.warn('[SearchService] scrape failed', e);
      return null;
    }
  }

  const url = `${SERPER_BASE}/${endpoint}`;
  try {
    const res = await fetchWithTimeout(
      url,
      {
        method: 'POST',
        headers: {
          'X-API-KEY': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...DEFAULT_LOCALE,
          autocorrect: true,
          ...body,
        }),
      },
      ENDPOINT_TIMEOUT_MS,
    );
    if (!res.ok) {
      console.warn(
        `[SearchService] serper /${endpoint} status=${res.status}`,
      );
      return null;
    }
    return await res.json();
  } catch (e) {
    console.warn(`[SearchService] serper /${endpoint} threw`, e);
    return null;
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// Normalizers — turn each Serper response into SourceCard candidates.
// ──────────────────────────────────────────────────────────────────────────────

function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

const SOCIAL_NOISE = [
  'facebook.com',
  'vk.com',
  'ok.ru',
  'instagram.com',
  'tiktok.com',
  'youtube.com',
  'pinterest.',
];

function isNoisy(url: string): boolean {
  const lower = url.toLowerCase();
  return SOCIAL_NOISE.some((d) => lower.includes(d));
}

function normalize(result: RawSerperResult): Partial<SourceCard>[] {
  const { endpoint, data } = result;
  if (!data) return [];

  switch (endpoint) {
    case 'search': {
      const items = (data.organic || []) as any[];
      return items.map((i) => ({
        title: i.title,
        url: i.link,
        snippet: i.snippet,
        date: i.date,
        source: 'search',
      }));
    }
    case 'news': {
      const items = (data.news || []) as any[];
      return items.map((i) => ({
        title: i.title,
        url: i.link,
        snippet: i.snippet,
        date: i.date,
        thumbnailUrl: i.imageUrl,
        source: 'news',
      }));
    }
    case 'images': {
      const items = (data.images || []) as any[];
      return items.map((i) => ({
        title: i.title,
        url: i.link || i.imageUrl,
        snippet: i.source,
        imageUrl: i.imageUrl,
        thumbnailUrl: i.thumbnailUrl,
        source: 'images',
      }));
    }
    case 'shopping': {
      const items = (data.shopping || []) as any[];
      return items.map((i) => ({
        title: i.title,
        url: i.link,
        snippet: i.source || i.delivery,
        price: i.price,
        rating: i.rating,
        ratingCount: i.ratingCount,
        imageUrl: i.imageUrl,
        source: 'shopping',
      }));
    }
    case 'places': {
      const items = (data.places || []) as any[];
      return items.map((i) => ({
        title: i.title,
        url:
          i.website ||
          (i.cid ? `https://maps.google.com/?cid=${i.cid}` : undefined) ||
          '',
        snippet: i.category,
        rating: i.rating,
        ratingCount: i.ratingCount,
        address: i.address,
        phone: i.phoneNumber,
        source: 'places',
      }));
    }
    case 'scholar': {
      const items = (data.organic || []) as any[];
      return items.map((i) => ({
        title: i.title,
        url: i.link,
        snippet: i.snippet,
        date: i.year ? String(i.year) : undefined,
        source: 'scholar',
      }));
    }
    case 'patents': {
      const items = (data.organic || data.patents || []) as any[];
      return items.map((i) => ({
        title: i.title,
        url: i.link,
        snippet: i.snippet,
        date: i.publicationDate || i.filingDate,
        source: 'patents',
      }));
    }
    default:
      return [];
  }
}

function dedupeAndRank(
  candidates: Partial<SourceCard>[],
  maxCount: number,
): SourceCard[] {
  const seen = new Set<string>();
  const out: SourceCard[] = [];
  let i = 0;
  for (const c of candidates) {
    if (!c.url || !c.title) continue;
    if (isNoisy(c.url)) continue;
    const key = c.url.split('#')[0].split('?')[0];
    if (seen.has(key)) continue;
    seen.add(key);
    i += 1;
    out.push({
      index: i,
      title: c.title!,
      url: c.url!,
      domain: getDomain(c.url!),
      snippet: c.snippet,
      source: (c.source as SerperEndpoint) || 'search',
      imageUrl: c.imageUrl,
      thumbnailUrl: c.thumbnailUrl,
      price: c.price,
      rating: c.rating,
      ratingCount: c.ratingCount,
      address: c.address,
      phone: c.phone,
      date: c.date,
      snippetOnly: c.snippetOnly,
    });
    if (out.length >= maxCount) break;
  }
  return out;
}

// ──────────────────────────────────────────────────────────────────────────────
// Scrape pipeline.
// ──────────────────────────────────────────────────────────────────────────────

interface ScrapedDoc {
  source: SourceCard;
  content: string;
  snippetOnly: boolean;
}

async function scrapeSources(
  sources: SourceCard[],
  limit: number,
): Promise<ScrapedDoc[]> {
  // skip pure-image sources or those without http(s)
  const scrapeable = sources
    .filter(
      (s) =>
        s.url.startsWith('http') &&
        s.source !== 'images' &&
        s.source !== 'places',
    )
    .slice(0, limit);

  const results = await Promise.all(
    scrapeable.map(async (src) => {
      const data = await callSerperEndpoint('scrape', { url: src.url });
      const text: string =
        (data && (data.text || data.content || data.body)) || '';
      if (!text || text.length < 80) {
        return {
          source: src,
          content: src.snippet || '',
          snippetOnly: true,
        };
      }
      return {
        source: src,
        content: text.slice(0, 6000),
        snippetOnly: false,
      };
    }),
  );

  // include non-scrapeable sources too, snippet-only
  const nonScrapeable = sources.filter((s) => !scrapeable.includes(s));
  for (const s of nonScrapeable) {
    results.push({
      source: s,
      content: s.snippet || '',
      snippetOnly: true,
    });
  }

  return results;
}

// ──────────────────────────────────────────────────────────────────────────────
// Prompt construction per intent.
// ──────────────────────────────────────────────────────────────────────────────

function intentInstruction(intent: SearchIntent): string {
  switch (intent) {
    case 'comparison':
      return 'Сформируй краткий вывод сверху, затем сравнительную таблицу (если уместно) с ключевыми параметрами, и блок «Кому что выбрать».';
    case 'shopping':
      return 'Дай топ вариантов с краткими плюсами, ценой и магазином (если есть), затем секцию «Как выбрать» с критериями.';
    case 'news':
      return 'Структура: «Что произошло» — короткое резюме, «Почему важно», «Хронология» — список с датами, если они есть.';
    case 'academic':
      return 'Структура: «Что известно», «Ключевые исследования» (с авторами/годами если есть), «Ограничения и открытые вопросы».';
    case 'local_places':
      return 'Дай маркированный список мест: название, адрес, рейтинг (если есть), краткое описание; затем 1–2 общих совета.';
    case 'patents':
      return 'Список релевантных патентов: название, номер/дата (если есть), краткое описание сути изобретения, ссылка.';
    case 'how_to':
      return 'Дай пошаговую инструкцию с пронумерованными шагами, в конце — типичные ошибки и проверочный чек-лист.';
    case 'research':
      return 'Дай развёрнутый обзор: контекст, как это устроено, ключевые факты, нюансы и ограничения.';
    case 'general':
    default:
      return 'Дай краткий прямой ответ в 2–4 предложения, затем раздел «Факты» с маркированным списком.';
  }
}

function buildSystemPrompt(intent: SearchIntent): string {
  const currentDate = new Date().toISOString().split('T')[0];
  return [
    'Ты — ИИСеть Поиск, AI-поисковик с источниками.',
    `Текущая дата: ${currentDate}.`,
    'Отвечай на русском языке.',
    'Используй только факты из переданных ниже источников. Не выдумывай числа, имена, даты.',
    'В тексте ответа обязательно ссылайся на источники в формате [1], [2], [3] сразу рядом с фактом.',
    'Если данных недостаточно — честно скажи об этом и укажи, чего не хватает.',
    intentInstruction(intent),
    'Не дублируй раздел «Источники» в конце ответа — источники уже показаны пользователю в карточках над ответом.',
  ].join('\n');
}

function buildContext(docs: ScrapedDoc[]): string {
  return docs
    .map((d) => {
      const lines = [
        `Источник [${d.source.index}] (${d.source.source})`,
        `URL: ${d.source.url}`,
        d.source.title ? `Заголовок: ${d.source.title}` : '',
        d.source.date ? `Дата: ${d.source.date}` : '',
        d.source.price ? `Цена: ${d.source.price}` : '',
        d.source.address ? `Адрес: ${d.source.address}` : '',
        d.source.rating ? `Рейтинг: ${d.source.rating}` : '',
        d.snippetOnly ? '(только сниппет, страница не была загружена полностью)' : '',
        '',
        d.content || d.source.snippet || '',
      ];
      return lines.filter(Boolean).join('\n');
    })
    .join('\n\n-----------------------------\n\n');
}

// ──────────────────────────────────────────────────────────────────────────────
// LLM call — reuse modelsService for streaming.
// ──────────────────────────────────────────────────────────────────────────────

async function streamAnswer(
  query: string,
  intent: SearchIntent,
  docs: ScrapedDoc[],
  onDelta: (chunk: string) => void,
): Promise<void> {
  const systemPrompt = buildSystemPrompt(intent);
  const contextText = buildContext(docs);

  const messages = [
    { role: 'system', content: systemPrompt },
    {
      role: 'user',
      content: [
        `Запрос пользователя: "${query}"`,
        '',
        'Ниже — выдержки из найденных источников. Сошлись на них как [1], [2] и т.д.',
        '',
        contextText,
      ].join('\n'),
    },
  ];

  try {
    const result = await modelsService.llmBaseRequest({
      model: 'openai/gpt-oss-120b',
      messages,
      stream: true,
      onClose: () => {},
      textToLast: '',
    });

    // result is a ReadableStream<Uint8Array> of plain decoded chunks
    if (result instanceof ReadableStream) {
      const reader = result.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value, { stream: true });
        if (text) onDelta(text);
      }
      const tail = decoder.decode();
      if (tail) onDelta(tail);
    }
  } catch (e) {
    console.error('[SearchService] LLM stream failed', e);
    onDelta(
      '\n\nК сожалению, не получилось сгенерировать развёрнутый ответ. Посмотрите карточки источников выше — там есть основные факты.',
    );
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// Follow-ups — prefer SERP peopleAlsoAsk → autocomplete → simple defaults.
// ──────────────────────────────────────────────────────────────────────────────

async function getFollowUps(
  query: string,
  searchData: any | null,
): Promise<string[]> {
  const fromSerp: string[] =
    (searchData?.peopleAlsoAsk || [])
      .map((p: any) => (typeof p?.question === 'string' ? p.question : null))
      .filter(Boolean)
      .slice(0, 4);

  if (fromSerp.length >= 3) return fromSerp.slice(0, 3);

  const ac = await callSerperEndpoint('autocomplete', { q: query });
  const fromAc: string[] = (ac?.suggestions || [])
    .map((s: any) => (typeof s?.value === 'string' ? s.value : null))
    .filter(Boolean)
    .filter((s: string) => s.toLowerCase() !== query.toLowerCase())
    .slice(0, 3);

  const combined = Array.from(new Set([...fromSerp, ...fromAc])).slice(0, 3);
  if (combined.length) return combined;

  return [
    `${query} — подробнее`,
    `${query} — сравнение вариантов`,
    `${query} — на что обратить внимание`,
  ];
}

// ──────────────────────────────────────────────────────────────────────────────
// Public entry: run the full pipeline, push events into the sink.
// ──────────────────────────────────────────────────────────────────────────────

export interface RunSearchOptions {
  maxSources?: number;
  maxScrape?: number;
}

export async function runSearch(
  query: string,
  sink: EventSink,
  options: RunSearchOptions = {},
): Promise<void> {
  const maxSources = options.maxSources ?? 8;
  const maxScrape = options.maxScrape ?? 4;

  if (!process.env.SERPER_API_KEY) {
    sink({
      type: 'error',
      message:
        'Поиск временно недоступен: не настроен ключ SERPER_API_KEY. Обратитесь к администратору.',
    });
    return;
  }

  // Step 1 — understand
  sink({ type: 'progress', step: 'understand', status: 'running' });
  const intent = classifyIntent(query);
  const subQueries = buildSubQueries(query, intent);
  const endpoints = endpointsForIntent(intent);
  sink({ type: 'intent', intent, subQueries, endpoints });
  sink({ type: 'progress', step: 'understand', status: 'done' });

  // Step 2 — search across selected endpoints
  sink({ type: 'progress', step: 'search', status: 'running' });

  // Build a small matrix: endpoint × subquery. To control cost, do at most
  // (endpoints * 2) calls.
  const calls: { endpoint: SerperEndpoint; q: string }[] = [];
  for (const ep of endpoints) {
    // first sub-query goes to every endpoint
    calls.push({ endpoint: ep, q: subQueries[0] });
    // additional sub-queries go only to the primary "search" endpoint
    if (ep === 'search') {
      for (const extra of subQueries.slice(1)) {
        calls.push({ endpoint: ep, q: extra });
      }
    }
  }

  const rawResults: RawSerperResult[] = await Promise.all(
    calls.map(async ({ endpoint, q }) => ({
      endpoint,
      data: await callSerperEndpoint(endpoint, { q, num: 10 }),
    })),
  );

  const successful = rawResults.filter((r) => r.data);
  if (!successful.length) {
    sink({
      type: 'error',
      message:
        'Не удалось получить результаты ни от одного источника. Попробуйте позже или переформулируйте запрос.',
    });
    return;
  }

  // gather candidates, normalize, dedupe
  const candidates: Partial<SourceCard>[] = [];
  for (const r of successful) {
    candidates.push(...normalize(r));
  }
  const sources = dedupeAndRank(candidates, maxSources);

  if (!sources.length) {
    sink({
      type: 'error',
      message:
        'Поиск отработал, но не нашёл подходящих источников. Попробуйте сформулировать запрос иначе.',
    });
    return;
  }

  sink({ type: 'sources', sources });
  sink({ type: 'progress', step: 'search', status: 'done' });

  // Step 3 — scrape top URLs
  sink({ type: 'progress', step: 'open', status: 'running' });
  const docs = await scrapeSources(sources, maxScrape);
  sink({ type: 'progress', step: 'open', status: 'done' });

  // Step 4 — synthesis prep (cheap; cosmetic step for user UX)
  sink({ type: 'progress', step: 'compare', status: 'running' });
  // (real comparison happens inside the LLM call)
  sink({ type: 'progress', step: 'compare', status: 'done' });

  // Step 5 — stream answer
  sink({ type: 'progress', step: 'answer', status: 'running' });
  await streamAnswer(query, intent, docs, (chunk) =>
    sink({ type: 'answer_delta', text: chunk }),
  );
  sink({ type: 'progress', step: 'answer', status: 'done' });

  // Follow-ups — try to use peopleAlsoAsk from the first search-endpoint call
  const primarySearchData =
    successful.find((r) => r.endpoint === 'search')?.data ?? null;
  const followups = await getFollowUps(query, primarySearchData);
  sink({ type: 'followups', questions: followups });

  sink({ type: 'done' });
}
