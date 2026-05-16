import { notFound } from 'next/navigation';
import dbConnect from '@/lib/db';
import ChatShare from '@/models/chatShare';
import {
  Badge,
  Box,
  Container,
  Divider,
  Flex,
  Heading,
  Image as ChakraImage,
  Stack,
  Text,
} from '@chakra-ui/react';
import Link from 'next/link';

type Props = {
  params: { id: string };
};

export default async function ChatSharePage({ params }: Props) {
  await dbConnect();

  const share = await ChatShare.findById(params.id).lean();

  if (!share) {
    notFound();
  }

  const createdAt = share.createdAt
    ? new Date(share.createdAt as string)
    : null;

  const isImage =
    (share as any).isImage ||
    (typeof share.content === 'string' &&
      (share.content as string).startsWith('![image]('));

  let imageUrl: string | null = null;

  if (isImage && typeof share.content === 'string') {
    const match = (share.content as string).match(/!\[.*?\]\((.*?)\)/);
    if (match && match[1]) {
      imageUrl = match[1];
    }
  }

  const roleLabel =
    share.role === 'assistant'
      ? 'Ответ ИИСеть в чате'
      : 'Сообщение пользователя в чате';

  return (
    <Container maxW="4xl" py={{ base: 10, md: 16 }}>
      <Box
        borderRadius="2xl"
        bgGradient="linear(to-br, #4A25E1, #7B5AFF)"
        p={{ base: 6, md: 8 }}
        color="white"
        mb={{ base: 8, md: 10 }}
        boxShadow="2xl"
      >
        <Stack spacing={4}>
          <Badge
            bg="whiteAlpha.200"
            color="white"
            borderRadius="full"
            px={3}
            py={1}
            w="fit-content"
            fontSize="xs"
            textTransform="none"
          >
            Поделённое сообщение чата
          </Badge>

          <Heading as="h1" size="lg">
            💬 {roleLabel}
          </Heading>

          <Text fontSize="md" opacity={0.9}>
            Это сообщение было создано в чате ИИСеть и поделено по публичной
            ссылке. Вы можете продолжить работу уже в основном интерфейсе чата.
          </Text>

          <Text fontSize="sm" opacity={0.8}>
            Ссылка на это сообщение будет доступна в течение 7 дней с момента
            создания.
          </Text>

          {createdAt && (
            <Text fontSize="xs" opacity={0.7}>
              Создано:{' '}
              {createdAt.toLocaleDateString('ru-RU', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          )}
        </Stack>
      </Box>

      <Box
        borderRadius="2xl"
        bg="whiteAlpha.900"
        _dark={{ bg: 'navy.800' }}
        p={{ base: 5, md: 7 }}
        boxShadow="xl"
      >
        {isImage && imageUrl ? (
          <Box>
            <ChakraImage
              src={imageUrl}
              alt="Поделённое изображение из чата"
              borderRadius="xl"
              maxH="600px"
              mx="auto"
              objectFit="contain"
            />
            <Text
              mt={4}
              fontSize="sm"
              color="gray.500"
              _dark={{ color: 'gray.400' }}
              textAlign="center"
            >
              Изображение, сгенерированное в чате ИИСеть.
            </Text>
          </Box>
        ) : (
          <Text
            fontSize="md"
            whiteSpace="pre-wrap"
            lineHeight="tall"
            color="gray.800"
            _dark={{ color: 'gray.100' }}
          >
            {share.content as string}
          </Text>
        )}
      </Box>

      <Divider my={{ base: 8, md: 10 }} />

      <Flex
        direction={{ base: 'column', md: 'row' }}
        justify="space-between"
        gap={4}
      >
        <Box>
          <Link href="/chat">
            <Text
              as="span"
              fontSize="sm"
              color="gray.500"
              _dark={{ color: 'gray.400' }}
            >
              ← Вернуться к чату
            </Text>
          </Link>
        </Box>

        <Flex gap={3}>
          <Link href="/chat">
            <Text
              as="span"
              fontSize="sm"
              fontWeight="600"
              color="white"
              bgGradient="linear(to-r, #4A25E1, #7B5AFF)"
              px={4}
              py={2}
              borderRadius="full"
              boxShadow="md"
            >
              Открыть чат ИИСеть
            </Text>
          </Link>
        </Flex>
      </Flex>
    </Container>
  );
}
