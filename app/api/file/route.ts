import dbConnect from '@/lib/db';
import { NextResponse } from 'next/server';
import { filesService } from '@/services/api/FilesService';
import File from '@/models/file';
import { auth } from '@/auth';
import User from '@/models/user';

export async function POST(req: Request): Promise<Response> {
  console.log('file');

  try {
    await dbConnect();

    const session = await auth();

    const user = await User.findOne({ email: session?.user?.email });

    if (!user) {
      return new Response('Error', { status: 500 });
    }

    const formData = await req.formData();
    const file = formData.get('file');

    if (!file || typeof file === 'string') {
      return NextResponse.json(
        { message: 'No file.ts uploaded.' },
        { status: 400 },
      );
    }

    const fileBuffer = await file.arrayBuffer();

    const optimizedArrayBuffer = await filesService.optimizeAttachment(
      fileBuffer,
      file.name,
    );

    const sendData = await filesService.uploadFile(
      optimizedArrayBuffer,
      file.name,
    );

    if (!sendData) {
      return new Response('Error', { status: 500 });
    }

    await File.create({
      type: file.type,
      name: file.name,
      url: sendData.Location,
    });

    return NextResponse.json({
      type: file.type,
      name: file.name,
      url: sendData.Location,
    });
  } catch (error) {
    console.error(error);
    return new Response('Error', { status: 500 });
  }
}
