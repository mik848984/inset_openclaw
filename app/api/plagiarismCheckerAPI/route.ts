import { PlagiarismCheckerBody } from '@/types/types';
import { OpenAIStream } from '@/utils/plagiarismCheckerStream';
import { auth } from '@/auth';
import User from '@/models/user';

export async function POST(req: Request): Promise<Response> {
  try {
    const { content } = (await req.json()) as PlagiarismCheckerBody;

    const session = await auth();
    const user = await User.findOne({ email: session?.user?.email });

    const stream = await OpenAIStream(content, user.id);

    return new Response(stream);
  } catch (error) {
    console.error(error);
    return new Response('Error', { status: 500 });
  }
}
