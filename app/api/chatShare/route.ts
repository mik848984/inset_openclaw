import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/lib/db';
import User from '@/models/user';
import ChatShare from '@/models/chatShare';

export async function POST(req: Request): Promise<Response> {
  try {
    await dbConnect();

    const { role, content } = (await req.json()) as {
      role?: string;
      content?: string;
    };

    if (!role || !content) {
      return NextResponse.json(
        { error: 'role and content are required' },
        { status: 400 },
      );
    }

    const session = await auth();
    const user = session?.user
      ? await User.findOne({ email: session.user.email })
      : null;

    const isImage = content.startsWith('![image](');

    const doc = await ChatShare.create({
      user: user?._id,
      role,
      content,
      isImage,
    });

    return NextResponse.json({ id: doc._id.toString() });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Ошибка при создании ссылки для сообщения' },
      { status: 500 },
    );
  }
}
