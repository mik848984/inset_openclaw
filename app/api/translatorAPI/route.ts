import { TranslatorBody } from '@/types/types';
import { OpenAIStream } from '@/utils/translatorStream';
import { auth } from '@/auth';
import User from '@/models/user';

export async function POST(req: Request): Promise<Response> {
  try {
    const { content, language } = (await req.json()) as TranslatorBody;

    const session = await auth();
    const user = await User.findOne({ email: session?.user?.email });

    const stream = await OpenAIStream(content, language, user.id);

    return new Response(stream);
  } catch (error) {
    console.error(error);
    return new Response('Error', { status: 500 });
  }
}
