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
  keywords: string,
  industry:
    | ''
    | 'Art and Entertainment'
    | 'Business Equipment and Supplies'
    | 'Clothing and Accessories'
    | 'Food and Drink'
    | 'Hardware and Automotive'
    | 'Health and Beauty'
    | 'Home and Garden'
    | 'Internet and Technology'
    | 'Pet supplies'
    | 'Sports and Recreation'
    | 'Toys and Games'
    | 'Travel & Hospitality',
) => {
  const data = (
    keywords: string,
    industry:
      | ''
      | 'Art and Entertainment'
      | 'Business Equipment and Supplies'
      | 'Clothing and Accessories'
      | 'Food and Drink'
      | 'Hardware and Automotive'
      | 'Health and Beauty'
      | 'Home and Garden'
      | 'Internet and Technology'
      | 'Pet supplies'
      | 'Sports and Recreation'
      | 'Toys and Games'
      | 'Travel & Hospitality',
  ) => {
    return endent`
      You are an expert at generating great domain names.
      You know very well how to generate a domain name. Generate 10 domain names for a ${industry} business industry based on the following keywords: ${keywords}.
      Do not include informations about console logs or print messages.
      Пиши на русском.
    `;
  };

  if (keywords) {
    return data(keywords, industry);
  }
};

export const OpenAIStream = async (
  keywords: string,
  industry:
    | ''
    | 'Art and Entertainment'
    | 'Business Equipment and Supplies'
    | 'Clothing and Accessories'
    | 'Food and Drink'
    | 'Hardware and Automotive'
    | 'Health and Beauty'
    | 'Home and Garden'
    | 'Internet and Technology'
    | 'Pet supplies'
    | 'Sports and Recreation'
    | 'Toys and Games'
    | 'Travel & Hospitality',
  user: string,
) => {
  const prompt = createPrompt(keywords, industry);

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
