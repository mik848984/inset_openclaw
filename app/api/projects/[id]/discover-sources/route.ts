import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import User from '@/models/user';
import Project from '@/models/project';
import dbConnect from '@/lib/db';

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
 * POST /api/projects/[id]/discover-sources
 * Возвращает рекомендуемые источники (NotebookLM-like Discover Sources):
 * вызывает Serper /search и /news по `query` или цели проекта.
 * Пользователь сам выбирает, какие источники добавить через /sources/link.
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
    const query =
      typeof body.query === 'string' && body.query.trim().length > 0
        ? body.query.trim()
        : `${project.title} ${project.goal || ''}`.trim();
    if (!query) {
      return NextResponse.json(
        { message: 'Нужен query или goal проекта' },
        { status: 400 },
      );
    }
    const serperKey = process.env.SERPER_API_KEY;
    if (!serperKey) {
      return NextResponse.json({ recommended: [] });
    }

    const headers = {
      'X-API-KEY': serperKey,
      'Content-Type': 'application/json',
    } as any;
    const body1 = {
      q: query,
      gl: 'ru',
      hl: 'ru',
      num: 12,
      autocorrect: true,
      type: 'search',
    };
    const body2 = {
      q: query,
      gl: 'ru',
      hl: 'ru',
      num: 8,
      autocorrect: true,
    };

    const fetchJson = async (
      url: string,
      payload: any,
      timeoutMs = 7000,
    ): Promise<any> => {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), timeoutMs);
      try {
        const r = await fetch(url, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
          signal: ctrl.signal,
        });
        if (!r.ok) return null;
        return await r.json();
      } catch (e) {
        console.error('[DISCOVER] fetch failed', url, e);
        return null;
      } finally {
        clearTimeout(timer);
      }
    };

    const [search, news] = await Promise.allSettled([
      fetchJson('https://google.serper.dev/search', body1),
      fetchJson('https://google.serper.dev/news', body2),
    ]);
    const searchJson: any =
      search.status === 'fulfilled' ? search.value : null;
    const newsJson: any = news.status === 'fulfilled' ? news.value : null;

    const seen = new Set<string>();
    const out: any[] = [];

    const pushItem = (item: any, reason: string) => {
      const url = item?.link || item?.url || '';
      if (!url || seen.has(url)) return;
      seen.add(url);
      out.push({
        url,
        title: item?.title || safeDomain(url) || url,
        domain: safeDomain(url),
        snippet:
          typeof item?.snippet === 'string'
            ? item.snippet.slice(0, 240)
            : '',
        date: typeof item?.date === 'string' ? item.date : undefined,
        reason,
      });
    };

    ((searchJson?.organic as any[]) || [])
      .slice(0, 8)
      .forEach((it) =>
        pushItem(it, 'Топовый результат поиска по теме проекта'),
      );
    ((newsJson?.news as any[]) || [])
      .slice(0, 6)
      .forEach((it) =>
        pushItem(it, 'Свежая новость, релевантная теме проекта'),
      );

    return NextResponse.json({
      query,
      recommended: out.slice(0, 12),
    });
  } catch (e) {
    console.error('[DISCOVER]', e);
    return NextResponse.json(
      { message: 'Не удалось получить рекомендации' },
      { status: 500 },
    );
  }
}
