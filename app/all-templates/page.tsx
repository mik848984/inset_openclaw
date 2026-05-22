'use client';

// Chakra imports
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  SimpleGrid,
  Stack,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import NavLink from '@/components/link/NavLink';
import TemplateCard from '@/components/card/TemplateCard';
import { AvitoLogo, HHLogo } from '@/components/icons/Icons';
import React from 'react';
import { useUser } from '@/utils/hooks/useUser';

// ── Apple typography ──────────────────────────────────────────────
const FONT_APPLE_TEXT = `'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif`;
const FONT_APPLE_DISPLAY = `'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif`;

// ── Template catalog (links preserved 1:1 from the original page) ─
type TemplateItem = {
  link: string;
  illustration: string;
  name: string;
  description: string;
};

type TemplateSection = {
  title: string;
  subtitle?: string;
  items: TemplateItem[];
};

const sections: TemplateSection[] = [
  {
    title: 'Тексты и документы',
    subtitle: 'Переписать, упростить, перевести или сформулировать заново.',
    items: [
      {
        link: '/translator',
        illustration: '🈳',
        name: 'Переводчик',
        description: 'Переводите любой текст на нужный язык с сохранением смысла и стиля.',
      },
      {
        link: '/article',
        illustration: '📄',
        name: 'Генератор статей',
        description: 'Создайте кликабельный и SEO-оптимизированный текст статьи по теме.',
      },
      {
        link: '/simplifier',
        illustration: '👶',
        name: 'Упрощение контента',
        description: 'Перепишите сложный текст простым языком для широкой аудитории.',
      },
      {
        link: '/email-enhancer',
        illustration: '📧',
        name: 'Улучшение писем',
        description: 'Сделайте письмо короче, понятнее и убедительнее без потери смысла.',
      },
    ],
  },
  {
    title: 'Маркетинг и контент',
    subtitle: 'Продажи, соцсети, лендинги и FAQ.',
    items: [
      {
        link: '/product-description',
        illustration: '🎯',
        name: 'Описание продукта',
        description: 'Убедительные и конверсионные описания для карточек товаров.',
      },
      {
        link: '/caption',
        illustration: '🌄',
        name: 'Подпись для Instagram',
        description: 'Цепляющая подпись для поста в Instagram под нужный тон.',
      },
      {
        link: '/faq',
        illustration: '❓',
        name: 'Контент FAQ',
        description: 'Готовый блок вопрос–ответ для продукта, лендинга или приложения.',
      },
      {
        link: '/seo-keywords',
        illustration: '📈',
        name: 'SEO ключевые слова',
        description: 'Подберите ключевые запросы из темы, названия и описания.',
      },
    ],
  },
  {
    title: 'Идеи и названия',
    subtitle: 'Когда нужен brainstorm и нейминг.',
    items: [
      {
        link: '/name-generator',
        illustration: '🏷️',
        name: 'Названия продуктов',
        description: 'Сгенерируйте варианты названия из ключевых слов и отрасли.',
      },
      {
        link: '/business-generator',
        illustration: '💡',
        name: 'Бизнес-идеи',
        description: 'Идеи бизнеса по теме, предпочтениям или бюджету.',
      },
      {
        link: '/domain-name-generator',
        illustration: '🔗',
        name: 'Доменные имена',
        description: 'Подберите свободные и звучные домены для вашего проекта.',
      },
    ],
  },
  {
    title: 'Проверка',
    items: [
      {
        link: '/plagiarism-checker',
        illustration: '©️',
        name: 'Проверка на плагиат',
        description: 'Проверка предложений и текстов на совпадения и заимствования.',
      },
    ],
  },
];

export default function Settings() {
  const { user } = useUser(false);

  // ── Apple design tokens ─────────────────────────────────────────
  // NOTE: page background is OWNED by AppLayout. This component must stay
  // visually transparent so it doesn't create a foreign solid rectangle
  // inside the surrounding layout.
  const textPrimary = useColorModeValue('#1d1d1f', '#f5f5f7');
  const textSecondary = useColorModeValue(
    '#6e6e73',
    'rgba(245,245,247,0.66)',
  );
  const accentBlue = useColorModeValue('#0066cc', '#2997ff');
  const accentBlueHover = useColorModeValue('#0071e3', '#5ac8ff');
  const eyebrowBg = useColorModeValue(
    'rgba(0,102,204,0.08)',
    'rgba(41,151,255,0.14)',
  );
  const ghostBg = useColorModeValue(
    'rgba(255,255,255,0.62)',
    'rgba(255,255,255,0.06)',
  );
  const ghostBorder = useColorModeValue(
    'rgba(0,0,0,0.08)',
    'rgba(255,255,255,0.10)',
  );
  const sectionLabelBg = useColorModeValue(
    'rgba(0,102,204,0.06)',
    'rgba(41,151,255,0.12)',
  );

  return (
    <Box
      bg="transparent"
      width="100%"
      maxWidth="100%"
      minWidth={0}
      overflowX="hidden"
      mt={{ base: '70px', md: '0px', xl: '0px' }}
    >
      <Container
        maxW="7xl"
        py={{ base: 6, md: 12 }}
        px={{ base: '16px', md: '24px', xl: '32px' }}
        fontFamily={FONT_APPLE_TEXT}
        width="100%"
        maxWidth={{ base: '100%', md: '7xl' }}
        minWidth={0}
      >
        {/* ── HR admin section ──────────────────────────────────── */}
        {user?.isAdmin && (
          <Box mb={{ base: '40px', md: '56px' }}>
            <Flex
              align="center"
              gap="10px"
              mb={{ base: '14px', md: '18px' }}
              flexWrap="wrap"
            >
              <Box
                px="10px"
                py="4px"
                bg={sectionLabelBg}
                borderRadius="9999px"
                display="inline-flex"
                alignItems="center"
                gap="6px"
              >
                <Box w="5px" h="5px" borderRadius="50%" bg={accentBlue} />
                <Text
                  fontSize="11px"
                  fontWeight="600"
                  letterSpacing="0.5px"
                  textTransform="uppercase"
                  color={accentBlue}
                >
                  Admin
                </Text>
              </Box>
              <Heading
                as="h2"
                fontFamily={FONT_APPLE_DISPLAY}
                fontSize={{ base: '22px', md: '28px' }}
                fontWeight="600"
                letterSpacing="-0.4px"
                lineHeight="1.2"
                color={textPrimary}
              >
                HR-агенты
              </Heading>
            </Flex>
            <SimpleGrid
              columns={{ base: 1, md: 2, lg: 3, xl: 4 }}
              spacing={{ base: '14px', md: '20px' }}
              width="100%"
              minWidth={0}
            >
              <TemplateCard
                link="/hr-agent"
                illustration={
                  <Flex gap="6px" align="center" justify="center">
                    <HHLogo w="32px" h="32px" />
                    <AvitoLogo w="38px" h="38px" />
                  </Flex>
                }
                name="HR-агенты"
                description="Автоматический поиск кандидатов по устным критериям на Avito и HH.ru."
              />
            </SimpleGrid>
          </Box>
        )}

        {/* ── Hero ─────────────────────────────────────────────── */}
        <Stack
          spacing={{ base: '14px', md: '20px' }}
          mb={{ base: '32px', md: '48px' }}
          align="flex-start"
          maxW="900px"
        >
          <Box
            display="inline-flex"
            alignItems="center"
            gap="6px"
            px="10px"
            py="4px"
            bg={eyebrowBg}
            borderRadius="9999px"
          >
            <Box w="5px" h="5px" borderRadius="50%" bg={accentBlue} />
            <Text
              fontFamily={FONT_APPLE_TEXT}
              fontSize="11px"
              fontWeight="600"
              letterSpacing="0.5px"
              textTransform="uppercase"
              color={accentBlue}
            >
              AI-шаблоны ИИСеть
            </Text>
          </Box>

          <Heading
            as="h1"
            fontFamily={FONT_APPLE_DISPLAY}
            fontSize={{ base: '38px', sm: '46px', md: '58px', lg: '64px' }}
            fontWeight="600"
            lineHeight="1.05"
            letterSpacing={{ base: '-0.7px', md: '-1.1px' }}
            color={textPrimary}
            maxWidth="100%"
            wordBreak="break-word"
          >
            Готовые сценарии для работы с ИИ
          </Heading>

          <Text
            fontFamily={FONT_APPLE_TEXT}
            fontSize={{ base: '16px', md: '20px' }}
            lineHeight="1.5"
            fontWeight="400"
            letterSpacing="-0.15px"
            color={textSecondary}
            maxW="780px"
          >
            Выберите шаблон, заполните несколько полей — и ИИСеть подготовит
            текст, идею, письмо, статью или SEO-структуру.
          </Text>

          {/* CTA cluster */}
          <Flex
            gap="10px"
            direction={{ base: 'column', sm: 'row' }}
            w={{ base: '100%', sm: 'auto' }}
            mt="6px"
          >
            <NavLink href="/chat" styles={{ width: 'fit-content' }}>
              <Button
                bg={accentBlue}
                color="white"
                borderRadius="9999px"
                h={{ base: '46px', md: '48px' }}
                px="24px"
                fontFamily={FONT_APPLE_TEXT}
                fontSize="15px"
                fontWeight="500"
                letterSpacing="-0.2px"
                _hover={{ bg: accentBlueHover }}
                _active={{ transform: 'scale(0.97)' }}
                transition="background 0.16s ease, transform 0.12s ease"
                boxShadow="0 1px 2px rgba(0,0,0,0.06)"
                w={{ base: '100%', sm: 'auto' }}
              >
                Открыть чат
              </Button>
            </NavLink>
            <NavLink href="/life-agents" styles={{ width: 'fit-content' }}>
              <Button
                variant="ghost"
                bg={ghostBg}
                border="1px solid"
                borderColor={ghostBorder}
                backdropFilter="blur(18px) saturate(180%)"
                sx={{ WebkitBackdropFilter: 'blur(18px) saturate(180%)' }}
                color={textPrimary}
                borderRadius="9999px"
                h={{ base: '46px', md: '48px' }}
                px="22px"
                fontFamily={FONT_APPLE_TEXT}
                fontSize="15px"
                fontWeight="500"
                letterSpacing="-0.2px"
                _hover={{ borderColor: accentBlue, color: accentBlue }}
                _active={{ transform: 'scale(0.97)' }}
                transition="border-color 0.16s ease, color 0.16s ease, transform 0.12s ease"
                w={{ base: '100%', sm: 'auto' }}
              >
                Агенты жизни →
              </Button>
            </NavLink>
          </Flex>
        </Stack>

        {/* ── Catalog sections ─────────────────────────────────── */}
        {sections.map((section) => (
          <Box key={section.title} mb={{ base: '32px', md: '48px' }}>
            <Flex
              align={{ base: 'flex-start', sm: 'baseline' }}
              gap="12px"
              direction={{ base: 'column', sm: 'row' }}
              mb={{ base: '14px', md: '20px' }}
            >
              <Heading
                as="h2"
                fontFamily={FONT_APPLE_DISPLAY}
                fontSize={{ base: '22px', md: '30px' }}
                fontWeight="600"
                lineHeight="1.2"
                letterSpacing="-0.4px"
                color={textPrimary}
                wordBreak="break-word"
              >
                {section.title}
              </Heading>
              {section.subtitle && (
                <Text
                  fontFamily={FONT_APPLE_TEXT}
                  fontSize={{ base: '13px', md: '14px' }}
                  color={textSecondary}
                  letterSpacing="-0.1px"
                  maxW="520px"
                >
                  {section.subtitle}
                </Text>
              )}
            </Flex>
            <SimpleGrid
              columns={{ base: 1, md: 2, lg: 3, xl: 4 }}
              spacing={{ base: '14px', md: '20px' }}
              width="100%"
              minWidth={0}
            >
              {section.items.map((item) => (
                <TemplateCard
                  key={item.link}
                  link={item.link}
                  illustration={item.illustration}
                  name={item.name}
                  description={item.description}
                />
              ))}
            </SimpleGrid>
          </Box>
        ))}
      </Container>
    </Box>
  );
}
