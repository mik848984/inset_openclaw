import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { auth } from '@/auth';
import User from '@/models/user';
import Project from '@/models/project';
import dbConnect from '@/lib/db';

export const dynamic = 'force-dynamic';

type Params = { params: { id: string } };

const MAX_ENTRIES = 365; // ~год ежедневных замеров

async function ownerFor(projectId: string) {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) return { error: 'auth' as const };
  const user = await User.findOne({ email });
  if (!user) return { error: 'user_missing' as const };
  const project = await Project.findOne({ _id: projectId, user: user.id });
  if (!project) return { error: 'not_found' as const };
  return { user, project };
}

function sanitizeEntry(input: any) {
  const num = (v: any) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : undefined;
  };
  const str = (v: any, max = 240) =>
    typeof v === 'string' ? v.trim().slice(0, max) : undefined;
  // date — допустимо ISO yyyy-mm-dd; иначе today
  let date = str(input?.date, 24) || '';
  if (!/^\d{4}-\d{2}-\d{2}/.test(date)) {
    date = new Date().toISOString().slice(0, 10);
  }
  return {
    id: randomUUID(),
    date,
    weightKg: num(input?.weightKg),
    waistCm: num(input?.waistCm),
    training: str(input?.training, 160),
    calories: num(input?.calories),
    wellbeing: str(input?.wellbeing, 80),
    comment: str(input?.comment, 240),
    createdAt: new Date().toISOString(),
  };
}

// ── POST: добавить запись в tracker.entries ───────────────────────
// Атомарный $push, чтобы не было race condition между двумя
// одновременными записями из разных вкладок.
export async function POST(req: NextRequest, { params }: Params) {
  try {
    await dbConnect();
    const ctx = await ownerFor(params.id);
    if ('error' in ctx) {
      return NextResponse.json(
        { message: 'Доступ запрещён' },
        { status: ctx.error === 'auth' ? 401 : 404 },
      );
    }

    const existingCount = Array.isArray(
      (ctx.project as any)?.agentState?.tracker?.entries,
    )
      ? (ctx.project as any).agentState.tracker.entries.length
      : 0;
    if (existingCount >= MAX_ENTRIES) {
      return NextResponse.json(
        { message: `Достигнут лимит ${MAX_ENTRIES} замеров.` },
        { status: 400 },
      );
    }

    const body = (await req.json().catch(() => ({}))) as any;
    const entry = sanitizeEntry(body);

    // Если tracker ещё не существует — создаём с пустыми entries.
    // Если intake задан и type не указан — дефолт weight_progress.
    const update: any = {
      $set: {
        'agentState.updatedAt': new Date().toISOString(),
        // Создаём контейнер, если не было
        ...(((ctx.project as any)?.agentState?.tracker) ? {} : {
          'agentState.tracker.type': body?.type || 'weight_progress',
          'agentState.tracker.createdAt': new Date().toISOString(),
        }),
      },
      $push: {
        'agentState.tracker.entries': entry,
      },
    };

    const updated = await Project.findOneAndUpdate(
      { _id: ctx.project._id, user: (ctx as any).user.id },
      update,
      { new: true },
    ).lean();

    return NextResponse.json({ entry, project: updated });
  } catch (err) {
    console.error('[TRACKER_ENTRY_POST]', err);
    return NextResponse.json(
      { message: 'Не удалось сохранить замер' },
      { status: 500 },
    );
  }
}

// ── DELETE: удалить запись по id ──────────────────────────────────
export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    await dbConnect();
    const ctx = await ownerFor(params.id);
    if ('error' in ctx) {
      return NextResponse.json(
        { message: 'Доступ запрещён' },
        { status: ctx.error === 'auth' ? 401 : 404 },
      );
    }
    const { searchParams } = new URL(req.url);
    const entryId = searchParams.get('entryId');
    if (!entryId) {
      return NextResponse.json(
        { message: 'entryId обязателен' },
        { status: 400 },
      );
    }
    const updated = await Project.findOneAndUpdate(
      { _id: ctx.project._id, user: (ctx as any).user.id },
      {
        $pull: { 'agentState.tracker.entries': { id: entryId } },
        $set: { 'agentState.updatedAt': new Date().toISOString() },
      },
      { new: true },
    ).lean();
    return NextResponse.json({ project: updated });
  } catch (err) {
    console.error('[TRACKER_ENTRY_DELETE]', err);
    return NextResponse.json(
      { message: 'Не удалось удалить замер' },
      { status: 500 },
    );
  }
}
