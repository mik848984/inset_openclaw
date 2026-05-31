import LifeAgentPage from '@/components/life-agents/LifeAgentPage';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Редактор жизни — текст о себе сильнее и яснее',
  description:
    'Игровой ИИ-агент Редактор жизни переписывает текст о вас так, чтобы он звучал яснее, сильнее и увереннее. Не психотерапия — способ посмотреть на себя под новым углом.',
  alternates: { canonical: 'https://iiset.io/life-agents/life-editor' },
};

export default function Page() {
  return (
    <LifeAgentPage
      agentId="life-editor"
      title="✏️ Редактор жизни"
      description="Перепишет твой текст о себе так, чтобы он звучал яснее, сильнее и увереннее."
      placeholder="Напиши короткий абзац о себе или своей жизни так, как ты обычно это делаешь."
      ctaLabel="Создать"
    />
  );
}
