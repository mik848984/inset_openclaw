import TranslatorClient from './TranslatorClient';

export const metadata = {
  title: 'ИИ-переводчик онлайн на русском — ИИСеть',
  description:
    'Бесплатный ИИ-переводчик ИИСеть: точный перевод текстов на русский, английский и другие языки нейросетью. С сохранением смысла и стиля. Без регистрации.',
  alternates: {
    canonical: 'https://iiset.io/translator',
  },
};

export default function TranslatorPage() {
  return <TranslatorClient />;
}
