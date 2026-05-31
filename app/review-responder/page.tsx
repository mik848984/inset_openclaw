import ReviewResponderClient from './ReviewResponderClient';

export const metadata = {
  title: 'Ответы на отзывы нейросетью — для бизнеса ИИСеть',
  description:
    'Ответы на отзывы клиентов на Яндекс.Картах, 2GIS, Google Maps и маркетплейсах. Нейросеть отвечает вежливо, по делу и в едином тоне бренда.',
  alternates: {
    canonical: 'https://iiset.io/review-responder',
  },
};

export default function ReviewResponderPage() {
  return <ReviewResponderClient />;
}
