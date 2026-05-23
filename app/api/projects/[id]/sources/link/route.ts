import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import User from '@/models/user';
import Project from '@/models/project';
import ProjectSource from '@/models/projectSource';
import dbConnect from '@/lib/db';
import { ingestParsedText } from '@/services/api/IngestionService';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

type Params = { params: { id: string } };

function safeDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

/**
 * POST — добавить ссылку как источник проекта.
 *   1) скачиваем содержимое через Serper scrape (если ключ есть)
 *      или прямым fetch (как fallback);
 *   2) chunk + embed + store через IngestionService.
 */
export async function POST(req: NextRequest, { params }: Params) {
  try {
    await dbConnect();
    const session = await auth();
    const email = session?.user?.email;
    if (!email) {
      return NextResponse.json({ message: 'Требуется вход' }, { status: 401 });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { message: 'Пользователь не найден' },
        { status: 401 },
      );
    }
    const project = await Project.findOne({ _id: params.id, user: user.id });
    if (!project) {
      return NextResponse.json(
        { message: 'Проект не найден' },
        { status: 404 },
      );
    }

    const body = (await req.json().catch(() => ({}))) as any;
    const url = typeof body.url === 'string' ? body.url.trim() : '';
    if (!url || !/^https?:\/\//i.test(url)) {
      return NextResponse.json(
        { message: 'Нужна валидная https-ссылка' },
        { status: 400 },
      );
    }

    const domain = safeDomain(url);
    const source = await ProjectSource.create({
      project: project._id,
      user: user.id,
      userEmail: email,
      type: 'link',
      title: domain || url.slice(0, 120),
      url,
      status: 'processing',
      chunksCount: 0,
      keyFacts: [],
    });

    let pageText = '';
    let pageTitle = '';
    try {
      const serperKey = process.env.SERPER_API_KEY;
      if (serperKey) {
        const ctrl = new AbortController();
        const timer = setTimeout(() => ctrl.abort(), 9000);
        try {
          const r = await fetch('https://scrape.serper.dev', {
            method: 'POST',
            headers: {
              'X-API-KEY': serperKey,
              'Content-Type': 'application/json',
            } as any,
            body: JSON.stringify({ url }),
            signal: ctrl.signal,
          });
          if (r.ok) {
            const j: any = await r.json();
            pageText = j?.text || j?.content || '';
            pageTitle = j?.title || '';
          }
        } finally {
          clearTimeout(timer);
        }
      }
      if (!pageText) {
        // Простой fallback fetch для open-доступных страниц.
        const ctrl = new AbortController();
        const timer = setTimeout(() => ctrl.abort(), 9000);
        try {
          const r = await fetch(url, { signal: ctrl.signal });
          if (r.ok) {
            const html = await r.text();
            pageText = html
              .replace(/<script[\s\S]*?<\/script>/gi, ' ')
              .replace(/<style[\s\S]*?<\/style>/gi, ' ')
              .replace(/<\/?[^>]+>/g, ' ')
              .replace(/\s+/g, ' ');
            // Попытка достать title.
            const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
            if (titleMatch) pageTitle = titleMatch[1].trim();
          }
        } finally {
          clearTimeout(timer);
        }
      }
    } catch (e) {
      console.error('[SOURCE_LINK] fetch failed', e);
    }

    if (!pageText) {
      await ProjectSource.updateOne(
        { _id: source._id },
        {
          $set: {
            status: 'error',
            errorMessage:
              'Не удалось получить содержимое страницы. Возможно, сайт закрыт от парсинга.',
          },
        },
      );
      const updated = await ProjectSource.findById(source._id).lean();
      return NextResponse.json(updated);
    }

    const chunksCount = await ingestParsedText({
      projectId: String(project._id),
      sourceId: String(source._id),
      userId: String(user.id),
      userEmail: email,
      text: pageText,
      url,
    });

    await ProjectSource.updateOne(
      { _id: source._id },
      {
        $set: {
          status: chunksCount > 0 ? 'ready' : 'error',
          errorMessage:
            chunksCount > 0 ? '' : 'Не удалось разбить страницу на фрагменты.',
          title: pageTitle || domain || url.slice(0, 120),
          textPreview: pageText.slice(0, 600),
          summary: pageText.slice(0, 360),
          chunksCount,
        },
      },
    );

    const updated = await ProjectSource.findById(source._id).lean();
    return NextResponse.json(updated);
  } catch (error) {
    console.error('[SOURCE_LINK]', error);
    return NextResponse.json(
      { message: 'Не удалось добавить ссылку' },
      { status: 500 },
    );
  }
}
