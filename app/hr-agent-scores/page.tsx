'use client';

import React, { useEffect } from 'react';
import { hrServiceUI } from '@/services/ui/HrService';
import { Box, Heading, useColorModeValue } from '@chakra-ui/react';
import { useSubscribe } from '@/utils/hooks/useSubscribe';
import HrScoresList from './HrScoresList';

export default function Home() {
  const textColor = useColorModeValue('gray.500', 'gray.300');

  useEffect(() => {
    hrServiceUI.clearScores();
    hrServiceUI.getHrScores();
  }, []);

  useSubscribe(hrServiceUI.listeners);

  return (
    <div>
      <Heading mt={{ base: '32px', md: '6px' }} mr={{ base: '0', md: '100px' }}>
        {hrServiceUI.currentHrSearch?.query.join(', ')}
      </Heading>

      <Box height="24px" />
      <HrScoresList />
    </div>
  );
}
