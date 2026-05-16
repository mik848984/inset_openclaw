import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import User from '@/models/user';
import dbConnect from '@/lib/db';
import Subscription from '@/models/subscription';

export async function POST(req: any): Promise<Response> {
  console.log('subscription');

  try {
    await dbConnect();

    const session = await auth();

    const user = await User.findOne({ email: session?.user?.email });

    const { status } = (await req.json()) as any;

    const subscription = await Subscription.findOne({
      user: user.id,
    });

    subscription.status = status;

    await subscription.save();

    return NextResponse.json({});
  } catch (error) {
    console.error(error);
    return new Response('Error', { status: 500 });
  }
}
