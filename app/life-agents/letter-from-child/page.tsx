import LifeAgentPage from '@/components/life-agents/LifeAgentPage';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Письмо из детства — тёплый диалог с вашим младшим «я»',
  description:
    'Агент «Письмо из детства» создаёт тёплое послание от воображаемого детского «я» взрослому себе. Помогает вспомнить мечты, ценности и поддерживающие слова.',
  alternates: { canonical: 'https://iiset.io/life-agents/letter-from-child' },
};

export default function Page() {
  return (
    <LifeAgentPage
      agentId="letter-from-child"
      title="💌 Письмо из детства"
      description="Письмо от твоего детского «я», которое радуется тебе и верит в тебе."
      placeholder="Опиши, кем ты являешься сейчас: работа, семья, интересы, что тебя волнует."
      ctaLabel="Создать"
    />
  );
}
