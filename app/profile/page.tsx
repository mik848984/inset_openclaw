import ProfileClient from './ProfileClient';
import { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: 'Личный кабинет — ИИСеть: управление подпиской и балансом',
  description:
    'Управляйте подпиской ИИСеть, проверяйте баланс текстовых страниц, генераций изображений и веб-поиска, отслеживайте статус тарифа и срок действия.',
  keywords: [
    'личный кабинет ии',
    'управление подпиской ии',
    'баланс нейросети',
    'профиль ии',
    'тариф ии',
    'подписка ии',
  ],
  alternates: {
    canonical: 'https://iiset.io/profile',
  },
  openGraph: {
    title: 'Личный кабинет — ИИСеть',
    description:
      'Управление подпиской, балансом и статусом тарифа в ИИСеть.',
    url: 'https://iiset.io/profile',
    siteName: 'ИИСеть',
    locale: 'ru_RU',
    type: 'website',
  },
};

export function generateViewport(): Viewport {
  return {
    width: 'device-width',
    initialScale: 1,
  };
}

export default function ProfilePage() {
  return <ProfileClient />;
}
