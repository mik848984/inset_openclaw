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
  content: string,
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
) => {
  const data = (
    content: string,
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
  ) => {
    return endent`
      You are an expert translator.
      You know very well all languages and to translate the content you receive. Translate in ${language} language the following content: ${content}.
      Do not include informations about console logs or print messages.
    `;
  };

  if (content) {
    return data(content, language);
  }
};

export const OpenAIStream = async (
  content: string,
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
  user: string,
) => {
  const prompt = createPrompt(content, language);

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
