import { SeoKeywordsBody } from '@/types/types';
import { OpenAIStream } from '@/utils/seoKeywordsStream';
import { auth } from '@/auth';
import User from '@/models/user';

export async function POST(req: Request): Promise<Response> {
  try {
    const { name, topics } = (await req.json()) as SeoKeywordsBody;

    const session = await auth();
    const user = await User.findOne({ email: session?.user?.email });

    return new Response(await OpenAIStream(name, topics, user.id));
  } catch (error) {
    console.error(error);
    return new Response('Error', { status: 500 });
  }
}
