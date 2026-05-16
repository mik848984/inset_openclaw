import { Box, Button, Flex, Heading, Icon } from '@chakra-ui/react';
import { MdOutlineCurrencyRuble } from 'react-icons/md';
import { TbCreditCardPay } from 'react-icons/tb';
import React, { useContext } from 'react';
import Card from '@/components/card/Card';
import { useUser } from '@/utils/hooks/useUser';
import { ModalContext } from '@/contexts/ModalContext';

interface CardPayBalanceProps {
  price: number;
  heading: string;
  itemId: string;
  showButtonInModal: boolean;
  style?: any;
}

function CardPayBalance({
  heading,
  price,
  itemId,
  showButtonInModal,
  style,
}: CardPayBalanceProps) {
  const { user, isAnonymous } = useUser(false);

  const { setAuthorizationModalOpen, setItemId, setPaymentModalOpen } =
    useContext(ModalContext);

  return (
    <Card
      style={
        style
          ? style
          : {
              cursor: 'pointer',
              transition: '0.3s',
              _hover: {
                boxShadow: '3px 9px 18px 9px rgba(112, 144, 176, 0.35)',
              },
            }
      }
    >
      <Flex
        justify="space-between"
        direction={{ base: 'column', md: 'row' }}
        gap="18px"
      >
        <Flex gap="10px" w="100%" alignItems={{ base: 'start', md: 'center' }}>
          <Box color="whiteAlpha.900">
            <Heading
              whiteSpace="nowrap"
              padding="2px 8px"
              borderRadius="10px"
              background="rgba(117, 81, 255, 0.9);"
              size="lg"
              display="inline"
              alignItems="center"
            >
              {price}
              <Icon
                as={MdOutlineCurrencyRuble}
                color="white !important"
                height="20px"
                width="20px"
              />
            </Heading>
          </Box>
          <Heading size="md">
            {' '}
            <Flex gap="10px">
              <Box>—</Box> {heading}
            </Flex>
          </Heading>
        </Flex>
        {showButtonInModal && (
          <Button
            pl="26px"
            pr="26px"
            w={{ base: '100%', md: 'auto' }}
            onClick={() => {
              if (isAnonymous) {
                setAuthorizationModalOpen!(true);
                return;
              }

              setItemId!(itemId);
              setPaymentModalOpen!(true);
            }}
            variant="primary"
            rightIcon={<Icon as={TbCreditCardPay} w="24px" h="24px" />}
          >
            Пополнить
          </Button>
        )}
      </Flex>
    </Card>
  );
}

export default CardPayBalance;
