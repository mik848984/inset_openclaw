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


const createPrompt = (content: string) => {
  const data = (content: string) => {
    return endent`
      You are an expert content simplifier.
      You know very well how to summarize content. Generate an simpified version of ${content}. 
      The generated content must be in markdown format but not rendered, it must include all markdown characteristics.The title must be bold, and there should be a &nbsp; between every paragraph.
      Do not include informations about console logs or print messages.
      Пиши на русском
    `;
  };

  if (content) {
    return data(content);
  }
};

export const OpenAIStream = async (content: string, user: string) => {
  const prompt = createPrompt(content);

  const messages = [
    { role: 'system', content: baseSystemPrompt },
    { role: 'user', content: prompt },
  ];

  const model = 'openai/gpt-oss-120b';
  const onClose = async (usage: ICompletionsUser) => {
    await tariffService.updateUserBalance({
      userId: user,
      ...modelsService.getModelUsage(model, usage.total_tokens),
    });
  };

  return modelsService.llmRequest({
    model: 'gemini-2.5-flash-lite',
    stream: true,
    onClose,
    messages,
  });
};
