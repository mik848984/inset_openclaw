import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import User from '@/models/user';
import Project from '@/models/project';
import ProjectSource from '@/models/projectSource';
import ProjectChunk from '@/models/projectChunk';
import dbConnect from '@/lib/db';
import { vectorStoreService } from '@/services/api/VectorStoreService';
import fs from 'fs';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

type Params = { params: { id: string; sourceId: string } };

export async function DELETE(_req: NextRequest, { params }: Params) {
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
    const source = await ProjectSource.findOne({
      _id: params.sourceId,
      project: project._id,
      userEmail: email,
    });
    if (!source) {
      return NextResponse.json(
        { message: 'Источник не найден' },
        { status: 404 },
      );
    }

    // Удаляем чанки из Mongo.
    await ProjectChunk.deleteMany({
      project: project._id,
      source: source._id,
      userEmail: email,
    });

    // Vector store cleanup (если задан).
    try {
      await vectorStoreService.deleteSource(
        String(project._id),
        String(source._id),
        email,
      );
    } catch (e) {
      console.error('[SOURCE_DELETE] vector cleanup failed', e);
    }

    // Файл на диске.
    if (source.storagePath) {
      try {
        if (fs.existsSync(source.storagePath)) {
          fs.unlinkSync(source.storagePath);
        }
      } catch (e) {
        console.error('[SOURCE_DELETE] file unlink failed', e);
      }
    }

    await ProjectSource.deleteOne({ _id: source._id });
    return new Response(null, { status: 204 });
  } catch (e) {
    console.error('[SOURCE_DELETE]', e);
    return NextResponse.json(
      { message: 'Не удалось удалить источник' },
      { status: 500 },
    );
  }
}
