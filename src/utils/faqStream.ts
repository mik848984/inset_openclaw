import endent from 'endent';
import { ICompletionsUser } from '@/utils/llmStream';
import { tariffService } from '@/services/api/TariffService';
import { modelsService } from '@/services/api/ModelsService';
const baseSystemPrompt = endent`
  Ты — полезный ассистент.
  Внимательно следуй инструкциям в сообщении пользователя и отвечай по делу.
  Если явно не указано иное, отвечай по-русски.
`;


const createPrompt = (topic: string, productType: string) => {
  const data = (topic: string, productType: string) => {
    return endent`
      You are an expert at creating content for a product's Frequently asked questions.
      You know very well how to generate content for a product's Frequently asked questions. Generate some Frequently asked questions content for the following: ${topic} topic, and ${productType} product type. 
      Do not include informations about console logs or print messages.
      
      Пиши на русском
    `;
  };

  if (topic) {
    return data(topic, productType);
  }
};

export const OpenAIStream = async (
  topic: string,
  productType: string,
  user: string,
) => {
  const prompt = createPrompt(topic, productType);

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
