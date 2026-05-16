import { auth } from '@/auth';
import User from '@/models/user';
import dbConnect from '@/lib/db';
import { NextResponse } from 'next/server';
import Usage from '@/models/usage';

export async function GET(): Promise<Response> {
  console.log('usage');

  try {
    await dbConnect();

    const session = await auth();

    const user = await User.findOne({ email: session?.user?.email });

    return NextResponse.json(await Usage.find({ user: user.id }));
  } catch (error) {
    console.error(error);
    return new Response('Error', { status: 500 });
  }
}
