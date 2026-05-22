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
import { MdAutoAwesome, MdDelete, MdSend } from 'react-icons/md';
import { trackGoal } from '@/utils/metrics';
import { FaStopCircle } from 'react-icons/fa';
import React, { useContext, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ChatAiContext } from '@/contexts/ChatAiContext';
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

const llmMap = {
  'mistral-large-latest': 'Mistral Large',
  'mistral-small': 'Mistral Small',
  'deepseek-ai/DeepSeek-V3': 'Deepseek V3',
  'deepseek-ai/DeepSeek-V4-Pro': 'DeepSeek V4 Pro',
  'Qwen/Qwen3.6-35B-A3B': 'Qwen 3.6 35B',
  'google/gemini-2.0-flash-thinking-exp-1219:free': 'Gemini-2 Flash Thinking',
  'google/gemini-2.0-flash-thinking-exp:free': 'Gemini-2 Flash Thinking',
  'gemini-2.5-flash': 'Gemini-2.5 Flash Thinking',
  'gemini-2.5-pro': 'Gemini-2.5 Pro Thinking',
  'gemini-2.5-flash-lite': 'Gemini-2.5 Flash Lite',
  'gemini-2.5-flash-preview': 'Gemini-2.5 Flash Thinking',
  'deepseek-ai/DeepSeek-R1': 'Deepseek R1',
  'meta-llama/Llama-3.3-70B-Instruct-Turbo': 'LLama-3',
};


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
  } = useContext(ChatAiContext);

  const [visibleQuickPrompts, setVisibleQuickPrompts] = useState(
    QUICK_PROMPTS.slice(0, 6),
  );

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
      {/* ── Floating stop button — glass pill ───────────────────── */}
      <Flex
        onClick={abortRequest}
        borderRadius="9999px"
        position="fixed"
        bg={surfaceGlass}
        backdropFilter="blur(14px) saturate(160%)"
        border="1px solid"
        borderColor={borderSubtle}
        boxShadow="0 4px 16px rgba(0,0,0,0.06)"
        bottom={{ base: '140px', md: '180px' }}
        left="50%"
        zIndex={30}
        transform={{ base: 'translate(-50%, 0)', xl: 'translate(45%, 0)' }}
        transition="opacity 0.2s ease, transform 0.18s ease"
        opacity={loading ? '1' : '0'}
        pointerEvents={loading ? 'all' : 'none'}
        cursor="pointer"
        _hover={{
          transform: {
            base: 'translate(-50%, -1px)',
            xl: 'translate(45%, -1px)',
          },
        }}
        px="2px"
        maxWidth="calc(100% - 24px)"
      >
        <Button
          disabled={!loading}
          variant="ghost"
          color="red.500"
          borderRadius="9999px"
          fontSize="14px"
          fontWeight="500"
          letterSpacing="-0.2px"
          h="34px"
          _hover={{ bg: 'transparent' }}
          leftIcon={<Icon as={FaStopCircle} width="15px" height="15px" />}
        >
          Остановить
        </Button>
      </Flex>

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
            {messages?.length === 0 && (
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

      {/* ── Composer (sticky) — Liquid Glass dock ─────────────────── */}
      <Box
        position="sticky"
        bottom="0"
        zIndex={20}
        bg={surfaceGlass}
        backdropFilter="blur(22px) saturate(180%)"
        borderTop="1px solid"
        borderColor={borderGlass}
        boxShadow={composerShadow}
        marginBottom="-30px"
        width="100%"
        maxWidth="100%"
        minWidth={0}
        overflowX="hidden"
        sx={{
          WebkitBackdropFilter: 'blur(22px) saturate(180%)',
          position: 'sticky',
          // Top-light highlight (Apple dock material)
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '0',
            left: '0',
            right: '0',
            height: '40%',
            pointerEvents: 'none',
            background: glassShine,
            opacity: 0.65,
            zIndex: 0,
          },
          '& > *': { position: 'relative', zIndex: 1 },
        }}
      >
        <Box
          maxWidth="980px"
          mx="auto"
          width="100%"
          minWidth={0}
          px={{ base: '12px', md: '16px' }}
          pt={{ base: '10px', md: '14px' }}
          pb={{
            base: 'calc(10px + env(safe-area-inset-bottom))',
            md: '14px',
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

          {/* Chips — uniform 32px height, horizontally scrollable on overflow */}
          <Flex
            className="models"
            overflowX="auto"
            overflowY="hidden"
            gap="6px"
            mb="10px"
            width="100%"
            maxWidth="100%"
            minWidth={0}
            sx={{
              '::-webkit-scrollbar': { display: 'none' },
              scrollbarWidth: 'none',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            {/* Model chip */}
            <Flex
              gap="6px"
              align="center"
              h="32px"
              bg={mode === 'chat' ? surfaceActive : surface}
              border="1px solid"
              borderColor={mode === 'chat' ? borderActive : border}
              borderRadius="9999px"
              pl="10px"
              pr="4px"
              transition="background 0.14s ease, border-color 0.14s ease"
              flexShrink={0}
            >
              <Switch
                size="sm"
                isChecked={mode === 'chat'}
                onChange={() => setMode!('chat')}
              />
              <Button
                paddingLeft="8px"
                paddingRight="12px"
                variant="ghost"
                size="sm"
                h="26px"
                fontSize="13px"
                fontWeight="500"
                letterSpacing="-0.2px"
                color={mode === 'chat' ? accentBlue : textPrimary}
                borderRadius="9999px"
                _hover={{ bg: 'transparent' }}
                onClick={() => setModelsModalOpen!(true)}
              >
                🤖 {(llmMap as any)[model!]}
              </Button>
            </Flex>

            {/* Web Search chip */}
            <Flex
              onClick={handleToggleWebSearch}
              gap="6px"
              align="center"
              h="32px"
              bg={webSearch ? surfaceActive : surface}
              border="1px solid"
              borderColor={webSearch ? borderActive : border}
              borderRadius="9999px"
              pl="10px"
              pr="4px"
              transition="background 0.14s ease, border-color 0.14s ease"
              cursor="pointer"
              flexShrink={0}
            >
              <Switch
                size="sm"
                style={{ pointerEvents: 'none' }}
                isChecked={webSearch}
              />
              <Button
                paddingLeft="8px"
                paddingRight="12px"
                variant="ghost"
                size="sm"
                h="26px"
                fontSize="13px"
                fontWeight="500"
                letterSpacing="-0.2px"
                color={webSearch ? accentBlue : textPrimary}
                borderRadius="9999px"
                _hover={{ bg: 'transparent' }}
              >
                🌐 Web Поиск
              </Button>
            </Flex>

            {/* Image gen chip */}
            <Flex
              gap="6px"
              align="center"
              h="32px"
              bg={mode === 'images' ? surfaceActive : surface}
              border="1px solid"
              borderColor={mode === 'images' ? borderActive : border}
              borderRadius="9999px"
              pl="10px"
              pr="4px"
              transition="background 0.14s ease, border-color 0.14s ease"
              flexShrink={0}
            >
              <Switch
                size="sm"
                onChange={() => setMode!('images')}
                isChecked={mode === 'images'}
              />
              <Button
                paddingLeft="8px"
                paddingRight="12px"
                variant="ghost"
                size="sm"
                h="26px"
                fontSize="13px"
                fontWeight="500"
                letterSpacing="-0.2px"
                color={mode === 'images' ? accentBlue : textPrimary}
                borderRadius="9999px"
                _hover={{ bg: 'transparent' }}
              >
                🖼️ Генерация изображений
              </Button>
            </Flex>

            {/* Reasoning chip — controls visibility of model <think> blocks.
                OFF by default. Persisted via useLocalStorageState in provider. */}
            <Flex
              onClick={() => setReasoningEnabled!(!reasoningEnabled)}
              gap="6px"
              align="center"
              h="32px"
              bg={reasoningEnabled ? surfaceActive : surface}
              border="1px solid"
              borderColor={reasoningEnabled ? borderActive : border}
              borderRadius="9999px"
              pl="10px"
              pr="4px"
              transition="background 0.14s ease, border-color 0.14s ease"
              cursor="pointer"
              flexShrink={0}
            >
              <Switch
                size="sm"
                style={{ pointerEvents: 'none' }}
                isChecked={!!reasoningEnabled}
              />
              <Button
                paddingLeft="8px"
                paddingRight="12px"
                variant="ghost"
                size="sm"
                h="26px"
                fontSize="13px"
                fontWeight="500"
                letterSpacing="-0.2px"
                color={reasoningEnabled ? accentBlue : textPrimary}
                borderRadius="9999px"
                _hover={{ bg: 'transparent' }}
              >
                🧩 Размышление
              </Button>
            </Flex>
          </Flex>

          {/* Input + buttons row */}
          <Flex
            w="100%"
            maxWidth="100%"
            minWidth={0}
            alignItems="end"
            gap={{ base: '6px', md: '8px' }}
          >
            <Flex
              flex="1 1 0"
              minWidth={0}
              alignItems="center"
              gap="4px"
              bg={pageBg}
              border="1px solid"
              borderColor={borderSubtle}
              borderRadius="22px"
              transition="border-color 0.16s ease, box-shadow 0.16s ease"
              _focusWithin={{
                borderColor: borderActive,
                boxShadow: '0 0 0 3px rgba(0,102,204,0.10)',
              }}
              pl="6px"
            >
              <Box flexShrink={0}>
                <Attachment />
              </Box>
              <Textarea
                w="100%"
                minWidth={0}
                onKeyDown={(event: any) => {
                  if (event.key !== 'Enter') return;
                  if (event.shiftKey) return;

                  event.preventDefault();
                  handleSend();
                }}
                resize="none"
                rows={1}
                maxRows={8}
                minH="44px"
                border="none"
                bg="transparent"
                borderRadius="20px"
                p={{ base: '11px 10px', md: '12px 16px' }}
                pl="6px"
                me="0"
                overflowY="auto"
                sx={{
                  '::-webkit-scrollbar': {
                    display: 'none',
                  },
                }}
                fontSize={{ base: '14px', md: '15px' }}
                fontWeight="400"
                lineHeight="1.5"
                letterSpacing="-0.2px"
                _focus={{ borderColor: 'none', boxShadow: 'none' }}
                _focusVisible={{ boxShadow: 'none' }}
                color={textPrimary}
                _placeholder={placeholderColor}
                placeholder="Спросите ИИСеть…"
                ref={ref}
                minRows={1}
                value={inputCode}
                as={ResizeTextareaApp}
                onChange={(e: any) => {
                  handleChange(e);
                }}
              />
            </Flex>

            {/* Delete button — calm ghost pill */}
            <Button
              variant="ghost"
              border="1px solid"
              borderColor={borderSubtle}
              bg={pageBg}
              fontSize="sm"
              borderRadius="9999px"
              h={{ base: '40px', md: '44px' }}
              w={{ base: '40px', md: '44px' }}
              minW={{ base: '40px', md: '44px' }}
              flexShrink={0}
              p="0"
              transition="border-color 0.16s ease, background 0.16s ease"
              _hover={{
                borderColor: 'rgba(239,68,68,0.30)',
                bg: surfaceElevated,
              }}
              _active={{ transform: 'scale(0.94)' }}
              onClick={() => {
                messagesService.currentDialog = '';
                setMessages!([]);
              }}
              isDisabled={loading || !messages?.length}
              aria-label="Очистить диалог"
            >
              <Icon as={MdDelete} color="red.400" width="18px" height="18px" />
            </Button>

            {/* Send button — Apple Action Blue */}
            <Button
              py="0"
              px="0"
              fontSize="sm"
              borderRadius="9999px"
              w={{ base: '40px', md: '44px' }}
              h={{ base: '40px', md: '44px' }}
              minW={{ base: '40px', md: '44px' }}
              flexShrink={0}
              bg={accentBlue}
              color="white"
              boxShadow="none"
              transition="background 0.16s ease, transform 0.12s ease"
              _hover={{ bg: accentBlueHover }}
              _active={{ transform: 'scale(0.94)' }}
              onClick={() => handleSend()}
              isLoading={loading}
            >
              <Icon as={MdSend} width="18px" height="18px" color="white" />
            </Button>
          </Flex>
        </Box>
      </Box>
    </Grid>
  );
}

export default GptChat;
