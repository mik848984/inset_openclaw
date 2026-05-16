import { paymentService } from '@/services/api/PaymentService';
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import User from '@/models/user';
import Order from '@/models/order';
import dbConnect from '@/lib/db';

export async function GET(req: any): Promise<Response> {
  console.log('payment');

  try {
    await dbConnect();

    const { searchParams } = new URL(req.url!);

    const session = await auth();

    const user = await User.findOne({ email: session?.user?.email });

    const payment = await paymentService.createEmbeddedPayment({
      grade: searchParams.get('grade')!,
      itemId: searchParams.get('itemId')!,
      email: searchParams.get('email')!,
      userId: user.id,
    });

    await Order.create({ user: user.id, paymentId: payment.id });

    return NextResponse.json({
      id: payment.id,
      confirmation_token: payment.confirmation.confirmation_token,
    });
  } catch (error) {
    console.error(error);
    return new Response('Error', { status: 500 });
  }
}
