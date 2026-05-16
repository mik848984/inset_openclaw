import dbConnect from '@/lib/db';
import { filesService } from '@/services/api/FilesService';
import File from '@/models/file';
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import User from '@/models/user';

export async function POST(req: Request) {
  console.log('file');

  try {
    await dbConnect();

    const session = await auth();

    const user = await User.findOne({ email: session?.user?.email });

    if (!user) {
      return new Response('Error', { status: 500 });
    }

    const { url } = (await req.json()) as any;

    const sendData = await filesService.deleteFile(url);

    await File.deleteOne({ url });

    return NextResponse.json({
      result: sendData,
    });
  } catch (error) {
    console.error(error);
    return new Response('Error', { status: 500 });
  }
}
