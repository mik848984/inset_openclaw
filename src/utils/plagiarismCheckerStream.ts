import endent from 'endent';
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
    You are an expert content plagiarism checker in all languages.
    You know very well what plagiarism of a content is. You know very well if a content is plagiarism-free or not. You will check all sources to verify if the given sentence or content is plagiarized or plagiarism-free. Is the following content: ${content}, plagiarism-free? Reply with "Your content is plagiarized!" if the content is plagiarized, and explain why and from where. Reply with "Your content is plagiarism-free!" if the content is plagiarism-free, and explain why.
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
