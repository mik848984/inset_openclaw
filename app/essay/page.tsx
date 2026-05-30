import EssayClient from './EssayClient';

export const metadata = {
  title: 'Эссе и сочинения нейросетью — генератор эссе ИИСеть',
  description:
    'Напишите эссе или сочинение нейросетью за минуту. ИИСеть создаёт связные тексты на заданную тему — для учёбы, конкурсов и контента.',
  alternates: {
    canonical: 'https://iiset.io/essay',
  },
};

export default function EssayPage() {
  return <EssayClient />;
}
