'use client';

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Box,
  Button,
  Flex,
  Grid,
  GridItem,
  HStack,
  Icon,
  Input,
  Spinner,
  Text,
  Tooltip,
  useColorModeValue,
} from '@chakra-ui/react';
import {
  MdSearch,
  MdArrowForward,
  MdArrowUpward,
  MdCheck,
  MdImage,
  MdShoppingCart,
  MdLocationOn,
  MdSchool,
  MdNewspaper,
  MdScience,
  MdHelpOutline,
  MdLanguage,
  MdRestore,
  MdNorthEast,
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

// ──────────────────────────────────────────────────────────────────────────────
// Design tokens — single source of truth for the redesigned search UI.
// Keeps the ИИСеть brand accent (blue-violet), adds Apple-grade typography rhythm.
// ──────────────────────────────────────────────────────────────────────────────

const ACCENT = '#422AFB';
const ACCENT_HOVER = '#3622D6';
const ACCENT_SOFT = '#EEF0FF';
const SURFACE = '#FAFAFC';
const HAIRLINE = 'rgba(8, 10, 40, 0.08)';
const HAIRLINE_SOFT = 'rgba(8, 10, 40, 0.05)';
const INK = '#0E1538';
const INK_BODY = '#1A1F3D';
const INK_MUTED = '#5C6479';
const INK_MUTED_2 = '#8A92A6';

const FONT_STACK =
  '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", system-ui, "Helvetica Neue", Arial, sans-serif';

// ──────────────────────────────────────────────────────────────────────────────
// Static content.
// ──────────────────────────────────────────────────────────────────────────────

const EXAMPLES = [
  'Какие аналоги ChatGPT доступны в России?',
  'Сравни лучшие наушники для спорта до 15 000 ₽',
  'Что изменилось в ИИ за последнюю неделю?',
  'Найди исследования про RAG',
  'Как подготовиться к собеседованию на Head of AI?',
  'Какие документы проверить при покупке квартиры?',
];

const PROGRESS_STEPS: {
  key: ProgressStep;
  label: string;
  active: string;
}[] = [
  { key: 'understand', label: 'Понимаю запрос', active: 'Понимаю запрос' },
  { key: 'search', label: 'Ищу источники', active: 'Ищу источники' },
  { key: 'open', label: 'Открываю страницы', active: 'Открываю страницы' },
  { key: 'compare', label: 'Сравниваю данные', active: 'Сравниваю данные' },
  { key: 'answer', label: 'Собираю ответ', active: 'Собираю ответ' },
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
  search: 'Web',
  news: 'Новости',
  images: 'Картинки',
  shopping: 'Магазины',
  places: 'Места',
  scholar: 'Научные',
  patents: 'Патенты',
  autocomplete: 'Подсказки',
  scrape: 'Страница',
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

// ──────────────────────────────────────────────────────────────────────────────
// State types.
// ──────────────────────────────────────────────────────────────────────────────

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
// Citation rendering — turn [1], [2] in answer text into small pill links.
// ──────────────────────────────────────────────────────────────────────────────

const CITATION_RE = /\[(\d+)\]/g;

function transformChildren(
  children: React.ReactNode,
  onCite: (n: number) => void,
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
            minW="20px"
            h="20px"
            px="6px"
            mx="2px"
            borderRadius="9999px"
            fontSize="11px"
            fontWeight="700"
            fontVariantNumeric="tabular-nums"
            bg={ACCENT_SOFT}
            color={ACCENT}
            transition="transform 120ms ease, background-color 120ms ease"
            _hover={{ bg: '#E3E6FF', transform: 'translateY(-1px)' }}
            _active={{ transform: 'translateY(0) scale(0.96)' }}
            onClick={(e: React.MouseEvent) => {
              e.preventDefault();
              onCite(n);
            }}
            verticalAlign="middle"
            lineHeight="1"
            aria-label={`Источник ${n}`}
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
      const props = (child as any).props || {};
      if (props.children) {
        return React.cloneElement(child as React.ReactElement, {
          ...props,
          children: transformChildren(props.children, onCite),
        });
      }
      return child;
    }
    return child;
  });
}

// ──────────────────────────────────────────────────────────────────────────────
// Brand-mark — small abstract gradient dot used in hero + topbar.
// ──────────────────────────────────────────────────────────────────────────────

function BrandMark({ size = 22 }: { size?: number }) {
  return (
    <Box
      w={`${size}px`}
      h={`${size}px`}
      borderRadius="9999px"
      bgGradient="linear(135deg, #5B47FB 0%, #422AFB 60%, #1A3DFA 100%)"
      boxShadow="0 4px 14px -4px rgba(66,42,251,0.45)"
      flexShrink={0}
    />
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Aurora — very soft gradient blobs behind the hero. Sits at z-index 0.
// ──────────────────────────────────────────────────────────────────────────────

function HeroAurora() {
  return (
    <Box
      position="absolute"
      top="0"
      left="0"
      right="0"
      h="520px"
      overflow="hidden"
      pointerEvents="none"
      zIndex={0}
      aria-hidden
    >
      <Box
        position="absolute"
        top="-160px"
        left="-120px"
        w="520px"
        h="520px"
        borderRadius="9999px"
        bg="radial-gradient(circle at center, rgba(91,71,251,0.22) 0%, rgba(91,71,251,0) 70%)"
        filter="blur(40px)"
      />
      <Box
        position="absolute"
        top="-100px"
        right="-120px"
        w="480px"
        h="480px"
        borderRadius="9999px"
        bg="radial-gradient(circle at center, rgba(38,160,255,0.18) 0%, rgba(38,160,255,0) 70%)"
        filter="blur(48px)"
      />
      <Box
        position="absolute"
        top="40px"
        left="50%"
        transform="translateX(-50%)"
        w="360px"
        h="360px"
        borderRadius="9999px"
        bg="radial-gradient(circle at center, rgba(218,182,255,0.18) 0%, rgba(218,182,255,0) 70%)"
        filter="blur(48px)"
      />
    </Box>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Pill input — used in both hero (big) and results top bar (compact).
// ──────────────────────────────────────────────────────────────────────────────

interface SearchInputProps {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  loading: boolean;
  variant: 'hero' | 'compact';
  placeholder?: string;
  autoFocus?: boolean;
  textColor: string;
  pillBg: string;
  placeholderColor: string;
  shadow: string;
}

function PillInput({
  value,
  onChange,
  onSubmit,
  loading,
  variant,
  placeholder,
  autoFocus,
  textColor,
  pillBg,
  placeholderColor,
  shadow,
}: SearchInputProps) {
  const isHero = variant === 'hero';
  const h = isHero ? '60px' : '52px';
  const padL = isHero ? '22px' : '18px';
  const padR = '6px';
  const fontSize = isHero ? '17px' : '15px';
  const sendSize = isHero ? '48px' : '40px';

  return (
    <Box
      bg={pillBg}
      borderRadius="9999px"
      borderWidth="1px"
      borderColor={HAIRLINE}
      h={h}
      px={padR}
      pl={padL}
      display="flex"
      alignItems="center"
      gap="10px"
      boxShadow={shadow}
      transition="box-shadow 180ms ease, border-color 180ms ease"
      _focusWithin={{
        borderColor: 'rgba(66,42,251,0.42)',
        boxShadow:
          '0 8px 32px -12px rgba(66,42,251,0.22), 0 0 0 3px rgba(66,42,251,0.08)',
      }}
    >
      <Icon
        as={MdSearch}
        w={isHero ? '20px' : '18px'}
        h={isHero ? '20px' : '18px'}
        color={INK_MUTED_2}
        flexShrink={0}
      />
      <Input
        value={value}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          onChange(e.target.value)
        }
        onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onSubmit();
          }
        }}
        placeholder={placeholder}
        autoFocus={autoFocus}
        variant="unstyled"
        color={textColor}
        fontSize={fontSize}
        fontFamily={FONT_STACK}
        letterSpacing="-0.01em"
        h="100%"
        _placeholder={{ color: placeholderColor }}
        disabled={loading}
        flex={1}
        minW={0}
      />
      <Box
        as="button"
        type="button"
        onClick={onSubmit}
        aria-label="Отправить запрос"
        w={sendSize}
        h={sendSize}
        borderRadius="9999px"
        bg={value.trim() && !loading ? ACCENT : '#D4D7E2'}
        color="white"
        display="inline-flex"
        alignItems="center"
        justifyContent="center"
        flexShrink={0}
        transition="background-color 160ms ease, transform 120ms ease"
        cursor={value.trim() && !loading ? 'pointer' : 'not-allowed'}
        _hover={
          value.trim() && !loading
            ? { bg: ACCENT_HOVER, transform: 'translateY(-1px)' }
            : {}
        }
        _active={
          value.trim() && !loading ? { transform: 'scale(0.96)' } : {}
        }
        disabled={!value.trim() || loading}
      >
        {loading ? (
          <Spinner size="sm" thickness="2px" />
        ) : (
          <Icon as={MdArrowUpward} w="20px" h="20px" />
        )}
      </Box>
    </Box>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Progress line — single thin row of 5 dots with a label of the active step.
// Hides itself softly once `answer` step is `done`.
// ──────────────────────────────────────────────────────────────────────────────

function ProgressLine({
  progress,
  hideAfterDone,
}: {
  progress: ProgressMap;
  hideAfterDone: boolean;
}) {
  const activeIndex = (() => {
    for (let i = 0; i < PROGRESS_STEPS.length; i += 1) {
      const s = progress[PROGRESS_STEPS[i].key];
      if (s === 'running') return i;
    }
    // none running → return last `done` so the label stays meaningful
    let lastDone = -1;
    PROGRESS_STEPS.forEach((step, i) => {
      if (progress[step.key] === 'done') lastDone = i;
    });
    return lastDone === -1 ? 0 : lastDone;
  })();

  const activeLabel = PROGRESS_STEPS[activeIndex]?.active || '';

  return (
    <Flex
      align="center"
      gap="14px"
      mb="20px"
      opacity={hideAfterDone ? 0 : 1}
      transition="opacity 480ms ease"
      pointerEvents={hideAfterDone ? 'none' : 'auto'}
      maxH={hideAfterDone ? '0' : '60px'}
      overflow="hidden"
    >
      <Flex align="center" gap="6px">
        {PROGRESS_STEPS.map((step, i) => {
          const status = progress[step.key] || 'pending';
          const isDone = status === 'done';
          const isRunning = status === 'running';
          return (
            <Flex key={step.key} align="center">
              <Box
                w={isRunning ? '10px' : '8px'}
                h={isRunning ? '10px' : '8px'}
                borderRadius="9999px"
                bg={
                  isDone
                    ? ACCENT
                    : isRunning
                    ? ACCENT
                    : 'rgba(8,10,40,0.12)'
                }
                boxShadow={
                  isRunning
                    ? '0 0 0 4px rgba(66,42,251,0.16)'
                    : 'none'
                }
                transition="all 200ms ease"
                display="inline-flex"
                alignItems="center"
                justifyContent="center"
              >
                {isDone ? (
                  <Icon as={MdCheck} w="6px" h="6px" color="white" />
                ) : null}
              </Box>
              {i < PROGRESS_STEPS.length - 1 ? (
                <Box
                  w="14px"
                  h="1px"
                  bg={
                    progress[PROGRESS_STEPS[i + 1].key] === 'done' ||
                    progress[PROGRESS_STEPS[i + 1].key] === 'running' ||
                    isDone
                      ? 'rgba(66,42,251,0.45)'
                      : 'rgba(8,10,40,0.12)'
                  }
                  mx="2px"
                  transition="background-color 200ms ease"
                />
              ) : null}
            </Flex>
          );
        })}
      </Flex>
      <Text
        fontSize="13px"
        color={INK_MUTED}
        fontWeight="500"
        fontFamily={FONT_STACK}
      >
        {activeLabel}
        <Box
          as="span"
          display="inline-block"
          ml="2px"
          sx={{
            '@keyframes iiset-dots': {
              '0%, 20%': { opacity: 0 },
              '50%': { opacity: 1 },
              '100%': { opacity: 0 },
            },
            animation: 'iiset-dots 1.4s infinite',
          }}
        >
          …
        </Box>
      </Text>
    </Flex>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Compact source row — Perplexity-style numbered list item.
// ──────────────────────────────────────────────────────────────────────────────

function SourceRow({ src }: { src: SourceCard }) {
  const Icn = SOURCE_ICON[src.source] || MdLanguage;
  const meta: string[] = [];
  if (src.price) meta.push(src.price);
  if (src.rating) meta.push(`★ ${src.rating}`);
  if (src.date) meta.push(src.date);

  return (
    <Box
      as="a"
      id={`src-${src.index}`}
      href={src.url}
      target="_blank"
      rel="noopener noreferrer"
      display="block"
      borderRadius="14px"
      p="12px"
      borderWidth="1px"
      borderColor="transparent"
      transition="background-color 160ms ease, border-color 160ms ease, transform 160ms ease"
      _hover={{
        bg: 'white',
        borderColor: HAIRLINE,
        transform: 'translateY(-1px)',
      }}
      role="link"
      aria-label={`Источник ${src.index}: ${src.title}`}
    >
      <Flex align="center" gap="8px" mb="6px">
        <Box
          display="inline-flex"
          alignItems="center"
          justifyContent="center"
          minW="20px"
          h="20px"
          px="6px"
          borderRadius="9999px"
          bg={ACCENT_SOFT}
          color={ACCENT}
          fontSize="11px"
          fontWeight="700"
          fontVariantNumeric="tabular-nums"
          lineHeight="1"
          flexShrink={0}
        >
          {src.index}
        </Box>
        <Icon as={Icn} w="13px" h="13px" color={INK_MUTED_2} />
        <Text
          fontSize="11px"
          color={INK_MUTED_2}
          fontWeight="600"
          letterSpacing="0.02em"
          textTransform="uppercase"
          noOfLines={1}
        >
          {ENDPOINT_LABELS[src.source]} · {src.domain}
        </Text>
        <Box flex={1} />
        <Icon
          as={MdNorthEast}
          w="12px"
          h="12px"
          color={INK_MUTED_2}
          opacity={0.6}
        />
      </Flex>

      <Text
        fontSize="14px"
        fontWeight="600"
        color={INK}
        noOfLines={2}
        lineHeight="1.35"
        letterSpacing="-0.01em"
        mb="4px"
      >
        {src.title}
      </Text>

      {src.snippet ? (
        <Text
          fontSize="12.5px"
          color={INK_MUTED}
          noOfLines={2}
          lineHeight="1.45"
        >
          {src.snippet}
        </Text>
      ) : null}

      {(meta.length > 0 || src.address || src.snippetOnly) ? (
        <Flex
          mt="8px"
          gap="6px"
          align="center"
          flexWrap="wrap"
          fontSize="11px"
          color={INK_MUTED_2}
        >
          {src.address ? (
            <Text noOfLines={1} maxW="70%">
              {src.address}
            </Text>
          ) : null}
          {meta.map((m) => (
            <Text
              key={m}
              px="6px"
              py="1px"
              borderRadius="9999px"
              bg="rgba(8,10,40,0.04)"
              fontWeight="500"
              fontVariantNumeric="tabular-nums"
            >
              {m}
            </Text>
          ))}
          {src.snippetOnly ? (
            <Tooltip
              hasArrow
              label="Страница не была загружена полностью — использован только сниппет из поисковой выдачи."
            >
              <Text
                px="6px"
                py="1px"
                borderRadius="9999px"
                bg="rgba(8,10,40,0.04)"
                fontWeight="500"
              >
                сниппет
              </Text>
            </Tooltip>
          ) : null}
        </Flex>
      ) : null}
    </Box>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Skeleton placeholders for sources column while loading.
// ──────────────────────────────────────────────────────────────────────────────

function SourceSkeleton() {
  return (
    <Box p="12px" borderRadius="14px">
      <Flex align="center" gap="8px" mb="8px">
        <Box w="20px" h="20px" borderRadius="9999px" bg="rgba(8,10,40,0.06)" />
        <Box h="10px" w="80px" borderRadius="6px" bg="rgba(8,10,40,0.06)" />
      </Flex>
      <Box h="12px" w="90%" borderRadius="6px" bg="rgba(8,10,40,0.08)" mb="6px" />
      <Box h="10px" w="60%" borderRadius="6px" bg="rgba(8,10,40,0.06)" />
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

  // Colors (light/dark variants). We anchor on a calm light surface to match Apple-clean,
  // and keep the existing dark fallback for the project's dark mode.
  const pageBg = useColorModeValue(SURFACE, 'navy.900');
  const heroSurface = useColorModeValue('white', 'navy.800');
  const sourcesPanelBg = useColorModeValue(
    'rgba(255,255,255,0.55)',
    'whiteAlpha.50',
  );
  const sourcesPanelBorder = useColorModeValue(HAIRLINE, 'whiteAlpha.100');
  const textColor = useColorModeValue(INK, 'white');
  const bodyTextColor = useColorModeValue(INK_BODY, 'whiteAlpha.900');
  const mutedColor = useColorModeValue(INK_MUTED, 'gray.400');
  const subtleMuted = useColorModeValue(INK_MUTED_2, 'gray.500');
  const placeholderColor = useColorModeValue(
    INK_MUTED_2,
    'whiteAlpha.500',
  );
  const inputShadowHero = useColorModeValue(
    '0 10px 40px -16px rgba(8,10,40,0.18), 0 1px 2px rgba(8,10,40,0.04)',
    '0 10px 40px -16px rgba(0,0,0,0.6)',
  );
  const inputShadowCompact = useColorModeValue(
    '0 6px 24px -12px rgba(8,10,40,0.14), 0 1px 2px rgba(8,10,40,0.04)',
    '0 6px 24px -12px rgba(0,0,0,0.6)',
  );
  const chipBg = useColorModeValue('white', 'whiteAlpha.100');
  const chipBorder = useColorModeValue(HAIRLINE_SOFT, 'whiteAlpha.100');
  const chipHoverBg = useColorModeValue(ACCENT_SOFT, 'whiteAlpha.200');
  const answerHairline = useColorModeValue(HAIRLINE, 'whiteAlpha.200');

  // ── Smooth-scroll + brief soft glow on a source when citation [N] is clicked.
  const highlightSource = useCallback((n: number) => {
    const el = document.getElementById(`src-${n}`);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el.style.transition = 'box-shadow 0.45s ease';
    el.style.boxShadow = '0 0 0 3px rgba(66,42,251,0.22)';
    setTimeout(() => {
      el.style.boxShadow = '';
    }, 1400);
  }, []);

  // ── Submit handler — preserves NDJSON parsing & SearchEvent dispatcher.
  const handleSubmit = useCallback(
    async (overrideQuery?: string) => {
      const q = (overrideQuery ?? draft).trim();
      if (!q) return;

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
            error:
              res.status === 403
                ? 'Поиск пока в закрытом тесте — нужен доступ администратора.'
                : 'Поиск временно недоступен. Попробуйте ещё раз.',
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

  const answerStreaming =
    state.loading && state.progress.answer === 'running' && !!state.answer;
  const answerDone =
    !state.loading && state.progress.answer === 'done' && !!state.answer;
  const hideProgress = !state.loading && state.progress.answer === 'done';

  const markdownComponents = useMemo(
    () => ({
      p: ({ children, ...rest }: any) => (
        <p {...rest}>{transformChildren(children, highlightSource)}</p>
      ),
      li: ({ children, ...rest }: any) => (
        <li {...rest}>{transformChildren(children, highlightSource)}</li>
      ),
      td: ({ children, ...rest }: any) => (
        <td {...rest}>{transformChildren(children, highlightSource)}</td>
      ),
    }),
    [highlightSource],
  );

  // ──────────────────────────────────────────────────────────────────────────
  // Render
  // ──────────────────────────────────────────────────────────────────────────

  return (
    <Box
      position="relative"
      w="100%"
      minH="100%"
      bg={pageBg}
      fontFamily={FONT_STACK}
      pt={{ base: '56px', md: '20px' }}
      pb={{ base: '40px', md: '64px' }}
    >
      {!hasResults ? <HeroAurora /> : null}

      <Box
        position="relative"
        zIndex={1}
        maxW={hasResults ? '1180px' : '760px'}
        mx="auto"
        px={{ base: '16px', md: '24px' }}
        transition="max-width 280ms ease"
      >
        {/* ── HERO (pre-query) ───────────────────────────────────────────── */}
        {!hasResults ? (
          <Flex
            direction="column"
            align="center"
            textAlign="center"
            pt={{ base: '24px', md: '60px' }}
          >
            <HStack spacing="10px" mb="24px">
              <BrandMark size={22} />
              <Text
                fontSize="13px"
                fontWeight="600"
                color={mutedColor}
                letterSpacing="0.04em"
                textTransform="uppercase"
              >
                ИИСеть Поиск
              </Text>
              <Box
                px="8px"
                py="2px"
                borderRadius="9999px"
                fontSize="10px"
                fontWeight="700"
                letterSpacing="0.06em"
                color={ACCENT}
                bg={ACCENT_SOFT}
              >
                MVP
              </Box>
            </HStack>

            <Box
              as="h1"
              fontSize={{ base: '34px', md: '44px' }}
              lineHeight="1.08"
              fontWeight="600"
              letterSpacing="-0.02em"
              color={textColor}
              mb="14px"
              maxW="640px"
            >
              Найдите ответ, а не список ссылок
            </Box>

            <Text
              fontSize={{ base: '16px', md: '18px' }}
              color={mutedColor}
              lineHeight="1.5"
              maxW="560px"
              mb="36px"
            >
              ИИСеть ищет в интернете, открывает источники и собирает ответ
              с ссылками.
            </Text>

            <Box w="100%" maxW="640px" mb="22px">
              <PillInput
                value={draft}
                onChange={setDraft}
                onSubmit={() => handleSubmit()}
                loading={state.loading}
                variant="hero"
                placeholder="Что нужно найти?"
                autoFocus
                textColor={textColor}
                pillBg={heroSurface}
                placeholderColor={placeholderColor}
                shadow={inputShadowHero}
              />
            </Box>

            <Flex
              wrap="wrap"
              gap="8px"
              justify="center"
              maxW="720px"
              mx="auto"
            >
              {EXAMPLES.map((ex) => (
                <Box
                  as="button"
                  key={ex}
                  type="button"
                  onClick={() => {
                    setDraft(ex);
                    handleSubmit(ex);
                  }}
                  px="14px"
                  py="9px"
                  borderRadius="9999px"
                  bg={chipBg}
                  borderWidth="1px"
                  borderColor={chipBorder}
                  fontSize="13.5px"
                  color={bodyTextColor}
                  fontWeight="500"
                  letterSpacing="-0.01em"
                  transition="background-color 140ms ease, border-color 140ms ease, transform 120ms ease, color 140ms ease"
                  _hover={{
                    bg: chipHoverBg,
                    borderColor: 'rgba(66,42,251,0.22)',
                    color: ACCENT,
                    transform: 'translateY(-1px)',
                  }}
                  _active={{ transform: 'translateY(0) scale(0.98)' }}
                >
                  {ex}
                </Box>
              ))}
            </Flex>
          </Flex>
        ) : null}

        {/* ── RESULTS HEADER (post-query) ────────────────────────────────── */}
        {hasResults ? (
          <Box>
            {/* Top bar: brand + compact input + reset */}
            <Flex
              align="center"
              gap={{ base: '10px', md: '14px' }}
              mb={{ base: '18px', md: '22px' }}
            >
              <HStack
                spacing="8px"
                flexShrink={0}
                display={{ base: 'none', md: 'flex' }}
              >
                <BrandMark size={20} />
                <Text
                  fontSize="13px"
                  fontWeight="600"
                  color={mutedColor}
                  letterSpacing="0.02em"
                >
                  ИИСеть Поиск
                </Text>
              </HStack>

              <Box flex={1} minW={0}>
                <PillInput
                  value={draft}
                  onChange={setDraft}
                  onSubmit={() => handleSubmit()}
                  loading={state.loading}
                  variant="compact"
                  placeholder="Задайте новый вопрос…"
                  textColor={textColor}
                  pillBg={heroSurface}
                  placeholderColor={placeholderColor}
                  shadow={inputShadowCompact}
                />
              </Box>

              <Button
                size="sm"
                variant="ghost"
                color={mutedColor}
                fontWeight="500"
                leftIcon={<Icon as={MdRestore} />}
                onClick={reset}
                _hover={{ bg: 'rgba(8,10,40,0.04)', color: ACCENT }}
                flexShrink={0}
                display={{ base: 'none', sm: 'inline-flex' }}
              >
                Новый поиск
              </Button>
            </Flex>

            {/* Query echo */}
            <Box mb="14px" maxW="820px">
              <Box
                as="h2"
                fontSize={{ base: '22px', md: '26px' }}
                fontWeight="600"
                letterSpacing="-0.015em"
                lineHeight="1.25"
                color={textColor}
              >
                {state.query}
              </Box>
              <HStack
                mt="8px"
                spacing="10px"
                color={subtleMuted}
                fontSize="12px"
                fontWeight="500"
              >
                {state.intent ? (
                  <HStack spacing="6px">
                    <Box
                      w="6px"
                      h="6px"
                      borderRadius="9999px"
                      bg={ACCENT}
                      opacity={0.6}
                    />
                    <Text>{INTENT_LABELS[state.intent]}</Text>
                  </HStack>
                ) : null}
                {state.sources.length > 0 ? (
                  <Text>
                    Найдено {state.sources.length}{' '}
                    {pluralizeSources(state.sources.length)}
                  </Text>
                ) : null}
              </HStack>
            </Box>

            {/* Progress line — auto-collapses on completion */}
            <ProgressLine progress={state.progress} hideAfterDone={hideProgress} />

            {/* Error banner */}
            {state.error ? (
              <Box
                mb="20px"
                p="14px 16px"
                borderRadius="14px"
                borderWidth="1px"
                borderColor="rgba(220,38,38,0.18)"
                bg="rgba(254,242,242,0.7)"
                color="#7f1d1d"
                fontSize="14px"
              >
                {state.error}
              </Box>
            ) : null}

            {/* Two-column grid: answer + sources */}
            <Grid
              templateColumns={{ base: '1fr', lg: '1fr 320px' }}
              gap={{ base: '24px', lg: '40px' }}
              alignItems="start"
            >
              {/* Mobile: short sources strip first */}
              <GridItem display={{ base: 'block', lg: 'none' }}>
                <MobileSourcesStrip
                  sources={state.sources}
                  loading={state.loading && state.sources.length === 0}
                />
              </GridItem>

              {/* MAIN: answer */}
              <GridItem minW={0}>
                {/* Answer block */}
                {state.answer ||
                state.progress.answer === 'running' ||
                state.progress.compare === 'running' ? (
                  <Box maxW="780px">
                    <Box
                      borderTopWidth="1px"
                      borderTopColor={answerHairline}
                      pt="20px"
                      pb="8px"
                    >
                      <Text
                        fontSize="11px"
                        color={subtleMuted}
                        fontWeight="700"
                        textTransform="uppercase"
                        letterSpacing="0.08em"
                        mb="14px"
                      >
                        Ответ
                      </Text>

                      <Box
                        className="iiset-search-answer"
                        color={bodyTextColor}
                        sx={{
                          fontFamily: FONT_STACK,
                          fontSize: '17px',
                          lineHeight: '1.65',
                          letterSpacing: '-0.005em',
                          'p, ul, ol, table, blockquote, pre': {
                            mb: '14px',
                          },
                          'h1, h2, h3': {
                            fontWeight: 600,
                            letterSpacing: '-0.015em',
                            color: textColor,
                          },
                          h1: { fontSize: '24px', mb: '10px', mt: '18px' },
                          h2: { fontSize: '22px', mb: '10px', mt: '18px' },
                          h3: { fontSize: '18px', mb: '8px', mt: '14px' },
                          'ul, ol': { pl: '22px' },
                          li: { mb: '6px' },
                          'li::marker': { color: subtleMuted },
                          blockquote: {
                            borderLeftWidth: '3px',
                            borderLeftColor: 'rgba(66,42,251,0.35)',
                            pl: '14px',
                            color: mutedColor,
                            fontStyle: 'normal',
                          },
                          table: {
                            width: '100%',
                            borderCollapse: 'separate',
                            borderSpacing: 0,
                            fontSize: '14px',
                            borderRadius: '12px',
                            overflow: 'hidden',
                            borderWidth: '1px',
                            borderColor: answerHairline,
                          },
                          'th, td': {
                            borderBottomWidth: '1px',
                            borderBottomColor: answerHairline,
                            px: '12px',
                            py: '10px',
                            textAlign: 'left',
                          },
                          'tr:last-child td': { borderBottomWidth: 0 },
                          th: {
                            fontWeight: 600,
                            color: textColor,
                            bg: 'rgba(8,10,40,0.03)',
                            fontSize: '13px',
                            letterSpacing: '-0.01em',
                          },
                          code: {
                            fontFamily:
                              'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
                            fontSize: '14px',
                            bg: 'rgba(8,10,40,0.05)',
                            px: '6px',
                            py: '2px',
                            borderRadius: '6px',
                          },
                          pre: {
                            bg: 'rgba(8,10,40,0.04)',
                            p: '14px',
                            borderRadius: '12px',
                            overflowX: 'auto',
                            fontSize: '13.5px',
                          },
                          'pre code': {
                            bg: 'transparent',
                            p: 0,
                          },
                          a: {
                            color: ACCENT,
                            textDecoration: 'none',
                            borderBottomWidth: '1px',
                            borderBottomColor: 'rgba(66,42,251,0.35)',
                          },
                        }}
                      >
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={markdownComponents as any}
                        >
                          {state.answer || ' '}
                        </ReactMarkdown>
                        {answerStreaming ? (
                          <Box
                            as="span"
                            display="inline-block"
                            ml="2px"
                            w="2px"
                            h="20px"
                            verticalAlign="-4px"
                            bg={ACCENT}
                            sx={{
                              '@keyframes iiset-cursor': {
                                '0%, 49%': { opacity: 1 },
                                '50%, 100%': { opacity: 0 },
                              },
                              animation: 'iiset-cursor 1s steps(2) infinite',
                              borderRadius: '1px',
                            }}
                          />
                        ) : null}
                        {state.loading &&
                        !state.answer &&
                        state.progress.compare === 'running' ? (
                          <AnswerSkeleton mutedColor={subtleMuted} />
                        ) : null}
                      </Box>
                    </Box>

                    {/* Follow-ups */}
                    {state.followups.length > 0 ? (
                      <Box mt="32px">
                        <Text
                          fontSize="11px"
                          color={subtleMuted}
                          fontWeight="700"
                          textTransform="uppercase"
                          letterSpacing="0.08em"
                          mb="12px"
                        >
                          Можно уточнить
                        </Text>
                        <Flex direction="column" gap="8px">
                          {state.followups.map((q) => (
                            <Box
                              as="button"
                              key={q}
                              type="button"
                              onClick={() => handleSubmit(q)}
                              textAlign="left"
                              px="16px"
                              py="12px"
                              borderRadius="14px"
                              bg={heroSurface}
                              borderWidth="1px"
                              borderColor={answerHairline}
                              fontSize="14.5px"
                              color={bodyTextColor}
                              fontWeight="500"
                              letterSpacing="-0.005em"
                              display="flex"
                              alignItems="center"
                              justifyContent="space-between"
                              gap="12px"
                              transition="background-color 140ms ease, border-color 140ms ease, transform 120ms ease"
                              _hover={{
                                bg: chipHoverBg,
                                borderColor: 'rgba(66,42,251,0.22)',
                                color: ACCENT,
                                transform: 'translateY(-1px)',
                              }}
                              _active={{ transform: 'scale(0.99)' }}
                            >
                              <Text as="span">{q}</Text>
                              <Icon
                                as={MdArrowForward}
                                w="16px"
                                h="16px"
                                color="currentColor"
                                opacity={0.7}
                              />
                            </Box>
                          ))}
                        </Flex>
                      </Box>
                    ) : null}

                    {/* Secondary actions */}
                    {answerDone ? (
                      <HStack
                        spacing="6px"
                        mt="24px"
                        pt="20px"
                        borderTopWidth="1px"
                        borderTopColor={answerHairline}
                      >
                        <Button
                          size="sm"
                          variant="ghost"
                          color={mutedColor}
                          fontWeight="500"
                          rightIcon={<Icon as={MdArrowForward} />}
                          onClick={continueInChat}
                          _hover={{
                            bg: 'rgba(8,10,40,0.04)',
                            color: ACCENT,
                          }}
                        >
                          Продолжить в чате
                        </Button>
                        <Tooltip label="Скоро" hasArrow>
                          <Button
                            size="sm"
                            variant="ghost"
                            color={subtleMuted}
                            fontWeight="500"
                            isDisabled
                          >
                            Сохранить в проект
                          </Button>
                        </Tooltip>
                      </HStack>
                    ) : null}
                  </Box>
                ) : (
                  // No answer yet & not even compare running — show subtle hint
                  state.loading && !state.error ? (
                    <Box maxW="780px" pt="20px">
                      <AnswerSkeleton mutedColor={subtleMuted} />
                    </Box>
                  ) : null
                )}
              </GridItem>

              {/* RIGHT: sticky sources panel (desktop only) */}
              <GridItem display={{ base: 'none', lg: 'block' }}>
                <Box position="sticky" top="24px">
                  <Flex align="center" justify="space-between" mb="10px">
                    <Text
                      fontSize="11px"
                      color={subtleMuted}
                      fontWeight="700"
                      textTransform="uppercase"
                      letterSpacing="0.08em"
                    >
                      Источники
                    </Text>
                    {state.sources.length > 0 ? (
                      <Text fontSize="12px" color={subtleMuted}>
                        {state.sources.length}
                      </Text>
                    ) : null}
                  </Flex>
                  <Box
                    bg={sourcesPanelBg}
                    borderRadius="16px"
                    borderWidth="1px"
                    borderColor={sourcesPanelBorder}
                    p="6px"
                    maxH="calc(100dvh - 80px)"
                    overflowY="auto"
                    sx={{
                      backdropFilter: 'blur(12px)',
                      WebkitBackdropFilter: 'blur(12px)',
                      scrollbarWidth: 'thin',
                    }}
                  >
                    {state.sources.length > 0 ? (
                      <Flex direction="column" gap="2px">
                        {state.sources.map((src) => (
                          <SourceRow
                            key={`${src.index}-${src.url}`}
                            src={src}
                          />
                        ))}
                      </Flex>
                    ) : state.loading ? (
                      <Flex direction="column" gap="2px">
                        {[0, 1, 2, 3].map((i) => (
                          <SourceSkeleton key={i} />
                        ))}
                      </Flex>
                    ) : (
                      <Box p="14px" fontSize="13px" color={subtleMuted}>
                        Источники появятся здесь, как только мы их найдём.
                      </Box>
                    )}
                  </Box>
                </Box>
              </GridItem>
            </Grid>
          </Box>
        ) : null}
      </Box>
    </Box>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Auxiliary: mobile sources strip (horizontal mini-cards).
// ──────────────────────────────────────────────────────────────────────────────

function MobileSourcesStrip({
  sources,
  loading,
}: {
  sources: SourceCard[];
  loading: boolean;
}) {
  if (!sources.length && !loading) return null;

  return (
    <Box mb="8px">
      <Text
        fontSize="11px"
        color={INK_MUTED_2}
        fontWeight="700"
        textTransform="uppercase"
        letterSpacing="0.08em"
        mb="10px"
      >
        Источники
      </Text>
      <Flex
        gap="10px"
        overflowX="auto"
        pb="8px"
        sx={{
          scrollSnapType: 'x mandatory',
          '::-webkit-scrollbar': { display: 'none' },
          scrollbarWidth: 'none',
        }}
      >
        {sources.length
          ? sources.map((src) => (
              <Box
                key={`m-${src.index}-${src.url}`}
                as="a"
                href={src.url}
                target="_blank"
                rel="noopener noreferrer"
                minW="220px"
                maxW="240px"
                p="12px"
                borderRadius="14px"
                bg="white"
                borderWidth="1px"
                borderColor={HAIRLINE}
                sx={{ scrollSnapAlign: 'start' }}
                flexShrink={0}
              >
                <Flex align="center" gap="6px" mb="6px">
                  <Box
                    minW="20px"
                    h="20px"
                    px="6px"
                    borderRadius="9999px"
                    bg={ACCENT_SOFT}
                    color={ACCENT}
                    fontSize="11px"
                    fontWeight="700"
                    display="inline-flex"
                    alignItems="center"
                    justifyContent="center"
                    lineHeight="1"
                  >
                    {src.index}
                  </Box>
                  <Text
                    fontSize="10.5px"
                    color={INK_MUTED_2}
                    fontWeight="600"
                    textTransform="uppercase"
                    letterSpacing="0.02em"
                    noOfLines={1}
                  >
                    {src.domain}
                  </Text>
                </Flex>
                <Text
                  fontSize="13.5px"
                  fontWeight="600"
                  color={INK}
                  noOfLines={3}
                  lineHeight="1.35"
                  letterSpacing="-0.005em"
                >
                  {src.title}
                </Text>
              </Box>
            ))
          : [0, 1, 2].map((i) => (
              <Box
                key={`ms-${i}`}
                minW="220px"
                h="86px"
                borderRadius="14px"
                bg="rgba(8,10,40,0.04)"
                flexShrink={0}
              />
            ))}
      </Flex>
    </Box>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Auxiliary: lightweight skeleton lines while we wait for the first answer token.
// ──────────────────────────────────────────────────────────────────────────────

function AnswerSkeleton({ mutedColor }: { mutedColor: string }) {
  void mutedColor;
  return (
    <Box pt="6px">
      {[100, 92, 96, 70].map((w) => (
        <Box
          key={w}
          h="14px"
          w={`${w}%`}
          borderRadius="6px"
          bg="rgba(8,10,40,0.06)"
          mb="10px"
          sx={{
            '@keyframes iiset-shimmer': {
              '0%': { opacity: 0.4 },
              '50%': { opacity: 0.8 },
              '100%': { opacity: 0.4 },
            },
            animation: 'iiset-shimmer 1.6s ease-in-out infinite',
          }}
        />
      ))}
    </Box>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Small i18n helper.
// ──────────────────────────────────────────────────────────────────────────────

function pluralizeSources(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return 'источник';
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20))
    return 'источника';
  return 'источников';
}

// ──────────────────────────────────────────────────────────────────────────────
// Reducer-like dispatcher: apply incoming SearchEvent to state.
// (Preserved from the original — same event contract.)
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
