import NameGeneratorClient from './NameGeneratorClient';

export const metadata = {
  title: 'Генератор названий нейросетью — для бренда и проекта ИИСеть',
  description:
    'Названия для бренда, компании, продукта или проекта — нейросеть подбирает варианты с проверкой звучания, смысла и тональности.',
  alternates: {
    canonical: 'https://iiset.io/name-generator',
  },
};

export default function NameGeneratorPage() {
  return <NameGeneratorClient />;
}
