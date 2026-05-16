import { auth } from '@/auth';
import User from '@/models/user';
import dbConnect from '@/lib/db';
import { NextResponse } from 'next/server';
import { dialogService } from '@/services/api/DialogService';

export async function GET(req: Request): Promise<Response> {
  console.log('dialog');

  try {
    await dbConnect();

    const { searchParams } = new URL(req.url!);

    const session = await auth();

    const user = await User.findOne({ email: session?.user?.email });
    const dialog = await dialogService.getDialog(
      user?.id,
      searchParams.get('dialogId')!,
    );

    const messages = await dialogService.getMessages(
      user?.id,
      searchParams.get('dialogId')!,
    );

    return NextResponse.json({ dialog, messages });
  } catch (error) {
    console.error(error);
    return new Response('Error', { status: 500 });
  }
}
