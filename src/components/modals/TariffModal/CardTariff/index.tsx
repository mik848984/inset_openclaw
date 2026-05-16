import Card from '@/components/card/Card';
import { Box, Button, Divider, Flex, Heading, Icon } from '@chakra-ui/react';
import { MdOutlineCurrencyRuble } from 'react-icons/md';
import { TbCreditCardPay } from 'react-icons/tb';
import React, { useContext } from 'react';
import { ModalContext } from '@/contexts/ModalContext';
import { useUser } from '@/utils/hooks/useUser';

interface IProps {
  price: number;
  grade: string;
  heading: string;
  description: any;
  key: string;
}

function CardTariff({ price, grade, heading, description, key }: IProps) {
  const { isAnonymous } = useUser(false);

  const { setPaymentModalOpen, setGrade, setAuthorizationModalOpen } =
    useContext(ModalContext);

  const onCreatePayment = () => {
    if (isAnonymous) {
      setAuthorizationModalOpen!(true);
      return;
    }

    setGrade!(grade);

    setPaymentModalOpen!(true);
  };

  return (
    <Card
      cursor="pointer"
      transition="0.3s"
      _hover={{ boxShadow: '0px 0px 13px 4px rgba(112, 144, 176, 0.2)' }}
    >
      <Flex
        justify="space-between"
        direction={{ base: 'column', md: 'row' }}
        gap="18px"
      >
        <Flex
          gap="10px"
          w="max-content"
          alignItems={{ base: 'start', md: 'center' }}
        >
          <Box color="whiteAlpha.900">
            <Heading
              padding="2px 8px"
              borderRadius="10px"
              background="rgba(117, 81, 255, 0.9);"
              size="lg"
              display="inline"
              alignItems="center"
            >
              {price}
              <Icon as={MdOutlineCurrencyRuble} height="20px" width="20px" />
            </Heading>
          </Box>
          <div>—</div>
          <Heading size="md">{heading}</Heading>
        </Flex>
        <Button
          pl="26px"
          pr="26px"
          w={{ base: '100%', md: 'auto' }}
          onClick={onCreatePayment}
          variant="primary"
          rightIcon={<Icon as={TbCreditCardPay} w="24px" h="24px" />}
        >
          Подписаться
        </Button>
      </Flex>
      <Divider pt="12px" mb="12px" />
      {description}
    </Card>
  );
}

export default CardTariff;
