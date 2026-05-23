'use client';

/**
 * Project Command Center — workflow-страница проекта.
 *
 * Это НЕ копия чата с baseline-карточкой сверху. Это:
 *   • один header без дублирования;
 *   • NextStepCard — реальное действие из roadmap (открывает widget,
 *     НЕ создаёт chat thread «выполни следующий шаг»);
 *   • BaselineCard — summary анкеты (intake state), редактируется и
 *     сбрасывается без создания новых документов;
 *   • TrackerWidget (для health_fitness) — старт/цель/текущий/изменение
 *     + таблица замеров + кнопка «Добавить замер»;
 *   • RoadmapCard — stateful шаги (locked/todo/active/done), клик
 *     открывает соответствующий widget;
 *   • MaterialsCard — sources;
 *   • DocumentsCard — артефакты, отфильтрованные от intake/tracker
 *     (это state, не документы), с чистым preview без сырого markdown.
 *
 * intake (анкета) и tracker (замеры) — разные сущности:
 *   intake = единая baseline, обновляется как одно целое (PATCH
 *           /api/projects/[id]/intake).
 *   tracker.entries = массив, новые замеры добавляются $push
 *           (POST /api/projects/[id]/tracker/entries).
 */

import {
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  Icon,
  IconButton,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  SimpleGrid,
  Spinner,
  Text,
  Textarea,
  useColorModeValue,
  useToast,
  VStack,
} from '@chakra-ui/react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  MdAdd,
  MdArrowBack,
  MdAutoAwesome,
  MdCheck,
  MdCheckCircle,
  MdDeleteForever,
  MdDescription,
  MdEdit,
  MdFolderOpen,
  MdInsertDriveFile,
  MdLink as MdLinkIcon,
  MdLock,
  MdNoteAlt,
  MdRadioButtonUnchecked,
  MdRefresh,
  MdRestartAlt,
  MdTrendingUp,
  MdWarningAmber,
} from 'react-icons/md';
import {
  projectsService,
  IProjectUI,
  IProjectSourceUI,
  IProjectArtifactUI,
  ProjectArtifactKind,
  IProjectAgentStateUI,
  IProjectIntakeUI,
  IProjectTrackerEntryUI,
  IProjectFirstStepUI,
  IRoadmapStepUI,
  RU_DOMAIN_LABELS_UI,
} from '@/services/ui/ProjectsService';
import ProjectIntakeForm from '@/components/chat/components/ProjectIntakeForm';

const FONT_DISPLAY = `'SF Pro Display', -apple-system, BlinkMacSystemFont, system-ui, sans-serif`;
const FONT_TEXT = `'SF Pro Text', -apple-system, BlinkMacSystemFont, system-ui, sans-serif`;

const ACCENT_BLUE = '#0066cc';
const ACCENT_BLUE_HOVER = '#0071e3';
const ACCENT_BLUE_ON_DARK = '#2997ff';

interface Props {
  projectId: string;
  onOpenSources: () => void;
  /** Сохранён для совместимости; теперь в основном workflow не нужен. */
  onCreateThread?: () => void;
  /** Для шагов, которые честно нужно делегировать в LLM (web_research,
   *  document_generation). Не используется для intake/tracker — те
   *  работают локально. */
  onSendAction: (text: string) => void;
}

// ── Health-fitness roadmap (state-driven) ──────────────────────
function buildHealthRoadmap(
  agentState: IProjectAgentStateUI | undefined,
  artifacts: IProjectArtifactUI[],
): IRoadmapStepUI[] {
  const intake = agentState?.intake;
  const tracker = agentState?.tracker;
  const hasIntake = !!(intake && intake.startWeightKg);
  const hasTracker = !!tracker;
  const entries = tracker?.entries || [];
  const hasEntries = entries.length > 0;
  const hasCalculation = artifacts.some(
    (a) => a.title?.toLowerCase().includes('калори') || a.title?.toLowerCase().includes('бжу'),
  );
  const hasNutritionPlan = artifacts.some(
    (a) => a.title?.toLowerCase().includes('план питания'),
  );
  const hasTrainingPlan = artifacts.some(
    (a) => a.title?.toLowerCase().includes('план трениров'),
  );

  return [
    {
      id: 'intake',
      title: 'Заполнить исходные данные',
      widgetType: 'intake_form',
      actionLabel: hasIntake ? 'Изменить анкету' : 'Заполнить анкету',
      status: hasIntake ? 'done' : 'active',
      hint: hasIntake
        ? 'Anкета заполнена — можно изменить, если данные обновились.'
        : 'Базовые вводные: рост, вес, цель, активность, ограничения.',
    },
    {
      id: 'tracker_create',
      title: 'Создать трекер прогресса',
      widgetType: 'tracker',
      actionLabel: hasTracker ? 'Открыть трекер' : 'Создать трекер',
      status: !hasIntake ? 'locked' : hasTracker ? 'done' : 'active',
      hint: 'Трекер сравнивает факт с исходной точкой во времени.',
    },
    {
      id: 'tracker_entry',
      title: 'Добавить замер',
      widgetType: 'tracker',
      actionLabel: 'Добавить замер',
      status: !hasTracker ? 'locked' : hasEntries ? 'done' : 'active',
      hint: 'Вес, талия, тренировка, самочувствие — раз в несколько дней.',
    },
    {
      id: 'calorie_calc',
      title: 'Рассчитать калории и БЖУ',
      widgetType: 'calculator',
      actionLabel: hasCalculation ? 'Пересчитать' : 'Рассчитать',
      status: !hasIntake ? 'locked' : hasCalculation ? 'done' : 'todo',
      hint: 'Дневная норма калорий и БЖУ под цель.',
    },
    {
      id: 'nutrition_plan',
      title: 'Сформировать план питания',
      widgetType: 'document',
      actionLabel: hasNutritionPlan ? 'Открыть план' : 'Создать план',
      status:
        !hasCalculation ? 'locked' : hasNutritionPlan ? 'done' : 'todo',
      hint: 'Примерный рацион под бюджет калорий.',
    },
    {
      id: 'training_plan',
      title: 'Сформировать план тренировок',
      widgetType: 'document',
      actionLabel: hasTrainingPlan ? 'Открыть план' : 'Создать план',
      status: !hasIntake ? 'locked' : hasTrainingPlan ? 'done' : 'todo',
      hint: 'Недельный сплит под уровень активности.',
    },
    {
      id: 'review',
      title: 'Раз в неделю сверять факт с планом',
      widgetType: 'review',
      actionLabel: 'Сделать сверку',
      status: entries.length < 3 ? 'locked' : 'todo',
      hint: 'Корректировка калорий/тренировок по динамике веса.',
    },
  ];
}

// ── Education roadmap (state-driven, full domain coverage) ────
function buildEducationRoadmap(
  agentState: IProjectAgentStateUI | undefined,
  artifacts: IProjectArtifactUI[],
): IRoadmapStepUI[] {
  const intake = agentState?.intake;
  const tracker = agentState?.tracker;
  const hasIntake = !!(intake && (intake as any).learningLevel);
  const hasTracker = !!tracker;
  const titleHas = (needle: string) =>
    artifacts.some((a) => (a.title || '').toLowerCase().includes(needle));
  const hasDiagnostic = titleHas('диагност');
  const hasRoadmap = titleHas('дорожн') || titleHas('roadmap') || titleHas('учебн');
  const hasMaterials = titleHas('материал') || titleHas('задани');

  return [
    {
      id: 'intake',
      title: 'Заполнить анкету обучения',
      widgetType: 'intake_form',
      actionLabel: hasIntake ? 'Изменить анкету' : 'Заполнить анкету',
      status: hasIntake ? 'done' : 'active',
      hint: hasIntake
        ? 'Уровень, цель и формат собраны — можно дополнить, если что-то изменилось.'
        : 'Уровень, цель, формат обучения и доступное время.',
    },
    {
      id: 'diagnostic',
      title: 'Сделать диагностику текущих знаний',
      widgetType: 'diagnostic',
      actionLabel: hasDiagnostic ? 'Открыть диагностику' : 'Пройти диагностику',
      status: !hasIntake ? 'locked' : hasDiagnostic ? 'done' : 'active',
      hint: 'Что уже знаете и где пробелы — нужно, чтобы план был под вас.',
    },
    {
      id: 'learning_roadmap',
      title: 'Собрать дорожную карту обучения',
      widgetType: 'learning_roadmap',
      actionLabel: hasRoadmap ? 'Открыть карту' : 'Создать карту',
      status: !hasIntake ? 'locked' : hasRoadmap ? 'done' : 'todo',
      hint: 'Пошаговый план тем с критериями «понял / умею».',
    },
    {
      id: 'learning_materials',
      title: 'Подобрать материалы и задания',
      widgetType: 'learning_materials',
      actionLabel: hasMaterials ? 'Открыть подборку' : 'Подобрать материалы',
      status: !hasRoadmap ? 'locked' : hasMaterials ? 'done' : 'todo',
      hint: 'Курсы, статьи, видео и практические задания.',
    },
    {
      id: 'tracker_create',
      title: 'Завести трекер недель и тем',
      widgetType: 'learning_tracker',
      actionLabel: hasTracker ? 'Открыть трекер' : 'Создать трекер',
      status: !hasIntake ? 'locked' : hasTracker ? 'done' : 'active',
      hint: 'Неделя, тема, материал, задание, статус, комментарий.',
    },
    {
      id: 'tracker_entry',
      title: 'Добавить запись в трекер обучения',
      widgetType: 'learning_tracker',
      actionLabel: 'Добавить запись',
      status:
        !hasTracker ? 'locked' : (tracker?.entries?.length || 0) > 0 ? 'done' : 'active',
      hint: 'Раз в неделю фиксируйте, что изучили и где застряли.',
    },
    {
      id: 'learning_review',
      title: 'Еженедельная сверка прогресса',
      widgetType: 'learning_review',
      actionLabel: 'Провести сверку',
      status:
        (tracker?.entries?.length || 0) < 2 ? 'locked' : 'todo',
      hint: 'Что прошли, где застряли, какой следующий учебный шаг.',
    },
  ];
}

// ── Generic roadmap: smart widget inference (no health text) ──
// Раньше всем шагам (кроме первого) присваивался widgetType='review',
// а review-handler был health-specific. Теперь делаем умную инференцию
// типа по словам в заголовке шага.
function inferWidgetFromTitle(
  title: string,
  blueprintFirst?: IProjectFirstStepUI,
): IRoadmapStepUI['widgetType'] {
  const t = (title || '').toLowerCase();
  if (/анкет|опросник|уточн|вводн/.test(t)) return 'intake_form';
  if (/трекер|учёт|учет|замер/.test(t)) return 'tracker';
  if (/диагност|оценк[уи] уровн|тест уровн/.test(t)) return 'diagnostic';
  if (/дорожн|roadmap|план|структур|содержани/.test(t)) return 'document';
  if (/материал|подбер|подбор|источник|загруз/.test(t)) return 'learning_materials';
  if (/расч[её]т|калькулятор|финансы|финмодель/.test(t)) return 'calculator';
  if (/исследован|рынок|анализ|сравни|web/.test(t)) return 'web_research';
  if (/документ|brief|обзор|резюме|план питания|план трениров/.test(t)) return 'document';
  if (/сверк|ретро|обзор недели|еженедель/.test(t)) return 'review';
  // Fallback к типу первого шага в blueprint, иначе review.
  return blueprintFirst?.type === 'upload_sources'
    ? 'document'
    : blueprintFirst?.type === 'web_research'
      ? 'web_research'
      : 'review';
}

function buildGenericRoadmap(
  project: IProjectUI,
): IRoadmapStepUI[] {
  const intake = project.agentState?.intake;
  const hasIntake = !!(intake && Object.keys(intake).some((k) => k !== 'updatedAt'));
  const tracker = project.agentState?.tracker;
  const hasTracker = !!tracker;
  const bpSteps = project.blueprint?.steps || [];
  const firstStepType = project.blueprint?.firstStep;

  return bpSteps.map((title, i) => {
    const inferred = inferWidgetFromTitle(title, firstStepType);
    // Первый шаг — обычно intake_form, если blueprint так сказал.
    const widget =
      i === 0 && firstStepType?.type === 'intake_form' ? 'intake_form' : inferred;

    // Простая state-логика: intake_form done при hasIntake; tracker done
    // при hasTracker; первый незаблокированный — active.
    let status: IRoadmapStepUI['status'] = 'todo';
    if (widget === 'intake_form') {
      status = hasIntake ? 'done' : 'active';
    } else if (widget === 'tracker') {
      status = !hasIntake ? 'locked' : hasTracker ? 'done' : 'active';
    } else {
      status = !hasIntake && i > 0 ? 'locked' : 'todo';
    }

    const actionLabel =
      widget === 'intake_form'
        ? hasIntake
          ? 'Изменить'
          : 'Заполнить'
        : widget === 'tracker'
          ? hasTracker
            ? 'Открыть трекер'
            : 'Создать трекер'
          : widget === 'document'
            ? 'Создать документ'
            : widget === 'calculator'
              ? 'Рассчитать'
              : widget === 'web_research'
                ? 'Запустить исследование'
                : widget === 'learning_materials'
                  ? 'Подобрать'
                  : 'Открыть';
    return {
      id: `step_${i}`,
      title,
      widgetType: widget,
      actionLabel,
      status,
    };
  });
}

// ── Pretty preview for documents (no raw markdown) ──────────────
function cleanPreview(text: string, maxChars = 220): string {
  if (!text) return '';
  // Удаляем разметку таблиц, заголовки, символы выделения.
  const cleaned = text
    .replace(/^[#>\-*\s]+/gm, '')
    .replace(/\|/g, ' · ')
    .replace(/[*_`]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  return cleaned.length > maxChars
    ? cleaned.slice(0, maxChars - 1).trimEnd() + '…'
    : cleaned;
}

// ─────────────────────────────────────────────────────────────────
function ProjectCommandCenter({
  projectId,
  onOpenSources,
  onSendAction,
}: Props) {
  const toast = useToast();

  const [project, setProject] = useState<IProjectUI | null>(null);
  const [sources, setSources] = useState<IProjectSourceUI[]>([]);
  const [artifacts, setArtifacts] = useState<IProjectArtifactUI[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const router = useRouter();

  const [intakeOpen, setIntakeOpen] = useState(false);
  const [entryOpen, setEntryOpen] = useState(false);
  const [learningEntryOpen, setLearningEntryOpen] = useState(false);
  const [creatingTracker, setCreatingTracker] = useState(false);
  const [resettingIntake, setResettingIntake] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [eduWorking, setEduWorking] = useState<string | null>(null);

  // ── Tokens ───────────────────────────────────────────────────
  const surface = useColorModeValue('#ffffff', 'rgba(28,28,32,0.92)');
  const surfaceSoft = useColorModeValue('#fafafb', 'rgba(255,255,255,0.04)');
  const hairline = useColorModeValue(
    'rgba(15,23,42,0.08)',
    'rgba(255,255,255,0.10)',
  );
  const accentSoftBg = useColorModeValue(
    'rgba(0,102,204,0.08)',
    'rgba(41,151,255,0.16)',
  );
  const textPrimary = useColorModeValue('#1d1d1f', '#f5f5f7');
  const textSecondary = useColorModeValue(
    '#6e6e73',
    'rgba(245,245,247,0.65)',
  );
  const textTertiary = useColorModeValue(
    '#86868b',
    'rgba(245,245,247,0.45)',
  );
  const accent = useColorModeValue(ACCENT_BLUE, ACCENT_BLUE_ON_DARK);

  // ── Load ──────────────────────────────────────────────────────
  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const [p, src, art] = await Promise.all([
        projectsService.get(projectId),
        projectsService.listSources(projectId),
        projectsService.listArtifacts(projectId),
      ]);
      setProject(p);
      setSources(src);
      setArtifacts(art);
    } catch (e) {
      console.error('[ProjectCommandCenter] load failed', e);
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);
  useEffect(() => {
    void load();
  }, [load]);

  const domain = project?.blueprint?.domain;
  const isHealth = domain === 'health_fitness';
  const isEducation = domain === 'education';

  // Roadmap depends on state. Active step = first non-locked non-done.
  // Domain-aware dispatch:
  //   health_fitness → buildHealthRoadmap (weight/calories/training)
  //   education      → buildEducationRoadmap (diagnostic/roadmap/materials)
  //   остальное      → buildGenericRoadmap с smart inference
  const roadmap: IRoadmapStepUI[] = useMemo(() => {
    if (!project) return [];
    if (isHealth) return buildHealthRoadmap(project.agentState, artifacts);
    if (isEducation)
      return buildEducationRoadmap(project.agentState, artifacts);
    return buildGenericRoadmap(project);
  }, [project, artifacts, isHealth, isEducation]);

  const activeStep =
    roadmap.find((s) => s.status === 'active') ||
    roadmap.find((s) => s.status === 'todo') ||
    null;

  // ── Step action dispatcher ────────────────────────────────────
  const handleStepAction = (step: IRoadmapStepUI) => {
    if (step.status === 'locked') {
      toast({
        title: 'Шаг пока заблокирован',
        description: 'Сначала закройте предыдущий шаг.',
        status: 'info',
        duration: 2200,
        isClosable: true,
      });
      return;
    }
    switch (step.widgetType) {
      case 'intake_form':
        setIntakeOpen(true);
        return;
      case 'tracker':
        // Health weight-tracker.
        if (!project?.agentState?.tracker) {
          void handleCreateTracker(true);
        } else {
          setEntryOpen(true);
        }
        return;
      case 'learning_tracker':
        if (!project?.agentState?.tracker) {
          void handleCreateTracker(true);
        } else {
          setLearningEntryOpen(true);
        }
        return;
      case 'diagnostic':
        void handleEducationArtifact(
          'brief',
          'Диагностика текущего уровня',
        );
        return;
      case 'learning_roadmap':
        void handleEducationArtifact('plan', 'Дорожная карта обучения');
        return;
      case 'learning_materials':
        void handleEducationArtifact('brief', 'Материалы и задания');
        return;
      case 'calculator':
        void handleCalculator();
        return;
      case 'document':
        void handleDocument(step);
        return;
      case 'web_research':
        onSendAction(
          `Запусти веб-исследование под цель проекта «${project?.title || ''}». ` +
            `Используй интернет-поиск, обязательно приведи источники [1], [2] для ключевых утверждений.`,
        );
        return;
      case 'learning_review':
        // Domain-neutral для education — ни калорий, ни тренировок.
        onSendAction(
          `Сверь прогресс обучения по трекеру: какие темы пройдены, ` +
            `где застряли и какой следующий учебный шаг под цель ` +
            `«${project?.goal || project?.title || ''}».`,
        );
        return;
      case 'review':
      default:
        // Generic neutral — БЕЗ упоминания health (калории/тренировки/вес).
        onSendAction(
          `Сверь текущее состояние проекта «${project?.title || ''}» с целью, ` +
            `источниками, документами и трекером. Что уже сделано, что застряло, ` +
            `какой следующий конкретный шаг?`,
        );
        return;
    }
  };

  // ── Tracker handlers (domain-aware) ──────────────────────────
  // health_fitness → требуется intake.startWeightKg, создаём baseline-
  //                  entry с весом из анкеты.
  // education      → требуется intake (любое поле), создаём пустой
  //                  tracker типа learning_progress.
  // прочие домены  → создаём пустой tracker без health-assumptions.
  const handleCreateTracker = async (openEntryAfter = false) => {
    if (!project) return;
    if (project.agentState?.tracker) {
      if (openEntryAfter) {
        if (isEducation) setLearningEntryOpen(true);
        else setEntryOpen(true);
      }
      return;
    }
    const intake = project.agentState?.intake;
    const hasIntake =
      !!intake && Object.keys(intake).some((k) => k !== 'updatedAt');
    if (!hasIntake) {
      toast({
        title: 'Сначала заполните исходные данные',
        description:
          'Анкета нужна, чтобы трекер строился под вашу цель и контекст.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      setIntakeOpen(true);
      return;
    }

    setCreatingTracker(true);
    try {
      const today = new Date().toISOString().slice(0, 10);

      if (isHealth) {
        if (!intake?.startWeightKg) {
          toast({
            title: 'Не указан стартовый вес',
            description: 'Откройте анкету и добавьте текущий вес.',
            status: 'warning',
            duration: 2800,
          });
          setCreatingTracker(false);
          setIntakeOpen(true);
          return;
        }
        const result = await projectsService.addTrackerEntry(projectId, {
          date: today,
          weightKg: intake.startWeightKg,
          comment: 'Стартовая точка из анкеты',
        });
        if (result?.project) {
          setProject(result.project);
          toast({
            title: 'Трекер создан',
            description: 'Добавлена стартовая запись из анкеты.',
            status: 'success',
            duration: 2200,
            isClosable: true,
          });
          if (openEntryAfter) setEntryOpen(true);
        }
        return;
      }

      if (isEducation) {
        // Учебный tracker: тип learning_progress, первая запись —
        // неделя 1 «Старт обучения». Никакого веса.
        const result = await projectsService.addTrackerEntry(projectId, {
          date: today,
          // free-form keys: backend пропустит string/number поля «как есть».
          ...({
            week: '1',
            topic: 'Старт обучения',
            status: 'planned',
          } as any),
          comment: 'Трекер создан из анкеты обучения',
          ...({ type: 'learning_progress' } as any),
        });
        if (result?.project) {
          setProject(result.project);
          toast({
            title: 'Трекер обучения создан',
            status: 'success',
            duration: 2200,
            isClosable: true,
          });
          if (openEntryAfter) setLearningEntryOpen(true);
        }
        return;
      }

      // Generic: создаём tracker пустой записью «Старт».
      const result = await projectsService.addTrackerEntry(projectId, {
        date: today,
        comment: 'Трекер создан',
      });
      if (result?.project) {
        setProject(result.project);
        toast({ title: 'Трекер создан', status: 'success', duration: 2000 });
        if (openEntryAfter) setEntryOpen(true);
      }
      return;
    } catch (e) {
      console.error(e);
      toast({
        title: 'Не удалось создать трекер',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setCreatingTracker(false);
    }
  };

  const handleAddEntry = async (
    entry: Omit<IProjectTrackerEntryUI, 'id' | 'createdAt'>,
  ) => {
    const result = await projectsService.addTrackerEntry(projectId, entry);
    if (result?.project) {
      setProject(result.project);
      toast({
        title: 'Замер добавлен',
        status: 'success',
        duration: 1800,
        isClosable: true,
      });
      return true;
    }
    toast({
      title: 'Не удалось сохранить замер',
      status: 'error',
      duration: 2500,
      isClosable: true,
    });
    return false;
  };

  const handleDeleteEntry = async (entryId: string) => {
    const ok = await projectsService.deleteTrackerEntry(projectId, entryId);
    if (ok) {
      setProject(ok);
      toast({
        title: 'Замер удалён',
        status: 'success',
        duration: 1500,
      });
    }
  };

  // ── Intake handlers ──────────────────────────────────────────
  const handleResetIntake = async () => {
    if (typeof window !== 'undefined') {
      const ok = window.confirm(
        'Сбросить исходные данные? Tracker и документы останутся.',
      );
      if (!ok) return;
    }
    setResettingIntake(true);
    try {
      const updated = await projectsService.resetIntake(projectId);
      if (updated) {
        setProject(updated);
        toast({
          title: 'Исходные данные сброшены',
          status: 'success',
          duration: 2000,
        });
      }
    } finally {
      setResettingIntake(false);
    }
  };

  // ── Education artifacts (diagnostic / roadmap / materials) ──
  // Создаём через существующий artifacts API. Backend LLM-генератор
  // получит project context (goal + intake) и сгенерирует контент.
  // Результат появляется в DocumentsCard с чистым preview.
  // НЕ уходим в чат-prompt.
  const handleEducationArtifact = async (
    kind: ProjectArtifactKind,
    expectedTitleHint: string,
  ) => {
    setEduWorking(expectedTitleHint);
    try {
      const a = await projectsService.createArtifact(projectId, kind);
      if (a) {
        setArtifacts((prev) => [a, ...prev]);
        toast({
          title: 'Готово',
          description: a.title || expectedTitleHint,
          status: 'success',
          duration: 2400,
          isClosable: true,
        });
      } else {
        throw new Error('null artifact');
      }
    } catch (e) {
      console.error(e);
      toast({
        title: 'Не удалось создать документ',
        description: 'Попробуйте ещё раз через минуту.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setEduWorking(null);
    }
  };

  // ── Delete project (cascade) ────────────────────────────────
  const handleDeleteProject = async () => {
    setDeleting(true);
    try {
      const ok = await projectsService.remove(projectId);
      if (!ok) throw new Error('delete failed');
      toast({
        title: 'Проект удалён',
        description: 'Источники, файлы, документы и трекер удалены.',
        status: 'success',
        duration: 2500,
        isClosable: true,
      });
      setDeleteOpen(false);
      // Перевести пользователя из удалённого проекта.
      // URL без projectId — обычный чат, не сломанный state.
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        url.searchParams.delete('projectId');
        url.searchParams.delete('threadId');
        router.replace(url.pathname + (url.search || ''));
      } else {
        router.replace('/chat');
      }
    } catch (e) {
      console.error(e);
      toast({
        title: 'Не удалось удалить проект',
        description: 'Попробуйте ещё раз через минуту.',
        status: 'error',
        duration: 3500,
        isClosable: true,
      });
    } finally {
      setDeleting(false);
    }
  };

  // ── Calculator / document step (delegate to LLM via chat) ──
  const handleCalculator = async () => {
    if (!project?.agentState?.intake) {
      toast({
        title: 'Нет исходных данных',
        description: 'Сначала заполните анкету.',
        status: 'warning',
        duration: 2500,
      });
      setIntakeOpen(true);
      return;
    }
    // Создаём calculation artifact через существующий route. Для MVP
    // это даёт чистый markdown-доку с расчётом БЖУ, видимый в
    // Documents. Не дублируем intake — это другой type.
    try {
      const a = await projectsService.createArtifact(
        projectId,
        'brief' as ProjectArtifactKind, // 'brief' — short overview; будет показан без сырого markdown
      );
      if (a) {
        setArtifacts((prev) => [a, ...prev]);
        toast({
          title: 'Расчёт создан',
          description: 'Готово в блоке «Документы».',
          status: 'success',
          duration: 2200,
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDocument = async (step: IRoadmapStepUI) => {
    // Простой mapping: nutrition_plan → plan, training_plan → plan,
    // generic → brief. Документ создаётся через существующий artifacts
    // API, появляется в блоке Documents с чистым preview.
    const kind: ProjectArtifactKind =
      step.id === 'nutrition_plan' || step.id === 'training_plan'
        ? 'plan'
        : 'brief';
    try {
      const a = await projectsService.createArtifact(projectId, kind);
      if (a) {
        setArtifacts((prev) => [a, ...prev]);
        toast({
          title: 'Документ создан',
          description: a.title,
          status: 'success',
          duration: 2200,
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  // ── Render guards ────────────────────────────────────────────
  if (isLoading && !project) {
    return (
      <Flex justify="center" py="64px">
        <Spinner color={accent} />
      </Flex>
    );
  }
  if (!project) {
    return (
      <Box py="24px">
        <Text fontSize="14px" color={textSecondary}>
          Не удалось загрузить проект.
        </Text>
      </Box>
    );
  }

  const intake = project.agentState?.intake;
  const tracker = project.agentState?.tracker;
  const visibleArtifacts = artifacts.filter(
    (a) => a.type !== 'intake' && a.type !== 'tracker',
  );

  return (
    <Flex direction="column" gap="20px" width="100%" maxW="100%" minW={0}>
      {/* ── Header ─────────────────────────────────────────── */}
      <Box
        bg={surface}
        border="1px solid"
        borderColor={hairline}
        borderRadius={{ base: '18px', md: '22px' }}
        p={{ base: '20px', md: '28px' }}
        boxShadow="0 1px 2px rgba(15,23,42,0.04), 0 12px 32px -16px rgba(15,23,42,0.12)"
      >
        <Flex align="center" gap="8px" mb="10px" flexWrap="wrap">
          <Box
            px="10px"
            py="4px"
            borderRadius="9999px"
            bg={accentSoftBg}
            color={accent}
          >
            <Text
              fontFamily={FONT_TEXT}
              fontSize="11px"
              fontWeight="700"
              letterSpacing="0.4px"
              textTransform="uppercase"
            >
              {(domain && RU_DOMAIN_LABELS_UI[domain]) || 'Рабочая комната'}
            </Text>
          </Box>
        </Flex>
        <Heading
          as="h1"
          fontFamily={FONT_DISPLAY}
          fontSize={{ base: '24px', md: '32px' }}
          fontWeight="600"
          letterSpacing="-0.024em"
          lineHeight="1.12"
          color={textPrimary}
          mb="10px"
        >
          {project.title}
        </Heading>
        {project.goal && (
          <Text
            fontFamily={FONT_TEXT}
            fontSize={{ base: '15px', md: '17px' }}
            color={textSecondary}
            lineHeight="1.5"
          >
            Цель: {project.goal}
          </Text>
        )}
      </Box>

      {/* ── Next step action card ────────────────────────── */}
      {activeStep && (
        <Box
          bg={surface}
          border="1px solid"
          borderColor={hairline}
          borderRadius={{ base: '18px', md: '22px' }}
          p={{ base: '20px', md: '24px' }}
          boxShadow="0 1px 2px rgba(15,23,42,0.04), 0 8px 24px -14px rgba(15,23,42,0.10)"
        >
          <Text
            fontFamily={FONT_TEXT}
            fontSize="11px"
            fontWeight="700"
            letterSpacing="0.4px"
            textTransform="uppercase"
            color={textTertiary}
            mb="6px"
          >
            Следующий шаг
          </Text>
          <Heading
            as="h2"
            fontFamily={FONT_DISPLAY}
            fontSize={{ base: '20px', md: '22px' }}
            fontWeight="600"
            letterSpacing="-0.018em"
            color={textPrimary}
            mb="6px"
            lineHeight="1.25"
          >
            {activeStep.title}
          </Heading>
          {activeStep.hint && (
            <Text
              fontFamily={FONT_TEXT}
              fontSize="14px"
              color={textSecondary}
              lineHeight="1.45"
              mb="14px"
              maxW="640px"
            >
              {activeStep.hint}
            </Text>
          )}
          <Button
            onClick={() => handleStepAction(activeStep)}
            bg={accent}
            color="white"
            borderRadius="9999px"
            h="38px"
            px="20px"
            fontFamily={FONT_TEXT}
            fontWeight="500"
            fontSize="14px"
            _hover={{ bg: ACCENT_BLUE_HOVER }}
            _active={{ transform: 'scale(0.98)' }}
            transition="background-color 0.15s ease, transform 0.15s ease"
          >
            {activeStep.actionLabel}
          </Button>
        </Box>
      )}

      {/* ── Baseline (intake) ──────────────────────────────── */}
      <BaselineCard
        intake={intake}
        domain={domain}
        surface={surface}
        surfaceSoft={surfaceSoft}
        hairline={hairline}
        accent={accent}
        textPrimary={textPrimary}
        textSecondary={textSecondary}
        textTertiary={textTertiary}
        onEdit={() => setIntakeOpen(true)}
        onReset={handleResetIntake}
        resetting={resettingIntake}
      />

      {/* ── Tracker (domain-aware) ────────────────────────── */}
      {isHealth && (
        <TrackerWidget
          tracker={tracker}
          intake={intake}
          surface={surface}
          surfaceSoft={surfaceSoft}
          hairline={hairline}
          accent={accent}
          textPrimary={textPrimary}
          textSecondary={textSecondary}
          textTertiary={textTertiary}
          creatingTracker={creatingTracker}
          onCreateTracker={() => handleCreateTracker(false)}
          onAddEntry={() => setEntryOpen(true)}
          onDeleteEntry={handleDeleteEntry}
        />
      )}
      {isEducation && (
        <LearningTrackerWidget
          tracker={tracker}
          surface={surface}
          surfaceSoft={surfaceSoft}
          hairline={hairline}
          accent={accent}
          textPrimary={textPrimary}
          textSecondary={textSecondary}
          textTertiary={textTertiary}
          creatingTracker={creatingTracker}
          onCreateTracker={() => handleCreateTracker(false)}
          onAddEntry={() => setLearningEntryOpen(true)}
          onDeleteEntry={handleDeleteEntry}
        />
      )}

      {/* ── Roadmap ─────────────────────────────────────── */}
      {roadmap.length > 0 && (
        <RoadmapCard
          steps={roadmap}
          surface={surface}
          surfaceSoft={surfaceSoft}
          hairline={hairline}
          accent={accent}
          textPrimary={textPrimary}
          textSecondary={textSecondary}
          textTertiary={textTertiary}
          onStep={handleStepAction}
        />
      )}

      {/* ── Materials (sources) ────────────────────────── */}
      <MaterialsCard
        sources={sources}
        surface={surface}
        surfaceSoft={surfaceSoft}
        hairline={hairline}
        accent={accent}
        textPrimary={textPrimary}
        textSecondary={textSecondary}
        textTertiary={textTertiary}
        onOpenAll={onOpenSources}
      />

      {/* ── Documents (filtered, clean preview) ────────── */}
      <DocumentsCard
        artifacts={visibleArtifacts}
        surface={surface}
        surfaceSoft={surfaceSoft}
        hairline={hairline}
        accent={accent}
        textPrimary={textPrimary}
        textSecondary={textSecondary}
        textTertiary={textTertiary}
      />

      {/* ── Danger zone ─────────────────────────────────── */}
      <DangerZoneCard
        surface={surface}
        hairline={hairline}
        textSecondary={textSecondary}
        textTertiary={textTertiary}
        onDelete={() => setDeleteOpen(true)}
      />

      {/* Refresh */}
      <Flex justify="flex-end">
        <IconButton
          onClick={() => void load()}
          aria-label="Обновить"
          icon={<Icon as={MdRefresh} boxSize="16px" />}
          variant="ghost"
          color={textSecondary}
          size="sm"
          borderRadius="9999px"
          _hover={{ color: textPrimary }}
        />
      </Flex>

      {/* ── Modals ────────────────────────────────────── */}
      <ProjectIntakeForm
        projectId={projectId}
        formKind={
          project.blueprint?.firstStep?.formKind ||
          (domain === 'health_fitness'
            ? 'health'
            : domain === 'education'
              ? 'education'
              : domain === 'business'
                ? 'business'
                : domain === 'career'
                  ? 'career'
                  : domain === 'academic_writing'
                    ? 'academic'
                    : 'general')
        }
        open={intakeOpen}
        initial={intake}
        onClose={() => setIntakeOpen(false)}
        onSaved={(p) => setProject(p)}
      />

      {isHealth && (
        <AddEntryModal
          open={entryOpen}
          onClose={() => setEntryOpen(false)}
          onSubmit={handleAddEntry}
          baselineWeight={intake?.startWeightKg}
        />
      )}

      {isEducation && (
        <AddLearningEntryModal
          open={learningEntryOpen}
          onClose={() => setLearningEntryOpen(false)}
          onSubmit={handleAddEntry}
          suggestedWeek={
            ((tracker?.entries?.length || 0) + 1).toString()
          }
        />
      )}

      <DeleteProjectModal
        open={deleteOpen}
        title={project.title}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDeleteProject}
        deleting={deleting}
      />
    </Flex>
  );
}

// ────────────────────────────────────────────────────────────────
// ── BaselineCard ─────────────────────────────────────────────
function BaselineCard({
  intake,
  domain,
  surface,
  surfaceSoft,
  hairline,
  accent,
  textPrimary,
  textSecondary,
  textTertiary,
  onEdit,
  onReset,
  resetting,
}: any) {
  const hasData = !!(intake && Object.keys(intake).some((k) => k !== 'updatedAt'));

  // Compose summary fields per domain.
  const summary: Array<{ label: string; value: string }> = [];
  if (intake) {
    if (domain === 'health_fitness') {
      if (intake.startWeightKg !== undefined)
        summary.push({ label: 'Стартовый вес', value: `${intake.startWeightKg} кг` });
      if (intake.targetWeightKg !== undefined)
        summary.push({ label: 'Цель', value: `${intake.targetWeightKg} кг` });
      if (intake.targetDays !== undefined)
        summary.push({ label: 'Срок', value: `${intake.targetDays} дней` });
      if (intake.heightCm !== undefined)
        summary.push({ label: 'Рост', value: `${intake.heightCm} см` });
      if (intake.activityLevel)
        summary.push({ label: 'Активность', value: String(intake.activityLevel) });
    } else if (domain === 'education') {
      if ((intake as any).learningLevel)
        summary.push({ label: 'Уровень', value: String((intake as any).learningLevel) });
      if ((intake as any).learningGoal)
        summary.push({ label: 'Цель', value: String((intake as any).learningGoal) });
      if ((intake as any).learningHoursPerWeek !== undefined)
        summary.push({ label: 'Часов в неделю', value: String((intake as any).learningHoursPerWeek) });
      if ((intake as any).learningDeadline)
        summary.push({ label: 'Срок', value: String((intake as any).learningDeadline) });
      if ((intake as any).learningFormat)
        summary.push({ label: 'Формат', value: String((intake as any).learningFormat) });
    } else {
      // Generic — показываем первые 4 непустых string/number поля
      for (const [k, v] of Object.entries(intake)) {
        if (k === 'updatedAt') continue;
        if (typeof v === 'string' || typeof v === 'number') {
          if (String(v).trim()) summary.push({ label: k, value: String(v) });
        }
        if (summary.length >= 4) break;
      }
    }
  }

  return (
    <Box
      bg={surface}
      border="1px solid"
      borderColor={hairline}
      borderRadius={{ base: '18px', md: '22px' }}
      p={{ base: '20px', md: '24px' }}
      boxShadow="0 1px 2px rgba(15,23,42,0.04), 0 8px 24px -14px rgba(15,23,42,0.10)"
    >
      <Flex justify="space-between" align="flex-start" gap="10px" mb="10px" flexWrap="wrap">
        <Box>
          <Text
            fontFamily={FONT_TEXT}
            fontSize="11px"
            fontWeight="700"
            letterSpacing="0.4px"
            textTransform="uppercase"
            color={textTertiary}
            mb="4px"
          >
            Исходные данные
          </Text>
          <Heading
            as="h3"
            fontFamily={FONT_DISPLAY}
            fontSize={{ base: '18px', md: '20px' }}
            fontWeight="600"
            color={textPrimary}
            letterSpacing="-0.014em"
          >
            {hasData ? 'Анкета заполнена' : 'Анкета не заполнена'}
          </Heading>
        </Box>
        <HStack spacing="6px">
          <Button
            onClick={onEdit}
            variant="ghost"
            size="sm"
            color={accent}
            leftIcon={<Icon as={MdEdit} boxSize="14px" />}
            _hover={{ bg: surfaceSoft }}
            borderRadius="9999px"
            fontFamily={FONT_TEXT}
            fontSize="13px"
            fontWeight="500"
            h="32px"
          >
            {hasData ? 'Изменить' : 'Заполнить'}
          </Button>
          {hasData && (
            <Button
              onClick={onReset}
              variant="ghost"
              size="sm"
              color={textSecondary}
              isLoading={resetting}
              leftIcon={<Icon as={MdRestartAlt} boxSize="14px" />}
              _hover={{ bg: surfaceSoft, color: 'red.500' }}
              borderRadius="9999px"
              fontFamily={FONT_TEXT}
              fontSize="13px"
              fontWeight="500"
              h="32px"
            >
              Сбросить
            </Button>
          )}
        </HStack>
      </Flex>

      {hasData ? (
        <SimpleGrid columns={{ base: 2, md: 4 }} spacing="8px">
          {summary.map((s) => (
            <Box
              key={s.label}
              bg={surfaceSoft}
              border="1px solid"
              borderColor={hairline}
              borderRadius="12px"
              p="10px 12px"
            >
              <Text
                fontFamily={FONT_TEXT}
                fontSize="11px"
                color={textTertiary}
                fontWeight="600"
                letterSpacing="0.2px"
                textTransform="uppercase"
                mb="2px"
                noOfLines={1}
              >
                {s.label}
              </Text>
              <Text
                fontFamily={FONT_TEXT}
                fontSize="14px"
                fontWeight="600"
                color={textPrimary}
                letterSpacing="-0.1px"
                noOfLines={1}
              >
                {s.value}
              </Text>
            </Box>
          ))}
        </SimpleGrid>
      ) : (
        <Text
          fontFamily={FONT_TEXT}
          fontSize="14px"
          color={textSecondary}
          lineHeight="1.45"
        >
          Расскажите о цели, стартовой точке и ограничениях — это нужно, чтобы
          ИИСеть строила план под вас.
        </Text>
      )}
    </Box>
  );
}

// ── TrackerWidget ───────────────────────────────────────────────
function TrackerWidget({
  tracker,
  intake,
  surface,
  surfaceSoft,
  hairline,
  accent,
  textPrimary,
  textSecondary,
  textTertiary,
  creatingTracker,
  onCreateTracker,
  onAddEntry,
  onDeleteEntry,
}: any) {
  const startWeight = intake?.startWeightKg;
  const targetWeight = intake?.targetWeightKg;
  const targetDays = intake?.targetDays;
  const entries: IProjectTrackerEntryUI[] = tracker?.entries || [];
  const sorted = [...entries].sort((a, b) => (a.date < b.date ? -1 : 1));
  const currentWeight =
    [...sorted].reverse().find((e) => typeof e.weightKg === 'number')?.weightKg ?? undefined;
  const startDate =
    tracker?.createdAt?.slice(0, 10) ||
    sorted[0]?.date ||
    new Date().toISOString().slice(0, 10);
  const daysPassed = (() => {
    if (!startDate) return undefined;
    const a = new Date(startDate);
    const b = new Date();
    return Math.max(0, Math.floor((b.getTime() - a.getTime()) / 86400000));
  })();
  const daysLeft =
    typeof targetDays === 'number' && typeof daysPassed === 'number'
      ? Math.max(0, targetDays - daysPassed)
      : undefined;
  const delta =
    typeof startWeight === 'number' && typeof currentWeight === 'number'
      ? currentWeight - startWeight
      : undefined;
  const toGoal =
    typeof targetWeight === 'number' && typeof currentWeight === 'number'
      ? currentWeight - targetWeight
      : undefined;

  return (
    <Box
      bg={surface}
      border="1px solid"
      borderColor={hairline}
      borderRadius={{ base: '18px', md: '22px' }}
      p={{ base: '20px', md: '24px' }}
      boxShadow="0 1px 2px rgba(15,23,42,0.04), 0 8px 24px -14px rgba(15,23,42,0.10)"
    >
      <Flex justify="space-between" align="flex-start" gap="10px" mb="12px" flexWrap="wrap">
        <Box>
          <Text
            fontFamily={FONT_TEXT}
            fontSize="11px"
            fontWeight="700"
            letterSpacing="0.4px"
            textTransform="uppercase"
            color={textTertiary}
            mb="4px"
          >
            Трекер прогресса
          </Text>
          <Heading
            as="h3"
            fontFamily={FONT_DISPLAY}
            fontSize={{ base: '18px', md: '20px' }}
            fontWeight="600"
            color={textPrimary}
            letterSpacing="-0.014em"
          >
            {tracker ? 'Динамика веса' : 'Трекер не создан'}
          </Heading>
        </Box>
        {tracker ? (
          <Button
            onClick={onAddEntry}
            bg={accent}
            color="white"
            borderRadius="9999px"
            h="32px"
            px="14px"
            fontFamily={FONT_TEXT}
            fontSize="13px"
            fontWeight="500"
            leftIcon={<Icon as={MdAdd} boxSize="14px" />}
            _hover={{ bg: ACCENT_BLUE_HOVER }}
          >
            Добавить замер
          </Button>
        ) : (
          <Button
            onClick={onCreateTracker}
            isLoading={creatingTracker}
            bg={accent}
            color="white"
            borderRadius="9999px"
            h="32px"
            px="14px"
            fontFamily={FONT_TEXT}
            fontSize="13px"
            fontWeight="500"
            leftIcon={<Icon as={MdTrendingUp} boxSize="14px" />}
            _hover={{ bg: ACCENT_BLUE_HOVER }}
          >
            Создать трекер
          </Button>
        )}
      </Flex>

      {!tracker ? (
        <Text fontFamily={FONT_TEXT} fontSize="14px" color={textSecondary} lineHeight="1.45">
          Трекер нужен, чтобы сравнивать факт с исходной точкой и видеть динамику.
        </Text>
      ) : (
        <>
          {/* Stats row */}
          <SimpleGrid columns={{ base: 2, md: 4 }} spacing="8px" mb="14px">
            <StatBox
              label="Старт"
              value={typeof startWeight === 'number' ? `${startWeight} кг` : '—'}
              hint={startDate ? new Date(startDate).toLocaleDateString('ru-RU') : ''}
              surfaceSoft={surfaceSoft}
              hairline={hairline}
              textPrimary={textPrimary}
              textTertiary={textTertiary}
            />
            <StatBox
              label="Сейчас"
              value={typeof currentWeight === 'number' ? `${currentWeight} кг` : '—'}
              hint={delta !== undefined ? `${delta > 0 ? '+' : ''}${delta.toFixed(1)} от старта` : ''}
              surfaceSoft={surfaceSoft}
              hairline={hairline}
              textPrimary={textPrimary}
              textTertiary={textTertiary}
              accentValue={typeof delta === 'number' && delta < 0 ? accent : undefined}
            />
            <StatBox
              label="Цель"
              value={typeof targetWeight === 'number' ? `${targetWeight} кг` : '—'}
              hint={
                typeof toGoal === 'number' && toGoal > 0
                  ? `до цели ${toGoal.toFixed(1)} кг`
                  : typeof toGoal === 'number' && toGoal <= 0
                    ? 'цель достигнута'
                    : ''
              }
              surfaceSoft={surfaceSoft}
              hairline={hairline}
              textPrimary={textPrimary}
              textTertiary={textTertiary}
            />
            <StatBox
              label="Дней"
              value={
                typeof daysPassed === 'number'
                  ? `${daysPassed}${typeof daysLeft === 'number' ? ' / ' + (daysPassed + daysLeft) : ''}`
                  : '—'
              }
              hint={typeof daysLeft === 'number' ? `осталось ${daysLeft}` : ''}
              surfaceSoft={surfaceSoft}
              hairline={hairline}
              textPrimary={textPrimary}
              textTertiary={textTertiary}
            />
          </SimpleGrid>

          {/* Entries list */}
          {sorted.length === 0 ? (
            <Text
              fontFamily={FONT_TEXT}
              fontSize="13px"
              color={textSecondary}
            >
              Замеров пока нет. Добавьте первый — и сразу увидите динамику.
            </Text>
          ) : (
            <Box
              border="1px solid"
              borderColor={hairline}
              borderRadius="14px"
              overflow="hidden"
            >
              {/* Header — desktop only */}
              <Flex
                display={{ base: 'none', md: 'flex' }}
                px="12px"
                py="8px"
                bg={surfaceSoft}
                color={textTertiary}
                fontFamily={FONT_TEXT}
                fontSize="11px"
                fontWeight="700"
                letterSpacing="0.3px"
                textTransform="uppercase"
                gap="10px"
              >
                <Box flex="0 0 100px">Дата</Box>
                <Box flex="0 0 90px">Вес, кг</Box>
                <Box flex="0 0 90px">Талия</Box>
                <Box flex="1 1 0">Тренировка / Заметка</Box>
                <Box flex="0 0 32px" />
              </Flex>
              {[...sorted].reverse().map((e) => (
                <Flex
                  key={e.id}
                  direction={{ base: 'column', md: 'row' }}
                  px="12px"
                  py="10px"
                  borderTop="1px solid"
                  borderColor={hairline}
                  gap="6px"
                  align={{ base: 'flex-start', md: 'center' }}
                >
                  <Box flex={{ md: '0 0 100px' }}>
                    <Text fontFamily={FONT_TEXT} fontSize="13px" fontWeight="600" color={textPrimary}>
                      {new Date(e.date).toLocaleDateString('ru-RU', { day: '2-digit', month: 'short' })}
                    </Text>
                  </Box>
                  <Box flex={{ md: '0 0 90px' }}>
                    <Text fontFamily={FONT_TEXT} fontSize="13px" color={textPrimary}>
                      {typeof e.weightKg === 'number' ? `${e.weightKg} кг` : '—'}
                    </Text>
                  </Box>
                  <Box flex={{ md: '0 0 90px' }}>
                    <Text fontFamily={FONT_TEXT} fontSize="13px" color={textSecondary}>
                      {typeof e.waistCm === 'number' ? `${e.waistCm} см` : '—'}
                    </Text>
                  </Box>
                  <Box flex={{ md: '1 1 0' }} minW={0}>
                    <Text
                      fontFamily={FONT_TEXT}
                      fontSize="12px"
                      color={textSecondary}
                      noOfLines={2}
                    >
                      {[e.training, e.calories ? `${e.calories} ккал` : '', e.wellbeing, e.comment]
                        .filter(Boolean)
                        .join(' · ')}
                    </Text>
                  </Box>
                  <Box flex={{ md: '0 0 32px' }}>
                    <IconButton
                      onClick={() => onDeleteEntry(e.id)}
                      icon={<Icon as={MdRestartAlt} boxSize="14px" />}
                      aria-label="Удалить замер"
                      size="xs"
                      variant="ghost"
                      color={textTertiary}
                      _hover={{ color: 'red.500' }}
                    />
                  </Box>
                </Flex>
              ))}
            </Box>
          )}
        </>
      )}
    </Box>
  );
}

// ── StatBox helper ──────────────────────────────────────────────
function StatBox({
  label,
  value,
  hint,
  surfaceSoft,
  hairline,
  textPrimary,
  textTertiary,
  accentValue,
}: any) {
  return (
    <Box
      bg={surfaceSoft}
      border="1px solid"
      borderColor={hairline}
      borderRadius="12px"
      p="10px 12px"
    >
      <Text
        fontFamily={FONT_TEXT}
        fontSize="11px"
        color={textTertiary}
        fontWeight="600"
        letterSpacing="0.3px"
        textTransform="uppercase"
        mb="2px"
      >
        {label}
      </Text>
      <Text
        fontFamily={FONT_DISPLAY}
        fontSize="20px"
        fontWeight="600"
        color={accentValue || textPrimary}
        letterSpacing="-0.014em"
        sx={{ fontVariantNumeric: 'tabular-nums' }}
      >
        {value}
      </Text>
      {hint && (
        <Text fontFamily={FONT_TEXT} fontSize="11px" color={textTertiary} mt="2px">
          {hint}
        </Text>
      )}
    </Box>
  );
}

// ── RoadmapCard ─────────────────────────────────────────────────
function RoadmapCard({
  steps,
  surface,
  surfaceSoft,
  hairline,
  accent,
  textPrimary,
  textSecondary,
  textTertiary,
  onStep,
}: any) {
  return (
    <Box
      bg={surface}
      border="1px solid"
      borderColor={hairline}
      borderRadius={{ base: '18px', md: '22px' }}
      p={{ base: '18px', md: '22px' }}
      boxShadow="0 1px 2px rgba(15,23,42,0.04), 0 8px 24px -14px rgba(15,23,42,0.10)"
    >
      <Text
        fontFamily={FONT_TEXT}
        fontSize="11px"
        fontWeight="700"
        letterSpacing="0.4px"
        textTransform="uppercase"
        color={textTertiary}
        mb="6px"
      >
        Маршрут
      </Text>
      <Heading
        as="h3"
        fontFamily={FONT_DISPLAY}
        fontSize={{ base: '18px', md: '20px' }}
        fontWeight="600"
        color={textPrimary}
        letterSpacing="-0.014em"
        mb="14px"
      >
        К результату
      </Heading>
      <VStack align="stretch" spacing="6px">
        {steps.map((s: IRoadmapStepUI, i: number) => {
          const statusIcon =
            s.status === 'done'
              ? MdCheckCircle
              : s.status === 'locked'
                ? MdLock
                : MdRadioButtonUnchecked;
          const statusColor =
            s.status === 'done'
              ? accent
              : s.status === 'locked'
                ? textTertiary
                : s.status === 'active'
                  ? accent
                  : textSecondary;
          const isClickable = s.status !== 'locked';
          return (
            <Flex
              key={s.id}
              align="center"
              gap="10px"
              p="10px 12px"
              borderRadius="12px"
              bg={s.status === 'active' ? accent + '10' : surfaceSoft}
              border="1px solid"
              borderColor={s.status === 'active' ? accent + '60' : hairline}
              opacity={s.status === 'locked' ? 0.55 : 1}
              cursor={isClickable ? 'pointer' : 'default'}
              onClick={() => isClickable && onStep(s)}
              transition="background-color 0.15s ease, border-color 0.15s ease"
              _hover={isClickable ? { borderColor: accent } : undefined}
            >
              <Icon as={statusIcon} boxSize="18px" color={statusColor} flexShrink={0} />
              <Box flex="1 1 0" minW={0}>
                <Text
                  fontFamily={FONT_TEXT}
                  fontSize="14px"
                  fontWeight={s.status === 'done' ? 500 : 600}
                  color={s.status === 'done' ? textSecondary : textPrimary}
                  letterSpacing="-0.1px"
                  textDecoration={s.status === 'done' ? 'line-through' : 'none'}
                  noOfLines={1}
                >
                  {String(i + 1).padStart(2, '0')} · {s.title}
                </Text>
              </Box>
              {s.status !== 'locked' && s.status !== 'done' && (
                <Text
                  fontFamily={FONT_TEXT}
                  fontSize="12px"
                  color={accent}
                  fontWeight="500"
                  flexShrink={0}
                >
                  {s.actionLabel}
                </Text>
              )}
            </Flex>
          );
        })}
      </VStack>
    </Box>
  );
}

// ── MaterialsCard ───────────────────────────────────────────────
function MaterialsCard({
  sources,
  surface,
  surfaceSoft,
  hairline,
  accent,
  textPrimary,
  textSecondary,
  textTertiary,
  onOpenAll,
}: any) {
  return (
    <Box
      bg={surface}
      border="1px solid"
      borderColor={hairline}
      borderRadius={{ base: '18px', md: '22px' }}
      p={{ base: '18px', md: '22px' }}
      boxShadow="0 1px 2px rgba(15,23,42,0.04), 0 8px 24px -14px rgba(15,23,42,0.10)"
    >
      <Flex justify="space-between" align="center" mb="12px" gap="10px">
        <Box>
          <Text
            fontFamily={FONT_TEXT}
            fontSize="11px"
            fontWeight="700"
            letterSpacing="0.4px"
            textTransform="uppercase"
            color={textTertiary}
            mb="2px"
          >
            Материалы
          </Text>
          <Heading
            as="h3"
            fontFamily={FONT_DISPLAY}
            fontSize="18px"
            fontWeight="600"
            color={textPrimary}
            letterSpacing="-0.014em"
          >
            {sources.length} {pluralize(sources.length, 'источник', 'источника', 'источников')}
          </Heading>
        </Box>
        <Button
          onClick={onOpenAll}
          variant="ghost"
          size="sm"
          color={accent}
          leftIcon={<Icon as={MdAdd} boxSize="14px" />}
          _hover={{ bg: surfaceSoft }}
          borderRadius="9999px"
          fontFamily={FONT_TEXT}
          fontSize="13px"
          fontWeight="500"
          h="32px"
        >
          Добавить
        </Button>
      </Flex>
      {sources.length === 0 ? (
        <Text
          fontFamily={FONT_TEXT}
          fontSize="13px"
          color={textSecondary}
          lineHeight="1.45"
        >
          Загрузите PDF, DOCX, ссылку или заметку — ИИСеть будет учитывать
          их в ответах.
        </Text>
      ) : (
        <VStack align="stretch" spacing="6px">
          {sources.slice(0, 4).map((s: IProjectSourceUI) => {
            const icon =
              s.type === 'file'
                ? MdInsertDriveFile
                : s.type === 'link'
                  ? MdLinkIcon
                  : MdNoteAlt;
            return (
              <Flex
                key={s._id}
                align="center"
                gap="10px"
                bg={surfaceSoft}
                border="1px solid"
                borderColor={hairline}
                borderRadius="11px"
                p="9px 12px"
                minW={0}
              >
                <Icon as={icon} boxSize="15px" color={accent} flexShrink={0} />
                <Text
                  fontFamily={FONT_TEXT}
                  fontSize="13px"
                  fontWeight="600"
                  color={textPrimary}
                  noOfLines={1}
                  flex="1 1 0"
                  minW={0}
                >
                  {s.title || s.originalName || 'Источник'}
                </Text>
                <Text
                  fontFamily={FONT_TEXT}
                  fontSize="11px"
                  color={textTertiary}
                  flexShrink={0}
                >
                  {s.status === 'ready' && s.chunksCount > 0
                    ? `${s.chunksCount} фрагм.`
                    : s.status}
                </Text>
              </Flex>
            );
          })}
        </VStack>
      )}
    </Box>
  );
}

// ── DocumentsCard ───────────────────────────────────────────────
function DocumentsCard({
  artifacts,
  surface,
  surfaceSoft,
  hairline,
  accent,
  textPrimary,
  textSecondary,
  textTertiary,
}: any) {
  if (artifacts.length === 0) {
    return null;
  }
  return (
    <Box
      bg={surface}
      border="1px solid"
      borderColor={hairline}
      borderRadius={{ base: '18px', md: '22px' }}
      p={{ base: '18px', md: '22px' }}
      boxShadow="0 1px 2px rgba(15,23,42,0.04), 0 8px 24px -14px rgba(15,23,42,0.10)"
    >
      <Text
        fontFamily={FONT_TEXT}
        fontSize="11px"
        fontWeight="700"
        letterSpacing="0.4px"
        textTransform="uppercase"
        color={textTertiary}
        mb="2px"
      >
        Документы проекта
      </Text>
      <Heading
        as="h3"
        fontFamily={FONT_DISPLAY}
        fontSize="18px"
        fontWeight="600"
        color={textPrimary}
        letterSpacing="-0.014em"
        mb="14px"
      >
        {artifacts.length} {pluralize(artifacts.length, 'документ', 'документа', 'документов')}
      </Heading>
      <VStack align="stretch" spacing="6px">
        {artifacts.slice(0, 6).map((a: IProjectArtifactUI) => (
          <Box
            key={a._id}
            bg={surfaceSoft}
            border="1px solid"
            borderColor={hairline}
            borderRadius="11px"
            p="10px 12px"
          >
            <Flex align="center" gap="8px" mb="2px">
              <Icon as={MdDescription} boxSize="14px" color={accent} />
              <Text
                fontFamily={FONT_TEXT}
                fontSize="13px"
                fontWeight="600"
                color={textPrimary}
                noOfLines={1}
                flex="1 1 0"
                minW={0}
              >
                {a.title}
              </Text>
              <Text fontSize="11px" color={textTertiary} flexShrink={0}>
                {new Date(a.createdAt).toLocaleDateString('ru-RU', { day: '2-digit', month: 'short' })}
              </Text>
            </Flex>
            <Text
              fontFamily={FONT_TEXT}
              fontSize="12px"
              color={textSecondary}
              lineHeight="1.45"
              noOfLines={2}
            >
              {cleanPreview(a.content || '', 200)}
            </Text>
          </Box>
        ))}
      </VStack>
    </Box>
  );
}

// ── AddEntryModal ───────────────────────────────────────────────
function AddEntryModal({
  open,
  onClose,
  onSubmit,
  baselineWeight,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (entry: Omit<IProjectTrackerEntryUI, 'id' | 'createdAt'>) => Promise<boolean>;
  baselineWeight?: number;
}) {
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const [date, setDate] = useState(today);
  const [weight, setWeight] = useState('');
  const [waist, setWaist] = useState('');
  const [training, setTraining] = useState('');
  const [calories, setCalories] = useState('');
  const [wellbeing, setWellbeing] = useState('');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const surface = useColorModeValue('#ffffff', '#1c1c1f');
  const hairline = useColorModeValue('rgba(15,23,42,0.08)', 'rgba(255,255,255,0.10)');
  const inputBg = useColorModeValue('#fafafb', 'rgba(255,255,255,0.04)');
  const textPrimary = useColorModeValue('#1d1d1f', '#f5f5f7');
  const textSecondary = useColorModeValue('#6e6e73', 'rgba(245,245,247,0.65)');

  useEffect(() => {
    if (!open) return;
    setDate(today);
    setWeight('');
    setWaist('');
    setTraining('');
    setCalories('');
    setWellbeing('');
    setComment('');
  }, [open, today]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const num = (s: string) => {
      const n = Number(s);
      return Number.isFinite(n) ? n : undefined;
    };
    const ok = await onSubmit({
      date,
      weightKg: num(weight),
      waistCm: num(waist),
      training: training.trim() || undefined,
      calories: num(calories),
      wellbeing: wellbeing.trim() || undefined,
      comment: comment.trim() || undefined,
    });
    setIsSubmitting(false);
    if (ok) onClose();
  };

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      isCentered
      size={{ base: 'full', md: 'md' } as any}
      motionPreset="slideInBottom"
      closeOnOverlayClick
      closeOnEsc
      autoFocus
      portalProps={{ appendToParentPortal: false }}
    >
      <ModalOverlay
        bg="rgba(0,0,0,0.48)"
        sx={{
          backdropFilter: 'blur(14px) saturate(160%)',
          WebkitBackdropFilter: 'blur(14px) saturate(160%)',
        }}
      />
      <ModalContent
        mx={{ base: '16px', md: 'auto' }}
        my={{ base: '16px', md: 'auto' }}
        maxW={{ base: 'calc(100vw - 32px)', md: '560px' }}
        borderRadius={{ base: '22px', md: '24px' }}
        border="1px solid"
        borderColor={hairline}
        bg={surface}
        boxShadow="0 1px 2px rgba(15,23,42,0.04), 0 32px 64px -16px rgba(15,23,42,0.30)"
        overflow="hidden"
      >
        <ModalHeader
          px={{ base: '20px', md: '24px' }}
          pt={{ base: '20px', md: '22px' }}
          pb="4px"
          fontFamily={FONT_DISPLAY}
          fontSize={{ base: '18px', md: '20px' }}
          fontWeight="600"
          letterSpacing="-0.018em"
          color={textPrimary}
        >
          {/* «← К проекту» — back-навигация всегда видна сверху. */}
          <Box
            as="button"
            type="button"
            onClick={onClose}
            display="inline-flex"
            alignItems="center"
            gap="4px"
            fontFamily={FONT_TEXT}
            fontSize="12px"
            fontWeight="500"
            color={textSecondary}
            bg="transparent"
            cursor="pointer"
            mb="6px"
            _hover={{ color: textPrimary }}
            sx={{ WebkitTapHighlightColor: 'transparent' }}
            aria-label="Назад к проекту"
          >
            <Icon as={MdArrowBack} boxSize="13px" />
            <Text>К проекту</Text>
          </Box>
          Новый замер
        </ModalHeader>
        <ModalCloseButton borderRadius="9999px" top={{ base: '12px', md: '14px' }} right={{ base: '12px', md: '14px' }} />
        <ModalBody px={{ base: '20px', md: '24px' }} pt="6px" pb="12px">
          {baselineWeight && (
            <Text
              fontFamily={FONT_TEXT}
              fontSize="12px"
              color={textSecondary}
              mb="12px"
            >
              Стартовый вес из анкеты: <b>{baselineWeight} кг</b>
            </Text>
          )}
          <VStack align="stretch" spacing="10px">
            <Field label="Дата" hairline={hairline} inputBg={inputBg} textPrimary={textPrimary} textSecondary={textSecondary}>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} bg={inputBg} borderColor={hairline} borderRadius="10px" fontFamily={FONT_TEXT} fontSize="14px" color={textPrimary} />
            </Field>
            <SimpleGrid columns={2} spacing="10px">
              <Field label="Вес (кг)" hairline={hairline} inputBg={inputBg} textPrimary={textPrimary} textSecondary={textSecondary}>
                <Input type="number" step="0.1" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="85.0" bg={inputBg} borderColor={hairline} borderRadius="10px" fontFamily={FONT_TEXT} fontSize="14px" color={textPrimary} />
              </Field>
              <Field label="Талия (см)" hairline={hairline} inputBg={inputBg} textPrimary={textPrimary} textSecondary={textSecondary}>
                <Input type="number" step="0.5" value={waist} onChange={(e) => setWaist(e.target.value)} placeholder="92" bg={inputBg} borderColor={hairline} borderRadius="10px" fontFamily={FONT_TEXT} fontSize="14px" color={textPrimary} />
              </Field>
            </SimpleGrid>
            <Field label="Тренировка" hairline={hairline} inputBg={inputBg} textPrimary={textPrimary} textSecondary={textSecondary}>
              <Input value={training} onChange={(e) => setTraining(e.target.value)} placeholder="бег 30 мин, силовая…" bg={inputBg} borderColor={hairline} borderRadius="10px" fontFamily={FONT_TEXT} fontSize="14px" color={textPrimary} />
            </Field>
            <SimpleGrid columns={2} spacing="10px">
              <Field label="Калории" hairline={hairline} inputBg={inputBg} textPrimary={textPrimary} textSecondary={textSecondary}>
                <Input type="number" value={calories} onChange={(e) => setCalories(e.target.value)} placeholder="1800" bg={inputBg} borderColor={hairline} borderRadius="10px" fontFamily={FONT_TEXT} fontSize="14px" color={textPrimary} />
              </Field>
              <Field label="Самочувствие" hairline={hairline} inputBg={inputBg} textPrimary={textPrimary} textSecondary={textSecondary}>
                <Select value={wellbeing} onChange={(e) => setWellbeing(e.target.value)} bg={inputBg} borderColor={hairline} borderRadius="10px" fontFamily={FONT_TEXT} fontSize="14px" color={textPrimary} placeholder="—">
                  <option value="отличное">отличное</option>
                  <option value="хорошее">хорошее</option>
                  <option value="нормальное">нормальное</option>
                  <option value="устал">устал</option>
                  <option value="плохо">плохо</option>
                </Select>
              </Field>
            </SimpleGrid>
            <Field label="Комментарий" hairline={hairline} inputBg={inputBg} textPrimary={textPrimary} textSecondary={textSecondary}>
              <Textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="что важно отметить" bg={inputBg} borderColor={hairline} borderRadius="10px" rows={2} fontFamily={FONT_TEXT} fontSize="14px" color={textPrimary} />
            </Field>
          </VStack>
        </ModalBody>
        <ModalFooter px={{ base: '20px', md: '24px' }} pt="6px" pb={{ base: 'calc(20px + env(safe-area-inset-bottom))', md: '20px' }} borderTop="1px solid" borderColor={hairline} gap="8px">
          <Button onClick={onClose} variant="ghost" borderRadius="9999px" h="36px" px="16px" fontFamily={FONT_TEXT} fontSize="13px" fontWeight="500" color={textPrimary} _hover={{ bg: 'rgba(0,0,0,0.04)' }}>
            Отмена
          </Button>
          <Button onClick={handleSubmit} isLoading={isSubmitting} bg={ACCENT_BLUE} color="white" borderRadius="9999px" h="36px" px="18px" fontFamily={FONT_TEXT} fontSize="13px" fontWeight="600" _hover={{ bg: ACCENT_BLUE_HOVER }} leftIcon={<Icon as={MdCheck} boxSize="14px" />}>
            Сохранить
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

function Field({ label, children, textSecondary }: any) {
  return (
    <Box>
      <Text
        fontFamily={FONT_TEXT}
        fontSize="11px"
        fontWeight="600"
        color={textSecondary}
        mb="4px"
        letterSpacing="0.1px"
      >
        {label}
      </Text>
      {children}
    </Box>
  );
}

// ── helpers ─────────────────────────────────────────────────────
function pluralize(n: number, one: string, few: string, many: string): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if ([2, 3, 4].includes(mod10) && ![12, 13, 14].includes(mod100)) return few;
  return many;
}

// ── DangerZoneCard ──────────────────────────────────────────────
// Тихий блок «Удаление проекта» внизу overview. Слабый акцент,
// чтобы не светил destructive-цветом в основной workflow, но был
// найден когда пользователь хочет убрать ненужный проект.
function DangerZoneCard({
  surface,
  hairline,
  textSecondary,
  textTertiary,
  onDelete,
}: {
  surface: string;
  hairline: string;
  textSecondary: string;
  textTertiary: string;
  onDelete: () => void;
}) {
  return (
    <Box
      bg={surface}
      border="1px solid"
      borderColor={hairline}
      borderRadius={{ base: '18px', md: '22px' }}
      p={{ base: '16px', md: '20px' }}
    >
      <Flex
        justify="space-between"
        align={{ base: 'flex-start', md: 'center' }}
        gap="10px"
        direction={{ base: 'column', md: 'row' }}
      >
        <Box>
          <Text
            fontFamily={FONT_TEXT}
            fontSize="11px"
            fontWeight="700"
            letterSpacing="0.4px"
            textTransform="uppercase"
            color={textTertiary}
            mb="2px"
          >
            Опасная зона
          </Text>
          <Text
            fontFamily={FONT_TEXT}
            fontSize="13px"
            color={textSecondary}
            lineHeight="1.45"
            maxW="520px"
          >
            Удаление проекта вместе с источниками, документами, анкетой
            и трекером. Действие нельзя отменить.
          </Text>
        </Box>
        <Button
          onClick={onDelete}
          variant="outline"
          borderColor="rgba(239,68,68,0.40)"
          color="#dc2626"
          borderRadius="9999px"
          h="34px"
          px="16px"
          fontFamily={FONT_TEXT}
          fontSize="13px"
          fontWeight="500"
          leftIcon={<Icon as={MdDeleteForever} boxSize="15px" />}
          _hover={{
            bg: 'rgba(239,68,68,0.08)',
            borderColor: '#dc2626',
            color: '#dc2626',
          }}
          flexShrink={0}
        >
          Удалить проект
        </Button>
      </Flex>
    </Box>
  );
}

// ── DeleteProjectModal ─────────────────────────────────────────
// Apple-like solid modal (см. фиксы прошлых сессий: appendToParentPortal
// false + solid surface). Требует ввести название проекта для
// подтверждения — защита от случайного клика.
function DeleteProjectModal({
  open,
  title,
  onClose,
  onConfirm,
  deleting,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  onConfirm: () => void;
  deleting: boolean;
}) {
  const [typed, setTyped] = useState('');

  useEffect(() => {
    if (!open) setTyped('');
  }, [open]);

  const surface = useColorModeValue('#ffffff', '#1c1d22');
  const hairline = useColorModeValue(
    'rgba(15,23,42,0.08)',
    'rgba(255,255,255,0.10)',
  );
  const textPrimary = useColorModeValue('#111827', '#f5f7fb');
  const textSecondary = useColorModeValue('#6b7280', 'rgba(245,247,251,0.62)');
  const inputBg = useColorModeValue('#f7f8fb', 'rgba(255,255,255,0.04)');
  const matches = typed.trim() === title.trim();

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      isCentered
      size={{ base: 'full', md: 'md' } as any}
      motionPreset="slideInBottom"
      closeOnOverlayClick={!deleting}
      closeOnEsc={!deleting}
      autoFocus
      portalProps={{ appendToParentPortal: false }}
    >
      <ModalOverlay
        bg="rgba(0,0,0,0.48)"
        sx={{
          backdropFilter: 'blur(14px) saturate(160%)',
          WebkitBackdropFilter: 'blur(14px) saturate(160%)',
        }}
      />
      <ModalContent
        mx={{ base: '16px', md: 'auto' }}
        my={{ base: '16px', md: 'auto' }}
        maxW={{ base: 'calc(100vw - 32px)', md: '480px' }}
        borderRadius={{ base: '22px', md: '24px' }}
        border="1px solid"
        borderColor={hairline}
        bg={surface}
        boxShadow="0 1px 2px rgba(15,23,42,0.04), 0 32px 64px -16px rgba(15,23,42,0.30)"
        overflow="hidden"
      >
        <ModalHeader
          px={{ base: '20px', md: '24px' }}
          pt={{ base: '20px', md: '22px' }}
          pb="4px"
          fontFamily={FONT_DISPLAY}
          fontSize={{ base: '18px', md: '20px' }}
          fontWeight="600"
          letterSpacing="-0.018em"
          color={textPrimary}
        >
          <Flex align="center" gap="10px">
            <Flex
              boxSize="28px"
              borderRadius="8px"
              bg="rgba(239,68,68,0.12)"
              align="center"
              justify="center"
              flexShrink={0}
            >
              <Icon as={MdWarningAmber} color="#dc2626" boxSize="16px" />
            </Flex>
            <Text>Удалить проект?</Text>
          </Flex>
        </ModalHeader>
        <ModalCloseButton
          borderRadius="9999px"
          top={{ base: '12px', md: '14px' }}
          right={{ base: '12px', md: '14px' }}
          isDisabled={deleting}
        />
        <ModalBody px={{ base: '20px', md: '24px' }} pt="8px" pb="12px">
          <Text
            fontFamily={FONT_TEXT}
            fontSize="14px"
            color={textSecondary}
            lineHeight="1.5"
            mb="14px"
          >
            Проект <b>«{title}»</b>, его источники, файлы, документы,
            анкеты, трекеры и история работы будут удалены. Это действие
            нельзя отменить.
          </Text>
          <Text
            fontFamily={FONT_TEXT}
            fontSize="12px"
            fontWeight="600"
            color={textSecondary}
            mb="6px"
            letterSpacing="0.1px"
          >
            Введите название проекта, чтобы подтвердить
          </Text>
          <Input
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            placeholder={title}
            bg={inputBg}
            borderColor={hairline}
            borderRadius="10px"
            fontFamily={FONT_TEXT}
            fontSize="14px"
            color={textPrimary}
            _focus={{
              borderColor: '#dc2626',
              boxShadow: '0 0 0 3px rgba(239,68,68,0.15)',
            }}
          />
        </ModalBody>
        <ModalFooter
          px={{ base: '20px', md: '24px' }}
          pt="6px"
          pb={{
            base: 'calc(20px + env(safe-area-inset-bottom))',
            md: '20px',
          }}
          borderTop="1px solid"
          borderColor={hairline}
          gap="8px"
        >
          <Button
            onClick={onClose}
            variant="ghost"
            isDisabled={deleting}
            borderRadius="9999px"
            h="36px"
            px="16px"
            fontFamily={FONT_TEXT}
            fontSize="13px"
            fontWeight="500"
            color={textPrimary}
            _hover={{ bg: 'rgba(0,0,0,0.04)' }}
          >
            Отмена
          </Button>
          <Button
            onClick={onConfirm}
            isLoading={deleting}
            isDisabled={!matches || deleting}
            bg="#dc2626"
            color="white"
            borderRadius="9999px"
            h="36px"
            px="18px"
            fontFamily={FONT_TEXT}
            fontSize="13px"
            fontWeight="600"
            _hover={{ bg: '#b91c1c' }}
            _active={{ transform: 'scale(0.98)' }}
            _disabled={{
              opacity: 0.5,
              cursor: 'not-allowed',
              bg: '#dc2626',
            }}
            leftIcon={<Icon as={MdDeleteForever} boxSize="15px" />}
          >
            Удалить проект
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

// ── LearningTrackerWidget ───────────────────────────────────────
// Education-специфичный tracker. Колонки: Неделя · Тема · Материал
// · Задание · Статус · Комментарий. Никакого веса/калорий.
function LearningTrackerWidget({
  tracker,
  surface,
  surfaceSoft,
  hairline,
  accent,
  textPrimary,
  textSecondary,
  textTertiary,
  creatingTracker,
  onCreateTracker,
  onAddEntry,
  onDeleteEntry,
}: any) {
  const entries: any[] = tracker?.entries || [];
  const sorted = [...entries].sort((a, b) => {
    const wa = Number(a.week);
    const wb = Number(b.week);
    if (Number.isFinite(wa) && Number.isFinite(wb)) return wa - wb;
    return (a.date || '').localeCompare(b.date || '');
  });
  const totalCount = entries.length;
  const doneCount = entries.filter(
    (e) => String(e.status || '').toLowerCase() === 'done',
  ).length;

  return (
    <Box
      bg={surface}
      border="1px solid"
      borderColor={hairline}
      borderRadius={{ base: '18px', md: '22px' }}
      p={{ base: '20px', md: '24px' }}
      boxShadow="0 1px 2px rgba(15,23,42,0.04), 0 8px 24px -14px rgba(15,23,42,0.10)"
    >
      <Flex
        justify="space-between"
        align="flex-start"
        gap="10px"
        mb="12px"
        flexWrap="wrap"
      >
        <Box>
          <Text
            fontFamily={FONT_TEXT}
            fontSize="11px"
            fontWeight="700"
            letterSpacing="0.4px"
            textTransform="uppercase"
            color={textTertiary}
            mb="4px"
          >
            Трекер обучения
          </Text>
          <Heading
            as="h3"
            fontFamily={FONT_DISPLAY}
            fontSize={{ base: '18px', md: '20px' }}
            fontWeight="600"
            color={textPrimary}
            letterSpacing="-0.014em"
          >
            {tracker ? `Недели и темы · ${doneCount}/${totalCount}` : 'Трекер не создан'}
          </Heading>
        </Box>
        {tracker ? (
          <Button
            onClick={onAddEntry}
            bg={accent}
            color="white"
            borderRadius="9999px"
            h="32px"
            px="14px"
            fontFamily={FONT_TEXT}
            fontSize="13px"
            fontWeight="500"
            leftIcon={<Icon as={MdAdd} boxSize="14px" />}
            _hover={{ bg: ACCENT_BLUE_HOVER }}
          >
            Добавить запись
          </Button>
        ) : (
          <Button
            onClick={onCreateTracker}
            isLoading={creatingTracker}
            bg={accent}
            color="white"
            borderRadius="9999px"
            h="32px"
            px="14px"
            fontFamily={FONT_TEXT}
            fontSize="13px"
            fontWeight="500"
            leftIcon={<Icon as={MdTrendingUp} boxSize="14px" />}
            _hover={{ bg: ACCENT_BLUE_HOVER }}
          >
            Создать трекер
          </Button>
        )}
      </Flex>

      {!tracker ? (
        <Text
          fontFamily={FONT_TEXT}
          fontSize="14px"
          color={textSecondary}
          lineHeight="1.45"
        >
          Трекер поможет видеть, какие темы уже пройдены и что осталось.
        </Text>
      ) : sorted.length === 0 ? (
        <Text
          fontFamily={FONT_TEXT}
          fontSize="13px"
          color={textSecondary}
        >
          Записей пока нет. Добавьте первую — неделя, тема, статус.
        </Text>
      ) : (
        <Box
          border="1px solid"
          borderColor={hairline}
          borderRadius="14px"
          overflow="hidden"
        >
          {/* Header — desktop only */}
          <Flex
            display={{ base: 'none', md: 'flex' }}
            px="12px"
            py="8px"
            bg={surfaceSoft}
            color={textTertiary}
            fontFamily={FONT_TEXT}
            fontSize="11px"
            fontWeight="700"
            letterSpacing="0.3px"
            textTransform="uppercase"
            gap="10px"
          >
            <Box flex="0 0 70px">Неделя</Box>
            <Box flex="1 1 0">Тема</Box>
            <Box flex="1 1 0">Материал / задание</Box>
            <Box flex="0 0 110px">Статус</Box>
            <Box flex="0 0 32px" />
          </Flex>
          {sorted.map((e) => (
            <Flex
              key={e.id}
              direction={{ base: 'column', md: 'row' }}
              px="12px"
              py="10px"
              borderTop="1px solid"
              borderColor={hairline}
              gap="6px"
              align={{ base: 'flex-start', md: 'center' }}
            >
              <Box flex={{ md: '0 0 70px' }}>
                <Text fontFamily={FONT_TEXT} fontSize="13px" fontWeight="600" color={textPrimary}>
                  {e.week ? `Неделя ${e.week}` : '—'}
                </Text>
              </Box>
              <Box flex={{ md: '1 1 0' }} minW={0}>
                <Text fontFamily={FONT_TEXT} fontSize="13px" color={textPrimary} noOfLines={1}>
                  {e.topic || '—'}
                </Text>
              </Box>
              <Box flex={{ md: '1 1 0' }} minW={0}>
                <Text
                  fontFamily={FONT_TEXT}
                  fontSize="12px"
                  color={textSecondary}
                  noOfLines={2}
                >
                  {[e.material, e.task, e.comment].filter(Boolean).join(' · ')}
                </Text>
              </Box>
              <Box flex={{ md: '0 0 110px' }}>
                <Text
                  fontFamily={FONT_TEXT}
                  fontSize="12px"
                  color={
                    String(e.status || '').toLowerCase() === 'done'
                      ? accent
                      : textSecondary
                  }
                  fontWeight="600"
                  letterSpacing="-0.1px"
                >
                  {prettyStatus(e.status)}
                </Text>
              </Box>
              <Box flex={{ md: '0 0 32px' }}>
                <IconButton
                  onClick={() => onDeleteEntry(e.id)}
                  icon={<Icon as={MdRestartAlt} boxSize="14px" />}
                  aria-label="Удалить запись"
                  size="xs"
                  variant="ghost"
                  color={textTertiary}
                  _hover={{ color: 'red.500' }}
                />
              </Box>
            </Flex>
          ))}
        </Box>
      )}
    </Box>
  );
}

function prettyStatus(s: any): string {
  const v = String(s || '').toLowerCase();
  if (v === 'done') return 'Пройдено';
  if (v === 'in_progress' || v === 'active') return 'В работе';
  if (v === 'blocked' || v === 'stuck') return 'Застрял';
  if (v === 'planned') return 'Запланирована';
  return s || '—';
}

// ── AddLearningEntryModal ───────────────────────────────────────
function AddLearningEntryModal({
  open,
  onClose,
  onSubmit,
  suggestedWeek,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (
    entry: Omit<IProjectTrackerEntryUI, 'id' | 'createdAt'>,
  ) => Promise<boolean>;
  suggestedWeek?: string;
}) {
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const [date, setDate] = useState(today);
  const [week, setWeek] = useState('');
  const [topic, setTopic] = useState('');
  const [material, setMaterial] = useState('');
  const [task, setTask] = useState('');
  const [status, setStatus] = useState('in_progress');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const surface = useColorModeValue('#ffffff', '#1c1d22');
  const hairline = useColorModeValue('rgba(15,23,42,0.08)', 'rgba(255,255,255,0.10)');
  const inputBg = useColorModeValue('#fafafb', 'rgba(255,255,255,0.04)');
  const textPrimary = useColorModeValue('#1d1d1f', '#f5f5f7');
  const textSecondary = useColorModeValue('#6e6e73', 'rgba(245,245,247,0.65)');

  useEffect(() => {
    if (!open) return;
    setDate(today);
    setWeek(suggestedWeek || '');
    setTopic('');
    setMaterial('');
    setTask('');
    setStatus('in_progress');
    setComment('');
  }, [open, today, suggestedWeek]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const ok = await onSubmit({
      date,
      ...({
        week: week.trim() || undefined,
        topic: topic.trim() || undefined,
        material: material.trim() || undefined,
        task: task.trim() || undefined,
        status,
      } as any),
      comment: comment.trim() || undefined,
    });
    setIsSubmitting(false);
    if (ok) onClose();
  };

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      isCentered
      size={{ base: 'full', md: 'md' } as any}
      motionPreset="slideInBottom"
      closeOnOverlayClick
      closeOnEsc
      autoFocus
      portalProps={{ appendToParentPortal: false }}
    >
      <ModalOverlay
        bg="rgba(0,0,0,0.48)"
        sx={{
          backdropFilter: 'blur(14px) saturate(160%)',
          WebkitBackdropFilter: 'blur(14px) saturate(160%)',
        }}
      />
      <ModalContent
        mx={{ base: '16px', md: 'auto' }}
        my={{ base: '16px', md: 'auto' }}
        maxW={{ base: 'calc(100vw - 32px)', md: '560px' }}
        borderRadius={{ base: '22px', md: '24px' }}
        border="1px solid"
        borderColor={hairline}
        bg={surface}
        boxShadow="0 1px 2px rgba(15,23,42,0.04), 0 32px 64px -16px rgba(15,23,42,0.30)"
        overflow="hidden"
      >
        <ModalHeader
          px={{ base: '20px', md: '24px' }}
          pt={{ base: '20px', md: '22px' }}
          pb="4px"
          fontFamily={FONT_DISPLAY}
          fontSize={{ base: '18px', md: '20px' }}
          fontWeight="600"
          letterSpacing="-0.018em"
          color={textPrimary}
        >
          <Box
            as="button"
            type="button"
            onClick={onClose}
            display="inline-flex"
            alignItems="center"
            gap="4px"
            fontFamily={FONT_TEXT}
            fontSize="12px"
            fontWeight="500"
            color={textSecondary}
            bg="transparent"
            cursor="pointer"
            mb="6px"
            _hover={{ color: textPrimary }}
            sx={{ WebkitTapHighlightColor: 'transparent' }}
            aria-label="Назад к проекту"
          >
            <Icon as={MdArrowBack} boxSize="13px" />
            <Text>К проекту</Text>
          </Box>
          Запись в трекер обучения
        </ModalHeader>
        <ModalCloseButton
          borderRadius="9999px"
          top={{ base: '12px', md: '14px' }}
          right={{ base: '12px', md: '14px' }}
        />
        <ModalBody px={{ base: '20px', md: '24px' }} pt="6px" pb="12px">
          <SimpleGrid columns={2} spacing="10px">
            <Field label="Неделя" textSecondary={textSecondary}>
              <Input value={week} onChange={(e) => setWeek(e.target.value)} placeholder="1" bg={inputBg} borderColor={hairline} borderRadius="10px" fontFamily={FONT_TEXT} fontSize="14px" color={textPrimary} />
            </Field>
            <Field label="Дата" textSecondary={textSecondary}>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} bg={inputBg} borderColor={hairline} borderRadius="10px" fontFamily={FONT_TEXT} fontSize="14px" color={textPrimary} />
            </Field>
          </SimpleGrid>
          <Box mt="10px">
            <Field label="Тема" textSecondary={textSecondary}>
              <Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Основы Python: переменные, типы…" bg={inputBg} borderColor={hairline} borderRadius="10px" fontFamily={FONT_TEXT} fontSize="14px" color={textPrimary} />
            </Field>
          </Box>
          <Box mt="10px">
            <Field label="Материал" textSecondary={textSecondary}>
              <Input value={material} onChange={(e) => setMaterial(e.target.value)} placeholder="курс / книга / статья" bg={inputBg} borderColor={hairline} borderRadius="10px" fontFamily={FONT_TEXT} fontSize="14px" color={textPrimary} />
            </Field>
          </Box>
          <Box mt="10px">
            <Field label="Задание" textSecondary={textSecondary}>
              <Input value={task} onChange={(e) => setTask(e.target.value)} placeholder="что нужно сделать" bg={inputBg} borderColor={hairline} borderRadius="10px" fontFamily={FONT_TEXT} fontSize="14px" color={textPrimary} />
            </Field>
          </Box>
          <Box mt="10px">
            <Field label="Статус" textSecondary={textSecondary}>
              <Select value={status} onChange={(e) => setStatus(e.target.value)} bg={inputBg} borderColor={hairline} borderRadius="10px" fontFamily={FONT_TEXT} fontSize="14px" color={textPrimary}>
                <option value="planned">Запланирована</option>
                <option value="in_progress">В работе</option>
                <option value="done">Пройдено</option>
                <option value="blocked">Застрял</option>
              </Select>
            </Field>
          </Box>
          <Box mt="10px">
            <Field label="Комментарий" textSecondary={textSecondary}>
              <Textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="что важно отметить" bg={inputBg} borderColor={hairline} borderRadius="10px" rows={2} fontFamily={FONT_TEXT} fontSize="14px" color={textPrimary} />
            </Field>
          </Box>
        </ModalBody>
        <ModalFooter
          px={{ base: '20px', md: '24px' }}
          pt="6px"
          pb={{
            base: 'calc(20px + env(safe-area-inset-bottom))',
            md: '20px',
          }}
          borderTop="1px solid"
          borderColor={hairline}
          gap="8px"
        >
          <Button
            onClick={onClose}
            variant="ghost"
            borderRadius="9999px"
            h="36px"
            px="16px"
            fontFamily={FONT_TEXT}
            fontSize="13px"
            fontWeight="500"
            color={textPrimary}
            _hover={{ bg: 'rgba(0,0,0,0.04)' }}
          >
            Отмена
          </Button>
          <Button
            onClick={handleSubmit}
            isLoading={isSubmitting}
            bg={ACCENT_BLUE}
            color="white"
            borderRadius="9999px"
            h="36px"
            px="18px"
            fontFamily={FONT_TEXT}
            fontSize="13px"
            fontWeight="600"
            _hover={{ bg: ACCENT_BLUE_HOVER }}
            leftIcon={<Icon as={MdCheck} boxSize="14px" />}
          >
            Сохранить
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default ProjectCommandCenter;
