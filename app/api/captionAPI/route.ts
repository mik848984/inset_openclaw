import { CaptionBody } from '@/types/types';
import { OpenAIStream } from '@/utils/captionStream';
import { auth } from '@/auth';
import User from '@/models/user';

export async function POST(req: Request): Promise<Response> {
  try {
    const { topic, toneOfVoice, description } =
      (await req.json()) as CaptionBody;

    const session = await auth();
    const user = await User.findOne({ email: session?.user?.email });

    const stream = await OpenAIStream(topic, toneOfVoice, description, user.id);

    return new Response(stream);
  } catch (error) {
    console.error(error);
    return new Response('Error', { status: 500 });
  }
}
