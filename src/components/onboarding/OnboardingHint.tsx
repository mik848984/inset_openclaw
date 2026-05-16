'use client';

import { Box, Flex, Text, IconButton, useColorMode } from '@chakra-ui/react';
import { CloseIcon } from '@chakra-ui/icons';
import React from 'react';

interface OnboardingHintProps {
  text: string;
  onClose: () => void;
}

export default function OnboardingHint({ text, onClose }: OnboardingHintProps) {
  const { colorMode } = useColorMode();

  const bg =
    colorMode === 'light'
      ? 'rgba(255, 255, 255, 0.96)'
      : 'rgba(15, 23, 42, 0.96)';
  const color = colorMode === 'light' ? 'gray.900' : 'whiteAlpha.900';
  const borderColor =
    colorMode === 'light' ? 'blackAlpha.100' : 'whiteAlpha.300';
  const shadow =
    colorMode === 'light'
      ? '0 18px 40px rgba(15, 23, 42, 0.18)'
      : '0 18px 40px rgba(0, 0, 0, 0.6)';

  return (
    <Box
      position="fixed"
      bottom={{
        base: 'max(90px, env(safe-area-inset-bottom) + 56px)',
        md: '40px',
      }}
      left="50%"
      transform="translateX(-50%)"
      zIndex={40}
      px={{ base: 4, md: 5 }}
      py={{ base: 3, md: 3 }}
      maxW={{ base: '90vw', md: '360px' }}
      borderRadius="xl"
      bg={bg}
      color={color}
      borderWidth="1px"
      borderColor={borderColor}
      boxShadow={shadow}
      backdropFilter="blur(14px)"
      display="flex"
      alignItems="center"
      gap={3}
      role="status"
      aria-live="polite"
    >
      <Flex direction="column" flex="1" minW={0}>
        <Text
          fontSize={{ base: '13px', md: '14px' }}
          fontWeight="medium"
          noOfLines={3}
          wordBreak="break-word"
        >
          {text}
        </Text>
      </Flex>
      <IconButton
        aria-label="Закрыть подсказку"
        icon={<CloseIcon boxSize={3} />}
        size="sm"
        variant="ghost"
        minW="32px"
        h="32px"
        onClick={onClose}
        _hover={{ bg: 'blackAlpha.50', opacity: 1 }}
        _active={{ bg: 'blackAlpha.100' }}
      />
    </Box>
  );
}
