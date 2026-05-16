import { auth } from '@/auth';
import User from '@/models/user';
import { NextResponse } from 'next/server';
import { isAdmin } from '@/utils/isAdmin';

async function getUsersSubscriptions() {
  try {
    const usersWithSubscriptionData = await User.aggregate([
      {
        $lookup: {
          from: 'subscriptions',
          localField: '_id',
          foreignField: 'user',
          as: 'subscriptions',
        },
      },
    ]).exec();

    return usersWithSubscriptionData;
  } catch (error) {
    console.error('Ошибка при тестовой агрегации:', error);
    return [];
  }
}

export async function GET(): Promise<Response> {
  console.log('users');
  try {
    const session = await auth();

    const user = await User.findOne({ email: session?.user?.email });

    if (!isAdmin(user.email)) {
      return new Response('Error', { status: 500 });
    }

    const users = await getUsersSubscriptions();

    console.log({ 'Количество юзеров': users.length });
    return NextResponse.json({
      length: users.length,
      users,
    });
  } catch (error) {
    console.error(error);
    return new Response('Error', { status: 500 });
  }
}
