'use client';

import React, { useContext, useEffect } from 'react';
import {
  Box,
  Button,
  Flex,
  Heading,
  Icon,
  Text,
  useColorModeValue,
  Grid,
  Badge,
} from '@chakra-ui/react';
import {
  LuZap,
  LuImages,
  LuGlobe,
  LuClock,
  LuShieldCheck,
  LuChevronRight,
  LuUsers,
} from 'react-icons/lu';
import Link from 'next/link';
import { useUser } from '@/utils/hooks/useUser';
import { ModalContext } from '@/contexts/ModalContext';
import { trackGoal } from '@/utils/metrics';
import { getProducts } from '@/components/modals';
import { calculatePages, getExpiredDate } from '../profile/page';

const FONT_APPLE_TEXT = `'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif`;
const FONT_APPLE_DISPLAY = `'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif`;

function getPlanLabel(grade?: string): string {
  if (!grade) return 'Бесплатный тариф';
  if (grade === 'Premium') return 'Premium';
  if (grade === 'Medium') return 'Medium';
  if (grade === 'Start') return 'Start';
  return grade;
}

function getPlanDescription(grade?: string, status?: string): string {
  if (status === 'cancel') return 'Подписка приостановлена. Действует до окончания оплаченного периода, затем перейдёт на бесплатный.';
  if (!grade) return 'Доступно 3 бесплатных запроса в день. Для полного доступа перейдите на Premium.';
  if (grade === 'Premium') return 'Максимальные возможности: GPT-4o, генерация изображений, поиск в интернете и готовые шаблоны.';
  if (grade === 'Medium') return 'Расширенный доступ к моделям и функциям.';
  if (grade === 'Start') return 'Базовый платный тариф с базовым доступом.';
  return 'Ваш текущий тариф активен.';
}

export default function MyPlanPage() {
  const { user, isAnonymous, loading } = useUser();
  const {
    setTariffModalOpen,
    setTariffModalData,
  } = useContext(ModalContext);

  useEffect(() => {
    getProducts('grade').then((result) => {
      if (setTariffModalData) setTariffModalData(result);
    });
  }, [setTariffModalData]);

  useEffect(() => {
    trackGoal('my_plan_viewed', {
      grade: user?.subscription?.grade || 'none',
      is_anonymous: isAnonymous,
    });
  }, [user?.subscription?.grade, isAnonymous]);

  const grade = user?.subscription?.grade;
  const status = user?.subscription?.status;
  const isPaidActive =
    status !== 'cancel' &&
    ['Premium', 'Medium', 'Start'].includes(grade || '');
  const isCancelled = status === 'cancel';

  const surfaceGlass = useColorModeValue(
    'rgba(255,255,255,0.62)',
    'rgba(13,18,34,0.62)',
  );
  const borderGlass = useColorModeValue(
    'rgba(255,255,255,0.68)',
    'rgba(255,255,255,0.14)',
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

  if (loading) {
    return (
      <Box
        maxW="920px"
        mx="auto"
        px={{ base: '16px', md: '28px' }}
        py="60px"
        textAlign="center"
      >
        <Text color={textSecondary}>Загрузка...</Text>
      </Box>
    );
  }

  return (
    <Box
      maxW="920px"
      mx="auto"
      px={{ base: '16px', md: '28px' }}
      py={{ base: '24px', md: '32px' }}
      mt={{ base: '50px', md: '0px', xl: '0px' }}
      fontFamily={FONT_APPLE_TEXT}
    >
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
        Мой тариф
      </Heading>

      {/* Current plan card */}
      <Box
        bg={surfaceGlass}
        backdropFilter="blur(22px) saturate(180%)"
        border="1px solid"
        borderColor={borderGlass}
        borderRadius={{ base: '20px', md: '24px' }}
        boxShadow={cardShadow}
        p={{ base: '20px', md: '28px' }}
        mb={{ base: '16px', md: '20px' }}
        position="relative"
        overflow="hidden"
      >
        <Box
          position="absolute"
          inset="0"
          borderRadius="inherit"
          pointerEvents="none"
          background={glassShine}
          opacity={0.85}
          zIndex={0}
        />
        <Flex
          direction="column"
          position="relative"
          zIndex={1}
          gap={{ base: '14px', md: '18px' }}
        >
          <Text
            fontSize="12px"
            fontWeight="600"
            letterSpacing="0.5px"
            textTransform="uppercase"
            color={textSecondary}
          >
            Текущий тариф
          </Text>

          <Flex
            direction={{ base: 'column', md: 'row' }}
            align="flex-start"
            gap={{ base: '8px', md: '16px' }}
          >
            <Heading
              fontFamily={FONT_APPLE_DISPLAY}
              fontSize={{ base: '24px', md: '28px' }}
              fontWeight="600"
              lineHeight="1.1"
              letterSpacing="-0.4px"
              color={textPrimary}
            >
              {getPlanLabel(grade)}
            </Heading>
            {isCancelled && (
              <Badge
                fontSize="12px"
                fontWeight="600"
                px="10px"
                py="4px"
                borderRadius="9999px"
                bg={useColorModeValue(
                  'rgba(245,158,11,0.12)',
                  'rgba(245,158,11,0.18)',
                )}
                color={useColorModeValue('#b45309', '#f59e0b')}
                border="1px solid"
                borderColor={useColorModeValue(
                  'rgba(245,158,11,0.32)',
                  'rgba(245,158,11,0.32)',
                )}
              >
                Приостановлена
              </Badge>
            )}
          </Flex>

          <Text
            fontSize={{ base: '15px', md: '16px' }}
            color={textSecondary}
            lineHeight="1.6"
            maxW="600px"
          >
            {getPlanDescription(grade, status)}
          </Text>

          {/* Balances for paid users */}
          {isPaidActive && (
            <Grid
              templateColumns={{ base: '1fr', sm: '1fr 1fr 1fr' }}
              gap={{ base: '10px', md: '14px' }}
              mt="4px"
            >
              <BalanceItem
                icon={<Icon as={LuZap} w="18px" h="18px" color={accentBlue} />}
                label="Страниц текста"
                value={`${calculatePages(user?.modelsBalance)} стр.`}
              />
              <BalanceItem
                icon={<Icon as={LuImages} w="18px" h="18px" color={accentBlue} />}
                label="Генераций картинок"
                value={`${user?.imageGenerationBalance || 0}`}
              />
              <BalanceItem
                icon={<Icon as={LuGlobe} w="18px" h="18px" color={accentBlue} />}
                label="Поиск в интернете"
                value={`${(user as any)?.webSearchBalance ?? 0}`}
              />
            </Grid>
          )}

          {isPaidActive && (
            <Flex align="center" gap="6px" mt="2px">
              <Icon as={LuClock} w="14px" h="14px" color={textSecondary} />
              <Text fontSize="13px" color={textSecondary}>
                Следующее списание:{' '}
                {getExpiredDate(user?.subscription?.startDate) || '—'}
              </Text>
            </Flex>
          )}
        </Flex>
      </Box>

      {/* Premium upsell for free/cancelled users */}
      {!isPaidActive && (
        <Box
          bg={surfaceGlass}
          backdropFilter="blur(22px) saturate(180%)"
          border="1px solid"
          borderColor={borderGlass}
          borderRadius={{ base: '20px', md: '24px' }}
          boxShadow={cardShadow}
          p={{ base: '20px', md: '28px' }}
          position="relative"
          overflow="hidden"
        >
          <Box
            position="absolute"
            inset="0"
            borderRadius="inherit"
            pointerEvents="none"
            background={glassShine}
            opacity={0.85}
            zIndex={0}
          />
          <Flex
            direction="column"
            position="relative"
            zIndex={1}
            gap={{ base: '14px', md: '18px' }}
          >
            <Text
              fontSize="12px"
              fontWeight="600"
              letterSpacing="0.5px"
              textTransform="uppercase"
              color={textSecondary}
            >
              Улучшить тариф
            </Text>

            <Heading
              fontFamily={FONT_APPLE_DISPLAY}
              fontSize={{ base: '22px', md: '28px' }}
              fontWeight="600"
              lineHeight="1.15"
              letterSpacing="-0.4px"
              color={textPrimary}
            >
              Решайте задачи в 10 раз быстрее
            </Heading>

            <Text
              fontSize={{ base: '15px', md: '16px' }}
              color={textSecondary}
              lineHeight="1.6"
              maxW="620px"
            >
              GPT-4o, генерация изображений и поиск в интернете — всё в одном
              окне. Без VPN и иностранных карт.
            </Text>

            <Flex align="center" gap="8px" mt="2px">
              <Icon
                as={LuUsers}
                w="16px"
                h="16px"
                color={useColorModeValue('#0066cc', '#2997ff')}
              />
              <Text
                fontSize={{ base: '13px', md: '14px' }}
                color={textSecondary}
                lineHeight="1.4"
              >
                Более 8,000 пользователей уже используют ИИСеть
              </Text>
            </Flex>

            <Grid
              templateColumns={{ base: '1fr', sm: '1fr 1fr' }}
              gap="10px"
              mt="4px"
            >
              <BenefitItem
                icon={<Icon as={LuZap} w="16px" h="16px" color={accentBlue} />}
                text="GPT-4o с 250+ страницами в месяц"
              />
              <BenefitItem
                icon={<Icon as={LuImages} w="16px" h="16px" color={accentBlue} />}
                text="Генерация изображений в чате"
              />
              <BenefitItem
                icon={<Icon as={LuGlobe} w="16px" h="16px" color={accentBlue} />}
                text="Поиск в интернете с реальными данными"
              />
              <BenefitItem
                icon={<Icon as={LuShieldCheck} w="16px" h="16px" color={accentBlue} />}
                text="Мгновенная активация без ожидания"
              />
            </Grid>

            <Flex
              direction={{ base: 'column', md: 'row' }}
              align={{ base: 'stretch', md: 'center' }}
              gap={{ base: '10px', md: '16px' }}
              mt="8px"
            >
              {isAnonymous ? (
                <Link href="/others/sign-in" style={{ width: '100%' }}>
                  <Button
                    w="100%"
                    bg={accentBlue}
                    color="white"
                    borderRadius="9999px"
                    h="48px"
                    px="24px"
                    fontFamily={FONT_APPLE_TEXT}
                    fontWeight="500"
                    fontSize="15px"
                    letterSpacing="-0.2px"
                    _hover={{ bg: accentBlueHover }}
                    _active={{ transform: 'scale(0.96)' }}
                    transition="background 0.16s ease, transform 0.12s ease"
                    boxShadow="0 1px 2px rgba(0,0,0,0.06)"
                  >
                    Войти и перейти на Premium
                    <Icon
                      as={LuChevronRight}
                      w="18px"
                      h="18px"
                      ml="4px"
                    />
                  </Button>
                </Link>
              ) : (
                <Button
                  w={{ base: '100%', md: 'auto' }}
                  bg={accentBlue}
                  color="white"
                  borderRadius="9999px"
                  h="48px"
                  px="24px"
                  fontFamily={FONT_APPLE_TEXT}
                  fontWeight="500"
                  fontSize="15px"
                  letterSpacing="-0.2px"
                  _hover={{ bg: accentBlueHover }}
                  _active={{ transform: 'scale(0.96)' }}
                  transition="background 0.16s ease, transform 0.12s ease"
                  boxShadow="0 1px 2px rgba(0,0,0,0.06)"
                  onClick={() => {
                    trackGoal('upgrade_to_premium_click', {
                      source: 'my_plan',
                    });
                    setTariffModalOpen && setTariffModalOpen(true);
                  }}
                >
                  Перейти на Premium — 249 ₽/мес (≈ 9 ₽/день)
                  <Icon
                    as={LuChevronRight}
                    w="18px"
                    h="18px"
                    ml="4px"
                  />
                </Button>
              )}
              <Text
                fontSize="13px"
                color={textSecondary}
                lineHeight="1.4"
                textAlign={{ base: 'center', md: 'left' }}
              >
                Отмена в любой момент · 7-дневная гарантия возврата · Без скрытых платежей
              </Text>
            </Flex>
          </Flex>
        </Box>
      )}
    </Box>
  );
}

function BalanceItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  const borderGlass = useColorModeValue(
    'rgba(0,0,0,0.08)',
    'rgba(255,255,255,0.10)',
  );
  const textSecondary = useColorModeValue(
    '#6e6e73',
    'rgba(245,245,247,0.68)',
  );
  const textPrimary = useColorModeValue('#1d1d1f', '#f5f5f7');

  return (
    <Flex
      align="center"
      gap="10px"
      p="12px 14px"
      border="1px solid"
      borderColor={borderGlass}
      borderRadius="12px"
    >
      {icon}
      <Flex direction="column" gap="2px">
        <Text
          fontSize="11px"
          fontWeight="600"
          letterSpacing="0.3px"
          color={textSecondary}
          textTransform="uppercase"
        >
          {label}
        </Text>
        <Text
          fontSize="15px"
          fontWeight="600"
          color={textPrimary}
          lineHeight="1.3"
        >
          {value}
        </Text>
      </Flex>
    </Flex>
  );
}

function BenefitItem({
  icon,
  text,
}: {
  icon: React.ReactNode;
  text: string;
}) {
  const borderGlass = useColorModeValue(
    'rgba(0,0,0,0.08)',
    'rgba(255,255,255,0.10)',
  );
  const textPrimary = useColorModeValue('#1d1d1f', '#f5f5f7');

  return (
    <Flex
      align="center"
      gap="8px"
      p="10px 12px"
      border="1px solid"
      borderColor={borderGlass}
      borderRadius="10px"
    >
      {icon}
      <Text fontSize="14px" color={textPrimary} lineHeight="1.4">
        {text}
      </Text>
    </Flex>
  );
}
