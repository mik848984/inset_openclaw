import { Button, Flex, Icon } from '@chakra-ui/react';
import { TbCreditCardOff, TbCreditCardPay } from 'react-icons/tb';
import React from 'react';
import { useUser } from '@/utils/hooks/useUser';
import { paymentService } from '@/services/ui/PaymentService';

function SubscriptionButton() {
  const { user, refreshUser, isAnonymous, loading } = useUser(false);

  const updateSubscription = async () => {
    await paymentService.subscription(
      user?.subscription.status === 'cancel' ? 'active' : 'cancel',
    );

    await refreshUser();
  };

  if (!user?.subscription.grade) return null;
  if (user?.subscription.grade === 'Free') return null;

  if (user?.subscription.status === 'cancel') {
    return (
      <Flex
        justifyContent="flex-end"
        w="100%"
        gap="20px"
        direction={{ base: 'column', xl: 'row' }}
      >
        <Button
          onClick={updateSubscription}
          w={{ base: '100%', md: 'auto' }}
          variant="transparent"
          border="1px solid"
          color="green.400"
          borderColor="green.400"
          borderRadius="full"
          fontSize="md"
          p="6px 20px"
          leftIcon={<Icon w="20px" h="20px" as={TbCreditCardPay} />}
        >
          Включить подписку
        </Button>
      </Flex>
    );
  }

  return (
    <Flex
      justifyContent="flex-end"
      w="100%"
      gap="20px"
      direction={{ base: 'column', xl: 'row' }}
    >
      <Button
        onClick={updateSubscription}
        w={{ base: '100%', md: 'auto' }}
        variant="transparent"
        border="1px solid"
        color="red.600"
        borderColor="red.600"
        borderRadius="full"
        fontSize="md"
        p="6px 20px"
        leftIcon={<Icon w="20px" h="20px" as={TbCreditCardOff} />}
      >
        Отменить подписку
      </Button>
    </Flex>
  );
}

export default SubscriptionButton;
