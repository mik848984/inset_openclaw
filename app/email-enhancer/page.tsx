import EmailEnhancerClient from './EmailEnhancerClient';

export const metadata = {
  title: 'Улучшить письмо нейросетью — email-помощник ИИСеть',
  description:
    'Сделайте письмо вежливее, короче или понятнее. Нейросеть переписывает email клиентам, коллегам и руководству — в нужном тоне, без канцелярита.',
  alternates: {
    canonical: 'https://iiset.io/email-enhancer',
  },
};

export default function EmailEnhancerPage() {
  return <EmailEnhancerClient />;
}
