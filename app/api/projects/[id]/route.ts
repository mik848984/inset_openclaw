import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import User from '@/models/user';
import Project from '@/models/project';
import dbConnect from '@/lib/db';

export const dynamic = 'force-dynamic';

type Params = { params: { id: string } };

async function resolveUserId(): Promise<string | null> {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) return null;
  const user = await User.findOne({ email });
  return user ? String(user.id) : null;
}

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    await dbConnect();
    const userId = await resolveUserId();
    if (!userId) {
      return NextResponse.json(
        { message: 'Требуется вход' },
        { status: 401 },
      );
    }
    const project = await Project.findOne({
      _id: params.id,
      user: userId,
    }).lean();
    if (!project) {
      return NextResponse.json(
        { message: 'Проект не найден' },
        { status: 404 },
      );
    }
    return NextResponse.json(project);
  } catch (error) {
    console.error('[PROJECT_GET]', error);
    return NextResponse.json(
      { message: 'Не удалось загрузить проект' },
      { status: 500 },
    );
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    await dbConnect();
    const userId = await resolveUserId();
    if (!userId) {
      return NextResponse.json(
        { message: 'Требуется вход' },
        { status: 401 },
      );
    }
    const body = (await req.json().catch(() => ({}))) as any;

    const allowed: any = {};
    if (typeof body.title === 'string')
      allowed.title = body.title.slice(0, 120);
    if (typeof body.goal === 'string') allowed.goal = body.goal;
    if (typeof body.description === 'string')
      allowed.description = body.description;
    if (typeof body.instructions === 'string')
      allowed.instructions = body.instructions;
    if (typeof body.nextStep === 'string')
      allowed.nextStep = body.nextStep.slice(0, 240);
    if (Array.isArray(body.suggestedActions)) {
      allowed.suggestedActions = body.suggestedActions
        .filter((s: any) => typeof s === 'string')
        .slice(0, 8);
    }

    const project = await Project.findOneAndUpdate(
      { _id: params.id, user: userId },
      { $set: allowed },
      { new: true },
    );
    if (!project) {
      return NextResponse.json(
        { message: 'Проект не найден' },
        { status: 404 },
      );
    }
    return NextResponse.json(project);
  } catch (error) {
    console.error('[PROJECT_PATCH]', error);
    return NextResponse.json(
      { message: 'Не удалось обновить проект' },
      { status: 500 },
    );
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    await dbConnect();
    const userId = await resolveUserId();
    if (!userId) {
      return NextResponse.json(
        { message: 'Требуется вход' },
        { status: 401 },
      );
    }
    const res = await Project.deleteOne({
      _id: params.id,
      user: userId,
    });
    if (res.deletedCount === 0) {
      return NextResponse.json(
        { message: 'Проект не найден' },
        { status: 404 },
      );
    }
    return new Response(null, { status: 204 });
  } catch (error) {
    console.error('[PROJECT_DELETE]', error);
    return NextResponse.json(
      { message: 'Не удалось удалить проект' },
      { status: 500 },
    );
  }
}
