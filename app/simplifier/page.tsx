import SimplifierClient from './SimplifierClient';

export const metadata = {
  title: 'Упростить текст нейросетью — упрощатель ИИСеть',
  description:
    'Упростите сложный текст нейросетью: юридические документы, инструкции, бюрократический язык — простыми словами. Сохраняет смысл, убирает канцелярит.',
  alternates: {
    canonical: 'https://iiset.io/simplifier',
  },
};

export default function SimplifierPage() {
  return <SimplifierClient />;
}
