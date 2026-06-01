import AllTemplatesClient from './AllTemplatesClient';

export const metadata = {
  title: 'Готовые AI-шаблоны для работы — ИИСеть: 20+ инструментов для текста, маркетинга и идей',
  description:
    'Библиотека готовых AI-сценариев для работы: генерация текстов, статей, писем, подписей, SEO-ключей, названий, бизнес-идей и проверка на плагиат. Заполните форму — ИИ сделает всё за вас.',
  keywords: [
    'ai шаблоны',
    'готовые сценарии ии',
    'инструменты для текста',
    'генератор статей',
    'проверка текста на плагиат',
    'нейросеть для маркетинга',
    'ai для бизнеса',
  ],
  alternates: {
    canonical: 'https://iiset.io/all-templates',
  },
  openGraph: {
    title: 'Готовые AI-шаблоны для работы — ИИСеть',
    description:
      '20+ инструментов для текста, маркетинга, SEO и бизнес-идей. Заполните форму — ИИ сделает всё за вас.',
    url: 'https://iiset.io/all-templates',
    siteName: 'ИИСеть',
    locale: 'ru_RU',
    type: 'website',
  },
};

export default function AllTemplatesPage() {
  return <AllTemplatesClient />;
}
