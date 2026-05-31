'use client';

import {
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  SimpleGrid,
  Stack,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import NavLink from '@/components/link/NavLink';
import { useUser } from '@/utils/hooks/useUser';
import React from 'react';

// ── Apple typography ──────────────────────────────────────────────
const FONT_APPLE_TEXT = `'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif`;
const FONT_APPLE_DISPLAY = `'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif`;

// ── Agents data (hrefs preserved 1:1) ─────────────────────────────
type Agent = {
  emoji: string;
  title: string;
  href: string;
  description: string;
  label: string;
};

const agents: Agent[] = [
  {
    emoji: '🎬',
    title: 'Netflix-Сценарист',
    href: '/life-agents/netflix-writer',
    description:
      'Серия сериала о твоей жизни: название, логлайн и короткий синопсис.',
    label: 'История о себе',
  },
  {
    emoji: '🧠',
    title: 'Психоаналитик',
    href: '/life-agents/psychoanalyst',
    description:
      'Мягкая рефлексия и наблюдения по тексту, который ты сам про себя пишешь.',
    label: 'Разбор',
  },
  {
    emoji: '🔮',
    title: 'Оракул',
    href: '/life-agents/oracle',
    description:
      'Вдохновляющее видение тебя через 5–20 лет — без мистики и предсказаний.',
    label: 'Взгляд в будущее',
  },
  {
    emoji: '✏️',
    title: 'Редактор жизни',
    href: '/life-agents/life-editor',
    description:
      'Переписывает твой текст о себе так, чтобы он звучал яснее и увереннее.',
    label: 'Текст о себе',
  },
  {
    emoji: '🎭',
    title: 'Альтер-эго',
    href: '/life-agents/alter-ego',
    description:
      'Альтернативная версия тебя из другой реальности — для свежего взгляда.',
    label: 'Параллельный ты',
  },
  {
    emoji: '💌',
    title: 'Письмо из детства',
    href: '/life-agents/letter-from-child',
    description:
      'Тёплое письмо от твоего 8–12-летнего «я» — взрослому себе сегодня.',
    label: 'Письмо',
  },
  {
    emoji: '📘',
    title: 'Эпилогист',
    href: '/life-agents/epilogist',
    description:
      'Спокойный эпилог текущей главы твоей жизни и подготовка к следующей.',
    label: 'Подведение итогов',
  },
];

// ──────────────────────────────────────────────────────────────────
// Local AgentGlassCard — premium Apple Liquid Glass tile.
// Локальный для /life-agents, не задевает /all-templates TemplateCard.
// ──────────────────────────────────────────────────────────────────
function AgentGlassCard({ emoji, title, description, href, label }: Agent) {
  const cardBg = useColorModeValue(
    'rgba(255,255,255,0.70)',
    'rgba(13,18,34,0.62)',
  );
  const cardBgHover = useColorModeValue(
    'rgba(255,255,255,0.86)',
    'rgba(13,18,34,0.78)',
  );
  const borderGlass = useColorModeValue(
    'rgba(0,0,0,0.06)',
    'rgba(255,255,255,0.10)',
  );
  const borderHover = useColorModeValue(
    'rgba(0,102,204,0.28)',
    'rgba(41,151,255,0.34)',
  );
  const cardShadow = useColorModeValue(
    'inset 0 1px 0 rgba(255,255,255,0.65), 0 1px 2px rgba(0,0,0,0.03), 0 18px 50px rgba(15,23,42,0.06)',
    'inset 0 1px 0 rgba(255,255,255,0.10), 0 1px 2px rgba(0,0,0,0.14), 0 18px 50px rgba(0,0,0,0.24)',
  );
  const cardShadowHover = useColorModeValue(
    'inset 0 1px 0 rgba(255,255,255,0.65), 0 6px 16px rgba(0,0,0,0.06), 0 28px 60px rgba(15,23,42,0.10)',
    'inset 0 1px 0 rgba(255,255,255,0.10), 0 6px 16px rgba(0,0,0,0.20), 0 28px 60px rgba(0,0,0,0.34)',
  );
  const iconWellBg = useColorModeValue(
    'rgba(0,102,204,0.07)',
    'rgba(41,151,255,0.14)',
  );
  const iconWellBorder = useColorModeValue(
    'rgba(255,255,255,0.62)',
    'rgba(255,255,255,0.10)',
  );
  const titleColor = useColorModeValue('#1d1d1f', '#f5f5f7');
  const descColor = useColorModeValue('#3c3c43', 'rgba(245,245,247,0.74)');
  const labelColor = useColorModeValue('#6e6e73', 'rgba(245,245,247,0.62)');
  const accentBlue = useColorModeValue('#0066cc', '#2997ff');

  return (
    <NavLink href={href} styles={{ display: 'block', height: '100%' }}>
      <Box
        h="100%"
        minH={{ base: '220px', md: '240px' }}
        bg={cardBg}
        backdropFilter="blur(20px) saturate(180%)"
        border="1px solid"
        borderColor={borderGlass}
        boxShadow={cardShadow}
        borderRadius={{ base: '24px', md: '28px' }}
        p={{ base: '20px', md: '22px' }}
        display="flex"
        flexDirection="column"
        cursor="pointer"
        transition="background 0.2s ease, border-color 0.2s ease, transform 0.2s ease, box-shadow 0.22s ease"
        fontFamily={FONT_APPLE_TEXT}
        width="100%"
        maxWidth="100%"
        minWidth={0}
        sx={{ WebkitBackdropFilter: 'blur(20px) saturate(180%)' }}
        _hover={{
          bg: cardBgHover,
          borderColor: borderHover,
          transform: 'translateY(-3px)',
          boxShadow: cardShadowHover,
        }}
        _active={{ transform: 'translateY(-1px)' }}
      >
        {/* Top row: icon well + uppercase label */}
        <Flex align="center" gap="12px" mb={{ base: '14px', md: '18px' }}>
          <Flex
            align="center"
            justify="center"
            w={{ base: '56px', md: '60px' }}
            h={{ base: '56px', md: '60px' }}
            minW={{ base: '56px', md: '60px' }}
            borderRadius={{ base: '16px', md: '18px' }}
            bg={iconWellBg}
            border="1px solid"
            borderColor={iconWellBorder}
            backdropFilter="blur(14px) saturate(160%)"
            sx={{ WebkitBackdropFilter: 'blur(14px) saturate(160%)' }}
            flexShrink={0}
          >
            <Text fontSize={{ base: '28px', md: '32px' }} lineHeight="1" userSelect="none">
              {emoji}
            </Text>
          </Flex>
          <Text
            fontFamily={FONT_APPLE_TEXT}
            fontSize="11px"
            fontWeight="600"
            letterSpacing="0.5px"
            textTransform="uppercase"
            color={labelColor}
            noOfLines={1}
          >
            {label}
          </Text>
        </Flex>

        {/* Title */}
        <Heading
          as="h3"
          fontFamily={FONT_APPLE_DISPLAY}
          fontSize={{ base: '19px', md: '21px' }}
          fontWeight="600"
          lineHeight="1.25"
          letterSpacing="-0.2px"
          color={titleColor}
          mb="8px"
          wordBreak="break-word"
          noOfLines={2}
        >
          {title}
        </Heading>

        {/* Description */}
        <Text
          fontFamily={FONT_APPLE_TEXT}
          fontSize={{ base: '14px', md: '15px' }}
          lineHeight="1.55"
          letterSpacing="-0.1px"
          color={descColor}
          noOfLines={4}
        >
          {description}
        </Text>

        {/* CTA at bottom */}
        <Text
          mt="auto"
          pt={{ base: '14px', md: '18px' }}
          fontFamily={FONT_APPLE_TEXT}
          fontSize="13px"
          fontWeight="600"
          letterSpacing="-0.1px"
          color={accentBlue}
        >
          Открыть агента →
        </Text>
      </Box>
    </NavLink>
  );
}

// ──────────────────────────────────────────────────────────────────
// Page
// ──────────────────────────────────────────────────────────────────
export default function LifeAgentsLandingClient() {
  const { user } = useUser(false);

  // ── Apple design tokens ─────────────────────────────────────────
  const textPrimary = useColorModeValue('#1d1d1f', '#f5f5f7');
  const textSecondary = useColorModeValue('#6e6e73', 'rgba(245,245,247,0.68)');
  const textBody = useColorModeValue('#3c3c43', 'rgba(245,245,247,0.78)');
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
  const chipBg = useColorModeValue(
    'rgba(255,255,255,0.62)',
    'rgba(255,255,255,0.06)',
  );
  const chipBorder = useColorModeValue(
    'rgba(0,0,0,0.06)',
    'rgba(255,255,255,0.10)',
  );
  const disclaimerBg = useColorModeValue(
    'rgba(255,255,255,0.62)',
    'rgba(13,18,34,0.56)',
  );
  const disclaimerBorder = useColorModeValue(
    'rgba(0,0,0,0.06)',
    'rgba(255,255,255,0.08)',
  );
  // Decorative radial blobs — very subtle, no edges
  const blobA = useColorModeValue(
    'radial-gradient(circle, rgba(0,102,204,0.08) 0%, transparent 65%)',
    'radial-gradient(circle, rgba(41,151,255,0.16) 0%, transparent 65%)',
  );
  const blobB = useColorModeValue(
    'radial-gradient(circle, rgba(126,89,255,0.08) 0%, transparent 65%)',
    'radial-gradient(circle, rgba(126,89,255,0.18) 0%, transparent 65%)',
  );

  const trustChips = ['Игровой формат', 'Без диагнозов', 'На русском'];

  return (
    <Box
      mt={{ base: '70px', md: '0px', xl: '0px' }}
      w="100%"
      maxW="100%"
      minWidth={0}
      overflowX="hidden"
      position="relative"
      bg="transparent"
      fontFamily={FONT_APPLE_TEXT}
    >
      {/* Decorative ambient blobs — pointer-events none */}
      <Box
        position="absolute"
        top="-80px"
        left="-120px"
        w={{ base: '320px', md: '460px' }}
        h={{ base: '320px', md: '460px' }}
        borderRadius="50%"
        bg={blobA}
        filter="blur(40px)"
        opacity={0.9}
        pointerEvents="none"
        zIndex={0}
      />
      <Box
        position="absolute"
        top="240px"
        right="-180px"
        w={{ base: '280px', md: '420px' }}
        h={{ base: '280px', md: '420px' }}
        borderRadius="50%"
        bg={blobB}
        filter="blur(40px)"
        opacity={0.85}
        pointerEvents="none"
        zIndex={0}
        display={{ base: 'none', md: 'block' }}
      />

      {/* Content wrapper */}
      <Box
        position="relative"
        zIndex={1}
        maxW={{ base: '100%', md: '1200px' }}
        mx="auto"
        px={{ base: '16px', md: '24px', xl: '32px' }}
        py={{ base: '20px', md: '28px' }}
        width="100%"
        minWidth={0}
      >
        {/* ── Hero ───────────────────────────────────────────── */}
        <Stack
          spacing={{ base: '14px', md: '20px' }}
          mb={{ base: '36px', md: '56px' }}
          align="flex-start"
          maxW="980px"
          pt={{ base: '8px', md: '20px' }}
        >
          {/* Eyebrow chip */}
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
              fontSize="11px"
              fontWeight="600"
              letterSpacing="0.5px"
              textTransform="uppercase"
              color={accentBlue}
            >
              Агенты Жизни ИИСеть
            </Text>
          </Box>

          {/* H1 */}
          <Heading
            as="h1"
            fontFamily={FONT_APPLE_DISPLAY}
            fontSize={{ base: '38px', sm: '46px', md: '60px', lg: '68px' }}
            fontWeight="600"
            lineHeight={{ base: '1.08', md: '1.04' }}
            letterSpacing={{ base: '-0.7px', md: '-1.2px' }}
            color={textPrimary}
            wordBreak="break-word"
            maxWidth="100%"
          >
            Посмотрите на себя под новым углом
          </Heading>

          {/* Subtitle */}
          <Text
            fontFamily={FONT_APPLE_TEXT}
            fontSize={{ base: '16px', md: '20px' }}
            lineHeight="1.5"
            fontWeight="400"
            letterSpacing="-0.15px"
            color={textBody}
            maxW="820px"
          >
            Выберите игрового ИИ-агента: сценариста, редактора жизни, оракула
            будущего или письмо из детства. Это не терапия и не диагнозы —
            а бережный способ сформулировать мысли, цели и личную историю.
          </Text>

          {/* CTA cluster */}
          <Flex
            gap="10px"
            direction={{ base: 'column', sm: 'row' }}
            w={{ base: '100%', sm: 'auto' }}
            mt="4px"
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
            <NavLink href="/all-templates" styles={{ width: 'fit-content' }}>
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
                AI-шаблоны →
              </Button>
            </NavLink>
          </Flex>

          {/* Trust chips */}
          <HStack
            spacing="8px"
            flexWrap="wrap"
            rowGap="8px"
            mt={{ base: '6px', md: '10px' }}
            maxWidth="100%"
          >
            {trustChips.map((label) => (
              <Box
                key={label}
                px="11px"
                py="5px"
                bg={chipBg}
                border="1px solid"
                borderColor={chipBorder}
                backdropFilter="blur(14px) saturate(160%)"
                sx={{ WebkitBackdropFilter: 'blur(14px) saturate(160%)' }}
                borderRadius="9999px"
              >
                <Text
                  fontFamily={FONT_APPLE_TEXT}
                  fontSize="12px"
                  fontWeight="500"
                  letterSpacing="-0.05px"
                  color={textSecondary}
                  whiteSpace="nowrap"
                >
                  {label}
                </Text>
              </Box>
            ))}
          </HStack>

          {/* Admin note — small, not prominent */}
          {user?.isAdmin && (
            <Text
              fontFamily={FONT_APPLE_TEXT}
              fontSize="12px"
              letterSpacing="-0.05px"
              color={textSecondary}
              mt="4px"
            >
              Админский режим: управление списком агентов — в панели администратора.
            </Text>
          )}
        </Stack>

        {/* ── Section heading ────────────────────────────────── */}
        <Flex
          align={{ base: 'flex-start', sm: 'baseline' }}
          gap="12px"
          direction={{ base: 'column', sm: 'row' }}
          mb={{ base: '16px', md: '22px' }}
        >
          <Heading
            as="h2"
            fontFamily={FONT_APPLE_DISPLAY}
            fontSize={{ base: '24px', md: '32px' }}
            fontWeight="600"
            lineHeight="1.2"
            letterSpacing="-0.4px"
            color={textPrimary}
            wordBreak="break-word"
          >
            Выберите формат
          </Heading>
          <Text
            fontFamily={FONT_APPLE_TEXT}
            fontSize={{ base: '14px', md: '15px' }}
            color={textSecondary}
            letterSpacing="-0.1px"
            lineHeight="1.5"
            maxW="540px"
          >
            Каждый агент предлагает отдельную творческую рамку: история, письмо,
            редактура, будущее или альтернативная версия себя.
          </Text>
        </Flex>

        {/* ── Agents grid ────────────────────────────────────── */}
        <SimpleGrid
          columns={{ base: 1, md: 2, xl: 3 }}
          spacing={{ base: '14px', md: '20px' }}
          width="100%"
          minWidth={0}
        >
          {agents.map((agent) => (
            <AgentGlassCard key={agent.href} {...agent} />
          ))}
        </SimpleGrid>

        {/* ── Disclaimer note ────────────────────────────────── */}
        <Box
          mt={{ base: '28px', md: '36px' }}
          p={{ base: '18px', md: '22px' }}
          bg={disclaimerBg}
          border="1px solid"
          borderColor={disclaimerBorder}
          backdropFilter="blur(18px) saturate(180%)"
          sx={{ WebkitBackdropFilter: 'blur(18px) saturate(180%)' }}
          borderRadius={{ base: '20px', md: '24px' }}
          boxShadow="inset 0 1px 0 rgba(255,255,255,0.55), 0 1px 2px rgba(0,0,0,0.03)"
          width="100%"
          maxWidth="100%"
          minWidth={0}
        >
          <Text
            fontFamily={FONT_APPLE_TEXT}
            fontSize={{ base: '13px', md: '14px' }}
            lineHeight="1.55"
            letterSpacing="-0.1px"
            color={textSecondary}
          >
            Агенты Жизни — игровой инструмент для размышлений. Они не заменяют
            психолога, врача или кризисную помощь.
          </Text>
        </Box>
      </Box>
    </Box>
  );
}
