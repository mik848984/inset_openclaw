'use client';

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Badge,
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  Icon,
  IconButton,
  Input,
  SimpleGrid,
  Spinner,
  Tag,
  Text,
  Tooltip,
  useColorModeValue,
} from '@chakra-ui/react';
import {
  MdSearch,
  MdSend,
  MdOpenInNew,
  MdArrowForward,
  MdCheckCircle,
  MdRadioButtonUnchecked,
  MdImage,
  MdShoppingCart,
  MdLocationOn,
  MdSchool,
  MdNewspaper,
  MdScience,
  MdHelpOutline,
  MdLanguage,
  MdLightbulbOutline,
  MdRestore,
} from 'react-icons/md';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useRouter } from 'next/navigation';
import type {
  ProgressStep,
  ProgressStatus,
  SearchEvent,
  SearchIntent,
  SerperEndpoint,
  SourceCard,
} from '@/services/api/SearchService';

const EXAMPLES = [
  'Какие аналоги ChatGPT доступны в России?',
  'Какой банк выбрать для ИП?',
  'Что сейчас происходит на рынке IT-вакансий?',
  'Лучшие наушники для спорта до 15000 ₽',
  'Что проверить при покупке квартиры?',
];

const PROGRESS_STEPS: { key: ProgressStep; label: string }[] = [
  { key: 'understand', label: 'Понимаем запрос' },
  { key: 'search', label: 'Ищем источники' },
  { key: 'open', label: 'Открываем страницы' },
  { key: 'compare', label: 'Сравниваем данные' },
  { key: 'answer', label: 'Готовим ответ' },
];

const INTENT_LABELS: Record<SearchIntent, string> = {
  general: 'Общий ответ',
  news: 'Новости',
  comparison: 'Сравнение',
  shopping: 'Покупка',
  local_places: 'Места рядом',
  research: 'Разбор темы',
  academic: 'Научный поиск',
  patents: 'Патенты',
  how_to: 'Инструкция',
};

const ENDPOINT_LABELS: Record<SerperEndpoint, string> = {
  search: 'Search',
  news: 'News',
  images: 'Images',
  shopping: 'Shopping',
  places: 'Places',
  scholar: 'Scholar',
  patents: 'Patents',
  autocomplete: 'Autocomplete',
  scrape: 'Scrape',
};

const SOURCE_ICON: Record<SerperEndpoint, any> = {
  search: MdLanguage,
  news: MdNewspaper,
  images: MdImage,
  shopping: MdShoppingCart,
  places: MdLocationOn,
  scholar: MdSchool,
  patents: MdScience,
  autocomplete: MdHelpOutline,
  scrape: MdLanguage,
};

type ProgressMap = Partial<Record<ProgressStep, ProgressStatus>>;

interface SearchState {
  query: string;
  intent: SearchIntent | null;
  endpoints: SerperEndpoint[];
  subQueries: string[];
  sources: SourceCard[];
  answer: string;
  followups: string[];
  progress: ProgressMap;
  loading: boolean;
  error: string | null;
}

const INITIAL_STATE: SearchState = {
  query: '',
  intent: null,
  endpoints: [],
  subQueries: [],
  sources: [],
  answer: '',
  followups: [],
  progress: {},
  loading: false,
  error: null,
};

// ──────────────────────────────────────────────────────────────────────────────
// Citation rendering — turn [1], [2] in answer text into clickable badges.
// ──────────────────────────────────────────────────────────────────────────────

const CITATION_RE = /\[(\d+)\]/g;

function transformChildren(
  children: React.ReactNode,
  onCite: (n: number) => void,
  citationColor: string,
  citationBg: string,
): React.ReactNode {
  return React.Children.map(children, (child, idx) => {
    if (typeof child === 'string') {
      const parts: React.ReactNode[] = [];
      let lastIndex = 0;
      let m: RegExpExecArray | null;
      CITATION_RE.lastIndex = 0;
      while ((m = CITATION_RE.exec(child)) !== null) {
        const start = m.index;
        if (start > lastIndex) {
          parts.push(child.slice(lastIndex, start));
        }
        const n = parseInt(m[1], 10);
        parts.push(
          <Box
            as="button"
            type="button"
            key={`cite-${idx}-${start}`}
            display="inline-flex"
            alignItems="center"
            justifyContent="center"
            minW="22px"
            h="22px"
            px="6px"
            mx="2px"
            borderRadius="9999px"
            fontSize="11px"
            fontWeight="700"
            bg={citationBg}
            color={citationColor}
            _hover={{ filter: 'brightness(1.1)' }}
            onClick={(e: React.MouseEvent) => {
              e.preventDefault();
              onCite(n);
            }}
            verticalAlign="middle"
          >
            {n}
          </Box>,
        );
        lastIndex = start + m[0].length;
      }
      if (lastIndex < child.length) {
        parts.push(child.slice(lastIndex));
      }
      return <>{parts}</>;
    }
    if (React.isValidElement(child)) {
      // recurse into element children
      const props = (child as any).props || {};
      if (props.children) {
        return React.cloneElement(child as React.ReactElement, {
          ...props,
          children: transformChildren(
            props.children,
            onCite,
            citationColor,
            citationBg,
          ),
        });
      }
      return child;
    }
    return child;
  });
}

// ──────────────────────────────────────────────────────────────────────────────
// Source card component.
// ──────────────────────────────────────────────────────────────────────────────

function SourceCardView({
  src,
  cardBg,
  borderColor,
  textColor,
  mutedColor,
  highlight,
}: {
  src: SourceCard;
  cardBg: string;
  borderColor: string;
  textColor: string;
  mutedColor: string;
  highlight: boolean;
}) {
  const Icn = SOURCE_ICON[src.source] || MdLanguage;
  return (
    <Box
      id={`src-${src.index}`}
      bg={cardBg}
      borderWidth="1px"
      borderColor={highlight ? '#422AFB' : borderColor}
      borderRadius="14px"
      p="14px"
      transition="border-color 0.15s ease"
      _hover={{ borderColor: '#422AFB' }}
      h="100%"
      display="flex"
      flexDirection="column"
    >
      <Flex align="center" justify="space-between" mb="8px">
        <HStack spacing="6px">
          <Box
            display="inline-flex"
            alignItems="center"
            justifyContent="center"
            w="20px"
            h="20px"
            borderRadius="full"
            bg="#422AFB"
            color="white"
            fontSize="11px"
            fontWeight="700"
          >
            {src.index}
          </Box>
          <Icon as={Icn} color={mutedColor} />
          <Text fontSize="11px" color={mutedColor} fontWeight="600">
            {ENDPOINT_LABELS[src.source]}
          </Text>
        </HStack>
        <Tooltip label="Открыть источник" hasArrow>
          <IconButton
            as="a"
            href={src.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Open"
            icon={<Icon as={MdOpenInNew} />}
            size="xs"
            variant="ghost"
          />
        </Tooltip>
      </Flex>

      {src.thumbnailUrl || src.imageUrl ? (
        <Box
          mb="8px"
          h="80px"
          bg="gray.100"
          borderRadius="8px"
          overflow="hidden"
        >
          {/* plain img to avoid Next/Image domain whitelist headaches */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src.thumbnailUrl || src.imageUrl}
            alt={src.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            loading="lazy"
          />
        </Box>
      ) : null}

      <Text
        fontSize="sm"
        fontWeight="600"
        color={textColor}
        noOfLines={2}
        mb="4px"
      >
        {src.title}
      </Text>

      <Text fontSize="11px" color={mutedColor} mb="6px" noOfLines={1}>
        {src.domain}
      </Text>

      {src.snippet ? (
        <Text fontSize="12px" color={mutedColor} noOfLines={3} mb="8px">
          {src.snippet}
        </Text>
      ) : null}

      <HStack spacing="6px" flexWrap="wrap" mt="auto">
        {src.price ? (
          <Badge colorScheme="purple" fontSize="10px">
            {src.price}
          </Badge>
        ) : null}
        {src.rating ? (
          <Badge colorScheme="yellow" fontSize="10px">
            ★ {src.rating}
            {src.ratingCount ? ` (${src.ratingCount})` : ''}
          </Badge>
        ) : null}
        {src.address ? (
          <Text fontSize="10px" color={mutedColor} noOfLines={1}>
            {src.address}
          </Text>
        ) : null}
        {src.date ? (
          <Text fontSize="10px" color={mutedColor}>
            {src.date}
          </Text>
        ) : null}
        {src.snippetOnly ? (
          <Tooltip
            label="Страница не была загружена полностью — использован только сниппет из поисковой выдачи."
            hasArrow
          >
            <Badge colorScheme="gray" fontSize="10px">
              snippet-only
            </Badge>
          </Tooltip>
        ) : null}
      </HStack>
    </Box>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Main client.
// ──────────────────────────────────────────────────────────────────────────────

export default function SearchClient() {
  const router = useRouter();
  const [state, setState] = useState<SearchState>(INITIAL_STATE);
  const [draft, setDraft] = useState('');
  const abortRef = useRef<AbortController | null>(null);

  const pageBg = useColorModeValue('#fdfeff', 'navy.900');
  const cardBg = useColorModeValue('white', 'navy.800');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.200');
  const textColor = useColorModeValue('navy.700', 'white');
  const mutedColor = useColorModeValue('gray.500', 'gray.400');
  const inputBg = useColorModeValue('white', 'navy.800');
  const exampleBg = useColorModeValue('gray.50', 'whiteAlpha.100');
  const citationBg = useColorModeValue('#EEF0FF', 'whiteAlpha.200');
  const citationColor = useColorModeValue('#422AFB', 'white');
  const stepDoneBg = useColorModeValue('#EEF0FF', 'whiteAlpha.200');
  const stepDoneColor = useColorModeValue('#422AFB', 'white');

  const highlightSource = useCallback((n: number) => {
    const el = document.getElementById(`src-${n}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.style.transition = 'box-shadow 0.4s ease';
      el.style.boxShadow = '0 0 0 3px rgba(66,42,251,0.35)';
      setTimeout(() => {
        el.style.boxShadow = '';
      }, 1400);
    }
  }, []);

  const handleSubmit = useCallback(
    async (overrideQuery?: string) => {
      const q = (overrideQuery ?? draft).trim();
      if (!q) return;

      // cancel any in-flight request
      if (abortRef.current) abortRef.current.abort();
      const ctrl = new AbortController();
      abortRef.current = ctrl;

      setState({
        ...INITIAL_STATE,
        query: q,
        loading: true,
        progress: {
          understand: 'pending',
          search: 'pending',
          open: 'pending',
          compare: 'pending',
          answer: 'pending',
        },
      });
      setDraft('');

      try {
        const res = await fetch('/api/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: q }),
          signal: ctrl.signal,
        });

        if (!res.ok || !res.body) {
          setState((s) => ({
            ...s,
            loading: false,
            error: 'Поиск временно недоступен. Попробуйте ещё раз.',
          }));
          return;
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          let nl = buffer.indexOf('\n');
          while (nl !== -1) {
            const line = buffer.slice(0, nl).trim();
            buffer = buffer.slice(nl + 1);
            nl = buffer.indexOf('\n');
            if (!line) continue;
            let event: SearchEvent | null = null;
            try {
              event = JSON.parse(line) as SearchEvent;
            } catch {
              continue;
            }
            applyEvent(event, setState);
          }
        }
        // flush remainder
        buffer += decoder.decode();
        if (buffer.trim()) {
          try {
            applyEvent(JSON.parse(buffer.trim()) as SearchEvent, setState);
          } catch {
            /* noop */
          }
        }
      } catch (e: any) {
        if (e?.name === 'AbortError') return;
        console.error(e);
        setState((s) => ({
          ...s,
          loading: false,
          error: 'Ошибка сети при загрузке результатов.',
        }));
      } finally {
        setState((s) => ({ ...s, loading: false }));
      }
    },
    [draft],
  );

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setState(INITIAL_STATE);
    setDraft('');
  }, []);

  const continueInChat = useCallback(() => {
    const q = state.query || draft;
    if (!q) return;
    try {
      sessionStorage.setItem('iiset:chat:prefill', q);
    } catch {
      /* noop */
    }
    router.push('/chat');
  }, [state.query, draft, router]);

  const hasResults =
    !!state.query &&
    (state.loading ||
      state.sources.length > 0 ||
      !!state.answer ||
      !!state.error);

  const markdownComponents = useMemo(
    () => ({
      p: ({ children, ...rest }: any) => (
        <p {...rest}>
          {transformChildren(
            children,
            highlightSource,
            citationColor,
            citationBg,
          )}
        </p>
      ),
      li: ({ children, ...rest }: any) => (
        <li {...rest}>
          {transformChildren(
            children,
            highlightSource,
            citationColor,
            citationBg,
          )}
        </li>
      ),
      td: ({ children, ...rest }: any) => (
        <td {...rest}>
          {transformChildren(
            children,
            highlightSource,
            citationColor,
            citationBg,
          )}
        </td>
      ),
    }),
    [highlightSource, citationColor, citationBg],
  );

  return (
    <Flex
      direction="column"
      w="100%"
      maxW="1100px"
      mx="auto"
      pt={{ base: '70px', md: '20px' }}
      pb="40px"
      bg={pageBg}
    >
      {/* Header */}
      <Flex align="center" justify="space-between" mb="18px">
        <HStack spacing="10px">
          <Icon as={MdSearch} w="22px" h="22px" color="#422AFB" />
          <Heading as="h1" size="md" color={textColor}>
            ИИСеть Поиск
          </Heading>
          <Badge colorScheme="purple" fontSize="10px" mt="2px">
            MVP
          </Badge>
        </HStack>
        {hasResults ? (
          <Button
            size="sm"
            variant="ghost"
            leftIcon={<Icon as={MdRestore} />}
            onClick={reset}
          >
            Новый поиск
          </Button>
        ) : null}
      </Flex>

      {!hasResults ? (
        <Box>
          <Heading as="h2" size="lg" color={textColor} mb="6px">
            Что хотите узнать?
          </Heading>
          <Text color={mutedColor} mb="20px">
            Ответы с источниками вместо десятка вкладок.
          </Text>
        </Box>
      ) : null}

      {/* Input */}
      <Box
        bg={inputBg}
        borderWidth="1px"
        borderColor={borderColor}
        borderRadius="16px"
        p="10px"
        mb="14px"
        boxShadow="0px 4px 14px -4px rgba(8,8,8,0.08)"
      >
        <Flex align="center" gap="10px">
          <Icon as={MdSearch} color={mutedColor} ml="8px" w="20px" h="20px" />
          <Input
            value={draft}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setDraft(e.target.value)
            }
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            placeholder={
              hasResults
                ? 'Задайте новый вопрос…'
                : 'Например: какие аналоги ChatGPT доступны в России'
            }
            variant="unstyled"
            color={textColor}
            disabled={state.loading}
          />
          <Button
            colorScheme="purple"
            bg="#422AFB"
            _hover={{ bg: '#3622D6' }}
            isDisabled={!draft.trim() || state.loading}
            isLoading={state.loading}
            onClick={() => handleSubmit()}
            rightIcon={<Icon as={MdSend} />}
          >
            Спросить
          </Button>
        </Flex>
      </Box>

      {/* Examples */}
      {!hasResults ? (
        <Box mb="20px">
          <Text fontSize="xs" color={mutedColor} mb="8px" fontWeight="600">
            Попробуйте:
          </Text>
          <Flex wrap="wrap" gap="8px">
            {EXAMPLES.map((ex) => (
              <Box
                as="button"
                key={ex}
                onClick={() => {
                  setDraft(ex);
                  handleSubmit(ex);
                }}
                bg={exampleBg}
                color={textColor}
                px="12px"
                py="8px"
                borderRadius="9999px"
                fontSize="sm"
                _hover={{ bg: '#EEF0FF', color: '#422AFB' }}
                textAlign="left"
              >
                {ex}
              </Box>
            ))}
          </Flex>
        </Box>
      ) : null}

      {/* Query echo + intent */}
      {hasResults ? (
        <Box mb="14px">
          <Text fontSize="lg" fontWeight="600" color={textColor}>
            «{state.query}»
          </Text>
          {state.intent ? (
            <HStack mt="6px" spacing="6px" flexWrap="wrap">
              <Tag size="sm" colorScheme="purple">
                {INTENT_LABELS[state.intent]}
              </Tag>
              {state.endpoints.map((ep) => (
                <Tag key={ep} size="sm" variant="subtle" colorScheme="gray">
                  {ENDPOINT_LABELS[ep]}
                </Tag>
              ))}
            </HStack>
          ) : null}
        </Box>
      ) : null}

      {/* Progress steps */}
      {hasResults ? (
        <Box mb="18px">
          <Flex wrap="wrap" gap="8px">
            {PROGRESS_STEPS.map((step) => {
              const status = state.progress[step.key] || 'pending';
              const isDone = status === 'done';
              const isRunning = status === 'running';
              return (
                <Flex
                  key={step.key}
                  align="center"
                  gap="6px"
                  px="10px"
                  py="6px"
                  borderRadius="9999px"
                  bg={isDone || isRunning ? stepDoneBg : exampleBg}
                  color={isDone || isRunning ? stepDoneColor : mutedColor}
                  fontSize="12px"
                  fontWeight="600"
                  opacity={status === 'pending' ? 0.65 : 1}
                >
                  {isRunning ? (
                    <Spinner size="xs" />
                  ) : isDone ? (
                    <Icon as={MdCheckCircle} />
                  ) : (
                    <Icon as={MdRadioButtonUnchecked} />
                  )}
                  <Text>{step.label}</Text>
                </Flex>
              );
            })}
          </Flex>
        </Box>
      ) : null}

      {/* Error banner */}
      {state.error ? (
        <Box
          bg="red.50"
          borderWidth="1px"
          borderColor="red.200"
          color="red.700"
          borderRadius="12px"
          p="12px"
          mb="14px"
          fontSize="sm"
        >
          {state.error}
        </Box>
      ) : null}

      {/* Sources */}
      {state.sources.length > 0 ? (
        <Box mb="20px">
          <Text
            fontSize="xs"
            color={mutedColor}
            fontWeight="700"
            mb="8px"
            textTransform="uppercase"
            letterSpacing="0.5px"
          >
            Источники
          </Text>
          <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} spacing="10px">
            {state.sources.map((src) => (
              <SourceCardView
                key={`${src.index}-${src.url}`}
                src={src}
                cardBg={cardBg}
                borderColor={borderColor}
                textColor={textColor}
                mutedColor={mutedColor}
                highlight={false}
              />
            ))}
          </SimpleGrid>
        </Box>
      ) : null}

      {/* Answer */}
      {state.answer || state.progress.answer === 'running' ? (
        <Box
          bg={cardBg}
          borderWidth="1px"
          borderColor={borderColor}
          borderRadius="16px"
          p="20px"
          mb="16px"
        >
          <Text
            fontSize="xs"
            color={mutedColor}
            fontWeight="700"
            mb="10px"
            textTransform="uppercase"
            letterSpacing="0.5px"
          >
            Ответ
          </Text>
          <Box
            className="iiset-search-answer"
            color={textColor}
            sx={{
              fontSize: '15px',
              lineHeight: '1.65',
              'p, ul, ol, table': { mb: '12px' },
              h1: { fontSize: '20px', fontWeight: 700, mb: '8px', mt: '14px' },
              h2: { fontSize: '18px', fontWeight: 700, mb: '8px', mt: '14px' },
              h3: { fontSize: '16px', fontWeight: 700, mb: '6px', mt: '12px' },
              'ul, ol': { pl: '22px' },
              li: { mb: '4px' },
              table: {
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '13px',
              },
              'th, td': {
                borderWidth: '1px',
                borderColor: borderColor,
                px: '8px',
                py: '6px',
                textAlign: 'left',
              },
              a: { color: '#422AFB', textDecoration: 'underline' },
            }}
          >
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={markdownComponents as any}
            >
              {state.answer || ' '}
            </ReactMarkdown>
            {state.loading && state.progress.answer === 'running' ? (
              <Box as="span" display="inline-block" ml="2px">
                <Spinner size="xs" />
              </Box>
            ) : null}
          </Box>
        </Box>
      ) : null}

      {/* Follow-ups + actions */}
      {state.followups.length > 0 ||
      (!state.loading && state.answer) ? (
        <Box mb="20px">
          {state.followups.length > 0 ? (
            <>
              <HStack spacing="6px" mb="8px">
                <Icon as={MdLightbulbOutline} color={mutedColor} />
                <Text
                  fontSize="xs"
                  color={mutedColor}
                  fontWeight="700"
                  textTransform="uppercase"
                  letterSpacing="0.5px"
                >
                  Уточняющие вопросы
                </Text>
              </HStack>
              <Flex wrap="wrap" gap="8px" mb="14px">
                {state.followups.map((q) => (
                  <Box
                    as="button"
                    key={q}
                    onClick={() => handleSubmit(q)}
                    bg={exampleBg}
                    color={textColor}
                    px="12px"
                    py="8px"
                    borderRadius="9999px"
                    fontSize="sm"
                    _hover={{ bg: '#EEF0FF', color: '#422AFB' }}
                    textAlign="left"
                  >
                    {q}
                  </Box>
                ))}
              </Flex>
            </>
          ) : null}

          <HStack spacing="8px">
            <Button
              size="sm"
              variant="outline"
              rightIcon={<Icon as={MdArrowForward} />}
              onClick={continueInChat}
            >
              Продолжить в чате
            </Button>
            <Tooltip
              label="Скоро — сохранение результатов в проекты"
              hasArrow
            >
              <Button size="sm" variant="ghost" isDisabled>
                Сохранить в проект
              </Button>
            </Tooltip>
          </HStack>
        </Box>
      ) : null}
    </Flex>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Reducer-like dispatcher: apply incoming SearchEvent to state.
// ──────────────────────────────────────────────────────────────────────────────

function applyEvent(
  event: SearchEvent,
  setState: React.Dispatch<React.SetStateAction<SearchState>>,
) {
  switch (event.type) {
    case 'intent':
      setState((s) => ({
        ...s,
        intent: event.intent,
        endpoints: event.endpoints,
        subQueries: event.subQueries,
      }));
      break;
    case 'progress':
      setState((s) => ({
        ...s,
        progress: { ...s.progress, [event.step]: event.status },
      }));
      break;
    case 'sources':
      setState((s) => ({ ...s, sources: event.sources }));
      break;
    case 'answer_delta':
      setState((s) => ({ ...s, answer: s.answer + event.text }));
      break;
    case 'followups':
      setState((s) => ({ ...s, followups: event.questions }));
      break;
    case 'error':
      setState((s) => ({ ...s, error: event.message, loading: false }));
      break;
    case 'done':
      setState((s) => ({ ...s, loading: false }));
      break;
  }
}
