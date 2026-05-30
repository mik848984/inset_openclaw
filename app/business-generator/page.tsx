import BusinessGeneratorClient from './BusinessGeneratorClient';

export const metadata = {
  title: 'Генератор бизнес-идей нейросетью — ИИСеть',
  description:
    'Бизнес-идеи нейросетью под ваш бюджет, регион и интересы: список направлений с короткими обоснованиями и первыми шагами для старта.',
  alternates: {
    canonical: 'https://iiset.io/business-generator',
  },
};

export default function BusinessGeneratorPage() {
  return <BusinessGeneratorClient />;
}
