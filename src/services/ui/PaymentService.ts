interface IEmbeddedPaymentReturnType {
  confirmation_token: string;
  id: string;
}

class PaymentService {
  getEmbeddedPaymentUrl(grade: string, itemId: string, email: string) {
    if (grade) {
      return `/api/payment?grade=${grade}&email=${email}`;
    }

    return `/api/payment?itemId=${itemId}&email=${email}`;
  }
  async createEmbeddedPayment(
    grade: string,
    itemId: string,
    email: string,
  ): Promise<IEmbeddedPaymentReturnType> {
    const response = await fetch(
      this.getEmbeddedPaymentUrl(grade, itemId, email),
    );
    return response.json();
  }

  async updateEmbeddedPayment(
    paymentId: string,
  ): Promise<IEmbeddedPaymentReturnType> {
    const response = await fetch(`/api/payment`, {
      method: 'POST',
      body: JSON.stringify({ paymentId }),
    });

    return response.json();
  }

  async subscription(
    status: 'active' | 'cancel',
  ): Promise<IEmbeddedPaymentReturnType> {
    const response = await fetch(`/api/subscription`, {
      method: 'POST',
      body: JSON.stringify({ status }),
    });

    return response.json();
  }
}

export const paymentService = new PaymentService();
