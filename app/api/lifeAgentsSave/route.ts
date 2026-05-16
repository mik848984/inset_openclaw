import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/lib/db';
import User from '@/models/user';
import LifeAgentShare from '@/models/lifeAgentShare';
import LifeAgentSaved from '@/models/lifeAgentSaved';

export async function POST(req: Request): Promise<Response> {
  try {
    await dbConnect();

    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Требуется авторизация' },
        { status: 401 },
      );
    }

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 404 },
      );
    }

    const { shareId } = (await req.json()) as { shareId?: string };

    if (!shareId) {
      return NextResponse.json(
        { error: 'shareId is required' },
        { status: 400 },
      );
    }

    const share = await LifeAgentShare.findById(shareId);
    if (!share) {
      return NextResponse.json(
        { error: 'Ссылка не найдена или устарела' },
        { status: 404 },
      );
    }

    const saved = await LifeAgentSaved.create({
      user: user._id,
      agentId: share.agentId,
      content: share.content,
      title: share.title,
    });

    return NextResponse.json({ id: saved._id.toString() });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Ошибка при сохранении результата' },
      { status: 500 },
    );
  }
}
