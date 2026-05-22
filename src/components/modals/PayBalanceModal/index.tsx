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
import React, { useContext } from 'react';
import { ModalContext } from '@/contexts/ModalContext';
import CardPayBalance from '@/components/modals/PayBalanceModal/CardPayBalance';
import Modal from '../Modal/Modal';

interface IProps {
  open: boolean;
  onClose: () => void;
}

// ── Apple typography ──────────────────────────────────────────────
const FONT_APPLE_TEXT = `'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif`;
const FONT_APPLE_DISPLAY = `'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif`;

function PayBalanceModal({ open, onClose }: IProps) {
  const { paymentModalData } = useContext(ModalContext);

  // ── Same design tokens ─────────────────────────────────────────
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
              Пополнить баланс
            </Heading>
            <Text
              fontSize={{ base: '13px', md: '14px' }}
              fontWeight="400"
              color={textSecondary}
              letterSpacing="-0.1px"
              lineHeight="1.35"
            >
              Добавьте страницы, веб-поиск или генерации изображений
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
          {/* Info strip */}
          <Flex
            align="center"
            gap="10px"
            px={{ base: '14px', md: '16px' }}
            py="12px"
            bg={infoStripBg}
            border="1px solid"
            borderColor={infoStripBorder}
            borderRadius="14px"
            mb={{ base: '12px', md: '16px' }}
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

          {/* Section label */}
          <Text
            fontSize="11px"
            fontWeight="600"
            letterSpacing="0.6px"
            textTransform="uppercase"
            color={textSecondary}
            mb={{ base: '8px', md: '10px' }}
            ml="2px"
          >
            Доступные пакеты
          </Text>

          {/* Product cards grid */}
          <Grid
            gap={{ base: '10px', md: '12px' }}
            templateColumns={{
              base: '1fr',
              md: 'repeat(2, minmax(0, 1fr))',
            }}
            width="100%"
            minWidth={0}
          >
            {paymentModalData &&
              paymentModalData.map(
                (item: {
                  id: string;
                  price: number;
                  description: string;
                }) => (
                  <CardPayBalance
                    key={item.id}
                    showButtonInModal={true}
                    itemId={item.id}
                    price={Math.floor(item.price)}
                    heading={item.description}
                  />
                ),
              )}
          </Grid>
        </Box>
      }
    ></Modal>
  );
}

export default PayBalanceModal;
