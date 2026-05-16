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
  toneOfVoice:
    | ''
    | 'Formal'
    | 'Informal'
    | 'Humorous'
    | 'Serious'
    | 'Optimistic'
    | 'Motivating'
    | 'Respectful'
    | 'Assertive'
    | 'Conversational',
  content: string,
) => {
  const data = (
    topic: string,
    toneOfVoice:
      | ''
      | 'Formal'
      | 'Informal'
      | 'Humorous'
      | 'Serious'
      | 'Optimistic'
      | 'Motivating'
      | 'Respectful'
      | 'Assertive'
      | 'Conversational',
    content: string,
  ) => {
    return endent`
      You are an expert at enhancing emails and making them compelling & high converting.
      You know very well how to enhance an email. Enchance the following email ${content} and make it for ${topic} topic with a ${toneOfVoice} tone of voice. 
      Do not include informations about console logs or print messages.
      Пиши на русском
    `;
  };

  if (topic) {
    return data(topic, toneOfVoice, content);
  }
};

export const OpenAIStream = async (
  topic: string,
  toneOfVoice:
    | ''
    | 'Formal'
    | 'Informal'
    | 'Humorous'
    | 'Serious'
    | 'Optimistic'
    | 'Motivating'
    | 'Respectful'
    | 'Assertive'
    | 'Conversational',
  content: string,
  user: string,
) => {
  const prompt = createPrompt(topic, toneOfVoice, content);

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
