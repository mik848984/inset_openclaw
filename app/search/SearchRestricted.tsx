'use client';

import React from 'react';
import {
  Box,
  Button,
  Flex,
  Heading,
  Icon,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import Link from 'next/link';
import { MdLockOutline, MdArrowForward } from 'react-icons/md';

export default function SearchRestricted() {
  const cardBg = useColorModeValue('white', 'navy.800');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.200');
  const textColor = useColorModeValue('navy.700', 'white');
  const mutedColor = useColorModeValue('gray.500', 'gray.400');
  const iconBg = useColorModeValue('#EEF0FF', 'whiteAlpha.200');
  const iconColor = useColorModeValue('#422AFB', 'white');

  return (
    <Flex
      w="100%"
      minH={{ base: 'calc(100dvh - 140px)', md: 'calc(100dvh - 120px)' }}
      align="center"
      justify="center"
      px={{ base: '16px', md: '24px' }}
      pt={{ base: '70px', md: '20px' }}
    >
      <Box
        maxW="480px"
        w="100%"
        bg={cardBg}
        borderWidth="1px"
        borderColor={borderColor}
        borderRadius="20px"
        p={{ base: '24px', md: '32px' }}
        textAlign="center"
        boxShadow="0px 4px 24px -8px rgba(8,8,8,0.10)"
      >
        <Flex
          align="center"
          justify="center"
          w="56px"
          h="56px"
          borderRadius="full"
          bg={iconBg}
          color={iconColor}
          mx="auto"
          mb="16px"
        >
          <Icon as={MdLockOutline} w="28px" h="28px" />
        </Flex>

        <Heading as="h1" size="md" color={textColor} mb="8px">
          Поиск пока в закрытом тесте
        </Heading>

        <Text color={mutedColor} fontSize="sm" mb="20px">
          Мы тестируем новый AI-поиск с источниками. Сейчас раздел доступен
          только администраторам.
        </Text>

        <Button
          as={Link}
          href="/chat"
          colorScheme="purple"
          bg="#422AFB"
          _hover={{ bg: '#3622D6' }}
          rightIcon={<Icon as={MdArrowForward} />}
          w={{ base: '100%', md: 'auto' }}
        >
          Вернуться в чат
        </Button>
      </Box>
    </Flex>
  );
}
