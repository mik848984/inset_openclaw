import LifeAgentPage from '@/components/life-agents/LifeAgentPage';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Альтер-эго — альтернативная версия вас через ИИ-агент',
  description:
    'Игровой ИИ-агент Альтер-эго создаёт логически связанную альтернативную версию вас из другой вселенной на основе ваших черт и привычек. Не медицинский диагноз — способ поиграть со смыслом.',
  alternates: { canonical: 'https://iiset.io/life-agents/alter-ego' },
};

export default function Page() {
  return (
    <LifeAgentPage
      agentId="alter-ego"
      title="🎭 Альтер-эго"
      description="Создаёт альтернативную версию тебя из другой вселенной, но логически связанную с твоими чертами."
      placeholder="Напиши 3–4 черты, привычки или интереса, которые тебя описывают."
      ctaLabel="Создать"
    />
  );
}
