'use client';
import React, { useEffect, useState } from 'react';
import { Box, Heading, Skeleton, Stack } from '@chakra-ui/react';
import { LuChartNetwork } from 'react-icons/lu';
import { FaChartArea } from 'react-icons/fa';

import { calculatePages } from '../profile/page';
import LineChartUsage from '../../src/components/LineChartUsage';
import { usageService } from '@/services/ui/UsageService';
import { useSubscribe } from '@/utils/hooks/useSubscribe';

export default function Usage() {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    usageService.getUsages().finally(() => {
      setIsLoading(false);
    });
  }, []);
  const rawData = usageService.usages;
  useSubscribe(usageService.listeners);
  console.log({ isLoading });
  return (
    <div>
      <Heading>Статистика</Heading>
      <Box height="24px" />
      {isLoading ? (
        <Stack gap="6" maxW="s">
          <Skeleton borderRadius="14px" height="400px" />
        </Stack>
      ) : (
        <LineChartUsage
          rawData={rawData}
          icon={LuChartNetwork}
          accessKey="tokens"
          title="Использовано страниц"
          processData={calculatePages}
        />
      )}

      <Box height="32px" />

      {isLoading ? (
        <Stack gap="6" maxW="s">
          <Skeleton borderRadius="14px" height="400px" />
        </Stack>
      ) : (
        <LineChartUsage
          rawData={rawData}
          icon={FaChartArea}
          accessKey="images"
          title="Использовано генераций изображений"
          processData={(value) => value}
        />
      )}
    </div>
  );
}
