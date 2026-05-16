"use client";
import React from "react";
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Icon,
  Image,
  SimpleGrid,
  Stack,
  Text,
  VStack,
  HStack,
  Badge,
  useColorModeValue,
} from "@chakra-ui/react";
import { FiArrowRight, FiZap, FiGlobe, FiImage, FiMessageSquare } from "react-icons/fi";
import Link from "next/link";

const stats = [
  { label: "Модели ИИ", value: "Несколько", sub: "для разных задач" },
  { label: "Готовые агенты", value: "10+", sub: "перевод, упрощение, письма" },
  { label: "Типы контента", value: "Текст + картинки", sub: "и ещё больше скоро" },
];

const benefits = [
  {
    icon: FiZap,
    title: "Мощные модели в одном чате",
    description:
      "Выбирайте подходящую модель под задачу: от творческой генерации до строгого делового тона.",
  },
  {
    icon: FiGlobe,
    title: "Доступ к интернету",
    description:
      "Актуальные ответы: поиск по сети, сводки, ссылки на источники — прямо в рамках диалога.",
  },
  {
    icon: FiImage,
    title: "Генерация изображений",
    description:
      "Создавайте иллюстрации, концепты и аватары по описанию. Идеально для презентаций и идей.",
  },
  {
    icon: FiMessageSquare,
    title: "Агенты‑помощники",
    description:
      "Переводчик, упрощатель писем, редактор резюме и другие — не нужно писать сложные промпты.",
  },
];

const steps = [
  { step: "1", title: "Зайдите в чат", text: "Откройте ИИСеть в браузере и войдите в свой аккаунт." },
  { step: "2", title: "Выберите задачу", text: "Напишите запрос или выберите агента: перевод, письмо, картинка и т.д." },
  { step: "3", title: "Получите результат", text: "Отредактируйте, сохраните, скачайте — и используйте в работе или жизни." },
];
const useCases = {
  work: [
    "Письма клиентам и коллегам без канцелярита.",
    "Резюме, сопроводительные письма и ответы на вакансии.",
    "Краткие пересказы документов и упрощение сложных текстов.",
  ],
  personal: [
    "Идеи подарков, поздравлений и сообщений близким.",
    "Планы поездок, списки дел и личные напоминания.",
    "Советы по обучению, саморазвитию и спорту.",
  ],
  creative: [
    "Тексты для постов в соцсетях и сторис.",
    "Сценарии роликов и подкастов.",
    "Идеи для названий проектов, брендов и доменов.",
  ],
};

const pricingPlans = [
  {
    name: "Premium",
    price: "249 ₽/мес",
    highlight: true,
    description: "Максимум возможностей для постоянного использования.",
    details: "2400 страниц текста · 150 изображений",
  },
  {
    name: "Light Art",
    price: "69 ₽",
    highlight: false,
    description: "Чтобы попробовать генерацию картинок без переплат.",
    details: "50 изображений",
  },
  {
    name: "Basic Art",
    price: "99 ₽",
    highlight: false,
    description: "Для тех, кто часто генерирует визуал.",
    details: "100 изображений",
  },
  {
    name: "Basic Text",
    price: "99 ₽",
    highlight: false,
    description: "Подойдёт для периодических текстовых задач.",
    details: "800 страниц текста",
  },
  {
    name: "Pro Text",
    price: "149 ₽",
    highlight: false,
    description: "Если вы часто работаете с текстами.",
    details: "1600 страниц текста",
  },
  {
    name: "Ultra Text",
    price: "199 ₽",
    highlight: false,
    description: "Для активных пользователей и больших объёмов.",
    details: "1600 страниц текста",
  },
];


export default function HomePage() {
  const bg = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const accent = useColorModeValue("purple.500", "purple.300");
  const subtext = useColorModeValue("gray.600", "gray.300");

  return (
    <Box minH="100vh" bg={bg}>
      <Container maxW="6xl" pt={{ base: 10, md: 16 }} pb={{ base: 16, md: 24 }}>
        {/* Hero */}
        <Flex
          direction={{ base: "column", md: "row" }}
          align={{ base: "flex-start", md: "center" }}
          gap={{ base: 10, md: 16 }}
        >
          <Box flex="1">
            <HStack spacing={3} mb={6}>
              <Image src="/brand.png" alt="ИИСеть" boxSize="48px" borderRadius="xl" />
              <Box>
                <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.12em" color={subtext}>
                  AI‑чат для работы и жизни
                </Text>
                <Text fontSize="sm" color={subtext}>
                  Большие BB‑модели, чат, картинки и интернет‑поиск в одном месте
                </Text>
              </Box>
            </HStack>

            <Heading
              as="h1"
              size="2xl"
              lineHeight="1.1"
              mb={4}
            >
              IISet Chat — ваш{" "}
              <Box as="span" color={accent}>
                умный AI‑чат
              </Box>{" "}
              для работы и личных задач
            </Heading>

            <Text fontSize="lg" color={subtext} mb={8}>
              Пишите по‑человечески — ИИСеть поймёт. Создавайте тексты и изображения, переводите письма,
              упрощайте сложные документы и ищите информацию в интернете. Подходит и для рабочих, и для личных задач.
            </Text>

            <HStack spacing={4} mb={10} flexWrap="wrap">
              <Button
                as={Link}
                href="/chat"
                colorScheme="purple"
                size="lg"
                rightIcon={<Icon as={FiArrowRight} />}
              >
                Открыть чат
              </Button>
              <Button as={Link} href="#features" variant="ghost" size="lg">
                Посмотреть возможности
              </Button>
            </HStack>

            <HStack spacing={6} flexWrap="wrap">
              {stats.map((item) => (
                <Box key={item.label}>
                  <Text fontSize="xl" fontWeight="bold">
                    {item.value}
                  </Text>
                  <Text fontSize="sm" color={subtext}>
                    {item.label}
                    {item.sub ? ` — ${item.sub}` : ""}
                  </Text>
                </Box>
              ))}
            </HStack>
          </Box>

          <Box flex="1">
            <Box
              bg={cardBg}
              borderRadius="3xl"
              boxShadow="xl"
              p={6}
              borderWidth="1px"
              borderColor={useColorModeValue("gray.200", "whiteAlpha.300")}
            >
              <Text fontSize="sm" fontWeight="medium" mb={3} color={subtext}>
                Пример диалога
              </Text>
              <VStack
                align="stretch"
                spacing={3}
                fontSize="sm"
              >
                <Box alignSelf="flex-start" bg={useColorModeValue("gray.100", "whiteAlpha.100")} p={3} borderRadius="lg">
                  <Text>Придумай письмо клиенту с извинениями за задержку и предложением бонуса.</Text>
                </Box>
                <Box alignSelf="flex-end" bg={useColorModeValue("purple.500", "purple.400")} p={3} borderRadius="lg">
                  <Text color="white">
                    Конечно! Вот вежливый и лаконичный вариант письма, который сохранит доверие клиента…
                  </Text>
                </Box>
                <Box alignSelf="flex-start" bg={useColorModeValue("gray.100", "whiteAlpha.100")} p={3} borderRadius="lg">
                  <Text>А теперь сделай попроще и добавь эмодзи.</Text>
                </Box>
                <Box alignSelf="flex-end" bg={useColorModeValue("purple.500", "purple.400")} p={3} borderRadius="lg">
                  <Text color="white">
                    Готово! Я переписал письмо более простым языком и добавил лёгкие emoji, чтобы звучало дружелюбнее.
                  </Text>
                </Box>
              </VStack>
            </Box>
          </Box>
        </Flex>

        {/* Features */}
        <Box id="features" mt={{ base: 16, md: 24 }}>
          <Heading as="h2" size="lg" mb={4}>
            Что умеет ИИСеть
          </Heading>
          <Text color={subtext} mb={8} maxW="2xl">
            ИИСеть собирает в одном месте несколько моделей ИИ, интернет‑поиск и набор готовых агентов. Вам не нужно
            выбирать сервисы — все инструменты уже под рукой.
          </Text>

          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
            {benefits.map((b) => (
              <HStack
                key={b.title}
                align="flex-start"
                bg={cardBg}
                borderRadius="2xl"
                p={5}
                borderWidth="1px"
                borderColor={useColorModeValue("gray.200", "whiteAlpha.300")}
                spacing={4}
              >
                <Box
                  boxSize={10}
                  borderRadius="full"
                  bg={useColorModeValue("purple.50", "whiteAlpha.100")}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Icon as={b.icon} color={accent} />
                </Box>
                <Box>
                  <Text fontWeight="semibold" mb={1}>
                    {b.title}
                  </Text>
                  <Text color={subtext}>{b.description}</Text>
                </Box>
              </HStack>
            ))}
          </SimpleGrid>
        </Box>

                {/* What is LLM */}
        <Box mt={{ base: 16, md: 24 }}>
          <Heading as="h2" size="lg" mb={4}>
            Что такое LLM и BB-языки
          </Heading>
          <Text color={subtext} mb={6} maxW="2xl">
            LLM (Large Language Model) — это большая языковая модель, которая понимает человеческий язык и умеет
            генерировать тексты. Мы используем улучшенные Big Brain‑модели (BB-языки), которые помогают вам решать
            как рабочие, так и личные задачи в формате обычного чата.
          </Text>

          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
            <Box bg={cardBg} borderRadius="2xl" p={6} borderWidth="1px" borderColor={useColorModeValue("gray.200", "whiteAlpha.300")}>
              <Heading as="h3" size="md" mb={2}>
                Понимает контекст
              </Heading>
              <Text color={subtext}>
                Модель запоминает ход диалога, возвращается к предыдущим сообщениям и подстраивается под ваш стиль.
              </Text>
            </Box>
            <Box bg={cardBg} borderRadius="2xl" p={6} borderWidth="1px" borderColor={useColorModeValue("gray.200", "whiteAlpha.300")}>
              <Heading as="h3" size="md" mb={2}>
                Помогает в задачах
              </Heading>
              <Text color={subtext}>
                Письма, резюме, посты, идеи, инструкции, переводы, FAQ — всё это можно сделать одной фразой.
              </Text>
            </Box>
            <Box bg={cardBg} borderRadius="2xl" p={6} borderWidth="1px" borderColor={useColorModeValue("gray.200", "whiteAlpha.300")}>
              <Heading as="h3" size="md" mb={2}>
                Не только текст
              </Heading>
              <Text color={subtext}>
                Генерация изображений, работа с шаблонами и подключение интернета — всё доступно прямо из чата.
              </Text>
            </Box>
          </SimpleGrid>
        </Box>

        {/* Use cases */}
        <Box mt={{ base: 16, md: 24 }}>
          <Heading as="h2" size="lg" mb={4}>
            Примеры, как можно использовать ИИСеть
          </Heading>
          <Text color={subtext} mb={8} maxW="2xl">
            Пара идей для старта — дальше вы сами найдёте свои сценарии.
          </Text>

          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
            <Box bg={cardBg} borderRadius="2xl" p={6} borderWidth="1px" borderColor={useColorModeValue("gray.200", "whiteAlpha.300")}>
              <Heading as="h3" size="md" mb={2}>
                Для работы
              </Heading>
              <VStack align="flex-start" spacing={2}>
                {useCases.work.map((item) => (
                  <Text key={item} color={subtext}>
                    • {item}
                  </Text>
                ))}
              </VStack>
            </Box>
            <Box bg={cardBg} borderRadius="2xl" p={6} borderWidth="1px" borderColor={useColorModeValue("gray.200", "whiteAlpha.300")}>
              <Heading as="h3" size="md" mb={2}>
                Для личной жизни
              </Heading>
              <VStack align="flex-start" spacing={2}>
                {useCases.personal.map((item) => (
                  <Text key={item} color={subtext}>
                    • {item}
                  </Text>
                ))}
              </VStack>
            </Box>
            <Box bg={cardBg} borderRadius="2xl" p={6} borderWidth="1px" borderColor={useColorModeValue("gray.200", "whiteAlpha.300")}>
              <Heading as="h3" size="md" mb={2}>
                Для творчества
              </Heading>
              <VStack align="flex-start" spacing={2}>
                {useCases.creative.map((item) => (
                  <Text key={item} color={subtext}>
                    • {item}
                  </Text>
                ))}
              </VStack>
            </Box>
          </SimpleGrid>
        </Box>

        {/* Templates section */}
        <Box mt={{ base: 16, md: 24 }}>
          <Heading as="h2" size="lg" mb={4}>
            AI-шаблоны для быстрого старта
          </Heading>
          <Text color={subtext} mb={6} maxW="2xl">
            Внутри IISet Chat уже есть десятки готовых шаблонов: от переводчика и генератора статей до описаний
            товаров, SEO-ключей и бизнес-идей. Просто выберите шаблон и дополните его своими данными.
          </Text>
          <Box
            mt={8}
            borderRadius="2xl"
            overflow="hidden"
            borderWidth="1px"
            borderColor={useColorModeValue("gray.200", "whiteAlpha.300")}
            boxShadow="lg"
          >
            <Image
              src="/ai-templates.png"
              alt="Примеры AI-шаблонов в ИИСеть"
              width="100%"
              height="auto"
            />
          </Box>
        </Box>

        {/* Pricing */}
        <Box mt={{ base: 16, md: 24 }}>
          <Heading as="h2" size="lg" mb={4}>
            Тарифы IISet Chat
          </Heading>
          <Text color={subtext} mb={8} maxW="2xl">
            Регистрация бесплатна. Дальше вы можете выбрать удобный пакет генераций — только текст, только картинки
            или всё вместе. Каждая страница — это примерно 500–700 символов текста.
          </Text>

          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {pricingPlans.map((plan) => (
              <Box
                key={plan.name}
                bg={cardBg}
                borderRadius="2xl"
                p={6}
                borderWidth="2px"
                borderColor={plan.highlight ? accent : useColorModeValue("gray.200", "whiteAlpha.300")}
              >
                {plan.highlight && (
                  <Badge colorScheme="purple" mb={3}>
                    Популярный выбор
                  </Badge>
                )}
                <Heading as="h3" size="md" mb={2}>
                  {plan.name}
                </Heading>
                <Text fontSize="2xl" fontWeight="bold" mb={2}>
                  {plan.price}
                </Text>
                <Text color={subtext} mb={3}>
                  {plan.description}
                </Text>
                <Text fontSize="sm" color={subtext}>
                  {plan.details}
                </Text>
              </Box>
            ))}
          </SimpleGrid>
        </Box>

{/* How it works */}
        <Box mt={{ base: 16, md: 24 }}>
          <Heading as="h2" size="lg" mb={4}>
            Как это работает
          </Heading>
          <Text color={subtext} mb={8} maxW="2xl">
            Никаких сложных настроек. Откройте чат, опишите задачу человеческим языком — и ИИСеть поможет подобрать
            нужного агента или модель.
          </Text>

          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
            {steps.map((s) => (
              <Box
                key={s.step}
                bg={cardBg}
                borderRadius="2xl"
                p={6}
                borderWidth="1px"
                borderColor={useColorModeValue("gray.200", "whiteAlpha.300")}
              >
                <Badge
                  borderRadius="full"
                  px={3}
                  py={1}
                  mb={3}
                  colorScheme="purple"
                  variant="subtle"
                >
                  Шаг {s.step}
                </Badge>
                <Heading as="h3" size="md" mb={2}>
                  {s.title}
                </Heading>
                <Text color={subtext}>{s.text}</Text>
              </Box>
            ))}
          </SimpleGrid>
        </Box>

        {/* CTA */}
        <Box mt={{ base: 16, md: 24 }} textAlign="center">
          <Heading as="h2" size="lg" mb={4}>
            Попробуйте ИИСеть уже сегодня
          </Heading>
          <Text color={subtext} mb={8} maxW="xl" mx="auto">
            Тот же привычный формат чата, но с возможностью выбирать модели, подключать интернет и использовать
            десятки агентов. Всё в одном окне — в браузере.
          </Text>
          <Button
            as={Link}
            href="/chat"
            colorScheme="purple"
            size="lg"
            rightIcon={<Icon as={FiArrowRight} />}
          >
            Открыть чат
          </Button>
        </Box>

        {/* Footer */}
        <Box mt={{ base: 16, md: 24 }} pt={8} borderTopWidth="1px" borderColor={useColorModeValue("gray.200", "whiteAlpha.300")}>
          <Flex
            direction={{ base: "column", md: "row" }}
            align={{ base: "flex-start", md: "center" }}
            justify="space-between"
            gap={4}
          >
            <HStack spacing={3}>
              <Image src="/brand.png" alt="ИИСеть" boxSize="32px" borderRadius="xl" />
              <Text fontWeight="medium">ИИСеть</Text>
            </HStack>
            <Text fontSize="sm" color={subtext}>
              © {new Date().getFullYear()} ИИСеть. Все права защищены.
            </Text>
          </Flex>
        </Box>
      </Container>
    </Box>
  );
}
