'use client';

import {
  Box,
  Button,
  Flex,
  Grid,
  Heading,
  Icon,
  useColorModeValue,
} from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { IDialogUI, messagesService } from '@/services/ui/MessagesService';
import DialogCard from './DialogCard';
import Link from 'next/link';
import { TbMessageCircle } from 'react-icons/tb';
import { ImFilesEmpty } from 'react-icons/im';
import SkeletonLoader from '@/components/skeletonLoader/SkeletonLoader';

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [dialogs, setDialogs] = useState<IDialogUI[]>([]);
  const brandColor = useColorModeValue('gray.500', 'white');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.200');

  console.log(dialogs);

  useEffect(() => {
    messagesService
      .getDialogs()
      .then((data) => {
        setDialogs(data);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  return (
    <Box p="12px">
      <Heading as="h2" size="2xl">
        История диалогов
      </Heading>
      <Box h="38px" />

      {isLoading ? (
        <Grid gridTemplateColumns={{ base: '1fr', md: '1fr 1fr' }} gap="12px">
          <SkeletonLoader />
          <SkeletonLoader />
          <SkeletonLoader />
          <SkeletonLoader />
          <SkeletonLoader />
          <SkeletonLoader />
          <SkeletonLoader />
          <SkeletonLoader />
        </Grid>
      ) : !!dialogs.length ? (
        <Grid gridTemplateColumns={{ base: '1fr', md: '1fr 1fr' }} gap="12px">
          {dialogs.map((dialog) => (
            <DialogCard
              key={dialog._id}
              id={dialog._id}
              lastMessage={dialog.lastMessage}
              updatedAt={new Date(dialog.updatedAt)}
            />
          ))}
        </Grid>
      ) : (
        <Flex
          margin="0 auto"
          maxWidth="400px"
          marginTop
          mt={{ base: '0px', md: '10%' }}
          textAlign="center"
          alignItems="center"
          direction="column"
        >
          <Icon
            as={ImFilesEmpty}
            width={{ base: '70px', md: '100px' }}
            height={{ base: '70px', md: '100px' }}
            color={brandColor}
          />
          <Heading mt="12px" size="md">
            Список диалогов пуст
          </Heading>
          <Box h="24px" />
          <Link href="/chat">
            <Button
              rightIcon={
                <Icon as={TbMessageCircle} width="20px" height="20px" />
              }
              variant="transparent"
              border="1px solid"
              borderColor={borderColor}
              borderRadius="full"
            >
              Начать новый диалог
            </Button>
          </Link>
        </Flex>
      )}
    </Box>
  );
}
