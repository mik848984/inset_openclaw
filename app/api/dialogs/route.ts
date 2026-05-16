import { auth } from '@/auth';
import User from '@/models/user';
import dbConnect from '@/lib/db';
import { NextResponse } from 'next/server';
import { dialogService } from '@/services/api/DialogService';

export async function GET(): Promise<Response> {
  console.log('dialogs');

  try {
    await dbConnect();

    const session = await auth();

    const user = await User.findOne({ email: session?.user?.email });

    return NextResponse.json(await dialogService.getDialogs(user?.id));
  } catch (error) {
    console.error(error);
    return new Response('Error', { status: 500 });
  }
}
