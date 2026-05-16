
'use client';

import { Box, Heading, SimpleGrid, Text, Button, Stack } from '@chakra-ui/react';
import NavLink from '@/components/link/NavLink';
import TemplateCard from '@/components/card/TemplateCard';
import { useUser } from '@/utils/hooks/useUser';
import React from 'react';

export default function LifeAgentsPage() {
  const { user } = useUser(false);

  return (
    <Box mt={{ base: '70px', md: '0px', xl: '0px' }}>
      <Box mb="6">
        <Heading as="h1" size="lg" mb="3">
          Агенты Жизни
        </Heading>
        <Text fontSize="md" color="gray.500" mb="4">
          Игровые ИИ-агенты, которые помогают взглянуть на себя под другим углом: сценарист Netflix,
          Психоаналитик, Письмо из детства, Оракул и другие. Это не медицинская или психотерапевтическая
          помощь, а мягкий способ подумать о себе и своих целях.
        </Text>
        <Stack direction={{ base: 'column', sm: 'row' }} spacing={3}>
          <NavLink href="/chat">
            <Button colorScheme="blue" size="sm">
              Открыть чат ИИСеть
            </Button>
          </NavLink>
          {user?.isAdmin && (
            <Text fontSize="sm" color="gray.500">
              Админский режим: управление списком агентов — в панели администратора.
            </Text>
          )}
        </Stack>
      </Box>

      <SimpleGrid

        columns={{ base: 1, md: 2, xl: 3 }}
        gap="20px"
        w="100%"
        mt="20px"
      >
        <TemplateCard
          link="/life-agents/netflix-writer"
          illustration="🎬"
          name="Netflix-Сценарист"
          description="Серия сериала о твоей жизни: название, логлайн и синопсис."
        />

        <TemplateCard
          link="/life-agents/psychoanalyst"
          illustration="🧠"
          name="Психоаналитик"
          description="Мягкий психологический разбор твоей личности с поддержкой."
        />

        <TemplateCard
          link="/life-agents/oracle"
          illustration="🔮"
          name="Оракул"
          description="Вдохновляющее видение тебя через 5–20 лет без мистики."
        />

        <TemplateCard
          link="/life-agents/life-editor"
          illustration="✏️"
          name="Редактор жизни"
          description="Переписывает текст о себе так, чтобы он звучал яснее и увереннее."
        />

        <TemplateCard
          link="/life-agents/alter-ego"
          illustration="🎭"
          name="Альтер-эго"
          description="Альтернативная версия тебя из другой реальности."
        />

        <TemplateCard
          link="/life-agents/letter-from-child"
          illustration="💌"
          name="Письмо из детства"
          description="Тёплое письмо от твоего 8–12-летнего «я» взрослому себе."
        />

        <TemplateCard
          link="/life-agents/epilogist"
          illustration="📘"
          name="Эпилогист"
          description="Спокойный эпилог текущей главы твоей жизни."
        />
      </SimpleGrid>
    </Box>
  );
}
