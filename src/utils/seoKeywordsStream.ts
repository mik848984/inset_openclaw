import endent from 'endent';
import {
  createParser,
  ParsedEvent,
  ReconnectInterval,
} from 'eventsource-parser';
import { modelsService } from '@/services/api/ModelsService';
const baseSystemPrompt = endent`
  Ты — полезный ассистент.
  Внимательно следуй инструкциям в сообщении пользователя и отвечай по делу.
  Если явно не указано иное, отвечай по-русски.
`;

import { ICompletionsUser } from '@/utils/llmStream';
import { tariffService } from '@/services/api/TariffService';

const createPrompt = (name: string, topics: string) => {
  const data = (name: string, topics: string) => {
    return endent`
     You are an expert at generating SEO Friendly keywords lists.
      You know very well how to generate compelling & high converting SEO Friendly Keywords lists. Generate a list of 30+ SEO keywords based on ${name} product name, and the following topics: ${topics}. 
      The keywords must be in markdown format but not rendered, it must include all markdown characteristics, and it should be separated only by a comma. The title must be bold.
      Do not include informations about console logs or print messages.
    `;
  };

  if (name) {
    return data(name, topics);
  }
};

export const OpenAIStream = async (
  name: string,
  topics: string,
  user: string,
) => {
  const model = 'openai/gpt-oss-120b';
  const onClose = async (usage: ICompletionsUser) => {
    await tariffService.updateUserBalance({
      userId: user,
      ...modelsService.getModelUsage(model, usage.total_tokens),
    });
  };

  const prompt = createPrompt(name, topics);
  const messages = [
    { role: 'system', content: baseSystemPrompt },
    { role: 'user', content: prompt },
  ];

  return modelsService.llmRequest({
    model: 'gemini-2.5-flash-lite',
    stream: true,
    onClose,
    messages,
  });
};
