import {
  Box,
  Flex,
  Grid,
  Heading,
  Icon,
  IconButton,
  SimpleGrid,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { CloseIcon } from '@chakra-ui/icons';
import React, { useContext } from 'react';
import { ModalContext } from '@/contexts/ModalContext';
import Modal from '../Modal/Modal';
import { useUser } from '@/utils/hooks/useUser';
import { trackGoal } from '@/utils/metrics';
import { TbSettingsDollar, TbCreditCardPay } from 'react-icons/tb';
import { MdArrowForward } from 'react-icons/md';

interface IProps {
  open: boolean;
  onClose: () => void;
}

// ── Apple typography ──────────────────────────────────────────────
const FONT_APPLE_TEXT = `'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif`;
const FONT_APPLE_DISPLAY = `'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif`;

/**
 * BillingModal — unified entry point for payments.
 *
 * Не дублирует платежную логику. Показывает две понятные карточки и
 * передаёт фактический flow в существующие модалки:
 *   • «Подписка PRO»   → setTariffModalOpen(true)
 *   • «Пакеты запросов» → setPayBalanceModalOpen(true)
 *
 * Перед открытием соответствующей модалки текущая закрывается, чтобы
 * избежать конфликта оверлеев и сохранить single-modal UX.
 */
function BillingModal({ open, onClose }: IProps) {
  const { user } = useUser(false);
  const { setTariffModalOpen, setPayBalanceModalOpen } =
    useContext(ModalContext);

  // ── Design tokens (Apple glass, Action Blue) ───────────────────────
  const textPrimary = useColorModeValue('#1d1d1f', '#f5f5f7');
  const textBody = useColorModeValue('#2b2b2f', 'rgba(245,245,247,0.86)');
  const textSecondary = useColorModeValue(
    '#6e6e73',
    'rgba(245,245,247,0.68)',
  );
  const accentBlue = useColorModeValue('#0066cc', '#2997ff');
  const accentBlueHover = useColorModeValue('#0071e3', '#5fb1ff');
  const cardBg = useColorModeValue(
    'rgba(255,255,255,0.66)',
    'rgba(15,18,32,0.58)',
  );
  const cardBgHover = useColorModeValue(
    'rgba(255,255,255,0.84)',
    'rgba(15,18,32,0.78)',
  );
  const borderSubtle = useColorModeValue(
    'rgba(0,0,0,0.07)',
    'rgba(255,255,255,0.10)',
  );
  const borderHover = useColorModeValue(
    'rgba(0,102,204,0.30)',
    'rgba(41,151,255,0.36)',
  );
  const closeHoverBg = useColorModeValue(
    'rgba(0,0,0,0.05)',
    'rgba(255,255,255,0.10)',
  );
  const tagBg = useColorModeValue(
    'rgba(0,102,204,0.08)',
    'rgba(41,151,255,0.14)',
  );

  const grade = user?.subscription?.grade;
  const status = user?.subscription?.status;
  const hasActiveSubscription =
    !!user && status !== 'cancel' && !!grade && grade !== 'Free';

  const modelsBalance = user?.modelsBalance ?? 0;
  const imageGenerationBalance = user?.imageGenerationBalance ?? 0;
  const webSearchBalance = (user as any)?.webSearchBalance ?? 0;

  const openSubscription = () => {
    trackGoal('billing_subscription_tab_clicked', { source: 'billing_modal' });
    trackGoal('subscription_opened_from_billing');
    onClose();
    // Небольшой timeout, чтобы успел отыграть закрытие предыдущего overlay
    setTimeout(() => setTariffModalOpen?.(true), 80);
  };

  const openTopup = () => {
    trackGoal('billing_balance_tab_clicked', { source: 'billing_modal' });
    trackGoal('topup_opened_from_billing');
    onClose();
    setTimeout(() => setPayBalanceModalOpen?.(true), 80);
  };

  // ── Render reusable option card ────────────────────────────────────
  const renderOptionCard = ({
    icon,
    title,
    description,
    bullets,
    statusHint,
    ctaLabel,
    onClick,
  }: {
    icon: React.ElementType;
    title: string;
    description: string;
    bullets: string[];
    statusHint?: { label: string; tone: 'active' | 'muted' };
    ctaLabel: string;
    onClick: () => void;
  }) => (
    <Box
      as="button"
      type="button"
      onClick={onClick}
      bg={cardBg}
      border="1px solid"
      borderColor={borderSubtle}
      borderRadius={{ base: '18px', md: '20px' }}
      backdropFilter="blur(18px) saturate(180%)"
      sx={{
        WebkitBackdropFilter: 'blur(18px) saturate(180%)',
        textAlign: 'left',
        cursor: 'pointer',
        WebkitTapHighlightColor: 'transparent',
      }}
      p={{ base: '18px', md: '22px' }}
      transition="background 0.16s ease, border-color 0.16s ease, transform 0.14s ease, box-shadow 0.16s ease"
      _hover={{
        bg: cardBgHover,
        borderColor: borderHover,
        transform: 'translateY(-1px)',
        boxShadow: '0 8px 24px rgba(0, 113, 227, 0.10)',
      }}
      width="100%"
      minWidth={0}
      display="flex"
      flexDirection="column"
      gap="12px"
    >
      <Flex align="center" gap="10px" minW={0}>
        <Flex
          w="36px"
          h="36px"
          align="center"
          justify="center"
          borderRadius="9999px"
          bg={tagBg}
          flexShrink={0}
        >
          <Icon as={icon} w="18px" h="18px" color={accentBlue} />
        </Flex>
        <Heading
          fontFamily={FONT_APPLE_DISPLAY}
          fontSize={{ base: '17px', md: '19px' }}
          fontWeight="600"
          letterSpacing="-0.25px"
          color={textPrimary}
          noOfLines={1}
          minW={0}
        >
          {title}
        </Heading>
        {statusHint && (
          <Box
            ml="auto"
            px="10px"
            py="3px"
            borderRadius="9999px"
            bg={
              statusHint.tone === 'active'
                ? 'rgba(48,209,88,0.16)'
                : tagBg
            }
            color={statusHint.tone === 'active' ? '#0a8a3a' : textSecondary}
            fontSize="11px"
            fontWeight="600"
            letterSpacing="0"
            whiteSpace="nowrap"
            flexShrink={0}
          >
            {statusHint.label}
          </Box>
        )}
      </Flex>

      <Text
        fontFamily={FONT_APPLE_TEXT}
        fontSize={{ base: '13px', md: '14px' }}
        color={textSecondary}
        lineHeight="1.55"
        letterSpacing="-0.05px"
      >
        {description}
      </Text>

      {bullets.length > 0 && (
        <Box as="ul" pl="0" m="0" listStyleType="none">
          {bullets.map((b, i) => (
            <Flex
              as="li"
              key={`${i}-${b}`}
              align="flex-start"
              gap="8px"
              mb="4px"
              fontFamily={FONT_APPLE_TEXT}
              fontSize="13px"
              color={textBody}
              lineHeight="1.5"
            >
              <Box
                w="4px"
                h="4px"
                mt="8px"
                borderRadius="9999px"
                bg={accentBlue}
                flexShrink={0}
              />
              <Text minW={0} wordBreak="break-word">
                {b}
              </Text>
            </Flex>
          ))}
        </Box>
      )}

      <Flex
        align="center"
        justify="space-between"
        mt="4px"
        gap="10px"
        minW={0}
      >
        <Text
          fontFamily={FONT_APPLE_TEXT}
          fontSize="13px"
          fontWeight="600"
          color={accentBlue}
          letterSpacing="-0.1px"
          noOfLines={1}
        >
          {ctaLabel}
        </Text>
        <Icon
          as={MdArrowForward}
          w="18px"
          h="18px"
          color={accentBlue}
          flexShrink={0}
        />
      </Flex>
    </Box>
  );

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
              Тариф и баланс
            </Heading>
            <Text
              fontSize={{ base: '13px', md: '14px' }}
              fontWeight="400"
              color={textSecondary}
              letterSpacing="-0.1px"
              lineHeight="1.35"
            >
              Управляйте подпиской PRO и разовыми пакетами запросов в одном месте.
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
            <CloseIcon w="9px" h="9px" color={textPrimary} />
          </IconButton>
        </Grid>
      }
      contentProps={
        <Box
          width="100%"
          maxWidth="100%"
          minWidth={0}
          fontFamily={FONT_APPLE_TEXT}
          px={{ base: '14px', md: '24px' }}
          pb={{
            base: 'calc(20px + env(safe-area-inset-bottom))',
            md: '26px',
          }}
          pt={{ base: '8px', md: '10px' }}
        >
          <SimpleGrid
            columns={{ base: 1, md: 2 }}
            spacing={{ base: '12px', md: '14px' }}
            minWidth={0}
          >
            {renderOptionCard({
              icon: TbSettingsDollar,
              title: 'Подписка PRO',
              description:
                'Для регулярной работы: больше запросов, лучшие модели, изображения и приоритет.',
              bullets: [
                'Доступ к премиум-моделям без переплат за каждый запрос',
                'Включены генерации изображений и веб-поиск',
                'Стабильный лимит каждый месяц',
              ],
              statusHint: hasActiveSubscription
                ? { label: 'Активна', tone: 'active' }
                : { label: 'Не активна', tone: 'muted' },
              ctaLabel: hasActiveSubscription
                ? 'Управлять подпиской'
                : 'Подключить подписку',
              onClick: openSubscription,
            })}

            {renderOptionCard({
              icon: TbCreditCardPay,
              title: 'Пакеты запросов',
              description:
                'Разовое пополнение, если нужно больше генераций без подписки.',
              bullets: [
                'Текстовые страницы, изображения и веб-поиск отдельно',
                'Платите только за то, что используете',
                'Можно докупать когда угодно — без авто-списаний',
              ],
              statusHint: {
                label: `Сейчас: ${imageGenerationBalance} 🖼 · ${webSearchBalance} 🔍`,
                tone: 'muted',
              },
              ctaLabel: 'Купить пакет',
              onClick: openTopup,
            })}
          </SimpleGrid>

          <Text
            mt={{ base: '14px', md: '18px' }}
            fontSize="11px"
            color={textSecondary}
            lineHeight="1.5"
            textAlign={{ base: 'left', md: 'center' }}
          >
            Оплата проходит через YooKassa. Можно отменить подписку в любой момент
            в личном кабинете.
          </Text>
        </Box>
      }
    />
  );
}

export default BillingModal;
