import { ArticleBody } from '@/types/types';
import { OpenAIStream } from '@/utils/articleGeneratorStream';
import User from '@/models/user';
import { auth } from '@/auth';

export async function POST(req: Request): Promise<Response> {
  try {
    const { topic, title, language, words } = (await req.json()) as ArticleBody;

    const session = await auth();
    const user = await User.findOne({ email: session?.user?.email });
    const stream = await OpenAIStream(topic, title, language, words, user.id);

    return new Response(stream);
  } catch (error) {
    console.error(error);
    return new Response('Error', { status: 500 });
  }
}
