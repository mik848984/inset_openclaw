import CaptionClient from './CaptionClient';

export const metadata = {
  title: 'Подписи для соцсетей нейросетью — Instagram, ВК, Telegram ИИСеть',
  description:
    'Подписи и тексты для постов и сторис в Instagram, ВКонтакте и Telegram. Готовые варианты под аудиторию, тон бренда и формат публикации.',
  alternates: {
    canonical: 'https://iiset.io/caption',
  },
};

export default function CaptionPage() {
  return <CaptionClient />;
}
