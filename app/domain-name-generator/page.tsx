import DomainNameGeneratorClient from './DomainNameGeneratorClient';

export const metadata = {
  title: 'Генератор доменных имён нейросетью — для сайта ИИСеть',
  description:
    'Свободные домены для сайта, бренда или проекта — нейросеть подбирает варианты по теме, проверяет на читаемость и звучание.',
  alternates: {
    canonical: 'https://iiset.io/domain-name-generator',
  },
};

export default function DomainNameGeneratorPage() {
  return <DomainNameGeneratorClient />;
}
