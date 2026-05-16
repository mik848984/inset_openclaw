import { Alert, Box, Flex, Grid, Heading, IconButton } from '@chakra-ui/react';
import { CloseIcon } from '@chakra-ui/icons';
import React, { useContext, useEffect, useState } from 'react';
import { ModalContext } from '@/contexts/ModalContext';
import CardPayBalance from '@/components/modals/PayBalanceModal/CardPayBalance';
import Modal from '../Modal/Modal';

interface IProps {
  open: boolean;
  onClose: () => void;
}

function PayBalanceModal({ open, onClose }: IProps) {
  const { paymentModalData } = useContext(ModalContext);

  //   const onCreatePayment = (grade: string) => {
  //     setGrade!(grade);
  //     setPaymentModalOpen!(true);
  //   };

  return (
    <Modal
      open={open}
      onClose={onClose}
      headerProps={
        <Grid p="4" templateColumns="1fr 1.5fr 1fr">
          <div />
          <Flex align="center" justify="center">
            <Heading textAlign="center" size="md">
              Пополнение баланса
            </Heading>
          </Flex>
          <Flex direction="row-reverse">
            <IconButton size="lg" aria-label="Close Model" onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Flex>
        </Grid>
      }
      contentProps={
        <>
          <Alert
            display="grid"
            gap="4px"
            background="rgb(124 93 238 / 20%)"
            status="info"
          >
            <Box>
              <Box display="inline" fontWeight="bold">
                {' '}
                1 Страница
              </Box>{' '}
              – содержит{' '}
              <Box display="inline" fontWeight="bold">
                ~250
              </Box>{' '}
              слов.
            </Box>
          </Alert>
          <Grid p="16px" gap="16px">
            {paymentModalData &&
              paymentModalData.map(
                (item: { id: string; price: number; description: string }) => (
                  <CardPayBalance
                    showButtonInModal={true}
                    itemId={item.id}
                    price={Math.floor(item.price)}
                    heading={item.description}
                  />
                ),
              )}
          </Grid>
        </>
      }
    ></Modal>
  );
}

export default PayBalanceModal;
