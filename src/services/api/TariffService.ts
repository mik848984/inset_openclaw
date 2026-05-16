import cron from 'node-cron';
import Subscription, { ISubscription } from '@/models/subscription';
import { paymentService } from '@/services/api/PaymentService';
import Order from '@/models/order';
import User from '@/models/user';
import Usage from '@/models/usage';

interface UpdateUserBalanceParams {
  modelsBalance?: number;
  imageGenerationBalance?: number;
  webSearchBalance?: number;
  userId: string;
}

class TariffService {
  isRun = false;

  isSubscriptionExpired(subscription: ISubscription) {
    if (!subscription.startDate) return false;

    const now = new Date();
    const later = new Date(subscription.startDate);
    later.setMonth(later.getMonth() + 1);

    return now >= later;
  }

  async runCheckSubscriptions() {
    const subscriptions = await Subscription.find<ISubscription>();

    for (const subscription of subscriptions) {
      try {
        await new Promise((resolve) => setTimeout(resolve, 2000));

        console.log({
          status: subscription.status,
          grade: subscription.grade,
          userId: String(subscription.user),
          paymentMethodId: subscription.paymentMethodId,
          isExpired: this.isSubscriptionExpired(subscription),
        });

        if (subscription.status !== 'active') continue;
        if (!this.isSubscriptionExpired(subscription)) continue;

        const payment = await paymentService.createAutoPayment({
          grade: subscription.grade,
          userId: String(subscription.user),
          paymentMethodId: subscription.paymentMethodId,
        });

        await Order.create({
          paymentId: payment.id,
          user: String(subscription.user),
        });
      } catch (e) {
        console.log(e);
      }
    }
  }

  async updateUserBalance({
    userId,
    modelsBalance = 0,
    imageGenerationBalance = 0,
    webSearchBalance = 0,
  }: UpdateUserBalanceParams) {
    const user = await User.findById(userId);

    console.log('До Обновления Баланса');
    console.log({ user });

    user.modelsBalance += modelsBalance;
    user.imageGenerationBalance += imageGenerationBalance;
    user.webSearchBalance =
      (user.webSearchBalance || 0) + webSearchBalance;

    console.log('После Обновления Баланса');
    console.log({ user });

    await user.save();

    if (modelsBalance > 0 || imageGenerationBalance > 0) {
      return;
    }

    await Usage.create({
      user: userId,
      tokens: Math.abs(modelsBalance),
      images: Math.abs(imageGenerationBalance),
    });
  }

  init() {
    console.log('Запуск проверки подписок! init()');

    cron.schedule('0 0 * * *', async () => {
      console.log('Запуск проверки подписок!');

      try {
      } catch (e) {
        console.log(e);
      }
    });

    return true;
  }
}

export const tariffService = new TariffService();
