import LifeAgentPage from '@/components/life-agents/LifeAgentPage';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Оракул — вдохновляющее будущее без мистики',
  description:
    'Игровой ИИ-агент Оракул строит воодушевляющее, но реалистичное описание вашего возможного будущего на основе текущего контекста. Не даёт финансовых, медицинских или юридических советов.',
  alternates: { canonical: 'https://iiset.io/life-agents/oracle' },
};

export default function Page() {
  return (
    <LifeAgentPage
      agentId="oracle"
      title="🔮 Оракул"
      description="Вдохновляющее, но реалистичное видение того, каким ты можешь стать через 5–20 лет."
      placeholder="Опиши, кем ты являешься сейчас: работа, образ жизни, что для тебя важно."
      ctaLabel="Создать"
    />
  );
}
