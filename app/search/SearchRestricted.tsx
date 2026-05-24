'use client';

import React from 'react';
import {
  Box,
  Button,
  Flex,
  Icon,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import Link from 'next/link';
import { MdLockOutline, MdArrowForward } from 'react-icons/md';

const ACCENT = '#422AFB';
const ACCENT_HOVER = '#3622D6';
const ACCENT_SOFT = '#EEF0FF';
const HAIRLINE = 'rgba(8, 10, 40, 0.08)';
const INK = '#0E1538';
const INK_MUTED = '#5C6479';

const FONT_STACK =
  '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", system-ui, "Helvetica Neue", Arial, sans-serif';

function BrandMark() {
  return (
    <Box
      w="22px"
      h="22px"
      borderRadius="9999px"
      bgGradient="linear(135deg, #5B47FB 0%, #422AFB 60%, #1A3DFA 100%)"
      boxShadow="0 4px 14px -4px rgba(66,42,251,0.45)"
      flexShrink={0}
    />
  );
}

function Aurora() {
  return (
    <Box
      position="absolute"
      top="0"
      left="0"
      right="0"
      h="520px"
      overflow="hidden"
      pointerEvents="none"
      zIndex={0}
      aria-hidden
    >
      <Box
        position="absolute"
        top="-160px"
        left="-120px"
        w="520px"
        h="520px"
        borderRadius="9999px"
        bg="radial-gradient(circle at center, rgba(91,71,251,0.20) 0%, rgba(91,71,251,0) 70%)"
        filter="blur(40px)"
      />
      <Box
        position="absolute"
        top="-100px"
        right="-120px"
        w="480px"
        h="480px"
        borderRadius="9999px"
        bg="radial-gradient(circle at center, rgba(38,160,255,0.16) 0%, rgba(38,160,255,0) 70%)"
        filter="blur(48px)"
      />
    </Box>
  );
}

export default function SearchRestricted() {
  const pageBg = useColorModeValue('#FAFAFC', 'navy.900');
  const cardBg = useColorModeValue('white', 'navy.800');
  const borderColor = useColorModeValue(HAIRLINE, 'whiteAlpha.200');
  const textColor = useColorModeValue(INK, 'white');
  const mutedColor = useColorModeValue(INK_MUTED, 'gray.400');
  const iconBg = useColorModeValue(ACCENT_SOFT, 'whiteAlpha.200');

  return (
    <Box
      position="relative"
      w="100%"
      minH={{ base: 'calc(100dvh - 140px)', md: 'calc(100dvh - 120px)' }}
      bg={pageBg}
      fontFamily={FONT_STACK}
      pt={{ base: '70px', md: '20px' }}
      px={{ base: '16px', md: '24px' }}
    >
      <Aurora />

      <Flex
        position="relative"
        zIndex={1}
        w="100%"
        minH={{ base: 'calc(100dvh - 200px)', md: 'calc(100dvh - 160px)' }}
        align="center"
        justify="center"
      >
        <Box
          maxW="460px"
          w="100%"
          bg={cardBg}
          borderWidth="1px"
          borderColor={borderColor}
          borderRadius="22px"
          p={{ base: '28px', md: '36px' }}
          textAlign="center"
          boxShadow="0 20px 60px -24px rgba(8,10,40,0.18), 0 2px 6px rgba(8,10,40,0.04)"
        >
          <Flex justify="center" mb="16px">
            <BrandMark />
          </Flex>

          <Flex
            align="center"
            justify="center"
            w="56px"
            h="56px"
            borderRadius="full"
            bg={iconBg}
            color={ACCENT}
            mx="auto"
            mb="20px"
          >
            <Icon as={MdLockOutline} w="26px" h="26px" />
          </Flex>

          <Box
            as="h1"
            fontSize={{ base: '24px', md: '26px' }}
            fontWeight="600"
            letterSpacing="-0.02em"
            lineHeight="1.2"
            color={textColor}
            mb="10px"
          >
            Поиск пока в закрытом тесте
          </Box>

          <Text
            color={mutedColor}
            fontSize={{ base: '15px', md: '16px' }}
            lineHeight="1.5"
            mb="24px"
          >
            Мы тестируем новый AI-поиск с источниками. Сейчас раздел
            доступен только администраторам.
          </Text>

          <Button
            as={Link}
            href="/chat"
            bg={ACCENT}
            color="white"
            _hover={{ bg: ACCENT_HOVER, transform: 'translateY(-1px)' }}
            _active={{ transform: 'scale(0.98)' }}
            transition="background-color 160ms ease, transform 120ms ease"
            borderRadius="9999px"
            h="44px"
            px="22px"
            fontWeight="500"
            letterSpacing="-0.01em"
            rightIcon={<Icon as={MdArrowForward} />}
            w={{ base: '100%', md: 'auto' }}
          >
            Вернуться в чат
          </Button>
        </Box>
      </Flex>
    </Box>
  );
}
