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
import { FiArrowRight, FiChevronRight } from "react-icons/fi";
import Link from "next/link";
import Image from "next/image";

// ── Design tokens ────────────────────────────────────────────────────
const C = {
  ink: "#1d1d1f",
  inkSecondary: "#6e6e73",
  inkTertiary: "#86868b",
  hairline: "#d2d2d7",
  hairlineSoft: "#e8e8ed",
  canvas: "#ffffff",
  canvasPearl: "#fbfbfd",
  canvasFog: "#f5f5f7",
  canvasMist: "#f2f2f4",
  inkDeep: "#0a0a0c",
  inkDeepText: "#f5f5f7",
  inkDeepSecondary: "rgba(245,245,247,0.66)",
  inkDeepTertiary: "rgba(245,245,247,0.42)",
  inkDeepHairline: "rgba(255,255,255,0.10)",
  actionBlue: "#0066cc",
  actionBlueHover: "#0071e3",
  actionBlueOnDark: "#2997ff",
  violet: "#5e5ce6",
};

const FD = `system-ui, -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif`;
const FT = `system-ui, -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif`;

// ── CTAs ────────────────────────────────────────────────────────────
function CtaPrimary({
  href,
  children,
  large,
  dark,
}: {
  href: string;
  children: React.ReactNode;
  large?: boolean;
  dark?: boolean;
}) {
  return (
    <Button
      as={Link}
      href={href}
      bg={dark ? "white" : C.actionBlue}
      color={dark ? C.ink : "white"}
      borderRadius="9999px"
      px={large ? "30px" : "22px"}
      py={large ? "14px" : "11px"}
      fontSize={large ? "17px" : "15px"}
      fontWeight={dark ? "500" : "500"}
      lineHeight="1.0"
      fontFamily={FT}
      _hover={{ bg: dark ? C.canvasFog : C.actionBlueHover }}
      _active={{ transform: "scale(0.98)" }}
      transition="background-color 0.15s ease, transform 0.15s ease"
      h="auto"
      boxShadow="none"
    >
      {children}
    </Button>
  );
}

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
      gap="4px"
      fontSize="15px"
      fontWeight="500"
      letterSpacing="-0.16px"
      fontFamily={FT}
      color={dark ? C.actionBlueOnDark : C.actionBlue}
      textDecoration="none"
      px="8px"
      py="11px"
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
      px={large ? "30px" : "22px"}
      py={large ? "14px" : "11px"}
      fontSize={large ? "17px" : "15px"}
      fontWeight="500"
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

// ── Section primitives ──────────────────────────────────────────────
function SectionEyebrow({
  children,
  color,
}: {
  children: React.ReactNode;
  color?: string;
}) {
  return (
    <Text
      fontFamily={FT}
      fontSize="13px"
      fontWeight="600"
      letterSpacing="0.18em"
      textTransform="uppercase"
      color={color || C.actionBlue}
      mb="14px"
    >
      {children}
    </Text>
  );
}

function SectionHeading({
  children,
  dark,
  size = "lg",
}: {
  children: React.ReactNode;
  dark?: boolean;
  size?: "lg" | "xl";
}) {
  const fs =
    size === "xl"
      ? { base: "36px", md: "60px", lg: "72px" }
      : { base: "32px", md: "44px", lg: "56px" };
  return (
    <Heading
      as="h2"
      fontFamily={FD}
      fontSize={fs}
      fontWeight="600"
      lineHeight="1.04"
      letterSpacing="-0.022em"
      color={dark ? C.inkDeepText : C.ink}
      mb="16px"
    >
      {children}
    </Heading>
  );
}

function SectionLead({
  children,
  dark,
  maxW = "560px",
}: {
  children: React.ReactNode;
  dark?: boolean;
  maxW?: string;
}) {
  return (
    <Text
      fontFamily={FD}
      fontSize={{ base: "18px", md: "22px" }}
      fontWeight="400"
      lineHeight="1.45"
      letterSpacing="-0.012em"
      color={dark ? C.inkDeepSecondary : C.inkSecondary}
      maxW={maxW}
    >
      {children}
    </Text>
  );
}

// ── PosterFrame ───── wraps next/image with soft shadow + radius
function PosterFrame({
  src,
  alt,
  width,
  height,
  priority,
  sizes,
  borderRadius,
  shadow = "soft",
  ...rest
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  priority?: boolean;
  sizes?: string;
  borderRadius?: string | object;
  shadow?: "soft" | "deep" | "none";
  [k: string]: any;
}) {
  const shadowMap: Record<string, string> = {
    soft: "0 1px 2px rgba(15,23,42,0.04), 0 30px 80px -20px rgba(15,23,42,0.16)",
    deep: "0 1px 2px rgba(0,0,0,0.20), 0 40px 100px -20px rgba(0,0,0,0.55)",
    none: "none",
  };
  return (
    <Box
      borderRadius={borderRadius || { base: "20px", md: "28px" }}
      overflow="hidden"
      boxShadow={shadowMap[shadow]}
      width="100%"
      lineHeight={0}
      {...rest}
    >
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        sizes={sizes || "(max-width: 768px) 100vw, (max-width: 1280px) 90vw, 1200px"}
        style={{ width: "100%", height: "auto", display: "block" }}
      />
    </Box>
  );
}

// ── DemoCard ─── "Запрос → Результат" мини-демонстрация
function DemoCard({
  query,
  result,
  resultLabel = "Результат",
  dark,
}: {
  query: string;
  result: string;
  resultLabel?: string;
  dark?: boolean;
}) {
  const surface = dark ? "rgba(255,255,255,0.06)" : C.canvas;
  const surfaceQ = dark ? "rgba(255,255,255,0.04)" : C.canvasFog;
  const border = dark ? C.inkDeepHairline : C.hairlineSoft;
  const textPrimary = dark ? C.inkDeepText : C.ink;
  const textSecondary = dark ? C.inkDeepSecondary : C.inkSecondary;
  const textTertiary = dark ? C.inkDeepTertiary : C.inkTertiary;
  const accent = dark ? C.actionBlueOnDark : C.actionBlue;

  return (
    <Box
      bg={surface}
      border="1px solid"
      borderColor={border}
      borderRadius="20px"
      p={{ base: "16px", md: "20px" }}
      maxW="540px"
      width="100%"
      boxShadow={
        dark
          ? "0 1px 2px rgba(0,0,0,0.30)"
          : "0 1px 2px rgba(15,23,42,0.04), 0 12px 32px -16px rgba(15,23,42,0.10)"
      }
    >
      <Box mb="10px">
        <Text
          fontFamily={FT}
          fontSize="11px"
          fontWeight="700"
          letterSpacing="0.4px"
          textTransform="uppercase"
          color={textTertiary}
          mb="6px"
        >
          Запрос
        </Text>
        <Box
          bg={surfaceQ}
          border="1px solid"
          borderColor={border}
          borderRadius="12px"
          px="12px"
          py="10px"
        >
          <Text
            fontFamily={FT}
            fontSize="14px"
            color={textPrimary}
            lineHeight="1.45"
          >
            {query}
          </Text>
        </Box>
      </Box>
      <Flex align="center" gap="6px" mb="8px" color={accent}>
        <Icon as={FiArrowRight} boxSize="14px" />
        <Text
          fontFamily={FT}
          fontSize="11px"
          fontWeight="700"
          letterSpacing="0.4px"
          textTransform="uppercase"
        >
          {resultLabel}
        </Text>
      </Flex>
      <Text
        fontFamily={FT}
        fontSize="14px"
        color={textSecondary}
        lineHeight="1.5"
      >
        {result}
      </Text>
    </Box>
  );
}

// ── Footer ──────────────────────────────────────────────────────────
const footerLinks: Record<string, { label: string; href: string }[]> = {
  Продукт: [
    { label: "Чат", href: "/chat" },
    { label: "Тарифы", href: "/profile" },
    { label: "Агенты", href: "/life-agents" },
    { label: "Шаблоны", href: "/all-templates" },
  ],
  Компания: [
    { label: "Блог", href: "/blog" },
    { label: "Соглашение", href: "https://telegra.ph/Polzovatelskoe-soglashenie-03-05-7" },
    { label: "Политика", href: "https://telegra.ph/Politika-konfidencialnosti-03-05-7" },
  ],
};

// ── JSON-LD: Organization + WebSite + WebApplication (verbatim) ────
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
    {
      "@type": "WebApplication",
      "@id": "https://iiset.io/#webapp",
      name: "ИИСеть",
      url: "https://iiset.io/",
      applicationCategory: "ProductivityApplication",
      operatingSystem: "Web",
      inLanguage: "ru-RU",
      description:
        "ИИ-чат на русском с веб-поиском, источниками, генерацией изображений и работой с PDF/DOCX в одном окне.",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "RUB",
        availability: "https://schema.org/InStock",
        url: "https://iiset.io/others/sign-in",
      },
      provider: { "@id": "https://iiset.io/#organization" },
    },
  ],
};

// ── Static data ─────────────────────────────────────────────────────
const SCENARIOS = [
  { title: "Улучшить резюме", hint: "Под конкретную вакансию" },
  { title: "Подготовиться к интервью", hint: "Вопросы и ответы по вашей роли" },
  { title: "Разобрать документ", hint: "PDF, DOCX, договор, бриф" },
  { title: "Найти свежие данные", hint: "С ссылками на источники" },
  { title: "Написать письмо", hint: "Деловое, личное, в нужном тоне" },
  { title: "Создать визуал", hint: "Обложка, идея для презентации" },
  { title: "Придумать пост", hint: "Соцсети, рассылка, лид-форма" },
  { title: "Сравнить варианты", hint: "Тарифы, инструменты, гипотезы" },
];

const PROJECT_USE_CASES = [
  { title: "Поиск работы", hint: "Резюме, вакансии, сопровод." },
  { title: "Учёба", hint: "Конспекты, статьи, разборы" },
  { title: "Бизнес-идея", hint: "Анализ, план, расчёты" },
  { title: "Документы", hint: "Договоры, отчёты, презентации" },
];

const TRUST_POINTS = [
  "Работает на русском",
  "Показывает источники в веб-поиске",
  "Читает PDF, DOCX, XLSX, TXT",
  "Создаёт изображения по описанию",
  "Помнит материалы внутри проекта",
  "Подходит для работы, учёбы и личных задач",
];

// ─────────────────────────────────────────────────────────────────────
export default function HomePage() {
  return (
    <Box as="main" bg={C.canvasPearl}>
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
        bg="rgba(251,251,253,0.78)"
        backdropFilter="blur(20px) saturate(180%)"
        borderBottom="1px solid"
        borderColor={C.hairlineSoft}
      >
        <Flex
          mx="auto"
          maxW="1200px"
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
              { label: "Проекты", href: "#projects" },
              { label: "Сценарии", href: "#scenarios" },
            ].map((l) => (
              <Box
                key={l.href}
                as={Link}
                href={l.href}
                fontSize="13px"
                fontWeight="500"
                letterSpacing="-0.08px"
                fontFamily={FT}
                color={C.ink}
                opacity={0.78}
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

      {/* ── 1. Hero ───────────────────────────────────────────────── */}
      <Box
        as="section"
        bg={C.canvasPearl}
        pt={{ base: "64px", md: "104px" }}
        pb={{ base: "48px", md: "80px" }}
        px={{ base: "24px", md: "48px" }}
        position="relative"
        overflow="hidden"
      >
        {/* very soft single accent blob */}
        <Box
          position="absolute"
          top="-200px"
          left="50%"
          transform="translateX(-50%)"
          w="1100px"
          h="500px"
          borderRadius="50%"
          bg="radial-gradient(ellipse, rgba(0,102,204,0.06) 0%, transparent 70%)"
          filter="blur(60px)"
          pointerEvents="none"
        />

        <Box mx="auto" maxW="1080px" textAlign="center" position="relative">
          {/* Brand mark, no cheap label */}
          <Flex
            mx="auto"
            justify="center"
            mb={{ base: "20px", md: "28px" }}
          >
            <Box position="relative" display="inline-flex">
              <Box
                position="absolute"
                inset="-22px"
                bg="radial-gradient(circle, rgba(0,102,204,0.16) 0%, transparent 70%)"
                filter="blur(22px)"
                pointerEvents="none"
                aria-hidden
              />
              <img
                src="/brand.png"
                alt="ИИСеть"
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "16px",
                  objectFit: "cover",
                  position: "relative",
                  boxShadow:
                    "0 1px 2px rgba(15,23,42,0.08), 0 12px 36px -14px rgba(0,102,204,0.32)",
                }}
              />
            </Box>
          </Flex>

          <Heading
            as="h1"
            fontFamily={FD}
            fontSize={{ base: "44px", sm: "60px", md: "84px" }}
            fontWeight="600"
            lineHeight="1.02"
            letterSpacing="-0.028em"
            color={C.ink}
            mb="20px"
          >
            Напишите. Найдите. Создайте.
          </Heading>

          <Text
            fontFamily={FD}
            fontSize={{ base: "18px", md: "22px" }}
            fontWeight="400"
            lineHeight="1.4"
            letterSpacing="-0.012em"
            color={C.inkSecondary}
            mb={{ base: "32px", md: "40px" }}
            maxW="680px"
            mx="auto"
          >
            ИИСеть объединяет чат с ИИ, веб-поиск, генерацию изображений
            и работу с файлами в одном простом сервисе на русском.
          </Text>

          <HStack
            spacing="8px"
            justify="center"
            flexWrap="wrap"
            mb={{ base: "48px", md: "72px" }}
          >
            <CtaPrimary href="/chat" large>
              Открыть ИИСеть
            </CtaPrimary>
            <CtaSecondary href="#features">Посмотреть возможности</CtaSecondary>
          </HStack>

          <Box mx="auto" maxW="1200px">
            <PosterFrame
              src="/landing/iiset-hero-workspace.webp"
              alt="Рабочее пространство ИИСеть: чат с ИИ, веб-поиск с источниками и генерация изображений в одном окне на русском языке"
              width={1672}
              height={941}
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 92vw, 1200px"
              borderRadius={{ base: "20px", md: "32px" }}
              shadow="soft"
            />
          </Box>
        </Box>
      </Box>

      {/* ── 2. Dark Search Poster ─────────────────────────────────── */}
      <Box
        as="section"
        id="features"
        bg={C.inkDeep}
        py={{ base: "80px", md: "128px" }}
        px={{ base: "24px", md: "48px" }}
        color={C.inkDeepText}
        position="relative"
        overflow="hidden"
      >
        <Box
          position="absolute"
          top="-200px"
          right="-200px"
          w="700px"
          h="700px"
          borderRadius="50%"
          bg="radial-gradient(circle, rgba(41,151,255,0.18) 0%, transparent 65%)"
          filter="blur(80px)"
          pointerEvents="none"
        />

        <Box mx="auto" maxW="1200px" position="relative">
          <Flex
            direction={{ base: "column", lg: "row" }}
            align={{ base: "flex-start", lg: "center" }}
            gap={{ base: "40px", lg: "64px" }}
          >
            <Box flex="1 1 0" maxW={{ lg: "480px" }}>
              <SectionEyebrow color={C.actionBlueOnDark}>
                Веб-поиск с источниками
              </SectionEyebrow>
              <SectionHeading dark size="xl">
                Ответы со свежими источниками.
              </SectionHeading>
              <SectionLead dark>
                ИИСеть ищет в интернете и сразу показывает, откуда взята
                информация. Без догадок, без устаревших данных.
              </SectionLead>
              <Box mt={{ base: "24px", md: "32px" }} mb={{ base: "32px", lg: "0" }}>
                <DemoCard
                  dark
                  query="Что происходит на рынке труда в IT прямо сейчас?"
                  resultLabel="Ответ + источники"
                  result="Краткая сводка по найму, зарплатам и вакансиям с метками [1], [2], [3] на конкретные публикации в Forbes, РБК и vc.ru."
                />
              </Box>
            </Box>

            <Box flex="1.2 1 0" width="100%">
              <PosterFrame
                src="/landing/iiset-search-sources.webp"
                alt="Веб-поиск ИИСеть: ответ нейросети с цитатами и карточками источников"
                width={1672}
                height={941}
                sizes="(max-width: 1024px) 100vw, 700px"
                borderRadius={{ base: "20px", md: "28px" }}
                shadow="deep"
              />
            </Box>
          </Flex>
        </Box>
      </Box>

      {/* ── 3. Writing — text that's already ready to send ─────────── */}
      <Box
        as="section"
        bg={C.canvas}
        py={{ base: "80px", md: "128px" }}
        px={{ base: "24px", md: "48px" }}
      >
        <Box mx="auto" maxW="1200px">
          <Flex
            direction={{ base: "column", lg: "row-reverse" }}
            align={{ base: "flex-start", lg: "center" }}
            gap={{ base: "40px", lg: "64px" }}
          >
            <Box flex="1 1 0" maxW={{ lg: "480px" }}>
              <SectionEyebrow>Тексты</SectionEyebrow>
              <SectionHeading>Текст, который уже можно отправлять.</SectionHeading>
              <SectionLead>
                Напишите письмо, резюме или пост без пустого листа. ИИСеть
                подберёт нужный тон и сразу даст готовый вариант, который
                можно скопировать и отправить.
              </SectionLead>

              <Flex
                gap="6px"
                flexWrap="wrap"
                mt="24px"
                mb={{ base: "28px", md: "0" }}
              >
                {["Письмо", "Резюме", "Пост", "Описание", "Идея"].map((t) => (
                  <Box
                    key={t}
                    px="12px"
                    py="6px"
                    borderRadius="9999px"
                    border="1px solid"
                    borderColor={C.hairlineSoft}
                    bg={C.canvasPearl}
                  >
                    <Text
                      fontFamily={FT}
                      fontSize="13px"
                      fontWeight="500"
                      color={C.ink}
                    >
                      {t}
                    </Text>
                  </Box>
                ))}
              </Flex>

              <Box mt={{ base: "20px", md: "28px" }}>
                <DemoCard
                  query="Сделай сопроводительное письмо под вакансию Senior PM"
                  resultLabel="Готовый текст"
                  result="Письмо с сильным позиционированием, конкретными цифрами и понятным CTA — ровно на 220 слов."
                />
              </Box>
            </Box>

            <Box flex="1.2 1 0" width="100%">
              <PosterFrame
                src="/landing/iiset-writing-before-after.webp"
                alt="ИИСеть переписывает черновик: до и после — сухой текст превращается в готовое сильное сообщение"
                width={1672}
                height={941}
                sizes="(max-width: 1024px) 100vw, 700px"
                borderRadius={{ base: "20px", md: "28px" }}
                shadow="soft"
              />
            </Box>
          </Flex>
        </Box>
      </Box>

      {/* ── 4. Image Generation — gallery, real images ─────────────── */}
      <Box
        as="section"
        bg={C.canvasFog}
        py={{ base: "80px", md: "128px" }}
        px={{ base: "24px", md: "48px" }}
      >
        <Box mx="auto" maxW="1200px">
          <Box maxW="720px" mb={{ base: "32px", md: "48px" }}>
            <SectionEyebrow>Картинки</SectionEyebrow>
            <SectionHeading>Картинки из одной фразы.</SectionHeading>
            <SectionLead>
              Превратите идею в изображение для презентации, поста или
              обложки. Опишите словами — получите готовый визуал.
            </SectionLead>
          </Box>

          <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={{ base: "14px", md: "20px" }}>
            {[
              {
                src: "/landing/gen-office.webp",
                alt: "Светлый минималистичный офис, мягкое утреннее освещение — пример изображения, сгенерированного ИИСеть",
                label: "Светлый офис",
                prompt: "«Минималистичный офис, мягкий утренний свет»",
              },
              {
                src: "/landing/gen-presentation.webp",
                alt: "Современная презентация с инфографикой на большом экране — визуал, созданный ИИСеть",
                label: "Презентация",
                prompt: "«Слайд с инфографикой и спокойной палитрой»",
              },
              {
                src: "/landing/gen-interior.webp",
                alt: "Дизайнерский интерьер в светлых тонах — изображение, сгенерированное по описанию",
                label: "Интерьер",
                prompt: "«Скандинавская гостиная, дерево и беж»",
              },
              {
                src: "/landing/gen-ai-sphere.webp",
                alt: "Абстрактная футуристичная сфера — концептуальная иллюстрация, созданная ИИСеть",
                label: "Концепт-арт",
                prompt: "«Футуристичная сфера, неоновый свет»",
              },
            ].map((g) => (
              <Box
                key={g.src}
                bg={C.canvas}
                borderRadius={{ base: "18px", md: "24px" }}
                overflow="hidden"
                boxShadow="0 1px 2px rgba(15,23,42,0.04), 0 18px 48px -22px rgba(15,23,42,0.16)"
                border="1px solid"
                borderColor={C.hairlineSoft}
                transition="transform 0.22s ease, box-shadow 0.22s ease"
                _hover={{
                  transform: "translateY(-3px)",
                  boxShadow:
                    "0 2px 4px rgba(15,23,42,0.06), 0 28px 56px -22px rgba(15,23,42,0.22)",
                }}
                sx={{
                  "@media (prefers-reduced-motion: reduce)": {
                    transition: "none",
                  },
                }}
              >
                <Box position="relative" lineHeight={0}>
                  <Image
                    src={g.src}
                    alt={g.alt}
                    width={1448}
                    height={1086}
                    sizes="(max-width: 640px) 100vw, (max-width: 1200px) 50vw, 580px"
                    style={{
                      width: "100%",
                      height: "auto",
                      display: "block",
                    }}
                  />
                </Box>
                <Box p={{ base: "16px", md: "20px" }}>
                  <Text
                    fontFamily={FT}
                    fontSize="11px"
                    fontWeight="700"
                    letterSpacing="0.4px"
                    textTransform="uppercase"
                    color={C.inkTertiary}
                    mb="6px"
                  >
                    {g.label}
                  </Text>
                  <Text
                    fontFamily={FT}
                    fontSize="14px"
                    color={C.ink}
                    lineHeight="1.45"
                  >
                    {g.prompt}
                  </Text>
                </Box>
              </Box>
            ))}
          </SimpleGrid>

          <Flex justify="center" mt={{ base: "32px", md: "48px" }}>
            <CtaPrimary href="/chat" large>
              Сгенерировать изображение
            </CtaPrimary>
          </Flex>
        </Box>
      </Box>

      {/* ── 5. Smart Projects ────────────────────────────────────── */}
      <Box
        as="section"
        id="projects"
        bg={C.canvasPearl}
        py={{ base: "80px", md: "128px" }}
        px={{ base: "24px", md: "48px" }}
      >
        <Box mx="auto" maxW="1200px">
          <Flex
            direction={{ base: "column", lg: "row" }}
            align={{ base: "flex-start", lg: "center" }}
            gap={{ base: "40px", lg: "64px" }}
          >
            <Box flex="1 1 0" maxW={{ lg: "480px" }}>
              <SectionEyebrow>Проекты</SectionEyebrow>
              <SectionHeading>
                Проекты, которые помнят ваши материалы.
              </SectionHeading>
              <SectionLead>
                Загрузите резюме, PDF, ссылки или заметки — ИИСеть будет
                отвечать с учётом вашего контекста, а не из общих знаний.
              </SectionLead>

              <SimpleGrid
                columns={2}
                spacing="8px"
                mt="24px"
                mb={{ base: "28px", md: "0" }}
              >
                {PROJECT_USE_CASES.map((u) => (
                  <Box
                    key={u.title}
                    p="14px 16px"
                    borderRadius="14px"
                    border="1px solid"
                    borderColor={C.hairlineSoft}
                    bg={C.canvas}
                  >
                    <Text
                      fontFamily={FT}
                      fontSize="14px"
                      fontWeight="600"
                      color={C.ink}
                      letterSpacing="-0.1px"
                    >
                      {u.title}
                    </Text>
                    <Text
                      fontFamily={FT}
                      fontSize="12px"
                      color={C.inkSecondary}
                      mt="2px"
                      lineHeight="1.4"
                    >
                      {u.hint}
                    </Text>
                  </Box>
                ))}
              </SimpleGrid>

              <Box mt={{ base: "20px", md: "28px" }}>
                <DemoCard
                  query="Что улучшить в моём резюме?"
                  resultLabel="Рекомендации по resume.pdf"
                  result="Конкретные правки по структуре, цифрам и формулировкам — со ссылками на разделы вашего файла."
                />
              </Box>

              <Box mt="24px">
                <CtaSecondary href="/chat">Создать проект</CtaSecondary>
              </Box>
            </Box>

            <Box flex="1.2 1 0" width="100%">
              <PosterFrame
                src="/landing/iiset-project-memory.webp"
                alt="Рабочая комната проекта в ИИСеть: загруженные файлы, цель, выводы и память по вашим материалам"
                width={1672}
                height={941}
                sizes="(max-width: 1024px) 100vw, 700px"
                borderRadius={{ base: "20px", md: "28px" }}
                shadow="soft"
              />
            </Box>
          </Flex>
        </Box>
      </Box>

      {/* ── 6. «Не нужно разбираться в ИИ» — text-led ───────────── */}
      <Box
        as="section"
        bg={C.canvas}
        py={{ base: "72px", md: "112px" }}
        px={{ base: "24px", md: "48px" }}
        textAlign="center"
      >
        <Box mx="auto" maxW="720px">
          <SectionEyebrow color={C.violet}>Для всех</SectionEyebrow>
          <SectionHeading>Не нужно разбираться в моделях.</SectionHeading>
          <SectionLead maxW="680px">
            Просто напишите задачу обычными словами. ИИСеть сама подберёт
            формат ответа — текст, поиск, изображение или работу с файлом.
          </SectionLead>
        </Box>
      </Box>

      {/* ── 7. Больше, чем просто чат ────────────────────────────── */}
      <Box
        as="section"
        bg={C.canvasFog}
        py={{ base: "72px", md: "112px" }}
        px={{ base: "24px", md: "48px" }}
      >
        <Box mx="auto" maxW="1100px">
          <Box maxW="640px" mb={{ base: "32px", md: "56px" }}>
            <SectionEyebrow>Отличие</SectionEyebrow>
            <SectionHeading>Больше, чем просто чат.</SectionHeading>
          </Box>

          <SimpleGrid
            columns={{ base: 1, md: 3 }}
            spacing={{ base: "20px", md: "24px" }}
          >
            {[
              {
                title: "Веб-поиск показывает источники.",
                text:
                  "Каждый ответ можно проверить — рядом с фрагментом стоит ссылка на сайт.",
              },
              {
                title: "Проекты помнят ваши файлы.",
                text:
                  "Загруженные PDF, DOCX и заметки остаются в проекте — ИИ работает с ними как с памятью.",
              },
              {
                title: "Изображения создаются в том же окне.",
                text:
                  "Не нужно открывать отдельный сервис: чат и генерация картинок живут вместе.",
              },
            ].map((d) => (
              <Box key={d.title}>
                <Text
                  fontFamily={FD}
                  fontSize={{ base: "20px", md: "22px" }}
                  fontWeight="600"
                  letterSpacing="-0.014em"
                  color={C.ink}
                  mb="8px"
                  lineHeight="1.25"
                >
                  {d.title}
                </Text>
                <Text
                  fontFamily={FT}
                  fontSize="16px"
                  color={C.inkSecondary}
                  lineHeight="1.5"
                  maxW="360px"
                >
                  {d.text}
                </Text>
              </Box>
            ))}
          </SimpleGrid>

          {/* Trust strip — honest proof points, no fake reviews/logos */}
          <Box
            mt={{ base: "40px", md: "64px" }}
            pt={{ base: "24px", md: "32px" }}
            borderTop="1px solid"
            borderColor={C.hairlineSoft}
          >
            <Flex gap={{ base: "8px", md: "12px" }} flexWrap="wrap">
              {TRUST_POINTS.map((p) => (
                <Flex
                  key={p}
                  align="center"
                  gap="6px"
                  px="12px"
                  py="6px"
                  borderRadius="9999px"
                  bg={C.canvas}
                  border="1px solid"
                  borderColor={C.hairlineSoft}
                >
                  <Box
                    w="5px"
                    h="5px"
                    borderRadius="50%"
                    bg={C.actionBlue}
                    flexShrink={0}
                  />
                  <Text
                    fontFamily={FT}
                    fontSize="13px"
                    color={C.ink}
                    fontWeight="500"
                  >
                    {p}
                  </Text>
                </Flex>
              ))}
            </Flex>
          </Box>
        </Box>
      </Box>

      {/* ── 8. Scenarios — что можно сделать за пару минут ──────── */}
      <Box
        as="section"
        id="scenarios"
        bg={C.canvas}
        py={{ base: "80px", md: "128px" }}
        px={{ base: "24px", md: "48px" }}
      >
        <Box mx="auto" maxW="1200px">
          <Box
            mb={{ base: "32px", md: "48px" }}
            textAlign={{ base: "left", md: "center" }}
            maxW={{ md: "800px" }}
            mx={{ md: "auto" }}
          >
            <SectionEyebrow>Сценарии</SectionEyebrow>
            <SectionHeading>Что можно сделать за пару минут.</SectionHeading>
            <SectionLead maxW="640px">
              Готовые форматы запросов под обычные жизненные и рабочие задачи.
            </SectionLead>
          </Box>

          <SimpleGrid
            columns={{ base: 1, sm: 2, lg: 4 }}
            spacing={{ base: "10px", md: "14px" }}
          >
            {SCENARIOS.map((s, i) => (
              <Box
                key={s.title}
                as={Link}
                href="/chat"
                p={{ base: "18px", md: "22px" }}
                borderRadius={{ base: "16px", md: "18px" }}
                bg={C.canvasPearl}
                border="1px solid"
                borderColor={C.hairlineSoft}
                textDecoration="none"
                display="block"
                minH={{ base: "auto", md: "120px" }}
                transition="transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease"
                _hover={{
                  transform: "translateY(-2px)",
                  borderColor: C.actionBlue,
                  boxShadow:
                    "0 1px 2px rgba(15,23,42,0.04), 0 18px 36px -18px rgba(0,102,204,0.18)",
                }}
                sx={{
                  "@media (prefers-reduced-motion: reduce)": {
                    transition: "none",
                  },
                }}
              >
                <Flex align="center" justify="space-between" mb="6px">
                  <Text
                    fontFamily={FT}
                    fontSize="11px"
                    fontWeight="700"
                    letterSpacing="0.4px"
                    textTransform="uppercase"
                    color={C.inkTertiary}
                    sx={{ fontVariantNumeric: "tabular-nums" }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </Text>
                  <Icon
                    as={FiArrowRight}
                    boxSize="14px"
                    color={C.inkTertiary}
                  />
                </Flex>
                <Text
                  fontFamily={FD}
                  fontSize="17px"
                  fontWeight="600"
                  color={C.ink}
                  letterSpacing="-0.014em"
                  lineHeight="1.25"
                  mb="6px"
                >
                  {s.title}
                </Text>
                <Text
                  fontFamily={FT}
                  fontSize="13px"
                  color={C.inkSecondary}
                  lineHeight="1.4"
                >
                  {s.hint}
                </Text>
              </Box>
            ))}
          </SimpleGrid>

          <Flex justify="center" mt={{ base: "32px", md: "48px" }}>
            <CtaSecondary href="/chat">Попробовать в чате</CtaSecondary>
          </Flex>
        </Box>
      </Box>

      {/* ── 9. Final CTA — poster ────────────────────────────────── */}
      <Box
        as="section"
        id="start"
        bg={C.canvasPearl}
        py={{ base: "80px", md: "128px" }}
        px={{ base: "24px", md: "48px" }}
      >
        <Box mx="auto" maxW="1200px">
          <Flex
            direction={{ base: "column", md: "row" }}
            align="center"
            gap={{ base: "32px", md: "64px" }}
          >
            <Box flex="1 1 0" width="100%">
              <PosterFrame
                src="/landing/iiset-final-cta.webp"
                alt="Финальный визуал ИИСеть: открытый чат с готовым ответом и спокойной премиальной композицией"
                width={1672}
                height={941}
                sizes="(max-width: 768px) 100vw, 640px"
                borderRadius={{ base: "20px", md: "28px" }}
                shadow="soft"
              />
            </Box>

            <Box flex="1 1 0" maxW={{ md: "440px" }} textAlign={{ base: "center", md: "left" }}>
              <SectionEyebrow>Старт</SectionEyebrow>
              <SectionHeading size="xl">Начните с одной задачи.</SectionHeading>
              <SectionLead>
                Откройте ИИСеть и попросите сделать то, что давно
                откладывали. Регистрация бесплатна.
              </SectionLead>
              <HStack
                spacing="8px"
                mt={{ base: "28px", md: "36px" }}
                justify={{ base: "center", md: "flex-start" }}
                flexWrap="wrap"
              >
                <CtaPrimary href="/chat" large>
                  Открыть чат
                </CtaPrimary>
                <CtaGhost href="/others/sign-in" large>
                  Зарегистрироваться
                </CtaGhost>
              </HStack>
            </Box>
          </Flex>
        </Box>
      </Box>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <Box
        as="footer"
        bg={C.canvasFog}
        py={{ base: "44px", md: "56px" }}
        px={{ base: "24px", md: "48px" }}
      >
        <Box mx="auto" maxW="1200px">
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
                maxW="320px"
              >
                ИИ-чат на русском с веб-поиском, источниками, генерацией
                изображений и работой с PDF/DOCX.
              </Text>
            </VStack>

            <Flex
              direction={{ base: "column", sm: "row" }}
              gap={{ base: "24px", md: "48px" }}
            >
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
