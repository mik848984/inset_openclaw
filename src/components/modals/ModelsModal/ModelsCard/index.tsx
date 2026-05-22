import {
  Box,
  Flex,
  Heading,
  Icon,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { IoCheckmark, IoDocumentAttachOutline } from 'react-icons/io5';
import React from 'react';

interface IProps {
  title: string;
  isChecked: boolean;
  onClick: () => void;
  power: number;
  speed: number;
  attachments?: boolean;
}

// ── Apple typography ──────────────────────────────────────────────
const FONT_APPLE_TEXT = `'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif`;
const FONT_APPLE_DISPLAY = `'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif`;

function ModelsCard({
  title,
  onClick,
  isChecked,
  power,
  speed,
  attachments,
}: IProps) {
  // ── iOS Liquid Glass list-row tokens ──────────────────────────
  const rowGlass = useColorModeValue(
    'rgba(255,255,255,0.55)',
    'rgba(13,18,34,0.55)',
  );
  const rowGlassHover = useColorModeValue(
    'rgba(255,255,255,0.72)',
    'rgba(13,18,34,0.72)',
  );
  const rowSelected = useColorModeValue(
    'rgba(0,102,204,0.08)',
    'rgba(41,151,255,0.12)',
  );
  const rowSelectedHover = useColorModeValue(
    'rgba(0,102,204,0.10)',
    'rgba(41,151,255,0.16)',
  );
  const borderRow = useColorModeValue(
    'rgba(0,0,0,0.07)',
    'rgba(255,255,255,0.08)',
  );
  const borderSelected = 'rgba(0,102,204,0.38)';
  const borderHover = useColorModeValue(
    'rgba(0,102,204,0.22)',
    'rgba(41,151,255,0.30)',
  );
  const textPrimary = useColorModeValue('#1d1d1f', '#f5f5f7');
  const textSecondary = useColorModeValue(
    '#6e6e73',
    'rgba(245,245,247,0.65)',
  );
  const trackBg = useColorModeValue(
    'rgba(0,0,0,0.08)',
    'rgba(255,255,255,0.12)',
  );
  const accentBlue = useColorModeValue('#0066cc', '#2997ff');
  const attachChipBg = useColorModeValue(
    'rgba(0,102,204,0.08)',
    'rgba(41,151,255,0.14)',
  );
  const ringShadow = isChecked
    ? '0 0 0 1px rgba(0,102,204,0.18)'
    : 'none';

  return (
    <Flex
      cursor="pointer"
      onClick={onClick}
      align="center"
      gap={{ base: '10px', md: '14px' }}
      width="100%"
      maxWidth="100%"
      minWidth={0}
      bg={isChecked ? rowSelected : rowGlass}
      backdropFilter="blur(18px) saturate(180%)"
      border="1px solid"
      borderColor={isChecked ? borderSelected : borderRow}
      borderRadius={{ base: '20px', md: '22px' }}
      boxShadow={ringShadow}
      px={{ base: '14px', md: '16px' }}
      py={{ base: '12px', md: '13px' }}
      transition="background 0.14s ease, border-color 0.14s ease, transform 0.12s ease, box-shadow 0.14s ease"
      sx={{
        WebkitBackdropFilter: 'blur(18px) saturate(180%)',
        position: 'relative',
      }}
      _hover={{
        bg: isChecked ? rowSelectedHover : rowGlassHover,
        borderColor: isChecked ? borderSelected : borderHover,
        transform: 'translateY(-1px)',
      }}
      _active={{ transform: 'translateY(0) scale(0.995)' }}
    >
      {/* LEFT: title + metrics + optional attachments chip */}
      <Box flex="1 1 0" minWidth={0}>
        <Heading
          fontFamily={FONT_APPLE_DISPLAY}
          fontSize={{ base: '15px', md: '16px' }}
          fontWeight="600"
          letterSpacing="-0.2px"
          lineHeight="1.25"
          color={textPrimary}
          mb="6px"
          wordBreak="break-word"
          noOfLines={2}
        >
          {title}
        </Heading>

        {/* Inline metrics — capsule bar + value */}
        <Flex
          align="center"
          gap={{ base: '10px', md: '14px' }}
          wrap="wrap"
          rowGap="6px"
        >
          {/* Quality */}
          <Flex align="center" gap="6px" flexShrink={0}>
            <Box
              w={{ base: '44px', md: '52px' }}
              h="3px"
              bg={trackBg}
              borderRadius="9999px"
              overflow="hidden"
              flexShrink={0}
            >
              <Box
                w={`${power}%`}
                h="100%"
                bg={accentBlue}
                borderRadius="9999px"
              />
            </Box>
            <Text
              fontFamily={FONT_APPLE_TEXT}
              fontSize="12px"
              fontWeight="500"
              letterSpacing="-0.1px"
              color={textSecondary}
            >
              Качество {power}
            </Text>
          </Flex>

          {/* Speed */}
          <Flex align="center" gap="6px" flexShrink={0}>
            <Box
              w={{ base: '44px', md: '52px' }}
              h="3px"
              bg={trackBg}
              borderRadius="9999px"
              overflow="hidden"
              flexShrink={0}
            >
              <Box
                w={`${speed}%`}
                h="100%"
                bg={accentBlue}
                borderRadius="9999px"
              />
            </Box>
            <Text
              fontFamily={FONT_APPLE_TEXT}
              fontSize="12px"
              fontWeight="500"
              letterSpacing="-0.1px"
              color={textSecondary}
            >
              Скорость {speed}
            </Text>
          </Flex>

          {/* Attachments chip */}
          {attachments && (
            <Flex
              align="center"
              gap="4px"
              px="8px"
              py="2px"
              bg={attachChipBg}
              borderRadius="9999px"
              flexShrink={0}
            >
              <Icon
                as={IoDocumentAttachOutline}
                w="11px"
                h="11px"
                color={accentBlue}
              />
              <Text
                fontFamily={FONT_APPLE_TEXT}
                fontSize="11px"
                fontWeight="600"
                letterSpacing="-0.05px"
                color={accentBlue}
              >
                Файлы
              </Text>
            </Flex>
          )}
        </Flex>
      </Box>

      {/* RIGHT: iOS-style check indicator */}
      <Flex
        align="center"
        justify="center"
        w="24px"
        h="24px"
        borderRadius="9999px"
        bg={isChecked ? accentBlue : 'transparent'}
        border={isChecked ? 'none' : '1.5px solid'}
        borderColor={isChecked ? undefined : borderRow}
        flexShrink={0}
        transition="background 0.14s ease, border-color 0.14s ease"
      >
        {isChecked && (
          <Icon as={IoCheckmark} w="14px" h="14px" color="white" />
        )}
      </Flex>
    </Flex>
  );
}

export default ModelsCard;
