import SeoKeywordsClient from './SeoKeywordsClient';

export const metadata = {
  title: 'Генератор SEO-ключей нейросетью — подбор семантики ИИСеть',
  description:
    'Подбор поисковых ключевых слов нейросетью: основные запросы, длинные хвосты, LSI и кластеры. Для статей, лендингов и интернет-магазинов.',
  alternates: {
    canonical: 'https://iiset.io/seo-keywords',
  },
};

export default function SeoKeywordsPage() {
  return <SeoKeywordsClient />;
}
