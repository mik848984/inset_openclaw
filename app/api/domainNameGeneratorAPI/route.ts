import { DomainNameGeneratorBody } from '@/types/types';
import { OpenAIStream } from '@/utils/domainNameGeneratorStream';
import { auth } from '@/auth';
import User from '@/models/user';

export async function POST(req: Request): Promise<Response> {
  try {
    const { keywords, industry } =
      (await req.json()) as DomainNameGeneratorBody;

    const session = await auth();
    const user = await User.findOne({ email: session?.user?.email });

    const stream = await OpenAIStream(keywords, industry, user.id);

    return new Response(stream);
  } catch (error) {
    console.error(error);
    return new Response('Error', { status: 500 });
  }
}
