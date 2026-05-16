import {
  ChatCompletionMessageParam,
  ChatCompletionTool,
} from 'openai/resources';
import OpenAI from 'openai';

const client = new OpenAI({
  baseURL: 'https://api.deepinfra.com/v1/openai',
  apiKey: 'UHHqxwr7uoNCRGcwBx0Jy9uz7k4tPYjG',
});

function dictionaryToToolProperty(
  type: string,
  prefix: string,
  dictionaries: { id: string; name: string }[],
) {
  return {
    type,
    description: `${prefix}. Possible values, write one of them: ${dictionaries.map((dictionary) => dictionary.id).join(',')}. Detailed information about the values: ${dictionaries.map((dictionary) => `${dictionary.id} - ${dictionary.name}`).join(',')}. If you can't get the information you need, just specify N/A`,
  };
}

class LLMStructureGenerator {
  async generateQueryTags(initialRequest: string) {
    const tools: ChatCompletionTool[] = [
      {
        type: 'function',
        function: {
          name: 'get_queries',
          description:
            'Provides a ready-made queries to search for a resume based on the submitted resume criteria',
          parameters: {
            type: 'object',
            properties: {
              queries: {
                type: 'array',
                description:
                  'A 4-6 queries with words describing a position, resume, basic technologies, and so on',
              },
            },
            required: ['queries'],
          },
        },
      },
    ];

    const messages: ChatCompletionMessageParam[] = [
      {
        role: 'user',
        content: `Дай query запросы для поиска поиска резюме по переданным критериям к кандидату,
        выдели технологии, навыки, но не выделяй специфические вещи, такие как опыт работы, образование, сгенерируй простой запрос для поиска кандидата.
        Чтобы можно было найти как можно больше резюме, косвено касающиеся к вакансии.
        Сгенерируй от 4 до 6 query запросов.
        Упрости максимально суть, до 2-3 слов.
        Выдели основную суть:

        Примеры:

          1. Критерий - кандидат должен иметь от 3 лет опыта работы, какое-нибудь техническое образование и навыки работы с golang и gin, должен понимать архитектуру высоконагруженных приложений, то есть, иметь опыт с ними.
             Ответ - golang gin разработчик, golang разработчик, go разработчик

          2. Критерий - кандидат должен иметь от 3 лет опыта работы, какое-нибудь техническое образование и навыки работы с next js и react, иметь опыт в бансковской сфере.
             Ответ - next js, react разработчик, next js, react, next js developer

          2. Критерий - Водитель, спокоен, клиентоориентирован, имел опыт ввождения дорогих автомобилей, имеет опыт телохранителя, занимался рукопашным боем, спортивного телосложения
             Ответ - Водитель, телохарнитель, Водитель телохранитель
        
        Приоритетно пиши их на русском, но если считаешь, что релеватнее что-то написать на англйиском - напиши.
        
       
        Критерии: ${initialRequest}
        
        Обязательно используй tools!
        `,
      },
    ];

    const response = await client.chat.completions.create({
      model: 'google/gemma-3-27b-it',
      messages,
      tools,
      tool_choice: 'required',
    });

    console.log(response.choices[0].message);

    const tool_calls = response.choices[0].message.tool_calls!;
    console.log(tool_calls);

    return JSON.parse(tool_calls[0].function.arguments).queries;
  }

  async getSearchParams(initQuery: string) {
    const experience = [
      { id: 'noExperience', name: 'Нет опыта' },
      { id: 'between1And3', name: 'От 1 года до 3 лет' },
      { id: 'between3And6', name: 'От 3 до 6 лет' },
      { id: 'moreThan6', name: 'Более 6 лет' },
    ];

    const tools: ChatCompletionTool[] = [
      {
        type: 'function',
        function: {
          name: 'get_params_for_search',
          description: 'Gives the parameters for the job search',
          parameters: {
            type: 'object',
            properties: {
              experience: dictionaryToToolProperty(
                'string',
                "Candidate's Experience Parameter, If work experience is not specified, or in your opinion, skills are more important here than work experience, write N/A! It's veru Important:",
                [
                  ...experience,
                  {
                    id: 'N/A',
                    name: 'Не указан или не важен для этой вакансии',
                  },
                ],
              ),
              salary_from: dictionaryToToolProperty(
                'number',
                "The candidate's lower salary for the candidate (Must be 20% lower than in the vacancy) :",
                [],
              ),
              salary_to: dictionaryToToolProperty(
                'number',
                "The candidate's top salary for the candidate (Must be 20% higher than in the vacancy) :",
                [],
              ),
            },
            required: ['experience', 'salary_from', 'salary_to'],
          },
        },
      },
    ];

    const client = new OpenAI({
      baseURL: 'https://api.deepinfra.com/v1/openai',
      apiKey: 'UHHqxwr7uoNCRGcwBx0Jy9uz7k4tPYjG',
    });

    const messages: ChatCompletionMessageParam[] = [
      {
        role: 'user',
        content: `Вакансия: ${initQuery}\n Вытащи из вакансии параметры для поиска кандидатов. Обязательно используй tools!`,
      },
    ];

    const response = await client.chat.completions.create({
      model: 'google/gemma-3-27b-it',
      messages,
      tools,
      tool_choice: 'required',
    });

    console.log(response.choices[0].message);
    const tool_calls = response.choices[0].message.tool_calls!;

    console.log(tool_calls);

    return JSON.parse(tool_calls[0].function.arguments);
  }
}

export const llmStructureGenerator = new LLMStructureGenerator();
