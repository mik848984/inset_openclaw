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


const createPrompt = (topic: string, paragraphs: number, essayType: string) => {
  const data = (topic: any, paragraphs: number, essayType: string) => {
    return endent`
      You are an expert formal essay writer and generator.
      You know very well all types of essays. Generate an formal ${essayType} essay about ${topic}, which has a number of ${paragraphs} paragraphs. 
      Do not include informations about console logs or print messages.
    `;
  };

  if (essayType) {
    return data(topic, paragraphs, essayType);
  }
};

export const OpenAIStream = async (
  topic: string,
  essayType: string,
  paragraphs: number,
  user: string,
) => {
  const model = 'openai/gpt-oss-120b';

  const prompt = createPrompt(topic, paragraphs, essayType);
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
