import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';

/**
 * Отдача ранее загруженных картинок блога.
 *
 * Файлы лежат в папке `uploads/blog` в корне проекта.
 * URL: /api/blog/image/[filename]
 */

const uploadDir = path.join(process.cwd(), 'uploads', 'blog');

export async function GET(
  _req: NextRequest,
  { params }: { params: { filename: string } }
) {
  const { filename } = params;

  // Простейшая защита от попыток пролезть выше директории
  if (filename.includes('..') || filename.includes('/')) {
    return new NextResponse('Not found', { status: 404 });
  }

  const filePath = path.join(uploadDir, filename);

  try {
    const file = await fs.readFile(filePath);

    const ext = path.extname(filename).toLowerCase();
    let contentType = 'application/octet-stream';
    if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
    else if (ext === '.png') contentType = 'image/png';
    else if (ext === '.gif') contentType = 'image/gif';
    else if (ext === '.webp') contentType = 'image/webp';
    else if (ext === '.svg') contentType = 'image/svg+xml';

    return new NextResponse(file, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Error serving blog image:', error);
    return new NextResponse('Not found', { status: 404 });
  }
}
