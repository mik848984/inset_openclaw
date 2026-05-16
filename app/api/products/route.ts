import { NextRequest, NextResponse } from 'next/server';
import { paymentService } from '@/services/api/PaymentService';

export function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url!);

  if (searchParams.get('type') === 'grade') {
    return NextResponse.json(paymentService.itemsSubscription);
  } else if (searchParams.get('type') === 'items') {
    return NextResponse.json(paymentService.itemsPay);
  }
}
