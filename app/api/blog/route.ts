import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { isAdmin } from '@/utils/isAdmin';
import { createOrUpdatePost, getAllPosts } from '@/lib/blog';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<Response> {
  try {
    const posts = getAllPosts();
    return NextResponse.json(posts) as unknown as Response;
  } catch (error) {
    console.error('[BLOG_GET]', error);
    return NextResponse.json(
      { message: 'Не удалось загрузить статьи' },
      { status: 500 },
    ) as unknown as Response;
  }
}

export async function POST(req: NextRequest): Promise<Response> {
  try {
    const session = await auth();

    if (!session || !isAdmin(session)) {
      return NextResponse.json(
        { message: 'Нет прав для изменения статей' },
        { status: 401 },
      ) as unknown as Response;
    }

    const body = await req.json();

    const saved = await createOrUpdatePost(body);

    return NextResponse.json(saved ?? { ok: true }) as unknown as Response;
  } catch (error) {
    console.error('[BLOG_POST]', error);
    return NextResponse.json(
      { message: 'Не удалось сохранить статью' },
      { status: 500 },
    ) as unknown as Response;
  }
}
