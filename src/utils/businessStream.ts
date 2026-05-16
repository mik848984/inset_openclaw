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
  topic:
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
  productType: '' | 'Physical' | 'Digital' | 'Service',
  budget:
    | ''
    | 'Under $500'
    | '$500-$1000'
    | '$1000-$5000'
    | '$5000-$20,000'
    | '$20,000+',
) => {
  const data = (
    topic:
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
    productType: '' | 'Physical' | 'Digital' | 'Service',
    budget:
      | ''
      | 'Under $500'
      | '$500-$1000'
      | '$1000-$5000'
      | '$5000-$20,000'
      | '$20,000+',
  ) => {
    return endent`
    You are an expert at generating great business ideas.
    You know very well how to generate great business ideas. Generate a business idea for a ${productType} product, with a budget of ${budget}, for the ${topic} topic.
    Do not include informations about console logs or print messages.
    Пиши на русском
    `;
  };

  if (topic) {
    return data(topic, productType, budget);
  }
};

export const OpenAIStream = async (
  topic:
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
  productType: '' | 'Physical' | 'Digital' | 'Service',
  budget:
    | ''
    | 'Under $500'
    | '$500-$1000'
    | '$1000-$5000'
    | '$5000-$20,000'
    | '$20,000+',
  user: string,
) => {
  const prompt = createPrompt(topic, productType, budget);

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
