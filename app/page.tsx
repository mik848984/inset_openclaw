import HomeContent from './HomeContent';

export const metadata = {
  title:
    'ИИСеть — нейросеть онлайн на русском: ИИ-чат, веб-поиск и генерация изображений',
  description:
    'ИИСеть — российская AI-платформа: чат с GPT-4o, Claude и Gemini, веб-поиск со ссылками на источники и генерация изображений на русском языке. Один интерфейс вместо десятка сервисов. Регистрация бесплатна.',
  keywords:
    'ИИСеть, нейросеть онлайн, ИИ чат, чат с ИИ, ChatGPT на русском, нейросеть для текста, генерация изображений нейросетью, ИИ поиск, веб-поиск с источниками, ИИ помощник, нейросеть на русском, AI сервис',
  alternates: {
    canonical: 'https://iiset.io/',
  },
  openGraph: {
    title: 'ИИСеть — нейросеть онлайн на русском: ИИ-чат, веб-поиск и генерация изображений',
    description:
      'ИИСеть — российская AI-платформа: чат с GPT-4o, Claude и Gemini, веб-поиск со ссылками на источники и генерация изображений на русском языке.',
    url: 'https://iiset.io/',
    siteName: 'ИИСеть',
    locale: 'ru_RU',
    type: 'website',
    images: ['https://iiset.io/brand.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ИИСеть — нейросеть онлайн на русском: ИИ-чат, веб-поиск и генерация изображений',
    description:
      'ИИСеть — российская AI-платформа: чат с GPT-4o, Claude и Gemini, веб-поиск со ссылками на источники и генерация изображений.',
    images: ['https://iiset.io/brand.png'],
  },
};

export default function HomePage() {
  return <HomeContent />;
}
