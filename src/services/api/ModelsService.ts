import {
  getTextFromStream,
  ICompletionsUser,
  llmStream,
} from '@/utils/llmStream';
import { tariffService } from '@/services/api/TariffService';
import { loggerService } from '@/services/api/LoggerService';
import { isAdmin } from '@/utils/isAdmin';
import Subscription from '@/models/subscription';
import { IMessage } from '@/models/message';
import { IFile } from '@/models/file';

const TOGETHER_API_KEY = process.env.TOGETHER_API_KEY || '';
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';

interface ILLMRequest {
  youtube?: string;
  model: string;
  messages: any[];
  stream: boolean;
  webSearch?: boolean;
  onClose: (usage: ICompletionsUser) => void;
  textToLast?: string;
  files?: IFile[];
}

interface IImagesRequest {
  userMessages: IMessage[];
  user: any;
}

interface IMultiModalRequest {
  model: string;
  messages: any[];
  user: any;
  mode: 'chat' | 'images';
  webSearch: boolean;
  files: IFile[];
  youtube: string;
}

interface IsNotEnoughBalanceResultParams {
  model: string;
  user: any;
  mode: 'chat' | 'images';
}

interface WebSearchRequest {
  model: string;
  messages: any[];
  onClose: (usage: ICompletionsUser) => void;
  user: any;
}

interface ILLMFreeRequestParams {
  onClose: (usage: ICompletionsUser) => void;
  textToLast?: string;
  model: any;
  messages: any[];
  stream: boolean;
  webSearch?: boolean;
  files: IFile[];
  youtube: string;
}

const llmMap = {
  'mistral-large-latest': 'mistral-large',
  'mistral-small': 'mistral-small',
  'deepseek-ai/DeepSeek-V3': 'deepseek-v3',
  'o3-mini': 'o3-mini',
  'gpt-4o': 'gpt-4o',
  'gemini-2.0-flash': 'gemini-2.0-flash',
  'google/gemini-2.0-flash-thinking-exp-1219:free': 'gemini-2.0-flash-thinking',
  'google/gemini-2.0-flash-thinking-exp:free': 'gemini-2.0-flash-thinking',
  'gemini-2.5-flash': 'gemini-2.5-flash',
  'gemini-2.5-flash-lite': 'gemini-2.5-flash-lite',
  'gemini-2.5-pro': 'gemini-2.5-pro',
  'deepseek-ai/DeepSeek-R1': 'deepseek-r1',
  'meta-llama/Llama-3.3-70B-Instruct-Turbo': 'llama-3',
  'openai/gpt-oss-120b': 'gpt-oss-120b',
  'microsoft/phi-4': 'microsoft-phi-4',
  'deepseek-ai/DeepSeek-V3.2-Exp': 'deepseek-v3.2-exp',
};

const imagePrompt = `
Ты — Мастер Промптов, ИИ, специализированный на трансформации простых описаний изображений в детализированные, высококачественные промпты для генеративных моделей изображений (таких как Midjourney, DALL-E, Stable Diffusion и т.д.).

Твоя задача:
1.  Взять запрос пользователя на изображение, который будет предоставлен на русском языке.
2.  Перевести этот русский запрос точно на английский язык.
3.  ЗАТЕМ значительно УЛУЧШИ это английское описание. Улучшение должно сделать потенциальное сгенерированное изображение максимально качественным, детализированным и визуально впечатляющим.

Улучшение должно включать добавление деталей о:
*   **Художественный стиль:** (например, photorealistic, digital painting, concept art, cinematic, fantasy art, anime, watercolor, pixel art и т.п. – выбери наиболее подходящий или укажи несколько).
*   **Освещение и Атмосфера:** (например, golden hour, dramatic lighting, soft studio light, volumetric light, foggy, sunny, moody, vibrant и т.п.).
*   **Композиция и Ракурс:** (например, wide shot, close-up, low angle, high angle, macro, bokeh, symmetrical, rule of thirds и т.п.).
*   **Специфические детали:** Добавь конкретные детали об объектах, текстурах, материалах, окружающей среде, времени суток, погодных условиях, эмоциях и т.д., которые сделают сцену более живой и полной.
*   **Модификаторы качества:** Добавь технические термины и модификаторы, которые помогают моделям понять запрос на высокое качество (например, ultra detailed, 8k, 4k, masterpiece, trending on ArtStation, highly detailed, sharp focus, studio lighting, octane render, unreal engine, cinematic и т.п.).

Твоя цель — создать один итоговый, цельный промпт на английском языке, который максимизирует потенциал для визуально потрясающего и детализированного изображения без двусмысленности.

Представь итоговый улучшенный английский промпт ЧЕТКО и без лишних комментариев или вопросов после него, кроме подтверждения готовности к следующему запросу.

**Ключевой момент:** Сохраняй контекст предыдущих запросов. Если пользователь предоставляет обратную связь или просит доработок (например, "сделай свет мягче", "добавь деревьев на фон", "измени стиль на фэнтези"), применяй эти изменения к *последнему сгенерированному промпту* и генерируй новую, улучшенную версию, учитывающую правки.

Работай эффективно; предоставляй улучшенный промпт СРАЗУ после получения русского запроса или доработки. Не задавай уточняющих вопросов.
"
`;

const queryPrompt = `
**Твоя Роль:** Ты — специализированный ИИ-ассистент, чья главная задача — анализировать conversational context (контекст диалога) и переводить пользовательские запросы, содержащиеся в этом контексте, в оптимальные поисковые запросы для Google.

**Входные Данные:** Тебе будет предоставлена следующая информация: История сообщений который задал пользователь.

**Твоя Задача:**
1.  Проанализируй последнее сообщение, чтобы понять основную суть запроса пользователя.
2.  Используй историю для получения дополнительного контекста. История может:
    *   Уточнять термины, использованные в последнем сообщении.
    *   Указывать на тему или область, о которой шла речь ранее.
    *   Сужать или расширять сферу поиска.
    *   Содержать фоновую информацию, важную для формулирования точного запроса.
3.  На основе анализа последнего сообщения и истории сформулируй **один** максимально точный, релевантный и эффективный поисковый запрос для Google.

**Требования к Поисковому Запросу:**
*   Должен быть в формате обычной текстовой строки, готовой для ввода в поисковую строку Google.
*   Должен использовать ключевые слова, наиболее вероятно ведущие к нужной информации.
*   Не должен содержать вопросительных знаков в конце (хотя иногда Google их понимает, лучше обходиться без них для универсальности).
*   Должен быть достаточно конкретным, учитывая контекст из истории.
*   Не должен включать в себя разговорные фразы или комментарии ("Пожалуйста, найди мне информацию...", "Мне интересно знать...").

**Что НЕ нужно делать:**
*   Не отвечай на вопрос пользователя напрямую. Твоя задача — только предоставить поисковый запрос.
*   Не добавляй никаких вводных фраз, объяснений или комментариев перед самим запросом. Вывод должен быть *только* поисковым запросом.

**Формат Вывода:**
Только одна строка — сформулированный поисковый запрос.
`;

class ModelsService {
  models = [
    {
      url: 'https://api.mistral.ai',
      key: 'K8vCkDFwRcrLcQbpP5OFiy9EuQSrPbYO',
      model: 'mistral-large-latest',
      grade: 'premium',
      options: {},
      percent: 0.4,
    },
    {
      url: 'https://api.mistral.ai',
      key: 'K8vCkDFwRcrLcQbpP5OFiy9EuQSrPbYO',
      model: 'mistral-small',
      grade: 'base',
      options: {},
      percent: 0.4,
    },
    {
      url: 'https://api.together.xyz',
      model: 'deepseek-ai/DeepSeek-V3',
      key: TOGETHER_API_KEY,
      grade: 'premium',
      options: {},
      percent: 0.4,
    },
    {
      url: 'https://api.together.xyz',
      model: 'deepseek-ai/DeepSeek-R1',
      key: TOGETHER_API_KEY,
      grade: 'premium',
      options: {},
      percent: 0.4,
    },
    {
      url: 'https://api.together.xyz',
      model: 'meta-llama/Llama-3.3-70B-Instruct-Turbo',
      key: TOGETHER_API_KEY,
      grade: 'base',
      options: {},
      percent: 0.4,
    },
    {
      url: 'https://openrouter.ai/api',
      model: 'google/gemini-2.0-flash-thinking-exp-1219:free',
      key: OPENROUTER_API_KEY,
      grade: 'base',
      options: {},
      percent: 0,
    },
    {
      url: 'https://openrouter.ai/api',
      model: 'gemini-2.5-pro',
      key: OPENROUTER_API_KEY,
      grade: 'base',
      options: {},
      percent: 0,
    },
    {
      url: 'https://openrouter.ai/api',
      model: 'gemini-2.5-flash',
      key: OPENROUTER_API_KEY,
      grade: 'base',
      options: {},
      percent: 0,
    },
    {
      url: 'https://openrouter.ai/api',
      model: 'gemini-2.5-flash-lite',
      key: OPENROUTER_API_KEY,
      grade: 'base',
      options: {},
      percent: 0,
    },

    {
      url: 'https://api.deepinfra.com',
      model: 'openai/gpt-oss-120b',
      key: process.env.DEEPINFRA_API_KEY || '',
      grade: 'premium',
      options: {},
      percent: 0.4,
    },
    {
      url: 'https://api.deepinfra.com',
      model: 'microsoft/phi-4',
      key: process.env.DEEPINFRA_API_KEY || '',
      grade: 'premium',
      options: {},
      percent: 0.4,
    },
    {
      url: 'https://api.deepinfra.com',
      model: 'deepseek-ai/DeepSeek-V3.2-Exp',
      key: process.env.DEEPINFRA_API_KEY || '',
      grade: 'premium',
      options: {},
      percent: 0.4,
    },
  ];

  isNotEnoughBalanceResult({
    model,
    user,
    mode,
  }: IsNotEnoughBalanceResultParams) {
    if (isAdmin(user.email)) {
      return null;
    }

    if (mode === 'chat') {
      if (user.modelsBalance <= 0) return 'Ваш баланс для моделей исчерпан! 😞';
    }

    if (mode === 'images') {
      if (user.imageGenerationBalance <= 0)
        return 'Ваш баланс для Генерации изображений моделей исчерпан! 😞';
    }

    return null;
  }

  getModelUsage(model: string, tokens: number) {
    return { modelsBalance: -tokens };
  }

  getModel(modelName: string) {
    return (
      this.models.find((model) => model.model === modelName) || this.models[0]
    );
  }

  async llmFreeRequest({
    model,
    messages,
    onClose,
    textToLast,
    stream,
    webSearch,
    files,
    youtube,
  }: ILLMFreeRequestParams) {
    const freeModel = (llmMap as any)[model];

    console.log(freeModel);
    if (!freeModel) {
      return this.llmBaseRequest({
        model,
        messages,
        onClose,
        textToLast,
        stream,
        youtube: '',
        files: [],
      });
    }

    const abortController = new AbortController();

    const res = await fetch(`${process.env.MODELS_URI}/llm`, {
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
      body: JSON.stringify({
        model: freeModel,
        messages,
        webSearch,
        files,
        youtube,
      }),
      signal: abortController.signal,
    });

    return await llmStream(res, onClose, textToLast);
  }

  async llmBaseRequest({
    model,
    messages,
    onClose,
    textToLast,
    stream,
  }: ILLMRequest) {
    const foundModel = this.getModel(model)!;

    const abortController = new AbortController();
    const endpoint = foundModel.url.includes('deepinfra.com')
      ? `${foundModel.url}/v1/openai/chat/completions`
      : `${foundModel.url}/v1/chat/completions`;
    const res = await fetch(endpoint, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${foundModel.key}`,
      },
      method: 'POST',
      body: JSON.stringify({
        model,
        messages,
        stream,
        ...foundModel.options,
      }),
      signal: abortController.signal,
    });

    if (!stream) {
      const result = await res.json();

      onClose(result.usage);

      return result;
    }

    return await llmStream(res, onClose, textToLast);
  }

  async llmDeepinfraRequest({
    model,
    messages,
    onClose,
    textToLast,
    stream,
  }: ILLMRequest) {
    const abortController = new AbortController();

    const res = await fetch(`https://api.deepinfra.com/v1/openai/chat/completions`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.DEEPINFRA_API_KEY}`,
      },
      method: 'POST',
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages,
        stream,
      }),
      signal: abortController.signal,
    });

    if (!stream) {
      const result = await res.json();

      if (result.usage) {
        onClose(result.usage as ICompletionsUser);
      }

      return result;
    }

    return await llmStream(res, onClose, textToLast);
  }


  async llmRequest({
    model,
    messages,
    stream,
    onClose,
    textToLast,
    webSearch = false,
    files = [],
    youtube = '',
  }: ILLMRequest) {
    loggerService.log('info', `"Параметры запроса llmRequest`, {
      model,
      messages,
      stream,
      onClose,
      textToLast,
    });

    const foundModel = this.getModel(model)!;

    try {
      if (Math.random() < foundModel.percent) {
        loggerService.log({
          level: 'info',
          message: 'Запрос на платное API',
        });

        return await this.llmBaseRequest({
          model,
          messages,
          stream,
          onClose,
          textToLast,
          files,
          youtube,
        });
      }

      loggerService.log({
        level: 'info',
        message: 'Запрос на бесплатное API',
      });

      return await this.llmFreeRequest({
        model,
        messages,
        onClose,
        textToLast,
        stream,
        webSearch,
        files,
        youtube,
      });
    } catch (e: any) {
      loggerService.log({ level: 'error', message: e.message });

      loggerService.log({
        level: 'info',
        message: 'Запрос сломался! Повтор с платным API',
      });

      try {
        return await this.llmBaseRequest({
          model,
          messages,
          stream,
          onClose,
          textToLast,
          files: [],
          youtube: '',
        });
      } catch (e2: any) {
        loggerService.log({ level: 'error', message: e2.message });

        loggerService.log({
          level: 'info',
          message: 'Запрос сломался на платном API! Повтор с DeepInfra',
        });

        return await this.llmDeepinfraRequest({
          model,
          messages,
          stream,
          onClose,
          textToLast,
          files: [],
          youtube: '',
        });
      }
    }
  }

  async freeImageRequest(prompt: string) {
    const response = await fetch(`${process.env.MODELS_URI}/image`, {
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
      body: JSON.stringify({ prompt, model: 'flux' }),
    });

    return await response.json();
  }

  async getimgFallbackRequest(prompt: string) {
    const headers = {
      Accept: 'application/json',
      'Content-type': 'application/json',
      Authorization: `Bearer ${process.env.GETIMG_API_KEY}`,
    } as any;

    const payload = {
      prompt,
      width: 1024,
      height: 1024,
      steps: 4,
      output_format: 'jpeg',
      response_format: 'url',
    };

    const response = await fetch(
      'https://api.getimg.ai/v1/flux-schnell/text-to-image',
      {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      },
    );

    const data = await response.json();

    // Приводим ответ к формату { url: string }
    if ((data as any)?.url) {
      return data as any;
    }

    if ((data as any)?.image) {
      return { url: (data as any).image } as any;
    }

    if (Array.isArray((data as any)?.images) && (data as any).images[0]) {
      return { url: (data as any).images[0] } as any;
    }

    return data as any;
  }

  async deepinfraImageRequest(prompt: string) {
    const response = await fetch(
      'https://api.deepinfra.com/v1/openai/images/generations',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.DEEPINFRA_API_KEY}`,
        } as any,
        body: JSON.stringify({
          prompt,
          model: 'black-forest-labs/FLUX-1-dev',
          size: '1024x1024',
          n: 1,
        }),
      },
    );

    const result = (await response.json()) as any;

    const b64 =
      result?.data && Array.isArray(result.data) && result.data[0]?.b64_json
        ? result.data[0].b64_json
        : null;

    if (!b64) {
      throw new Error('No image returned from DeepInfra');
    }

    return {
      url: `data:image/png;base64,${b64}`,
    } as any;
  }


  async translatePrompt(userMessages: IMessage[], user: any) {
    const model = 'openai/gpt-oss-120b';

    const lastMessage = userMessages[userMessages.length - 1].content;

    if (
      modelsService.isNotEnoughBalanceResult({
        mode: 'chat',
        model,
        user,
      })
    ) {
      return lastMessage;
    }

    const onClose = async (usage: ICompletionsUser) => {
      await tariffService.updateUserBalance({
        userId: user.id,
        ...modelsService.getModelUsage(model, usage.total_tokens),
      });
    };

    const allMessagesConcat = userMessages.reduce(
      (acc, message) => acc + message.content,
      '',
    );

    console.log(this.isEnglishText(allMessagesConcat));

    if (!this.isEnglishText(allMessagesConcat)) {
      const stream = await this.llmRequest({
        model,
        textToLast: '',
        messages: [
          {
            role: 'system',
            content: imagePrompt,
          },
          ...userMessages,
        ],
        stream: true,
        onClose,
        youtube: '',
        files: [],
      });

      return await getTextFromStream(stream);
    }

    return lastMessage;
  }

  
  async getimgFallbackRequest(prompt: string) {
    const headers = {
      Accept: 'application/json',
      'Content-type': 'application/json',
      Authorization: `Bearer ${process.env.GETIMG_API_KEY || 'key-lKv5ayiXLxTvY2JRtR8GT2nltNFoCVac3cDQP3m6yoAEfxfJKtv9twj8Q3JlZdBvjnuQCiF07lm9MeVTV8t54SyNOZfUQKT'}`,
    };

    const payload = {
      prompt,
      width: 1024,
      height: 1024,
      steps: 4,
      output_format: 'jpeg',
      response_format: 'url',
    };

    const response = await fetch(
      'https://api.getimg.ai/v1/flux-schnell/text-to-image',
      {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      },
    );

    return await response.json();
  }

  async deepinfraImageRequest(prompt: string) {
    const response = await fetch(
      'https://api.deepinfra.com/v1/openai/images/generations',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${
            process.env.DEEPINFRA_API_KEY || 'UHHqxwr7uoNCRGcwBx0Jy9uz7k4tPYjG'
          }`,
        },
        body: JSON.stringify({
          prompt,
          model: 'black-forest-labs/FLUX-1-dev',
          size: '1024x1024',
          n: 1,
        }),
      },
    );

    const result = await response.json();

    if (result?.data?.[0]?.b64_json) {
      return {
        url: `data:image/png;base64,${result.data[0].b64_json}`,
      };
    }

    throw new Error('DeepInfra image generation failed');
  }

  async imageRequest({ userMessages, user }: IImagesRequest) {
    loggerService.logJSON({
      level: 'info',
      json: userMessages,
      message: 'Image Prompt',
    });

    const translatedPrompt = await this.translatePrompt(userMessages, user);

    console.log({ translatedPrompt });

    const useFluxDev = Math.random() < 0.2;

    if (useFluxDev) {
      try {
        return await this.deepinfraImageRequest(translatedPrompt);
      } catch (e) {
        console.log(e);
        loggerService.log({
          level: 'error',
          message: 'DeepInfra FLUX-1-dev для картинок сломался, пробуем стандартный пайплайн',
        });
      }
    }

    try {
      return await this.freeImageRequest(translatedPrompt);
    } catch (e1) {
      console.log(e1);

      loggerService.log({
        level: 'error',
        message: 'Бесплатная модель картинок сломалась, пробуем getimg.ai',
      });
    }

    try {
      return await this.getimgFallbackRequest(translatedPrompt);
    } catch (e2) {
      console.log(e2);

      loggerService.log({
        level: 'error',
        message: 'Fallback getimg.ai для картинок сломался, пробуем DeepInfra',
      });
    }

    return await this.deepinfraImageRequest(translatedPrompt);
  }

async transformMessagesToQuery({ userMessages, user }: IImagesRequest) {
    const model = 'openai/gpt-oss-120b';

    const lastMessage = userMessages[userMessages.length - 1].content;

    if (
      modelsService.isNotEnoughBalanceResult({
        mode: 'chat',
        model,
        user,
      })
    ) {
      return lastMessage;
    }

    const onClose = async (usage: ICompletionsUser) => {
      await tariffService.updateUserBalance({
        userId: user.id,
        ...modelsService.getModelUsage(model, usage.total_tokens),
      });
    };

    const stream = await this.llmRequest({
      model,
      textToLast: '',
      messages: [
        {
          role: 'system',
          content: queryPrompt,
        },
        ...userMessages,
      ],
      stream: true,
      onClose,
      youtube: '',
      files: [],
    });

    const rawQuery = await getTextFromStream(stream);

    // Чистим возможные размышления (<think>...</think>) и лишние строки,
    // чтобы в Serper улетал только сам поисковый запрос.
    const withoutThink = (rawQuery || '')
      .replace(/<think>[\s\S]*?<\/think>/gi, ' ')
      .trim();

    const lines = withoutThink
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l && !l.startsWith('*') && !l.startsWith('**'));

    const cleanedQuery = lines.length ? lines[lines.length - 1] : '';

    return cleanedQuery || lastMessage;
  }




  async webSearchRequest({ model, messages, onClose, user }: WebSearchRequest) {
    try {
      // Превращаем историю сообщений пользователя в аккуратный поисковый запрос.
      // Внутри transformMessagesToQuery дополнительно очищаем вывод от <think> и лишних строк.
      const userMessages = messages.filter((m) => m.role === 'user') as any[];

      const query =
        (await this.transformMessagesToQuery({
          userMessages,
          user,
        })) ||
        (userMessages.length
          ? (userMessages[userMessages.length - 1].content as string)
          : '');

      const serperApiKey = process.env.SERPER_API_KEY;

      if (!serperApiKey) {
        console.error(
          'SERPER_API_KEY is not set. Веб-поиск недоступен без API-ключа Serper.',
        );

        return 'Сервис веб-поиска временно недоступен. Пожалуйста, попробуйте позже.';
      }

      // 1. Поиск в Serper (google.serper.dev/search)
      const searchResponse = await fetch('https://google.serper.dev/search', {
        method: 'POST',
        headers: {
          'X-API-KEY': serperApiKey,
          'Content-Type': 'application/json',
        } as any,
        body: JSON.stringify({
          q: query,
          gl: 'ru',
          hl: 'ru',
          num: 15,
          autocorrect: true,
          type: 'search',
        }),
      });

      const searchJson: any = await searchResponse.json();
      const organic = ((searchJson && searchJson.organic) || []) as any[];

      const buildFallbackMessages = () => [
        {
          role: 'system',
          content:
            'Ты — ИИСеть. Ответь пользователю своими базовыми знаниями без интернета, если интернет-источников недостаточно. ' +
            'Отвечай на русском языке, структурировано и по делу. Если у тебя нет точных или свежих данных, честно скажи об этом.',
        },
        ...messages,
      ];

      // Если вообще нет результатов — честно говорим, что интернета не хватило, и отвечаем “офлайново”
      if (!organic.length) {
        const fallbackMessages = buildFallbackMessages();

        return await this.llmRequest({
          model,
          messages: fallbackMessages,
          stream: true,
          webSearch: false,
          onClose,
          youtube: '',
          files: [],
        });
      }

      // Фильтруем откровенно шумные домены
      const withoutSocial = organic.filter((item: any) => {
        const url = item.link || item.url;

        if (!url) return false;

        const lower = url.toLowerCase();

        if (
          lower.includes('facebook.com') ||
          lower.includes('vk.com') ||
          lower.includes('ok.ru') ||
          lower.includes('instagram.com') ||
          lower.includes('tiktok.com') ||
          lower.includes('youtube.com')
        ) {
          return false;
        }

        return true;
      });

      const baseList = withoutSocial.length ? withoutSocial : organic;

      const topResults = baseList.slice(
        0,
        Math.max(3, Math.min(5, baseList.length)),
      );

      // 2. Переход по ссылкам через Serper Webpages (scrape.serper.dev)
      const scrapedPages = await Promise.all(
        topResults.map(async (item: any) => {
          const url = item.link || item.url;

          if (!url) {
            return null;
          }

          try {
            const scrapeResponse = await fetch('https://scrape.serper.dev', {
              method: 'POST',
              headers: {
                'X-API-KEY': serperApiKey,
                'Content-Type': 'application/json',
              } as any,
              body: JSON.stringify({
                url,
              }),
            });

            const scrapeJson: any = await scrapeResponse.json();

            return {
              title: item.title,
              url,
              snippet: item.snippet,
              content:
                (scrapeJson && (scrapeJson.text || scrapeJson.content)) || '',
            };
          } catch (e) {
            console.error('Serper scrape error', e);

            return {
              title: item.title,
              url,
              snippet: item.snippet,
              content: '',
            };
          }
        }),
      );

      // Если scrape по какой-то причине не дал текста — всё равно используем сниппеты как источники
      const pagesFromScrape = scrapedPages.filter(Boolean) as {
        title: string;
        url: string;
        snippet?: string;
        content: string;
      }[];

      const docsToUse =
        pagesFromScrape.length > 0
          ? pagesFromScrape
          : topResults.map((item: any) => ({
              title: item.title,
              url: item.link || item.url,
              snippet: item.snippet,
              content: item.snippet || '',
            }));

      // 3. Формируем контекст для GPT-OSS
      const contextText = docsToUse
        .map((doc, index) => {
          const shortContent =
            (doc.content && doc.content.slice(0, 4000)) ||
            doc.snippet ||
            'Контент не удалось загрузить.';

          return [
            `Источник [${index + 1}]`,
            `URL: ${doc.url}`,
            doc.title ? `Заголовок: ${doc.title}` : '',
            doc.snippet ? `Сниппет: ${doc.snippet}` : '',
            '',
            shortContent,
          ]
            .filter(Boolean)
            .join('\n');
        })
        .join('\n\n-----------------------------\n\n');

      const lastUserMessage =
        messages.filter((m) => m.role === 'user').slice(-1)[0]?.content ||
        query;

      const now = new Date();
      const currentDate = now.toISOString().split('T')[0];

      const systemPrompt =
        'Ты — ИИСеть, умный ассистент с доступом к интернету. ' +
        'Текущая дата сервера: ' +
        currentDate +
        '. ' +
        'Отвечай на вопросы пользователя только на русском языке. ' +
        'Используй только факты из переданных ниже источников и не придумывай данные. ' +
        'Никогда не придумывай дату, температуру, скорость ветра или другие численные значения, если они явно не указаны в источниках. ' +
        'Если источники относятся к прошлым датам, обязательно укажи, что это данные по состоянию на эту дату и что они могут быть неактуальны. ' +
        'Если информации недостаточно, прямо скажи об этом и предложи пользователю свериться с профильным сервисом (например, погодным сайтом или новостями). ' +
        'В тексте ответа обязательно ссылайся на источники в формате [1], [2] и т.п. ' +
        'Не используй таблицы в ответе, кроме случаев, когда пользователь прямо просит оформить информацию в виде таблицы. ' +
        'Для списков мест, преимуществ, шагов и подобных вещей используй обычный текст с подзаголовками и маркированными/нумерованными списками. ' +
        'В конце ответа обязательно добавь раздел «Источники» со списком ссылок по формату: [1] Название — URL.';

      const answerMessages = [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: [
            `Запрос пользователя: "${lastUserMessage}"`,
            '',
            'Ниже приведены выдержки из найденных в интернете страниц. Используй их, чтобы ответить на запрос.',
            '',
            contextText,
          ].join('\n'),
        },
      ];

      // 4. Финальный ответ через GPT-OSS (Deepinfra)
      return await this.llmBaseRequest({
        model: 'openai/gpt-oss-120b',
        messages: answerMessages as any[],
        stream: true,
        onClose,
        textToLast: '',
      });
    } catch (e: any) {
      console.error('webSearchRequest error', e);

      return 'Во время веб-поиска произошла ошибка. Пожалуйста, попробуйте ещё раз позже.';
    }
  }

  isEnglishText(text: string) {
    const cleanedText = text.replace(/[^a-zA-Z]/g, '');
    const totalChars = text.length;
    const englishChars = cleanedText.length;

    if (totalChars === 0) {
      return false; // Текст пустой
    }

    const percentage = (englishChars / totalChars) * 100;

    return percentage > 70;
  }

  async multiModalRequest({
    model,
    messages,
    user,
    mode,
    webSearch,
    files,
    youtube,
  }: IMultiModalRequest) {
    const effectiveModel = webSearch ? 'openai/gpt-oss-120b' : model;

    const isNotEnoughBalance = modelsService.isNotEnoughBalanceResult({
      mode,
      model: effectiveModel,
      user,
    });
    if (isNotEnoughBalance) return isNotEnoughBalance;

    if (mode === 'images') {
      const responseGenerateImage = await this.imageRequest({
        userMessages: messages.filter((message) => message.role === 'user'),
        user,
      });

      await tariffService.updateUserBalance({
        userId: user.id,
        imageGenerationBalance: -1,
      });

      return `![image](${responseGenerateImage.url})`;
    }

    const onClose = async (usage: ICompletionsUser) => {
      await tariffService.updateUserBalance({
        userId: user.id,
        ...modelsService.getModelUsage(effectiveModel, usage.total_tokens),
      });
    };

    if (webSearch) {
      let hasActiveSubscription = false;

      if (isAdmin(user.email)) {
        hasActiveSubscription = true;
      } else {
        const subscription = await Subscription.findOne({
          user: user.id,
          status: 'active',
        });

        hasActiveSubscription = Boolean(subscription);
      }

      if (!hasActiveSubscription) {
        const availableWebSearchBalance = user.webSearchBalance ?? 0;

        if (availableWebSearchBalance <= 0) {
          return '__WEB_SEARCH_FREE_LIMIT__';
        }
      }

      const webSearchResponse = await this.webSearchRequest({
        model: effectiveModel,
        messages,
        onClose,
        user,
      });

      if (!hasActiveSubscription) {
        await tariffService.updateUserBalance({
          userId: user.id,
          webSearchBalance: -1,
        });

        user.webSearchBalance = Math.max(
          0,
          (user.webSearchBalance || 0) - 1,
        );
      }

      return webSearchResponse;
    }

    return await this.llmRequest({
      model: effectiveModel,
      messages: [
        {
          role: 'system',
          content:
            'Ты ИИСеть, ты должна помогать пользователям с их разными вопросами! Пиши на русском! Старайся красиво и удобно выводить ответ пользователю!',
        },
        ...messages,
      ],
      stream: true,
      files,
      youtube,
      onClose,
    });
  }
}

export const modelsService = new ModelsService();
