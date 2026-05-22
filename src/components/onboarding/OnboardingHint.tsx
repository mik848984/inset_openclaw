'use client';

import {
  Box,
  Button,
  Flex,
  IconButton,
  Icon,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { CloseIcon } from '@chakra-ui/icons';
import { MdAutoAwesome } from 'react-icons/md';
import { LuImages } from 'react-icons/lu';
import { TbWorldSearch } from 'react-icons/tb';
import React from 'react';

// ── Apple typography ──────────────────────────────────────────────
const FONT_APPLE_TEXT = `'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif`;
const FONT_APPLE_DISPLAY = `'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif`;

export type HintType = 'model' | 'image' | 'browsing';

interface OnboardingHintProps {
  type?: HintType;
  title?: string;
  description?: string;
  actionLabel?: string;
  // Backward-compat fallback — was the only prop in the legacy version
  text?: string;
  onClose: () => void;
  onAction?: () => void;
}

function getTypeIcon(type?: HintType) {
  if (type === 'image') return LuImages;
  if (type === 'browsing') return TbWorldSearch;
  return MdAutoAwesome;
}

export default function OnboardingHint(props: OnboardingHintProps) {
  const {
    type,
    title,
    description,
    actionLabel,
    text,
    onClose,
    onAction,
  } = props;

  // Fallback: legacy { text } → put it into the title slot
  const resolvedTitle = title ?? text ?? '';
  const resolvedDescription = description ?? '';

  // ── Apple Liquid Glass tokens ──────────────────────────────────
  const cardBg = useColorModeValue(
    'rgba(255,255,255,0.80)',
    'rgba(13,18,34,0.78)',
  );
  const borderGlass = useColorModeValue(
    'rgba(0,0,0,0.08)',
    'rgba(255,255,255,0.12)',
  );
  const cardShadow = useColorModeValue(
    'inset 0 1px 0 rgba(255,255,255,0.72), 0 20px 60px rgba(15,23,42,0.12)',
    'inset 0 1px 0 rgba(255,255,255,0.10), 0 20px 60px rgba(0,0,0,0.36)',
  );
  const iconWellBg = useColorModeValue(
    'rgba(0,102,204,0.08)',
    'rgba(41,151,255,0.14)',
  );
  const iconWellBorder = useColorModeValue(
    'rgba(255,255,255,0.62)',
    'rgba(255,255,255,0.10)',
  );
  const titleColor = useColorModeValue('#1d1d1f', '#f5f5f7');
  const descColor = useColorModeValue('#3c3c43', 'rgba(245,245,247,0.74)');
  const accentBlue = useColorModeValue('#0066cc', '#2997ff');
  const accentBlueHover = useColorModeValue('#0071e3', '#5ac8ff');
  const closeBg = useColorModeValue(
    'rgba(0,0,0,0.04)',
    'rgba(255,255,255,0.06)',
  );
  const closeHoverBg = useColorModeValue(
    'rgba(0,0,0,0.08)',
    'rgba(255,255,255,0.12)',
  );
  const closeColor = useColorModeValue('#6e6e73', 'rgba(245,245,247,0.62)');

  const HintIcon = getTypeIcon(type);
  const finalLabel = actionLabel ?? 'Понятно';

  return (
    <Box
      role="status"
      aria-live="polite"
      position="fixed"
      zIndex={1200}
      right={{ base: '16px', md: '32px' }}
      left={{ base: '16px', md: 'auto' }}
      bottom={{
        base: 'calc(128px + env(safe-area-inset-bottom))',
        md: '132px',
      }}
      maxW={{ base: 'calc(100vw - 32px)', md: '400px' }}
      width={{ base: 'auto', md: '400px' }}
      bg={cardBg}
      backdropFilter="blur(22px) saturate(180%)"
      border="1px solid"
      borderColor={borderGlass}
      boxShadow={cardShadow}
      borderRadius="26px"
      p="16px"
      fontFamily={FONT_APPLE_TEXT}
      sx={{
        WebkitBackdropFilter: 'blur(22px) saturate(180%)',
        '@keyframes iisetHintIn': {
          from: { opacity: 0, transform: 'translateY(8px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
        animation: 'iisetHintIn 180ms ease-out both',
      }}
    >
      {/* Top row: icon well + content + close */}
      <Flex align="flex-start" gap="12px">
        {/* Icon well */}
        <Flex
          align="center"
          justify="center"
          w="40px"
          h="40px"
          minW="40px"
          borderRadius="14px"
          bg={iconWellBg}
          border="1px solid"
          borderColor={iconWellBorder}
          flexShrink={0}
          mt="1px"
        >
          <Icon as={HintIcon} w="18px" h="18px" color={accentBlue} />
        </Flex>

        {/* Content */}
        <Flex direction="column" flex="1" minW={0}>
          {resolvedTitle && (
            <Text
              fontFamily={FONT_APPLE_DISPLAY}
              fontSize={{ base: '15px', md: '16px' }}
              fontWeight="600"
              lineHeight="1.3"
              letterSpacing="-0.2px"
              color={titleColor}
              wordBreak="break-word"
            >
              {resolvedTitle}
            </Text>
          )}
          {resolvedDescription && (
            <Text
              mt="4px"
              fontFamily={FONT_APPLE_TEXT}
              fontSize={{ base: '13px', md: '14px' }}
              lineHeight="1.5"
              letterSpacing="-0.1px"
              color={descColor}
              wordBreak="break-word"
            >
              {resolvedDescription}
            </Text>
          )}
        </Flex>

        {/* Close */}
        <IconButton
          aria-label="Закрыть подсказку"
          icon={<CloseIcon boxSize="9px" />}
          size="sm"
          variant="ghost"
          w="30px"
          h="30px"
          minW="30px"
          borderRadius="9999px"
          bg={closeBg}
          color={closeColor}
          flexShrink={0}
          _hover={{ bg: closeHoverBg }}
          _active={{ transform: 'scale(0.94)' }}
          transition="background 0.14s ease, transform 0.12s ease"
          onClick={onClose}
        />
      </Flex>

      {/* Action button */}
      <Flex mt="12px" justify="flex-end">
        <Button
          onClick={onAction ?? onClose}
          bg={accentBlue}
          color="white"
          borderRadius="9999px"
          h="34px"
          px="18px"
          fontFamily={FONT_APPLE_TEXT}
          fontSize="13px"
          fontWeight="500"
          letterSpacing="-0.15px"
          _hover={{ bg: accentBlueHover }}
          _active={{ transform: 'scale(0.96)' }}
          transition="background 0.16s ease, transform 0.12s ease"
          boxShadow="0 1px 2px rgba(0,0,0,0.06)"
        >
          {finalLabel}
        </Button>
      </Flex>
    </Box>
  );
}
