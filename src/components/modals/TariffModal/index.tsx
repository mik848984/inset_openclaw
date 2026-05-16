import {
  Alert,
  Box,
  Flex,
  Grid,
  Heading,
  Icon,
  IconButton,
  useColorModeValue,
} from '@chakra-ui/react';
import { CloseIcon } from '@chakra-ui/icons';
import React, { useContext, useEffect, useState } from 'react';
import { LiaBrainSolid } from 'react-icons/lia';
import CardTariff from '@/components/modals/TariffModal/CardTariff';
import Modal from '../Modal/Modal';
import Card from '@/components/card/Card';
import MiniStatistics from '@/components/card/MiniStatistics';
import IconBox from '@/components/icons/IconBox';
import { MdOutlinePaid } from 'react-icons/md';
import { getExpiredDate, getTariffName } from '../../../../app/profile/page';
import { useUser } from '@/utils/hooks/useUser';
import SubscriptionButton from '@/components/modals/TariffModal/SubscriptionButton';
import { getProducts } from '@/components/modals';
import { ModalContext } from '@/contexts/ModalContext';

interface IProps {
  open: boolean;
  onClose: () => void;
}

function TariffModal({ open, onClose }: IProps) {
  const { user, session, isAnonymous, loading } = useUser(false);
  const brandColor = useColorModeValue('brand.500', 'white');
  const boxBg = useColorModeValue('secondaryGray.300', 'whiteAlpha.100');

  const { setAuthorizationModalOpen, tariffModalData } =
    useContext(ModalContext);

  console.log(user?.subscription?.grade);

  return (
    <Modal
      open={open}
      onClose={onClose}
      headerProps={
        <Grid p="4" templateColumns="1fr 3.5fr 1fr">
          <div></div>
          <Flex align="center" justify="center">
            <Heading size="md">Управление подпиской</Heading>
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
          <Box h="6px" />
          <Grid p="16px" gap="16px">
            <Card p={0}>
              <Flex gap="12px">
                <MiniStatistics
                  startContent={
                    <IconBox
                      mr="12px"
                      w="56px"
                      h="56px"
                      bg={boxBg}
                      icon={
                        <Icon
                          w="24px"
                          h="24px"
                          as={MdOutlinePaid}
                          color={brandColor}
                        />
                      }
                    />
                  }
                  endContent={<SubscriptionButton />}
                  name={`Дата окончания подписки: ${getExpiredDate(user?.subscription.startDate)}`}
                  value={`Подписка - ${getTariffName(user?.subscription?.status, user?.subscription?.grade)}`}
                />
              </Flex>
            </Card>
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
                    description={
                      <>
                        <Flex gap="12px">
                          <Icon as={LiaBrainSolid} width="22px" height="22px" />
                          {item.description}
                        </Flex>
                      </>
                    }
                  />
                ),
              )}
          </Grid>
        </>
      }
    ></Modal>
  );
}

export default TariffModal;
