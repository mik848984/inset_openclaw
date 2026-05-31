import LifeAgentPage from '@/components/life-agents/LifeAgentPage';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Netflix-сценарист — агент, который пишет серию про вашу жизнь',
  description:
    'Агент Netflix-сценарист превращает факты о вас в сценарий эпизода сериала. Помогает увидеть себя героем истории и взглянуть на текущие события под другим углом.',
  alternates: { canonical: 'https://iiset.io/life-agents/netflix-writer' },
};

export default function Page() {
  return (
    <LifeAgentPage
      agentId="netflix-writer"
      title="🎬 Netflix-Сценарист"
      description="Создай описание серии сериала о своей жизни: с названием, логлайном и синопсисом."
      placeholder="Опиши себя: чем занимаешься, что любишь, о чём мечтаешь, какие у тебя цели."
      ctaLabel="Создать"
    />
  );
}
