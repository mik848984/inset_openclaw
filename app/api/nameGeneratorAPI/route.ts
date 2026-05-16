import { NameGeneratorBody } from '@/types/types';
import { OpenAIStream } from '@/utils/nameGeneratorStream';
import { auth } from '@/auth';
import User from '@/models/user';

export async function POST(req: Request): Promise<Response> {
  try {
    const { topic, productType } = (await req.json()) as NameGeneratorBody;

    const session = await auth();
    const user = await User.findOne({ email: session?.user?.email });

    const stream = await OpenAIStream(topic, productType, user.id);

    return new Response(stream);
  } catch (error) {
    console.error(error);
    return new Response('Error', { status: 500 });
  }
}
