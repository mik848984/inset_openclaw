import { ProductDescriptionBody } from '@/types/types';
import { OpenAIStream } from '@/utils/productDescriptionStream';
import { auth } from '@/auth';
import User from '@/models/user';

export async function POST(req: Request): Promise<Response> {
  try {
    const { name, keyBenefitsFeatures } =
      (await req.json()) as ProductDescriptionBody;

    const session = await auth();
    const user = await User.findOne({ email: session?.user?.email });

    const stream = await OpenAIStream(name, keyBenefitsFeatures, user.id);

    return new Response(stream);
  } catch (error) {
    console.error(error);
    return new Response('Error', { status: 500 });
  }
}
