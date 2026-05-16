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
  const mainBg = useColorModeValue('#fdfeff', 'navy.900');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.200');
  const descriptionColor = useColorModeValue('gray.500', 'gray.400');
  const inputColor = useColorModeValue('navy.700', 'white');
  const brandColor = useColorModeValue('#fdfeff', 'navy.900');
  const quickPromptCardBg = useColorModeValue('white', 'navy.800');
  const placeholderColor = useColorModeValue(
    { color: 'gray.500' },
    { color: 'whiteAlpha.600' },
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

  console.log(attachmentsService.youTube);
  return (
    <Grid
      className="chat"
      position="relative"
      ref={ref}
      height="100%"
      templateRows="1fr auto"
    >
      <Flex
        onClick={abortRequest}
        borderRadius="16px"
        position="fixed"
        background={mainBg}
        bottom="180px"
        left="50%"
        zIndex="2"
        transform={{ base: 'translate(-50%, 0)', xl: 'translate(45%, 0)' }}
        transition="opacity 1s"
        opacity={loading ? '1' : '0'}
        pointerEvents={loading ? 'all' : 'none'}
      >
        <Button
          disabled={!loading}
          variant="outline"
          color="red.500"
          leftIcon={<Icon as={FaStopCircle} width="24px" height="24px" />}
        >
          Остановить
        </Button>
      </Flex>
      <Flex direction="column" scrollBehavior="smooth" gap="20px">
        {messages?.length === 0 && (
          <>
            <Flex
              margin="0 auto"
              maxWidth="400px"
              marginTop
              mt={{ base: '0px', md: '5%' }}
              textAlign="center"
              alignItems="center"
              direction="column"
            >
              <Icon
                as={LogoChat}
                width={{ base: '230px', md: '330px' }}
                height={{ base: '230px', md: '330px' }}
                color={brandColor}
              />
              <Heading mt="12px" size="md">
                Начните Диалог
              </Heading>
              <Text color={descriptionColor} mt="8px" textStyle="md">
                Генерируйте идеи, код, изображения в одном диалоге!
              </Text>
            </Flex>

            <SimpleGrid
              mt={{ base: '6', md: '10' }}
              columns={{ base: 1, md: 2, xl: 3 }}
              spacing={{ base: 4, md: 5 }}
              w="100%"
            >
              {visibleQuickPrompts.map((prompt) => (
                <Card
                  key={prompt.id}
                  variant="outline"
                  borderRadius="24px"
                  borderColor={borderColor}
                  bg={quickPromptCardBg}
                  cursor="pointer"
                  transition="all 0.2s ease"
                  _hover={{
                    transform: 'translateY(-4px)',
                    boxShadow: 'xl',
                    borderColor: 'purple.400',
                  }}
                  onClick={() => handleQuickPromptClick(prompt.prompt)}
                >
                  <CardBody>
                    <Tag
                      size="sm"
                      variant="subtle"
                      colorScheme={prompt.colorScheme as any}
                      mb="3"
                    >
                      {prompt.category}
                    </Tag>
                    <Heading size="sm" mb="1">
                      {prompt.title}
                    </Heading>
                    <Text fontSize="sm" color={descriptionColor} noOfLines={3}>
                      {prompt.description}
                    </Text>
                    <Flex mt="4" alignItems="center" justifyContent="space-between">
                      <Text fontSize="xs" color={descriptionColor}>
                        Нажмите, чтобы задать вопрос
                      </Text>
                      <Icon as={MdAutoAwesome} boxSize={4} color="purple.400" />
                    </Flex>
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
      <Flex
        marginTop="12px"
        marginBottom="-30px"
        position="sticky"
        bottom="0px"
        bg={brandColor}
        borderRadius={'25px'}
        paddingLeft={{ base: '0px', md: '13px' }}
        w="100%"
      >
        <Grid width="100%" maxWidth={{ base: '100vh', md: '100%' }}>
          {model?.includes('gemini') && attachmentsService.hasAttachments() && (
            <Accordion
              defaultIndex={[0]}
              allowToggle
              maxWidth="calc(100vw - 32px)"
            >
              <AccordionItem borderBottom="none">
                <h2>
                  <AccordionButton pl={1.5} pb={3} pt={3}>
                    <Flex w="100%" gap="6px" alignItems="center">
                      <Heading
                        as="h6"
                        size="md"
                        fontSize="1.1rem"
                        textAlign="left"
                      >
                        Документы диалога{' '}
                      </Heading>
                      <Tag size="md" colorScheme="brand" borderRadius="full">
                        {attachmentsService.sizeAttachments()}
                      </Tag>
                    </Flex>
                    <AccordionIcon />
                  </AccordionButton>
                </h2>
                <AccordionPanel pb={0} pl={0} pr={0}>
                  <Box
                    overflowX={{ base: 'auto', lg: 'initial' }}
                    className="models"
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
          <Divider mb="20px" width="100%" placeSelf="center" />
          <Flex
            className="models"
            overflowX={{ base: 'auto', lg: 'initial' }}
            gap="12px"
          >
            <Flex
              gap="2px"
              align="center"
              border="1px solid var(--chakra-colors-chakra-border-color)"
              borderRadius="20px"
              padding="4px"
              paddingLeft="12px"
            >
              <Switch
                isChecked={mode === 'chat'}
                onChange={() => setMode!('chat')}
              />
              <Button
                marginLeft="2px"
                paddingLeft="8px"
                paddingRight="8px"
                variant="ghost"
                onClick={() => setModelsModalOpen!(true)}
              >
                🤖 {(llmMap as any)[model!]}
              </Button>
            </Flex>
            <Flex
              onClick={handleToggleWebSearch}
              gap="2px"
              align="center"
              border="1px solid var(--chakra-colors-chakra-border-color)"
              borderRadius="20px"
              padding="4px"
              paddingLeft="12px"
            >
              <Switch style={{ pointerEvents: 'none' }} isChecked={webSearch} />
              <Button
                marginLeft="2px"
                paddingLeft="8px"
                paddingRight="8px"
                variant="ghost"
              >
                🌐 Web Поиск
              </Button>
            </Flex>
            <Flex
              gap="2px"
              align="center"
              border="1px solid var(--chakra-colors-chakra-border-color)"
              borderRadius="20px"
              padding="4px"
              paddingLeft="12px"
            >
              <Switch
                onChange={() => setMode!('images')}
                isChecked={mode === 'images'}
              />
              <Button
                marginLeft="2px"
                paddingLeft="8px"
                paddingRight="8px"
                variant="ghost"
              >
                🖼️ Генерация изображений
              </Button>
            </Flex>
          </Flex>
          <Flex w="100%" p="16px" pl="0px" pr="0px" alignItems="end">
            <Flex w="100%" alignItems="center" gap="6px">
              <Attachment />
              <Textarea
                w="100%"
                onKeyDown={(event: any) => {
                  if (event.key !== 'Enter') return;
                  if (event.shiftKey) return;

                  event.preventDefault();
                  handleSend();
                }}
                resize="none"
                rows={1}
                maxRows={8}
                minH="54px"
                border="1px solid"
                borderColor={borderColor}
                borderRadius="20px"
                p="15px 20px"
                me="10px"
                overflow-y="auto"
                sx={{
                  '::-webkit-scrollbar': {
                    display: 'none',
                  },
                }}
                fontSize="sm"
                fontWeight="500"
                _focus={{ borderColor: 'none' }}
                color={inputColor}
                _placeholder={placeholderColor}
                placeholder="Ваш запрос.."
                ref={ref}
                minRows={1}
                value={inputCode}
                as={ResizeTextareaApp}
                onChange={(e: any) => {
                  handleChange(e);
                }}
              />
            </Flex>
            <Button
              variant="red"
              border="1px solid"
              borderColor={borderColor}
              fontSize="sm"
              borderRadius="20px"
              ms="auto"
              mr="10px"
              h="54px"
              onClick={() => {
                messagesService.currentDialog = '';
                setMessages!([]);
              }}
              isDisabled={loading || !messages?.length}
            >
              <Icon as={MdDelete} color="red.500" width="25px" height="25px" />
            </Button>
            <Button
              variant="primary"
              py="20px"
              px="16px"
              fontSize="sm"
              borderRadius="20px"
              ms="auto"
              w={{ base: '70px' }}
              h="54px"
              onClick={() => handleSend()}
              isLoading={loading}
            >
              <Icon as={MdSend} width="25px" height="25px" color="white" />
            </Button>
          </Flex>
        </Grid>
      </Flex>
    </Grid>
  );
}

export default GptChat;
