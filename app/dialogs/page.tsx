'use client';

import {
  Box,
  Button,
  Flex,
  Heading,
  Icon,
  Stack,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { IDialogUI, messagesService } from '@/services/ui/MessagesService';
import DialogCard from './DialogCard';
import Link from 'next/link';
import { TbMessageCircle } from 'react-icons/tb';
import { ImFilesEmpty } from 'react-icons/im';

// ── Apple typography ──────────────────────────────────────────────
const FONT_APPLE_TEXT = `'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif`;
const FONT_APPLE_DISPLAY = `'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif`;

// ──────────────────────────────────────────────────────────────────
// GlassSkeleton — local Apple-like loading tile (no dependencies)
// ──────────────────────────────────────────────────────────────────
function GlassSkeleton() {
  const cardBg = useColorModeValue(
    'rgba(255,255,255,0.62)',
    'rgba(13,18,34,0.55)',
  );
  const borderGlass = useColorModeValue(
    'rgba(0,0,0,0.06)',
    'rgba(255,255,255,0.10)',
  );
  const cardShadow = useColorModeValue(
    'inset 0 1px 0 rgba(255,255,255,0.55), 0 1px 2px rgba(0,0,0,0.03)',
    'inset 0 1px 0 rgba(255,255,255,0.10), 0 1px 2px rgba(0,0,0,0.14)',
  );
  const barLight = useColorModeValue(
    'rgba(0,0,0,0.06)',
    'rgba(255,255,255,0.08)',
  );
  const barMid = useColorModeValue(
    'rgba(0,0,0,0.10)',
    'rgba(255,255,255,0.12)',
  );

  return (
    <Box
      h="100%"
      minH={{ base: '170px', md: '190px' }}
      bg={cardBg}
      backdropFilter="blur(20px) saturate(180%)"
      border="1px solid"
      borderColor={borderGlass}
      borderRadius={{ base: '24px', md: '28px' }}
      boxShadow={cardShadow}
      p={{ base: '20px', md: '22px' }}
      display="flex"
      flexDirection="column"
      sx={{
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        '@keyframes pulse-skeleton': {
          '0%, 100%': { opacity: 0.65 },
          '50%': { opacity: 0.35 },
        },
        animation: 'pulse-skeleton 1.6s ease-in-out infinite',
      }}
    >
      {/* Top row mimic: icon well + tiny label */}
      <Flex align="center" gap="10px" mb="14px">
        <Box w="36px" h="36px" borderRadius="12px" bg={barMid} />
        <Box w="64px" h="10px" borderRadius="9999px" bg={barLight} />
      </Flex>
      {/* Title lines */}
      <Box w="95%" h="14px" borderRadius="9999px" bg={barMid} mb="8px" />
      <Box w="80%" h="14px" borderRadius="9999px" bg={barMid} mb="8px" />
      <Box w="55%" h="14px" borderRadius="9999px" bg={barLight} />
      {/* Bottom row */}
      <Flex mt="auto" pt="16px" justify="space-between" align="center" gap="10px">
        <Box w="40%" h="11px" borderRadius="9999px" bg={barLight} />
        <Box w="84px" h="11px" borderRadius="9999px" bg={barLight} />
      </Flex>
    </Box>
  );
}

// ──────────────────────────────────────────────────────────────────
// Page
// ──────────────────────────────────────────────────────────────────
export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [dialogs, setDialogs] = useState<IDialogUI[]>([]);

  // ── Apple design tokens ─────────────────────────────────────────
  const textPrimary = useColorModeValue('#1d1d1f', '#f5f5f7');
  const textSecondary = useColorModeValue(
    '#6e6e73',
    'rgba(245,245,247,0.66)',
  );
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
  // Empty state glass card
  const emptyCardBg = useColorModeValue(
    'rgba(255,255,255,0.70)',
    'rgba(13,18,34,0.62)',
  );
  const emptyCardBorder = useColorModeValue(
    'rgba(0,0,0,0.06)',
    'rgba(255,255,255,0.10)',
  );
  const emptyCardShadow = useColorModeValue(
    'inset 0 1px 0 rgba(255,255,255,0.65), 0 18px 50px rgba(15,23,42,0.06)',
    'inset 0 1px 0 rgba(255,255,255,0.10), 0 18px 50px rgba(0,0,0,0.30)',
  );
  const iconWellBg = useColorModeValue(
    'rgba(0,102,204,0.07)',
    'rgba(41,151,255,0.14)',
  );
  const iconWellBorder = useColorModeValue(
    'rgba(255,255,255,0.62)',
    'rgba(255,255,255,0.10)',
  );
  // Decorative ambient blob
  const blobA = useColorModeValue(
    'radial-gradient(circle, rgba(0,102,204,0.08) 0%, transparent 65%)',
    'radial-gradient(circle, rgba(41,151,255,0.14) 0%, transparent 65%)',
  );

  useEffect(() => {
    messagesService
      .getDialogs()
      .then((data) => {
        setDialogs(data);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

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
      {/* Decorative ambient blob — pointerEvents none, no rectangle */}
      <Box
        position="absolute"
        top="-80px"
        left="-120px"
        w={{ base: '320px', md: '480px' }}
        h={{ base: '320px', md: '480px' }}
        borderRadius="50%"
        bg={blobA}
        filter="blur(40px)"
        opacity={0.85}
        pointerEvents="none"
        zIndex={0}
      />

      {/* Content wrapper */}
      <Box
        position="relative"
        zIndex={1}
        maxW={{ base: '100%', md: '1200px' }}
        mx="auto"
        px={{ base: '16px', md: '24px', xl: '32px' }}
        py={{ base: '20px', md: '32px' }}
        width="100%"
        minWidth={0}
      >
        {/* ── Hero ───────────────────────────────────────────────── */}
        <Stack
          spacing={{ base: '14px', md: '20px' }}
          mb={{ base: '32px', md: '48px' }}
          align="flex-start"
          maxW="900px"
          pt={{ base: '6px', md: '14px' }}
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
              История ИИСеть
            </Text>
          </Box>

          {/* H1 */}
          <Heading
            as="h1"
            fontFamily={FONT_APPLE_DISPLAY}
            fontSize={{ base: '38px', sm: '46px', md: '58px', lg: '64px' }}
            fontWeight="600"
            lineHeight={{ base: '1.08', md: '1.05' }}
            letterSpacing={{ base: '-0.7px', md: '-1.1px' }}
            color={textPrimary}
            wordBreak="break-word"
            maxWidth="100%"
          >
            Ваши диалоги
          </Heading>

          {/* Subtitle */}
          <Text
            fontFamily={FONT_APPLE_TEXT}
            fontSize={{ base: '16px', md: '20px' }}
            lineHeight="1.5"
            fontWeight="400"
            letterSpacing="-0.15px"
            color={textBody}
            maxW="760px"
          >
            Возвращайтесь к прошлым запросам, продолжайте идеи и открывайте
            сохранённые разговоры в чате.
          </Text>

          {/* CTA cluster */}
          <Flex
            gap="10px"
            direction={{ base: 'column', sm: 'row' }}
            w={{ base: '100%', sm: 'auto' }}
            mt="4px"
          >
            <Link href="/chat" style={{ width: '100%' }}>
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
                leftIcon={
                  <Icon as={TbMessageCircle} w="17px" h="17px" />
                }
                _hover={{ bg: accentBlueHover }}
                _active={{ transform: 'scale(0.97)' }}
                transition="background 0.16s ease, transform 0.12s ease"
                boxShadow="0 1px 2px rgba(0,0,0,0.06)"
                w={{ base: '100%', sm: 'auto' }}
              >
                Новый чат
              </Button>
            </Link>
            <Link href="/all-templates" style={{ width: '100%' }}>
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
            </Link>
          </Flex>
        </Stack>

        {/* ── Section heading (only when content or loading) ─────── */}
        {(isLoading || dialogs.length > 0) && (
          <Flex
            align={{ base: 'flex-start', sm: 'baseline' }}
            gap="12px"
            direction={{ base: 'column', sm: 'row' }}
            mb={{ base: '16px', md: '22px' }}
          >
            <Heading
              as="h2"
              fontFamily={FONT_APPLE_DISPLAY}
              fontSize={{ base: '24px', md: '30px' }}
              fontWeight="600"
              lineHeight="1.2"
              letterSpacing="-0.4px"
              color={textPrimary}
            >
              Недавние диалоги
            </Heading>
            <Text
              fontFamily={FONT_APPLE_TEXT}
              fontSize={{ base: '14px', md: '15px' }}
              color={textSecondary}
              letterSpacing="-0.1px"
              lineHeight="1.5"
              maxW="540px"
            >
              Откройте диалог, чтобы продолжить с того места, где остановились.
            </Text>
          </Flex>
        )}

        {/* ── Loading: glass skeleton tiles ──────────────────────── */}
        {isLoading ? (
          <Box
            display="grid"
            gridTemplateColumns={{
              base: '1fr',
              md: 'repeat(2, minmax(0, 1fr))',
              xl: 'repeat(3, minmax(0, 1fr))',
            }}
            gap={{ base: '14px', md: '18px' }}
            width="100%"
            minWidth={0}
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <GlassSkeleton key={i} />
            ))}
          </Box>
        ) : dialogs.length > 0 ? (
          /* ── Dialogs grid ────────────────────────────────────── */
          <Box
            display="grid"
            gridTemplateColumns={{
              base: '1fr',
              md: 'repeat(2, minmax(0, 1fr))',
              xl: 'repeat(3, minmax(0, 1fr))',
            }}
            gap={{ base: '14px', md: '18px' }}
            width="100%"
            minWidth={0}
          >
            {dialogs.map((dialog) => (
              <DialogCard
                key={dialog._id}
                id={dialog._id}
                lastMessage={dialog.lastMessage}
                updatedAt={new Date(dialog.updatedAt)}
              />
            ))}
          </Box>
        ) : (
          /* ── Empty state: premium glass card ─────────────────── */
          <Flex justify="center" mt={{ base: '12px', md: '24px' }}>
            <Box
              maxW="520px"
              width="100%"
              minWidth={0}
              textAlign="center"
              bg={emptyCardBg}
              backdropFilter="blur(20px) saturate(180%)"
              sx={{ WebkitBackdropFilter: 'blur(20px) saturate(180%)' }}
              border="1px solid"
              borderColor={emptyCardBorder}
              boxShadow={emptyCardShadow}
              borderRadius={{ base: '26px', md: '30px' }}
              p={{ base: '28px', md: '36px' }}
            >
              {/* Icon well */}
              <Flex
                align="center"
                justify="center"
                mx="auto"
                w={{ base: '64px', md: '72px' }}
                h={{ base: '64px', md: '72px' }}
                borderRadius="20px"
                bg={iconWellBg}
                border="1px solid"
                borderColor={iconWellBorder}
                backdropFilter="blur(14px) saturate(160%)"
                sx={{ WebkitBackdropFilter: 'blur(14px) saturate(160%)' }}
                mb="20px"
              >
                <Icon
                  as={ImFilesEmpty}
                  w={{ base: '28px', md: '32px' }}
                  h={{ base: '28px', md: '32px' }}
                  color={accentBlue}
                />
              </Flex>

              <Heading
                as="h2"
                fontFamily={FONT_APPLE_DISPLAY}
                fontSize={{ base: '22px', md: '26px' }}
                fontWeight="600"
                lineHeight="1.2"
                letterSpacing="-0.4px"
                color={textPrimary}
                mb="10px"
              >
                Диалогов пока нет
              </Heading>
              <Text
                fontFamily={FONT_APPLE_TEXT}
                fontSize={{ base: '14px', md: '15px' }}
                lineHeight="1.55"
                letterSpacing="-0.1px"
                color={textSecondary}
                mb="22px"
                maxW="380px"
                mx="auto"
              >
                Начните первый чат — история появится здесь автоматически.
              </Text>

              <Link href="/chat">
                <Button
                  bg={accentBlue}
                  color="white"
                  borderRadius="9999px"
                  h="46px"
                  px="24px"
                  fontFamily={FONT_APPLE_TEXT}
                  fontSize="15px"
                  fontWeight="500"
                  letterSpacing="-0.2px"
                  leftIcon={
                    <Icon as={TbMessageCircle} w="17px" h="17px" />
                  }
                  _hover={{ bg: accentBlueHover }}
                  _active={{ transform: 'scale(0.97)' }}
                  transition="background 0.16s ease, transform 0.12s ease"
                  boxShadow="0 1px 2px rgba(0,0,0,0.06)"
                >
                  Начать новый диалог
                </Button>
              </Link>
            </Box>
          </Flex>
        )}
      </Box>
    </Box>
  );
}
