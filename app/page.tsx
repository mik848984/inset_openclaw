"use client";
import React from "react";
import {
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  Icon,
  SimpleGrid,
  Text,
  VStack,
} from "@chakra-ui/react";
import {
  FiArrowRight,
  FiChevronRight,
  FiCpu,
  FiEdit3,
  FiFileText,
  FiGlobe,
  FiImage,
  FiLayers,
  FiMessageSquare,
  FiSearch,
  FiZap,
} from "react-icons/fi";
import Link from "next/link";

// ── Design tokens (Apple-like) ───────────────────────────────────────
const C = {
  // Ink + neutrals (one warm gray family, no mixing)
  ink: "#1d1d1f",
  inkSecondary: "#6e6e73",
  inkTertiary: "#86868b",
  hairline: "#d2d2d7",
  hairlineSoft: "#e8e8ed",

  // Canvases (very light, only — dark is a rare accent)
  canvas: "#ffffff",
  canvasPearl: "#fbfbfd", // hero + nav
  canvasFog: "#f5f5f7", // section break
  canvasMist: "#f2f2f4", // tile contrast

  // Single dark accent surface (used once, for Premium tile + tiny CTA strip)
  inkDeep: "#0a0a0c",

  // Brand accents — one primary (blue), one secondary identity (violet)
  actionBlue: "#0066cc",
  actionBlueHover: "#0071e3",
  actionBlueOnDark: "#2997ff",
  violet: "#5e5ce6", // Apple SF "indigo"
  violetSoft: "rgba(94,92,230,0.10)",
};

const FD = `system-ui, -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif`;
const FT = `system-ui, -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif`;

// ── Buttons ──────────────────────────────────────────────────────────
function CtaPrimary({
  href,
  children,
  large,
}: {
  href: string;
  children: React.ReactNode;
  large?: boolean;
}) {
  return (
    <Button
      as={Link}
      href={href}
      bg={C.actionBlue}
      color="white"
      borderRadius="9999px"
      px={large ? "28px" : "20px"}
      py={large ? "13px" : "10px"}
      fontSize={large ? "17px" : "15px"}
      fontWeight="400"
      lineHeight="1.0"
      fontFamily={FT}
      _hover={{ bg: C.actionBlueHover }}
      _active={{ transform: "scale(0.98)" }}
      transition="background-color 0.15s ease, transform 0.15s ease"
      h="auto"
      boxShadow="none"
    >
      {children}
    </Button>
  );
}

// Light text-link CTA — replaces heavy outline buttons
function CtaSecondary({
  href,
  children,
  dark = false,
}: {
  href: string;
  children: React.ReactNode;
  dark?: boolean;
}) {
  return (
    <Box
      as={Link}
      href={href}
      display="inline-flex"
      alignItems="center"
      gap="3px"
      fontSize="15px"
      fontWeight="400"
      letterSpacing="-0.16px"
      fontFamily={FT}
      color={dark ? C.actionBlueOnDark : C.actionBlue}
      textDecoration="none"
      px="6px"
      py="10px"
      _hover={{
        color: dark ? "#5ac8ff" : C.actionBlueHover,
        textDecoration: "underline",
      }}
      transition="color 0.15s ease"
    >
      {children}
      <Icon as={FiChevronRight} boxSize="15px" />
    </Box>
  );
}

// Ghost outline — used rarely on light bg as secondary action
function CtaGhost({
  href,
  children,
  large,
}: {
  href: string;
  children: React.ReactNode;
  large?: boolean;
}) {
  return (
    <Button
      as={Link}
      href={href}
      variant="outline"
      bg="transparent"
      borderColor={C.hairline}
      color={C.ink}
      borderRadius="9999px"
      px={large ? "28px" : "20px"}
      py={large ? "13px" : "10px"}
      fontSize={large ? "17px" : "15px"}
      fontWeight="400"
      fontFamily={FT}
      _hover={{ borderColor: C.ink, bg: "transparent" }}
      _active={{ transform: "scale(0.98)" }}
      transition="border-color 0.15s ease, transform 0.15s ease"
      h="auto"
    >
      {children}
    </Button>
  );
}

// ── Reusable light tile ──────────────────────────────────────────────
interface TileProps {
  children: React.ReactNode;
  bg?: string;
  p?: string | object;
  borderRadius?: string;
  hover?: boolean;
  [key: string]: unknown;
}

function Tile({
  children,
  bg = C.canvas,
  p = "32px",
  borderRadius = "22px",
  hover = true,
  ...rest
}: TileProps) {
  return (
    <Box
      bg={bg}
      borderRadius={borderRadius}
      p={p}
      boxShadow="0 1px 2px rgba(15,23,42,0.04), 0 8px 24px -12px rgba(15,23,42,0.08)"
      transition="transform 0.22s ease, box-shadow 0.22s ease"
      sx={{
        "@media (prefers-reduced-motion: reduce)": {
          transition: "none",
        },
      }}
      {...(hover
        ? {
            _hover: {
              transform: "translateY(-3px)",
              boxShadow:
                "0 2px 4px rgba(15,23,42,0.05), 0 24px 48px -20px rgba(15,23,42,0.14)",
            },
          }
        : {})}
      {...rest}
    >
      {children}
    </Box>
  );
}

// macOS-style window chrome — replaces tab pills inside product scene
function MacChrome({ children }: { children: React.ReactNode }) {
  return (
    <Box
      bg={C.canvas}
      borderRadius="18px"
      overflow="hidden"
      boxShadow="0 1px 2px rgba(15,23,42,0.04), 0 30px 80px -20px rgba(15,23,42,0.18)"
      border="1px solid"
      borderColor={C.hairlineSoft}
    >
      <Flex
        align="center"
        gap="6px"
        px="14px"
        py="10px"
        borderBottom="1px solid"
        borderColor={C.hairlineSoft}
        bg={C.canvasPearl}
      >
        <Box w="11px" h="11px" borderRadius="50%" bg="#ff5f57" />
        <Box w="11px" h="11px" borderRadius="50%" bg="#febc2e" />
        <Box w="11px" h="11px" borderRadius="50%" bg="#28c840" />
      </Flex>
      {children}
    </Box>
  );
}

// ── Typography helpers ───────────────────────────────────────────────
function Body({
  children,
  dark,
  muted,
}: {
  children: React.ReactNode;
  dark?: boolean;
  muted?: boolean;
}) {
  return (
    <Text
      fontSize="17px"
      fontWeight="400"
      lineHeight="1.47"
      letterSpacing="-0.374px"
      fontFamily={FT}
      color={
        muted
          ? dark
            ? "rgba(255,255,255,0.62)"
            : C.inkSecondary
          : dark
          ? "white"
          : C.ink
      }
    >
      {children}
    </Text>
  );
}

function Caption({ children, dark }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <Text
      fontSize="13px"
      fontWeight="500"
      lineHeight="1.45"
      letterSpacing="0.06em"
      textTransform="uppercase"
      fontFamily={FT}
      color={dark ? "rgba(255,255,255,0.5)" : C.inkTertiary}
    >
      {children}
    </Text>
  );
}

function SectionEyebrow({ children, color = C.actionBlue }: { children: React.ReactNode; color?: string }) {
  return (
    <Text
      fontSize="14px"
      fontWeight="600"
      letterSpacing="-0.08px"
      fontFamily={FT}
      color={color}
      mb="12px"
    >
      {children}
    </Text>
  );
}

// ── Data ─────────────────────────────────────────────────────────────
const whyCards = [
  {
    icon: FiLayers,
    title: "Всё в одном месте",
    text: "Чат, поиск и генерация — без переключения между сервисами.",
  },
  {
    icon: FiGlobe,
    title: "Русский интерфейс",
    text: "Пишите на родном языке. Модели понимают русский полностью.",
  },
  {
    icon: FiZap,
    title: "Быстрый старт",
    text: "Регистрация за минуту. Первый результат — ещё быстрее.",
  },
  {
    icon: FiMessageSquare,
    title: "Практическая польза",
    text: "КП, письма, посты, пересказы, картинки — задачи каждый день.",
  },
];

// Horizontal-scroll product tiles — "Возможности ИИСеть"
const featureTiles: {
  icon: typeof FiMessageSquare;
  eyebrow: string;
  title: string;
  text: string;
  href: string;
  cta: string;
  accent: string;
}[] = [
  {
    icon: FiMessageSquare,
    eyebrow: "Чат",
    title: "Диалог с моделью",
    text: "GPT-4o, Claude, Gemini и другие — один интерфейс для любой задачи.",
    href: "/chat",
    cta: "Открыть чат",
    accent: C.actionBlue,
  },
  {
    icon: FiSearch,
    eyebrow: "Поиск",
    title: "Веб-поиск со ссылками",
    text: "ИИ ищет в реальном времени и отвечает со ссылками на источники.",
    href: "/chat",
    cta: "Попробовать поиск",
    accent: C.actionBlue,
  },
  {
    icon: FiImage,
    eyebrow: "Картинки",
    title: "Генерация изображений",
    text: "Опишите идею — получите иллюстрацию или фото за секунды.",
    href: "/chat",
    cta: "Сгенерировать",
    accent: C.violet,
  },
  {
    icon: FiCpu,
    eyebrow: "Проекты",
    title: "Умные проекты",
    text: "Загрузите файлы — ИИ работает в контексте именно ваших документов.",
    href: "/chat",
    cta: "Создать проект",
    accent: C.violet,
  },
  {
    icon: FiFileText,
    eyebrow: "Шаблоны",
    title: "AI-шаблоны",
    text: "Готовые сценарии: переводчик, упрощатель писем, редактор резюме.",
    href: "/all-templates",
    cta: "Все шаблоны",
    accent: C.actionBlue,
  },
  {
    icon: FiEdit3,
    eyebrow: "Идеи",
    title: "Блог и подсказки",
    text: "Реальные кейсы и подборки — как использовать ИИ в работе и жизни.",
    href: "/blog",
    cta: "Читать блог",
    accent: C.violet,
  },
];

const pricingPlans = [
  {
    name: "Pro Text",
    price: "149 ₽",
    period: "в месяц",
    dark: false,
    badge: null as string | null,
    desc: "Для активной текстовой работы каждый день.",
    detail: "1600 страниц текста",
    cta: { label: "Выбрать", href: "/profile" },
  },
  {
    name: "Premium",
    price: "249 ₽",
    period: "в месяц",
    dark: true, // sole dark accent on the whole page
    badge: "Популярный выбор",
    desc: "Тексты и изображения — всё включено.",
    detail: "2400 стр. текста · 150 изображений",
    cta: { label: "Начать", href: "/others/sign-in" },
  },
  {
    name: "Basic Art",
    price: "99 ₽",
    period: "за пакет",
    dark: false,
    badge: null as string | null,
    desc: "Генерация изображений без подписки.",
    detail: "100 изображений",
    cta: { label: "Выбрать", href: "/profile" },
  },
];

const footerLinks: Record<string, { label: string; href: string }[]> = {
  Продукт: [
    { label: "Чат", href: "/chat" },
    { label: "Тарифы", href: "/profile" },
    { label: "Агенты", href: "/life-agents" },
  ],
  Компания: [
    { label: "Блог", href: "/blog" },
    { label: "Контакты", href: "https://telegra.ph/Polzovatelskoe-soglashenie-03-05-7" },
    { label: "Политика", href: "https://telegra.ph/Politika-konfidencialnosti-03-05-7" },
  ],
};

// ── JSON-LD: Organization + WebSite (preserved verbatim) ────────────
const homepageJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://iiset.io/#organization",
      name: "ИИСеть",
      url: "https://iiset.io",
      logo: "https://iiset.io/brand.png",
    },
    {
      "@type": "WebSite",
      "@id": "https://iiset.io/#website",
      url: "https://iiset.io",
      name: "ИИСеть",
      inLanguage: "ru-RU",
      publisher: { "@id": "https://iiset.io/#organization" },
    },
  ],
};

// ── Page ─────────────────────────────────────────────────────────────
export default function HomePage() {
  return (
    <Box as="main" bg={C.canvasPearl}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homepageJsonLd) }}
      />

      {/* ── Sticky nav — light translucent ─────────────────────────── */}
      <Box
        as="nav"
        position="sticky"
        top="0"
        zIndex="100"
        bg="rgba(251,251,253,0.72)"
        backdropFilter="blur(20px) saturate(180%)"
        borderBottom="1px solid"
        borderColor={C.hairlineSoft}
      >
        <Flex
          mx="auto"
          maxW="1180px"
          px={{ base: "20px", md: "44px" }}
          h="48px"
          align="center"
          justify="space-between"
        >
          <Box
            as={Link}
            href="/"
            display="flex"
            alignItems="center"
            gap="10px"
            textDecoration="none"
          >
            <img
              src="/brand.png"
              alt="ИИСеть"
              style={{
                width: "26px",
                height: "26px",
                borderRadius: "7px",
                objectFit: "cover",
              }}
            />
            <Text
              fontSize="16px"
              fontWeight="600"
              letterSpacing="-0.32px"
              fontFamily={FT}
              color={C.ink}
            >
              ИИСеть
            </Text>
          </Box>

          <HStack spacing="28px" display={{ base: "none", md: "flex" }}>
            {[
              { label: "Возможности", href: "#features" },
              { label: "Что внутри", href: "#explore" },
              { label: "Тарифы", href: "#pricing" },
              { label: "Как начать", href: "#start" },
            ].map((l) => (
              <Box
                key={l.href}
                as={Link}
                href={l.href}
                fontSize="13px"
                fontWeight="400"
                letterSpacing="-0.08px"
                fontFamily={FT}
                color={C.ink}
                opacity={0.82}
                textDecoration="none"
                _hover={{ opacity: 1 }}
                transition="opacity 0.15s ease"
              >
                {l.label}
              </Box>
            ))}
          </HStack>

          <CtaPrimary href="/chat">Открыть чат</CtaPrimary>
        </Flex>
      </Box>

      {/* ── Hero — light, airy, single product scene ───────────────── */}
      <Box
        as="section"
        position="relative"
        overflow="hidden"
        bg={C.canvasPearl}
        pt={{ base: "72px", md: "108px" }}
        pb={{ base: "80px", md: "120px" }}
        px={{ base: "24px", md: "48px" }}
      >
        {/* Single soft accent blob, very low opacity */}
        <Box
          position="absolute"
          top="-220px"
          left="50%"
          transform="translateX(-50%)"
          w="1100px"
          h="540px"
          borderRadius="50%"
          bg="radial-gradient(ellipse, rgba(0,102,204,0.08) 0%, transparent 70%)"
          filter="blur(60px)"
          pointerEvents="none"
        />

        <Box mx="auto" maxW="1040px" textAlign="center" position="relative">
          <SectionEyebrow color={C.violet}>ИИ-платформа для работы и жизни</SectionEyebrow>

          <Heading
            as="h1"
            fontSize={{ base: "44px", sm: "60px", md: "80px" }}
            fontWeight="600"
            lineHeight="1.04"
            letterSpacing="-0.025em"
            fontFamily={FD}
            color={C.ink}
            mb="20px"
            maxW="900px"
            mx="auto"
          >
            Один сервис для всего,
            <br />
            что умеет ИИ.
          </Heading>

          <Text
            fontSize={{ base: "19px", md: "22px" }}
            fontWeight="400"
            lineHeight="1.45"
            letterSpacing="-0.012em"
            fontFamily={FD}
            color={C.inkSecondary}
            mb="36px"
            maxW="640px"
            mx="auto"
          >
            Диалог с лучшими моделями, веб-поиск со ссылками на источники и генерация
            изображений — на русском, в одном окне.
          </Text>

          <HStack
            spacing="6px"
            justify="center"
            flexWrap="wrap"
            mb={{ base: "56px", md: "72px" }}
          >
            <CtaPrimary href="/chat" large>
              Начать бесплатно
            </CtaPrimary>
            <CtaSecondary href="#features">Смотреть возможности</CtaSecondary>
          </HStack>

          {/* Large floating product scene — replaces nested chat card */}
          <Box mx="auto" maxW="940px">
            <MacChrome>
              <Box p={{ base: "20px", md: "32px" }} bg={C.canvas}>
                <HStack spacing="8px" mb="20px">
                  <Box
                    px="10px"
                    py="4px"
                    borderRadius="9999px"
                    bg={C.actionBlue}
                    color="white"
                    fontSize="12px"
                    fontWeight="600"
                    fontFamily={FT}
                  >
                    ИИ-чат
                  </Box>
                  <Box
                    px="10px"
                    py="4px"
                    borderRadius="9999px"
                    bg={C.canvasFog}
                    color={C.inkSecondary}
                    fontSize="12px"
                    fontFamily={FT}
                  >
                    Веб-поиск
                  </Box>
                  <Box
                    px="10px"
                    py="4px"
                    borderRadius="9999px"
                    bg={C.canvasFog}
                    color={C.inkSecondary}
                    fontSize="12px"
                    fontFamily={FT}
                  >
                    Изображения
                  </Box>
                </HStack>

                <VStack align="stretch" spacing="12px" textAlign="left">
                  <Box
                    alignSelf="flex-start"
                    bg={C.canvasFog}
                    px="18px"
                    py="14px"
                    borderRadius="16px 16px 16px 4px"
                    maxW={{ base: "90%", md: "70%" }}
                  >
                    <Text
                      fontSize={{ base: "15px", md: "16px" }}
                      fontFamily={FT}
                      color={C.ink}
                      lineHeight="1.5"
                    >
                      Напиши коммерческое предложение для небольшой бухгалтерской компании
                    </Text>
                  </Box>
                  <Box
                    alignSelf="flex-end"
                    bg={C.actionBlue}
                    px="18px"
                    py="14px"
                    borderRadius="16px 16px 4px 16px"
                    maxW={{ base: "90%", md: "70%" }}
                  >
                    <Text
                      fontSize={{ base: "15px", md: "16px" }}
                      fontFamily={FT}
                      color="white"
                      lineHeight="1.5"
                    >
                      Готово. Вот вариант КП с фокусом на доверие, конкретные выгоды и
                      чёткий следующий шаг.
                    </Text>
                  </Box>

                  <HStack spacing="6px" mt="6px" flexWrap="wrap">
                    {["GPT-4o", "Claude 3.5", "Gemini Pro"].map((m) => (
                      <Box
                        key={m}
                        px="9px"
                        py="3px"
                        borderRadius="9999px"
                        bg={C.canvasFog}
                      >
                        <Text fontSize="11px" fontFamily={FT} color={C.inkSecondary}>
                          {m}
                        </Text>
                      </Box>
                    ))}
                    <Text fontSize="11px" fontFamily={FT} color={C.inkTertiary}>
                      и другие
                    </Text>
                  </HStack>
                </VStack>
              </Box>
            </MacChrome>
          </Box>
        </Box>
      </Box>

      {/* ── Capabilities (3 hero tiles, light) ─────────────────────── */}
      <Box
        as="section"
        id="features"
        bg={C.canvasFog}
        py={{ base: "72px", md: "104px" }}
        px={{ base: "24px", md: "48px" }}
      >
        <Box mx="auto" maxW="1180px">
          <Box mb={{ base: "40px", md: "56px" }} maxW="720px">
            <SectionEyebrow>Возможности</SectionEyebrow>
            <Heading
              as="h2"
              fontSize={{ base: "32px", md: "52px" }}
              fontWeight="600"
              lineHeight="1.06"
              letterSpacing="-0.022em"
              fontFamily={FD}
              color={C.ink}
              mb="16px"
            >
              Три инструмента,
              <br />
              одно окно.
            </Heading>
            <Text
              fontSize={{ base: "18px", md: "20px" }}
              fontWeight="400"
              lineHeight="1.5"
              fontFamily={FD}
              color={C.inkSecondary}
              maxW="540px"
            >
              Больше не нужно держать пять сервисов открытыми одновременно.
            </Text>
          </Box>

          {/* 2x1 bento: lead tile (2 cols) + 2 stacked tiles */}
          <Box
            display="grid"
            gridTemplateColumns={{ base: "1fr", lg: "1.4fr 1fr" }}
            gap="20px"
          >
            {/* Lead tile — ИИ-чат */}
            <Tile p={{ base: "32px", md: "48px" }} borderRadius="28px">
              <Caption>ИИ-чат</Caption>
              <Heading
                as="h3"
                fontSize={{ base: "26px", md: "34px" }}
                fontWeight="600"
                lineHeight="1.12"
                letterSpacing="-0.018em"
                fontFamily={FD}
                color={C.ink}
                mt="10px"
                mb="14px"
              >
                Диалог с любой моделью.
              </Heading>
              <Text
                fontSize="17px"
                lineHeight="1.5"
                fontFamily={FT}
                color={C.inkSecondary}
                mb="28px"
                maxW="480px"
              >
                GPT-4o, Claude 3.5, Gemini и другие — один интерфейс для всех задач.
                Пишите письма, анализируйте документы, получайте советы.
              </Text>

              <Box bg={C.canvasFog} borderRadius="16px" p="20px">
                <VStack align="stretch" spacing="10px">
                  {[
                    { user: true, text: "Переведи этот абзац на английский и сделай формальнее" },
                    { user: false, text: "Here is a formal English translation, maintaining professional tone throughout." },
                    { user: true, text: "Добавь заключительный абзац с призывом к действию" },
                  ].map((msg, i) => (
                    <Box
                      key={i}
                      alignSelf={msg.user ? "flex-start" : "flex-end"}
                      bg={msg.user ? C.canvas : C.actionBlue}
                      px="14px"
                      py="10px"
                      borderRadius="12px"
                      maxW="86%"
                      boxShadow={msg.user ? "0 1px 2px rgba(15,23,42,0.04)" : "none"}
                    >
                      <Text
                        fontSize="14px"
                        fontFamily={FT}
                        color={msg.user ? C.ink : "white"}
                        lineHeight="1.5"
                      >
                        {msg.text}
                      </Text>
                    </Box>
                  ))}
                </VStack>
              </Box>

              <Box mt="20px">
                <CtaSecondary href="/chat">Открыть чат</CtaSecondary>
              </Box>
            </Tile>

            {/* Right column: 2 stacked tiles */}
            <VStack spacing="20px" align="stretch">
              <Tile p={{ base: "28px", md: "36px" }} borderRadius="28px">
                <Caption>Веб-поиск</Caption>
                <Heading
                  as="h3"
                  fontSize={{ base: "22px", md: "26px" }}
                  fontWeight="600"
                  lineHeight="1.14"
                  letterSpacing="-0.016em"
                  fontFamily={FD}
                  color={C.ink}
                  mt="8px"
                  mb="10px"
                >
                  Свежие данные со ссылками.
                </Heading>
                <Text
                  fontSize="15px"
                  lineHeight="1.5"
                  fontFamily={FT}
                  color={C.inkSecondary}
                  mb="20px"
                >
                  ИИ ищет в реальном времени и показывает источники.
                </Text>

                <VStack spacing="8px" align="stretch">
                  {[
                    { src: "РБК", text: "Курс доллара на сегодня…" },
                    { src: "Forbes", text: "Топ-10 ИИ-инструментов 2025…" },
                  ].map((r) => (
                    <Flex
                      key={r.src}
                      gap="10px"
                      p="10px 12px"
                      bg={C.canvasFog}
                      borderRadius="10px"
                      align="center"
                    >
                      <Box
                        px="7px"
                        py="2px"
                        borderRadius="6px"
                        bg={C.canvas}
                        border="1px solid"
                        borderColor={C.hairlineSoft}
                      >
                        <Text
                          fontSize="11px"
                          fontWeight="600"
                          fontFamily={FT}
                          color={C.ink}
                        >
                          {r.src}
                        </Text>
                      </Box>
                      <Text
                        fontSize="13px"
                        fontFamily={FT}
                        color={C.inkSecondary}
                        noOfLines={1}
                      >
                        {r.text}
                      </Text>
                    </Flex>
                  ))}
                </VStack>

                <Box mt="16px">
                  <CtaSecondary href="/chat">Попробовать поиск</CtaSecondary>
                </Box>
              </Tile>

              <Tile p={{ base: "28px", md: "36px" }} borderRadius="28px">
                <Caption>Генерация</Caption>
                <Heading
                  as="h3"
                  fontSize={{ base: "22px", md: "26px" }}
                  fontWeight="600"
                  lineHeight="1.14"
                  letterSpacing="-0.016em"
                  fontFamily={FD}
                  color={C.ink}
                  mt="8px"
                  mb="10px"
                >
                  Изображения по тексту.
                </Heading>
                <Text
                  fontSize="15px"
                  lineHeight="1.5"
                  fontFamily={FT}
                  color={C.inkSecondary}
                  mb="20px"
                >
                  Опишите идею — получите иллюстрацию за секунды.
                </Text>

                <SimpleGrid columns={4} spacing="6px" mb="18px">
                  {[C.actionBlue, C.violet, "#a5b4fc", "#0b3b8c"].map((bg, i) => (
                    <Box
                      key={i}
                      bg={bg}
                      borderRadius="8px"
                      h="46px"
                      opacity={0.85}
                    />
                  ))}
                </SimpleGrid>

                <CtaSecondary href="/chat">Сгенерировать изображение</CtaSecondary>
              </Tile>
            </VStack>
          </Box>
        </Box>
      </Box>

      {/* ── Horizontal scroll: Возможности ИИСеть (product tiles) ── */}
      <Box
        as="section"
        id="explore"
        bg={C.canvasPearl}
        py={{ base: "72px", md: "104px" }}
      >
        <Box mx="auto" maxW="1180px" px={{ base: "24px", md: "48px" }} mb="40px">
          <SectionEyebrow>Что можно сделать</SectionEyebrow>
          <Flex
            direction={{ base: "column", md: "row" }}
            justify="space-between"
            align={{ base: "flex-start", md: "flex-end" }}
            gap="16px"
          >
            <Heading
              as="h2"
              fontSize={{ base: "32px", md: "52px" }}
              fontWeight="600"
              lineHeight="1.06"
              letterSpacing="-0.022em"
              fontFamily={FD}
              color={C.ink}
              maxW="720px"
            >
              Возможности ИИСеть.
            </Heading>
            <CtaSecondary href="/chat">Открыть всё в чате</CtaSecondary>
          </Flex>
        </Box>

        {/* Edge-faded horizontal scroller, no JS, scroll-snap, swipe-friendly */}
        <Box
          sx={{
            overflowX: "auto",
            overflowY: "hidden",
            scrollSnapType: "x mandatory",
            scrollPaddingLeft: "48px",
            scrollbarWidth: "none",
            "&::-webkit-scrollbar": { display: "none" },
            WebkitOverflowScrolling: "touch",
            maskImage:
              "linear-gradient(to right, transparent 0, black 56px, black calc(100% - 56px), transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(to right, transparent 0, black 56px, black calc(100% - 56px), transparent 100%)",
            "@media (prefers-reduced-motion: reduce)": {
              scrollBehavior: "auto",
            },
          }}
        >
          <Flex
            as="ul"
            listStyleType="none"
            gap="20px"
            px={{ base: "24px", md: "48px" }}
            py="8px"
            mx="auto"
            maxW="1180px"
            w="max-content"
          >
            {featureTiles.map((t) => (
              <Box
                as="li"
                key={t.title}
                sx={{ scrollSnapAlign: "start" }}
                w={{ base: "78vw", sm: "360px", md: "380px" }}
                minW={{ base: "78vw", sm: "360px", md: "380px" }}
              >
                <Tile
                  p={{ base: "26px", md: "30px" }}
                  borderRadius="24px"
                  h="100%"
                  display="flex"
                  flexDirection="column"
                  justifyContent="space-between"
                  minH="280px"
                >
                  <Box>
                    <Flex
                      align="center"
                      justify="center"
                      boxSize="40px"
                      borderRadius="12px"
                      bg={C.canvasFog}
                      mb="20px"
                    >
                      <Icon as={t.icon} color={t.accent} boxSize="18px" />
                    </Flex>
                    <Caption>{t.eyebrow}</Caption>
                    <Heading
                      as="h3"
                      fontSize="22px"
                      fontWeight="600"
                      lineHeight="1.18"
                      letterSpacing="-0.014em"
                      fontFamily={FD}
                      color={C.ink}
                      mt="8px"
                      mb="10px"
                    >
                      {t.title}
                    </Heading>
                    <Text
                      fontSize="15px"
                      fontFamily={FT}
                      color={C.inkSecondary}
                      lineHeight="1.5"
                    >
                      {t.text}
                    </Text>
                  </Box>
                  <Box mt="20px">
                    <Box
                      as={Link}
                      href={t.href}
                      display="inline-flex"
                      alignItems="center"
                      gap="3px"
                      fontSize="15px"
                      fontWeight="400"
                      letterSpacing="-0.16px"
                      fontFamily={FT}
                      color={t.accent}
                      textDecoration="none"
                      _hover={{ textDecoration: "underline" }}
                      transition="color 0.15s ease"
                    >
                      {t.cta}
                      <Icon as={FiArrowRight} boxSize="14px" />
                    </Box>
                  </Box>
                </Tile>
              </Box>
            ))}
          </Flex>
        </Box>
      </Box>

      {/* ── Why ИИСеть (light, asymmetric) ─────────────────────────── */}
      <Box
        as="section"
        bg={C.canvasFog}
        py={{ base: "72px", md: "104px" }}
        px={{ base: "24px", md: "48px" }}
      >
        <Box mx="auto" maxW="1180px">
          <Box mb={{ base: "40px", md: "56px" }} maxW="720px">
            <SectionEyebrow>Почему ИИСеть</SectionEyebrow>
            <Heading
              as="h2"
              fontSize={{ base: "32px", md: "52px" }}
              fontWeight="600"
              lineHeight="1.06"
              letterSpacing="-0.022em"
              fontFamily={FD}
              color={C.ink}
              mb="16px"
            >
              Не «ИИ-сервис».
              <br />
              Конкретная польза.
            </Heading>
            <Text
              fontSize={{ base: "18px", md: "20px" }}
              fontWeight="400"
              lineHeight="1.5"
              fontFamily={FD}
              color={C.inkSecondary}
              maxW="540px"
            >
              Четыре причины, почему люди возвращаются каждый день.
            </Text>
          </Box>

          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing="20px">
            {whyCards.map((w) => (
              <Tile key={w.title} p={{ base: "28px", md: "30px" }} borderRadius="22px">
                <Flex
                  boxSize="44px"
                  borderRadius="12px"
                  bg={C.canvasFog}
                  align="center"
                  justify="center"
                  mb="18px"
                >
                  <Icon as={w.icon} color={C.actionBlue} boxSize="20px" />
                </Flex>
                <Text
                  fontSize="18px"
                  fontWeight="600"
                  letterSpacing="-0.014em"
                  lineHeight="1.22"
                  fontFamily={FD}
                  color={C.ink}
                  mb="8px"
                >
                  {w.title}
                </Text>
                <Body muted>{w.text}</Body>
              </Tile>
            ))}
          </SimpleGrid>
        </Box>
      </Box>

      {/* ── Pricing (light, one dark accent tile) ──────────────────── */}
      <Box
        as="section"
        id="pricing"
        bg={C.canvasPearl}
        py={{ base: "72px", md: "104px" }}
        px={{ base: "24px", md: "48px" }}
      >
        <Box mx="auto" maxW="1080px">
          <Box mb={{ base: "40px", md: "56px" }} textAlign="center">
            <SectionEyebrow>Тарифы</SectionEyebrow>
            <Heading
              as="h2"
              fontSize={{ base: "32px", md: "52px" }}
              fontWeight="600"
              lineHeight="1.06"
              letterSpacing="-0.022em"
              fontFamily={FD}
              color={C.ink}
              mb="16px"
            >
              Платите только за то,
              <br />
              что используете.
            </Heading>
            <Text
              fontSize={{ base: "18px", md: "20px" }}
              fontWeight="400"
              lineHeight="1.5"
              fontFamily={FD}
              color={C.inkSecondary}
              maxW="520px"
              mx="auto"
            >
              Регистрация бесплатна. Тариф можно менять в любой момент.
            </Text>
          </Box>

          <SimpleGrid columns={{ base: 1, md: 3 }} spacing="20px" alignItems="stretch">
            {pricingPlans.map((plan) => {
              const isDark = plan.dark;
              return (
                <Tile
                  key={plan.name}
                  bg={isDark ? C.inkDeep : C.canvas}
                  p={{ base: "30px", md: "36px" }}
                  borderRadius="26px"
                  position="relative"
                  display="flex"
                  flexDirection="column"
                  sx={
                    isDark
                      ? {
                          boxShadow:
                            "0 1px 2px rgba(10,10,12,0.10), 0 24px 48px -16px rgba(10,10,12,0.30)",
                        }
                      : undefined
                  }
                >
                  {plan.badge && (
                    <Box
                      position="absolute"
                      top="-12px"
                      left="50%"
                      transform="translateX(-50%)"
                      bg={C.actionBlue}
                      color="white"
                      fontSize="11px"
                      fontWeight="600"
                      letterSpacing="0.04em"
                      textTransform="uppercase"
                      fontFamily={FT}
                      borderRadius="9999px"
                      px="12px"
                      py="4px"
                      whiteSpace="nowrap"
                    >
                      {plan.badge}
                    </Box>
                  )}

                  <Text
                    fontSize="14px"
                    fontWeight="600"
                    letterSpacing="0.04em"
                    textTransform="uppercase"
                    fontFamily={FT}
                    color={isDark ? "rgba(255,255,255,0.55)" : C.inkTertiary}
                    mb="14px"
                  >
                    {plan.name}
                  </Text>

                  <HStack align="baseline" spacing="6px" mb="10px">
                    <Text
                      fontSize="44px"
                      fontWeight="600"
                      lineHeight="1.05"
                      letterSpacing="-0.022em"
                      fontFamily={FD}
                      color={isDark ? "white" : C.ink}
                      sx={{ fontVariantNumeric: "tabular-nums" }}
                    >
                      {plan.price}
                    </Text>
                    <Text
                      fontSize="14px"
                      fontFamily={FT}
                      color={isDark ? "rgba(255,255,255,0.55)" : C.inkTertiary}
                    >
                      {plan.period}
                    </Text>
                  </HStack>

                  <Body dark={isDark} muted={isDark}>
                    {plan.desc}
                  </Body>
                  <Box mt="10px" mb="24px">
                    <Text
                      fontSize="14px"
                      fontFamily={FT}
                      color={isDark ? "rgba(255,255,255,0.62)" : C.inkSecondary}
                      lineHeight="1.45"
                    >
                      {plan.detail}
                    </Text>
                  </Box>

                  <Box mt="auto">
                    {isDark ? (
                      <Button
                        as={Link}
                        href={plan.cta.href}
                        bg="white"
                        color={C.ink}
                        borderRadius="9999px"
                        px="20px"
                        py="10px"
                        fontSize="15px"
                        fontWeight="500"
                        fontFamily={FT}
                        _hover={{ bg: "#f5f5f7" }}
                        _active={{ transform: "scale(0.98)" }}
                        transition="background-color 0.15s ease, transform 0.15s ease"
                        h="auto"
                        w={{ base: "100%", md: "auto" }}
                      >
                        {plan.cta.label}
                      </Button>
                    ) : (
                      <CtaPrimary href={plan.cta.href}>{plan.cta.label}</CtaPrimary>
                    )}
                  </Box>
                </Tile>
              );
            })}
          </SimpleGrid>

          <Box textAlign="center" mt="36px">
            <CtaSecondary href="/profile">Все тарифы и сравнение</CtaSecondary>
          </Box>
        </Box>
      </Box>

      {/* ── How to start (light editorial timeline) ────────────────── */}
      <Box
        as="section"
        id="start"
        bg={C.canvasFog}
        py={{ base: "72px", md: "104px" }}
        px={{ base: "24px", md: "48px" }}
      >
        <Box mx="auto" maxW="1080px">
          <Box mb={{ base: "40px", md: "56px" }} maxW="720px">
            <SectionEyebrow>Как начать</SectionEyebrow>
            <Heading
              as="h2"
              fontSize={{ base: "32px", md: "52px" }}
              fontWeight="600"
              lineHeight="1.06"
              letterSpacing="-0.022em"
              fontFamily={FD}
              color={C.ink}
              mb="16px"
            >
              Три шага. Без настроек.
            </Heading>
            <Text
              fontSize={{ base: "18px", md: "20px" }}
              fontWeight="400"
              lineHeight="1.5"
              fontFamily={FD}
              color={C.inkSecondary}
              maxW="520px"
            >
              Никаких API-ключей. Никаких сложных интерфейсов. Просто чат.
            </Text>
          </Box>

          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={{ base: "32px", md: "20px" }}>
            {[
              {
                n: "01",
                t: "Откройте чат",
                d: "Зайдите с любого браузера. Регистрация — за одну минуту.",
              },
              {
                n: "02",
                t: "Опишите задачу",
                d: "Напишите запрос или выберите агента. ИИСеть подберёт модель.",
              },
              {
                n: "03",
                t: "Используйте результат",
                d: "Скопируйте, отредактируйте, скачайте. Готово к работе.",
              },
            ].map((s) => (
              <Box key={s.n} position="relative">
                <Text
                  fontSize={{ base: "88px", md: "120px" }}
                  fontWeight="600"
                  lineHeight="1"
                  letterSpacing="-0.04em"
                  fontFamily={FD}
                  color={C.hairline}
                  mb="12px"
                  sx={{ fontVariantNumeric: "tabular-nums" }}
                >
                  {s.n}
                </Text>
                <Heading
                  as="h3"
                  fontSize="22px"
                  fontWeight="600"
                  letterSpacing="-0.014em"
                  fontFamily={FD}
                  color={C.ink}
                  mb="8px"
                >
                  {s.t}
                </Heading>
                <Body muted>{s.d}</Body>
              </Box>
            ))}
          </SimpleGrid>
        </Box>
      </Box>

      {/* ── Final CTA — soft and contained ─────────────────────────── */}
      <Box
        as="section"
        position="relative"
        overflow="hidden"
        bg={C.canvasPearl}
        py={{ base: "88px", md: "128px" }}
        px={{ base: "24px", md: "48px" }}
        textAlign="center"
      >
        <Box
          position="absolute"
          top="50%"
          left="50%"
          transform="translate(-50%, -50%)"
          w="900px"
          h="380px"
          borderRadius="50%"
          bg="radial-gradient(ellipse, rgba(0,102,204,0.07) 0%, transparent 70%)"
          filter="blur(60px)"
          pointerEvents="none"
        />
        <Box mx="auto" maxW="720px" position="relative">
          <Heading
            as="h2"
            fontSize={{ base: "36px", md: "60px" }}
            fontWeight="600"
            lineHeight="1.04"
            letterSpacing="-0.024em"
            fontFamily={FD}
            color={C.ink}
            mb="20px"
          >
            Попробуйте прямо сейчас.
          </Heading>
          <Text
            fontSize={{ base: "18px", md: "22px" }}
            fontWeight="400"
            lineHeight="1.45"
            fontFamily={FD}
            color={C.inkSecondary}
            mb="36px"
          >
            Первый запрос — бесплатно. Результат — за секунды.
          </Text>
          <HStack spacing="6px" justify="center" flexWrap="wrap">
            <CtaPrimary href="/chat" large>
              Открыть чат
            </CtaPrimary>
            <CtaGhost href="/others/sign-in" large>
              Зарегистрироваться
            </CtaGhost>
          </HStack>
        </Box>
      </Box>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <Box
        as="footer"
        bg={C.canvasFog}
        py={{ base: "44px", md: "56px" }}
        px={{ base: "24px", md: "48px" }}
      >
        <Box mx="auto" maxW="1180px">
          <Flex
            direction={{ base: "column", md: "row" }}
            justify="space-between"
            align={{ base: "flex-start", md: "flex-end" }}
            gap="32px"
          >
            <VStack align="flex-start" spacing="8px">
              <HStack spacing="10px">
                <img
                  src="/brand.png"
                  alt="ИИСеть"
                  style={{
                    width: "26px",
                    height: "26px",
                    borderRadius: "7px",
                    objectFit: "cover",
                  }}
                />
                <Text
                  fontSize="16px"
                  fontWeight="600"
                  letterSpacing="-0.32px"
                  fontFamily={FT}
                  color={C.ink}
                >
                  ИИСеть
                </Text>
              </HStack>
              <Text
                fontSize="14px"
                fontFamily={FT}
                color={C.inkSecondary}
                lineHeight="1.43"
                letterSpacing="-0.16px"
              >
                ИИ-чат, веб-поиск и генерация изображений
              </Text>
            </VStack>

            <Flex direction={{ base: "column", sm: "row" }} gap={{ base: "24px", md: "48px" }}>
              {Object.entries(footerLinks).map(([section, links]) => (
                <VStack key={section} align="flex-start" spacing="2px">
                  <Text
                    fontSize="13px"
                    fontWeight="600"
                    letterSpacing="0.04em"
                    textTransform="uppercase"
                    fontFamily={FT}
                    color={C.inkTertiary}
                    mb="6px"
                  >
                    {section}
                  </Text>
                  {links.map((link) => (
                    <Box
                      key={link.href}
                      as={Link}
                      href={link.href}
                      display="block"
                      fontSize="15px"
                      fontWeight="400"
                      lineHeight="2"
                      fontFamily={FT}
                      color={C.ink}
                      textDecoration="none"
                      _hover={{ color: C.actionBlue }}
                      transition="color 0.15s ease"
                    >
                      {link.label}
                    </Box>
                  ))}
                </VStack>
              ))}
            </Flex>
          </Flex>

          <Box mt="36px" pt="20px" borderTop="1px solid" borderColor={C.hairlineSoft}>
            <Text
              fontSize="12px"
              fontWeight="400"
              lineHeight="1.0"
              letterSpacing="-0.06px"
              fontFamily={FT}
              color={C.inkTertiary}
            >
              © {new Date().getFullYear()} ИИСеть. Все права защищены.
            </Text>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
