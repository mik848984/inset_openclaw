import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/lib/db';
import User from '@/models/user';
import Project from '@/models/project';
import ProjectThread from '@/models/projectThread';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

type Params = { params: { id: string } };

const MAX_TITLE = 120;
const MAX_HINT = 240;
const MAX_THREADS = 50;

async function authorizeProject(projectId: string) {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) return { status: 401, error: 'Требуется вход' as const };
  const user = await User.findOne({ email });
  if (!user) return { status: 401, error: 'Пользователь не найден' as const };
  const project = await Project.findOne({ _id: projectId, user: user.id });
  if (!project) {
    return { status: 404, error: 'Проект не найден' as const };
  }
  return { user, email, project };
}

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    await dbConnect();
    const ctx = await authorizeProject(params.id);
    if ('error' in ctx) {
      return NextResponse.json({ message: ctx.error }, { status: ctx.status });
    }
    const list = await ProjectThread.find({
      project: ctx.project._id,
      userEmail: ctx.email,
    })
      .sort({ createdAt: 1 })
      .limit(MAX_THREADS)
      .lean();
    return NextResponse.json(list);
  } catch (e) {
    console.error('[THREADS_GET]', e);
    return NextResponse.json(
      { message: 'Не удалось загрузить ветки' },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest, { params }: Params) {
  try {
    await dbConnect();
    const ctx = await authorizeProject(params.id);
    if ('error' in ctx) {
      return NextResponse.json({ message: ctx.error }, { status: ctx.status });
    }

    const existing = await ProjectThread.countDocuments({
      project: ctx.project._id,
      userEmail: ctx.email,
    });
    if (existing >= MAX_THREADS) {
      return NextResponse.json(
        { message: `Достигнут лимит веток (${MAX_THREADS}) на проект.` },
        { status: 400 },
      );
    }

    const body = (await req.json().catch(() => ({}))) as any;
    const rawTitle = String(body?.title || '').trim().slice(0, MAX_TITLE);
    const title = rawTitle || 'Новая ветка';
    const kind =
      typeof body?.kind === 'string' ? body.kind.slice(0, 32) : undefined;
    const hint =
      typeof body?.hint === 'string'
        ? body.hint.slice(0, MAX_HINT)
        : undefined;

    const thread = await ProjectThread.create({
      project: ctx.project._id,
      user: ctx.user.id,
      userEmail: ctx.email,
      title,
      kind,
      hint,
    });
    return NextResponse.json(thread);
  } catch (e) {
    console.error('[THREADS_POST]', e);
    return NextResponse.json(
      { message: 'Не удалось создать ветку' },
      { status: 500 },
    );
  }
}
