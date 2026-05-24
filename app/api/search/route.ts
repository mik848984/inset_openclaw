import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { isAdmin } from '@/utils/isAdmin';
import { runSearch, type SearchEvent } from '@/services/api/SearchService';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request): Promise<Response> {
  const session = await auth();
  const email = session?.user?.email;

  if (!email || !isAdmin(email)) {
    return NextResponse.json(
      { message: 'Search preview is available only for admins' },
      { status: 403 },
    );
  }

  let query = '';
  try {
    const body = (await req.json()) as { query?: string };
    query = (body.query || '').trim();
  } catch {
    return new Response('Invalid JSON', { status: 400 });
  }

  if (!query) {
    return new Response('Empty query', { status: 400 });
  }

  if (query.length > 500) {
    query = query.slice(0, 500);
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      let closed = false;

      const send = (event: SearchEvent) => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(JSON.stringify(event) + '\n'));
        } catch {
          // controller already closed
        }
      };

      try {
        await runSearch(query, send);
      } catch (e: any) {
        console.error('[/api/search] runSearch threw', e);
        send({
          type: 'error',
          message:
            'Внутренняя ошибка во время поиска. Попробуйте ещё раз через минуту.',
        });
        send({ type: 'done' });
      } finally {
        closed = true;
        try {
          controller.close();
        } catch {
          // already closed
        }
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'application/x-ndjson; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'X-Accel-Buffering': 'no',
    },
  });
}
