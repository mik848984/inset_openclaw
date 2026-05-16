import endent from 'endent';
import { ICompletionsUser } from '@/utils/llmStream';
import { tariffService } from '@/services/api/TariffService';
import { modelsService } from '@/services/api/ModelsService';
const baseSystemPrompt = endent`
  Ты — полезный ассистент.
  Внимательно следуй инструкциям в сообщении пользователя и отвечай по делу.
  Если явно не указано иное, отвечай по-русски.
`;


const createPrompt = (name: string, keyBenefitsFeatures: string) => {
  const data = (name: string, keyBenefitsFeatures: string) => {
    return endent`
      You are an expert at creating compelling & high converting descriptions for products.
      You know very well how to generate compelling & high converting descriptions for product listings. Generate a product description for ${name} which has the ${keyBenefitsFeatures} key benefits & features. 
      Do not include informations about console logs or print messages.
      Пиши на русском
    `;
  };

  if (name) {
    return data(name, keyBenefitsFeatures);
  }
};

export const OpenAIStream = async (
  name: string,
  keyBenefitsFeatures: string,
  user: string,
) => {
  const prompt = createPrompt(name, keyBenefitsFeatures);

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
