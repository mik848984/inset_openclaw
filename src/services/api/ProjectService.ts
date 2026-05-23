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

  // title — первая фраза, максимум 60 символов
  const firstSentence =
    safeRaw.split(/[.!?\n]+/)[0]?.trim() || safeRaw.slice(0, 60);
  const title =
    firstSentence.length <= 60
      ? firstSentence
      : firstSentence.slice(0, 59).trimEnd() + '…';

  return {
    title,
    goal: safeRaw,
    description: safeRaw.slice(0, 600),
    instructions:
      'Помогай по шагам. Сначала уточни контекст, потом предложи следующий шаг.',
    nextStep: 'Сформулировать план действий',
    suggestedActions: [
      'Составить план',
      'Собрать контекст',
      'Определить первый шаг',
    ],
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
