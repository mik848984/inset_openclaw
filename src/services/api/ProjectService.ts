/**
 * Server-side helpers for "умные проекты" ИИСеть.
 *
 * Цель: проект — это живое рабочее пространство, где ИИСеть помнит цель,
 * инструкции и память пользователя. Здесь — чистые функции без I/O,
 * чтобы их легко переиспользовать и тестировать.
 */

import type { IProject } from '@/models/project';

/**
 * Простой rule-based brief по сырому описанию проекта.
 * Используется при создании проекта, если LLM-генератор не подключён.
 *
 * Цель — чтобы карточка проекта в sidebar и баннер в чате не выглядели
 * как мусор. Делаем три вещи:
 *   1) Чистим title от вводных «хочу/мне нужно/надо/хотелось бы».
 *   2) Подбираем тематический nextStep по ключевым словам.
 *   3) Возвращаем 3 thematic suggestedActions вместо общих фраз.
 */
export function buildBriefFromRawText(rawText: string): {
  title: string;
  goal: string;
  description: string;
  instructions: string;
  nextStep: string;
  suggestedActions: string[];
} {
  const raw = (rawText || '').replace(/\s+/g, ' ').trim();
  const safeRaw = raw.length > 0 ? raw : 'Новый проект';
  const lower = safeRaw.toLowerCase();

  // ── Human-readable title ─────────────────────────────────────────
  // Срезаем разговорные зачины и обрезаем до 48 символов с многоточием.
  const titleStripped = safeRaw
    .replace(
      /^(хочу|мне нужно|надо|хотелось бы|нужно|планирую|собираюсь|пытаюсь|я хочу|могу ли я|как мне)\s+/i,
      '',
    )
    .replace(/^[,.\s—-]+/, '')
    .trim();
  const firstSentence =
    titleStripped.split(/[.!?\n]+/)[0]?.trim() || titleStripped;
  const titleSeed = firstSentence || safeRaw;
  let title =
    titleSeed.length <= 48 ? titleSeed : titleSeed.slice(0, 47).trimEnd() + '…';
  // Капитализируем первую букву, если ввод был в нижнем регистре.
  if (title.length > 0) {
    title = title.charAt(0).toUpperCase() + title.slice(1);
  }

  // ── Theme detection ──────────────────────────────────────────────
  const hasAny = (...needles: string[]) =>
    needles.some((n) => lower.includes(n));

  let nextStep = 'Составить первый план действий';
  let suggestedActions = [
    'Разобрать цель',
    'Составить план',
    'Определить первый шаг',
  ];

  if (
    hasAny('сайт', 'трафик', 'конверси', 'seo', 'ии-сеть', 'ии сеть', 'иисеть')
  ) {
    nextStep = 'Проверить текущий трафик, страницы и точки конверсии';
    suggestedActions = [
      'Составить growth-план',
      'Найти SEO-возможности',
      'Улучшить конверсию',
    ];
  } else if (
    hasAny(
      'собеседован',
      'работ',
      'вакансию',
      'вакансии',
      'оффер',
      'резюме',
      'cv ',
      ' cv',
    )
  ) {
    nextStep = 'Подготовить позиционирование и ответы на ключевые вопросы';
    suggestedActions = [
      'Собрать историю опыта',
      'Подготовить ответы',
      'Проверить резюме',
    ];
  } else if (
    hasAny(
      'бизнес',
      'кофейн',
      'клиник',
      'кафе',
      'ресторан',
      'запустить',
      'открыть',
      'стартап',
      'окупит',
    )
  ) {
    nextStep = 'Проверить спрос, экономику и риски запуска';
    suggestedActions = [
      'Составить план запуска',
      'Посчитать экономику',
      'Найти риски',
    ];
  } else if (
    hasAny('инвест', 'портфел', 'акци', 'ипотек', 'кредит', 'налог')
  ) {
    nextStep = 'Зафиксировать цели по деньгам и горизонт планирования';
    suggestedActions = [
      'Разобрать стратегию',
      'Составить бюджет',
      'Оценить риски',
    ];
  } else if (
    hasAny(
      'учить',
      'выучить',
      'курс',
      'обучен',
      'английск',
      'программирован',
      'дизайн',
    )
  ) {
    nextStep = 'Определить уровень и собрать дорожную карту обучения';
    suggestedActions = [
      'Оценить текущий уровень',
      'Составить план обучения',
      'Найти ресурсы',
    ];
  } else if (
    hasAny(
      'статью',
      'статья',
      'блог',
      'пост',
      'контент',
      'видео',
      'youtube',
      'сценарий',
    )
  ) {
    nextStep = 'Сформулировать ключевое сообщение и структуру материала';
    suggestedActions = [
      'Собрать ключевые тезисы',
      'Составить структуру',
      'Подобрать примеры',
    ];
  } else if (hasAny('переезд', 'визу', 'визы', 'эмиграц', 'гражданств')) {
    nextStep = 'Зафиксировать страну, сроки и обязательные шаги';
    suggestedActions = [
      'Собрать чек-лист документов',
      'Изучить условия',
      'Прикинуть бюджет',
    ];
  } else if (hasAny('здоров', 'спорт', 'трениров', 'диет', 'похуд', 'сон')) {
    nextStep = 'Зафиксировать цель по здоровью и измеримый прогресс';
    suggestedActions = [
      'Поставить SMART-цель',
      'Собрать план тренировок',
      'Отслеживать прогресс',
    ];
  }

  return {
    title,
    goal: safeRaw,
    description: `Рабочая комната для задачи: ${safeRaw}`.slice(0, 600),
    instructions:
      'Учитывай цель проекта. Отвечай прикладно, предлагай следующий шаг и фиксируй важные решения.',
    nextStep,
    suggestedActions,
  };
}

/**
 * Текст системного промпта, который injected в LLM перед обычной перепиской,
 * если в /chat выбран активный проект.
 *
 * Памяти показываем максимум 10 пунктов — иначе раздуем контекст.
 */
export function buildProjectSystemPrompt(project: IProject): string {
  const lines: string[] = [];
  lines.push('[Контекст проекта ИИСеть]');
  if (project.title) lines.push(`Название: ${project.title}`);
  if (project.goal) lines.push(`Цель: ${project.goal}`);
  if (project.description) lines.push(`Описание: ${project.description}`);
  if (project.instructions)
    lines.push(`Инструкции: ${project.instructions}`);

  const items = (project.memoryItems || []).slice(-10);
  if (items.length > 0) {
    lines.push('Память проекта:');
    for (const it of items) {
      const label =
        it.type === 'decision'
          ? 'Решение'
          : it.type === 'fact'
            ? 'Факт'
            : it.type === 'task'
              ? 'Задача'
              : it.type === 'risk'
                ? 'Риск'
                : 'Заметка';
      lines.push(`- [${label}] ${it.text}`);
    }
  }

  if (project.nextStep) lines.push(`Следующий шаг: ${project.nextStep}`);

  lines.push(
    'Веди пользователя по проекту: помни цель, уточняй детали, предлагай конкретный следующий шаг.',
  );

  return lines.join('\n');
}
