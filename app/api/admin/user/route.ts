import { auth } from '@/auth';
import User from '@/models/user';
import { NextResponse } from 'next/server';
import { isAdmin } from '@/utils/isAdmin';
import Usage from '@/models/usage';

export async function GET(req: Request): Promise<Response> {
  console.log('admin/user');
  try {
    const session = await auth();
    const user = await User.findOne({ email: session?.user?.email });

    if (!isAdmin(user.email)) {
      return new Response('Error', { status: 500 });
    }

    const { searchParams } = new URL(req.url!);

    return NextResponse.json({
      user: await User.findById(searchParams.get('userId')),
      usage: await Usage.find({ user: searchParams.get('userId') }),
    });
  } catch (error) {
    console.error(error);
    return new Response('Error', { status: 500 });
  }
}

export async function POST(req: Request): Promise<Response> {
  console.log('admin/user');
  try {
    const { modelsBalance, imageGenerationBalance, userId, webSearchBalance } =
      (await req.json()) as any;

    const session = await auth();

    const userCheck = await User.findOne({ email: session?.user?.email });

    if (!isAdmin(userCheck.email)) {
      return new Response('Error', { status: 500 });
    }

    const user = await User.findById(userId);

    user.modelsBalance = modelsBalance;
    user.imageGenerationBalance = imageGenerationBalance;

    if (typeof webSearchBalance === 'number') {
      user.webSearchBalance = webSearchBalance;
    }

    await user.save();

    return NextResponse.json({ ...user });
  } catch (error) {
    console.error(error);
    return new Response('Error', { status: 500 });
  }
}
