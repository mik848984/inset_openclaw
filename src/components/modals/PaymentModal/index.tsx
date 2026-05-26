import { Sheet } from 'react-modal-sheet';
import {
  Box,
  Button,
  ChakraProvider,
  Divider,
  Flex,
  Grid,
  Heading,
  Icon,
  IconButton,
  Input,
  Text,
  useToast,
} from '@chakra-ui/react';
import { CloseIcon } from '@chakra-ui/icons';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { paymentService } from '@/services/ui/PaymentService';
import { useUser } from '@/utils/hooks/useUser';
import { trackGoal } from '@/utils/metrics';
import { Link as LinkChakra } from '@chakra-ui/react';
import {
  ModalContext,
  PaymentModalDataType,
  TariffModalDataType,
} from '@/contexts/ModalContext';
import { MdOutlineCurrencyRuble } from 'react-icons/md';
import Card from '@/components/card/Card';
import CardPayBalance from '@/components/modals/PayBalanceModal/CardPayBalance';
import { lightTheme } from '@/theme/theme';

interface IProps {
  itemId: string;
  grade: string;
  open: boolean;
  onClose: () => void;
}

function PaymentModal({ grade, open, onClose, itemId }: IProps) {
  const [value, setValue] = useState('');
  const [error, setError] = useState(false);
  const [payment, setPayment] = useState(false);

  const refCheckout = useRef<any>();
  const { session, refreshUser } = useUser(false);
  const toast = useToast();

  const closeHandler = () => {
    setError(false);
    setPayment(false);
    onClose();
  };

  console.log(itemId, 'itemid');

  useEffect(() => {
    console.log(session);

    const emailStorage = localStorage.getItem('email');

    if (!emailStorage) {
      setValue(emailStorage!);
      return;
    }

    const email = session?.user?.email;

    if (!email?.includes('@example.com') && !email?.includes('@vkmail.com')) {
      setValue(email!);
    }
  }, [session]);

  const { setAuthorizationModalOpen, tariffModalData, paymentModalData } =
    useContext(ModalContext);

  const createPayment = async (value: string) => {
    const payment = await paymentService.createEmbeddedPayment(
      grade,
      itemId,
      value,
    );
    //@ts-ignore
    refCheckout.current = new window.YooMoneyCheckoutWidget({
      confirmation_token: payment.confirmation_token,
      error_callback: function (error: any) {
        trackGoal('payment_widget_error', { grade, itemId, error: error?.error_code || 'unknown' });
        console.log(error);
      },
    });

    refCheckout.current?.on('success', async () => {
      trackGoal('payment_success', { grade, itemId });
      setTimeout(() => {
        refreshUser();
        toast({
          title: `Платеж успешно выполнен!`,
          position: 'bottom-left',
          status: 'success',
          isClosable: true,
        });
        closeHandler();
      }, 5000);
    });

    refCheckout.current?.on('fail', async (error: any) => {
      trackGoal('payment_fail', { grade, itemId, error: error?.error_code || 'unknown' });
    });

    refCheckout.current?.render('payment');
  };

  const nextToPay = () => {
    if (!/^\S+@\S+\.\S+$/.test(value)) {
      setError(true);
      return;
    }

    localStorage.setItem('email', value);

    setError(false);

    setPayment(true);

    refCheckout.current?.destroy();

    createPayment(value);
  };

  return (
    <Sheet
      className="payment-modal"
      style={{
        maxWidth: 800,
        margin: '0 auto',
        overflow: 'initial',
        borderRadius: 16,
      }}
      isOpen={open}
      onClose={closeHandler}
    >
      <Sheet.Container>
        <Sheet.Header style={{ padding: '0px 10px' }}>
          <Grid p="4" templateColumns="1fr 1.5fr 1fr">
            <div />
            <Flex align="center" justify="center">
              <Heading size="md">Оформление платежа</Heading>
            </Flex>
            <Flex direction="row-reverse">
              <IconButton
                size="lg"
                aria-label="Close Model"
                onClick={closeHandler}
              >
                <CloseIcon />
              </IconButton>
            </Flex>
          </Grid>
          <Divider></Divider>
          <Box p="15px" mt="12px">
            <ChakraProvider theme={lightTheme}>
              {grade &&
                tariffModalData &&
                tariffModalData
                  .filter((item: TariffModalDataType) => item.grade === grade)
                  .map((item: TariffModalDataType) => (
                    <Card
                      borderRadius="10px"
                      p="16px"
                      boxShadow="2px 1px 33px 7px rgba(112, 144, 176, 0.15)"
                      m="5px 0px"
                      maxWidth="455px"
                      placeSelf="center"
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
                              {Math.floor(item.price)}
                              <Icon
                                color="white !important"
                                as={MdOutlineCurrencyRuble}
                                height="20px"
                                width="20px"
                              />
                            </Heading>
                          </Box>
                          <div>—</div>
                          <Heading size="md">{item.grade}</Heading>
                        </Flex>
                      </Flex>
                      <Divider pt="12px" mb="12px" />
                      {item.description}
                    </Card>
                  ))}

              {itemId &&
                paymentModalData &&
                paymentModalData
                  .filter((item: PaymentModalDataType) => item.id === itemId)
                  .map(
                    (item: {
                      price: number;
                      description: string;
                      id: string;
                    }) => (
                      <CardPayBalance
                        style={{
                          maxWidth: '455px',
                          width: '100%',
                          margin: '5px 0px',
                          placeSelf: 'center',
                          borderRadius: '10px',
                          padding: '16px',
                          boxShadow:
                            '2px 1px 33px 7px rgba(112, 144, 176, 0.15)',
                        }}
                        showButtonInModal={false}
                        key={item.id}
                        itemId={item.id}
                        price={Math.floor(item.price)}
                        heading={item.description}
                      />
                    ),
                  )}
            </ChakraProvider>
          </Box>
        </Sheet.Header>
        <Sheet.Content>
          {/*<Grid pt="10vh" width="100%">*/}
          <Grid width="100%">
            <Box id="payment" mb="12px" />
            {!payment && (
              <Flex
                alignItems="center"
                direction="column"
                justify="center"
                p="0px 20px"
                mb="40px"
              >
                <Flex align="center" justify="center" mb="10px"></Flex>
                <Box
                  p="20px"
                  pt="20px"
                  pb="30px"
                  border="1px solid"
                  borderRadius={'10px'}
                  borderColor="gray.200"
                  w={{ base: '100%', md: '60%' }}
                >
                  <Text fontSize="18px">Укажите почту</Text>

                  <Input
                    autocomplete="on"
                    value={value}
                    onChange={(e: any) => setValue(e.target.value)}
                    mt="12px"
                    _placeholder={{ color: 'gray.500' }}
                    _focus={{ borderColor: 'none' }}
                    color="navy.700"
                    border="1px solid"
                    borderRadius={'10px'}
                    borderColor={error ? 'red.500' : 'gray.200'}
                    placeholder="Куда отправить чек?"
                  />
                  {error && (
                    <Text fontSize="14px" color="red.500">
                      Почта невалидна!
                    </Text>
                  )}
                  <Button
                    mt="16px"
                    w="100%"
                    variant="primary"
                    onClick={nextToPay}
                  >
                    Подтвердить
                  </Button>
                </Box>
              </Flex>
            )}
            <Flex fontSize="12px" gap="8px" margin="0 auto" textAlign="center">
              Оплачивая, вы принимаете:{' '}
              <Grid>
                <LinkChakra
                  textDecoration="underline"
                  target="_blank"
                  href="https://telegra.ph/Politika-konfidencialnosti-03-05-7"
                >
                  Политика конфиденциальности
                </LinkChakra>
                <LinkChakra
                  textDecoration="underline"
                  target="_blank"
                  href="https://telegra.ph/Polzovatelskoe-soglashenie-03-05-7"
                >
                  Пользовательское соглашение
                </LinkChakra>
              </Grid>
            </Flex>
          </Grid>
        </Sheet.Content>
      </Sheet.Container>
      <Sheet.Backdrop />
    </Sheet>
  );
}

export default PaymentModal;
