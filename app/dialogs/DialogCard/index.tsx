'use client';

import {
  Box,
  Flex,
  Heading,
  Icon,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { FaRegClock } from 'react-icons/fa';
import { TbMessageCircle } from 'react-icons/tb';
import React, { useContext } from 'react';
import { useRouter } from 'next/navigation';
import { ChatAiContext } from '@/contexts/ChatAiContext';
import { messagesService } from '@/services/ui/MessagesService';
import {
  stripSourcesMarker,
  stripThinkBlocks,
} from '@/utils/normalizeModelOutput';

// ── Apple typography ──────────────────────────────────────────────
const FONT_APPLE_TEXT = `'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif`;
const FONT_APPLE_DISPLAY = `'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif`;

interface IProps {
  id: string;
  lastMessage: string;
  updatedAt: Date;
}

function DialogCard({ id, lastMessage, updatedAt }: IProps) {
  const router = useRouter();
  const { setMessages } = useContext(ChatAiContext);

  // CRITICAL: lastMessage в БД может содержать сырой `__IISET_SOURCES__=…`
  // маркер из web-search ответа. На карточке он не должен светиться.
  // Чистим markers + think-блоки перед рендером.
  const safeLastMessage = stripThinkBlocks(
    stripSourcesMarker(lastMessage || ''),
  )
    .replace(/^\s+/, '')
    .slice(0, 320);

  // ── Apple Liquid Glass tokens ───────────────────────────────────
  const cardBg = useColorModeValue(
    'rgba(255,255,255,0.72)',
    'rgba(13,18,34,0.62)',
  );
  const cardBgHover = useColorModeValue(
    'rgba(255,255,255,0.86)',
    'rgba(13,18,34,0.78)',
  );
  const borderGlass = useColorModeValue(
    'rgba(0,0,0,0.06)',
    'rgba(255,255,255,0.10)',
  );
  const borderHover = useColorModeValue(
    'rgba(0,102,204,0.28)',
    'rgba(41,151,255,0.34)',
  );
  const cardShadow = useColorModeValue(
    'inset 0 1px 0 rgba(255,255,255,0.65), 0 1px 2px rgba(0,0,0,0.03), 0 18px 50px rgba(15,23,42,0.06)',
    'inset 0 1px 0 rgba(255,255,255,0.10), 0 1px 2px rgba(0,0,0,0.14), 0 18px 50px rgba(0,0,0,0.24)',
  );
  const cardShadowHover = useColorModeValue(
    'inset 0 1px 0 rgba(255,255,255,0.65), 0 6px 16px rgba(0,0,0,0.06), 0 28px 60px rgba(15,23,42,0.10)',
    'inset 0 1px 0 rgba(255,255,255,0.10), 0 6px 16px rgba(0,0,0,0.20), 0 28px 60px rgba(0,0,0,0.34)',
  );
  const iconWellBg = useColorModeValue(
    'rgba(0,102,204,0.07)',
    'rgba(41,151,255,0.14)',
  );
  const iconWellBorder = useColorModeValue(
    'rgba(255,255,255,0.62)',
    'rgba(255,255,255,0.10)',
  );
  const titleColor = useColorModeValue('#1d1d1f', '#f5f5f7');
  const labelColor = useColorModeValue('#6e6e73', 'rgba(245,245,247,0.62)');
  const metaColor = useColorModeValue('#6e6e73', 'rgba(245,245,247,0.65)');
  const accentBlue = useColorModeValue('#0066cc', '#2997ff');

  // ── handleOpenDialog — preserves the original logic 1:1 ────────
  const handleOpenDialog = async () => {
    messagesService.currentDialog = id;
    const { messages } = await messagesService.getDialog();

    setMessages!(messages);

    router.push('/chat');
  };

  return (
    <Box
      role="button"
      tabIndex={0}
      onClick={handleOpenDialog}
      onKeyDown={(e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleOpenDialog();
        }
      }}
      cursor="pointer"
      h="100%"
      minH={{ base: '170px', md: '190px' }}
      bg={cardBg}
      backdropFilter="blur(20px) saturate(180%)"
      border="1px solid"
      borderColor={borderGlass}
      boxShadow={cardShadow}
      borderRadius={{ base: '24px', md: '28px' }}
      p={{ base: '20px', md: '22px' }}
      display="flex"
      flexDirection="column"
      transition="background 0.2s ease, border-color 0.2s ease, transform 0.2s ease, box-shadow 0.22s ease"
      fontFamily={FONT_APPLE_TEXT}
      width="100%"
      maxWidth="100%"
      minWidth={0}
      sx={{ WebkitBackdropFilter: 'blur(20px) saturate(180%)' }}
      _hover={{
        bg: cardBgHover,
        borderColor: borderHover,
        transform: 'translateY(-2px)',
        boxShadow: cardShadowHover,
      }}
      _active={{ transform: 'translateY(0)' }}
      _focusVisible={{
        outline: '2px solid',
        outlineColor: accentBlue,
        outlineOffset: '2px',
      }}
    >
      {/* Top row: icon well + tiny "Диалог" label */}
      <Flex align="center" gap="10px" mb={{ base: '12px', md: '14px' }}>
        <Flex
          align="center"
          justify="center"
          w={{ base: '34px', md: '36px' }}
          h={{ base: '34px', md: '36px' }}
          minW={{ base: '34px', md: '36px' }}
          borderRadius="12px"
          bg={iconWellBg}
          border="1px solid"
          borderColor={iconWellBorder}
          flexShrink={0}
        >
          <Icon
            as={TbMessageCircle}
            w={{ base: '17px', md: '18px' }}
            h={{ base: '17px', md: '18px' }}
            color={accentBlue}
          />
        </Flex>
        <Text
          fontFamily={FONT_APPLE_TEXT}
          fontSize="11px"
          fontWeight="600"
          letterSpacing="0.5px"
          textTransform="uppercase"
          color={labelColor}
        >
          Диалог
        </Text>
      </Flex>

      {/* Last message — main title */}
      <Heading
        as="h2"
        fontFamily={FONT_APPLE_DISPLAY}
        fontSize={{ base: '17px', md: '19px' }}
        fontWeight="600"
        lineHeight="1.35"
        letterSpacing="-0.2px"
        color={titleColor}
        noOfLines={3}
        wordBreak="break-word"
        flex="1 1 auto"
      >
        {safeLastMessage}
      </Heading>

      {/* Bottom row: clock + date + Apple blue link */}
      <Flex
        mt={{ base: '14px', md: '16px' }}
        align="center"
        justify="space-between"
        gap="10px"
        flexWrap="wrap"
        rowGap="8px"
      >
        <Flex align="center" gap="6px" color={metaColor}>
          <Icon as={FaRegClock} w="13px" h="13px" />
          <Text
            fontFamily={FONT_APPLE_TEXT}
            fontSize="13px"
            letterSpacing="-0.1px"
          >
            {new Intl.DateTimeFormat('ru', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: 'numeric',
              minute: 'numeric',
            }).format(updatedAt)}
          </Text>
        </Flex>
        <Text
          fontFamily={FONT_APPLE_TEXT}
          fontSize="13px"
          fontWeight="600"
          letterSpacing="-0.1px"
          color={accentBlue}
        >
          Открыть чат →
        </Text>
      </Flex>
    </Box>
  );
}

export default DialogCard;
