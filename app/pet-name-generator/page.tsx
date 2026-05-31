import PetNameGeneratorClient from './PetNameGeneratorClient';

export const metadata = {
  title: 'Генератор кличек для питомцев нейросетью — ИИСеть',
  description:
    'Имена для котов, собак, попугаев и других питомцев — нейросеть предлагает варианты по характеру, породе и стилю клички.',
  alternates: {
    canonical: 'https://iiset.io/pet-name-generator',
  },
};

export default function PetNameGeneratorPage() {
  return <PetNameGeneratorClient />;
}
