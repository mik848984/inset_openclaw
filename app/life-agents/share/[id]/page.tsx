import { notFound } from 'next/navigation';
import dbConnect from '@/lib/db';
import LifeAgentShare from '@/models/lifeAgentShare';
import {
  Box,
  Container,
  Heading,
  Text,
  Badge,
  Stack,
  Divider,
} from '@chakra-ui/react';
import LifeAgentShareActions from '@/components/life-agents/LifeAgentShareActions';

const agentMeta: Record<
  string,
  { title: string; emoji: string; description: string }
> = {
  psychoanalyst: {
    title: 'Психоаналитик',
    emoji: '🛋️',
    description:
      'Игровой агент, который помогает мягко отразить твои сильные стороны, привычки и мотивы. Это не психотерапия, а повод посмотреть на себя со стороны.',
  },
  'netflix-writer': {
    title: 'Netflix-сценарист',
    emoji: '🎬',
    description:
      'Воображаемый сценарист, который превращает факты твоей жизни в пилот эпизода сериала. Можно использовать как отражение и как инструмент самопознания.',
  },
  oracle: {
    title: 'Оракул',
    emoji: '🔮',
    description:
      'Агент, который рисует вдохновляющее, но реалистичное видение того, каким ты можешь стать через несколько лет, исходя из того, что важно тебе сейчас.',
  },
  'life-editor': {
    title: 'Редактор жизни',
    emoji: '✂️',
    description:
      'Помогает «отредактировать» текущую версию жизни: убрать лишний шум, добавить важное и подсветить, что уже работает хорошо.',
  },
  'alter-ego': {
    title: 'Альтер-эго',
    emoji: '🦸‍♂️',
    description:
      'Создаёт вдохновляющую версию тебя из альтернативной вселенной: каким бы ты мог быть при других настройках и решениях.',
  },
  epilogist: {
    title: 'Эпилогист',
    emoji: '📖',
    description:
      'Пишет «эпилог» к какому-то периоду твоей жизни: подводит итоги, находит мотивы и помогает закрыть гештальты.',
  },
  'letter-from-child': {
    title: 'Письмо от внутреннего ребёнка',
    emoji: '🧸',
    description:
      'Мягкий агент, который пишет тебе письмо от лица твоего внутреннего ребёнка — с поддержкой, благодарностью и напоминанием о важных вещах.',
  },
};

type Props = {
  params: { id: string };
};

export default async function LifeAgentSharePage({ params }: Props) {
  await dbConnect();

  const share = await LifeAgentShare.findById(params.id).lean();

  if (!share) {
    notFound();
  }

  const meta = agentMeta[share.agentId as string] || {
    title: 'Результат агента жизни',
    emoji: '✨',
    description:
      'Сохранённый результат работы одного из агентов жизни ИИСеть.',
  };

  const createdAt = share.createdAt
    ? new Date(share.createdAt as string)
    : null;

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
            alignSelf="flex-start"
            px={3}
            py={1}
            borderRadius="full"
            bg="whiteAlpha.200"
            fontSize="xs"
            textTransform="none"
          >
            Результат агента жизни
          </Badge>

          <Heading as="h1" size="lg">
            <span style={{ marginRight: '0.5rem' }}>{meta.emoji}</span>
            {meta.title}
          </Heading>

          <Text fontSize="md" opacity={0.9}>
            {meta.description}
          </Text>

          <Text fontSize="sm" opacity={0.8}>
            Ссылка на этот результат создана пользователем ИИСеть и будет
            доступна в течение 7 дней с момента создания.
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
        <Text
          fontSize="md"
          whiteSpace="pre-wrap"
          lineHeight="tall"
          color="gray.800"
          _dark={{ color: 'gray.100' }}
        >
          {share.content}
        </Text>
      </Box>

      <Divider my={{ base: 8, md: 10 }} />

      <LifeAgentShareActions
        shareId={params.id}
        agentId={share.agentId as string}
      />
    </Container>
  );
}
