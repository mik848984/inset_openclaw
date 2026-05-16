import { modelsService } from '@/services/api/ModelsService';
import { auth } from '@/auth';
import User from '@/models/user';
import dbConnect from '@/lib/db';

export async function POST(req: Request): Promise<Response> {
  console.log('chatAPI');

  try {
    await dbConnect();

    const { messages, model, mode, webSearch, files, youtube } =
      (await req.json()) as any;

    const session = await auth();

    const user = await User.findOne({ email: session?.user?.email });

    return new Response(
      await modelsService.multiModalRequest({
        model,
        messages,
        mode,
        user,
        webSearch,
        files,
        youtube,
      }),
    );
  } catch (error) {
    console.error(error);
    return new Response('Error', { status: 500 });
  }
}
