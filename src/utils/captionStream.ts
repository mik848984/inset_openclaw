import endent from 'endent';
import {
  createParser,
  ParsedEvent,
  ReconnectInterval,
} from 'eventsource-parser';
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
  description: string,
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
    description: string,
  ) => {
    return endent`
    You are an expert at creating compelling & high converting Instagram Captions & Descriptions.
    You know very well how to generate compelling & high converting Instagram Captions & Descriptions. Generate a Instagram Caption based on: ${description} description, make it for the following topic: ${topic},  and with a ${toneOfVoice} tone of voice.
    Do not include informations about console logs or print messages.
    Пиши на русском
    `;
  };

  if (topic) {
    return data(topic, toneOfVoice, description);
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
  description: string,
  user: string,
) => {
  const prompt = createPrompt(topic, toneOfVoice, description);

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
