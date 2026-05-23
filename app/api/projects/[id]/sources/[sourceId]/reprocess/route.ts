import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import { auth } from '@/auth';
import User from '@/models/user';
import Project from '@/models/project';
import ProjectSource from '@/models/projectSource';
import ProjectChunk from '@/models/projectChunk';
import dbConnect from '@/lib/db';
import {
  parseFile,
  ingestParsedText,
} from '@/services/api/IngestionService';
import { vectorStoreService } from '@/services/api/VectorStoreService';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

type Params = { params: { id: string; sourceId: string } };

/**
 * POST — повторно проиндексировать source (file / note). Для link
 * сейчас не повторяем (нужен новый POST /sources/link).
 */
export async function POST(_req: NextRequest, { params }: Params) {
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

    // Чистим старые чанки.
    await ProjectChunk.deleteMany({
      project: project._id,
      source: source._id,
      userEmail: email,
    });
    try {
      await vectorStoreService.deleteSource(
        String(project._id),
        String(source._id),
        email,
      );
    } catch {
      /* ignore */
    }
    await ProjectSource.updateOne(
      { _id: source._id },
      {
        $set: {
          status: 'processing',
          errorMessage: '',
          chunksCount: 0,
        },
      },
    );

    let text = '';
    if (source.type === 'note' && source.textPreview) {
      text = source.summary || source.textPreview;
    } else if (
      source.type === 'file' &&
      source.storagePath &&
      fs.existsSync(source.storagePath)
    ) {
      try {
        const buf = fs.readFileSync(source.storagePath);
        const parsed = parseFile(
          buf,
          source.originalName || 'file',
          source.mimeType,
        );
        if (parsed.unsupportedReason) {
          await ProjectSource.updateOne(
            { _id: source._id },
            {
              $set: {
                status: 'unsupported',
                errorMessage: parsed.unsupportedReason,
              },
            },
          );
          const updated = await ProjectSource.findById(source._id).lean();
          return NextResponse.json(updated);
        }
        text = parsed.text;
      } catch (e) {
        console.error('[SOURCE_REPROCESS] parse failed', e);
      }
    }

    if (!text) {
      await ProjectSource.updateOne(
        { _id: source._id },
        {
          $set: {
            status: 'error',
            errorMessage:
              'Нет содержимого для повторной обработки (попробуйте загрузить заново).',
          },
        },
      );
      const updated = await ProjectSource.findById(source._id).lean();
      return NextResponse.json(updated);
    }

    const chunksCount = await ingestParsedText({
      projectId: String(project._id),
      sourceId: String(source._id),
      userId: String(user.id),
      userEmail: email,
      text,
    });
    await ProjectSource.updateOne(
      { _id: source._id },
      {
        $set: {
          status: chunksCount > 0 ? 'ready' : 'error',
          errorMessage:
            chunksCount > 0 ? '' : 'Не удалось разбить содержимое.',
          chunksCount,
        },
      },
    );
    const updated = await ProjectSource.findById(source._id).lean();
    return NextResponse.json(updated);
  } catch (e) {
    console.error('[SOURCE_REPROCESS]', e);
    return NextResponse.json(
      { message: 'Не удалось переобработать источник' },
      { status: 500 },
    );
  }
}
