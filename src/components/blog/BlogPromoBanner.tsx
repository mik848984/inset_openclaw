'use client';

import React, { useContext, useEffect } from 'react';
import {
  Box,
  Button,
  Flex,
  Heading,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/utils/hooks/useUser';
import { ModalContext } from '@/contexts/ModalContext';
import { getProducts } from '@/components/modals';
import { trackGoal } from '@/utils/metrics';

// ── Apple typography ──────────────────────────────────────────────
const FONT_APPLE_TEXT = `'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif`;
const FONT_APPLE_DISPLAY = `'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif`;

export default function BlogPromoBanner() {
  // ── Business logic (preserved exactly) ─────────────────────────
  const { user, isAnonymous } = useUser();
  const {
    setTariffModalOpen,
    setPayBalanceModalOpen,
    setTariffModalData,
    setPaymentModalData,
  } = useContext(ModalContext);
  const router = useRouter();

  const hasActiveSubscription = user?.subscription?.status === 'active';
  const isGuest = isAnonymous || !user;

  useEffect(() => {
    getProducts('grade').then((result) => {
      if (result && setTariffModalData) {
        setTariffModalData(result);
      }
    });
    getProducts('items').then((result) => {
      if (result && setPaymentModalData) {
        setPaymentModalData(result);
      }
    });
  }, [setTariffModalData, setPaymentModalData]);

  const handleClick = () => {
    if (isGuest) {
      trackGoal('signup_started', { from: 'blog_promo_banner' });
      router.push('/others/sign-in');
      return;
    }

    if (hasActiveSubscription) {
      trackGoal('topup_click', { from: 'blog_promo_banner' });
      if (setPayBalanceModalOpen) {
        setPayBalanceModalOpen(true);
      }
      return;
    }

    trackGoal('subscription_opened', { from: 'blog_promo_banner' });
    if (setTariffModalOpen) {
      setTariffModalOpen(true);
    }
  };

  // ── Apple Liquid Glass tokens ──────────────────────────────────
  const bannerBg = useColorModeValue(
    'rgba(255,255,255,0.68)',
    'rgba(13,18,34,0.62)',
  );
  const bannerBorder = useColorModeValue(
    'rgba(255,255,255,0.68)',
    'rgba(255,255,255,0.10)',
  );
  const eyebrowBg = useColorModeValue(
    'rgba(0,102,204,0.10)',
    'rgba(41,151,255,0.16)',
  );
  const titleColor = useColorModeValue('#1d1d1f', '#f5f5f7');
  const descColor = useColorModeValue('#3c3c43', 'rgba(245,245,247,0.74)');
  const accentBlue = useColorModeValue('#0066cc', '#2997ff');
  const accentBlueHover = useColorModeValue('#0071e3', '#5ac8ff');
  const cardShadow = useColorModeValue(
    'inset 0 1px 0 rgba(255,255,255,0.55), 0 1px 2px rgba(0,0,0,0.03), 0 18px 50px rgba(31,38,70,0.06)',
    'inset 0 1px 0 rgba(255,255,255,0.08), 0 1px 2px rgba(0,0,0,0.16), 0 18px 50px rgba(0,0,0,0.32)',
  );

  // ── Copy (preserved logic from original) ────────────────────────
  const guestTitle = 'Бесплатная регистрация в ИИСеть';
  const proTitle = 'Подписка ИИСеть PRO';
  const activeTitle = 'Подписка активна';

  const guestDescription =
    'Получите доступ к лучшим ИИ-моделям на русском языке: до 120 страниц запросов в месяц, генерация изображений, история чатов и свежие материалы про ИИ.';
  const proDescription =
    '2 000+ страниц запросов к моделям ИИ, до 150 генераций изображений и приоритетная очередь — за 249 ₽ в месяц.';
  const activeDescription =
    'Пополните баланс генераций и страниц, чтобы не останавливаться на пиковых задачах.';

  const title = isGuest
    ? guestTitle
    : hasActiveSubscription
    ? activeTitle
    : proTitle;

  const description = isGuest
    ? guestDescription
    : hasActiveSubscription
    ? activeDescription
    : proDescription;

  const buttonText = isGuest
    ? 'Зарегистрироваться'
    : hasActiveSubscription
    ? 'Пополнить баланс'
    : 'Оформить подписку';

  return (
    <Box
      bg={bannerBg}
      backdropFilter="blur(22px) saturate(180%)"
      border="1px solid"
      borderColor={bannerBorder}
      boxShadow={cardShadow}
      borderRadius={{ base: '24px', md: '32px' }}
      px={{ base: '20px', md: '32px' }}
      py={{ base: '22px', md: '28px' }}
      my={{ base: '4px', md: '8px' }}
      width="100%"
      maxWidth="100%"
      minWidth={0}
      fontFamily={FONT_APPLE_TEXT}
      sx={{
        WebkitBackdropFilter: 'blur(22px) saturate(180%)',
        position: 'relative',
        // Apple Liquid Glass top highlight
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: '0',
          borderRadius: 'inherit',
          pointerEvents: 'none',
          background:
            'linear-gradient(180deg, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0) 55%)',
          opacity: 0.85,
          zIndex: 0,
        },
        '& > *': { position: 'relative', zIndex: 1 },
      }}
    >
      <Flex
        direction={{ base: 'column', md: 'row' }}
        align={{ base: 'stretch', md: 'center' }}
        justify="space-between"
        gap={{ base: '16px', md: '24px' }}
        width="100%"
        minWidth={0}
      >
        {/* Left: eyebrow + title + description */}
        <Box flex="1 1 0" minWidth={0}>
          <Box
            display="inline-flex"
            alignItems="center"
            gap="6px"
            px="10px"
            py="4px"
            bg={eyebrowBg}
            borderRadius="9999px"
            mb="10px"
          >
            <Box w="5px" h="5px" borderRadius="50%" bg={accentBlue} />
            <Text
              fontSize="11px"
              fontWeight="600"
              letterSpacing="0.4px"
              textTransform="uppercase"
              color={accentBlue}
            >
              ИИСеть
            </Text>
          </Box>

          <Heading
            fontFamily={FONT_APPLE_DISPLAY}
            fontSize={{ base: '20px', md: '24px' }}
            fontWeight="600"
            lineHeight="1.2"
            letterSpacing="-0.4px"
            color={titleColor}
            mb="8px"
            wordBreak="break-word"
          >
            {title}
          </Heading>
          <Text
            fontSize={{ base: '14px', md: '15px' }}
            lineHeight="1.55"
            letterSpacing="-0.1px"
            color={descColor}
            maxWidth="560px"
          >
            {description}
          </Text>
        </Box>

        {/* Right: CTA */}
        <Box flexShrink={0} width={{ base: '100%', md: 'auto' }}>
          <Button
            onClick={handleClick}
            bg={accentBlue}
            color="white"
            borderRadius="9999px"
            h={{ base: '44px', md: '46px' }}
            px="22px"
            w={{ base: '100%', md: 'auto' }}
            minW={{ md: '180px' }}
            fontFamily={FONT_APPLE_TEXT}
            fontSize="15px"
            fontWeight="500"
            letterSpacing="-0.2px"
            _hover={{ bg: accentBlueHover }}
            _active={{ transform: 'scale(0.97)' }}
            transition="background 0.16s ease, transform 0.12s ease"
            boxShadow="0 1px 2px rgba(0,0,0,0.06)"
          >
            {buttonText}
          </Button>
        </Box>
      </Flex>
    </Box>
  );
}
