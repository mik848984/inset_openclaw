import endent from 'endent';
import { ICompletionsUser } from '@/utils/llmStream';
import { tariffService } from '@/services/api/TariffService';
import { modelsService } from '@/services/api/ModelsService';
const baseSystemPrompt = endent`
  Ты — полезный ассистент.
  Внимательно следуй инструкциям в сообщении пользователя и отвечай по делу.
  Если явно не указано иное, отвечай по-русски.
`;


const createPrompt = (
  topic: string,
  title: string,
  language:
    | ''
    | 'English'
    | 'Chinese'
    | 'Spanish'
    | 'Arabic'
    | 'Hindi'
    | 'Italian'
    | 'Portuguese'
    | 'Russian'
    | 'Japanese'
    | 'Romanian'
    | 'German',
  words: 200 | 300 | 400 | 500 | 600,
) => {
  const data = (
    topic: string,
    title: string,
    language:
      | ''
      | 'English'
      | 'Chinese'
      | 'Spanish'
      | 'Arabic'
      | 'Hindi'
      | 'Italian'
      | 'Portuguese'
      | 'Russian'
      | 'Japanese'
      | 'Romanian'
      | 'German',
    words: 200 | 300 | 400 | 500 | 600,
  ) => {
    return endent`
      You are an expert at generating compelling, high converting and SEO-Friendly articles.
      You know very well how to generate compelling, high converting and SEO-Friendly articles. Generate an article with the ${title} title and about the following topic: ${topic}.
      The article should contain AT LEAST ${words} words.
      The article should be written in ${language}.
      Do not include informations about console logs or print messages.
      
      Пиши на русском
    `;
  };

  if (topic) {
    return data(topic, title, language, words);
  }
};

export const OpenAIStream = async (
  topic: string,
  title: string,
  language:
    | ''
    | 'English'
    | 'Chinese'
    | 'Spanish'
    | 'Arabic'
    | 'Hindi'
    | 'Italian'
    | 'Portuguese'
    | 'Russian'
    | 'Japanese'
    | 'Romanian'
    | 'German',
  words: 200 | 300 | 400 | 500 | 600,
  user: string,
) => {
  const prompt = createPrompt(topic, title, language, words);

  const model = 'openai/gpt-oss-120b';

  const messages = [
    { role: 'system', content: baseSystemPrompt },
    { role: 'user', content: prompt },
  ];

  const onClose = async (usage: ICompletionsUser) => {
    await tariffService.updateUserBalance({
      userId: user,
      ...modelsService.getModelUsage(model, usage.total_tokens),
    });
  };

  return modelsService.llmRequest({
    model,
    stream: true,
    onClose,
    messages,
  });
};
