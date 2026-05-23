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
  FiChevronRight,
  FiGlobe,
  FiImage,
  FiLayers,
  FiMessageSquare,
  FiSearch,
  FiZap,
} from "react-icons/fi";
import Link from "next/link";

// ── Design tokens ────────────────────────────────────────────────────
const C = {
  // Apple palette
  actionBlue: "#0066cc",
  actionBlueFocus: "#0071e3",
  actionBlueOnDark: "#2997ff",
  ink: "#1d1d1f",
  inkMuted48: "#7a7a7a",
  hairline: "#e0e0e0",
  canvas: "#ffffff",
  canvasParchment: "#f5f5f7",
  surfaceTile1: "#272729",
  surfaceTile2: "#2a2a2c",
  // Glass / aurora accents
  violet: "#6366f1",
  cyan: "#06b6d4",
  heroBase: "#060612",
};

const FD = `system-ui, -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif`;
const FT = `system-ui, -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif`;

// ── GlassCard ────────────────────────────────────────────────────────
interface GlassCardProps {
  children: React.ReactNode;
  p?: string | object;
  borderRadius?: string;
  glowColor?: string;
  hover?: boolean;
  [key: string]: unknown;
}

function GlassCard({
  children,
  p = "28px",
  borderRadius = "20px",
  glowColor,
  hover = true,
  ...rest
}: GlassCardProps) {
  const shadow = `0 4px 32px rgba(0,0,0,0.28)${glowColor ? `, 0 0 28px ${glowColor}` : ""}`;
  const hoverShadow = `0 14px 48px rgba(0,0,0,0.38)${glowColor ? `, 0 0 40px ${glowColor}` : ""}`;

  return (
    <Box
      bg="rgba(255,255,255,0.055)"
      backdropFilter="blur(20px) saturate(160%)"
      border="1px solid rgba(255,255,255,0.10)"
      borderRadius={borderRadius}
      boxShadow={shadow}
      p={p}
      transition="all 0.22s ease"
      {...(hover
        ? {
            _hover: {
              transform: "translateY(-4px)",
              border: "1px solid rgba(255,255,255,0.18)",
              boxShadow: hoverShadow,
            },
          }
        : {})}
      {...rest}
    >
      {children}
    </Box>
  );
}

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
      px={large ? "32px" : "22px"}
      py={large ? "14px" : "11px"}
      fontSize={large ? "18px" : "17px"}
      fontWeight={large ? "300" : "400"}
      lineHeight="1.0"
      fontFamily={FT}
      _hover={{ bg: C.actionBlueFocus, transform: "scale(1.02)" }}
      _active={{ transform: "scale(0.96)" }}
      transition="all 0.15s ease"
      h="auto"
      boxShadow="0 0 22px rgba(0,102,204,0.42)"
    >
      {children}
    </Button>
  );
}

function CtaOutline({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Button
      as={Link}
      href={href}
      variant="outline"
      borderColor="rgba(255,255,255,0.22)"
      color="white"
      borderRadius="9999px"
      px="22px"
      py="11px"
      fontSize="17px"
      fontWeight="400"
      fontFamily={FT}
      bg="rgba(255,255,255,0.06)"
      _hover={{ bg: "rgba(255,255,255,0.13)", borderColor: "rgba(255,255,255,0.40)" }}
      _active={{ transform: "scale(0.96)" }}
      transition="all 0.15s ease"
      h="auto"
    >
      {children}
    </Button>
  );
}

function CtaLink({
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
      fontSize="17px"
      fontWeight="400"
      letterSpacing="-0.374px"
      fontFamily={FT}
      color={dark ? C.actionBlueOnDark : C.actionBlue}
      textDecoration="none"
      _hover={{ color: dark ? "#5ac8ff" : C.actionBlueFocus }}
      transition="color 0.15s ease"
    >
      {children}
      <Icon as={FiChevronRight} boxSize="15px" />
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
            ? "rgba(255,255,255,0.52)"
            : C.inkMuted48
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
      fontSize="14px"
      fontWeight="400"
      lineHeight="1.43"
      letterSpacing="-0.224px"
      fontFamily={FT}
      color={dark ? "rgba(255,255,255,0.45)" : C.inkMuted48}
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
    text: "КП, письма, посты, пересказы, картинки — реальные задачи каждый день.",
  },
];

const pricingPlans = [
  {
    name: "Premium",
    price: "249 ₽",
    period: "в месяц",
    highlight: true,
    badge: "Популярный выбор",
    desc: "Тексты и изображения — всё включено.",
    detail: "2400 стр. текста · 150 изображений",
    cta: { label: "Начать", href: "/others/sign-in" },
  },
  {
    name: "Pro Text",
    price: "149 ₽",
    period: "в месяц",
    highlight: false,
    badge: null,
    desc: "Для активной текстовой работы каждый день.",
    detail: "1600 страниц текста",
    cta: { label: "Выбрать", href: "/profile" },
  },
  {
    name: "Basic Art",
    price: "99 ₽",
    period: "за пакет",
    highlight: false,
    badge: null,
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

// ── Page ─────────────────────────────────────────────────────────────
// ── JSON-LD: Organization + WebSite ────────────────────────────────
// Намеренно без SearchAction — настоящего поиска по сайту пока нет,
// а ложный SearchAction вредит SEO.
const homepageJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://iiset.io/#organization',
      name: 'ИИСеть',
      url: 'https://iiset.io',
      logo: 'https://iiset.io/brand.png',
    },
    {
      '@type': 'WebSite',
      '@id': 'https://iiset.io/#website',
      url: 'https://iiset.io',
      name: 'ИИСеть',
      inLanguage: 'ru-RU',
      publisher: { '@id': 'https://iiset.io/#organization' },
    },
  ],
};

export default function HomePage() {
  return (
    <Box as="main" bg={C.heroBase}>
      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homepageJsonLd) }}
      />

      {/* ── Sticky nav ─────────────────────────────────────────────── */}
      <Box
        as="nav"
        position="sticky"
        top="0"
        zIndex="100"
        bg="rgba(6,6,18,0.75)"
        backdropFilter="blur(20px) saturate(180%)"
        borderBottom="1px solid rgba(255,255,255,0.08)"
      >
        <Flex
          mx="auto"
          maxW="1200px"
          px={{ base: "20px", md: "48px" }}
          h="52px"
          align="center"
          justify="space-between"
        >
          {/* Logo */}
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
                width: "30px",
                height: "30px",
                borderRadius: "8px",
                objectFit: "cover",
              }}
            />
            <Text
              fontSize="17px"
              fontWeight="600"
              letterSpacing="-0.374px"
              fontFamily={FT}
              color="white"
            >
              ИИСеть
            </Text>
          </Box>

          {/* Nav links — desktop */}
          <HStack spacing="32px" display={{ base: "none", md: "flex" }}>
            {[
              { label: "Возможности", href: "#features" },
              { label: "Тарифы", href: "#pricing" },
              { label: "Как начать", href: "#start" },
            ].map((l) => (
              <Box
                key={l.href}
                as={Link}
                href={l.href}
                fontSize="14px"
                fontWeight="400"
                letterSpacing="-0.12px"
                fontFamily={FT}
                color="rgba(255,255,255,0.68)"
                textDecoration="none"
                _hover={{ color: "white" }}
                transition="color 0.15s ease"
              >
                {l.label}
              </Box>
            ))}
          </HStack>

          <CtaPrimary href="/chat">Открыть чат</CtaPrimary>
        </Flex>
      </Box>

      {/* ── Hero ───────────────────────────────────────────────────── */}
      <Box
        as="section"
        position="relative"
        overflow="hidden"
        bg={C.heroBase}
        pt={{ base: "80px", md: "104px" }}
        pb={{ base: "80px", md: "120px" }}
        px={{ base: "24px", md: "48px" }}
      >
        {/* Aurora blobs */}
        <Box
          position="absolute"
          top="-180px"
          left="-120px"
          w="700px"
          h="700px"
          borderRadius="50%"
          bg="radial-gradient(circle, rgba(0,102,204,0.36) 0%, transparent 65%)"
          filter="blur(80px)"
          pointerEvents="none"
        />
        <Box
          position="absolute"
          top="-60px"
          right="-160px"
          w="540px"
          h="540px"
          borderRadius="50%"
          bg="radial-gradient(circle, rgba(99,102,241,0.28) 0%, transparent 65%)"
          filter="blur(72px)"
          pointerEvents="none"
        />
        <Box
          position="absolute"
          bottom="-80px"
          left="38%"
          w="380px"
          h="380px"
          borderRadius="50%"
          bg="radial-gradient(circle, rgba(6,182,212,0.18) 0%, transparent 65%)"
          filter="blur(60px)"
          pointerEvents="none"
        />

        <Box mx="auto" maxW="980px" textAlign="center" position="relative">
          {/* Eyebrow pill */}
          <Box
            display="inline-flex"
            alignItems="center"
            px="14px"
            py="6px"
            borderRadius="9999px"
            bg="rgba(0,102,204,0.18)"
            border="1px solid rgba(0,102,204,0.38)"
            mb="24px"
          >
            <Text
              fontSize="14px"
              fontWeight="600"
              letterSpacing="0.2px"
              fontFamily={FT}
              color={C.actionBlueOnDark}
            >
              ИИ-платформа нового поколения
            </Text>
          </Box>

          <Heading
            as="h1"
            fontSize={{ base: "38px", sm: "50px", md: "66px" }}
            fontWeight="600"
            lineHeight="1.04"
            letterSpacing="-0.5px"
            fontFamily={FD}
            color="white"
            mb="24px"
          >
            Один сервис для всего,
            <br />
            что умеет ИИ.
          </Heading>

          <Text
            fontSize={{ base: "19px", md: "24px" }}
            fontWeight="300"
            lineHeight="1.5"
            fontFamily={FD}
            color="rgba(255,255,255,0.68)"
            mb="40px"
            maxW="620px"
            mx="auto"
          >
            Диалог с лучшими моделями, поиск в интернете со ссылками на источники
            и генерация изображений — всё на русском языке, в одном окне.
          </Text>

          <HStack
            spacing="12px"
            justify="center"
            flexWrap="wrap"
            mb={{ base: "56px", md: "72px" }}
          >
            <CtaPrimary href="/chat" large>Начать бесплатно</CtaPrimary>
            <CtaOutline href="#features">Смотреть возможности</CtaOutline>
          </HStack>

          {/* Glass product preview */}
          <GlassCard
            p={{ base: "20px", md: "28px" }}
            borderRadius="24px"
            hover={false}
            mx="auto"
            maxW="720px"
            textAlign="left"
          >
            {/* Capability tabs */}
            <HStack spacing="8px" mb="20px" flexWrap="wrap">
              {[
                { icon: FiMessageSquare, label: "ИИ-чат", active: true, color: C.actionBlueOnDark },
                { icon: FiSearch, label: "Веб-поиск", active: false, color: "rgba(255,255,255,0.45)" },
                { icon: FiImage, label: "Изображения", active: false, color: "rgba(255,255,255,0.45)" },
              ].map((tab) => (
                <HStack
                  key={tab.label}
                  spacing="6px"
                  px="14px"
                  py="6px"
                  borderRadius="9999px"
                  bg={tab.active ? "rgba(0,102,204,0.28)" : "rgba(255,255,255,0.06)"}
                  border={
                    tab.active
                      ? "1px solid rgba(0,102,204,0.50)"
                      : "1px solid rgba(255,255,255,0.08)"
                  }
                >
                  <Icon as={tab.icon} color={tab.color} boxSize="13px" />
                  <Text
                    fontSize="13px"
                    fontWeight={tab.active ? "600" : "400"}
                    fontFamily={FT}
                    color={tab.active ? "white" : "rgba(255,255,255,0.52)"}
                  >
                    {tab.label}
                  </Text>
                </HStack>
              ))}
            </HStack>

            {/* Chat bubbles */}
            <VStack align="stretch" spacing="10px">
              <Box
                alignSelf="flex-start"
                bg="rgba(255,255,255,0.08)"
                border="1px solid rgba(255,255,255,0.10)"
                px="16px"
                py="12px"
                borderRadius="14px 14px 14px 4px"
                maxW="82%"
              >
                <Text
                  fontSize="15px"
                  fontFamily={FT}
                  color="rgba(255,255,255,0.88)"
                  lineHeight="1.5"
                >
                  Напиши коммерческое предложение для небольшой бухгалтерской компании
                </Text>
              </Box>
              <Box
                alignSelf="flex-end"
                bg="linear-gradient(135deg, #0066cc 0%, #0071e3 100%)"
                px="16px"
                py="12px"
                borderRadius="14px 14px 4px 14px"
                maxW="82%"
                boxShadow="0 4px 20px rgba(0,102,204,0.40)"
              >
                <Text fontSize="15px" fontFamily={FT} color="white" lineHeight="1.5">
                  Готово! Вот профессиональное КП с акцентом на доверие, конкретные
                  выгоды и чёткий призыв к действию…
                </Text>
              </Box>
              {/* Model chips */}
              <HStack spacing="8px" mt="4px" flexWrap="wrap">
                {["GPT-4o", "Claude 3.5", "Gemini Pro"].map((m) => (
                  <Box
                    key={m}
                    px="10px"
                    py="4px"
                    borderRadius="9999px"
                    bg="rgba(255,255,255,0.06)"
                    border="1px solid rgba(255,255,255,0.10)"
                  >
                    <Text fontSize="12px" fontFamily={FT} color="rgba(255,255,255,0.45)">
                      {m}
                    </Text>
                  </Box>
                ))}
                <Text fontSize="12px" fontFamily={FT} color="rgba(255,255,255,0.28)">
                  и другие
                </Text>
              </HStack>
            </VStack>
          </GlassCard>
        </Box>
      </Box>

      {/* ── Bento capabilities ─────────────────────────────────────── */}
      <Box
        as="section"
        id="features"
        bg={C.surfaceTile1}
        py={{ base: "64px", md: "80px" }}
        px={{ base: "24px", md: "48px" }}
      >
        <Box mx="auto" maxW="1200px">
          <Box textAlign="center" mb="48px">
            <Heading
              as="h2"
              fontSize={{ base: "28px", md: "40px" }}
              fontWeight="600"
              lineHeight="1.1"
              fontFamily={FD}
              color="white"
              mb="16px"
            >
              Три мощных инструмента в одном.
            </Heading>
            <Text
              fontSize={{ base: "19px", md: "22px" }}
              fontWeight="300"
              lineHeight="1.5"
              fontFamily={FD}
              color="rgba(255,255,255,0.58)"
              maxW="500px"
              mx="auto"
            >
              Больше не нужно держать пять сервисов открытыми одновременно.
            </Text>
          </Box>

          {/* Bento grid */}
          <Box
            display="grid"
            gridTemplateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }}
            gap="16px"
          >
            {/* ── AI Chat (spans 2 cols) */}
            <GlassCard
              gridColumn={{ base: "1", md: "1 / 3" }}
              p={{ base: "28px", md: "36px" }}
              glowColor="rgba(0,102,204,0.12)"
            >
              <HStack spacing="12px" mb="20px">
                <Box
                  boxSize="42px"
                  borderRadius="12px"
                  bg="rgba(0,102,204,0.20)"
                  border="1px solid rgba(0,102,204,0.35)"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  flexShrink={0}
                >
                  <Icon as={FiMessageSquare} color={C.actionBlueOnDark} boxSize="18px" />
                </Box>
                <Box>
                  <Caption dark>ИИ-чат</Caption>
                  <Text
                    fontSize="17px"
                    fontWeight="600"
                    letterSpacing="-0.374px"
                    fontFamily={FT}
                    color="white"
                  >
                    Диалог с любой моделью
                  </Text>
                </Box>
              </HStack>
              <Text
                fontSize="15px"
                fontFamily={FT}
                color="rgba(255,255,255,0.58)"
                lineHeight="1.5"
                mb="24px"
              >
                GPT-4o, Claude 3.5, Gemini и другие — один интерфейс для всех задач.
                Пишите письма, анализируйте документы, получайте советы и решайте
                рабочие вопросы.
              </Text>

              {/* Mini chat */}
              <VStack align="stretch" spacing="8px" mb="20px">
                {[
                  { user: true, text: "Переведи этот абзац на английский и сделай формальнее" },
                  { user: false, text: "Here is a formal English translation of the paragraph, maintaining professional tone throughout…" },
                  { user: true, text: "Добавь заключительный абзац с призывом к действию" },
                ].map((msg, i) => (
                  <Box
                    key={i}
                    alignSelf={msg.user ? "flex-start" : "flex-end"}
                    bg={
                      msg.user
                        ? "rgba(255,255,255,0.07)"
                        : "rgba(0,102,204,0.24)"
                    }
                    border={
                      msg.user
                        ? "1px solid rgba(255,255,255,0.08)"
                        : "1px solid rgba(0,102,204,0.35)"
                    }
                    px="14px"
                    py="10px"
                    borderRadius="11px"
                    maxW="76%"
                  >
                    <Text
                      fontSize="13px"
                      fontFamily={FT}
                      color={msg.user ? "rgba(255,255,255,0.78)" : "rgba(255,255,255,0.90)"}
                      lineHeight="1.5"
                    >
                      {msg.text}
                    </Text>
                  </Box>
                ))}
              </VStack>
              <CtaLink href="/chat" dark>
                Открыть чат
              </CtaLink>
            </GlassCard>

            {/* ── Web Search */}
            <GlassCard
              gridColumn={{ base: "1", md: "3" }}
              p={{ base: "28px", md: "32px" }}
              glowColor="rgba(6,182,212,0.10)"
            >
              <HStack spacing="12px" mb="20px">
                <Box
                  boxSize="42px"
                  borderRadius="12px"
                  bg="rgba(6,182,212,0.16)"
                  border="1px solid rgba(6,182,212,0.30)"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  flexShrink={0}
                >
                  <Icon as={FiSearch} color="#67e8f9" boxSize="18px" />
                </Box>
                <Box>
                  <Caption dark>Веб-поиск</Caption>
                  <Text
                    fontSize="17px"
                    fontWeight="600"
                    letterSpacing="-0.374px"
                    fontFamily={FT}
                    color="white"
                  >
                    Актуальные данные
                  </Text>
                </Box>
              </HStack>
              <Text
                fontSize="15px"
                fontFamily={FT}
                color="rgba(255,255,255,0.58)"
                lineHeight="1.5"
                mb="20px"
              >
                ИИ ищет в реальном времени и отвечает со ссылками на источники.
                Больше не нужно гадать, свежие ли данные.
              </Text>

              {/* Source result chips */}
              <VStack spacing="8px" align="stretch">
                {[
                  { src: "РБК", text: "Курс доллара на сегодня составляет…" },
                  { src: "Forbes", text: "Топ-10 ИИ-инструментов для бизнеса 2025…" },
                  { src: "VC.ru", text: "Как ChatGPT изменил рынок контента…" },
                ].map((r) => (
                  <Box
                    key={r.src}
                    p="12px"
                    bg="rgba(255,255,255,0.04)"
                    border="1px solid rgba(255,255,255,0.07)"
                    borderRadius="11px"
                  >
                    <HStack spacing="8px" mb="5px">
                      <Box
                        px="8px"
                        py="2px"
                        borderRadius="9999px"
                        bg="rgba(6,182,212,0.18)"
                        border="1px solid rgba(6,182,212,0.28)"
                      >
                        <Text
                          fontSize="11px"
                          fontWeight="600"
                          fontFamily={FT}
                          color="#67e8f9"
                        >
                          {r.src}
                        </Text>
                      </Box>
                    </HStack>
                    <Text
                      fontSize="13px"
                      fontFamily={FT}
                      color="rgba(255,255,255,0.58)"
                      lineHeight="1.4"
                    >
                      {r.text}
                    </Text>
                  </Box>
                ))}
              </VStack>
              <Box mt="16px">
                <CtaLink href="/chat" dark>
                  Попробовать поиск
                </CtaLink>
              </Box>
            </GlassCard>

            {/* ── Image generation */}
            <GlassCard
              gridColumn={{ base: "1", md: "1" }}
              p={{ base: "28px", md: "32px" }}
              glowColor="rgba(99,102,241,0.10)"
            >
              <HStack spacing="12px" mb="20px">
                <Box
                  boxSize="42px"
                  borderRadius="12px"
                  bg="rgba(99,102,241,0.20)"
                  border="1px solid rgba(99,102,241,0.35)"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  flexShrink={0}
                >
                  <Icon as={FiImage} color="#a5b4fc" boxSize="18px" />
                </Box>
                <Box>
                  <Caption dark>Генерация</Caption>
                  <Text
                    fontSize="17px"
                    fontWeight="600"
                    letterSpacing="-0.374px"
                    fontFamily={FT}
                    color="white"
                  >
                    Изображения по тексту
                  </Text>
                </Box>
              </HStack>
              <Text
                fontSize="15px"
                fontFamily={FT}
                color="rgba(255,255,255,0.58)"
                lineHeight="1.5"
                mb="20px"
              >
                Flux, Stable Diffusion и другие. Опишите — получите иллюстрацию за
                секунды.
              </Text>

              <SimpleGrid columns={2} spacing="8px" mb="16px">
                {[
                  { label: "Фотореализм", color: "rgba(0,102,204,0.28)" },
                  { label: "Иллюстрация", color: "rgba(99,102,241,0.28)" },
                  { label: "Концепт-арт", color: "rgba(6,182,212,0.22)" },
                  { label: "Абстракция", color: "rgba(139,92,246,0.22)" },
                ].map((s) => (
                  <Box
                    key={s.label}
                    bg={s.color}
                    border="1px solid rgba(255,255,255,0.10)"
                    borderRadius="12px"
                    h="60px"
                    display="flex"
                    alignItems="flex-end"
                    p="8px"
                  >
                    <Text
                      fontSize="11px"
                      fontFamily={FT}
                      color="rgba(255,255,255,0.75)"
                      fontWeight="600"
                    >
                      {s.label}
                    </Text>
                  </Box>
                ))}
              </SimpleGrid>
              <CtaLink href="/chat" dark>
                Сгенерировать изображение
              </CtaLink>
            </GlassCard>

            {/* ── Quick tasks (spans 2 cols) */}
            <GlassCard
              gridColumn={{ base: "1", md: "2 / 4" }}
              p={{ base: "28px", md: "32px" }}
            >
              <Caption dark>Быстрые задачи</Caption>
              <Text
                fontSize="21px"
                fontWeight="600"
                letterSpacing="0.231px"
                fontFamily={FD}
                color="white"
                mt="4px"
                mb="20px"
              >
                Что можно сделать за 5 минут
              </Text>
              <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing="10px">
                {[
                  "Написать деловое письмо",
                  "Узнать актуальный курс валют",
                  "Сгенерировать аватар для соцсетей",
                  "Кратко пересказать документ",
                  "Придумать 10 идей для поста",
                  "Перевести текст с любого языка",
                ].map((task) => (
                  <HStack
                    key={task}
                    spacing="10px"
                    p="12px"
                    bg="rgba(255,255,255,0.04)"
                    border="1px solid rgba(255,255,255,0.07)"
                    borderRadius="11px"
                  >
                    <Box
                      w="5px"
                      h="5px"
                      borderRadius="50%"
                      bg={C.actionBlueOnDark}
                      flexShrink={0}
                    />
                    <Text
                      fontSize="14px"
                      fontFamily={FT}
                      color="rgba(255,255,255,0.72)"
                      lineHeight="1.4"
                    >
                      {task}
                    </Text>
                  </HStack>
                ))}
              </SimpleGrid>
            </GlassCard>
          </Box>
        </Box>
      </Box>

      {/* ── Why ИИСеть (parchment) ─────────────────────────────────── */}
      <Box
        as="section"
        bg={C.canvasParchment}
        py={{ base: "64px", md: "80px" }}
        px={{ base: "24px", md: "48px" }}
      >
        <Box mx="auto" maxW="980px">
          <Box textAlign="center" mb="48px">
            <Heading
              as="h2"
              fontSize={{ base: "28px", md: "40px" }}
              fontWeight="600"
              lineHeight="1.1"
              fontFamily={FD}
              color={C.ink}
              mb="16px"
            >
              Почему выбирают ИИСеть
            </Heading>
            <Text
              fontSize={{ base: "19px", md: "22px" }}
              fontWeight="300"
              lineHeight="1.5"
              fontFamily={FD}
              color="#555"
              maxW="480px"
              mx="auto"
            >
              Не абстрактный «ИИ-сервис» — а конкретная польза каждый день.
            </Text>
          </Box>

          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing="20px">
            {whyCards.map((w) => (
              <Box
                key={w.title}
                bg={C.canvas}
                borderRadius="18px"
                p={{ base: "24px", md: "28px" }}
                border="1px solid"
                borderColor={C.hairline}
                transition="all 0.22s ease"
                _hover={{
                  transform: "translateY(-4px)",
                  boxShadow: "0 12px 32px rgba(0,0,0,0.08)",
                  borderColor: "rgba(0,102,204,0.30)",
                }}
              >
                <Box
                  boxSize="44px"
                  borderRadius="12px"
                  bg={C.canvasParchment}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  mb="16px"
                >
                  <Icon as={w.icon} color={C.actionBlue} boxSize="20px" />
                </Box>
                <Text
                  fontSize="17px"
                  fontWeight="600"
                  letterSpacing="-0.374px"
                  lineHeight="1.24"
                  fontFamily={FT}
                  color={C.ink}
                  mb="8px"
                >
                  {w.title}
                </Text>
                <Body muted>{w.text}</Body>
              </Box>
            ))}
          </SimpleGrid>
        </Box>
      </Box>

      {/* ── Pricing (dark + aurora) ────────────────────────────────── */}
      <Box
        as="section"
        id="pricing"
        position="relative"
        overflow="hidden"
        bg={C.heroBase}
        py={{ base: "64px", md: "80px" }}
        px={{ base: "24px", md: "48px" }}
      >
        <Box
          position="absolute"
          top="0"
          left="50%"
          transform="translateX(-50%)"
          w="900px"
          h="400px"
          borderRadius="50%"
          bg="radial-gradient(circle, rgba(0,102,204,0.14) 0%, transparent 70%)"
          filter="blur(80px)"
          pointerEvents="none"
        />

        <Box mx="auto" maxW="1000px" position="relative">
          <Box textAlign="center" mb="48px">
            <Heading
              as="h2"
              fontSize={{ base: "28px", md: "40px" }}
              fontWeight="600"
              lineHeight="1.1"
              fontFamily={FD}
              color="white"
              mb="16px"
            >
              Тарифы
            </Heading>
            <Text
              fontSize={{ base: "19px", md: "22px" }}
              fontWeight="300"
              lineHeight="1.5"
              fontFamily={FD}
              color="rgba(255,255,255,0.58)"
            >
              Регистрация бесплатна. Платите только за то, что используете.
            </Text>
          </Box>

          <SimpleGrid columns={{ base: 1, md: 3 }} spacing="16px">
            {pricingPlans.map((plan) => (
              <GlassCard
                key={plan.name}
                p={{ base: "28px", md: "32px" }}
                borderRadius="20px"
                position="relative"
                border={
                  plan.highlight
                    ? "1px solid rgba(0,102,204,0.42)"
                    : "1px solid rgba(255,255,255,0.10)"
                }
                glowColor={plan.highlight ? "rgba(0,102,204,0.20)" : undefined}
              >
                {plan.badge && (
                  <Box
                    position="absolute"
                    top="-13px"
                    left="50%"
                    transform="translateX(-50%)"
                    bg={C.actionBlue}
                    color="white"
                    fontSize="12px"
                    fontWeight="600"
                    lineHeight="1.29"
                    fontFamily={FT}
                    borderRadius="9999px"
                    px="14px"
                    py="4px"
                    whiteSpace="nowrap"
                    boxShadow="0 0 18px rgba(0,102,204,0.55)"
                  >
                    {plan.badge}
                  </Box>
                )}

                <Text
                  fontSize="21px"
                  fontWeight="600"
                  letterSpacing="0.231px"
                  fontFamily={FD}
                  color="white"
                  mb="12px"
                >
                  {plan.name}
                </Text>
                <HStack align="baseline" spacing="6px" mb="8px">
                  <Text
                    fontSize="40px"
                    fontWeight="600"
                    lineHeight="1.1"
                    fontFamily={FD}
                    color="white"
                  >
                    {plan.price}
                  </Text>
                  <Caption dark>{plan.period}</Caption>
                </HStack>
                <Body dark muted>
                  {plan.desc}
                </Body>
                <Box mt="8px" mb="20px">
                  <Caption dark>{plan.detail}</Caption>
                </Box>
                <CtaPrimary href={plan.cta.href}>{plan.cta.label}</CtaPrimary>
              </GlassCard>
            ))}
          </SimpleGrid>

          <Box textAlign="center" mt="28px">
            <CtaLink href="/profile" dark>
              Все тарифы и сравнение
            </CtaLink>
          </Box>
        </Box>
      </Box>

      {/* ── How to start ───────────────────────────────────────────── */}
      <Box
        as="section"
        id="start"
        bg={C.surfaceTile2}
        py={{ base: "64px", md: "80px" }}
        px={{ base: "24px", md: "48px" }}
      >
        <Box mx="auto" maxW="980px">
          <Box textAlign="center" mb="48px">
            <Heading
              as="h2"
              fontSize={{ base: "28px", md: "40px" }}
              fontWeight="600"
              lineHeight="1.1"
              fontFamily={FD}
              color="white"
              mb="16px"
            >
              Как начать за 3 шага
            </Heading>
            <Text
              fontSize={{ base: "19px", md: "22px" }}
              fontWeight="300"
              lineHeight="1.5"
              fontFamily={FD}
              color="rgba(255,255,255,0.55)"
            >
              Никаких настроек. Никаких API-ключей. Просто чат.
            </Text>
          </Box>

          <SimpleGrid columns={{ base: 1, md: 3 }} spacing="16px">
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
              <GlassCard key={s.n} p={{ base: "28px", md: "32px" }} borderRadius="20px">
                <Text
                  fontSize="34px"
                  fontWeight="600"
                  lineHeight="1.1"
                  fontFamily={FD}
                  color={C.actionBlueOnDark}
                  mb="12px"
                >
                  {s.n}
                </Text>
                <Text
                  fontSize="17px"
                  fontWeight="600"
                  letterSpacing="-0.374px"
                  fontFamily={FT}
                  color="white"
                  mb="8px"
                >
                  {s.t}
                </Text>
                <Body dark muted>
                  {s.d}
                </Body>
              </GlassCard>
            ))}
          </SimpleGrid>
        </Box>
      </Box>

      {/* ── Final CTA ──────────────────────────────────────────────── */}
      <Box
        as="section"
        position="relative"
        overflow="hidden"
        bg={C.heroBase}
        py={{ base: "80px", md: "120px" }}
        px={{ base: "24px", md: "48px" }}
        textAlign="center"
      >
        <Box
          position="absolute"
          top="0"
          left="0"
          right="0"
          bottom="0"
          bg="radial-gradient(ellipse at 50% 60%, rgba(0,102,204,0.20) 0%, transparent 68%)"
          pointerEvents="none"
        />
        <Box mx="auto" maxW="680px" position="relative">
          <Heading
            as="h2"
            fontSize={{ base: "32px", md: "52px" }}
            fontWeight="600"
            lineHeight="1.06"
            letterSpacing="-0.28px"
            fontFamily={FD}
            color="white"
            mb="20px"
          >
            Попробуйте прямо сейчас.
          </Heading>
          <Text
            fontSize={{ base: "19px", md: "22px" }}
            fontWeight="300"
            lineHeight="1.5"
            fontFamily={FD}
            color="rgba(255,255,255,0.62)"
            mb="40px"
          >
            Первый запрос — бесплатно. Результат — за секунды.
          </Text>
          <HStack spacing="12px" justify="center" flexWrap="wrap">
            <CtaPrimary href="/chat" large>
              Открыть чат
            </CtaPrimary>
            <CtaOutline href="/others/sign-in">Зарегистрироваться</CtaOutline>
          </HStack>
        </Box>
      </Box>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <Box
        as="footer"
        bg={C.canvasParchment}
        py={{ base: "40px", md: "48px" }}
        px={{ base: "24px", md: "48px" }}
      >
        <Box mx="auto" maxW="980px">
          <Flex
            direction={{ base: "column", md: "row" }}
            justify="space-between"
            align={{ base: "flex-start", md: "flex-end" }}
            gap="32px"
          >
            {/* Logo */}
            <VStack align="flex-start" spacing="8px">
              <HStack spacing="10px">
                <img
                  src="/brand.png"
                  alt="ИИСеть"
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "7px",
                    objectFit: "cover",
                  }}
                />
                <Text
                  fontSize="17px"
                  fontWeight="600"
                  letterSpacing="-0.374px"
                  fontFamily={FT}
                  color={C.ink}
                >
                  ИИСеть
                </Text>
              </HStack>
              <Text
                fontSize="14px"
                fontFamily={FT}
                color={C.inkMuted48}
                lineHeight="1.43"
                letterSpacing="-0.224px"
              >
                ИИ-чат, веб-поиск и генерация изображений
              </Text>
            </VStack>

            {/* Links */}
            <Flex direction={{ base: "column", sm: "row" }} gap={{ base: "24px", md: "48px" }}>
              {Object.entries(footerLinks).map(([section, links]) => (
                <VStack key={section} align="flex-start" spacing="0">
                  <Text
                    fontSize="14px"
                    fontWeight="600"
                    lineHeight="1.29"
                    letterSpacing="-0.224px"
                    fontFamily={FT}
                    color={C.ink}
                    mb="4px"
                  >
                    {section}
                  </Text>
                  {links.map((link) => (
                    <Box
                      key={link.href}
                      as={Link}
                      href={link.href}
                      display="block"
                      fontSize="17px"
                      fontWeight="400"
                      lineHeight="2.41"
                      fontFamily={FT}
                      color={C.actionBlue}
                      textDecoration="none"
                      _hover={{ color: C.actionBlueFocus }}
                      transition="color 0.15s ease"
                    >
                      {link.label}
                    </Box>
                  ))}
                </VStack>
              ))}
            </Flex>
          </Flex>

          <Box mt="32px" pt="20px" borderTop="1px solid" borderColor={C.hairline}>
            <Text
              fontSize="12px"
              fontWeight="400"
              lineHeight="1.0"
              letterSpacing="-0.12px"
              fontFamily={FT}
              color={C.inkMuted48}
            >
              © {new Date().getFullYear()} ИИСеть. Все права защищены.
            </Text>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
