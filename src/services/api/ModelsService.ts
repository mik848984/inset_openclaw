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
  'deepseek-ai/DeepSeek-V4-Pro': 'deepseek-v4-pro',
  'Qwen/Qwen3.6-35B-A3B': 'qwen3.6-35b-a3b',
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
    {
      url: 'https://api.deepinfra.com',
      model: 'deepseek-ai/DeepSeek-V4-Pro',
      key: process.env.DEEPINFRA_API_KEY || '',
      grade: 'premium',
      options: {},
      percent: 0.4,
    },
    {
      url: 'https://api.deepinfra.com',
      model: 'Qwen/Qwen3.6-35B-A3B',
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
      console.log('[CHAT-LLM] llmFreeRequest fallback_to_base (no freeModel)');
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
    const endpoint = `${process.env.MODELS_URI}/llm`;
    const host = (() => {
      try {
        return new URL(endpoint).host;
      } catch {
        return 'unknown';
      }
    })();
    const tStart =
      typeof performance !== 'undefined' ? performance.now() : Date.now();

    console.log(`[CHAT-LLM] llmFreeRequest start host=${host} model=${model}`);

    const res = await fetch(endpoint, {
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

    const dt = Math.round(
      (typeof performance !== 'undefined' ? performance.now() : Date.now()) -
        tStart,
    );
    console.log(
      `[CHAT-LLM] llmFreeRequest response_headers host=${host} status=${res.status} dt=${dt}ms`,
    );

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

    const host = (() => {
      try {
        return new URL(endpoint).host;
      } catch {
        return 'unknown';
      }
    })();
    const tStart =
      typeof performance !== 'undefined' ? performance.now() : Date.now();

    console.log(
      `[CHAT-LLM] llmBaseRequest start host=${host} model=${model} stream=${stream}`,
    );

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

    const dt = Math.round(
      (typeof performance !== 'undefined' ? performance.now() : Date.now()) -
        tStart,
    );
    console.log(
      `[CHAT-LLM] llmBaseRequest response_headers host=${host} status=${res.status} dt=${dt}ms`,
    );

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
    const endpoint = 'https://api.deepinfra.com/v1/openai/chat/completions';
    const host = 'api.deepinfra.com';
    const tStart =
      typeof performance !== 'undefined' ? performance.now() : Date.now();

    console.log(
      `[CHAT-LLM] llmDeepinfraRequest start host=${host} model=${model} stream=${stream}`,
    );

    const res = await fetch(endpoint, {
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

    const dt = Math.round(
      (typeof performance !== 'undefined' ? performance.now() : Date.now()) -
        tStart,
    );
    console.log(
      `[CHAT-LLM] llmDeepinfraRequest response_headers host=${host} status=${res.status} dt=${dt}ms`,
    );

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

    const tRequest =
      typeof performance !== 'undefined' ? performance.now() : Date.now();
    const reqDt = () =>
      Math.round(
        (typeof performance !== 'undefined' ? performance.now() : Date.now()) -
          tRequest,
      );
    console.log(
      `[CHAT-LLM] llmRequest start model=${model} stream=${stream} webSearch=${webSearch}`,
    );

    const foundModel = this.getModel(model)!;

    try {
      if (Math.random() < foundModel.percent) {
        loggerService.log({
          level: 'info',
          message: 'Запрос на платное API',
        });
        console.log(`[CHAT-LLM] route_selected route=base model=${model}`);

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
      console.log(`[CHAT-LLM] route_selected route=free model=${model}`);

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
      console.log(
        `[CHAT-LLM] fallback_triggered from=free to=base dt_before_fallback=${reqDt()}ms error=${e.message}`,
      );

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
        console.log(
          `[CHAT-LLM] fallback_triggered from=base to=deepinfra dt_before_fallback=${reqDt()}ms error=${e2.message}`,
        );

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
    const tWs =
      typeof performance !== 'undefined' ? performance.now() : Date.now();
    const wsDt = () =>
      Math.round(
        (typeof performance !== 'undefined' ? performance.now() : Date.now()) -
          tWs,
      );
    console.log('[CHAT-WS] webSearchRequest start');

    try {
      // Превращаем историю сообщений пользователя в аккуратный поисковый запрос.
      // Внутри transformMessagesToQuery дополнительно очищаем вывод от <think> и лишних строк.
      const userMessages = messages.filter((m) => m.role === 'user') as any[];

      const tQuery =
        typeof performance !== 'undefined' ? performance.now() : Date.now();
      const query =
        (await this.transformMessagesToQuery({
          userMessages,
          user,
        })) ||
        (userMessages.length
          ? (userMessages[userMessages.length - 1].content as string)
          : '');
      console.log(
        `[CHAT-WS] transformMessagesToQuery_done dt=${Math.round(
          (typeof performance !== 'undefined'
            ? performance.now()
            : Date.now()) - tQuery,
        )}ms`,
      );

      const serperApiKey = process.env.SERPER_API_KEY;

      if (!serperApiKey) {
        console.error(
          'SERPER_API_KEY is not set. Веб-поиск недоступен без API-ключа Serper.',
        );

        return 'Сервис веб-поиска временно недоступен. Пожалуйста, попробуйте позже.';
      }

      const serperHeaders = {
        'X-API-KEY': serperApiKey,
        'Content-Type': 'application/json',
      } as any;

      // fetch with hard timeout — Serper sometimes hangs on slow targets,
      // and we never want web-search to block the whole answer indefinitely.
      const fetchWithTimeout = async (
        input: string,
        init: RequestInit,
        timeoutMs: number,
      ): Promise<Response> => {
        const ctrl = new AbortController();
        const timer = setTimeout(() => ctrl.abort(), timeoutMs);
        try {
          return await fetch(input, { ...init, signal: ctrl.signal });
        } finally {
          clearTimeout(timer);
        }
      };

      // JSON-обёртка над fetchWithTimeout — для Serper endpoint'ов.
      // Возвращает {} при сбое/невалидном JSON, чтобы не валить пайплайн.
      const fetchJsonWithTimeout = async (
        url: string,
        body: any,
        timeoutMs: number,
      ): Promise<any> => {
        try {
          const r = await fetchWithTimeout(
            url,
            {
              method: 'POST',
              headers: serperHeaders,
              body: JSON.stringify(body),
            },
            timeoutMs,
          );
          return await r.json();
        } catch (e) {
          console.error('[CHAT-WS] serper endpoint failed', url, e);
          return {};
        }
      };

      // 1. Early intent — нужен ДО fan-out, чтобы решить, какие специальные
      //    endpoint'ы Serper дёргать параллельно с базовым /search.
      const earlyLastUserText =
        (userMessages[userMessages.length - 1]?.content as string) || '';
      const earlyIntentText = `${query} ${earlyLastUserText}`.toLowerCase();
      const hasAny = (t: string, ...needles: string[]) =>
        needles.some((n) => t.includes(n));

      const wantImages =
        hasAny(
          earlyIntentText,
          'фото',
          'картинки',
          'изображения',
          'как выглядит',
          'дизайн',
          'пример интерфейса',
          'логотип',
          'интерьер',
        ) || true; // images always — дешевле, чем гадать
      const wantNews = hasAny(
        earlyIntentText,
        'новости',
        'что нового',
        'последние',
        'сегодня',
        'за неделю',
        'свежие данные',
        'что произошло',
        'случилось',
        'анонсировали',
        'breaking',
      );
      const wantPlaces = hasAny(
        earlyIntentText,
        'куда сходить',
        'рядом',
        'ресторан',
        'кафе',
        'кофейня',
        'торговый центр',
        'магазин',
        'на карте',
        'адрес ',
      );
      const wantShopping = hasAny(
        earlyIntentText,
        'купить',
        'цена',
        'стоимость',
        'лучшие',
        'выбрать',
        'обзор',
        'скидка',
        'наушники',
        'ноутбук',
        'кроссовки',
        'парфюм',
      );
      const wantScholar = hasAny(
        earlyIntentText,
        'исследование',
        ' paper ',
        'статья научная',
        'arxiv',
        ' doi ',
        'метаанализ',
        'benchmark paper',
        'scholar',
      );
      const wantVideos = hasAny(
        earlyIntentText,
        'видео',
        'youtube',
        'обзор видео',
        'туториал',
        'как настроить',
      );

      // 2. Параллельный fan-out: текстовый поиск + (по интенту) специальные
      //    endpoint'ы Serper. Сбой одного endpoint'а не валит web-search.
      const tSerper =
        typeof performance !== 'undefined' ? performance.now() : Date.now();

      const commonBody = {
        q: query,
        gl: 'ru',
        hl: 'ru',
        autocorrect: true,
      };

      const tasks: Array<{
        key:
          | 'search'
          | 'images'
          | 'news'
          | 'places'
          | 'shopping'
          | 'scholar'
          | 'videos';
        promise: Promise<any>;
      }> = [];

      tasks.push({
        key: 'search',
        promise: fetchJsonWithTimeout(
          'https://google.serper.dev/search',
          { ...commonBody, num: 15, type: 'search' },
          9000,
        ),
      });

      if (wantImages) {
        tasks.push({
          key: 'images',
          promise: fetchJsonWithTimeout(
            'https://google.serper.dev/images',
            { ...commonBody, num: 12 },
            7000,
          ),
        });
      }
      if (wantNews) {
        tasks.push({
          key: 'news',
          promise: fetchJsonWithTimeout(
            'https://google.serper.dev/news',
            { ...commonBody, num: 12 },
            7000,
          ),
        });
      }
      if (wantPlaces) {
        tasks.push({
          key: 'places',
          promise: fetchJsonWithTimeout(
            'https://google.serper.dev/places',
            { ...commonBody, num: 10 },
            7000,
          ),
        });
      }
      if (wantShopping) {
        tasks.push({
          key: 'shopping',
          promise: fetchJsonWithTimeout(
            'https://google.serper.dev/shopping',
            { ...commonBody, num: 12 },
            7000,
          ),
        });
      }
      if (wantScholar) {
        tasks.push({
          key: 'scholar',
          promise: fetchJsonWithTimeout(
            'https://google.serper.dev/scholar',
            { ...commonBody, num: 10 },
            8000,
          ),
        });
      }
      if (wantVideos) {
        tasks.push({
          key: 'videos',
          promise: fetchJsonWithTimeout(
            'https://google.serper.dev/videos',
            { ...commonBody, num: 10 },
            7000,
          ),
        });
      }

      const settled = await Promise.allSettled(tasks.map((t) => t.promise));
      const byKey: Record<string, any> = {};
      tasks.forEach((t, i) => {
        const s = settled[i];
        byKey[t.key] = s.status === 'fulfilled' ? s.value : {};
      });

      const searchJson: any = byKey.search || {};
      const imagesJson: any = byKey.images || {};
      const newsJson: any = byKey.news || {};
      const placesJson: any = byKey.places || {};
      const shoppingJson: any = byKey.shopping || {};
      const scholarJson: any = byKey.scholar || {};
      const videosJson: any = byKey.videos || {};

      const organic = ((searchJson && searchJson.organic) || []) as any[];
      const serperImages = ((imagesJson && imagesJson.images) || []) as any[];
      const relatedSearches = ((searchJson && searchJson.relatedSearches) ||
        []) as any[];
      const knowledgeGraphRaw =
        (searchJson && searchJson.knowledgeGraph) || null;
      const peopleAlsoAskRaw = ((searchJson &&
        (searchJson.peopleAlsoAsk || searchJson.peopleAlsoAskBlock)) ||
        []) as any[];
      const newsRaw = ((newsJson && newsJson.news) || []) as any[];
      const placesRaw = ((placesJson && placesJson.places) || []) as any[];
      const shoppingRaw = ((shoppingJson && shoppingJson.shopping) ||
        []) as any[];
      // Serper /scholar отдаёт результаты обычно под organic; на всякий
      // случай поддерживаем и shape { scholar: [...] }.
      const scholarRaw = (((scholarJson && scholarJson.organic) ||
        (scholarJson && scholarJson.scholar) ||
        []) as any[]);
      const videosRaw = ((videosJson && videosJson.videos) || []) as any[];

      console.log(
        `[CHAT-WS] serper_fanout_done dt=${Math.round(
          (typeof performance !== 'undefined'
            ? performance.now()
            : Date.now()) - tSerper,
        )}ms organic=${organic.length} images=${
          serperImages.length
        } related=${relatedSearches.length} news=${newsRaw.length} places=${
          placesRaw.length
        } shopping=${shoppingRaw.length} scholar=${
          scholarRaw.length
        } videos=${videosRaw.length} kg=${!!knowledgeGraphRaw} paa=${
          peopleAlsoAskRaw.length
        }`,
      );

      // Дедуп серперовских organic-результатов по link/url. Используется
      // ниже для sourcesPayload / newsTimelinePayload / topResultsForScrape.
      // (Прод-хотфикс — без него ReferenceError на запросе с web search.)
      const dedupedOrganic = Array.from(
        new Map(
          (organic as any[])
            .filter((item: any) => item && (item.link || item.url))
            .map((item: any) => [item.link || item.url, item]),
        ).values(),
      );

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

      // 2. Lightweight prep: lastUserMessage + сейчас даты нужны для intent
      //    detection и summary.generatedAt. Тяжёлый scrape + LLM вызов
      //    перенесены ВНУТРЬ ReadableStream.start(), чтобы клиент получил
      //    metadata marker сразу после Serper fan-out, а не после scrape.
      const lastUserMessage =
        messages.filter((m) => m.role === 'user').slice(-1)[0]?.content ||
        query;

      const now = new Date();
      const currentDate = now.toISOString().split('T')[0];

      // ── Build structured search metadata for Perplexity-like UI ──
      //   * sources       — карточки источников
      //   * images        — визуальные материалы (image strip)
      //   * followUps     — chips «Можно уточнить»
      const safeDomain = (url: string) => {
        try {
          return new URL(url).hostname.replace(/^www\./, '');
        } catch {
          return '';
        }
      };

      // Sources собираем из dedupedOrganic (до scrape), потому что для
      // UI-карточек нам достаточно title/url/snippet/domain. Это позволяет
      // отдать metadata marker клиенту до того, как scrape завершится.
      const sourcesPayload = (dedupedOrganic as any[])
        .slice(0, 6)
        .map((item: any, i: number) => {
          const url = item.link || item.url || '';
          if (!url) return null;
          return {
            title: item.title || safeDomain(url) || url,
            url,
            domain: safeDomain(url),
            snippet:
              typeof item.snippet === 'string' && item.snippet.length > 0
                ? item.snippet.slice(0, 240)
                : '',
            index: i + 1,
          };
        })
        .filter((s: any): s is any => !!s);

      // Дедупликация по imageUrl, фильтр пустых картинок, ограничение 6.
      const seenImageUrls = new Set<string>();
      const imagesPayload = (serperImages as any[])
        .map((img: any) => {
          const imageUrl = img.imageUrl || img.image || '';
          const sourceUrl = img.link || img.source || '';
          if (!imageUrl) return null;
          if (seenImageUrls.has(imageUrl)) return null;
          seenImageUrls.add(imageUrl);
          return {
            title:
              typeof img.title === 'string' ? img.title.slice(0, 120) : '',
            imageUrl,
            sourceUrl,
            domain: safeDomain(sourceUrl),
          };
        })
        .filter(Boolean)
        .slice(0, 6);

      // ── v3 widgets: intent detection ─────────────────────────────
      // Rule-based intent — нужен для прайорити-логики follow-ups и
      // для подсветки виджетов в UI (label "Новости/Покупки/..." и т.д.).
      const intentSources = [
        typeof query === 'string' ? query : '',
        typeof lastUserMessage === 'string' ? lastUserMessage : '',
      ]
        .join(' ')
        .toLowerCase();

      type DetectedIntent =
        | 'general'
        | 'news'
        | 'comparison'
        | 'code'
        | 'weather'
        | 'places'
        | 'shopping'
        | 'image'
        | 'video'
        | 'scholar';

      const detectIntent = (text: string): DetectedIntent => {
        const t = text || '';
        const has = (...needles: string[]) =>
          needles.some((n) => t.includes(n));

        if (
          has(
            'сравни',
            ' vs ',
            ' versus ',
            'против',
            'что лучше',
            'отличия',
            'разница между',
            'compare ',
          )
        ) {
          return 'comparison';
        }
        if (
          has(
            'новости',
            'что нового',
            'последние',
            'сегодня',
            'за неделю',
            'свежие данные',
            'что произошло',
            'случилось',
            'анонсировали',
            'breaking',
          )
        ) {
          return 'news';
        }
        if (
          has(
            'погода',
            'температура',
            'дождь',
            'ветер',
            'что надеть',
            'weather ',
          )
        ) {
          return 'weather';
        }
        if (
          has(
            'исследование',
            ' paper ',
            'статья научная',
            'arxiv',
            ' doi ',
            'метаанализ',
            'benchmark paper',
            'scholar',
          )
        ) {
          return 'scholar';
        }
        if (
          has(
            'видео',
            'youtube',
            'обзор видео',
            'туториал',
            'как настроить',
          )
        ) {
          return 'video';
        }
        if (
          has(
            'куда сходить',
            'рядом',
            'ресторан',
            'кафе',
            'кофейня',
            'торговый центр',
            'магазин',
            'на карте',
            'адрес ',
          )
        ) {
          return 'places';
        }
        if (
          has(
            'купить',
            'цена',
            'стоимость',
            'лучшие',
            'выбрать',
            'обзор',
            'скидка',
            'наушники',
            'ноутбук',
            'кроссовки',
            'парфюм',
          )
        ) {
          return 'shopping';
        }
        if (
          has(
            'ошибка',
            'error',
            'exception',
            'docker',
            'next.js',
            'typescript',
            'python',
            'npm',
            ' git ',
            'linux',
            'команда',
            'как исправить',
            'failed',
            'traceback',
          )
        ) {
          return 'code';
        }
        if (
          has(
            'фото',
            'картинки',
            'изображения',
            'как выглядит',
            'дизайн',
            'пример интерфейса',
            'логотип',
            'интерьер',
          )
        ) {
          return 'image';
        }
        return 'general';
      };

      const intent = detectIntent(intentSources);

      // ── Follow-ups: интеллектуальное слияние, не просто fallback ───
      //   Источники в порядке предпочтения:
      //     1) PAA вопросы (живой пользовательский язык)
      //     2) relatedSearches (узкие уточнения)
      //     3) action chips из intent (для прямого действия)
      //   Затем — фильтры: dedupe (caseless), длина ≤72 символов,
      //   пропускаем слишком общие фразы вроде «расскажи подробнее».
      const intentActionChips: Record<string, string[]> = {
        general: ['Сделать таблицу', 'Сравнить варианты', 'Дать краткий вывод'],
        news: [
          'Что изменилось за последние 24 часа?',
          'Какие источники подтверждают это?',
          'Что это значит на практике?',
        ],
        comparison: [
          'Сделать таблицу сравнения',
          'Кому что подойдёт?',
          'Какие есть альтернативы?',
        ],
        code: [
          'Покажи пример кода',
          'Какие частые ошибки?',
          'Дай пошаговую инструкцию',
        ],
        shopping: [
          'Сравни варианты',
          'На что смотреть перед покупкой?',
          'Найди дешевле',
        ],
        places: [
          'Покажи лучшие по рейтингу',
          'Что открыто сейчас?',
          'Построй маршрут',
        ],
        scholar: [
          'Какие ключевые выводы?',
          'Кто авторы и год публикации?',
          'Есть ли последующие работы?',
        ],
        video: [
          'Покажи самые свежие видео',
          'С чего начать изучение?',
          'Есть ли русскоязычные туториалы?',
        ],
        image: [
          'Покажи больше визуальных материалов',
          'Какие стили встречаются чаще?',
          'Откуда эти изображения?',
        ],
        weather: [
          'Что надеть сегодня?',
          'Как будет завтра?',
          'Прогноз на неделю?',
        ],
      };

      const GENERIC_BAD_FOLLOWUPS = new Set(
        [
          'расскажи подробнее',
          'подробнее',
          'tell me more',
          'еще',
          'ещё',
        ].map((s) => s.toLowerCase()),
      );

      const fromPAA = (peopleAlsoAskRaw as any[])
        .map((p: any) => (typeof p?.question === 'string' ? p.question : ''))
        .filter((q: any) => typeof q === 'string' && q.trim().length > 0)
        .map((q: string) => q.trim());
      const fromRelated = (relatedSearches as any[])
        .map((r: any) => (typeof r === 'string' ? r : r?.query))
        .filter((q: any) => typeof q === 'string' && q.trim().length > 0)
        .map((q: string) => q.trim());
      const fromIntent =
        intentActionChips[intent] || intentActionChips.general;

      // Сначала пара PAA, потом related, потом intent action chips —
      // получаем разнообразие.
      const candidatePool: string[] = [
        ...fromPAA.slice(0, 2),
        ...fromRelated.slice(0, 3),
        ...fromIntent,
      ];

      const followUpsSeen = new Set<string>();
      const followUpsPayload = candidatePool
        .map((q) => q.slice(0, 72).trim())
        .filter((q) => q.length > 4)
        .filter((q) => !GENERIC_BAD_FOLLOWUPS.has(q.toLowerCase()))
        .filter((q) => {
          const k = q.toLowerCase();
          if (followUpsSeen.has(k)) return false;
          followUpsSeen.add(k);
          return true;
        })
        .slice(0, 4);

      const summaryDomains = Array.from(
        new Set(
          sourcesPayload
            .map((s) => s.domain)
            .filter((d) => typeof d === 'string' && d.length > 0),
        ),
      ).slice(0, 12);

      const summaryPayload = {
        totalSources: sourcesPayload.length,
        // readSources проставится при scrape ниже; в первичном marker
        // оставляем 0 — UI просто не покажет строку «Прочитано N» пока
        // scrape не завершится.
        readSources: 0,
        domains: summaryDomains,
        intent,
        generatedAt: now.toISOString(),
      };

      // intent === 'comparison'
      let comparisonPayload: {
        query: string;
        criteria: string[];
        note: string;
      } | null = null;
      if (intent === 'comparison') {
        comparisonPayload = {
          query: (lastUserMessage || query || '').slice(0, 240),
          criteria: [
            'Качество',
            'Скорость',
            'Цена/стоимость',
            'Риски',
            'Когда выбрать',
          ],
          note:
            'Сравнение основано на найденных источниках и ответе модели.',
        };
      }

      // intent === 'code': грубая детекция стека
      let codeFixPayload: {
        query: string;
        detectedStack: string[];
        safetyNote: string;
      } | null = null;
      if (intent === 'code') {
        const stackHits: string[] = [];
        const checkStack = (label: string, ...needles: string[]) => {
          if (needles.some((n) => intentSources.includes(n))) {
            stackHits.push(label);
          }
        };
        checkStack('Docker', 'docker', 'compose');
        checkStack('Next.js', 'next.js', 'next ');
        checkStack('TypeScript', 'typescript', ' ts ', '.ts');
        checkStack('Python', 'python', 'py');
        checkStack('npm', 'npm', 'pnpm', 'yarn');
        checkStack('Git', ' git ', 'git ');
        checkStack('Linux', 'linux', 'ubuntu', 'debian', 'bash');
        codeFixPayload = {
          query: (lastUserMessage || query || '').slice(0, 240),
          detectedStack: Array.from(new Set(stackHits)).slice(0, 6),
          safetyNote:
            'Перед выполнением команд проверьте окружение и бэкапы.',
        };
      }

      // intent === 'news': мини-timeline из топ-3..5 результатов
      let newsTimelinePayload: Array<{
        title: string;
        url: string;
        domain: string;
        date?: string;
        snippet?: string;
      }> = [];
      if (intent === 'news') {
        const seenUrl = new Set<string>();
        newsTimelinePayload = (dedupedOrganic as any[])
          .map((item: any) => {
            const url = item.link || item.url || '';
            if (!url || seenUrl.has(url)) return null;
            seenUrl.add(url);
            return {
              title:
                typeof item.title === 'string'
                  ? item.title.slice(0, 200)
                  : safeDomain(url) || url,
              url,
              domain: safeDomain(url),
              date: typeof item.date === 'string' ? item.date : undefined,
              snippet:
                typeof item.snippet === 'string'
                  ? item.snippet.slice(0, 240)
                  : undefined,
            };
          })
          .filter(Boolean)
          .slice(0, 5) as any[];
      }

      // ── v4 widgets: KG, PAA, news, places, shopping, scholar, videos ──
      // Каждый блок — defensive coerce от того, что вернул Serper.

      const knowledgeGraphPayload = (() => {
        const kg = knowledgeGraphRaw;
        if (!kg || typeof kg !== 'object') return null;
        const title =
          typeof kg.title === 'string' ? kg.title.slice(0, 200) : '';
        if (!title) return null;
        const rawAttrs = kg.attributes;
        let attributes: Array<{ label: string; value: string }> | undefined;
        if (rawAttrs && typeof rawAttrs === 'object') {
          attributes = Object.entries(rawAttrs)
            .filter(
              ([k, v]) => typeof k === 'string' && typeof v === 'string',
            )
            .map(([k, v]) => ({
              label: String(k).slice(0, 60),
              value: String(v).slice(0, 160),
            }))
            .slice(0, 8);
        }
        return {
          title,
          type: typeof kg.type === 'string' ? kg.type.slice(0, 80) : undefined,
          description:
            typeof kg.description === 'string'
              ? kg.description.slice(0, 600)
              : undefined,
          imageUrl:
            typeof kg.imageUrl === 'string' && kg.imageUrl.length > 0
              ? kg.imageUrl
              : undefined,
          website:
            typeof kg.website === 'string' && kg.website.length > 0
              ? kg.website
              : undefined,
          attributes,
        };
      })();

      const peopleAlsoAskPayload = (peopleAlsoAskRaw as any[])
        .map((p: any) => {
          const question =
            typeof p?.question === 'string' ? p.question.slice(0, 240) : '';
          if (!question) return null;
          const url = p?.link || p?.url || '';
          return {
            question,
            snippet:
              typeof p?.snippet === 'string'
                ? p.snippet.slice(0, 320)
                : undefined,
            url: typeof url === 'string' && url.length > 0 ? url : undefined,
            domain:
              typeof url === 'string' && url.length > 0
                ? safeDomain(url)
                : undefined,
          };
        })
        .filter(Boolean)
        .slice(0, 4);

      const newsPayload = (newsRaw as any[])
        .map((n: any) => {
          const url = n?.link || n?.url || '';
          if (!url) return null;
          return {
            title:
              typeof n?.title === 'string' ? n.title.slice(0, 200) : url,
            url,
            domain: safeDomain(url),
            date: typeof n?.date === 'string' ? n.date.slice(0, 60) : undefined,
            snippet:
              typeof n?.snippet === 'string'
                ? n.snippet.slice(0, 240)
                : undefined,
          };
        })
        .filter(Boolean)
        .slice(0, 5);

      const placesPayload = (placesRaw as any[])
        .map((p: any) => {
          const title =
            typeof p?.title === 'string' ? p.title.slice(0, 200) : '';
          if (!title) return null;
          const url = p?.website || p?.link || '';
          return {
            title,
            address:
              typeof p?.address === 'string'
                ? p.address.slice(0, 240)
                : undefined,
            rating: typeof p?.rating === 'number' ? p.rating : undefined,
            ratingCount:
              typeof p?.ratingCount === 'number' ? p.ratingCount : undefined,
            category:
              typeof p?.category === 'string'
                ? p.category.slice(0, 80)
                : undefined,
            url: typeof url === 'string' && url.length > 0 ? url : undefined,
            domain:
              typeof url === 'string' && url.length > 0
                ? safeDomain(url)
                : undefined,
            latitude:
              typeof p?.latitude === 'number' ? p.latitude : undefined,
            longitude:
              typeof p?.longitude === 'number' ? p.longitude : undefined,
            mapsUrl:
              typeof p?.cid === 'string'
                ? `https://www.google.com/maps/place/?q=place_id:${p.cid}`
                : undefined,
          };
        })
        .filter(Boolean)
        .slice(0, 5);

      const shoppingPayload = (shoppingRaw as any[])
        .map((s: any) => {
          const url = s?.link || s?.url || '';
          if (!url) return null;
          return {
            title:
              typeof s?.title === 'string' ? s.title.slice(0, 200) : url,
            source:
              typeof s?.source === 'string'
                ? s.source.slice(0, 80)
                : undefined,
            url,
            price:
              typeof s?.price === 'string'
                ? s.price.slice(0, 60)
                : typeof s?.price === 'number'
                  ? `${s.price}`
                  : undefined,
            rating: typeof s?.rating === 'number' ? s.rating : undefined,
            ratingCount:
              typeof s?.ratingCount === 'number' ? s.ratingCount : undefined,
            imageUrl:
              typeof s?.imageUrl === 'string' && s.imageUrl.length > 0
                ? s.imageUrl
                : undefined,
            domain: safeDomain(url),
          };
        })
        .filter(Boolean)
        .slice(0, 5);

      const scholarPayload = (scholarRaw as any[])
        .map((s: any) => {
          const url = s?.link || s?.url || '';
          if (!url) return null;
          return {
            title:
              typeof s?.title === 'string' ? s.title.slice(0, 240) : url,
            url,
            domain: safeDomain(url),
            snippet:
              typeof s?.snippet === 'string'
                ? s.snippet.slice(0, 280)
                : undefined,
            authors:
              typeof s?.publicationInfo === 'string'
                ? s.publicationInfo.slice(0, 200)
                : typeof s?.authors === 'string'
                  ? s.authors.slice(0, 200)
                  : undefined,
            year:
              typeof s?.year === 'string'
                ? s.year.slice(0, 16)
                : typeof s?.year === 'number'
                  ? String(s.year)
                  : undefined,
            citedBy:
              typeof s?.citedBy === 'number' && s.citedBy >= 0
                ? s.citedBy
                : undefined,
          };
        })
        .filter(Boolean)
        .slice(0, 5);

      const videosPayload = (videosRaw as any[])
        .map((v: any) => {
          const url = v?.link || v?.url || '';
          if (!url) return null;
          return {
            title:
              typeof v?.title === 'string' ? v.title.slice(0, 200) : url,
            url,
            source:
              typeof v?.source === 'string'
                ? v.source.slice(0, 80)
                : undefined,
            domain: safeDomain(url),
            date: typeof v?.date === 'string' ? v.date.slice(0, 60) : undefined,
            imageUrl:
              typeof v?.imageUrl === 'string' && v.imageUrl.length > 0
                ? v.imageUrl
                : undefined,
            channel:
              typeof v?.channel === 'string'
                ? v.channel.slice(0, 80)
                : undefined,
            duration:
              typeof v?.duration === 'string'
                ? v.duration.slice(0, 32)
                : undefined,
          };
        })
        .filter(Boolean)
        .slice(0, 5);

      const searchMetaPayload: any = {
        sources: sourcesPayload,
        images: imagesPayload,
        followUps: followUpsPayload,
        intent,
        summary: summaryPayload,
      };
      if (comparisonPayload) searchMetaPayload.comparison = comparisonPayload;
      if (codeFixPayload) searchMetaPayload.codeFix = codeFixPayload;
      if (newsTimelinePayload.length > 0) {
        searchMetaPayload.newsTimeline = newsTimelinePayload;
      }
      if (knowledgeGraphPayload) {
        searchMetaPayload.knowledgeGraph = knowledgeGraphPayload;
      }
      if (peopleAlsoAskPayload.length > 0) {
        searchMetaPayload.peopleAlsoAsk = peopleAlsoAskPayload;
      }
      if (newsPayload.length > 0) searchMetaPayload.news = newsPayload;
      if (placesPayload.length > 0) searchMetaPayload.places = placesPayload;
      if (shoppingPayload.length > 0)
        searchMetaPayload.shopping = shoppingPayload;
      if (scholarPayload.length > 0)
        searchMetaPayload.scholar = scholarPayload;
      if (videosPayload.length > 0) searchMetaPayload.videos = videosPayload;

      const sourcesMarker = `__IISET_SOURCES__=${JSON.stringify(
        searchMetaPayload,
      )}\n`;

      console.log(
        `[CHAT-WS] meta_ready dt_total_pre_meta=${wsDt()}ms intent=${intent} sources=${sourcesPayload.length} images=${imagesPayload.length} followUps=${followUpsPayload.length} news=${newsPayload.length} places=${placesPayload.length} shopping=${shoppingPayload.length} scholar=${scholarPayload.length} videos=${videosPayload.length} kg=${!!knowledgeGraphPayload} paa=${peopleAlsoAskPayload.length} comparison=${!!comparisonPayload} codeFix=${!!codeFixPayload}`,
      );

      // 4. Stream: yield metadata FIRST, then perform scrape + LLM inside
      //    the stream's start() so the client sees Serper data immediately
      //    while we keep working on a fully-cited answer in the background.
      //
      //    Раньше scrape (≈3–6s) + LLM setup происходили до возврата стрима —
      //    клиент видел сырой "Думаю…" вместо реальных карточек. Теперь:
      //      • marker — сразу;
      //      • scrape — top 3 с жёстким 3500 ms таймаутом;
      //      • LLM — с краткой инструкцией опираться на снижет, если scrape
      //        не успел дать контент.
      const topResultsForScrape = (dedupedOrganic as any[]).slice(0, 3);
      const llmBaseRequest = this.llmBaseRequest.bind(this);

      return new ReadableStream<Uint8Array>({
        async start(controller) {
          const encoder = new TextEncoder();
          // ── Step A: yield metadata marker immediately ────────────
          controller.enqueue(encoder.encode(sourcesMarker));
          console.log(
            `[CHAT-WS] meta_yielded dt_total=${wsDt()}ms — UI now showing sources`,
          );

          try {
            // ── Step B: scrape top-3 sources with bounded timeout ──
            const tScrape =
              typeof performance !== 'undefined'
                ? performance.now()
                : Date.now();
            const scrapeSettled = await Promise.allSettled(
              topResultsForScrape.map(async (item: any) => {
                const url = item.link || item.url;
                if (!url) return null;
                try {
                  const scrapeResponse = await fetchWithTimeout(
                    'https://scrape.serper.dev',
                    {
                      method: 'POST',
                      headers: serperHeaders,
                      body: JSON.stringify({ url }),
                    },
                    3500,
                  );
                  const scrapeJson: any = await scrapeResponse.json();
                  return {
                    title: item.title,
                    url,
                    snippet: item.snippet,
                    content:
                      (scrapeJson &&
                        (scrapeJson.text || scrapeJson.content)) ||
                      '',
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
            const scrapedPages = scrapeSettled
              .map((r, idx) =>
                r.status === 'fulfilled'
                  ? r.value
                  : topResultsForScrape[idx]
                    ? {
                        title: topResultsForScrape[idx].title,
                        url:
                          topResultsForScrape[idx].link ||
                          topResultsForScrape[idx].url,
                        snippet: topResultsForScrape[idx].snippet,
                        content: '',
                      }
                    : null,
              )
              .filter(Boolean) as Array<{
              title: string;
              url: string;
              snippet?: string;
              content: string;
            }>;
            const scrapeDt = Math.round(
              (typeof performance !== 'undefined'
                ? performance.now()
                : Date.now()) - tScrape,
            );
            console.log(
              `[CHAT-WS] scrape_done dt=${scrapeDt}ms scraped=${scrapedPages.length}`,
            );

            // ── Step C: build LLM context from whatever we have ────
            const docsToUse =
              scrapedPages.length > 0
                ? scrapedPages
                : topResultsForScrape.map((item: any) => ({
                    title: item.title,
                    url: item.link || item.url,
                    snippet: item.snippet,
                    content: item.snippet || '',
                  }));

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

            const systemPrompt = [
              'Ты — ИИСеть, умный ассистент с доступом к интернету.',
              `Текущая дата сервера: ${currentDate}.`,
              'Отвечай на русском.',
              'Опирайся на факты из переданных ниже источников и не выдумывай данные.',
              'Никогда не придумывай дату, температуру, скорость ветра, цены и другие численные значения, если они явно не указаны в источниках.',
              'Если источники относятся к прошлым датам, явно отметь это.',
              'Если данных не хватает или источники противоречат — честно скажи об этом.',
              'В тексте ставь короткие маркеры цитирования [1], [2], [3] сразу после утверждения, опирающегося на источник.',
              'Никогда не выводи голые URL и не вставляй markdown-ссылки с полными URL — UI сам покажет карточки источников.',
              'Никогда не добавляй в конец ответа раздел «Источники», список ссылок или JSON.',
              'Никогда не выводи теги <think>.',
              'UI уже показывает виджеты: Knowledge Graph, картинки, новости, места, товары, видео, follow-up вопросы. Не дублируй их полное содержимое — давай вывод и ссылайся на источники.',
              'Используй таблицу только если пользователь явно просит таблицу.',
              'Структура ответа: 1) короткий вывод (1–2 предложения), 2) детали, 3) что важно учесть, 4) что можно сделать дальше.',
              intent === 'news'
                ? 'Это новостной запрос: явно указывай дату/период и подчёркивай неопределённость.'
                : '',
              intent === 'code'
                ? 'Это код/документация: приоритезируй официальные источники и давай практичные шаги.'
                : '',
              intent === 'shopping' || intent === 'places'
                ? 'Это покупка/локальный запрос: предупреди, что цены и наличие меняются.'
                : '',
            ]
              .filter(Boolean)
              .join(' ');

            const answerMessages = [
              { role: 'system', content: systemPrompt },
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

            // ── Step D: invoke LLM and pipe ──────────────────────
            console.log(
              `[CHAT-WS] llm_request_start dt_total=${wsDt()}ms scraped=${scrapedPages.length}`,
            );
            const tLLM =
              typeof performance !== 'undefined'
                ? performance.now()
                : Date.now();
            const llmStreamResult = (await llmBaseRequest({
              model: 'openai/gpt-oss-120b',
              messages: answerMessages as any[],
              stream: true,
              onClose,
              textToLast: '',
            })) as ReadableStream<Uint8Array>;

            const reader = llmStreamResult.getReader();
            let firstChunk = true;
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              if (firstChunk) {
                const firstChunkDt = Math.round(
                  (typeof performance !== 'undefined'
                    ? performance.now()
                    : Date.now()) - tLLM,
                );
                console.log(
                  `[CHAT-WS] llm_first_chunk dt=${firstChunkDt}ms dt_total=${wsDt()}ms`,
                );
                firstChunk = false;
              }
              if (value) controller.enqueue(value);
            }
            console.log(`[CHAT-WS] llm_stream_done dt_total=${wsDt()}ms`);
          } catch (err) {
            console.error('[CHAT-WS] stream_inner_error', err);
            // Не оставляем клиента подвешенным: отдаём короткий fallback.
            try {
              controller.enqueue(
                encoder.encode(
                  '\n\nНе удалось собрать развёрнутый ответ. Источники найдены — посмотрите карточки выше.',
                ),
              );
            } catch {
              // ignore
            }
          } finally {
            controller.close();
          }
        },
      });
    } catch (e: any) {
      console.error('[CHAT-WS] webSearchRequest error', e);

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
            'Ты ИИСеть, ты должна помогать пользователям с их разными вопросами! Пиши на русском! Старайся красиво и удобно выводить ответ пользователю! ' +
            'Не выводи скрытые рассуждения, теги <think> или chain-of-thought — дай только финальный ответ.',
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
