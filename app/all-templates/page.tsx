'use client';

// Chakra imports
import { Box, Flex, Heading, SimpleGrid, Button, Text, Stack } from '@chakra-ui/react';
import NavLink from '@/components/link/NavLink';

import TemplateCard from '@/components/card/TemplateCard';
import { AvitoLogo, HHLogo } from '@/components/icons/Icons';
import React from 'react';
import { useUser } from '@/utils/hooks/useUser';

export default function Settings() {
  const { user } = useUser(false);

  return (
    <Box mt={{ base: '70px', md: '0px', xl: '0px' }}>
      {user?.isAdmin && (
        <>
          <Heading>HR-агенты</Heading>
          <Box height="24px" />
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 4 }} spacing="20px">
            <TemplateCard
              link="/hr-agent"
              illustration={
                <Flex gap="6px">
                  <HHLogo w="40px" h="40px" />
                  <AvitoLogo w="48px" h="48px" />
                </Flex>
              }
              name="HR Агенты"
              description="Автоматический поиск кандидатов по устным критериям на платформе Avito и HH.ru"
            />
          </SimpleGrid>
          <Box height="12px" />
        </>
      )}
      <Heading as="h1" size="lg">
        AI-шаблоны
      </Heading>
      <Text mt="2" mb="4" fontSize="sm" color="gray.500">
        Готовые сценарии для писем, статей, маркетинга и личных задач. Заполните несколько полей —
        и ИИСеть создаст текст, который можно доработать в общем чате.
      </Text>
      <Stack direction={{ base: 'column', sm: 'row' }} spacing={3} mb="4">
        <NavLink href="/chat">
          <Button size="sm" colorScheme="blue">
            Открыть чат ИИСеть
          </Button>
        </NavLink>
      </Stack>
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 4 }} spacing="20px">
        <TemplateCard
          link="/translator"
          illustration="🈳"
          name="Переводчик"
          description="Переводите любой тип контента на ваш любимый язык."
        />
        <TemplateCard
          link="/article"
          illustration="📄"
          name="Генератор Статей"
          description="Создайте невероятно кликабельный и SEO-оптимизированный контент для статей."
        />
        <TemplateCard
          link="/simplifier"
          illustration="👶"
          name="Упрощение Контента"
          description="Суммируйте текстовый контент для всех возрастных групп аудитории."
        />
        <TemplateCard
          link="/product-description"
          illustration="🎯"
          name="Описание Продукта"
          description="Создавайте убедительные и высококонверсионные описания для товарных объявлений."
        />
        <TemplateCard
          link="/email-enhancer"
          illustration="📧"
          name="Улучшение Электронных Писем"
          description="Создайте невероятно кликабельное электронное письмо из текстового контента."
        />
        <TemplateCard
          link="/caption"
          illustration="🌄"
          name="Подпись для Instagram"
          description="Создайте убедительную и привлекательную подпись для поста в Instagram."
        />
        <TemplateCard
          link="/faq"
          illustration="❓"
          name="Контент FAQ"
          description="Создайте FAQ для продукта, веб-приложения или целевых страниц."
        />
        <TemplateCard
          link="/name-generator"
          illustration="🏷️"
          name="Генератор Названий Продуктов"
          description="Создайте названия продуктов из примеров слов, тем или отраслей промышленности."
        />
        <TemplateCard
          link="/seo-keywords"
          illustration="📈"
          name="SEO Ключевые Слова"
          description="Создайте высококонверсионные SEO ключевые слова из темы, названия и так далее."
        />
        <TemplateCard
          link="/business-generator"
          illustration="💡"
          name="Генератор Бизнес-Идей"
          description="Создайте бизнес-идеи на основе тем, предпочтений или бюджетов."
        />

        <TemplateCard
          link="/plagiarism-checker"
          illustration="©️"
          name="Проверка на Плагиат"
          description="Проверка на плагиат для предложений и контента."
        />

        <TemplateCard
          link="/domain-name-generator"
          illustration="🔗"
          name="Генератор Доменных Имен"
          description="Создайте отличные доменные имена для вашего бизнеса."
        />
      </SimpleGrid>
    </Box>
  );
}
