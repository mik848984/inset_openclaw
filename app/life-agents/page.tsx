import { Metadata } from 'next';
import LifeAgentsLandingClient from './LifeAgentsLandingClient';

export const metadata: Metadata = {
  title: 'Агенты Жизни ИИСеть — игровые ИИ-агенты для самоанализа',
  description:
    'Набор игровых ИИ-агентов: Психоаналитик, Netflix-сценарист, Оракул, Письмо из детства и другие. Помогают взглянуть на себя под новым углом без медицинских или психотерапевтических обещаний.',
  alternates: { canonical: 'https://iiset.io/life-agents' },
};

export default function Page() {
  return <LifeAgentsLandingClient />;
}
