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

export default function BlogPromoBanner() {
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

  const borderColor = useColorModeValue('pink.400', 'pink.300');
  const headingColor = useColorModeValue('white', 'white');
  const accentBg = useColorModeValue('black', 'black');
  const promoBg = '#F687B3';
  const promoHoverBg = '#ED64A6';

  const guestTitle = 'ИИСеть — зарегистрируйся. Это бесплатно.';
  const proTitle = 'ИИСеть — Подписка PRO';

  const guestDescription = 'Получите доступ к лучшим моделям искусственного интеллекта на русском языке: до 120 страниц запросов в месяц, генерация изображений, сохранение истории чатов и доступ к свежим новостям ИИ.';
  const proDescription = 'Более 2 000 страниц запросов к моделям искусственного интеллекта, до 150 генераций изображений в месяц и приоритетная очередь обработки — всего за 249 ₽ в месяц. Прокачайте свой ИИ-инструмент для работы и личных задач.';

  const title = isGuest
    ? guestTitle
    : hasActiveSubscription
    ? 'ИИСеть — подписка активна'
    : proTitle;

  const description = isGuest ? guestDescription : proDescription;

  const buttonText = isGuest
    ? 'Зарегистрироваться'
    : hasActiveSubscription
    ? 'Пополнить баланс'
    : 'Оформить подписку';

  return (
    <Box
      borderWidth="2px"
      borderColor={borderColor}
      borderRadius="xl"
      px={{ base: 4, md: 8 }}
      py={{ base: 4, md: 6 }}
      my={{ base: 4, md: 6 }}
      bg={promoBg}
    >
      <Flex
        direction={{ base: 'column', md: 'row' }}
        align="stretch"
        justify="space-between"
        gap={{ base: 4, md: 6 }}
      >
        <Box
          flex={{ base: '0 0 auto', md: '0 0 32%' }}
          bg={accentBg}
          px={{ base: 4, md: 6 }}
          py={{ base: 4, md: 6 }}
        >
          <Heading
            fontSize={{ base: 'xl', md: '2xl' }}
            color={headingColor}
            textTransform="uppercase"
          >
            {title}
          </Heading>
        </Box>
        <Box
          flex={{ base: '1 1 auto', md: '0 0 68%' }}
          display="flex"
          flexDirection={{ base: 'column', md: 'row' }}
          alignItems={{ base: 'flex-start', md: 'center' }}
          justifyContent="space-between"
          px={{ base: 2, md: 4 }}
          py={{ base: 2, md: 4 }}
        >
          <Text fontSize={{ base: 'sm', md: 'md' }} mb={{ base: 3, md: 0 }}>
            {description}
          </Text>
          <Button
            size="lg"
            variant="outline"
            bg="transparent"
            borderWidth="2px"
            borderColor="white"
            _hover={{ bg: 'rgba(255,255,255,0.12)' }}
            color="white"
            mt={{ base: 2, md: 0 }}
            minW={{ base: '100%', md: '230px' }}
            flexShrink={0}
            whiteSpace="normal"
            textAlign="center"
            onClick={handleClick}
          >
            {buttonText}
          </Button>
        </Box>
      </Flex>
    </Box>
  );
}
