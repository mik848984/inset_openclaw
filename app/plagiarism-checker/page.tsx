import PlagiarismCheckerClient from './PlagiarismCheckerClient';

export const metadata = {
  title: 'Проверка уникальности текста нейросетью — ИИСеть',
  description:
    'Проверка текста на оригинальность нейросетью: подсказки по фрагментам, которые можно перефразировать. Для студентов, копирайтеров и преподавателей.',
  alternates: {
    canonical: 'https://iiset.io/plagiarism-checker',
  },
};

export default function PlagiarismCheckerPage() {
  return <PlagiarismCheckerClient />;
}
