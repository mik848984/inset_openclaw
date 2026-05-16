import { EssayBody } from '@/types/types';
import { OpenAIStream } from '@/utils/essayStream';
import { auth } from '@/auth';
import User from '@/models/user';

export async function POST(req: Request): Promise<Response> {
  try {
    const { topic, paragraphs, essayType } = (await req.json()) as EssayBody;

    const session = await auth();
    const user = await User.findOne({ email: session?.user?.email });

    const stream = await OpenAIStream(topic, essayType, paragraphs, user.id);

    return new Response(stream);
  } catch (error) {
    console.error(error);
    return new Response('Error', { status: 500 });
  }
}
