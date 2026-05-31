import BootstrapToTailwindConverterClient from './BootstrapToTailwindConverterClient';

export const metadata = {
  title: 'Bootstrap в Tailwind CSS нейросетью — конвертер ИИСеть',
  description:
    'Конвертируйте Bootstrap-классы в Tailwind CSS онлайн. Нейросеть преобразует HTML с Bootstrap в чистый Tailwind-код для быстрой миграции проектов.',
  alternates: {
    canonical: 'https://iiset.io/bootstrap-to-tailwind-converter',
  },
};

export default function BootstrapToTailwindConverterPage() {
  return <BootstrapToTailwindConverterClient />;
}
