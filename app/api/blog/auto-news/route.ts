import { NextRequest, NextResponse } from 'next/server';
  import { auth } from '@/auth';
  import { isAdmin } from '@/utils/isAdmin';
  import { createOrUpdatePost } from '@/lib/blog';
  import { modelsService } from '@/services/api/ModelsService';
  import { getTextFromStream, ICompletionsUser } from '@/utils/llmStream';
  import { tariffService } from '@/services/api/TariffService';

  export const dynamic = 'force-dynamic';

  type AutoNewsBody = {
    query: string;
    location?: string;
    gl?: string;
    hl?: string;
    tbs?: string;
    baseTitle: string;
    appendDateToTitle?: boolean;
    mode?: 'now' | 'schedule';
    scheduledAt?: string;
    maxNews?: number;
  };

  type NewsDoc = {
    title: string;
    url: string;
    snippet?: string;
    content: string;
  };

  function stripEmojis(input: string): string {
    // Простая зачистка эмодзи по диапазонам Unicode
    return input.replace(
      /[\u{1F300}-\u{1F6FF}]|[\u{1F900}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu,
      '',
    );
  }

  function computeReadingTime(markdown: string): number {
    const withoutCode = markdown.replace(/```[\s\S]*?```/g, ' ');
    const plain = withoutCode.replace(/[#>*_`~\[\]\(\)\-]/g, ' ');
    const words = plain
      .split(/\s+/)
      .map((w) => w.trim())
      .filter(Boolean);
    const minutes = Math.max(1, Math.round(words.length / 200));
    return minutes;
  }

  
  function removePromptFooter(markdown: string): string {
    if (!markdown) return markdown;
    const patterns = [
      /(?:\n|\r|\r\n)#{0,3}\s*Prompt for illustration[^\n]*[\s\S]*$/i,
      /(?:\n|\r|\r\n)#{0,3}\s*Prompt for illustration \(English\)[^\n]*[\s\S]*$/i,
      /(?:\n|\r|\r\n)#{0,3}\s*Промпт для иллюстрации[^\n]*[\s\S]*$/i,
    ];
    let result = markdown;
    for (const re of patterns) {
      result = result.replace(re, '');
    }
    return result.trimEnd();
  }

  function autoLinkMarkdown(markdown: string): string {
    if (!markdown) return markdown;
    // Превращаем строки вида "Читать подробнее: https://..." в Markdown-ссылки
    return markdown.replace(
      /(Читать подробнее:\s*)(https?:\/\/[^\s)]+)(\s*)/g,
      (_match, prefix, url, suffix) => {
        return `${prefix}[Ссылка](${url})${suffix}`;
      },
    );
  }


  function generateAutoNewsSlug(date: Date): string {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const rand = Math.random().toString(36).slice(2, 8);
    return `news-${yyyy}-${mm}-${dd}-${rand}`;
  }

function formatMoscowDateForTitle(now: Date): string {
    // Переводим текущее время в часовой пояс Москвы
    const formatter = new Intl.DateTimeFormat('ru-RU', {
      timeZone: 'Europe/Moscow',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    const parts = formatter.formatToParts(now);
    const dd = parts.find((p) => p.type === 'day')?.value ?? '01';
    const mm = parts.find((p) => p.type === 'month')?.value ?? '01';
    const yyyy = parts.find((p) => p.type === 'year')?.value ?? '1970';
    return `${dd}.${mm}.${yyyy}`;
  }

  async function fetchNewsFromSerper(body: AutoNewsBody): Promise<NewsDoc[]> {
    const serperApiKey = process.env.SERPER_API_KEY;

    if (!serperApiKey) {
      throw new Error('SERPER_API_KEY is not set');
    }

    const { query, location, gl, hl, tbs, maxNews } = body;

    const serperRes = await fetch('https://google.serper.dev/news', {
      method: 'POST',
      headers: {
        'X-API-KEY': serperApiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: query,
        location: location || 'Russia',
        gl: gl || 'ru',
        hl: hl || 'ru',
        tbs: tbs || 'qdr:d',
      }),
    });

    if (!serperRes.ok) {
      const text = await serperRes.text().catch(() => '');
      console.error('[AUTO_NEWS_SERPER_ERROR]', serperRes.status, text);
      throw new Error('Serper news request failed');
    }

    const data = (await serperRes.json()) as any;

    const rawNews: any[] =
      (Array.isArray(data.news) && data.news.length > 0
        ? data.news
        : Array.isArray(data.organic)
        ? data.organic
        : []) || [];

    const base = (maxNews && maxNews > 0
      ? rawNews.slice(0, maxNews)
      : rawNews.slice(0, 10)) as any[];

    const docs: NewsDoc[] = [];

    const scrapeKey = serperApiKey; // тот же ключ используется для scrape.serper.dev

    await Promise.all(
      base.map(async (item) => {
        const url = item.link || item.url;
        if (!url) return;

        let content = '';
        try {
          const scrapeRes = await fetch('https://scrape.serper.dev', {
            method: 'POST',
            headers: {
              'X-API-KEY': scrapeKey,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url }),
          });

          if (scrapeRes.ok) {
            const scrapeJson = (await scrapeRes.json()) as any;
            content =
              scrapeJson.content ||
              scrapeJson.text ||
              scrapeJson.body ||
              '';
          }
        } catch (e) {
          console.error('[AUTO_NEWS_SCRAPE_ERROR]', e);
        }

        const doc: NewsDoc = {
          title: item.title || '',
          url,
          snippet: item.snippet || item.description || '',
          content,
        };

        docs.push(doc);
      }),
    );

    return docs;
  }

  async function selectInterestingNews(docs: NewsDoc[]): Promise<
    {
      title: string;
      summary: string;
      url: string;
      category?: string;
    }[]
  > {
    if (!docs.length) return [];

    const systemPrompt = `
Ты — редактор блога ИИСеть (сайт об ИИ, LLM, технологиях и продуктах).
У тебя есть список новостных материалов (с заголовками, короткими описаниями и ссылками).
Твоя задача — выбрать из них те, которые будут интересны нашей аудитории, и кратко их пересказать.

Требования:
- выбери не менее 3 новостей, если всего новостей 3 или больше;
- если новостей меньше 3, используй все доступные;
- фокусируйся на новостях, связанных с ИИ, технологиями, продуктами и бизнесом вокруг ИИ;
- на выходе верни ТОЛЬКО JSON следующего формата, без пояснений и текста вокруг:

{
  "items": [
    {
      "title": "Краткий заголовок новости",
      "summary": "Краткое человеческое описание новости (2–5 предложений)...",
      "url": "https://...",
      "category": "ИИ / технологии / продукты"
    }
  ]
}
`;

    const payload = {
      docs: docs.map((d) => ({
        title: d.title,
        snippet: d.snippet,
        url: d.url,
        contentPreview: d.content?.slice(0, 2000) || '',
      })),
    };

    const messages = [
      {
        role: 'system',
        content: systemPrompt,
      },
      {
        role: 'user',
        content: JSON.stringify(payload, null, 2),
      },
    ];

    const onClose = async (usage: ICompletionsUser) => {
      try {
        await tariffService.updateUserBalance({
          userId: 'auto-news',
          ...modelsService.getModelUsage('openai/gpt-oss-120b', usage.total_tokens),
        });
      } catch (e) {
        console.error('[AUTO_NEWS_TARIFF_ERROR]', e);
      }
    };

    const stream = await modelsService.llmRequest({
      model: 'openai/gpt-oss-120b',
      messages,
      stream: true,
      onClose,
      textToLast: '',
      webSearch: false,
      files: [],
      youtube: '',
    });

    const raw = await getTextFromStream(stream);
    const cleaned = raw
      .trim()
      .replace(/^```json\s*/i, '')
      .replace(/```$/i, '')
      .trim();

    try {
      const parsed = JSON.parse(cleaned);
      const items = Array.isArray(parsed.items) ? parsed.items : [];
      return items
        .map((item: any) => ({
          title: String(item.title || '').trim(),
          summary: String(item.summary || '').trim(),
          url: String(item.url || '').trim(),
          category: item.category ? String(item.category) : undefined,
        }))
        .filter((it) => it.title && it.url && it.summary);
    } catch (e) {
      console.error('[AUTO_NEWS_PARSE_SELECTION_ERROR]', e);
      // fallback — берём первые 3 новости
      return docs.slice(0, Math.min(3, docs.length)).map((d) => ({
        title: d.title,
        summary: d.snippet || d.content.slice(0, 400),
        url: d.url,
      }));
    }
  }

  async function generateArticleFromNews(
    title: string,
    items: {
      title: string;
      summary: string;
      url: string;
      category?: string;
    }[],
  ): Promise<{
    markdown: string;
    description: string;
    tags: string[];
  }> {
    const systemPrompt = `
Ты — редактор блога ИИСеть. Сайт посвящён ИИ, LLM, технологиям и продуктовой работе.
Сгенерируй статью-дайджест новостей на русском языке.

Требования к статье:
- Формат: Markdown.
- Без эмодзи и смайликов.
- Заголовок h1 должен совпадать с переданным заголовком.
- Для каждой новости сделай отдельный раздел с подзаголовком h2.
- В каждом разделе:
  - 1–2 предложения о сути новости;
  - 1–3 предложения о том, почему это важно или интересно нашей аудитории;
  - отдельная строка со ссылкой в формате Markdown:
    "Читать подробнее: [Ссылка](https://...)".
- Количество новостей: не менее 3, если доступно столько новостей.
- Не добавляй ссылок, которых нет во входных данных.
- Не используй эмодзи.`;

    const payload = {
      title,
      items,
    };

    const messages = [
      {
        role: 'system',
        content: systemPrompt,
      },
      {
        role: 'user',
        content: JSON.stringify(payload, null, 2),
      },
    ];

    const onClose = async (usage: ICompletionsUser) => {
      try {
        await tariffService.updateUserBalance({
          userId: 'auto-news',
          ...modelsService.getModelUsage('openai/gpt-oss-120b', usage.total_tokens),
        });
      } catch (e) {
        console.error('[AUTO_NEWS_TARIFF_ERROR]', e);
      }
    };

    const stream = await modelsService.llmRequest({
      model: 'openai/gpt-oss-120b',
      messages,
      stream: true,
      onClose,
      textToLast: '',
      webSearch: false,
      files: [],
      youtube: '',
    });

    const raw = await getTextFromStream(stream);
    const cleaned = raw
      .trim()
      .replace(/^```json\s*/i, '')
      .replace(/```$/i, '')
      .trim();

    try {
      const parsed = JSON.parse(cleaned);
      const markdownRaw = String(parsed.markdown || '').trim();
      const markdownClean = removePromptFooter(markdownRaw);
      const markdown = autoLinkMarkdown(markdownClean);
      const description = String(parsed.description || '').trim();
      const tagsRaw = parsed.tags;
      const tags = Array.isArray(tagsRaw)
        ? tagsRaw
            .map((t: any) => String(t || '').trim())
            .filter((t) => t.length > 0)
        : ['Новости', 'IT'];
        return {
        markdown: stripEmojis(markdown),
        description: stripEmojis(description),
        tags,
      };
    } catch (e) {
      console.error('[AUTO_NEWS_PARSE_ARTICLE_ERROR]', e);
      // Фоллбек: простой Markdown без JSON-обёртки
      const markdown = stripEmojis(autoLinkMarkdown(removePromptFooter(raw.trim())));
      const description = stripEmojis(
        `Дайджест новостей: ${items
          .slice(0, 3)
          .map((i) => i.title)
          .join(', ')}`,
      );
      return {
        markdown,
        description,
        tags: ['Новости', 'IT'],
      };
    }
  }

  export async function POST(req: NextRequest): Promise<Response> {
    try {
      const session = await auth();
      const email = session?.user?.email;

      if (!email || !isAdmin(email)) {
        return NextResponse.json(
          { message: 'Доступ запрещён' },
          { status: 403 },
        ) as unknown as Response;
      }

      const rawBody = (await req.json()) as AutoNewsBody;

      if (!rawBody.query || !rawBody.baseTitle) {
        return NextResponse.json(
          { message: 'query и baseTitle обязательны' },
          { status: 400 },
        ) as unknown as Response;
      }

      const mode: 'now' | 'schedule' = rawBody.mode || 'now';

      const now = new Date();
      const dateForTitle = formatMoscowDateForTitle(now);

      const finalTitle = rawBody.appendDateToTitle === false
        ? rawBody.baseTitle
        : `${rawBody.baseTitle} за ${dateForTitle}`;

      const docs = await fetchNewsFromSerper(rawBody);

      if (!docs.length) {
        return NextResponse.json(
          { message: 'Не удалось получить новости по заданному запросу' },
          { status: 502 },
        ) as unknown as Response;
      }

      const selected = await selectInterestingNews(docs);

      if (!selected.length) {
        return NextResponse.json(
          { message: 'Не удалось выбрать релевантные новости' },
          { status: 502 },
        ) as unknown as Response;
      }

      const article = await generateArticleFromNews(finalTitle, selected);

      const readingTime = computeReadingTime(article.markdown);

      let postDate: string;

      if (mode === 'schedule' && rawBody.scheduledAt) {
        const scheduled = new Date(rawBody.scheduledAt);
        if (!Number.isNaN(scheduled.getTime())) {
          postDate = scheduled.toISOString();
        } else {
          postDate = new Date().toISOString();
        }
      } else {
        postDate = new Date().toISOString();
      }

      const slug = generateAutoNewsSlug(new Date(postDate));

      const saved = await createOrUpdatePost({
        title: finalTitle,
        slug,
        description: article.description,
        content: article.markdown,
        date: postDate,
        tags: article.tags,
        readingTime,
        author: 'Команда ИИСеть',
      });

      return NextResponse.json(saved) as unknown as Response;
    } catch (error) {
      console.error('[AUTO_NEWS_POST_ERROR]', error);
      return NextResponse.json(
        { message: 'Не удалось автоматически сгенерировать статью' },
        { status: 500 },
      ) as unknown as Response;
    }
  }