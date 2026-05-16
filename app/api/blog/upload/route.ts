import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { isAdmin } from '@/utils/isAdmin';
import path from 'path';
import { writeFile, mkdir } from 'fs/promises';
import { randomUUID } from 'crypto';
import fs from 'fs';

/**
 * Загрузка обложек для статей блога.
 *
 * ВАЖНО:
 *  - Физически храним файлы в папке `uploads/blog` в корне проекта (рядом с package.json)
 *  - Отдаём картинки через API-роут `/api/blog/image/[filename]`
 *  - То есть в БД/статьях мы сохраняем URL вида: `/api/blog/image/<имя_файла>`
 */

const uploadDir = path.join(process.cwd(), 'uploads', 'blog');

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !isAdmin(session)) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    const contentType = req.headers.get('content-type') || '';
    if (!contentType.includes('multipart/form-data')) {
      return new NextResponse('Expected multipart/form-data', { status: 400 });
    }

    const formData = await req.formData();
    const file = formData.get('file');

    if (!file || typeof file === 'string') {
      return new NextResponse('File field "file" is required', { status: 400 });
    }

    const webFile = file as unknown as File;
    const arrayBuffer = await webFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let originalName: string | undefined =
      (webFile as any).name || (formData.get('filename') as string | null) || undefined;
    if (!originalName) {
      originalName = 'image.png';
    }

    const extFromName = originalName.split('.').pop();
    const safeExt =
      extFromName && /^[a-zA-Z0-9]{1,5}$/.test(extFromName) ? extFromName : 'png';

    const fileName = `${Date.now()}-${randomUUID()}.${safeExt}`;

    if (!fs.existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, fileName);
    await writeFile(filePath, buffer);

    // URL, по которому фронт будет получать эту картинку
    const publicUrl = `/api/blog/image/${fileName}`;

    return NextResponse.json({ url: publicUrl });
  } catch (error) {
    console.error('Error uploading blog image:', error);
    return new NextResponse('Error uploading file', { status: 500 });
  }
}
