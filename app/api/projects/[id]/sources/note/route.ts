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

/**
 * POST — добавить произвольную заметку как источник проекта.
 * Пайплайн ingestion идентичен link/upload: chunk + embed + store.
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
    const text = typeof body.text === 'string' ? body.text.trim() : '';
    if (!text || text.length < 5) {
      return NextResponse.json(
        { message: 'Текст заметки слишком короткий' },
        { status: 400 },
      );
    }
    const title =
      typeof body.title === 'string' && body.title.trim().length > 0
        ? body.title.trim().slice(0, 120)
        : text.slice(0, 60);

    const source = await ProjectSource.create({
      project: project._id,
      user: user.id,
      userEmail: email,
      type: 'note',
      title,
      status: 'processing',
      chunksCount: 0,
      keyFacts: [],
      textPreview: text.slice(0, 600),
      summary: text.slice(0, 360),
    });

    let chunksCount = 0;
    try {
      chunksCount = await ingestParsedText({
        projectId: String(project._id),
        sourceId: String(source._id),
        userId: String(user.id),
        userEmail: email,
        text,
      });
    } catch (e) {
      console.error('[SOURCE_NOTE] ingest failed', e);
    }

    await ProjectSource.updateOne(
      { _id: source._id },
      {
        $set: {
          status: chunksCount > 0 ? 'ready' : 'error',
          errorMessage:
            chunksCount > 0 ? '' : 'Не удалось проиндексировать заметку',
          chunksCount,
        },
      },
    );

    const updated = await ProjectSource.findById(source._id).lean();
    return NextResponse.json(updated);
  } catch (error) {
    console.error('[SOURCE_NOTE]', error);
    return NextResponse.json(
      { message: 'Не удалось сохранить заметку' },
      { status: 500 },
    );
  }
}
