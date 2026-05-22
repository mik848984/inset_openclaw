import {
  Box,
  Button,
  Flex,
  Heading,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import React, { useContext } from 'react';
import { useUser } from '@/utils/hooks/useUser';
import { ModalContext } from '@/contexts/ModalContext';

interface CardPayBalanceProps {
  price: number;
  heading: string;
  itemId: string;
  showButtonInModal: boolean;
  style?: any;
}

// ── Apple typography ──────────────────────────────────────────────
const FONT_APPLE_TEXT = `'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif`;
const FONT_APPLE_DISPLAY = `'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif`;

function CardPayBalance({
  heading,
  price,
  itemId,
  showButtonInModal,
  style,
}: CardPayBalanceProps) {
  const { isAnonymous } = useUser(false);

  const { setAuthorizationModalOpen, setItemId, setPaymentModalOpen } =
    useContext(ModalContext);

  // ── Same design tokens ─────────────────────────────────────────
  const surfaceGlass = useColorModeValue(
    'rgba(255,255,255,0.62)',
    'rgba(13,18,34,0.62)',
  );
  const surfaceGlassHover = useColorModeValue(
    'rgba(255,255,255,0.74)',
    'rgba(13,18,34,0.74)',
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
    'inset 0 1px 0 rgba(255,255,255,0.62), 0 1px 2px rgba(0,0,0,0.03), 0 12px 32px rgba(31,38,70,0.05)',
    'inset 0 1px 0 rgba(255,255,255,0.10), 0 1px 2px rgba(0,0,0,0.12), 0 12px 32px rgba(0,0,0,0.30)',
  );
  const cardShadowHover = useColorModeValue(
    'inset 0 1px 0 rgba(255,255,255,0.62), 0 6px 16px rgba(0,0,0,0.06), 0 18px 40px rgba(31,38,70,0.10)',
    'inset 0 1px 0 rgba(255,255,255,0.10), 0 6px 16px rgba(0,0,0,0.18), 0 18px 40px rgba(0,0,0,0.35)',
  );

  const handlePurchase = () => {
    if (isAnonymous) {
      setAuthorizationModalOpen!(true);
      return;
    }

    setItemId!(itemId);
    setPaymentModalOpen!(true);
  };

  // Allow external style override (preserve original behaviour)
  const externalStyle = style || {};

  return (
    <Box
      bg={surfaceGlass}
      backdropFilter="blur(22px) saturate(180%)"
      border="1px solid"
      borderColor={borderGlass}
      borderRadius={{ base: '20px', md: '24px' }}
      boxShadow={cardShadow}
      p={{ base: '18px', md: '22px' }}
      width="100%"
      maxWidth="100%"
      minWidth={0}
      cursor={showButtonInModal ? 'pointer' : 'default'}
      onClick={showButtonInModal ? handlePurchase : undefined}
      transition="background 0.18s ease, border-color 0.18s ease, box-shadow 0.22s ease"
      fontFamily={FONT_APPLE_TEXT}
      _hover={
        showButtonInModal
          ? {
              bg: surfaceGlassHover,
              borderColor: 'rgba(0,102,204,0.28)',
              boxShadow: cardShadowHover,
            }
          : undefined
      }
      sx={{
        WebkitBackdropFilter: 'blur(22px) saturate(180%)',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: '0',
          borderRadius: 'inherit',
          pointerEvents: 'none',
          background:
            'linear-gradient(180deg, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0) 60%)',
          opacity: 0.85,
          zIndex: 0,
        },
        '& > *': { position: 'relative', zIndex: 1 },
        ...externalStyle,
      }}
    >
      <Flex
        direction="column"
        gap="14px"
        width="100%"
        minWidth={0}
      >
        <Box minWidth={0}>
          {/* Section eyebrow */}
          <Text
            fontSize="11px"
            fontWeight="600"
            letterSpacing="0.6px"
            textTransform="uppercase"
            color={textSecondary}
            mb="6px"
          >
            Пакет
          </Text>
          {/* Heading (product name) */}
          <Heading
            fontFamily={FONT_APPLE_DISPLAY}
            fontSize={{ base: '17px', md: '18px' }}
            fontWeight="600"
            letterSpacing="-0.3px"
            lineHeight="1.3"
            color={textPrimary}
            wordBreak="break-word"
            mb="10px"
          >
            {heading}
          </Heading>

          {/* Price — big and clean */}
          <Flex align="baseline" gap="4px">
            <Heading
              fontFamily={FONT_APPLE_DISPLAY}
              fontSize={{ base: '28px', md: '32px' }}
              fontWeight="600"
              letterSpacing="-0.6px"
              lineHeight="1.05"
              color={textPrimary}
            >
              {price} ₽
            </Heading>
            <Text
              fontSize={{ base: '13px', md: '14px' }}
              color={textSecondary}
              letterSpacing="-0.1px"
            >
              разовый платёж
            </Text>
          </Flex>
        </Box>

        {/* CTA */}
        {showButtonInModal && (
          <Button
            w="100%"
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              handlePurchase();
            }}
            bg={accentBlue}
            color="white"
            borderRadius="9999px"
            h={{ base: '44px', md: '46px' }}
            px="22px"
            fontFamily={FONT_APPLE_TEXT}
            fontWeight="500"
            fontSize="15px"
            letterSpacing="-0.2px"
            _hover={{ bg: accentBlueHover }}
            _active={{ transform: 'scale(0.97)' }}
            transition="background 0.16s ease, transform 0.12s ease"
            boxShadow="0 1px 2px rgba(0,0,0,0.06)"
          >
            Пополнить
          </Button>
        )}
      </Flex>
    </Box>
  );
}

export default CardPayBalance;
