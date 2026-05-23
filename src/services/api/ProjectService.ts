/**
 * Server-side helpers for "умные проекты" ИИСеть.
 *
 * Цель: проект — это живое рабочее пространство, где ИИСеть помнит цель,
 * инструкции и память пользователя. Здесь — чистые функции без I/O,
 * чтобы их легко переиспользовать и тестировать.
 */

import type {
  IProject,
  IProjectBlueprint,
  ProjectDomain,
  ProjectMechanic,
} from '@/models/project';

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

  // ── Blueprint context ─────────────────────────────────────────────
  // Если у проекта есть blueprint — даём LLM понимание роли, чтобы
  // обычный чат-ответ превратился в действие из плана.
  const bp = (project as any).blueprint as IProjectBlueprint | undefined;
  if (bp && typeof bp === 'object') {
    if (bp.domain) lines.push(`Тип проекта (domain): ${bp.domain}`);
    if (Array.isArray(bp.mechanics) && bp.mechanics.length > 0) {
      lines.push(`Активные механики: ${bp.mechanics.join(', ')}`);
    }
    if (Array.isArray(bp.missingInputs) && bp.missingInputs.length > 0) {
      lines.push(
        `Не хватает вводных: ${bp.missingInputs.slice(0, 8).join('; ')}`,
      );
    }
    if (bp.firstStep?.title) {
      lines.push(
        `Первый шаг агента: ${bp.firstStep.title} (${bp.firstStep.type})`,
      );
    }
    if (Array.isArray(bp.steps) && bp.steps.length > 0) {
      lines.push(`План работы: ${bp.steps.slice(0, 7).join(' → ')}`);
    }
    if (bp.primaryDocumentTitle) {
      lines.push(`Главный документ: ${bp.primaryDocumentTitle}`);
    }
    if (Array.isArray(bp.trackerColumns) && bp.trackerColumns.length > 0) {
      lines.push(`Колонки трекера: ${bp.trackerColumns.join(' | ')}`);
    }
  }

  lines.push(
    'Если запрос пользователя похож на выполнение одного из шагов плана — сделай этот шаг, а не отвечай общим текстом. ' +
      'Если для шага нужны вводные, которых пока нет — сначала кратко уточни их. ' +
      'Если результат шага должен быть зафиксирован в документе/трекере проекта — явно скажи об этом в конце ответа.',
  );

  return lines.join('\n');
}

// ── Blueprint generator (rule-based MVP) ─────────────────────────────
// Сознательно без LLM: предсказуемо, дёшево, мгновенно. Тех же keyword-
// heuristics что и в buildBriefFromRawText, но классификация в domain
// + mechanics + конкретные шаги.

const RU_DOMAIN_LABELS: Record<ProjectDomain, string> = {
  business: 'Бизнес и запуск',
  career: 'Карьера и работа',
  health_fitness: 'Здоровье и форма',
  education: 'Обучение и навыки',
  academic_writing: 'Учебная работа',
  creative_writing: 'Творческое письмо',
  content: 'Контент и публикации',
  document_analysis: 'Работа с документом',
  research_decision: 'Исследование и решение',
  travel_relocation: 'Поездка или переезд',
  personal_productivity: 'Личная задача',
  general: 'Общая задача',
};

export function ruDomainLabel(domain: ProjectDomain): string {
  return RU_DOMAIN_LABELS[domain] || 'Общая задача';
}

function detectDomain(rawText: string): ProjectDomain {
  const lower = (rawText || '').toLowerCase();
  const has = (...needles: string[]) =>
    needles.some((n) => lower.includes(n));

  // Order matters — более специфичные кейсы первыми.
  if (has('курсов', 'диплом', 'реферат', 'эссе', 'магистерск', 'бакалаврск'))
    return 'academic_writing';
  if (has('книг', 'роман', 'повесть', 'рассказ', 'сценари', 'manuscript'))
    return 'creative_writing';
  if (
    has(
      'похуд', 'диет', 'спорт', 'трениров', 'фитнес', 'здоров',
      'сон', 'марафон', 'бег', 'йога', 'кардио',
    )
  )
    return 'health_fitness';
  if (
    has(
      'резюме', 'cv ', ' cv', 'собеседован', 'оффер', 'вакансии',
      'вакансию', 'найти работ', 'смена работ', 'смена професси',
    )
  )
    return 'career';
  if (
    has(
      'выучить', 'учить', 'освоить', 'обучен', 'курс по', 'английск',
      'программирован', 'дизайн', 'java', 'python', 'react',
    )
  )
    return 'education';
  if (
    has(
      'бизнес', 'кофейн', 'клиник', 'кафе', 'ресторан', 'стартап',
      'окупит', 'свой бизнес', 'открыть бизн', 'запустить продукт',
      'выручк',
    )
  )
    return 'business';
  if (
    has(
      'переезд', 'визу', 'визы', 'эмиграц', 'гражданств', 'релока',
      'поездк', 'путешестви',
    )
  )
    return 'travel_relocation';
  if (
    has(
      'статью', 'статья', 'блог', 'пост', 'контент', 'видео',
      'youtube', 'тикток', 'tiktok', 'рассылк',
    )
  )
    return 'content';
  if (
    has(
      'разобрать документ', 'pdf', 'договор', 'контракт', 'отчёт',
      'отчет', 'аналитическ', 'разбор файл',
    )
  )
    return 'document_analysis';
  if (
    has(
      'выбрать', 'сравнить', 'определить', 'решить какой', 'что лучше',
      'какой выбрать',
    )
  )
    return 'research_decision';
  if (
    has(
      'инвест', 'портфел', 'акци', 'ипотек', 'кредит', 'налог',
      'бюджет',
    )
  )
    return 'business'; // финансы решения близки к business механики

  return 'general';
}

function mechanicsForDomain(domain: ProjectDomain): ProjectMechanic[] {
  switch (domain) {
    case 'business':
      return [
        'intake_required',
        'web_research_required',
        'calculator_required',
        'comparison_required',
        'single_living_document',
        'progress_tracking',
        'risk_sensitive',
      ];
    case 'career':
      return [
        'intake_required',
        'file_required',
        'web_research_required',
        'single_living_document',
        'progress_tracking',
        'deadline_tracking',
      ];
    case 'health_fitness':
      return [
        'intake_required',
        'calculator_required',
        'metric_tracking',
        'progress_tracking',
        'recurring_checkins',
        'risk_sensitive',
      ];
    case 'education':
      return [
        'intake_required',
        'web_research_required',
        'progress_tracking',
        'multi_artifact_workspace',
      ];
    case 'academic_writing':
      return [
        'intake_required',
        'file_required',
        'web_research_required',
        'source_citation_required',
        'single_living_document',
        'deadline_tracking',
        'progress_tracking',
      ];
    case 'creative_writing':
      return [
        'intake_required',
        'single_living_document',
        'progress_tracking',
      ];
    case 'content':
      return [
        'intake_required',
        'web_research_required',
        'multi_artifact_workspace',
      ];
    case 'document_analysis':
      return [
        'file_required',
        'source_citation_required',
        'multi_artifact_workspace',
      ];
    case 'research_decision':
      return [
        'web_research_required',
        'comparison_required',
        'source_citation_required',
      ];
    case 'travel_relocation':
      return [
        'intake_required',
        'web_research_required',
        'deadline_tracking',
        'calculator_required',
      ];
    case 'personal_productivity':
      return ['progress_tracking', 'deadline_tracking'];
    case 'general':
    default:
      return ['multi_artifact_workspace'];
  }
}

function blueprintForDomain(
  domain: ProjectDomain,
  rawText: string,
  brief: { title: string; goal: string; nextStep: string },
): Omit<IProjectBlueprint, 'domain' | 'mechanics'> {
  const goal = brief.goal || rawText;

  switch (domain) {
    case 'business':
      return {
        missingInputs: [
          'Сфера бизнеса',
          'Город / география',
          'Бюджет на запуск',
          'Срок до старта',
          'Опыт в этой нише',
          'Доступные часы в неделю',
          'Целевой доход',
          'Что уже есть',
          'Ключевые ограничения',
        ],
        firstStep: {
          type: 'intake_form',
          title: 'Анкета идеи бизнеса',
          hint: 'Соберём вводные за 3 минуты — дальше ИИСеть составит исследование рынка, финмодель и план запуска.',
          formKind: 'business',
        },
        steps: [
          'Заполнить анкету идеи бизнеса',
          'Сделать бриф проекта',
          'Исследовать рынок и конкурентов',
          'Построить финмодель и проверить экономику',
          'Собрать риски и митигации',
          'Сформировать план запуска',
          'Завести трекер запуска',
        ],
        artifactPlans: [
          { kind: 'input', title: 'Анкета идеи', hint: 'Базовые вводные о бизнесе.' },
          { kind: 'research', title: 'Исследование рынка', hint: 'Спрос, тренды, аудитория — с источниками.' },
          { kind: 'research', title: 'Конкуренты', hint: '3–7 ключевых игроков и их сильные стороны.' },
          { kind: 'calculation', title: 'Финмодель', hint: 'Юнит-экономика и точка безубыточности.' },
          { kind: 'living_document', title: 'Бизнес-план', hint: 'Главный документ — развивается по шагам.' },
          { kind: 'tracker', title: 'Трекер запуска', hint: 'Гипотезы, задачи, расходы, лиды, статус.' },
        ],
        trackerColumns: ['Гипотеза', 'Задача', 'Расход', 'Лид', 'Решение', 'Статус'],
        primaryDocumentTitle: 'Бизнес-план',
      };

    case 'career':
      return {
        missingInputs: [
          'Целевая роль',
          'Уровень (Junior / Middle / Senior)',
          'География поиска',
          'Срок до выхода',
          'Текущее резюме',
          'Желаемая зарплата',
          'Сильные кейсы',
          'Ограничения',
        ],
        firstStep: {
          type: 'intake_form',
          title: 'Анкета поиска работы',
          hint: 'Зафиксируем целевую роль и кейсы, после загрузим резюме и подготовим план.',
          formKind: 'career',
        },
        steps: [
          'Заполнить анкету поиска работы',
          'Загрузить текущее резюме',
          'Сделать v2 резюме под целевую роль',
          'Подготовить ответы на ключевые вопросы',
          'Найти и оценить вакансии',
          'Зафиксировать прогресс по этапам',
        ],
        artifactPlans: [
          { kind: 'input', title: 'Анкета поиска', hint: 'Целевая роль, кейсы, география.' },
          { kind: 'living_document', title: 'Резюме v2', hint: 'Главный документ — обновляется под вакансии.' },
          { kind: 'generated_document', title: 'Сопроводительные письма', hint: 'Под конкретные вакансии.' },
          { kind: 'tracker', title: 'Трекер вакансий', hint: 'Компания, статус, контакт, следующий шаг.' },
        ],
        trackerColumns: ['Компания', 'Вакансия', 'Статус', 'Контакт', 'Следующий шаг', 'Дата'],
        primaryDocumentTitle: 'Резюме v2',
      };

    case 'health_fitness':
      return {
        missingInputs: [
          'Пол',
          'Возраст',
          'Рост (см)',
          'Текущий вес (кг)',
          'Цель по весу',
          'Целевой срок',
          'Уровень активности',
          'Ограничения по здоровью',
          'Питание сейчас',
          'Тренировки сейчас',
          'Качество сна',
        ],
        firstStep: {
          type: 'intake_form',
          title: 'Анкета исходных данных',
          hint: 'Соберём отправную точку — дальше ИИСеть рассчитает калории и составит план.',
          formKind: 'health',
        },
        steps: [
          'Заполнить анкету исходных данных',
          'Зафиксировать исходную точку',
          'Рассчитать калории и БЖУ',
          'Сформировать план питания',
          'Сформировать план тренировок',
          'Завести трекер прогресса',
          'Раз в неделю сверять факт vs план',
        ],
        artifactPlans: [
          { kind: 'input', title: 'Анкета исходных данных', hint: 'Пол, возраст, рост, вес, цель.' },
          { kind: 'calculation', title: 'Калории и БЖУ', hint: 'Расчёт под цель.' },
          { kind: 'generated_document', title: 'План питания', hint: 'Примерный рацион под бюджет калорий.' },
          { kind: 'generated_document', title: 'План тренировок', hint: 'Недельный сплит под уровень.' },
          { kind: 'tracker', title: 'Трекер прогресса', hint: 'Вес, талия, тренировки, калории, самочувствие.' },
        ],
        trackerColumns: ['Дата', 'Вес', 'Талия', 'Тренировка', 'Калории', 'Самочувствие', 'Заметка'],
        primaryDocumentTitle: undefined,
      };

    case 'education':
      return {
        missingInputs: [
          'Чему хотите научиться',
          'Текущий уровень',
          'Доступное время в неделю',
          'Целевой срок',
          'Цель обучения (работа / проект / интерес)',
          'Предпочитаемый формат (текст / видео / практика)',
        ],
        firstStep: {
          type: 'intake_form',
          title: 'Анкета уровня и цели',
          hint: 'Оценим точку входа и подберём дорожную карту.',
          formKind: 'education',
        },
        steps: [
          'Заполнить анкету уровня',
          'Сделать диагностику текущих знаний',
          'Собрать дорожную карту обучения',
          'Подобрать материалы и задания',
          'Завести трекер недель/тем',
        ],
        artifactPlans: [
          { kind: 'input', title: 'Анкета уровня', hint: 'Текущий уровень и цель обучения.' },
          { kind: 'research', title: 'Материалы и курсы', hint: 'Подборка с пояснениями зачем.' },
          { kind: 'living_document', title: 'Учебный план', hint: 'По неделям, с практикой.' },
          { kind: 'tracker', title: 'Трекер обучения', hint: 'Неделя, тема, задание, статус.' },
        ],
        trackerColumns: ['Неделя', 'Тема', 'Материал', 'Задание', 'Статус'],
        primaryDocumentTitle: 'Учебный план',
      };

    case 'academic_writing':
      return {
        missingInputs: [
          'Тема',
          'Дисциплина',
          'Требуемый объём (страниц)',
          'Дедлайн',
          'Требования / ГОСТ',
          'Методичка (загрузить)',
          'Список литературы (если есть)',
          'Нужна ли практическая часть',
        ],
        firstStep: {
          type: 'intake_form',
          title: 'Анкета требований к работе',
          hint: 'Зафиксируем тему, объём, дедлайн и оформление — потом начнём структуру.',
          formKind: 'academic',
        },
        steps: [
          'Заполнить анкету требований',
          'Загрузить методичку и материалы',
          'Сделать структуру (план содержания)',
          'Собрать список источников',
          'Написать введение',
          'Развернуть основные главы по очереди',
          'Написать заключение',
          'Оформить список литературы и проверить требования',
        ],
        artifactPlans: [
          { kind: 'input', title: 'Анкета требований', hint: 'Тема, объём, дедлайн, ГОСТ.' },
          { kind: 'research', title: 'Список источников', hint: 'С цитатами и страницами.' },
          { kind: 'living_document', title: 'Курсовая работа', hint: 'Главный документ — пишется по разделам.' },
          { kind: 'tracker', title: 'Трекер разделов', hint: 'Введение, главы, заключение, литература.' },
        ],
        trackerColumns: ['Раздел', 'Готовность %', 'Источники', 'Заметки'],
        primaryDocumentTitle: 'Курсовая работа',
      };

    case 'creative_writing':
      return {
        missingInputs: [
          'Жанр',
          'Аудитория',
          'Логлайн (одна фраза)',
          'Объём (слов / страниц)',
          'Дедлайн (если есть)',
          'Основные персонажи',
          'Конфликт',
          'Мир / сеттинг',
        ],
        firstStep: {
          type: 'intake_form',
          title: 'Анкета книги',
          hint: 'Соберём концепцию, дальше — структура, персонажи, главный manuscript.',
          formKind: 'general',
        },
        steps: [
          'Заполнить анкету книги',
          'Сделать концепцию и логлайн',
          'Сделать структуру (главы / акты)',
          'Развернуть персонажей',
          'Завести главный manuscript',
          'Писать по главам, обновлять word count',
        ],
        artifactPlans: [
          { kind: 'input', title: 'Анкета книги', hint: 'Жанр, аудитория, логлайн.' },
          { kind: 'generated_document', title: 'Структура', hint: 'Акты и главы.' },
          { kind: 'generated_document', title: 'Персонажи', hint: 'Карточки главных героев.' },
          { kind: 'living_document', title: 'Рукопись', hint: 'Главный manuscript — пишется по главам.' },
          { kind: 'tracker', title: 'Трекер глав', hint: 'Глава, статус, word count, заметка редактуры.' },
        ],
        trackerColumns: ['Глава', 'Статус', 'Слов', 'Редактура'],
        primaryDocumentTitle: 'Рукопись',
      };

    case 'content':
      return {
        missingInputs: [
          'Тема / ниша',
          'Аудитория',
          'Площадка',
          'Тон',
          'Частота публикаций',
        ],
        firstStep: {
          type: 'intake_form',
          title: 'Анкета контент-плана',
          hint: 'Соберём вводные — дальше ИИСеть подберёт темы и оформит план.',
          formKind: 'general',
        },
        steps: [
          'Заполнить анкету',
          'Сгенерировать темы под аудиторию',
          'Сделать редакторский план',
          'Готовить публикации по очереди',
        ],
        artifactPlans: [
          { kind: 'input', title: 'Анкета контента', hint: 'Ниша, площадка, аудитория.' },
          { kind: 'generated_document', title: 'Темы и заголовки', hint: 'Сильные заголовки под аудиторию.' },
          { kind: 'living_document', title: 'Контент-план', hint: 'Главный план — обновляется по неделям.' },
        ],
        trackerColumns: ['Дата', 'Площадка', 'Тема', 'Статус'],
        primaryDocumentTitle: 'Контент-план',
      };

    case 'document_analysis':
      return {
        missingInputs: ['Документы для разбора'],
        firstStep: {
          type: 'upload_sources',
          title: 'Загрузить документы',
          hint: 'Прикрепите PDF, DOCX или ссылки — ИИСеть разберёт и ответит по содержанию.',
        },
        steps: [
          'Загрузить документы в проект',
          'Получить summary каждого',
          'Найти ключевые факты и риски',
          'Сравнить документы между собой',
        ],
        artifactPlans: [
          { kind: 'generated_document', title: 'Summary документов', hint: 'Кратко по каждому.' },
          { kind: 'generated_document', title: 'Ключевые факты', hint: 'Цитаты с источниками.' },
          { kind: 'comparison', title: 'Сравнение', hint: 'Где совпадают, где расходятся.' },
        ],
      };

    case 'research_decision':
      return {
        missingInputs: ['Что сравниваем', 'Критерии выбора'],
        firstStep: {
          type: 'web_research',
          title: 'Запустить исследование',
          hint: 'ИИСеть найдёт информацию по вашему вопросу со ссылками на источники.',
        },
        steps: [
          'Сформулировать критерии выбора',
          'Запустить веб-исследование',
          'Сравнить варианты по критериям',
          'Зафиксировать решение',
        ],
        artifactPlans: [
          { kind: 'research', title: 'Найденные варианты', hint: 'С источниками.' },
          { kind: 'comparison', title: 'Сравнение по критериям', hint: 'Таблица плюсов/минусов.' },
        ],
      };

    case 'travel_relocation':
      return {
        missingInputs: [
          'Страна / город',
          'Сроки',
          'Бюджет',
          'Тип (поездка / переезд / виза)',
          'Состав (один / семья)',
        ],
        firstStep: {
          type: 'intake_form',
          title: 'Анкета поездки',
          hint: 'Соберём вводные — потом ИИСеть проверит требования, документы и бюджет.',
          formKind: 'general',
        },
        steps: [
          'Заполнить анкету',
          'Найти актуальные требования и сроки',
          'Собрать чек-лист документов',
          'Прикинуть бюджет',
          'Завести трекер дедлайнов',
        ],
        artifactPlans: [
          { kind: 'input', title: 'Анкета поездки', hint: 'Страна, сроки, бюджет.' },
          { kind: 'research', title: 'Требования', hint: 'Виза, документы, сроки.' },
          { kind: 'calculation', title: 'Бюджет', hint: 'Прикидка по статьям расходов.' },
          { kind: 'tracker', title: 'Трекер дедлайнов', hint: 'Что, к какой дате, статус.' },
        ],
        trackerColumns: ['Задача', 'Дедлайн', 'Статус'],
      };

    case 'personal_productivity':
      return {
        missingInputs: ['Чего хотите добиться', 'Срок'],
        firstStep: {
          type: 'intake_form',
          title: 'Уточнить задачу',
          hint: 'Зафиксируем результат и срок — ИИСеть подберёт первые шаги.',
          formKind: 'general',
        },
        steps: [
          'Уточнить результат и срок',
          'Составить план шагов',
          'Завести трекер прогресса',
        ],
        artifactPlans: [
          { kind: 'living_document', title: 'План', hint: 'Список конкретных шагов.' },
          { kind: 'tracker', title: 'Трекер', hint: 'Задачи и статусы.' },
        ],
        trackerColumns: ['Задача', 'Дата', 'Статус'],
      };

    case 'general':
    default:
      return {
        missingInputs: ['Желаемый результат', 'Срок (если есть)'],
        firstStep: {
          type: 'intake_form',
          title: 'Уточнить задачу',
          hint: 'Расскажите подробнее, чего хотите добиться, — соберём план.',
          formKind: 'general',
        },
        steps: [
          'Уточнить результат',
          'Составить план шагов',
          'Сделать первый шаг',
        ],
        artifactPlans: [
          { kind: 'living_document', title: 'План', hint: 'Список шагов под задачу.' },
        ],
      };
  }
}

export function buildBlueprintFromRawText(
  rawText: string,
  brief: { title: string; goal: string; nextStep: string },
): IProjectBlueprint {
  const domain = detectDomain(rawText);
  const mechanics = mechanicsForDomain(domain);
  const rest = blueprintForDomain(domain, rawText, brief);
  return {
    domain,
    mechanics,
    ...rest,
  };
}
