'use client';

// Chakra imports

import React, { useContext, useEffect } from 'react';
import {
  Box,
  Button,
  Flex,
  Grid,
  Heading,
  Icon,
  IconButton,
  SimpleGrid,
  Switch,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import Card from '@/components/card/Card';
import { IoAdd } from 'react-icons/io5';
import { ModalContext } from '@/contexts/ModalContext';
import { hrServiceUI } from '@/services/ui/HrService';
import { useSubscribe } from '@/utils/hooks/useSubscribe';
import TruncateText from '@/components/TruncateText';
import { MdDelete } from 'react-icons/md';
import { useRouter } from 'next/navigation';
import HrSearchItem from './HrSearchItem';

export default function Home() {
  const textColor = useColorModeValue('gray.500', 'white');
  const router = useRouter();

  const { setAvitoAgentCreateOpen } = useContext(ModalContext);

  useSubscribe(hrServiceUI.listeners);

  useEffect(() => {
    hrServiceUI.getHrAgents();

    const intervalId = setInterval(() => {
      hrServiceUI.getHrAgents();
    }, 5000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  return (
    <div>
      <Heading>HR Агенты</Heading>
      <Box height="24px" />
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing="20px">
        {hrServiceUI.hrSearch.map((item) => {
          return <HrSearchItem key={item._id} item={item} />;
        })}
        <Card
          onClick={() => setAvitoAgentCreateOpen!(true)}
          transition="0.3s"
          tabIndex="0"
          _focus={{
            cursor: 'pointer',
            boxShadow: '2px 1px 23px 7px rgba(112, 144, 176, 0.55)',
          }}
          _hover={{
            cursor: 'pointer',
            boxShadow: '2px 1px 23px 7px rgba(112, 144, 176, 0.55)',
          }}
        >
          <Flex
            alignItems="center"
            justifyContent="center"
            minHeight="180px"
            height="100%"
            textAlign="center"
            gap="12px"
          >
            <Icon as={IoAdd} width="48px" height="48px"></Icon>
            <Heading color={textColor} size="xs">
              Создать агента
            </Heading>
          </Flex>
        </Card>
      </SimpleGrid>
    </div>
  );
}
