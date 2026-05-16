'use client';

import { useState } from 'react';
import { Button, Flex, useToast, Stack } from '@chakra-ui/react';
import Link from 'next/link';

type Props = {
  shareId: string;
  agentId: string;
  title?: string;
};

const agentPathMap: Record<string, string> = {
  psychoanalyst: '/life-agents/psychoanalyst',
  'netflix-writer': '/life-agents/netflix-writer',
  oracle: '/life-agents/oracle',
  'life-editor': '/life-agents/life-editor',
  'alter-ego': '/life-agents/alter-ego',
  epilogist: '/life-agents/epilogist',
  'letter-from-child': '/life-agents/letter-from-child',
};

export default function LifeAgentShareActions({ shareId, agentId }: Props) {
  const toast = useToast();
  const [saving, setSaving] = useState(false);

  const agentPath = agentPathMap[agentId] ?? '/life-agents';

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await fetch('/api/lifeAgentsSave', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ shareId }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || 'Не удалось сохранить результат');
      }

      toast({
        title: 'Сохранено',
        description: 'Результат сохранён в ваш аккаунт.',
        status: 'success',
        duration: 4000,
        isClosable: true,
      });
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description:
          error?.message ||
          'Не удалось сохранить результат. Попробуйте ещё раз.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Flex
      direction={{ base: 'column', md: 'row' }}
      justify="space-between"
      gap={4}
    >
      <Button
        as={Link}
        href="/life-agents"
        variant="outline"
        borderRadius="full"
      >
        ← К агентам жизни
      </Button>

      <Stack
        direction={{ base: 'column', md: 'row' }}
        spacing={3}
        w={{ base: '100%', md: 'auto' }}
      >
        <Button
          onClick={handleSave}
          variant="outline"
          borderRadius="full"
          isLoading={saving}
        >
          Сохранить себе
        </Button>

        <Button
          as={Link}
          href={agentPath}
          colorScheme="purple"
          borderRadius="full"
        >
          Сделать свой вариант
        </Button>
      </Stack>
    </Flex>
  );
}
