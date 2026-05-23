import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import User from '@/models/user';
import Project from '@/models/project';
import dbConnect from '@/lib/db';

export const dynamic = 'force-dynamic';

type Params = { params: { id: string } };

const ALLOWED_TYPES = ['decision', 'fact', 'task', 'risk', 'note'] as const;
type MemoryType = (typeof ALLOWED_TYPES)[number];

export async function POST(req: NextRequest, { params }: Params) {
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
    const text =
      typeof body.text === 'string' ? body.text.trim().slice(0, 2000) : '';
    if (!text) {
      return NextResponse.json(
        { message: 'Поле text обязательно' },
        { status: 400 },
      );
    }
    const type: MemoryType = (ALLOWED_TYPES as ReadonlyArray<string>).includes(
      body.type,
    )
      ? body.type
      : 'note';

    const project = await Project.findOneAndUpdate(
      { _id: params.id, user: user.id },
      {
        $push: {
          memoryItems: {
            $each: [{ type, text, createdAt: new Date() }],
            // Не разрастаемся бесконечно: храним последние 200 пунктов.
            $slice: -200,
          },
        },
      },
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
    console.error('[PROJECT_MEMORY_POST]', error);
    return NextResponse.json(
      { message: 'Не удалось сохранить память проекта' },
      { status: 500 },
    );
  }
}
