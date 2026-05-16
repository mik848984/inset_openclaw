import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { isAdmin } from '@/utils/isAdmin';
import {
  BlogPostMeta,
  createOrUpdatePost,
  deletePost,
  getPostBySlug,
} from '@/lib/blog';

type Params = {
  params: { slug: string };
};

export async function GET(
  _req: Request,
  { params }: Params,
): Promise<Response> {
  try {
    const post = getPostBySlug(params.slug);
    return NextResponse.json(post);
  } catch (error) {
    console.error(error);
    return new Response('Not found', { status: 404 });
  }
}

export async function PUT(req: Request, { params }: Params): Promise<Response> {
  try {
    const session = await auth();
    const email = session?.user?.email;

    if (!email || !isAdmin(email)) {
      return new Response('Forbidden', { status: 403 });
    }

    const body = await req.json();

    const post = createOrUpdatePost(
      {
        title: body.title,
        slug: body.slug,
        description: body.description,
        content: body.content || '',
        tags: body.tags || [],
        readingTime: body.readingTime,
        author: email,
        coverImage: body.coverImage,
        ogImage: body.ogImage,
      },
      params.slug,
    );

    return NextResponse.json(post);
  } catch (error) {
    console.error(error);
    return new Response('Error', { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: Params,
): Promise<Response> {
  try {
    const session = await auth();
    const email = session?.user?.email;

    if (!email || !isAdmin(email)) {
      return new Response('Forbidden', { status: 403 });
    }

    deletePost(params.slug);
    return new Response(null, { status: 204 });
  } catch (error) {
    console.error(error);
    return new Response('Error', { status: 500 });
  }
}
