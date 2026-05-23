import {
  Box,
  Flex,
  Grid,
  Heading,
  IconButton,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { CloseIcon } from '@chakra-ui/icons';
import React, { useContext, useEffect, useRef } from 'react';
import CardTariff from '@/components/modals/TariffModal/CardTariff';
import Modal from '../Modal/Modal';
import { getExpiredDate, getTariffName } from '../../../../app/profile/page';
import { useUser } from '@/utils/hooks/useUser';
import SubscriptionButton from '@/components/modals/TariffModal/SubscriptionButton';
import { ModalContext } from '@/contexts/ModalContext';
import { trackGoal } from '@/utils/metrics';

interface IProps {
  open: boolean;
  onClose: () => void;
}

// ── Apple typography ──────────────────────────────────────────────
const FONT_APPLE_TEXT = `'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif`;
const FONT_APPLE_DISPLAY = `'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif`;

function TariffModal({ open, onClose }: IProps) {
  const { user } = useUser(false);

  const { tariffModalData } = useContext(ModalContext);

  // ── Design tokens shared with /profile ─────────────────────────
  const surfaceGlass = useColorModeValue(
    'rgba(255,255,255,0.62)',
    'rgba(13,18,34,0.62)',
  );
  const borderGlass = useColorModeValue(
    'rgba(255,255,255,0.68)',
    'rgba(255,255,255,0.14)',
  );
  const borderSubtle = useColorModeValue(
    'rgba(0,0,0,0.08)',
    'rgba(255,255,255,0.10)',
  );
  const textPrimary = useColorModeValue('#1d1d1f', '#f5f5f7');
  const textSecondary = useColorModeValue(
    '#6e6e73',
    'rgba(245,245,247,0.68)',
  );
  const accentBlue = useColorModeValue('#0066cc', '#2997ff');
  const closeHoverBg = useColorModeValue(
    'rgba(0,0,0,0.05)',
    'rgba(255,255,255,0.10)',
  );
  const infoStripBg = useColorModeValue(
    'rgba(0,102,204,0.06)',
    'rgba(41,151,255,0.10)',
  );
  const infoStripBorder = useColorModeValue(
    'rgba(0,102,204,0.18)',
    'rgba(41,151,255,0.22)',
  );

  const status = user?.subscription?.status;
  const grade = user?.subscription?.grade;
  const isActive = grade === 'Premium' || grade === 'Medium' || grade === 'Start';
  const isCancelled = status === 'cancel';
  const statusBadgeBg = isCancelled
    ? useColorModeValue('rgba(245,158,11,0.12)', 'rgba(245,158,11,0.18)')
    : isActive
    ? useColorModeValue('rgba(34,197,94,0.12)', 'rgba(34,197,94,0.18)')
    : useColorModeValue('rgba(0,0,0,0.06)', 'rgba(255,255,255,0.06)');
  const statusBadgeColor = isCancelled
    ? useColorModeValue('#b45309', '#f59e0b')
    : isActive
    ? useColorModeValue('#15803d', '#22c55e')
    : textSecondary;
  const statusBadgeBorder = isCancelled
    ? 'rgba(245,158,11,0.32)'
    : isActive
    ? 'rgba(34,197,94,0.32)'
    : 'rgba(0,0,0,0.08)';

  // Track paywall view
  const hasTrackedOpen = useRef(false);
  useEffect(() => {
    if (open && !hasTrackedOpen.current) {
      hasTrackedOpen.current = true;
      trackGoal('paywall_viewed', {
        grade: user?.subscription?.grade || 'none',
        is_anonymous: !user,
      });
    }
    if (!open) {
      hasTrackedOpen.current = false;
    }
  }, [open, user]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      headerProps={
        <Grid
          px={{ base: '18px', md: '28px' }}
          py={{ base: '16px', md: '20px' }}
          templateColumns="1fr auto"
          alignItems="center"
          gap="12px"
          width="100%"
          maxWidth="100%"
          minWidth={0}
        >
          <Flex
            direction="column"
            gap="4px"
            minWidth={0}
            fontFamily={FONT_APPLE_TEXT}
          >
            <Heading
              fontFamily={FONT_APPLE_DISPLAY}
              fontSize={{ base: '20px', md: '24px' }}
              fontWeight="600"
              letterSpacing="-0.4px"
              lineHeight="1.2"
              color={textPrimary}
            >
              Управление подпиской
            </Heading>
            <Text
              fontSize={{ base: '13px', md: '14px' }}
              fontWeight="400"
              color={textSecondary}
              letterSpacing="-0.1px"
              lineHeight="1.35"
            >
              Выберите подходящий тариф для работы с ИИСетью
            </Text>
          </Flex>
          <IconButton
            size="sm"
            variant="ghost"
            aria-label="Закрыть"
            onClick={onClose}
            borderRadius="9999px"
            w="32px"
            h="32px"
            minW="32px"
            flexShrink={0}
            _hover={{ bg: closeHoverBg }}
          >
            <CloseIcon w="10px" h="10px" />
          </IconButton>
        </Grid>
      }
      contentProps={
        <Box
          px={{ base: '14px', md: '24px' }}
          py="4px"
          pb={{
            base: 'calc(24px + env(safe-area-inset-bottom))',
            md: '32px',
          }}
          fontFamily={FONT_APPLE_TEXT}
          width="100%"
          maxWidth="100%"
          minWidth={0}
        >
          {/* Info strip — replaces standard Chakra Alert */}
          <Flex
            align="center"
            gap="10px"
            px={{ base: '14px', md: '16px' }}
            py={{ base: '12px', md: '12px' }}
            bg={infoStripBg}
            border="1px solid"
            borderColor={infoStripBorder}
            borderRadius="14px"
            mb={{ base: '6px', md: '8px' }}
          >
            <Box
              w="6px"
              h="6px"
              borderRadius="50%"
              bg={accentBlue}
              flexShrink={0}
            />
            <Text
              fontSize={{ base: '13px', md: '14px' }}
              color={textPrimary}
              letterSpacing="-0.1px"
              lineHeight="1.5"
            >
              <Text as="span" fontWeight="600">
                1 страница
              </Text>{' '}
              ≈{' '}
              <Text as="span" fontWeight="600">
                250 слов
              </Text>{' '}
              сгенерированного текста
            </Text>
          </Flex>

          {/* Social proof strip */}
          <Flex
            align="center"
            gap="10px"
            px={{ base: '14px', md: '16px' }}
            py={{ base: '12px', md: '12px' }}
            bg={useColorModeValue(
              'rgba(34,197,94,0.06)',
              'rgba(34,197,94,0.10)',
            )}
            border="1px solid"
            borderColor={useColorModeValue(
              'rgba(34,197,94,0.18)',
              'rgba(34,197,94,0.22)',
            )}
            borderRadius="14px"
            mb={{ base: '12px', md: '16px' }}
          >
            <Box
              w="6px"
              h="6px"
              borderRadius="50%"
              bg="green.400"
              flexShrink={0}
            />
            <Text
              fontSize={{ base: '13px', md: '14px' }}
              color={textPrimary}
              letterSpacing="-0.1px"
              lineHeight="1.5"
            >
              <Text as="span" fontWeight="600">
                Более 5 000
              </Text>{' '}
              пользователей уже работают с ИИСетью ежедневно
            </Text>
          </Flex>

          {/* Current subscription block */}
          <Box
            bg={surfaceGlass}
            backdropFilter="blur(22px) saturate(180%)"
            border="1px solid"
            borderColor={borderGlass}
            borderRadius={{ base: '18px', md: '22px' }}
            boxShadow="inset 0 1px 0 rgba(255,255,255,0.55), 0 1px 2px rgba(0,0,0,0.03)"
            p={{ base: '16px', md: '20px' }}
            mb={{ base: '12px', md: '16px' }}
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
                opacity: 0.7,
                zIndex: 0,
              },
              '& > *': { position: 'relative', zIndex: 1 },
            }}
            width="100%"
            minWidth={0}
          >
            <Text
              fontSize="11px"
              fontWeight="600"
              letterSpacing="0.6px"
              textTransform="uppercase"
              color={textSecondary}
              mb="8px"
            >
              Текущая подписка
            </Text>
            <Flex
              direction={{ base: 'column', md: 'row' }}
              justify="space-between"
              align={{ base: 'flex-start', md: 'center' }}
              gap="12px"
            >
              <Flex direction="column" gap="6px" minWidth={0}>
                <Flex align="center" gap="10px" flexWrap="wrap">
                  <Heading
                    fontFamily={FONT_APPLE_DISPLAY}
                    fontSize={{ base: '18px', md: '20px' }}
                    fontWeight="600"
                    letterSpacing="-0.3px"
                    lineHeight="1.2"
                    color={textPrimary}
                  >
                    {grade ? `Тариф «${grade}»` : 'Бесплатный тариф'}
                  </Heading>
                  <Flex
                    align="center"
                    gap="6px"
                    px="10px"
                    py="3px"
                    bg={statusBadgeBg}
                    borderRadius="9999px"
                    border="1px solid"
                    borderColor={statusBadgeBorder}
                  >
                    <Box
                      w="6px"
                      h="6px"
                      borderRadius="50%"
                      bg={statusBadgeColor}
                    />
                    <Text
                      fontSize="12px"
                      fontWeight="600"
                      letterSpacing="-0.1px"
                      color={statusBadgeColor}
                    >
                      {getTariffName(status, grade)}
                    </Text>
                  </Flex>
                </Flex>
                <Text
                  fontSize={{ base: '13px', md: '14px' }}
                  color={textSecondary}
                  letterSpacing="-0.1px"
                >
                  Действует до:{' '}
                  <Text as="span" color={textPrimary} fontWeight="500">
                    {getExpiredDate(user?.subscription?.startDate)}
                  </Text>
                </Text>
              </Flex>
              <Box flexShrink={0} w={{ base: '100%', md: 'auto' }}>
                <SubscriptionButton />
              </Box>
            </Flex>
          </Box>

          {/* Tariff cards */}
          <Flex
            align="center"
            justify="space-between"
            mb={{ base: '8px', md: '10px' }}
            ml="2px"
            flexWrap="wrap"
            gap="4px"
          >
            <Text
              fontSize="11px"
              fontWeight="600"
              letterSpacing="0.6px"
              textTransform="uppercase"
              color={textSecondary}
            >
              Доступные тарифы
            </Text>
            <Text
              fontSize={{ base: '12px', md: '13px' }}
              color={textSecondary}
              letterSpacing="-0.1px"
            >
              Оформление занимает{' '}
              <Text as="span" fontWeight="600" color={accentBlue}>
                20 секунд
              </Text>
            </Text>
          </Flex>
          <Grid
            gap={{ base: '10px', md: '12px' }}
            width="100%"
            minWidth={0}
          >
            {tariffModalData &&
              tariffModalData.length > 0 &&
              tariffModalData.map(
                (item: {
                  grade: string;
                  price: number;
                  description: string;
                }) => (
                  <CardTariff
                    key={item.grade}
                    grade={item.grade}
                    price={Math.floor(item.price)}
                    heading={item.grade}
                    description={item.description}
                  />
                ),
              )}
          </Grid>
        </Box>
      }
    ></Modal>
  );
}

export default TariffModal;
