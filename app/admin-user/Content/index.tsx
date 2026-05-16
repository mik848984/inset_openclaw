'use client';
import { useSearchParams } from 'next/navigation';
import { FaChartArea } from 'react-icons/fa';
import React, { useContext, useEffect } from 'react';

import { usersService } from '@/services/ui/UsersService';
import { useSubscribe } from '@/utils/hooks/useSubscribe';
import {
  Box,
  Button,
  Flex,
  Grid,
  Icon,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { NextAvatar } from '@/components/image/Avatar';
import Card from '@/components/card/Card';
import { LuBrain, LuChartNetwork, LuGlobe } from 'react-icons/lu';

import MiniStatistics from '@/components/card/MiniStatistics';
import IconBox from '@/components/icons/IconBox';
import { ModalContext } from '@/contexts/ModalContext';
import LineChartUsage from '@/components/LineChartUsage';

export function calculatePages(tokens: number = 0) {
  return Number((tokens / 625).toFixed(2));
}

export default function Content() {
  const searchParams = useSearchParams();
  const textColorPrimary = useColorModeValue('navy.700', 'white');
  const boxBg = useColorModeValue('secondaryGray.300', 'whiteAlpha.100');
  const brandColor = useColorModeValue('brand.500', 'white');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.200');

  const { setUserEditOpen } = useContext(ModalContext);

  useSubscribe(usersService.listeners);

  useEffect(() => {
    usersService.getUser(searchParams.get('userId')!);
  }, []);

  return (
    <Grid>
      <Card mb="34px" alignItems="center" pb="30px">
        <Flex
          bg="linear-gradient(15.46deg, #4A25E1 26.3%, #7B5AFF 86.4%)"
          w="100%"
          h="129px"
          borderRadius="16px"
        />
        <NextAvatar
          mx="auto"
          showBorder
          src={usersService.currentUser?.image}
          h="110px"
          w="110px"
          mt="-43px"
          mb="15px"
        />
        <Flex alignItems="center" direction="column">
          <Text
            textAlign="center"
            fontSize="2xl"
            textColor={textColorPrimary}
            fontWeight="700"
            mb="4px"
          >
            {usersService.currentUser?.name}
          </Text>
          <Text
            textAlign="center"
            fontSize="xl"
            textColor="gray.500"
            fontWeight="700"
            mb="4px"
          >
            {usersService.currentUser?.email}
          </Text>
        </Flex>
      </Card>
      <Grid
        gridTemplateColumns={{
          base: '1fr',
          md: 'repeat(2, 1fr)',
          xl: 'repeat(4, 1fr)',
        }}
        gap="24px"
      >
        <MiniStatistics
          startContent={
            <IconBox
              w="56px"
              h="56px"
              bg={boxBg}
              icon={<Icon w="24px" h="24px" as={LuBrain} color={brandColor} />}
            />
          }
          name="Количество страниц для генерации"
          value={calculatePages(usersService.currentUser?.modelsBalance)}
        />
        <MiniStatistics
          startContent={
            <IconBox
              w="56px"
              h="56px"
              bg={boxBg}
              icon={<Icon w="24px" h="24px" as={LuBrain} color={brandColor} />}
            />
          }
          name="Количество генераций картинок"
          value={usersService.currentUser?.imageGenerationBalance}
        />
        <MiniStatistics
          startContent={
            <IconBox
              w="56px"
              h="56px"
              bg={boxBg}
              icon={<Icon w="24px" h="24px" as={LuGlobe} color={brandColor} />}
            />
          }
          name="Баланс веб-поиска"
          value={usersService.currentUser?.webSearchBalance || 0}
        />
        <Card display="flex" flexDirection="column" justifyContent="center">
          <Button
            variant="transparent"
            border="1px solid"
            borderColor={borderColor}
            onClick={() => setUserEditOpen!(true)}
          >
            Редактировать баланс
          </Button>
        </Card>
      </Grid>
      <Box height="32px" />
      <LineChartUsage
        rawData={usersService.usages}
        icon={LuChartNetwork}
        accessKey="tokens"
        title="Использовано страниц"
        processData={calculatePages}
      />
      <Box height="32px" />

      <LineChartUsage
        rawData={usersService.usages}
        icon={FaChartArea}
        accessKey="images"
        title="Использовано генераций изображений"
        processData={(value) => value}
      />
    </Grid>
  );
}
