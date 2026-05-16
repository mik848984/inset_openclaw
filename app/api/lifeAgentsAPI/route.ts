
import { auth } from '@/auth';
import User from '@/models/user';
import { OpenAIStream } from '@/utils/lifeAgentsStream';

export async function POST(req: Request): Promise<Response> {
  try {
    const { agentId, content } = (await req.json()) as {
      agentId: string;
      content: string;
    };

    const session = await auth();
    const user = await User.findOne({ email: session?.user?.email });

    if (!user) {
      return new Response('User not found', { status: 401 });
    }

    const stream = await OpenAIStream(agentId as any, content, user.id);

    return new Response(stream);
  } catch (error) {
    console.error(error);
    return new Response('Error', { status: 500 });
  }
}
