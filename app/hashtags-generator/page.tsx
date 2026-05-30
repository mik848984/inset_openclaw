import HashtagsGeneratorClient from './HashtagsGeneratorClient';

export const metadata = {
  title: 'Генератор хэштегов нейросетью — Instagram, ВК, TikTok ИИСеть',
  description:
    'Подбор релевантных хэштегов для постов в Instagram, ВКонтакте, TikTok и Telegram нейросетью. По теме, нише и языку аудитории.',
  alternates: {
    canonical: 'https://iiset.io/hashtags-generator',
  },
};

export default function HashtagsGeneratorPage() {
  return <HashtagsGeneratorClient />;
}
