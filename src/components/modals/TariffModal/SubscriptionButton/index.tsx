import { Button, Icon, useColorModeValue } from '@chakra-ui/react';
import { TbCreditCardOff, TbCreditCardPay } from 'react-icons/tb';
import React from 'react';
import { useUser } from '@/utils/hooks/useUser';
import { paymentService } from '@/services/ui/PaymentService';

// ── Apple typography ──────────────────────────────────────────────
const FONT_APPLE_TEXT = `'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif`;

function SubscriptionButton() {
  const { user, refreshUser } = useUser(false);

  const updateSubscription = async () => {
    await paymentService.subscription(
      user?.subscription?.status === 'cancel' ? 'active' : 'cancel',
    );

    await refreshUser();
  };

  // ── Tokens — calm, not aggressive ───────────────────────────────
  const greenColor = useColorModeValue('#15803d', '#22c55e');
  const greenBg = useColorModeValue(
    'rgba(34,197,94,0.08)',
    'rgba(34,197,94,0.14)',
  );
  const greenBgHover = useColorModeValue(
    'rgba(34,197,94,0.14)',
    'rgba(34,197,94,0.20)',
  );
  const greenBorder = useColorModeValue(
    'rgba(34,197,94,0.32)',
    'rgba(34,197,94,0.40)',
  );

  const redColor = useColorModeValue('#b91c1c', '#f87171');
  const redBg = useColorModeValue(
    'rgba(239,68,68,0.06)',
    'rgba(239,68,68,0.12)',
  );
  const redBgHover = useColorModeValue(
    'rgba(239,68,68,0.12)',
    'rgba(239,68,68,0.18)',
  );
  const redBorder = useColorModeValue(
    'rgba(239,68,68,0.28)',
    'rgba(239,68,68,0.36)',
  );

  if (!user?.subscription?.grade) return null;
  if (user?.subscription?.grade === 'Free') return null;

  if (user?.subscription?.status === 'cancel') {
    return (
      <Button
        onClick={updateSubscription}
        w={{ base: '100%', md: 'auto' }}
        bg={greenBg}
        color={greenColor}
        borderRadius="9999px"
        border="1px solid"
        borderColor={greenBorder}
        h={{ base: '42px', md: '44px' }}
        px="20px"
        fontFamily={FONT_APPLE_TEXT}
        fontWeight="500"
        fontSize="14px"
        letterSpacing="-0.15px"
        _hover={{ bg: greenBgHover, borderColor: greenColor }}
        _active={{ transform: 'scale(0.97)' }}
        transition="background 0.16s ease, border-color 0.16s ease, transform 0.12s ease"
        leftIcon={<Icon w="17px" h="17px" as={TbCreditCardPay} />}
      >
        Включить подписку
      </Button>
    );
  }

  return (
    <Button
      onClick={updateSubscription}
      w={{ base: '100%', md: 'auto' }}
      bg={redBg}
      color={redColor}
      borderRadius="9999px"
      border="1px solid"
      borderColor={redBorder}
      h={{ base: '42px', md: '44px' }}
      px="20px"
      fontFamily={FONT_APPLE_TEXT}
      fontWeight="500"
      fontSize="14px"
      letterSpacing="-0.15px"
      _hover={{ bg: redBgHover, borderColor: redColor }}
      _active={{ transform: 'scale(0.97)' }}
      transition="background 0.16s ease, border-color 0.16s ease, transform 0.12s ease"
      leftIcon={<Icon w="17px" h="17px" as={TbCreditCardOff} />}
    >
      Отменить подписку
    </Button>
  );
}

export default SubscriptionButton;
