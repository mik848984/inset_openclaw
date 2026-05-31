import {
  Box,
  Button,
  Flex,
  Heading,
  Icon,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { LiaBrainSolid } from 'react-icons/lia';
import React, { useContext } from 'react';
import { ModalContext } from '@/contexts/ModalContext';
import { useUser } from '@/utils/hooks/useUser';
import { trackGoal } from '@/utils/metrics';

interface IProps {
  price: number;
  grade: string;
  heading: string;
  description: any;
  key?: string;
}

// ── Apple typography ──────────────────────────────────────────────
const FONT_APPLE_TEXT = `'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif`;
const FONT_APPLE_DISPLAY = `'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif`;

function CardTariff({ price, grade, heading, description }: IProps) {
  const { isAnonymous } = useUser(false);

  const { setPaymentModalOpen, setGrade, setAuthorizationModalOpen } =
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
  const iconTint = useColorModeValue(
    'rgba(0,102,204,0.10)',
    'rgba(41,151,255,0.16)',
  );

  const onCreatePayment = () => {
    if (isAnonymous) {
      trackGoal('paywall_auth_required', { grade, price });
      setAuthorizationModalOpen!(true);
      return;
    }

    setGrade!(grade);
    trackGoal('paywall_subscribe_click', { grade, price });
    setPaymentModalOpen!(true);
    trackGoal('checkout_start', { grade, price });
  };

  return (
    <Box
      cursor="pointer"
      onClick={onCreatePayment}
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
      transition="background 0.18s ease, border-color 0.18s ease, transform 0.18s ease, box-shadow 0.22s ease"
      fontFamily={FONT_APPLE_TEXT}
      _hover={{
        bg: surfaceGlassHover,
        borderColor: 'rgba(0,102,204,0.28)',
        boxShadow: cardShadowHover,
      }}
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
      }}
    >
      <Flex
        direction={{ base: 'column', md: 'row' }}
        align={{ base: 'flex-start', md: 'center' }}
        justify="space-between"
        gap={{ base: '14px', md: '20px' }}
        width="100%"
      >
        <Flex direction="column" minWidth={0} flex="1 1 0" gap="6px">
          {/* Tariff name */}
          <Text
            fontSize="11px"
            fontWeight="600"
            letterSpacing="0.6px"
            textTransform="uppercase"
            color={textSecondary}
          >
            Тариф
          </Text>
          <Heading
            fontFamily={FONT_APPLE_DISPLAY}
            fontSize={{ base: '20px', md: '22px' }}
            fontWeight="600"
            letterSpacing="-0.4px"
            lineHeight="1.2"
            color={textPrimary}
            wordBreak="break-word"
          >
            {heading}
          </Heading>

          {/* Price — large, Apple-tight */}
          <Flex align="baseline" gap="4px" mt="2px">
            <Heading
              fontFamily={FONT_APPLE_DISPLAY}
              fontSize={{ base: '30px', md: '36px' }}
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
              / месяц
            </Text>
          </Flex>

          {/* Per‑day anchor to reduce price friction */}
          <Text
            fontSize={{ base: '13px', md: '14px' }}
            fontWeight="500"
            letterSpacing="-0.1px"
            lineHeight="1.4"
            color="green.500"
            mt="2px"
          >
            ≈ {Math.ceil(price / 30)} ₽ в день
          </Text>

          {/* Value reframe — less than a coffee */}
          <Text
            fontSize={{ base: '12px', md: '13px' }}
            letterSpacing="-0.1px"
            lineHeight="1.4"
            color={textSecondary}
            mt="4px"
          >
            Меньше стоимости кофе — безлимитный ИИ на целый месяц
          </Text>

          {/* Description with brain icon */}
          <Flex align="flex-start" gap="8px" mt="6px">
            <Flex
              w="22px"
              h="22px"
              borderRadius="6px"
              bg={iconTint}
              align="center"
              justify="center"
              flexShrink={0}
              mt="1px"
            >
              <Icon as={LiaBrainSolid} w="13px" h="13px" color={accentBlue} />
            </Flex>
            <Box
              fontSize={{ base: '14px', md: '15px' }}
              color={textSecondary}
              lineHeight="1.5"
              letterSpacing="-0.1px"
              flex="1 1 0"
              minWidth={0}
            >
              {description}
            </Box>
          </Flex>
        </Flex>

        {/* CTA + trust micro-copy */}
        <Flex direction="column" align={{ base: 'center', md: 'flex-end' }} gap="6px" flexShrink={0}>
          <Button
            w={{ base: '100%', md: 'auto' }}
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              onCreatePayment();
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
            _active={{ transform: 'scale(0.96)' }}
            transition="background 0.16s ease, transform 0.12s ease"
            boxShadow="0 1px 2px rgba(0,0,0,0.06)"
          >
            {grade === 'Free' ? 'Продолжить бесплатно' : `Начать за ${price} ₽`}
          </Button>
          <Text
            fontSize="12px"
            color={textSecondary}
            letterSpacing="-0.1px"
            lineHeight="1.4"
            textAlign={{ base: 'center', md: 'right' }}
          >
            Отмена в любой момент · Без скрытых платежей
          </Text>
        </Flex>
      </Flex>
    </Box>
  );
}

export default CardTariff;
