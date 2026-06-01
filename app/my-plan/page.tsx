import type { Metadata } from 'next';
import MyPlanClient from './MyPlanClient';

export const metadata: Metadata = {
  title: 'Мой тариф — ИИСеть Premium: 249 ₽/мес',
  description:
    'Управляйте подпиской ИИСеть Premium: GPT-4o, генерация изображений, веб-поиск. Тариф от 249 ₽/мес. Отмена в любой момент.',
  keywords: ['тариф ии', 'подписка на нейросеть', 'цена ии чат', 'GPT-4o россия'],
  alternates: {
    canonical: 'https://iiset.io/my-plan',
  },
};

export default function MyPlanPage() {
  return <MyPlanClient />;
}
