import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/lib/db';
import User from '@/models/user';
import LifeAgentShare from '@/models/lifeAgentShare';

export async function POST(req: Request): Promise<Response> {
  try {
    await dbConnect();

    const { agentId, content, title } = (await req.json()) as {
      agentId: string;
      content: string;
      title?: string;
    };

    if (!agentId || !content) {
      return NextResponse.json(
        { error: 'agentId and content are required' },
        { status: 400 },
      );
    }

    const session = await auth();
    const user = session?.user
      ? await User.findOne({ email: session.user?.email })
      : null;

    const doc = await LifeAgentShare.create({
      user: user?._id,
      agentId,
      content,
      title,
    });

    return NextResponse.json({ id: doc._id.toString() });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error' }, { status: 500 });
  }
}
