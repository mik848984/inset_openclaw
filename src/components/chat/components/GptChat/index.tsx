'use client';

import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Button,
  Card,
  CardBody,
  Divider,
  Flex,
  Grid,
  Heading,
  Icon,
  SimpleGrid,
  Switch,
  Tag,
  Text,
  Textarea,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react';
import {
  MdAutoAwesome,
  MdDelete,
  MdImage,
  MdPsychology,
  MdSend,
  MdSearch,
  MdSmartToy,
  MdKeyboardArrowDown,
} from 'react-icons/md';
import { trackGoal } from '@/utils/metrics';
import { FaStopCircle } from 'react-icons/fa';
import React, { useContext, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ChatAiContext, IProjectChip } from '@/contexts/ChatAiContext';
import {
  projectsService,
  IProjectUI,
} from '@/services/ui/ProjectsService';
import ProjectSourcesDrawer from '@/components/chat/components/ProjectSourcesDrawer';
import ProjectCommandCenter from '@/components/chat/components/ProjectCommandCenter';
import { useMessengerScroll } from '../hooks/useMessengerScroll';
import { ModalContext } from '@/contexts/ModalContext';
import ResizeTextareaApp from '@/components/fields/ResizeTextarea';
import Message from '@/components/chat/components/Message';
import { LogoChat } from '@/components/icons/Icons';
import { messagesService } from '@/services/ui/MessagesService';
import Attachment from '@/components/attachment';
import { attachmentsService } from '@/services/ui/AttachemntsService';
import { useSubscribe } from '@/utils/hooks/useSubscribe';
import AttachmentItem from '@/components/attachmentItem';
import { useUser } from '@/utils/hooks/useUser';
import useLocalStorageState from 'use-local-storage-state';

// Friendly display names for the chat model chip. Must stay in sync with
// the ModelsModal cards — see src/components/modals/ModelsModal/index.tsx.
const llmMap: Record<string, string> = {
  'openai/gpt-oss-120b': 'ChatGPT (GPT-OSS)',
  'microsoft/phi-4': 'Microsoft Phi 4',
  'deepseek-ai/DeepSeek-V3.2-Exp': 'DeepSeek V3.2',
  'deepseek-ai/DeepSeek-V4-Pro': 'DeepSeek V4 Pro',
  'Qwen/Qwen3.6-35B-A3B': 'Qwen 3.6 35B',
  'gemini-2.5-pro': 'Gemini 2.5 Pro',
  'gemini-2.5-flash': 'Gemini 2.5 Flash',
  'gemini-2.5-flash-lite': 'Gemini 2.5 Flash Lite',
  // Older / fallback Gemini ids — render as their thinking variants.
  'gemini-2.5-flash-preview': 'Gemini 2.5 Flash',
  'google/gemini-2.0-flash-thinking-exp-1219:free': 'Gemini 2.0 Flash',
  'google/gemini-2.0-flash-thinking-exp:free': 'Gemini 2.0 Flash',
  'deepseek-ai/DeepSeek-R1': 'DeepSeek R1',
  'deepseek-ai/DeepSeek-V3': 'DeepSeek V3',
  'meta-llama/Llama-3.3-70B-Instruct-Turbo': 'Llama 3.3 70B',
  'mistral-small': 'Mistral Small',
  'mistral-large-latest': 'Mistral Large',
};

/**
 * Display name for a model id. Falls back to a cleaned last URL segment
 * (e.g. "openai/gpt-oss-120b" → "gpt-oss-120b") so unknown models still
 * render readable text instead of just the robot emoji.
 *
 * Empty / undefined id → "Выбрать модель".
 */
function getModelTitle(modelId: string | undefined | null): string {
  if (!modelId) return 'Выбрать модель';
  if (llmMap[modelId]) return llmMap[modelId];
  // Take the last path segment, drop tag suffixes after `:`.
  const last = String(modelId).split('/').pop() || String(modelId);
  const cleaned = last.split(':')[0].trim();
  return cleaned || 'Выбрать модель';
}


const QUICK_PROMPTS: {
  id: string;
  title: string;
  description: string;
  prompt: string;
  category: string;
  colorScheme: string;
}[] = [
  {
    id: 'work-email',
    title: 'Переписка с коллегами',
    description: 'Сформулируй вежливое рабочее письмо по моей черновой мысли.',
    prompt:
      'Помоги переписать мой черновик письма в деловом стиле. Сохрани смысл, сделай текст короче и структурируй по абзацам.',
    category: 'Работа',
    colorScheme: 'purple',
  },
  {
    id: 'work-summary',
    title: 'Резюме встречи',
    description: 'Сделай краткое резюме и список задач по тексту встречи.',
    prompt:
      'Вот конспект встречи. Составь короткое резюме в 5–7 предложениях и список задач с дедлайнами и ответственными.',
    category: 'Работа',
    colorScheme: 'blue',
  },
  {
    id: 'work-plan',
    title: 'План на неделю',
    description: 'Разложи хаотичный список дел в понятный план.',
    prompt:
      'Из моего списка дел на неделю составь структурированный план: блоки по проектам, оценки времени и приоритет (A/B/C).',
    category: 'Работа',
    colorScheme: 'cyan',
  },
  {
    id: 'learn-topic',
    title: 'Объясни сложную тему',
    description: 'Попроси объяснить тему простым языком, как другу.',
    prompt:
      'Объясни мне сложную тему простым языком, как если бы я был школьником старших классов. Приведи 3–4 жизненных примера.',
    category: 'Учёба',
    colorScheme: 'green',
  },
  {
    id: 'learn-questions',
    title: 'Подготовка к собеседованию',
    description: 'Сгенерируй список вопросов и проверку знаний.',
    prompt:
      'Я готовлюсь к собеседованию. Составь список из 15–20 вопросов по теме и проверь меня: задавай вопросы по одному и жди моих ответов.',
    category: 'Учёба',
    colorScheme: 'green',
  },
  {
    id: 'life-decision',
    title: 'Разбор сложного решения',
    description: 'Помоги взвесить плюсы и минусы перед выбором.',
    prompt:
      'Помоги принять решение: задай мне уточняющие вопросы, потом разложи плюсы и минусы вариантов и предложи взвешенную рекомендацию.',
    category: 'Жизнь',
    colorScheme: 'orange',
  },
  {
    id: 'life-habit',
    title: 'Новая полезная привычка',
    description: 'Составь пошаговый план внедрения привычки.',
    prompt:
      'Помоги внедрить одну полезную привычку. Спроси, что именно я хочу изменить, и составь план на 4 недели с маленькими шагами.',
    category: 'Жизнь',
    colorScheme: 'orange',
  },
  {
    id: 'creative-ideas',
    title: 'Идеи для контента',
    description: 'Придумай темы для постов или статей.',
    prompt:
      'Я веду блог. Сгенерируй 20 идей постов по моей теме с коротким описанием формата и ключевой мыслью.',
    category: 'Креатив',
    colorScheme: 'pink',
  },
  {
    id: 'creative-story',
    title: 'Небольшая история',
    description: 'Пусть ИИСеть напишет мини-рассказ по твоему запросу.',
    prompt:
      'Напиши короткий художественный рассказ на 800–1200 слов в стиле лёгкой научной фантастики по заданным мною вводным.',
    category: 'Креатив',
    colorScheme: 'pink',
  },
  {
    id: 'code-review',
    title: 'Код-ревью',
    description: 'Попроси разобраться с кусочком кода.',
    prompt:
      'Проанализируй мой фрагмент кода, найди возможные ошибки и предложи улучшения по читаемости и структуре.',
    category: 'Код',
    colorScheme: 'teal',
  },
  {
    id: 'code-explain',
    title: 'Объясни код',
    description: 'Разбор незнакомого кода по шагам.',
    prompt:
      'Объясни, что делает этот код, построчно и простыми словами. Сначала дай краткое резюме, затем детальный разбор.',
    category: 'Код',
    colorScheme: 'teal',
  },
  {
    id: 'doc-simplify',
    title: 'Упрощение документа',
    description: 'Сделай понятным любой сложный текст.',
    prompt:
      'Возьми сложный документ (договор, инструкцию или политический текст) и перепиши в простом, разговорном стиле с примерами.',
    category: 'Документы',
    colorScheme: 'purple',
  },
  {
    id: 'doc-translate',
    title: 'Перевод без канцелярита',
    description: 'Переведи текст и сделай его естественным.',
    prompt:
      'Переведи текст на русский язык, сохранив смысл и стиль, но избегая канцелярита и дословных конструкций.',
    category: 'Документы',
    colorScheme: 'purple',
  },
  {
    id: 'project-roadmap',
    title: 'Дорожная карта проекта',
    description: 'Разложи идею продукта в roadmap.',
    prompt:
      'Помоги оформить мою идею проекта в продуктовый roadmap: цели, гипотезы, этапы, метрики успеха и риски.',
    category: 'Продукт',
    colorScheme: 'blue',
  },
  {
    id: 'meeting-agenda',
    title: 'Повестка встречи',
    description: 'Сделай чёткую структуру созвона или митинга.',
    prompt:
      'Составь структурированную повестку встречи: цель, темы, тайминг, участники и ожидаемый результат по каждому пункту.',
    category: 'Работа',
    colorScheme: 'cyan',
  },
  {
    id: 'brainstorm',
    title: 'Брейншторм идей',
    description: 'Проведи со мной мини-брейншторм по теме.',
    prompt:
      'Проведи со мной брейншторм: задай уточняющие вопросы, потом предложи 15–20 идей и помоги выбрать 3 приоритетных.',
    category: 'Креатив',
    colorScheme: 'pink',
  },
  {
    id: 'career-path',
    title: 'Поворот в карьере',
    description: 'Разбор возможных карьерных шагов.',
    prompt:
      'Помоги оценить варианты развития карьеры: собери вводные о моём опыте и предложи 3–4 сценария с плюсами и минусами.',
    category: 'Карьера',
    colorScheme: 'blue',
  },
  {
    id: 'cv-review',
    title: 'Разбор резюме',
    description: 'Улучши резюме под конкретную вакансию.',
    prompt:
      'Разбери моё резюме и предложи правки, чтобы оно лучше подходило под конкретную вакансию. Сначала задай вопросы о цели поиска.',
    category: 'Карьера',
    colorScheme: 'blue',
  },
  {
    id: 'health-routine',
    title: 'Мягкий режим дня',
    description: 'Помоги выстроить бережный режим дня без фанатизма.',
    prompt:
      'Помоги составить реалистичный и мягкий распорядок дня с учётом работы и отдыха. Важно: без перегруза и жёстких требований.',
    category: 'Жизнь',
    colorScheme: 'orange',
  },
  {
    id: 'travel-plan',
    title: 'Маршрут поездки',
    description: 'Составь маршрут путешествия под мои интересы.',
    prompt:
      'Составь маршрут поездки на 3–5 дней с учётом моих интересов и бюджета. Раздели по дням и добавь советы по лайфхакам.',
    category: 'Путешествия',
    colorScheme: 'cyan',
  },
  {
    id: 'ai-ideas',
    title: 'Что делать с ИИ',
    description: 'Подбери персональные сценарии использования ИИСети.',
    prompt:
      'Проанализируй мой профиль (работу, хобби, задачи) и предложи 10 конкретных сценариев, как ИИСеть может экономить мне время каждый день.',
    category: 'ИИСеть',
    colorScheme: 'purple',
  },
];


function GptChat() {
  const ref = useRef<any>();

  const [inputCode, setInputCode] = useState<string>('');
  const { user, isAnonymous, refreshUser } = useUser();
  const [webSearchProCount, setWebSearchProCount] = useLocalStorageState<number>('webSearchProCount', {
    defaultValue: 0,
  });
  const [webSearchProMonth, setWebSearchProMonth] = useLocalStorageState<string | null>('webSearchProMonth', {
    defaultValue: null,
  });
  // ── Apple-like unified design system (9 tokens) ─────────────────
  // pageBg          — единый canvas всей chat-area
  // surface         — карточки, чипы, input bar (slightly recessed)
  // surfaceElevated — hover state, subtle elevation
  // surfaceActive   — active state (subtle blue tint)
  // surfaceGlass    — translucent panel for composer (Apple frosted glass)
  // borderSubtle    — единая hairline везде
  // borderActive    — focus/selected
  // textPrimary / textSecondary — типографика
  // accentBlue / accentBlueHover — единственный акцент
  const pageBg = useColorModeValue('#ffffff', 'navy.900');
  const surface = useColorModeValue('#f5f5f7', 'whiteAlpha.50');
  const surfaceElevated = useColorModeValue('#fafafb', 'whiteAlpha.100');
  const surfaceActive = useColorModeValue(
    'rgba(0,102,204,0.08)',
    'rgba(41,151,255,0.14)',
  );
  // surfaceGlass — anchored composer (denser, обеспечивает occlusion при скролле)
  const surfaceGlass = useColorModeValue(
    'rgba(255,255,255,0.74)',
    'rgba(10,14,28,0.70)',
  );
  // cardGlass — лёгче surfaceGlass для tiles, VisionOS material
  const cardGlass = useColorModeValue(
    'rgba(255,255,255,0.56)',
    'rgba(13,18,34,0.58)',
  );
  const cardGlassHover = useColorModeValue(
    'rgba(255,255,255,0.70)',
    'rgba(13,18,34,0.72)',
  );
  const borderSubtle = useColorModeValue(
    'rgba(0,0,0,0.08)',
    'rgba(255,255,255,0.10)',
  );
  // borderGlass — translucent edge для glass surfaces
  const borderGlass = useColorModeValue(
    'rgba(255,255,255,0.55)',
    'rgba(255,255,255,0.12)',
  );
  const borderActive = useColorModeValue(
    'rgba(0,102,204,0.42)',
    'rgba(41,151,255,0.50)',
  );
  const textPrimary = useColorModeValue('#1d1d1f', '#f5f5f7');
  const textSecondary = useColorModeValue(
    '#6e6e73',
    'rgba(245,245,247,0.68)',
  );
  const accentBlue = useColorModeValue('#0066cc', '#2997ff');
  const accentBlueHover = useColorModeValue('#0071e3', '#5ac8ff');

  // ── Apple-like layered glass shadows ────────────────────────────
  // Card tier: inset highlight + soft outer
  const cardShadow = useColorModeValue(
    'inset 0 1px 0 rgba(255,255,255,0.62), 0 1px 2px rgba(0,0,0,0.03), 0 18px 50px rgba(31,38,70,0.06)',
    'inset 0 1px 0 rgba(255,255,255,0.10), 0 1px 2px rgba(0,0,0,0.12), 0 18px 50px rgba(0,0,0,0.30)',
  );
  const cardShadowHover = useColorModeValue(
    'inset 0 1px 0 rgba(255,255,255,0.62), 0 6px 16px rgba(0,0,0,0.06), 0 24px 60px rgba(31,38,70,0.10)',
    'inset 0 1px 0 rgba(255,255,255,0.10), 0 6px 16px rgba(0,0,0,0.20), 0 24px 60px rgba(0,0,0,0.35)',
  );
  // Composer tier: anchored, top-light only
  const composerShadow = useColorModeValue(
    'inset 0 1px 0 rgba(255,255,255,0.55), 0 -1px 0 rgba(0,0,0,0.04)',
    'inset 0 1px 0 rgba(255,255,255,0.08), 0 -1px 0 rgba(255,255,255,0.04)',
  );
  // Top-shine gradient overlay (used via ::before pseudo)
  const glassShine = useColorModeValue(
    'linear-gradient(180deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.08) 55%, rgba(255,255,255,0) 100%)',
    'linear-gradient(180deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.02) 55%, rgba(255,255,255,0) 100%)',
  );

  // Brand violet для LogoChat halo
  const brandPurple = useColorModeValue('#7E59FF', '#9B7CFF');

  // Legacy aliases
  const border = borderSubtle;
  const glassHighlight = useColorModeValue(
    'inset 0 1px 0 rgba(255,255,255,0.55)',
    'inset 0 1px 0 rgba(255,255,255,0.10)',
  );

  const placeholderColor = useColorModeValue(
    { color: '#a0a0a5' },
    { color: 'rgba(245,245,247,0.45)' },
  );

  // Floating composer card surface — поднято из JSX, чтобы не нарушать
  // rules-of-hooks (useColorModeValue нельзя вызывать внутри рендера).
  const composerCardBg = useColorModeValue(
    'rgba(255,255,255,0.86)',
    'rgba(22,24,33,0.78)',
  );

  const handleChange = (Event: any) => {
    setInputCode(Event.target.value);
  };


const handleToggleWebSearch = () => {
  if (!setWebSearch) return;

  // Веб-поиск теперь можно включать всем пользователям.
  // Ограничения и подсказки показываем уже при отправке сообщения.
  setWebSearch(!webSearch);
};

const handleSend = async (messageOverride?: string) => {
  const payload = messageOverride ?? inputCode;

  if (!payload || !sendMessage) return;

  const isGuest = isAnonymous || !user;
  const currentMessages = messages || [];

  if (webSearch) {
    // 1) Анонимный пользователь — вместо реального веб-поиска даём подсказку с ссылкой
    if (isGuest) {
      setMessages?.([
        ...currentMessages,
        { role: 'user', content: payload },
        { role: 'assistant', content: '__WEB_SEARCH_REGISTER__' },
      ]);

      setInputCode('');
      return;
    }

    const hasActiveSubscription = user?.subscription?.status === 'active';

    // 2) Зарегистрирован, но без подписки — списываем реальный баланс
    if (!hasActiveSubscription) {
      const availableBalance = user?.webSearchBalance ?? 0;

      if (availableBalance <= 0) {
        setMessages?.([
          ...currentMessages,
          { role: 'user', content: payload },
          { role: 'assistant', content: '__WEB_SEARCH_FREE_LIMIT__' },
        ]);

        setInputCode('');
        return;
      }
    } else {
      // 3) Пользователь с подпиской — считаем лимит 100 запросов в месяц
      const now = new Date();
      const currentMonthKey = `${now.getFullYear()}-${String(
        now.getMonth() + 1,
      ).padStart(2, '0')}`;

      let currentCount = webSearchProCount || 0;
      let currentMonth = webSearchProMonth;

      if (currentMonth !== currentMonthKey) {
        currentMonth = currentMonthKey;
        currentCount = 0;
      }

      if (currentCount >= 100) {
        setMessages?.([
          ...currentMessages,
          { role: 'user', content: payload },
          { role: 'assistant', content: '__WEB_SEARCH_PRO_LIMIT__' },
        ]);

        setInputCode('');
        return;
      }

      setWebSearchProMonth(currentMonthKey);
      setWebSearchProCount(currentCount + 1);
    }
  }

  try {
    if (!messages?.length) {
      trackGoal('chat_first_message');
    }
    trackGoal('chat_message_sent');
  } catch (e) {
    console.error(e);
  }

  setInputCode('');
  await sendMessage(payload);

  if (
    webSearch &&
    !isGuest &&
    user?.subscription?.status !== 'active'
  ) {
    await refreshUser?.();
  }
};
  const {
    webSearch,
    setWebSearch,
    messages,
    sendMessage,
    model,
    loading,
    abortRequest,
    setMode,
    mode,
    setMessages,
    reasoningEnabled,
    setReasoningEnabled,
    activeProjectId,
    setActiveProjectId,
    activeProjectChip,
    setActiveProjectChip,
  } = useContext(ChatAiContext);

  const [visibleQuickPrompts, setVisibleQuickPrompts] = useState(
    QUICK_PROMPTS.slice(0, 6),
  );

  // ── Project workspace UI state ──────────────────────────────────
  const [sourcesDrawerOpen, setSourcesDrawerOpen] = useState(false);
  const [projectSourceCount, setProjectSourceCount] = useState<number>(0);
  const [projectMemoryCount, setProjectMemoryCount] = useState<number>(0);

  // Когда меняется активный проект — подгружаем число источников
  // и память (для лейбла «Источники: N · Память: M»).
  useEffect(() => {
    if (!activeProjectId) {
      setProjectSourceCount(0);
      setProjectMemoryCount(0);
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const [list, project] = await Promise.all([
          projectsService.listSources(activeProjectId),
          projectsService.get(activeProjectId),
        ]);
        if (cancelled) return;
        setProjectSourceCount(list.length);
        setProjectMemoryCount(
          Array.isArray(project?.memoryItems)
            ? project!.memoryItems.length
            : 0,
        );
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [activeProjectId]);

  useEffect(() => {
    if (!messages?.length) {
      const shuffled = [...QUICK_PROMPTS].sort(() => Math.random() - 0.5);
      setVisibleQuickPrompts(shuffled.slice(0, 6));
    }
  }, [messages, model]);

  const {
    setModelsModalOpen,
    setTariffModalOpen,
    setAuthorizationModalOpen,
  } = useContext(ModalContext);
  const { scrollRef } = useMessengerScroll(!!loading);
  const toast = useToast();

  useLayoutEffect(() => {
    scrollRef.current = document.querySelector('.scroll-container');

    ref.current?.addEventListener('click', (event: any) => {
      const copyElement = event.target?.closest('div[data-copy]');

      if (copyElement) {
        navigator.clipboard.writeText(
          copyElement.parentNode.textContent.trim(),
        );
        toast({
          title: `Текст скопирован`,
          position: 'bottom-left',
          status: 'success',
          isClosable: true,
        });
      }
    });
  }, []);

  useSubscribe(attachmentsService.listeners);

  const handleQuickPromptClick = (promptText: string) => {
    if (loading) return;
    setInputCode(promptText);
    handleSend(promptText);
  };

  return (
    <Grid
      className="chat"
      position="relative"
      ref={ref}
      height="100%"
      templateRows="1fr auto"
      bg={pageBg}
      width="100%"
      maxWidth="100%"
      minWidth={0}
      overflowX="hidden"
    >
      {/* Stop generation теперь живёт прямо в send-кнопке composer'а:
          никакой отдельной плавающей таблетки посреди экрана. */}

      {/* ── Content row (1fr) — centered column ────────────────── */}
      <Box
        position="relative"
        zIndex={1}
        width="100%"
        maxWidth="100%"
        minWidth={0}
        overflowX="hidden"
      >
        <Box
          maxWidth="980px"
          mx="auto"
          width="100%"
          minWidth={0}
          px={{ base: '12px', md: '0px' }}
          pb={{ base: '210px', md: '200px' }}
        >
          <Flex
            direction="column"
            scrollBehavior="smooth"
            gap="20px"
            minWidth={0}
            width="100%"
          >
            {/* Project workspace banner — показывается, если активен проект */}
            {activeProjectId && (
              <ProjectChatBanner
                activeProjectId={activeProjectId}
                chip={activeProjectChip}
                setChip={setActiveProjectChip}
                sourceCount={projectSourceCount}
                memoryCount={projectMemoryCount}
                onSendAction={(actionText) => {
                  if (!sendMessage || loading) return;
                  void sendMessage(actionText);
                }}
                onOpenSources={() => setSourcesDrawerOpen(true)}
                onCompareWithWeb={() => {
                  if (!sendMessage || loading) return;
                  // Enable webSearch so backend distinguishes [P*] (project)
                  // vs [N*] (internet) citations per the chatAPI prompt.
                  if (!webSearch) setWebSearch?.(true);
                  void sendMessage(
                    'Сравни мои источники в этом проекте с тем, что есть в интернете: где совпадает, где расходится, что важно проверить.',
                  );
                }}
                onDisable={() => {
                  setActiveProjectId?.(null);
                  // Чистим query, чтобы не возвращаться в проект при reload.
                  if (typeof window !== 'undefined') {
                    const url = new URL(window.location.href);
                    url.searchParams.delete('projectId');
                    window.history.replaceState(
                      window.history.state,
                      '',
                      url.pathname + (url.search || ''),
                    );
                  }
                }}
              />
            )}
            {activeProjectId && (
              <ProjectSourcesDrawer
                projectId={activeProjectId}
                open={sourcesDrawerOpen}
                onClose={() => {
                  setSourcesDrawerOpen(false);
                  // refresh counts after drawer closes
                  void (async () => {
                    try {
                      const list =
                        await projectsService.listSources(activeProjectId);
                      setProjectSourceCount(list.length);
                    } catch {
                      /* ignore */
                    }
                  })();
                }}
              />
            )}

            {/* Project Command Center — заменяет LogoChat-hero, когда
                открыт проект и в чате пусто. Это «Project Home»: цель,
                следующий шаг, источники, ветки, артефакты, выводы. */}
            {messages?.length === 0 && activeProjectId && (
              <Box width="100%" maxW="100%" minW={0} mt={{ base: '4px', md: '8px' }}>
                <ProjectCommandCenter
                  projectId={activeProjectId}
                  onOpenSources={() => setSourcesDrawerOpen(true)}
                  onCreateThread={async () => {
                    // Минимальный inline-creator: создаём ветку с
                    // дефолтным именем и сразу переходим в неё.
                    try {
                      const { projectsService: ps } = await import(
                        '@/services/ui/ProjectsService'
                      );
                      const t = await ps.createThread(activeProjectId, {
                        title: `Новая ветка`,
                      });
                      if (t && typeof window !== 'undefined') {
                        const url = new URL(window.location.href);
                        url.searchParams.set('projectId', activeProjectId);
                        url.searchParams.set('threadId', t._id);
                        window.history.pushState(
                          window.history.state,
                          '',
                          url.pathname + (url.search || ''),
                        );
                      }
                    } catch (e) {
                      console.error('[CommandCenter] createThread', e);
                    }
                  }}
                  onSendAction={(text) => {
                    if (!sendMessage || loading) return;
                    void sendMessage(text);
                  }}
                />
              </Box>
            )}

            {messages?.length === 0 && !activeProjectId && (
              <>
                {/* Empty state — фирменный LogoChat hero, Apple-minimal */}
                <Flex
                  mx="auto"
                  width="100%"
                  maxWidth="540px"
                  mt={{ base: '8px', md: '4%' }}
                  textAlign="center"
                  alignItems="center"
                  justifyContent="center"
                  direction="column"
                  px={{ base: '8px', md: '0' }}
                  position="relative"
                >
                  {/* Soft brand halo — almost invisible, дает воздух за лого */}
                  <Box
                    position="absolute"
                    top={{ base: '0px', md: '-12px' }}
                    left="50%"
                    transform="translateX(-50%)"
                    w={{ base: '260px', md: '360px' }}
                    h={{ base: '260px', md: '360px' }}
                    borderRadius="50%"
                    bg="radial-gradient(circle, rgba(126,89,255,0.10) 0%, transparent 70%)"
                    pointerEvents="none"
                    zIndex={0}
                  />

                  {/* LogoChat — фирменное лого, color=pageBg чтобы внешний square слился с canvas, видны только violet gradients */}
                  <Icon
                    as={LogoChat}
                    width={{ base: '160px', sm: '190px', md: '280px' }}
                    height={{ base: '160px', sm: '190px', md: '280px' }}
                    color={pageBg}
                    position="relative"
                    zIndex={1}
                    flexShrink={0}
                    maxWidth="100%"
                  />

                  <Heading
                    fontSize={{ base: '24px', md: '32px' }}
                    fontWeight="600"
                    lineHeight="1.15"
                    letterSpacing="-0.5px"
                    color={textPrimary}
                    mb="8px"
                    mt={{ base: '4px', md: '8px' }}
                    mx="auto"
                    maxWidth="100%"
                    wordBreak="break-word"
                    position="relative"
                    zIndex={1}
                  >
                    Чем могу помочь?
                  </Heading>
                  <Text
                    color={textSecondary}
                    fontSize={{ base: '14px', md: '15px' }}
                    lineHeight="1.5"
                    fontWeight="400"
                    mx="auto"
                    maxWidth={{ base: '280px', md: '380px' }}
                    position="relative"
                    zIndex={1}
                  >
                    Напишите запрос или выберите подсказку ниже.
                  </Text>
                </Flex>

                {/* Quick prompts — premium Apple/VisionOS liquid glass tiles */}
                <SimpleGrid
                  mt={{ base: '6', md: '10' }}
                  columns={{ base: 1, md: 2, xl: 3 }}
                  spacing={{ base: '10px', md: '12px' }}
                  w="100%"
                  maxWidth="100%"
                  minWidth={0}
                >
                  {visibleQuickPrompts.map((prompt) => (
                    <Card
                      key={prompt.id}
                      variant="unstyled"
                      borderRadius="22px"
                      border="1px solid"
                      borderColor={borderGlass}
                      bg={cardGlass}
                      backdropFilter="blur(20px) saturate(180%)"
                      cursor="pointer"
                      transition="background 0.18s ease, border-color 0.18s ease, transform 0.18s ease, box-shadow 0.22s ease"
                      boxShadow={cardShadow}
                      w="100%"
                      maxWidth="100%"
                      minWidth={0}
                      sx={{
                        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                        position: 'relative',
                        // VisionOS top-light highlight overlay
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          inset: '0',
                          borderRadius: 'inherit',
                          pointerEvents: 'none',
                          background: glassShine,
                          opacity: 0.9,
                          zIndex: 0,
                        },
                        // Subtle edge sheen along the top
                        '&::after': {
                          content: '""',
                          position: 'absolute',
                          top: '0',
                          left: '14%',
                          right: '14%',
                          height: '1px',
                          borderRadius: 'inherit',
                          pointerEvents: 'none',
                          background:
                            'linear-gradient(90deg, transparent, rgba(255,255,255,0.7), transparent)',
                          opacity: 0.7,
                          zIndex: 1,
                        },
                        '& > *': { position: 'relative', zIndex: 1 },
                      }}
                      _hover={{
                        bg: cardGlassHover,
                        borderColor: 'rgba(0,102,204,0.28)',
                        transform: 'translateY(-1px)',
                        boxShadow: cardShadowHover,
                      }}
                      _active={{ transform: 'translateY(0)' }}
                      onClick={() => handleQuickPromptClick(prompt.prompt)}
                    >
                      <CardBody p={{ base: '16px', md: '18px' }}>
                        <Text
                          fontSize="10px"
                          fontWeight="600"
                          letterSpacing="0.6px"
                          textTransform="uppercase"
                          color={textSecondary}
                          mb="8px"
                        >
                          {prompt.category}
                        </Text>
                        <Heading
                          fontSize={{ base: '14px', md: '15px' }}
                          fontWeight="600"
                          lineHeight="1.3"
                          letterSpacing="-0.2px"
                          color={textPrimary}
                          mb="6px"
                          wordBreak="break-word"
                        >
                          {prompt.title}
                        </Heading>
                        <Text
                          fontSize="12px"
                          color={textSecondary}
                          noOfLines={2}
                          lineHeight="1.45"
                        >
                          {prompt.description}
                        </Text>
                      </CardBody>
                    </Card>
                  ))}
                </SimpleGrid>
              </>
            )}

            {messages?.map((message, index) => (
              <Message
                key={index}
                message={message}
                isLast={messages?.length - 1 === index}
              />
            ))}
          </Flex>
        </Box>
      </Box>

      {/* ── Composer — floating card (Apple/Claude/DeepSeek-style) ──
          Sticky-wrapper прозрачен. Внутри:
          – pointer-events:none fade-overlay, через который текст ответа
            элегантно уезжает под composer при скролле;
          – единая центрированная floating card с моделью, режимами,
            input'ом и send/stop в одной поверхности. */}
      <Box
        position="sticky"
        bottom="0"
        zIndex={20}
        width="100%"
        maxWidth="100%"
        minWidth={0}
        overflowX="hidden"
        pointerEvents="none"
      >
        {/* Soft top fade — text scrolls under */}
        <Box
          position="absolute"
          left="0"
          right="0"
          bottom="100%"
          h={{ base: '64px', md: '88px' }}
          pointerEvents="none"
          bgGradient={`linear(to-t, ${pageBg} 0%, ${pageBg} 25%, transparent 100%)`}
          aria-hidden
        />
        <Box
          maxWidth="820px"
          mx="auto"
          width="100%"
          minWidth={0}
          px={{ base: '12px', md: '20px' }}
          pt={{ base: '6px', md: '8px' }}
          pb={{
            base: 'calc(10px + env(safe-area-inset-bottom))',
            md: '18px',
          }}
          pointerEvents="auto"
        >
          {/* ── Floating composer card ──────────────────────────────
              Один скруглённый surface объединяет attachments, режимы и
              input. Тонкая hairline + двухслойная мягкая тень + лёгкий
              backdrop-blur — премиальный «не-футер» материал. */}
          <Box
            bg={composerCardBg}
            border="1px solid"
            borderColor={borderSubtle}
            borderRadius={{ base: '20px', md: '24px' }}
            boxShadow="0 1px 2px rgba(15,23,42,0.05), 0 12px 36px -16px rgba(15,23,42,0.18)"
            backdropFilter="blur(14px) saturate(160%)"
            sx={{
              WebkitBackdropFilter: 'blur(14px) saturate(160%)',
            }}
            px={{ base: '10px', md: '14px' }}
            py={{ base: '8px', md: '10px' }}
            transition="border-color 0.16s ease, box-shadow 0.16s ease"
            _focusWithin={{
              borderColor: borderActive,
              boxShadow:
                '0 1px 2px rgba(15,23,42,0.06), 0 12px 36px -14px rgba(0,102,204,0.18), 0 0 0 3px rgba(0,102,204,0.08)',
            }}
          >
          {/* Attachments accordion (Gemini only) */}
          {model?.includes('gemini') && attachmentsService.hasAttachments() && (
            <Accordion
              defaultIndex={[0]}
              allowToggle
              width="100%"
              maxWidth="100%"
              minWidth={0}
              mb="4px"
            >
              <AccordionItem borderBottom="none" borderTop="none">
                <h2>
                  <AccordionButton
                    pl={1.5}
                    pb={2}
                    pt={2}
                    borderRadius="12px"
                    _hover={{ bg: 'transparent' }}
                  >
                    <Flex w="100%" gap="6px" alignItems="center" minWidth={0}>
                      <Heading
                        as="h6"
                        fontSize="14px"
                        fontWeight="600"
                        letterSpacing="-0.2px"
                        color={textPrimary}
                        textAlign="left"
                      >
                        Документы диалога
                      </Heading>
                      <Tag size="sm" colorScheme="blue" borderRadius="full">
                        {attachmentsService.sizeAttachments()}
                      </Tag>
                    </Flex>
                    <AccordionIcon />
                  </AccordionButton>
                </h2>
                <AccordionPanel pb={2} pl={0} pr={0}>
                  <Box
                    overflowX="auto"
                    maxWidth="100%"
                    minWidth={0}
                    className="models"
                    sx={{
                      '::-webkit-scrollbar': { display: 'none' },
                      scrollbarWidth: 'none',
                    }}
                  >
                    <Flex gap="6px">
                      {[...attachmentsService.attachments].map((attachment) => {
                        return (
                          <AttachmentItem
                            key={attachment.id}
                            {...attachment}
                            onRemove={() =>
                              attachmentsService.removeAttachment(attachment)
                            }
                          />
                        );
                      })}
                      {attachmentsService.youTube && (
                        <AttachmentItem
                          type="youtube"
                          url={attachmentsService.youTube}
                          key={attachmentsService.youTube}
                          id={0}
                          loading={false}
                          error={false}
                          name={attachmentsService.youTube}
                          onRemove={() => attachmentsService.setYouTube('')}
                        />
                      )}
                    </Flex>
                  </Box>
                </AccordionPanel>
              </AccordionItem>
            </Accordion>
          )}

          {/* ── Top control row: model + mode toggles + delete ──── */}
          <Flex
            align="center"
            gap="6px"
            width="100%"
            minWidth={0}
            mb="6px"
          >
            <Flex
              className="models"
              overflowX="auto"
              overflowY="hidden"
              gap="6px"
              flex="1 1 0"
              minWidth={0}
              sx={{
                '::-webkit-scrollbar': { display: 'none' },
                scrollbarWidth: 'none',
                WebkitOverflowScrolling: 'touch',
              }}
            >
              {/* Model selector — opens ModelsModal. Not a toggle. */}
              <Flex
                as="button"
                type="button"
                onClick={() => setModelsModalOpen!(true)}
                aria-label="Выбрать модель"
                title="Выбрать модель"
                gap="6px"
                align="center"
                h="28px"
                bg="transparent"
                border="1px solid"
                borderColor={borderSubtle}
                borderRadius="9999px"
                pl="10px"
                pr="6px"
                cursor="pointer"
                flexShrink={0}
                minW={0}
                maxW={{ base: '180px', sm: '220px', md: '280px' }}
                _hover={{ bg: surfaceElevated, borderColor: borderActive }}
                _active={{ transform: 'scale(0.98)' }}
                transition="background-color 0.14s ease, border-color 0.14s ease, transform 0.12s ease"
                sx={{ WebkitTapHighlightColor: 'transparent' }}
              >
                <Icon
                  as={MdSmartToy}
                  boxSize="13px"
                  color={accentBlue}
                  flexShrink={0}
                />
                <Text
                  as="span"
                  fontSize="12px"
                  fontWeight="500"
                  letterSpacing="-0.1px"
                  color={textPrimary}
                  noOfLines={1}
                  overflow="hidden"
                  textOverflow="ellipsis"
                  whiteSpace="nowrap"
                  minW={0}
                >
                  {getModelTitle(model)}
                </Text>
                <Icon
                  as={MdKeyboardArrowDown}
                  boxSize="14px"
                  color={textSecondary}
                  flexShrink={0}
                  ml="-2px"
                />
              </Flex>

              {/* Toggle: Web search */}
              <Box
                as="button"
                type="button"
                onClick={handleToggleWebSearch}
                aria-label="Веб-поиск с источниками"
                aria-pressed={webSearch}
                title="Веб-поиск с источниками"
                display="inline-flex"
                alignItems="center"
                gap="6px"
                h="28px"
                px="10px"
                borderRadius="9999px"
                bg={webSearch ? surfaceActive : 'transparent'}
                border="1px solid"
                borderColor={webSearch ? borderActive : borderSubtle}
                color={webSearch ? accentBlue : textSecondary}
                fontSize="12px"
                fontWeight="500"
                letterSpacing="-0.1px"
                cursor="pointer"
                flexShrink={0}
                _hover={{
                  bg: webSearch ? surfaceActive : surfaceElevated,
                  color: webSearch ? accentBlue : textPrimary,
                }}
                _active={{ transform: 'scale(0.98)' }}
                transition="background-color 0.14s ease, color 0.14s ease, border-color 0.14s ease, transform 0.12s ease"
                sx={{ WebkitTapHighlightColor: 'transparent' }}
              >
                <Icon as={MdSearch} boxSize="13px" />
                <Text as="span">Поиск</Text>
              </Box>

              {/* Toggle: Image generation */}
              <Box
                as="button"
                type="button"
                onClick={() => setMode!('images')}
                aria-label="Генерация изображений"
                aria-pressed={mode === 'images'}
                title="Генерация изображений"
                display="inline-flex"
                alignItems="center"
                gap="6px"
                h="28px"
                px="10px"
                borderRadius="9999px"
                bg={mode === 'images' ? surfaceActive : 'transparent'}
                border="1px solid"
                borderColor={
                  mode === 'images' ? borderActive : borderSubtle
                }
                color={mode === 'images' ? accentBlue : textSecondary}
                fontSize="12px"
                fontWeight="500"
                letterSpacing="-0.1px"
                cursor="pointer"
                flexShrink={0}
                _hover={{
                  bg: mode === 'images' ? surfaceActive : surfaceElevated,
                  color: mode === 'images' ? accentBlue : textPrimary,
                }}
                _active={{ transform: 'scale(0.98)' }}
                transition="background-color 0.14s ease, color 0.14s ease, border-color 0.14s ease, transform 0.12s ease"
                sx={{ WebkitTapHighlightColor: 'transparent' }}
              >
                <Icon as={MdImage} boxSize="13px" />
                <Text
                  as="span"
                  display={{ base: 'none', sm: 'inline' }}
                >
                  Картинки
                </Text>
                <Text
                  as="span"
                  display={{ base: 'inline', sm: 'none' }}
                >
                  Арт
                </Text>
              </Box>

              {/* Toggle: Reasoning */}
              <Box
                as="button"
                type="button"
                onClick={() =>
                  setReasoningEnabled!(!reasoningEnabled)
                }
                aria-label="Показывать ход мысли модели"
                aria-pressed={!!reasoningEnabled}
                title="Размышление"
                display="inline-flex"
                alignItems="center"
                gap="6px"
                h="28px"
                px="10px"
                borderRadius="9999px"
                bg={reasoningEnabled ? surfaceActive : 'transparent'}
                border="1px solid"
                borderColor={
                  reasoningEnabled ? borderActive : borderSubtle
                }
                color={reasoningEnabled ? accentBlue : textSecondary}
                fontSize="12px"
                fontWeight="500"
                letterSpacing="-0.1px"
                cursor="pointer"
                flexShrink={0}
                _hover={{
                  bg: reasoningEnabled ? surfaceActive : surfaceElevated,
                  color: reasoningEnabled ? accentBlue : textPrimary,
                }}
                _active={{ transform: 'scale(0.98)' }}
                transition="background-color 0.14s ease, color 0.14s ease, border-color 0.14s ease, transform 0.12s ease"
                sx={{ WebkitTapHighlightColor: 'transparent' }}
              >
                <Icon as={MdPsychology} boxSize="13px" />
                <Text as="span">Размышление</Text>
              </Box>
            </Flex>

            {/* Premium link — always visible, non-intrusive */}
            <Text
              as="a"
              href="/pricing"
              onClick={() => trackGoal('chat_header_premium_click', { source: 'chat_top_bar' })}
              fontSize="12px"
              fontWeight="600"
              color={brandPurple}
              px="10px"
              py="4px"
              borderRadius="9999px"
              border="1px solid"
              borderColor={borderSubtle}
              cursor="pointer"
              flexShrink={0}
              textDecoration="none"
              _hover={{
                bg: surfaceElevated,
                borderColor: brandPurple,
              }}
              transition="background-color 0.14s ease, border-color 0.14s ease"
              sx={{ WebkitTapHighlightColor: 'transparent' }}
            >
              Premium — 249 ₽
            </Text>

            {/* Right: clear-chat — tiny muted icon, prevailing surface */}
            {!!messages?.length && (
              <Box
                as="button"
                type="button"
                onClick={() => {
                  if (loading) return;
                  messagesService.currentDialog = '';
                  setMessages!([]);
                }}
                aria-label="Очистить диалог"
                title="Очистить диалог"
                display="inline-flex"
                alignItems="center"
                justifyContent="center"
                boxSize="28px"
                borderRadius="9999px"
                bg="transparent"
                color={textSecondary}
                cursor={loading ? 'not-allowed' : 'pointer'}
                flexShrink={0}
                opacity={loading ? 0.4 : 1}
                pointerEvents={loading ? 'none' : 'auto'}
                _hover={{ bg: surfaceElevated, color: 'red.400' }}
                transition="background-color 0.14s ease, color 0.14s ease"
                sx={{ WebkitTapHighlightColor: 'transparent' }}
              >
                <Icon as={MdDelete} boxSize="15px" />
              </Box>
            )}
          </Flex>

          {/* ── Input row — textarea + send/stop ───────────────── */}
          <Flex
            w="100%"
            maxWidth="100%"
            minWidth={0}
            alignItems="end"
            gap="6px"
          >
            <Box flexShrink={0} pb="2px">
              <Attachment />
            </Box>
            <Textarea
              w="100%"
              minWidth={0}
              onKeyDown={(event: any) => {
                if (event.key !== 'Enter') return;
                if (event.shiftKey) return;
                event.preventDefault();
                if (loading) return;
                handleSend();
              }}
              resize="none"
              rows={1}
              maxRows={8}
              minH="40px"
              border="none"
              bg="transparent"
              borderRadius="14px"
              px="6px"
              py={{ base: '8px', md: '10px' }}
              me="0"
              overflowY="auto"
              sx={{
                '::-webkit-scrollbar': { display: 'none' },
              }}
              fontSize={{ base: '15px', md: '16px' }}
              fontWeight="400"
              lineHeight="1.5"
              letterSpacing="-0.2px"
              _focus={{ borderColor: 'none', boxShadow: 'none' }}
              _focusVisible={{ boxShadow: 'none' }}
              color={textPrimary}
              _placeholder={placeholderColor}
              placeholder={
                webSearch
                  ? 'Задайте вопрос — найду источники…'
                  : 'Спросите ИИСеть…'
              }
              ref={ref}
              minRows={1}
              value={inputCode}
              as={ResizeTextareaApp}
              onChange={(e: any) => {
                handleChange(e);
              }}
            />

            {/* Send → Stop. Один аккуратный круг, морфит цветом/иконкой. */}
            <Button
              py="0"
              px="0"
              fontSize="sm"
              borderRadius="9999px"
              w={{ base: '36px', md: '40px' }}
              h={{ base: '36px', md: '40px' }}
              minW={{ base: '36px', md: '40px' }}
              flexShrink={0}
              bg={loading ? 'transparent' : accentBlue}
              color={loading ? 'red.500' : 'white'}
              border={loading ? '1px solid' : '1px solid transparent'}
              borderColor={loading ? 'rgba(239,68,68,0.32)' : 'transparent'}
              boxShadow="none"
              transition="background-color 0.16s ease, color 0.12s ease, border-color 0.12s ease, transform 0.12s ease"
              _hover={{
                bg: loading
                  ? 'rgba(239,68,68,0.08)'
                  : accentBlueHover,
                borderColor: loading
                  ? 'rgba(239,68,68,0.55)'
                  : 'transparent',
              }}
              _active={{ transform: 'scale(0.94)' }}
              _disabled={{
                opacity: 0.4,
                cursor: 'not-allowed',
                bg: loading ? 'transparent' : accentBlue,
              }}
              onClick={() =>
                loading ? abortRequest?.() : handleSend()
              }
              isDisabled={!loading && !inputCode.trim()}
              aria-label={loading ? 'Остановить' : 'Отправить'}
              title={loading ? 'Остановить' : 'Отправить'}
            >
              <Icon
                as={loading ? FaStopCircle : MdSend}
                boxSize={loading ? '16px' : '18px'}
              />
            </Button>
          </Flex>
          </Box>{/* ── /Floating composer card */}
        </Box>
      </Box>
    </Grid>
  );
}

// ──────────────────────────────────────────────────────────────────
//  ProjectChatBanner — компактная плашка, показываемая в /chat когда
//  активен проект. Подгружает chip данные (title + nextStep) и даёт
//  «Отключить», чтобы выйти из контекста проекта.
// ──────────────────────────────────────────────────────────────────

function ProjectChatBanner({
  activeProjectId,
  chip,
  setChip,
  onSendAction,
  onOpenSources,
  onCompareWithWeb,
  sourceCount,
  memoryCount,
  onDisable,
}: {
  activeProjectId: string;
  chip: IProjectChip | null | undefined;
  setChip?: (chip: IProjectChip | null) => void;
  onSendAction?: (actionText: string) => void;
  onOpenSources?: () => void;
  onCompareWithWeb?: () => void;
  sourceCount?: number;
  memoryCount?: number;
  onDisable: () => void;
}) {
  const [project, setProject] = useState<IProjectUI | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    projectsService
      .get(activeProjectId)
      .then((p) => {
        if (cancelled) return;
        setProject(p);
        if (p) {
          setChip?.({
            _id: p._id,
            title: p.title,
            nextStep: p.nextStep,
          });
        } else {
          setChip?.(null);
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [activeProjectId]);

  const accentBlue = useColorModeValue('#0066cc', '#2997ff');
  const accentBlueHover = useColorModeValue('#0071e3', '#5fb1ff');
  // Apple-like light surface — без backdrop-blur и тёмного glass,
  // которые делали панель похожей на админ-dashboard и конфликтовали
  // со скроллом чата.
  const surface = useColorModeValue('#ffffff', 'rgba(28,28,32,0.78)');
  const hairline = useColorModeValue(
    'rgba(0,0,0,0.08)',
    'rgba(255,255,255,0.10)',
  );
  const accentSoftBg = useColorModeValue(
    'rgba(0,102,204,0.10)',
    'rgba(41,151,255,0.16)',
  );
  const textPrimary = useColorModeValue('#1d1d1f', '#f5f5f7');
  const textSecondary = useColorModeValue(
    '#6e6e73',
    'rgba(245,245,247,0.62)',
  );

  // Если project ещё не загружен, но есть chip (например, из стрима) —
  // используем chip; иначе показываем skeleton-friendly placeholder.
  const title = project?.title || chip?.title || '';
  const nextStep = project?.nextStep || chip?.nextStep || '';

  if (!title && !isLoading && !project) {
    // Проект может быть удалён или недоступен — тихо ничего не рендерим.
    return null;
  }

  // ── Quick actions для project banner ────────────────────────────
  // Берём suggestedActions из проекта; если их нет — fallback на три
  // универсальных. «Отключить» обрабатывается отдельной кнопкой.
  const projectSuggested =
    (project?.suggestedActions && project.suggestedActions.length > 0
      ? project.suggestedActions
      : ['Составить план', 'Найти риски', 'Следующий шаг']
    ).slice(0, 4);

  const sendForAction = (action: string) => {
    if (!onSendAction) return;
    const titleForPrompt = title || 'этого проекта';
    onSendAction(
      `Помоги: ${action} в рамках проекта «${titleForPrompt}».`,
    );
  };

  // ── Apple-like project workspace panel ──────────────────────────
  // Цели:
  //   1) лёгкая светлая поверхность вместо glass/dark dashboard;
  //   2) однозначный primary CTA для источников — главная скрытая
  //      фича «Умных проектов»;
  //   3) внятный empty-state, когда источников нет;
  //   4) «Выйти из проекта» как тихий text-link, а не chip.
  const hasZeroSources =
    typeof sourceCount === 'number' && sourceCount === 0;
  const FONT_TEXT =
    "'SF Pro Text', -apple-system, BlinkMacSystemFont, system-ui, sans-serif";
  const FONT_DISPLAY =
    "'SF Pro Display', -apple-system, BlinkMacSystemFont, system-ui, sans-serif";

  return (
    <Flex
      direction="column"
      bg={surface}
      border="1px solid"
      borderColor={hairline}
      borderRadius={{ base: '14px', md: '16px' }}
      boxShadow="0 1px 2px rgba(15,23,42,0.04), 0 6px 20px -10px rgba(15,23,42,0.10)"
      overflow="hidden"
      width="100%"
      maxW="100%"
      minW={0}
    >
      {/* ── Header — eyebrow + title + Выйти из проекта ─────────── */}
      <Flex
        direction="column"
        gap="6px"
        px={{ base: '14px', md: '18px' }}
        pt={{ base: '14px', md: '16px' }}
        pb={{ base: '12px', md: '14px' }}
      >
        <Flex align="center" justify="space-between" gap="10px" minW={0}>
          <Flex align="center" gap="8px" minW={0}>
            <Flex
              boxSize="22px"
              borderRadius="6px"
              bg={accentSoftBg}
              align="center"
              justify="center"
              flexShrink={0}
            >
              <Icon as={MdAutoAwesome} boxSize="13px" color={accentBlue} />
            </Flex>
            <Text
              fontFamily={FONT_TEXT}
              fontSize="10px"
              fontWeight="700"
              letterSpacing="0.5px"
              textTransform="uppercase"
              color={accentBlue}
              noOfLines={1}
            >
              Рабочая комната
            </Text>
          </Flex>
          <Box
            as="button"
            type="button"
            onClick={onDisable}
            fontFamily={FONT_TEXT}
            fontSize="12px"
            fontWeight="500"
            color={textSecondary}
            bg="transparent"
            cursor="pointer"
            sx={{ WebkitTapHighlightColor: 'transparent' }}
            _hover={{ color: textPrimary }}
            transition="color 0.15s ease"
            flexShrink={0}
            px="2px"
            py="2px"
            borderRadius="6px"
            aria-label="Выйти из проекта"
          >
            Выйти из проекта
          </Box>
        </Flex>

        <Text
          fontFamily={FONT_DISPLAY}
          fontSize={{ base: '17px', md: '20px' }}
          fontWeight="600"
          color={textPrimary}
          letterSpacing="-0.32px"
          lineHeight="1.2"
          noOfLines={1}
          wordBreak="break-word"
        >
          {title || (isLoading ? 'Загрузка…' : '')}
        </Text>

        {nextStep && (
          <Text
            fontFamily={FONT_TEXT}
            fontSize="13px"
            color={textSecondary}
            lineHeight="1.45"
            noOfLines={2}
            wordBreak="break-word"
          >
            Следующий шаг: {nextStep}
          </Text>
        )}
      </Flex>

      {/* ── Divider ──────────────────────────────────────────────── */}
      <Box h="1px" bg={hairline} />

      {/* ── Actions row ──────────────────────────────────────────── */}
      <Flex
        direction="column"
        gap="10px"
        px={{ base: '14px', md: '18px' }}
        py={{ base: '12px', md: '14px' }}
      >
        {hasZeroSources && (
          <Text
            fontFamily={FONT_TEXT}
            fontSize="12px"
            color={textSecondary}
            lineHeight="1.45"
          >
            Добавьте файл, ссылку или заметку — ИИСеть будет отвечать с
            учётом ваших материалов.
          </Text>
        )}

        {(onOpenSources || onCompareWithWeb) && (
          <Flex gap="8px" flexWrap="wrap" align="center" minW={0}>
            {onOpenSources && (
              <Button
                onClick={onOpenSources}
                bg={accentBlue}
                color="white"
                borderRadius="9999px"
                h="34px"
                px="16px"
                fontFamily={FONT_TEXT}
                fontWeight="500"
                fontSize="13px"
                letterSpacing="-0.1px"
                _hover={{ bg: accentBlueHover }}
                _active={{ transform: 'scale(0.98)' }}
                transition="background-color 0.15s ease, transform 0.15s ease"
                flexShrink={0}
              >
                {hasZeroSources
                  ? 'Добавить источники'
                  : `Источники · ${sourceCount}`}
              </Button>
            )}
            {onCompareWithWeb && !hasZeroSources && (
              <Button
                onClick={onCompareWithWeb}
                bg="transparent"
                color={textPrimary}
                border="1px solid"
                borderColor={hairline}
                borderRadius="9999px"
                h="34px"
                px="14px"
                fontFamily={FONT_TEXT}
                fontWeight="500"
                fontSize="13px"
                _hover={{
                  borderColor: accentBlue,
                  color: accentBlue,
                  bg: 'transparent',
                }}
                _active={{ transform: 'scale(0.98)' }}
                transition="border-color 0.15s ease, color 0.15s ease, transform 0.15s ease"
                flexShrink={0}
              >
                Сравнить с интернетом
              </Button>
            )}
            {typeof memoryCount === 'number' && memoryCount > 0 && (
              <Text
                ml={{ base: '0', md: 'auto' }}
                fontFamily={FONT_TEXT}
                fontSize="12px"
                color={textSecondary}
                letterSpacing="-0.05px"
                flexShrink={0}
              >
                Память: {memoryCount}
              </Text>
            )}
          </Flex>
        )}

        {onSendAction && projectSuggested.length > 0 && (
          <Flex
            gap="6px"
            flexWrap="wrap"
            overflowX="auto"
            minW={0}
            maxW="100%"
            sx={{
              '::-webkit-scrollbar': { display: 'none' },
              scrollbarWidth: 'none',
            }}
          >
            {projectSuggested.map((act) => (
              <Box
                key={act}
                as="button"
                type="button"
                onClick={() => sendForAction(act)}
                px="10px"
                py="5px"
                borderRadius="9999px"
                bg="transparent"
                border="1px solid"
                borderColor={hairline}
                color={textSecondary}
                fontFamily={FONT_TEXT}
                fontSize="12px"
                fontWeight="500"
                letterSpacing="-0.1px"
                lineHeight="1.3"
                cursor="pointer"
                sx={{ WebkitTapHighlightColor: 'transparent' }}
                _hover={{
                  borderColor: accentBlue,
                  color: accentBlue,
                  bg: 'rgba(0,102,204,0.04)',
                }}
                transition="border-color 0.15s ease, color 0.15s ease, background-color 0.15s ease"
                flexShrink={0}
                maxW="100%"
                whiteSpace="nowrap"
              >
                {act}
              </Box>
            ))}
            {nextStep && (
              <Box
                as="button"
                type="button"
                onClick={() => sendForAction(nextStep)}
                px="10px"
                py="5px"
                borderRadius="9999px"
                bg={accentSoftBg}
                border="1px solid"
                borderColor="transparent"
                color={accentBlue}
                fontFamily={FONT_TEXT}
                fontSize="12px"
                fontWeight="600"
                letterSpacing="-0.1px"
                lineHeight="1.3"
                cursor="pointer"
                sx={{ WebkitTapHighlightColor: 'transparent' }}
                _hover={{ bg: 'rgba(0,102,204,0.18)' }}
                transition="background-color 0.15s ease"
                flexShrink={0}
                maxW="100%"
                whiteSpace="nowrap"
              >
                → Следующий шаг
              </Box>
            )}
          </Flex>
        )}
      </Flex>
    </Flex>
  );
}

export default GptChat;
