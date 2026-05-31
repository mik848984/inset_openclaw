import LifeAgentPage from '@/components/life-agents/LifeAgentPage';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Эпилогист — спокойный итог главы вашей жизни',
  description:
    'Игровой агент Эпилогист помогает подвести мягкий итог выбранному периоду жизни и увидеть, какой путь вы уже прошли, без приговоров и диагнозов.',
  alternates: { canonical: 'https://iiset.io/life-agents/epilogist' },
};

export default function Page() {
  return (
    <LifeAgentPage
      agentId="epilogist"
      title="📘 Эпилогист"
      description="Красивый эпилог текущей главы твоей жизни — про ценности, вклад и внутреннее состояние."
      placeholder="Напиши, что для тебя сейчас главное и что ты проходишь или завершаешь."
      ctaLabel="Создать"
    />
  );
}
