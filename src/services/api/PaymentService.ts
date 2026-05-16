import { YooCheckout } from '@a2seven/yoo-checkout';
import User from '@/models/user';

interface ICreateEmbeddedPayment {
  grade: string;
  userId: string;
  itemId: string;
  email: string;
}

interface ICreateAutoPayment {
  grade: string;
  userId: string;
  paymentMethodId: string;
}

class PaymentService {
  itemsSubscription = [
    {
      grade: 'Premium',
      description: '2400 страниц генерации текста. 150 генераций картинок.',
      modelsBalance: 1_500_000,
      imageGenerationBalance: 150,
      price: '249.00',
    },
    // {
    //   grade: 'Medium',
    //   description:
    //     'Премиум тариф. Lite модель - 800 страниц генерации текста. 100 генераций картинок.',
    //   modelsBalance: 500_000,
    //   imageGenerationBalance: 100,
    //   price: '349.00',
    // },
    // {
    //   grade: 'Start',
    //   description:
    //     'Премиум тариф. Lite модель - 800 страниц генерации текста. 50 генераций картинок.',
    //   modelsBalance: 500_000,
    //   imageGenerationBalance: 50,
    //   price: '149.00',
    // },
  ];

  itemsPay = [
    {
      id: '1',
      description: '50 Генераций картинок',
      modelsBalance: 0,
      imageGenerationBalance: 50,
      price: '69.00',
    },
    {
      id: '2',
      description: '100 Генераций картинок',
      modelsBalance: 0,
      imageGenerationBalance: 100,
      price: '99.00',
    },
    {
      id: '3',
      description: '800 Страниц текстовых моделей',
      modelsBalance: 500_000,
      imageGenerationBalance: 0,
      price: '99.00',
    },
    {
      id: '4',
      description: '1600 Страниц текстовых моделей',
      modelsBalance: 1_000_000,
      imageGenerationBalance: 0,
      price: '149.00',
    },
    {
      id: '5',
      description: '1600 Страниц текстовых моделей',
      modelsBalance: 1_500_000,
      imageGenerationBalance: 0,
      price: '199.00',
    },
  ];

  yookassa = new YooCheckout({
    shopId: process.env.SHOP_ID!,
    secretKey: process.env.SECRET_KEY!,
  });

  getGrade(grade: string) {
    return this.itemsSubscription.find((item) => item.grade === grade);
  }

  getItemPay(id: string) {
    return this.itemsPay.find((item) => item.id === id);
  }

  async createAutoPayment({
    grade,
    paymentMethodId,
    userId,
  }: ICreateAutoPayment) {
    const gradeItem = this.getGrade(grade);

    const user = await User.findById(userId);

    console.log({ user });
    return await this.yookassa.createPayment({
      amount: { value: String(gradeItem?.price), currency: 'RUB' },
      metadata: { userId, grade },
      capture: true,
      description: gradeItem?.description,
      payment_method_id: paymentMethodId,
      receipt: {
        customer: {
          email: user.email,
        },
        items: [
          {
            amount: { value: String(gradeItem?.price), currency: 'RUB' },
            description: gradeItem?.description!,
            quantity: '1',
            vat_code: 1,
            payment_subject: 'payment',
            payment_mode: 'full_prepayment',
          },
        ],
      },
    });
  }

  async createEmbeddedPayment({
    grade,
    userId,
    itemId,
    email,
  }: ICreateEmbeddedPayment) {
    if (!grade) {
      const itemPay = this.getItemPay(itemId);

      return await this.yookassa.createPayment({
        amount: { value: String(itemPay?.price), currency: 'RUB' },
        metadata: { userId, itemId },
        confirmation: { type: 'embedded' },
        receipt: {
          customer: {
            email,
          },
          items: [
            {
              amount: { value: String(itemPay?.price), currency: 'RUB' },
              description: itemPay?.description!,
              quantity: '1',
              vat_code: 1,
              payment_subject: 'payment',
              payment_mode: 'full_prepayment',
            },
          ],
        },
        capture: true,
        description: itemPay?.description,
      });
    }

    const gradeItem = this.getGrade(grade);

    return await this.yookassa.createPayment({
      amount: { value: String(gradeItem?.price), currency: 'RUB' },
      metadata: { userId, grade },
      confirmation: { type: 'embedded' },
      capture: true,
      receipt: {
        customer: {
          email,
        },
        items: [
          {
            amount: { value: String(gradeItem?.price), currency: 'RUB' },
            description: gradeItem?.description!,
            quantity: '1',
            vat_code: 1,
            payment_subject: 'payment',
            payment_mode: 'full_prepayment',
          },
        ],
      },
      description: gradeItem?.description,
      save_payment_method: true,
    });
  }
}

export const paymentService = new PaymentService();
