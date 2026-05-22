'use client';
/*eslint-disable*/

import {
  Box,
  Button,
  Flex,
  Grid,
  Heading,
  Icon,
  SimpleGrid,
  Text,
  useColorModeValue,
  Link as LinkChakra,
} from '@chakra-ui/react';
import React, { useContext, useEffect } from 'react';
import { LuBrain, LuImages, LuGlobe, LuFileText } from 'react-icons/lu';
import { NextAvatar } from '@/components/image/Avatar';
import { ModalContext } from '@/contexts/ModalContext';
import { useUser } from '@/utils/hooks/useUser';
import Link from 'next/link';
import { PiSignIn } from 'react-icons/pi';
import { TbCreditCardPay, TbSettingsDollar } from 'react-icons/tb';
import { Viewport } from 'next';
import { getProducts } from '@/components/modals';
import { trackGoal } from '@/utils/metrics';

// ── Business logic exports (preserved exactly) ───────────────────
export function calculatePages(tokens: number = 0) {
  return Number((tokens / 625).toFixed(2));
}

export function generateViewport(): Viewport {
  return {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  };
}

export function getTariffName(status?: string, grade?: string) {
  if (status === 'cancel') return '💤 Приостановлена';

  if (grade === 'Premium') return '✅ Активна';
  if (grade === 'Medium') return '✅ Активна';
  if (grade === 'Start') return 'Активна';
  return '🟥 Не активна';
}

export function getExpiredDate(startDate?: string) {
  if (!startDate) return '—';

  const date = new Date(startDate);
  date.setMonth(date.getMonth() + 1);

  return Intl.DateTimeFormat('ru').format(date);
}

// ── Apple font stacks ─────────────────────────────────────────────
const FONT_APPLE_TEXT = `'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif`;
const FONT_APPLE_DISPLAY = `'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif`;

export default function NewTemplate() {
  const { user, session, isAnonymous, loading } = useUser();

  const {
    setTariffModalOpen,
    setPayBalanceModalOpen,
    setTariffModalData,
    setPaymentModalData,
  } = useContext(ModalContext);

  useEffect(() => {
    getProducts('grade').then((result) => {
      if (setTariffModalData) {
        setTariffModalData(result);
      }
    });
    getProducts('items').then((result) => {
      if (setPaymentModalData) {
        setPaymentModalData(result);
      }
    });
  }, []);

  // ── Unified Apple/Liquid Glass design tokens ────────────────────
  const surfaceGlass = useColorModeValue(
    'rgba(255,255,255,0.62)',
    'rgba(13,18,34,0.62)',
  );
  const surfaceGlassHover = useColorModeValue(
    'rgba(255,255,255,0.74)',
    'rgba(13,18,34,0.74)',
  );
  const surfaceActive = useColorModeValue(
    'rgba(0,102,204,0.08)',
    'rgba(41,151,255,0.14)',
  );
  const borderGlass = useColorModeValue(
    'rgba(255,255,255,0.68)',
    'rgba(255,255,255,0.14)',
  );
  const borderSubtle = useColorModeValue(
    'rgba(0,0,0,0.08)',
    'rgba(255,255,255,0.10)',
  );
  const textPrimary = useColorModeValue('#1d1d1f', '#f5f5f7');
  const textSecondary = useColorModeValue(
    '#6e6e73',
    'rgba(245,245,247,0.68)',
  );
  const accentBlue = useColorModeValue('#0066cc', '#2997ff');
  const accentBlueHover = useColorModeValue('#0071e3', '#5ac8ff');
  const cardShadow = useColorModeValue(
    'inset 0 1px 0 rgba(255,255,255,0.62), 0 1px 2px rgba(0,0,0,0.03), 0 18px 50px rgba(31,38,70,0.06)',
    'inset 0 1px 0 rgba(255,255,255,0.10), 0 1px 2px rgba(0,0,0,0.12), 0 18px 50px rgba(0,0,0,0.30)',
  );
  const glassShine = useColorModeValue(
    'linear-gradient(180deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.08) 55%, rgba(255,255,255,0) 100%)',
    'linear-gradient(180deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.02) 55%, rgba(255,255,255,0) 100%)',
  );

  // Status badge colors
  const status = user?.subscription?.status;
  const grade = user?.subscription?.grade;
  const isActive = grade === 'Premium' || grade === 'Medium' || grade === 'Start';
  const isCancelled = status === 'cancel';
  const statusBadgeBg = isCancelled
    ? useColorModeValue('rgba(245,158,11,0.12)', 'rgba(245,158,11,0.18)')
    : isActive
    ? useColorModeValue('rgba(34,197,94,0.12)', 'rgba(34,197,94,0.18)')
    : useColorModeValue('rgba(0,0,0,0.06)', 'rgba(255,255,255,0.06)');
  const statusBadgeColor = isCancelled
    ? useColorModeValue('#b45309', '#f59e0b')
    : isActive
    ? useColorModeValue('#15803d', '#22c55e')
    : textSecondary;
  const statusBadgeBorder = isCancelled
    ? 'rgba(245,158,11,0.32)'
    : isActive
    ? 'rgba(34,197,94,0.32)'
    : 'rgba(0,0,0,0.08)';

  // Reusable glass card style
  const glassCardSx = {
    WebkitBackdropFilter: 'blur(22px) saturate(180%)',
    position: 'relative' as const,
    '&::before': {
      content: '""',
      position: 'absolute' as const,
      inset: '0',
      borderRadius: 'inherit',
      pointerEvents: 'none' as const,
      background: glassShine,
      opacity: 0.85,
      zIndex: 0,
    },
    '& > *': { position: 'relative' as const, zIndex: 1 },
  };

  // Balance metrics — preserved logic
  const textPagesValue = calculatePages(user?.modelsBalance);
  const imagesValue = user?.imageGenerationBalance || 0;
  const webSearchValue = (user as any)?.webSearchBalance ?? 0;

  return (
    <Box
      maxW="1120px"
      mx="auto"
      px={{ base: '16px', md: '28px', xl: '32px' }}
      py={{ base: '24px', md: '32px' }}
      mt={{ base: '50px', md: '0px', xl: '0px' }}
      fontFamily={FONT_APPLE_TEXT}
      width="100%"
      maxWidth={{ base: '100%', xl: '1120px' }}
      minWidth={0}
      overflowX="hidden"
    >
      {/* ── Page heading ─────────────────────────────────────────── */}
      <Heading
        as="h1"
        fontFamily={FONT_APPLE_DISPLAY}
        fontSize={{ base: '32px', md: '44px' }}
        fontWeight="600"
        lineHeight="1.08"
        letterSpacing="-0.6px"
        color={textPrimary}
        mb={{ base: '20px', md: '28px' }}
      >
        Личный кабинет
      </Heading>

      {/* ── Profile hero card ────────────────────────────────────── */}
      <Box
        bg={surfaceGlass}
        backdropFilter="blur(22px) saturate(180%)"
        border="1px solid"
        borderColor={borderGlass}
        borderRadius={{ base: '24px', md: '28px' }}
        boxShadow={cardShadow}
        p={{ base: '20px', md: '28px' }}
        mb={{ base: '14px', md: '18px' }}
        sx={glassCardSx}
        width="100%"
        maxWidth="100%"
        minWidth={0}
      >
        <Flex
          direction={{ base: 'column', md: 'row' }}
          align={{ base: 'center', md: 'center' }}
          gap={{ base: '16px', md: '22px' }}
          width="100%"
        >
          <Box flexShrink={0}>
            <NextAvatar
              src={user?.image}
              w={{ base: '76px', md: '92px' }}
              h={{ base: '76px', md: '92px' }}
              border="1.5px solid"
              borderColor={borderGlass}
            />
          </Box>

          <Flex
            direction="column"
            flex="1 1 0"
            minWidth={0}
            textAlign={{ base: 'center', md: 'left' }}
            align={{ base: 'center', md: 'flex-start' }}
            gap="4px"
          >
            <Heading
              fontFamily={FONT_APPLE_DISPLAY}
              fontSize={{ base: '22px', md: '26px' }}
              fontWeight="600"
              lineHeight="1.2"
              letterSpacing="-0.4px"
              color={textPrimary}
              wordBreak="break-word"
            >
              {isAnonymous ? 'Анонимный пользователь' : user?.name || 'Пользователь'}
            </Heading>
            {!isAnonymous && session?.user?.email && (
              <Text
                fontSize={{ base: '14px', md: '15px' }}
                color={textSecondary}
                letterSpacing="-0.1px"
                wordBreak="break-word"
              >
                {session.user.email}
              </Text>
            )}
            {/* Inline status badge */}
            <Flex
              align="center"
              gap="6px"
              mt="8px"
              px="10px"
              py="4px"
              bg={statusBadgeBg}
              borderRadius="9999px"
              border="1px solid"
              borderColor={statusBadgeBorder}
              width="fit-content"
            >
              <Box
                w="6px"
                h="6px"
                borderRadius="50%"
                bg={statusBadgeColor}
              />
              <Text
                fontSize="12px"
                fontWeight="600"
                letterSpacing="-0.1px"
                color={statusBadgeColor}
              >
                {getTariffName(status, grade)}
              </Text>
            </Flex>
          </Flex>

          {/* CTA cluster */}
          <Flex
            direction={{ base: 'column', md: 'row' }}
            gap="8px"
            w={{ base: '100%', md: 'auto' }}
            flexShrink={0}
          >
            {isAnonymous ? (
              <Link href="/others/sign-in" style={{ width: '100%' }}>
                <Button
                  w="100%"
                  bg={accentBlue}
                  color="white"
                  borderRadius="9999px"
                  h="44px"
                  px="22px"
                  fontFamily={FONT_APPLE_TEXT}
                  fontWeight="500"
                  fontSize="15px"
                  letterSpacing="-0.2px"
                  _hover={{ bg: accentBlueHover }}
                  _active={{ transform: 'scale(0.96)' }}
                  transition="all 0.16s ease"
                  rightIcon={<Icon as={PiSignIn} w="18px" h="18px" />}
                >
                  Авторизоваться
                </Button>
              </Link>
            ) : (
              <>
                <Button
                  w={{ base: '100%', md: 'auto' }}
                  bg={accentBlue}
                  color="white"
                  borderRadius="9999px"
                  h="44px"
                  px="22px"
                  fontFamily={FONT_APPLE_TEXT}
                  fontWeight="500"
                  fontSize="15px"
                  letterSpacing="-0.2px"
                  _hover={{ bg: accentBlueHover }}
                  _active={{ transform: 'scale(0.96)' }}
                  transition="all 0.16s ease"
                  leftIcon={<Icon as={TbSettingsDollar} w="18px" h="18px" />}
                  onClick={() => {
                    trackGoal('subscription_opened', { from: 'profile' });
                    setTariffModalOpen!(true);
                  }}
                >
                  Управлять подпиской
                </Button>
                <Button
                  w={{ base: '100%', md: 'auto' }}
                  variant="outline"
                  bg={surfaceGlass}
                  color={textPrimary}
                  borderRadius="9999px"
                  h="44px"
                  px="22px"
                  border="1px solid"
                  borderColor={borderSubtle}
                  fontFamily={FONT_APPLE_TEXT}
                  fontWeight="500"
                  fontSize="15px"
                  letterSpacing="-0.2px"
                  _hover={{ bg: surfaceGlassHover, borderColor: accentBlue }}
                  _active={{ transform: 'scale(0.96)' }}
                  transition="all 0.16s ease"
                  leftIcon={<Icon as={TbCreditCardPay} w="18px" h="18px" />}
                  onClick={() => {
                    trackGoal('topup_click', { from: 'profile' });
                    setPayBalanceModalOpen!(true);
                  }}
                >
                  Пополнить баланс
                </Button>
              </>
            )}
          </Flex>
        </Flex>
      </Box>

      {/* ── Subscription card ────────────────────────────────────── */}
      {!isAnonymous && (
        <Box
          bg={surfaceGlass}
          backdropFilter="blur(22px) saturate(180%)"
          border="1px solid"
          borderColor={borderGlass}
          borderRadius={{ base: '20px', md: '24px' }}
          boxShadow={cardShadow}
          p={{ base: '18px', md: '24px' }}
          mb={{ base: '14px', md: '18px' }}
          sx={glassCardSx}
          width="100%"
        >
          <Text
            fontSize="11px"
            fontWeight="600"
            letterSpacing="0.6px"
            textTransform="uppercase"
            color={textSecondary}
            mb="10px"
          >
            Подписка
          </Text>
          <Flex
            direction={{ base: 'column', md: 'row' }}
            justify="space-between"
            align={{ base: 'flex-start', md: 'center' }}
            gap="12px"
          >
            <Flex direction="column" gap="2px">
              <Heading
                fontFamily={FONT_APPLE_DISPLAY}
                fontSize={{ base: '20px', md: '24px' }}
                fontWeight="600"
                letterSpacing="-0.4px"
                lineHeight="1.2"
                color={textPrimary}
              >
                Тариф «{grade || 'Free'}»
              </Heading>
              <Text
                fontSize="14px"
                color={textSecondary}
                letterSpacing="-0.1px"
              >
                Действует до:{' '}
                <Text as="span" color={textPrimary} fontWeight="500">
                  {getExpiredDate(user?.subscription?.startDate)}
                </Text>
              </Text>
            </Flex>
          </Flex>
        </Box>
      )}

      {/* ── Balance metric cards ─────────────────────────────────── */}
      <SimpleGrid
        columns={{ base: 1, md: 3 }}
        gap={{ base: '10px', md: '14px' }}
        mb={{ base: '14px', md: '18px' }}
        width="100%"
        maxWidth="100%"
        minWidth={0}
      >
        {[
          {
            label: 'Текстовые страницы',
            value: textPagesValue,
            icon: LuBrain,
            tint: 'rgba(0,102,204,0.16)',
            iconColor: accentBlue,
          },
          {
            label: 'Генерация изображений',
            value: imagesValue,
            icon: LuImages,
            tint: 'rgba(126,89,255,0.18)',
            iconColor: '#7E59FF',
          },
          {
            label: 'Веб-поиск',
            value: webSearchValue,
            icon: LuGlobe,
            tint: 'rgba(6,182,212,0.18)',
            iconColor: '#06b6d4',
          },
        ].map((metric) => (
          <Box
            key={metric.label}
            bg={surfaceGlass}
            backdropFilter="blur(22px) saturate(180%)"
            border="1px solid"
            borderColor={borderGlass}
            borderRadius={{ base: '20px', md: '24px' }}
            boxShadow={cardShadow}
            p={{ base: '18px', md: '22px' }}
            sx={glassCardSx}
            width="100%"
            minWidth={0}
          >
            <Flex justify="space-between" align="flex-start" mb="12px">
              <Box>
                <Text
                  fontSize="11px"
                  fontWeight="600"
                  letterSpacing="0.6px"
                  textTransform="uppercase"
                  color={textSecondary}
                  mb="6px"
                >
                  {metric.label}
                </Text>
                <Text
                  fontFamily={FONT_APPLE_DISPLAY}
                  fontSize={{ base: '28px', md: '34px' }}
                  fontWeight="600"
                  lineHeight="1.1"
                  letterSpacing="-0.5px"
                  color={textPrimary}
                >
                  {metric.value}
                </Text>
              </Box>
              <Flex
                w="38px"
                h="38px"
                borderRadius="12px"
                bg={metric.tint}
                align="center"
                justify="center"
                flexShrink={0}
              >
                <Icon as={metric.icon} w="18px" h="18px" color={metric.iconColor} />
              </Flex>
            </Flex>
          </Box>
        ))}
      </SimpleGrid>

      {/* ── Help / docs row ──────────────────────────────────────── */}
      <SimpleGrid
        columns={{ base: 1, md: 2 }}
        gap={{ base: '10px', md: '14px' }}
        width="100%"
        maxWidth="100%"
        minWidth={0}
      >
        {/* What is a page */}
        <Box
          bg={surfaceGlass}
          backdropFilter="blur(22px) saturate(180%)"
          border="1px solid"
          borderColor={borderGlass}
          borderRadius={{ base: '20px', md: '24px' }}
          boxShadow={cardShadow}
          p={{ base: '18px', md: '22px' }}
          sx={glassCardSx}
          width="100%"
          minWidth={0}
        >
          <Flex align="center" gap="10px" mb="10px">
            <Flex
              w="34px"
              h="34px"
              borderRadius="10px"
              bg="rgba(0,102,204,0.10)"
              align="center"
              justify="center"
              flexShrink={0}
            >
              <Icon as={LuFileText} w="16px" h="16px" color={accentBlue} />
            </Flex>
            <Heading
              fontFamily={FONT_APPLE_DISPLAY}
              fontSize={{ base: '17px', md: '18px' }}
              fontWeight="600"
              letterSpacing="-0.3px"
              lineHeight="1.25"
              color={textPrimary}
            >
              Что такое страницы?
            </Heading>
          </Flex>
          <Text
            fontSize={{ base: '14px', md: '15px' }}
            color={textSecondary}
            lineHeight="1.6"
            letterSpacing="-0.1px"
            mb="10px"
          >
            1 страница ≈ 250 слов сгенерированного текста. Так нам удобно показывать
            расход баланса в понятных единицах.
          </Text>
          <LinkChakra
            href="https://telegra.ph/CHto-takoe-stranicy-na-IISetio-03-05"
            target="_blank"
            color={accentBlue}
            fontSize={{ base: '14px', md: '15px' }}
            fontWeight="500"
            letterSpacing="-0.1px"
            textDecoration="none"
            borderBottom="1px solid currentColor"
            paddingBottom="1px"
            _hover={{ opacity: 0.75 }}
            transition="opacity 0.15s ease"
          >
            Подробная информация
          </LinkChakra>
        </Box>

        {/* Documents */}
        <Box
          bg={surfaceGlass}
          backdropFilter="blur(22px) saturate(180%)"
          border="1px solid"
          borderColor={borderGlass}
          borderRadius={{ base: '20px', md: '24px' }}
          boxShadow={cardShadow}
          p={{ base: '18px', md: '22px' }}
          sx={glassCardSx}
          width="100%"
          minWidth={0}
        >
          <Text
            fontSize="11px"
            fontWeight="600"
            letterSpacing="0.6px"
            textTransform="uppercase"
            color={textSecondary}
            mb="14px"
          >
            Документы
          </Text>
          <Grid gap="10px">
            <LinkChakra
              href="https://telegra.ph/Politika-konfidencialnosti-03-05-7"
              target="_blank"
              color={accentBlue}
              fontSize={{ base: '14px', md: '15px' }}
              fontWeight="500"
              letterSpacing="-0.1px"
              textDecoration="none"
              borderBottom="1px solid currentColor"
              paddingBottom="1px"
              width="fit-content"
              maxWidth="100%"
              _hover={{ opacity: 0.75 }}
              transition="opacity 0.15s ease"
            >
              Политика конфиденциальности
            </LinkChakra>
            <LinkChakra
              href="https://telegra.ph/Polzovatelskoe-soglashenie-03-05-7"
              target="_blank"
              color={accentBlue}
              fontSize={{ base: '14px', md: '15px' }}
              fontWeight="500"
              letterSpacing="-0.1px"
              textDecoration="none"
              borderBottom="1px solid currentColor"
              paddingBottom="1px"
              width="fit-content"
              maxWidth="100%"
              _hover={{ opacity: 0.75 }}
              transition="opacity 0.15s ease"
            >
              Пользовательское соглашение
            </LinkChakra>
          </Grid>
        </Box>
      </SimpleGrid>
    </Box>
  );
}
