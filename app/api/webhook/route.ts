import { NextResponse } from 'next/server';
import ipRangeCheck from 'ip-range-check';
import Order from '@/models/order';
import { loggerService } from '@/services/api/LoggerService';
import Subscription from '@/models/subscription';
import { tariffService } from '@/services/api/TariffService';
import { paymentService } from '@/services/api/PaymentService';
import dbConnect from '@/lib/db';

export async function POST(req: Request, res: Response): Promise<Response> {
  const YOOKASSA_IPS = [
    '185.71.76.0/27',
    '185.71.77.0/27',
    '77.75.153.0/25',
    '77.75.156.11',
    '77.75.156.35',
    '77.75.154.128/25',
    '2a02:5180::/32',
  ];

  try {
    console.log('webhook');

    await dbConnect();

    const clientIp = req.headers.get('x-forwarded-for')!;
    console.log({ clientIp });

    console.log({
      'ipRangeCheck(clientIp, YOOKASSA_IPS)': ipRangeCheck(
        clientIp,
        YOOKASSA_IPS,
      ),
    });
    if (!ipRangeCheck(clientIp, YOOKASSA_IPS)) {
      return NextResponse.error();
    }

    const body = await req.json();

    console.log({ body });
    console.log({ 'body.object.metadata': body.object.metadata });

    if (body.event === 'payment.succeeded') {
      const order = await Order.findOne({
        paymentId: body.object.id,
        user: body.object.metadata.userId,
      });

      console.log(order);

      if (!order) {
        loggerService.log('error', `Ордер не найден!`, {
          paymentId: body.object.id,
          user: body.object.metadata.userId,
        });

        return NextResponse.json({});
      }

      loggerService.log('error', `Ордер найден!`, order);

      order.status = 'succeeded';

      await order.save();

      if (body.object.metadata.grade) {
        const subscription = await Subscription.findOne({
          user: body.object.metadata.userId,
        });

        const grade = paymentService.getGrade(body.object.metadata.grade);

        await tariffService.updateUserBalance({
          userId: body.object.metadata.userId,
          ...grade,
        });

        if (subscription) {
          subscription.paymentMethodId = body.object.payment_method.id;
          subscription.grade = body.object.metadata.grade;
          subscription.startDate = new Date().toISOString();

          await subscription.save();

          return NextResponse.json({});
        }

        await Subscription.create({
          user: body.object.metadata.userId,
          paymentMethodId: body.object.payment_method.id,
          grade: body.object.metadata.grade,
        });

        return NextResponse.json({});
      }

      const item = paymentService.getItemPay(body.object.metadata.itemId);

      console.log({ item });
      await tariffService.updateUserBalance({
        userId: body.object.metadata.userId,
        ...item,
      });
    }

    return NextResponse.json({ message: 'Success' });
  } catch (e) {
    return NextResponse.error();
  }
}
