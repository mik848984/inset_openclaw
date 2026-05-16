'use client';
/*eslint-disable*/

import {
  Box,
  Button,
  Flex,
  Icon,
  SimpleGrid,
  Text,
  useColorModeValue,
  Link as LinkChakra,
  Grid,
} from '@chakra-ui/react';
import { MdOutlinePaid, MdOutlineRequestPage } from 'react-icons/md';
import MiniStatistics from '@/components/card/MiniStatistics';
import IconBox from '@/components/icons/IconBox';
import React, { useContext, useEffect } from 'react';
import { LuBrain, LuBrainCircuit, LuImages } from 'react-icons/lu';
import { NextAvatar } from '@/components/image/Avatar';
import { ModalContext } from '@/contexts/ModalContext';
import { useUser } from '@/utils/hooks/useUser';
import Link from 'next/link';
import { PiSignIn } from 'react-icons/pi';
import Card from '@/components/card/Card';
import { TbCreditCardPay, TbSettingsDollar } from 'react-icons/tb';
import { SiGoogledocs } from 'react-icons/si';
import { Viewport } from 'next';
import { getProducts } from '@/components/modals';
import { trackGoal } from '@/utils/metrics';

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

  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.200');
  const brandColor = useColorModeValue('brand.500', 'white');
  const boxBg = useColorModeValue('secondaryGray.300', 'whiteAlpha.100');
  const textColorPrimary = useColorModeValue('navy.700', 'white');

  return (
    <Box mt={{ base: '50px', md: '0px', xl: '0px' }}>
      <Card mb="20px" alignItems="center" pb="30px">
        <Flex
          bg="linear-gradient(15.46deg, #4A25E1 26.3%, #7B5AFF 86.4%)"
          w="100%"
          h="129px"
          borderRadius="16px"
        />
        <NextAvatar
          mx="auto"
          showBorder
          src={user?.image}
          h="110px"
          w="110px"
          mt="-43px"
          mb="15px"
        />
        <Flex alignItems="center" direction="column">
          <Text
            textAlign="center"
            fontSize="2xl"
            textColor={textColorPrimary}
            fontWeight="700"
            mb="4px"
          >
            {isAnonymous ? 'Анонимный пользователь' : user?.name}
          </Text>
          {isAnonymous && (
            <Link as={Button as any} href="/others/sign-in">
              <Button
                tabIndex={-1}
                w={{ base: '100%', md: 'auto' }}
                variant="transparent"
                border="1px solid"
                borderColor={borderColor}
                borderRadius="full"
                rightIcon={<Icon w="20px" h="20px" as={PiSignIn} />}
              >
                Авторизоваться
              </Button>
            </Link>
          )}
        </Flex>
      </Card>
      <MiniStatistics
        startContent={
          <IconBox
            w="56px"
            h="56px"
            bg={boxBg}
            icon={
              <Icon w="24px" h="24px" as={MdOutlinePaid} color={brandColor} />
            }
          />
        }
        endContent={
          <Flex
            justifyContent="flex-end"
            w="100%"
            gap="20px"
            direction={{ base: 'column', xl: 'row' }}
          >
            <Button
              w={{ base: '100%', md: 'auto' }}
              onClick={() => {
                trackGoal('subscription_opened', { from: 'profile' });
                setTariffModalOpen!(true);
              }}
              variant="transparent"
              border="1px solid"
              borderColor={borderColor}
              borderRadius="full"
              fontSize="md"
              p="6px 20px"
              leftIcon={<Icon w="20px" h="20px" as={TbSettingsDollar} />}
            >
              Управлять подпиской
            </Button>
            <Button
              w={{ base: '100%', md: 'auto' }}
              onClick={() => {
                trackGoal('topup_click', { from: 'profile' });
                setPayBalanceModalOpen!(true);
              }}
              variant="transparent"
              border="1px solid"
              borderColor={borderColor}
              borderRadius="full"
              fontSize="md"
              p="6px 20px"
              leftIcon={<Icon w="20px" h="20px" as={TbCreditCardPay} />}
            >
              Пополнить баланс
            </Button>
          </Flex>
        }
        name={`Дата окончания подписки: ${getExpiredDate(user?.subscription.startDate)}`}
        value={`Подписка - ${getTariffName(user?.subscription.status, user?.subscription?.grade)}`}
      />
      <Box h="20px" />
      <SimpleGrid columns={{ base: 1, md: 2, xl: 2 }} gap="20px" mb="20px">
        <MiniStatistics
          startContent={
            <IconBox
              w="56px"
              h="56px"
              bg={boxBg}
              icon={<Icon w="24px" h="24px" as={LuBrain} color={brandColor} />}
            />
          }
          name="Количество страниц для генерации"
          value={calculatePages(user?.modelsBalance)}
        />
        <MiniStatistics
          startContent={
            <IconBox
              w="56px"
              h="56px"
              bg={boxBg}
              icon={<Icon w="24px" h="24px" as={LuImages} color={brandColor} />}
            />
          }
          name="Количество генераций изображений"
          value={user?.imageGenerationBalance || 0}
        />
      </SimpleGrid>
      <SimpleGrid columns={{ base: 1, md: 2 }} gap="20px" mb="20px">
        <MiniStatistics
          startContent={
            <IconBox
              w="56px"
              h="56px"
              bg={boxBg}
              icon={
                <Icon
                  w="26px"
                  h="26px"
                  as={MdOutlineRequestPage}
                  color={brandColor}
                />
              }
            />
          }
          name="Что такое страницы?"
          value={
            <Box>
              Подробная информация{' '}
              <LinkChakra
                target="_blank"
                textDecoration="underline"
                href="https://telegra.ph/CHto-takoe-stranicy-na-IISetio-03-05"
              >
                в этом документе
              </LinkChakra>
            </Box>
          }
        />
        <MiniStatistics
          startContent={
            <IconBox
              w="56px"
              h="56px"
              bg={boxBg}
              icon={
                <Icon w="24px" h="24px" as={SiGoogledocs} color={brandColor} />
              }
            />
          }
          name="Дополнительные документы"
          value={
            <Grid>
              <LinkChakra
                textDecoration="underline"
                target="_blank"
                href="https://telegra.ph/Politika-konfidencialnosti-03-05-7"
              >
                Политика конфиденциальности
              </LinkChakra>
              <LinkChakra
                textDecoration="underline"
                target="_blank"
                href="https://telegra.ph/Polzovatelskoe-soglashenie-03-05-7"
              >
                Пользовательское соглашение
              </LinkChakra>
            </Grid>
          }
        />
      </SimpleGrid>
    </Box>
  );
}
