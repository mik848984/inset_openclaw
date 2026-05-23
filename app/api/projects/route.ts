import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import User from '@/models/user';
import Project from '@/models/project';
import dbConnect from '@/lib/db';
import { buildBriefFromRawText } from '@/services/api/ProjectService';

export const dynamic = 'force-dynamic';

/**
 * GET /api/projects — список проектов текущего пользователя.
 * Возвращает 401 если не залогинен — UI просто покажет пустой список.
 */
export async function GET(): Promise<Response> {
  try {
    await dbConnect();
    const session = await auth();
    const email = session?.user?.email;
    if (!email) {
      return NextResponse.json([], { status: 200 });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json([], { status: 200 });
    }
    const projects = await Project.find({ user: user.id })
      .sort({ updatedAt: -1 })
      .lean();
    return NextResponse.json(projects);
  } catch (error) {
    console.error('[PROJECTS_GET]', error);
    return NextResponse.json(
      { message: 'Не удалось загрузить проекты' },
      { status: 500 },
    );
  }
}

/**
 * POST /api/projects — создать проект.
 * Тело: { rawText: string } или { title, goal, ... } если нужно.
 * Если передан rawText — генерим простой rule-based brief.
 */
export async function POST(req: NextRequest): Promise<Response> {
  try {
    await dbConnect();
    const session = await auth();
    const email = session?.user?.email;
    if (!email) {
      return NextResponse.json(
        { message: 'Требуется вход' },
        { status: 401 },
      );
    }
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { message: 'Пользователь не найден' },
        { status: 404 },
      );
    }

    const body = (await req.json().catch(() => ({}))) as any;

    const brief = buildBriefFromRawText(
      typeof body.rawText === 'string' ? body.rawText : '',
    );

    const project = await Project.create({
      user: user.id,
      title:
        typeof body.title === 'string' && body.title.trim().length > 0
          ? body.title.slice(0, 120)
          : brief.title,
      goal:
        typeof body.goal === 'string' && body.goal.trim().length > 0
          ? body.goal
          : brief.goal,
      description:
        typeof body.description === 'string' &&
        body.description.trim().length > 0
          ? body.description
          : brief.description,
      instructions:
        typeof body.instructions === 'string' &&
        body.instructions.trim().length > 0
          ? body.instructions
          : brief.instructions,
      nextStep:
        typeof body.nextStep === 'string' && body.nextStep.trim().length > 0
          ? body.nextStep
          : brief.nextStep,
      suggestedActions: Array.isArray(body.suggestedActions)
        ? body.suggestedActions
            .filter((s: any) => typeof s === 'string')
            .slice(0, 8)
        : brief.suggestedActions,
      memoryItems: [],
    });

    return NextResponse.json(project);
  } catch (error) {
    console.error('[PROJECTS_POST]', error);
    return NextResponse.json(
      { message: 'Не удалось создать проект' },
      { status: 500 },
    );
  }
}
