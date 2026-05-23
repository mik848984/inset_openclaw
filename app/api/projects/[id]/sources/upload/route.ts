import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { writeFile, mkdir } from 'fs/promises';
import { randomUUID } from 'crypto';
import fs from 'fs';
import { auth } from '@/auth';
import User from '@/models/user';
import Project from '@/models/project';
import ProjectSource from '@/models/projectSource';
import dbConnect from '@/lib/db';
import {
  parseFile,
  ingestParsedText,
} from '@/services/api/IngestionService';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

type Params = { params: { id: string } };

const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB
const DANGEROUS_EXT = new Set([
  'exe',
  'bat',
  'sh',
  'cmd',
  'msi',
  'apk',
  'app',
  'dmg',
  'so',
  'dll',
  'jar',
  'php',
]);

function sanitizeFileName(name: string): string {
  const base = name.replace(/[\\/]+/g, '_').replace(/[^A-Za-z0-9._-]+/g, '_');
  return base.length > 0 ? base.slice(0, 120) : 'file';
}

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

    const contentType = req.headers.get('content-type') || '';
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json(
        { message: 'Ожидается multipart/form-data' },
        { status: 400 },
      );
    }

    const formData = await req.formData();
    const file = formData.get('file');
    if (!file || typeof file === 'string') {
      return NextResponse.json(
        { message: 'Поле "file" обязательно' },
        { status: 400 },
      );
    }
    const webFile = file as unknown as File;
    const originalName = sanitizeFileName(
      (webFile as any).name || 'file',
    );
    const ext = originalName.split('.').pop()?.toLowerCase() || '';
    if (DANGEROUS_EXT.has(ext)) {
      return NextResponse.json(
        { message: 'Этот тип файла нельзя загружать.' },
        { status: 400 },
      );
    }

    const arrayBuffer = await webFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    if (buffer.byteLength > MAX_FILE_BYTES) {
      return NextResponse.json(
        { message: 'Файл слишком большой (лимит 10 МБ)' },
        { status: 400 },
      );
    }

    const uploadDir = path.join(
      process.cwd(),
      'uploads',
      'projects',
      String(project._id),
    );
    if (!fs.existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }
    const storageName = `${Date.now()}-${randomUUID()}-${originalName}`;
    const filePath = path.join(uploadDir, storageName);
    await writeFile(filePath, buffer);

    // Create source row in "uploaded" state.
    const source = await ProjectSource.create({
      project: project._id,
      user: user.id,
      userEmail: email,
      type: 'file',
      title: originalName.replace(/\.[^.]+$/, '').slice(0, 120),
      originalName,
      storagePath: filePath,
      mimeType: (webFile as any).type || '',
      size: buffer.byteLength,
      status: 'processing',
      chunksCount: 0,
      keyFacts: [],
    });

    // ── Parse + chunk + embed + store ────────────────────────────
    try {
      const parsed = parseFile(
        buffer,
        originalName,
        (webFile as any).type || '',
      );

      if (parsed.unsupportedReason) {
        await ProjectSource.updateOne(
          { _id: source._id },
          {
            $set: {
              status: 'unsupported',
              errorMessage: parsed.unsupportedReason,
              textPreview: '',
              summary: '',
              chunksCount: 0,
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
        text: parsed.text,
      });

      await ProjectSource.updateOne(
        { _id: source._id },
        {
          $set: {
            status: chunksCount > 0 ? 'ready' : 'error',
            errorMessage:
              chunksCount > 0 ? '' : 'Не удалось разбить файл на фрагменты.',
            textPreview: parsed.textPreview,
            summary: parsed.summary,
            chunksCount,
          },
        },
      );
    } catch (ingestErr: any) {
      console.error('[SOURCE_UPLOAD] ingest failed', ingestErr);
      await ProjectSource.updateOne(
        { _id: source._id },
        {
          $set: {
            status: 'error',
            errorMessage:
              ingestErr?.message || 'Не удалось обработать файл',
          },
        },
      );
    }

    const updated = await ProjectSource.findById(source._id).lean();
    return NextResponse.json(updated);
  } catch (error) {
    console.error('[SOURCE_UPLOAD]', error);
    return NextResponse.json(
      { message: 'Не удалось загрузить файл' },
      { status: 500 },
    );
  }
}
