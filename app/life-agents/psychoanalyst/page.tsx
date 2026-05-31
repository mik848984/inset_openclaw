import LifeAgentPage from '@/components/life-agents/LifeAgentPage';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Психоаналитик — игровой ИИ-агент ИИСеть',
  description:
    'Игровой ИИ-агент Психоаналитик мягко разбирает ваши интересы, привычки и переживания, подчёркивая сильные стороны и мотивы. Это не психотерапия, а способ по-новому посмотреть на себя.',
  alternates: { canonical: 'https://iiset.io/life-agents/psychoanalyst' },
};

export default function Page() {
  return (
    <LifeAgentPage
      agentId="psychoanalyst"
      title="🧠 Психоаналитик"
      description="Мягкий психологический разбор твоей личности с акцентом на сильные стороны и мотивы."
      placeholder="Напиши, что тебе нравится, чем ты занят, какую последнюю книгу или фильм запомнил, какие чувства часто возвращаются."
      ctaLabel="Создать"
    />
  );
}
