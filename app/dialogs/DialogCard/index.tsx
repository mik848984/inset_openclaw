import Card from '@/components/card/Card';
import {
  Box,
  Button,
  Flex,
  Heading,
  Icon,
  useColorModeValue,
} from '@chakra-ui/react';
import { FaRegClock } from 'react-icons/fa';
import { IoChevronForwardSharp } from 'react-icons/io5';
import React, { useContext } from 'react';
import { useRouter } from 'next/navigation';
import { ChatAiContext } from '@/contexts/ChatAiContext';
import { messagesService } from '@/services/ui/MessagesService';

interface IProps {
  id: string;
  lastMessage: string;
  updatedAt: Date;
}

function DialogCard({ id, lastMessage, updatedAt }: IProps) {
  const brandColor = useColorModeValue('gray.500', 'white');
  const router = useRouter();

  const { setMessages } = useContext(ChatAiContext);

  return (
    <Card>
      <Flex>
        <Heading as="h2" size="md" noOfLines={2}>
          {lastMessage}
        </Heading>
      </Flex>
      <Box h="24px" />

      <Flex
        w="100%"
        justifyContent="space-between"
        gap="12px"
        alignItems={{ base: 'start', xl: 'center' }}
        flexDirection={{ base: 'column', xl: 'row' }}
      >
        <Flex gap="12px" alignItems="center">
          <Icon as={FaRegClock} width="20px" height="20px" color={brandColor} />
          {new Intl.DateTimeFormat('ru', {
            weekday: 'short',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
          }).format(updatedAt)}
        </Flex>
        <Button
          width={{ base: '100%', xl: 'auto' }}
          onClick={async () => {
            messagesService.currentDialog = id;
            const { messages } = await messagesService.getDialog();

            setMessages!(messages);

            router.push('/chat');
          }}
          rightIcon={
            <Icon as={IoChevronForwardSharp} width="20px" height="20px" />
          }
          variant="primary"
        >
          Перейти в чат
        </Button>
      </Flex>
    </Card>
  );
}

export default DialogCard;
