import { auth } from '@/auth';
import User from '@/models/user';
import { NextResponse } from 'next/server';
import { isAdmin } from '@/utils/isAdmin';

export async function POST(req: Request): Promise<Response> {
  try {
    const session = await auth();

    if (!session || !isAdmin(session)) {
      return new Response('Forbidden', { status: 403 });
    }

    const body = await req.json();
    const userId = body.userId as string | undefined;
    const modelsBalance = body.modelsBalance as number | undefined;
    const imageGenerationBalance = body.imageGenerationBalance as number | undefined;
    const webSearchBalance = body.webSearchBalance as number | undefined;

    if (!userId) {
      return new Response('User ID is required', { status: 400 });
    }

    const user = await User.findById(userId);

    if (!user) {
      return new Response('User not found', { status: 404 });
    }

    if (typeof modelsBalance === 'number') {
      user.modelsBalance = modelsBalance;
    }

    if (typeof imageGenerationBalance === 'number') {
      user.imageGenerationBalance = imageGenerationBalance;
    }

    if (typeof webSearchBalance === 'number') {
      user.webSearchBalance = webSearchBalance;
    }

    await user.save();

    return NextResponse.json({ ...user.toObject() });
  } catch (error) {
    console.error(error);
    return new Response('Error', { status: 500 });
  }
}
