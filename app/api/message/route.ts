import { auth } from '@/auth';
import User from '@/models/user';
import dbConnect from '@/lib/db';
import { NextResponse } from 'next/server';
import { dialogService } from '@/services/api/DialogService';

export async function POST(req: Request): Promise<Response> {
  console.log('message');

  try {
    await dbConnect();

    const { dialogId, content, role } = (await req.json()) as any;

    const session = await auth();

    const user = await User.findOne({ email: session?.user?.email });
    const dialog = await dialogService.getDialog(user?.id, dialogId);

    return NextResponse.json(
      await dialogService.addMessageToDialog({
        dialog: dialog.id,
        user,
        content,
        role,
      }),
    );
  } catch (error) {
    console.error(error);
    return new Response('Error', { status: 500 });
  }
}
