'use client';

/**
 * Project Command Center — главный экран проекта.
 *
 * Рендерится в /chat?projectId=… когда нет ни одного сообщения. Цель —
 * показать проект как «рабочую комнату», а не как пустой чат:
 *   • цель и следующий шаг;
 *   • счётчики (источники / ветки / артефакты / заметки);
 *   • быстрые действия (выполнить шаг / добавить источник / новая ветка);
 *   • мини-блок источников с per-source quick actions;
 *   • генерация артефактов (план / риски / brief / faq);
 *   • «Что ИИСеть знает» — memory items проекта.
 *
 * Apple-like подача: light surface, hairline borders, мягкие тени, без
 * перегруженности. Хорошо работает с любой шириной chat-area.
 */

import {
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  Icon,
  IconButton,
  SimpleGrid,
  Spinner,
  Text,
  useColorModeValue,
  useToast,
  VStack,
} from '@chakra-ui/react';
import React, { useCallback, useEffect, useState } from 'react';
import {
  MdAdd,
  MdAutoAwesome,
  MdDescription,
  MdFolderOpen,
  MdInsertDriveFile,
  MdLink as MdLinkIcon,
  MdNoteAlt,
  MdOutlineChecklist,
  MdOutlineLightbulb,
  MdOutlineWarningAmber,
  MdRefresh,
  MdTask,
  MdTrendingUp,
} from 'react-icons/md';
import {
  projectsService,
  IProjectUI,
  IProjectSourceUI,
  IProjectThreadUI,
  IProjectArtifactUI,
  ProjectArtifactKind,
  IProjectMemoryItemUI,
  IProjectBlueprintUI,
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
  onCreateThread: () => void;
  /** Отправить готовую команду в чат (Send → агенту). */
  onSendAction: (text: string) => void;
}

interface ArtifactSpec {
  kind: ProjectArtifactKind;
  title: string;
  icon: any;
  hint: string;
}

const ARTIFACT_SPECS: ArtifactSpec[] = [
  {
    kind: 'plan',
    title: 'План',
    icon: MdOutlineChecklist,
    hint: 'Пошаговый план действий с критериями успеха',
  },
  {
    kind: 'risks',
    title: 'Риски',
    icon: MdOutlineWarningAmber,
    hint: 'Карта рисков и шагов для митигации',
  },
  {
    kind: 'brief',
    title: 'Brief',
    icon: MdDescription,
    hint: 'Короткий обзор: цель, ключевые факты, контекст',
  },
  {
    kind: 'faq',
    title: 'FAQ',
    icon: MdOutlineLightbulb,
    hint: '6–10 вопросов и ответов по проекту',
  },
];

const MEMORY_GROUPS: Array<{
  key: IProjectMemoryItemUI['type'];
  label: string;
  icon: any;
}> = [
  { key: 'fact', label: 'Факты', icon: MdOutlineLightbulb },
  { key: 'decision', label: 'Решения', icon: MdTrendingUp },
  { key: 'risk', label: 'Риски', icon: MdOutlineWarningAmber },
  { key: 'task', label: 'Задачи', icon: MdTask },
  { key: 'note', label: 'Заметки', icon: MdNoteAlt },
];

function ProjectCommandCenter({
  projectId,
  onOpenSources,
  onCreateThread,
  onSendAction,
}: Props) {
  const toast = useToast();

  const [project, setProject] = useState<IProjectUI | null>(null);
  const [sources, setSources] = useState<IProjectSourceUI[]>([]);
  const [threads, setThreads] = useState<IProjectThreadUI[]>([]);
  const [artifacts, setArtifacts] = useState<IProjectArtifactUI[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [generatingArtifact, setGeneratingArtifact] =
    useState<ProjectArtifactKind | null>(null);
  // Blueprint-driven UI
  const [intakeOpen, setIntakeOpen] = useState(false);
  const [creatingLivingDoc, setCreatingLivingDoc] = useState(false);
  const [creatingTracker, setCreatingTracker] = useState(false);

  // ── Tokens ────────────────────────────────────────────────────
  const surface = useColorModeValue('#ffffff', 'rgba(28,28,32,0.78)');
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

  // ── Load everything ────────────────────────────────────────────
  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const [p, src, thr, art] = await Promise.all([
        projectsService.get(projectId),
        projectsService.listSources(projectId),
        projectsService.listThreads(projectId),
        projectsService.listArtifacts(projectId),
      ]);
      setProject(p);
      setSources(src);
      setThreads(thr);
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

  const handleGenerateArtifact = async (kind: ProjectArtifactKind) => {
    setGeneratingArtifact(kind);
    try {
      const artifact = await projectsService.createArtifact(projectId, kind);
      if (!artifact) throw new Error('null artifact');
      setArtifacts((prev) => [artifact, ...prev]);
      toast({
        title: 'Документ создан',
        description: artifact.title,
        status: 'success',
        duration: 2500,
        isClosable: true,
      });
    } catch (e) {
      console.error(e);
      toast({
        title: 'Не удалось создать документ',
        description: 'Попробуйте ещё раз или добавьте источники.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setGeneratingArtifact(null);
    }
  };

  const handleNextStep = () => {
    const goal = project?.goal || project?.title || 'этого проекта';
    const nextStep = project?.nextStep;
    const prompt = nextStep
      ? `Выполни следующий шаг проекта «${project?.title || ''}»: «${nextStep}». ` +
        `Опирайся на цель («${goal}»), источники и историю проекта. ` +
        `Сохрани ключевые выводы и предложи обновление nextStep.`
      : `Помоги двигаться в проекте «${project?.title || ''}». ` +
        `Цель: «${goal}». Предложи конкретный следующий шаг с критерием успеха ` +
        `и начни его выполнять на основе источников проекта.`;
    onSendAction(prompt);
  };

  // ── Blueprint-driven first step ──────────────────────────────
  const handleFirstStep = async () => {
    const bp = project?.blueprint;
    if (!bp) return handleNextStep();
    const fs = bp.firstStep;
    switch (fs?.type) {
      case 'intake_form':
        setIntakeOpen(true);
        return;
      case 'upload_sources':
        onOpenSources();
        return;
      case 'web_research': {
        const goal = project?.goal || project?.title || '';
        onSendAction(
          `Запусти веб-исследование под цель проекта «${project?.title || ''}»: ${goal}. ` +
            `Используй интернет-поиск, обязательно приведи источники [1], [2] для ключевых утверждений. ` +
            `В конце предложи 3 следующих шага.`,
        );
        return;
      }
      case 'create_living_document': {
        await handleCreateLivingDoc();
        return;
      }
      default:
        return handleNextStep();
    }
  };

  const handleCreateLivingDoc = async () => {
    setCreatingLivingDoc(true);
    try {
      const a = await projectsService.createArtifact(
        projectId,
        'living_document' as ProjectArtifactKind,
      );
      if (a) {
        setArtifacts((prev) => [a, ...prev]);
        toast({
          title: 'Главный документ создан',
          description: a.title,
          status: 'success',
          duration: 2500,
          isClosable: true,
        });
      }
    } catch (e) {
      console.error(e);
      toast({
        title: 'Не удалось создать документ',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setCreatingLivingDoc(false);
    }
  };

  const handleCreateTracker = async () => {
    setCreatingTracker(true);
    try {
      const a = await projectsService.createArtifact(
        projectId,
        'tracker' as ProjectArtifactKind,
      );
      if (a) {
        setArtifacts((prev) => [a, ...prev]);
        toast({
          title: 'Трекер создан',
          description: a.title,
          status: 'success',
          duration: 2500,
          isClosable: true,
        });
      }
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

  // ── Memory grouped by type ────────────────────────────────────
  const memoryByType = (project?.memoryItems || []).reduce<
    Record<string, IProjectMemoryItemUI[]>
  >((acc, item) => {
    const k = item?.type || 'note';
    (acc[k] = acc[k] || []).push(item);
    return acc;
  }, {});

  if (isLoading && !project) {
    return (
      <Flex justify="center" align="center" py="64px">
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

  const sourceCount = sources.length;
  const threadCount = threads.length;
  const artifactCount = artifacts.length;
  const memoryCount = project.memoryItems?.length || 0;

  return (
    <Flex
      direction="column"
      gap="20px"
      width="100%"
      maxW="100%"
      minW={0}
      px={{ base: '4px', md: '0' }}
    >
      {/* ── Header card ───────────────────────────────────────── */}
      <Box
        bg={surface}
        border="1px solid"
        borderColor={hairline}
        borderRadius={{ base: '18px', md: '22px' }}
        p={{ base: '20px', md: '28px' }}
        boxShadow="0 1px 2px rgba(15,23,42,0.04), 0 12px 32px -16px rgba(15,23,42,0.12)"
      >
        <Flex align="center" gap="8px" mb="10px">
          <Box
            boxSize="22px"
            borderRadius="6px"
            bg={accentSoftBg}
            display="flex"
            alignItems="center"
            justifyContent="center"
            flexShrink={0}
          >
            <Icon as={MdAutoAwesome} boxSize="13px" color={accent} />
          </Box>
          <Text
            fontFamily={FONT_TEXT}
            fontSize="11px"
            fontWeight="700"
            letterSpacing="0.5px"
            textTransform="uppercase"
            color={accent}
          >
            Рабочая комната
          </Text>
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
            mb={project.nextStep ? '16px' : '0'}
          >
            Цель: {project.goal}
          </Text>
        )}

        {project.nextStep && (
          <Box
            mt="6px"
            bg={surfaceSoft}
            border="1px solid"
            borderColor={hairline}
            borderRadius="14px"
            p={{ base: '14px', md: '16px' }}
          >
            <Text
              fontFamily={FONT_TEXT}
              fontSize="11px"
              fontWeight="600"
              letterSpacing="0.4px"
              textTransform="uppercase"
              color={textTertiary}
              mb="6px"
            >
              Следующий шаг
            </Text>
            <Text
              fontFamily={FONT_TEXT}
              fontSize={{ base: '14px', md: '15px' }}
              color={textPrimary}
              lineHeight="1.45"
              mb="12px"
            >
              {project.nextStep}
            </Text>
            <Button
              onClick={handleNextStep}
              bg={accent}
              color="white"
              borderRadius="9999px"
              h="34px"
              px="16px"
              fontFamily={FONT_TEXT}
              fontWeight="500"
              fontSize="13px"
              _hover={{ bg: ACCENT_BLUE_HOVER }}
              _active={{ transform: 'scale(0.98)' }}
              transition="background-color 0.15s ease, transform 0.15s ease"
            >
              Выполнить шаг
            </Button>
          </Box>
        )}
      </Box>

      {/* ── Agent Blueprint block (показывается, если есть) ───── */}
      {project.blueprint && (
        <BlueprintBlock
          blueprint={project.blueprint}
          surface={surface}
          surfaceSoft={surfaceSoft}
          hairline={hairline}
          accentSoftBg={accentSoftBg}
          accent={accent}
          textPrimary={textPrimary}
          textSecondary={textSecondary}
          textTertiary={textTertiary}
          onFirstStep={handleFirstStep}
          onCreateLivingDoc={handleCreateLivingDoc}
          onCreateTracker={handleCreateTracker}
          creatingLivingDoc={creatingLivingDoc}
          creatingTracker={creatingTracker}
        />
      )}

      {/* ── Stats + quick actions ────────────────────────────── */}
      <SimpleGrid columns={{ base: 2, md: 4 }} spacing="8px">
        <StatCard
          label="Источники"
          value={sourceCount}
          icon={MdFolderOpen}
          surface={surface}
          surfaceSoft={surfaceSoft}
          hairline={hairline}
          accent={accent}
          accentSoftBg={accentSoftBg}
          textPrimary={textPrimary}
          textSecondary={textSecondary}
          onClick={onOpenSources}
        />
        <StatCard
          label="Ветки"
          value={threadCount}
          icon={MdOutlineChecklist}
          surface={surface}
          surfaceSoft={surfaceSoft}
          hairline={hairline}
          accent={accent}
          accentSoftBg={accentSoftBg}
          textPrimary={textPrimary}
          textSecondary={textSecondary}
          onClick={onCreateThread}
        />
        <StatCard
          label="Документы"
          value={artifactCount}
          icon={MdDescription}
          surface={surface}
          surfaceSoft={surfaceSoft}
          hairline={hairline}
          accent={accent}
          accentSoftBg={accentSoftBg}
          textPrimary={textPrimary}
          textSecondary={textSecondary}
        />
        <StatCard
          label="Заметки"
          value={memoryCount}
          icon={MdNoteAlt}
          surface={surface}
          surfaceSoft={surfaceSoft}
          hairline={hairline}
          accent={accent}
          accentSoftBg={accentSoftBg}
          textPrimary={textPrimary}
          textSecondary={textSecondary}
        />
      </SimpleGrid>

      {/* ── Primary CTAs ─────────────────────────────────────── */}
      <Flex gap="8px" flexWrap="wrap">
        <Button
          onClick={onOpenSources}
          bg="transparent"
          color={textPrimary}
          border="1px solid"
          borderColor={hairline}
          borderRadius="9999px"
          h="34px"
          px="14px"
          fontFamily={FONT_TEXT}
          fontWeight="500"
          fontSize="13px"
          leftIcon={<Icon as={MdAdd} boxSize="14px" />}
          _hover={{ borderColor: accent, color: accent }}
        >
          Добавить источник
        </Button>
        <Button
          onClick={onCreateThread}
          bg="transparent"
          color={textPrimary}
          border="1px solid"
          borderColor={hairline}
          borderRadius="9999px"
          h="34px"
          px="14px"
          fontFamily={FONT_TEXT}
          fontWeight="500"
          fontSize="13px"
          leftIcon={<Icon as={MdAdd} boxSize="14px" />}
          _hover={{ borderColor: accent, color: accent }}
        >
          Новая ветка
        </Button>
      </Flex>

      {/* ── Sources mini-list ────────────────────────────────── */}
      <SectionCard
        title="Источники"
        subtitle={
          sourceCount === 0
            ? 'Добавьте файл, ссылку или заметку — ИИСеть будет отвечать с учётом ваших материалов.'
            : `${sourceCount}`
        }
        action={
          <Button
            onClick={onOpenSources}
            variant="ghost"
            size="sm"
            color={accent}
            _hover={{ bg: 'transparent', textDecoration: 'underline' }}
            fontSize="13px"
            fontWeight="500"
            h="28px"
            px="6px"
          >
            Открыть{sourceCount > 0 ? ' все' : ''}
          </Button>
        }
        surface={surface}
        hairline={hairline}
        textPrimary={textPrimary}
        textSecondary={textSecondary}
      >
        {sourceCount === 0 ? (
          <Button
            onClick={onOpenSources}
            bg={accent}
            color="white"
            borderRadius="9999px"
            h="34px"
            px="16px"
            fontFamily={FONT_TEXT}
            fontWeight="500"
            fontSize="13px"
            leftIcon={<Icon as={MdAdd} boxSize="14px" />}
            _hover={{ bg: ACCENT_BLUE_HOVER }}
            alignSelf="flex-start"
          >
            Добавить источник
          </Button>
        ) : (
          <Flex direction="column" gap="6px">
            {sources.slice(0, 4).map((s) => (
              <SourceMiniCard
                key={s._id}
                source={s}
                surfaceSoft={surfaceSoft}
                hairline={hairline}
                accent={accent}
                textPrimary={textPrimary}
                textSecondary={textSecondary}
                textTertiary={textTertiary}
                onAction={(text) => onSendAction(text)}
              />
            ))}
          </Flex>
        )}
      </SectionCard>

      {/* ── Artifacts ────────────────────────────────────────── */}
      <SectionCard
        title="Документы проекта"
        subtitle={
          artifactCount === 0
            ? 'Сохранённые выводы и сводки. Создайте план, brief или карту рисков — они появятся здесь.'
            : `${artifactCount}`
        }
        surface={surface}
        hairline={hairline}
        textPrimary={textPrimary}
        textSecondary={textSecondary}
      >
        {/* Generators */}
        <SimpleGrid columns={{ base: 2, md: 4 }} spacing="6px" mb="12px">
          {ARTIFACT_SPECS.map((spec) => {
            const isGenerating = generatingArtifact === spec.kind;
            return (
              <Box
                key={spec.kind}
                as="button"
                type="button"
                onClick={() => handleGenerateArtifact(spec.kind)}
                disabled={!!generatingArtifact}
                title={spec.hint}
                aria-label={`Сгенерировать: ${spec.title}`}
                bg={surfaceSoft}
                border="1px solid"
                borderColor={hairline}
                borderRadius="12px"
                px="10px"
                py="10px"
                textAlign="left"
                cursor={generatingArtifact ? 'wait' : 'pointer'}
                opacity={generatingArtifact && !isGenerating ? 0.55 : 1}
                _hover={
                  generatingArtifact
                    ? undefined
                    : { borderColor: accent, color: accent }
                }
                transition="border-color 0.15s ease, color 0.15s ease"
                sx={{ WebkitTapHighlightColor: 'transparent' }}
                color={textPrimary}
              >
                <Flex align="center" gap="6px" mb="2px">
                  {isGenerating ? (
                    <Spinner size="xs" color={accent} />
                  ) : (
                    <Icon as={spec.icon} boxSize="14px" color={accent} />
                  )}
                  <Text
                    fontFamily={FONT_TEXT}
                    fontSize="12px"
                    fontWeight="600"
                    letterSpacing="-0.1px"
                  >
                    {spec.title}
                  </Text>
                </Flex>
                <Text
                  fontSize="11px"
                  color={textTertiary}
                  lineHeight="1.35"
                  noOfLines={2}
                >
                  {spec.hint}
                </Text>
              </Box>
            );
          })}
        </SimpleGrid>

        {artifactCount > 0 && (
          <Flex direction="column" gap="6px">
            {artifacts.slice(0, 4).map((a) => (
              <Box
                key={a._id}
                bg={surfaceSoft}
                border="1px solid"
                borderColor={hairline}
                borderRadius="11px"
                p="10px 12px"
              >
                <Text
                  fontFamily={FONT_TEXT}
                  fontSize="13px"
                  fontWeight="600"
                  color={textPrimary}
                  noOfLines={1}
                >
                  {a.title}
                </Text>
                <Text
                  fontFamily={FONT_TEXT}
                  fontSize="12px"
                  color={textSecondary}
                  noOfLines={2}
                  lineHeight="1.4"
                  mt="2px"
                >
                  {(a.content || '').slice(0, 240)}
                </Text>
              </Box>
            ))}
          </Flex>
        )}
      </SectionCard>

      {/* ── What ИИСеть knows ────────────────────────────────── */}
      <SectionCard
        title="Что ИИСеть знает"
        subtitle={
          memoryCount === 0
            ? 'Память проекта пополнится автоматически по мере работы — факты, решения, риски и задачи.'
            : `${memoryCount}`
        }
        surface={surface}
        hairline={hairline}
        textPrimary={textPrimary}
        textSecondary={textSecondary}
      >
        {memoryCount === 0 ? (
          <Text fontSize="13px" color={textSecondary} lineHeight="1.45">
            Сейчас память пустая. Попросите ИИ сделать выводы по источнику —
            и они появятся здесь.
          </Text>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing="8px">
            {MEMORY_GROUPS.filter(
              (g) => (memoryByType[g.key] || []).length > 0,
            ).map((g) => {
              const items = memoryByType[g.key] || [];
              return (
                <Box
                  key={g.key}
                  bg={surfaceSoft}
                  border="1px solid"
                  borderColor={hairline}
                  borderRadius="11px"
                  p="10px 12px"
                >
                  <Flex align="center" gap="6px" mb="6px">
                    <Icon as={g.icon} boxSize="13px" color={accent} />
                    <Text
                      fontFamily={FONT_TEXT}
                      fontSize="11px"
                      fontWeight="700"
                      letterSpacing="0.4px"
                      textTransform="uppercase"
                      color={textTertiary}
                    >
                      {g.label} · {items.length}
                    </Text>
                  </Flex>
                  <VStack align="stretch" spacing="4px">
                    {items.slice(0, 3).map((it, i) => (
                      <Text
                        key={i}
                        fontSize="12px"
                        color={textPrimary}
                        lineHeight="1.4"
                        noOfLines={2}
                      >
                        — {it.text}
                      </Text>
                    ))}
                  </VStack>
                </Box>
              );
            })}
          </SimpleGrid>
        )}
      </SectionCard>

      {/* Footer: refresh */}
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

      {/* Intake form — модалка анкеты, открывается при firstStep.type==='intake_form' */}
      {project.blueprint?.firstStep?.type === 'intake_form' && (
        <ProjectIntakeForm
          projectId={projectId}
          formKind={project.blueprint.firstStep.formKind || 'general'}
          open={intakeOpen}
          onClose={() => setIntakeOpen(false)}
          onSubmitted={(msg) => {
            void load();
            onSendAction(msg);
          }}
        />
      )}
    </Flex>
  );
}

// ── StatCard ───────────────────────────────────────────────────
function StatCard({
  label,
  value,
  icon,
  surface,
  surfaceSoft,
  hairline,
  accent,
  accentSoftBg,
  textPrimary,
  textSecondary,
  onClick,
}: {
  label: string;
  value: number;
  icon: any;
  surface: string;
  surfaceSoft: string;
  hairline: string;
  accent: string;
  accentSoftBg: string;
  textPrimary: string;
  textSecondary: string;
  onClick?: () => void;
}) {
  return (
    <Box
      as={onClick ? 'button' : 'div'}
      type={onClick ? ('button' as any) : undefined}
      onClick={onClick}
      bg={surface}
      border="1px solid"
      borderColor={hairline}
      borderRadius="14px"
      p="12px 14px"
      textAlign="left"
      cursor={onClick ? 'pointer' : 'default'}
      _hover={onClick ? { borderColor: accent } : undefined}
      transition="border-color 0.15s ease"
      sx={{ WebkitTapHighlightColor: 'transparent' }}
    >
      <Flex align="center" gap="6px" mb="4px">
        <Box
          boxSize="20px"
          borderRadius="6px"
          bg={accentSoftBg}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Icon as={icon} boxSize="12px" color={accent} />
        </Box>
        <Text
          fontFamily={FONT_TEXT}
          fontSize="11px"
          fontWeight="600"
          letterSpacing="0.4px"
          textTransform="uppercase"
          color={textSecondary}
          noOfLines={1}
        >
          {label}
        </Text>
      </Flex>
      <Text
        fontFamily={FONT_DISPLAY}
        fontSize="22px"
        fontWeight="600"
        letterSpacing="-0.02em"
        color={textPrimary}
        sx={{ fontVariantNumeric: 'tabular-nums' }}
      >
        {value}
      </Text>
    </Box>
  );
}

// ── SectionCard ───────────────────────────────────────────────
function SectionCard({
  title,
  subtitle,
  action,
  children,
  surface,
  hairline,
  textPrimary,
  textSecondary,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  surface: string;
  hairline: string;
  textPrimary: string;
  textSecondary: string;
}) {
  return (
    <Box
      bg={surface}
      border="1px solid"
      borderColor={hairline}
      borderRadius="18px"
      p={{ base: '14px', md: '18px' }}
      boxShadow="0 1px 2px rgba(15,23,42,0.04), 0 8px 24px -14px rgba(15,23,42,0.10)"
    >
      <Flex
        align={{ base: 'flex-start', md: 'center' }}
        justify="space-between"
        gap="10px"
        mb="12px"
        direction={{ base: 'column', md: 'row' }}
      >
        <Box minW={0}>
          <Text
            fontFamily={FONT_DISPLAY}
            fontSize="16px"
            fontWeight="600"
            letterSpacing="-0.014em"
            color={textPrimary}
          >
            {title}
          </Text>
          {subtitle && (
            <Text
              fontFamily={FONT_TEXT}
              fontSize="12px"
              color={textSecondary}
              lineHeight="1.4"
              mt="2px"
            >
              {subtitle}
            </Text>
          )}
        </Box>
        {action}
      </Flex>
      {children}
    </Box>
  );
}

// ── SourceMiniCard ─────────────────────────────────────────────
function SourceMiniCard({
  source,
  surfaceSoft,
  hairline,
  accent,
  textPrimary,
  textSecondary,
  textTertiary,
  onAction,
}: {
  source: IProjectSourceUI;
  surfaceSoft: string;
  hairline: string;
  accent: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  onAction: (text: string) => void;
}) {
  const titleForPrompt = source.title || 'этому источнику';
  const QUICK_ACTIONS: Array<{ label: string; prompt: string }> = [
    {
      label: 'Summary',
      prompt: `Сделай короткое summary источника «${titleForPrompt}»: 5 пунктов, опираясь на сам документ.`,
    },
    {
      label: 'Ключевые факты',
      prompt: `Выпиши 5–8 ключевых фактов из источника «${titleForPrompt}». Каждый факт — одной строкой.`,
    },
    {
      label: 'Риски',
      prompt: `Найди риски и слабые места в источнике «${titleForPrompt}». На каждый — короткий шаг для митигации.`,
    },
    {
      label: 'Сравнить с интернетом',
      prompt: `Сравни выводы источника «${titleForPrompt}» с тем, что есть в интернете: где совпадает, где расходится, что важно проверить.`,
    },
  ];

  const icon =
    source.type === 'file'
      ? MdInsertDriveFile
      : source.type === 'link'
      ? MdLinkIcon
      : source.type === 'note'
      ? MdNoteAlt
      : MdInsertDriveFile;

  return (
    <Box
      bg={surfaceSoft}
      border="1px solid"
      borderColor={hairline}
      borderRadius="12px"
      p="10px 12px"
    >
      <Flex align="center" gap="8px" mb="6px" minW={0}>
        <Icon as={icon} boxSize="14px" color={accent} flexShrink={0} />
        <Text
          fontFamily={FONT_TEXT}
          fontSize="13px"
          fontWeight="600"
          color={textPrimary}
          noOfLines={1}
          flex="1 1 0"
          minW={0}
        >
          {source.title || source.originalName || 'Источник'}
        </Text>
        <Text fontSize="11px" color={textTertiary} flexShrink={0}>
          {source.status === 'ready' ? 'готов' : source.status}
        </Text>
      </Flex>
      <Flex gap="4px" flexWrap="wrap">
        {QUICK_ACTIONS.map((a) => (
          <Box
            key={a.label}
            as="button"
            type="button"
            onClick={() => onAction(a.prompt)}
            px="8px"
            py="3px"
            borderRadius="9999px"
            bg="transparent"
            border="1px solid"
            borderColor={hairline}
            color={textSecondary}
            fontFamily={FONT_TEXT}
            fontSize="11px"
            fontWeight="500"
            cursor="pointer"
            _hover={{ borderColor: accent, color: accent }}
            transition="border-color 0.14s ease, color 0.14s ease"
            sx={{ WebkitTapHighlightColor: 'transparent' }}
          >
            {a.label}
          </Box>
        ))}
      </Flex>
    </Box>
  );
}

// ── BlueprintBlock ────────────────────────────────────────────
// Показывает agent-blueprint: домен, недостающие вводные, первый шаг
// как action card, план, будущие артефакты, главный документ, трекер.
function BlueprintBlock({
  blueprint,
  surface,
  surfaceSoft,
  hairline,
  accentSoftBg,
  accent,
  textPrimary,
  textSecondary,
  textTertiary,
  onFirstStep,
  onCreateLivingDoc,
  onCreateTracker,
  creatingLivingDoc,
  creatingTracker,
}: {
  blueprint: IProjectBlueprintUI;
  surface: string;
  surfaceSoft: string;
  hairline: string;
  accentSoftBg: string;
  accent: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  onFirstStep: () => void;
  onCreateLivingDoc: () => void;
  onCreateTracker: () => void;
  creatingLivingDoc: boolean;
  creatingTracker: boolean;
}) {
  const domainLabel = RU_DOMAIN_LABELS_UI[blueprint.domain] || 'Общая задача';
  const fs = blueprint.firstStep;
  const hasTracker =
    blueprint.mechanics?.includes('progress_tracking') ||
    blueprint.mechanics?.includes('metric_tracking');
  const hasLivingDoc = blueprint.mechanics?.includes('single_living_document');
  const firstStepCta =
    fs?.type === 'intake_form'
      ? 'Заполнить анкету'
      : fs?.type === 'upload_sources'
        ? 'Загрузить документы'
        : fs?.type === 'web_research'
          ? 'Запустить исследование'
          : fs?.type === 'create_living_document'
            ? 'Создать главный документ'
            : 'Сделать шаг';

  return (
    <Box
      bg={surface}
      border="1px solid"
      borderColor={hairline}
      borderRadius={{ base: '18px', md: '22px' }}
      p={{ base: '20px', md: '28px' }}
      boxShadow="0 1px 2px rgba(15,23,42,0.04), 0 12px 32px -16px rgba(15,23,42,0.12)"
    >
      {/* Domain pill */}
      <Flex align="center" gap="8px" mb="14px" flexWrap="wrap">
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
            {domainLabel}
          </Text>
        </Box>
        {(blueprint.mechanics || []).slice(0, 3).map((m) => (
          <Text
            key={m}
            fontFamily={FONT_TEXT}
            fontSize="10px"
            fontWeight="600"
            color={textTertiary}
            letterSpacing="0.3px"
            textTransform="uppercase"
          >
            {ruMechanicLabel(m)}
          </Text>
        ))}
      </Flex>

      <Heading
        as="h3"
        fontFamily={FONT_DISPLAY}
        fontSize={{ base: '20px', md: '24px' }}
        fontWeight="600"
        letterSpacing="-0.018em"
        lineHeight="1.18"
        color={textPrimary}
        mb="10px"
      >
        Маршрут к результату
      </Heading>

      {/* First step action card */}
      {fs && (
        <Box
          bg={surfaceSoft}
          border="1px solid"
          borderColor={hairline}
          borderRadius="14px"
          p={{ base: '14px', md: '16px' }}
          mb="16px"
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
            Шаг 1
          </Text>
          <Text
            fontFamily={FONT_DISPLAY}
            fontSize={{ base: '16px', md: '18px' }}
            fontWeight="600"
            color={textPrimary}
            letterSpacing="-0.014em"
            mb="6px"
            lineHeight="1.3"
          >
            {fs.title}
          </Text>
          {fs.hint && (
            <Text
              fontFamily={FONT_TEXT}
              fontSize="13px"
              color={textSecondary}
              lineHeight="1.45"
              mb="12px"
            >
              {fs.hint}
            </Text>
          )}
          <Button
            onClick={onFirstStep}
            bg={accent}
            color="white"
            borderRadius="9999px"
            h="34px"
            px="16px"
            fontFamily={FONT_TEXT}
            fontWeight="500"
            fontSize="13px"
            _hover={{ bg: '#0071e3' }}
            _active={{ transform: 'scale(0.98)' }}
            transition="background-color 0.15s ease, transform 0.15s ease"
          >
            {firstStepCta}
          </Button>
        </Box>
      )}

      {/* Missing inputs */}
      {Array.isArray(blueprint.missingInputs) &&
        blueprint.missingInputs.length > 0 && (
          <Box mb="16px">
            <Text
              fontFamily={FONT_TEXT}
              fontSize="11px"
              fontWeight="700"
              letterSpacing="0.4px"
              textTransform="uppercase"
              color={textTertiary}
              mb="8px"
            >
              Что нужно собрать
            </Text>
            <Flex gap="6px" flexWrap="wrap">
              {blueprint.missingInputs.slice(0, 10).map((mi) => (
                <Box
                  key={mi}
                  px="10px"
                  py="4px"
                  borderRadius="9999px"
                  bg="transparent"
                  border="1px solid"
                  borderColor={hairline}
                >
                  <Text
                    fontFamily={FONT_TEXT}
                    fontSize="12px"
                    color={textSecondary}
                  >
                    {mi}
                  </Text>
                </Box>
              ))}
            </Flex>
          </Box>
        )}

      {/* Plan steps */}
      {Array.isArray(blueprint.steps) && blueprint.steps.length > 0 && (
        <Box mb="16px">
          <Text
            fontFamily={FONT_TEXT}
            fontSize="11px"
            fontWeight="700"
            letterSpacing="0.4px"
            textTransform="uppercase"
            color={textTertiary}
            mb="8px"
          >
            План
          </Text>
          <VStack align="stretch" spacing="6px">
            {blueprint.steps.slice(0, 8).map((s, i) => (
              <Flex
                key={`${i}-${s}`}
                gap="10px"
                align="flex-start"
                p="8px 10px"
                borderRadius="10px"
                bg={surfaceSoft}
                border="1px solid"
                borderColor={hairline}
              >
                <Text
                  fontFamily={FONT_TEXT}
                  fontSize="11px"
                  fontWeight="700"
                  letterSpacing="0.4px"
                  color={textTertiary}
                  flexShrink={0}
                  pt="1px"
                  sx={{ fontVariantNumeric: 'tabular-nums' }}
                >
                  {String(i + 1).padStart(2, '0')}
                </Text>
                <Text
                  fontFamily={FONT_TEXT}
                  fontSize="13px"
                  color={textPrimary}
                  lineHeight="1.45"
                >
                  {s}
                </Text>
              </Flex>
            ))}
          </VStack>
        </Box>
      )}

      {/* Future artifacts plan */}
      {Array.isArray(blueprint.artifactPlans) &&
        blueprint.artifactPlans.length > 0 && (
          <Box mb={hasLivingDoc || hasTracker ? '16px' : '0'}>
            <Text
              fontFamily={FONT_TEXT}
              fontSize="11px"
              fontWeight="700"
              letterSpacing="0.4px"
              textTransform="uppercase"
              color={textTertiary}
              mb="8px"
            >
              Будущие документы
            </Text>
            <Flex gap="6px" flexWrap="wrap">
              {blueprint.artifactPlans.map((ap) => (
                <Box
                  key={ap.title}
                  px="10px"
                  py="6px"
                  borderRadius="9999px"
                  bg={surfaceSoft}
                  border="1px solid"
                  borderColor={hairline}
                  title={ap.hint}
                >
                  <Text
                    fontFamily={FONT_TEXT}
                    fontSize="12px"
                    fontWeight="500"
                    color={textPrimary}
                  >
                    {ap.title}
                  </Text>
                </Box>
              ))}
            </Flex>
          </Box>
        )}

      {/* Primary living document + tracker quick actions */}
      {(hasLivingDoc || hasTracker) && (
        <Flex gap="8px" flexWrap="wrap" mt="6px">
          {hasLivingDoc && (
            <Button
              onClick={onCreateLivingDoc}
              isLoading={creatingLivingDoc}
              bg="transparent"
              color={textPrimary}
              border="1px solid"
              borderColor={hairline}
              borderRadius="9999px"
              h="32px"
              px="14px"
              fontFamily={FONT_TEXT}
              fontWeight="500"
              fontSize="12px"
              _hover={{ borderColor: accent, color: accent }}
            >
              Создать «{blueprint.primaryDocumentTitle || 'Главный документ'}»
            </Button>
          )}
          {hasTracker && (
            <Button
              onClick={onCreateTracker}
              isLoading={creatingTracker}
              bg="transparent"
              color={textPrimary}
              border="1px solid"
              borderColor={hairline}
              borderRadius="9999px"
              h="32px"
              px="14px"
              fontFamily={FONT_TEXT}
              fontWeight="500"
              fontSize="12px"
              _hover={{ borderColor: accent, color: accent }}
            >
              Завести трекер
            </Button>
          )}
        </Flex>
      )}
    </Box>
  );
}

const RU_MECHANIC_LABELS: Record<string, string> = {
  intake_required: 'Анкета',
  file_required: 'Файлы',
  web_research_required: 'Веб-поиск',
  single_living_document: 'Гл. документ',
  multi_artifact_workspace: 'Несколько артефактов',
  progress_tracking: 'Прогресс',
  metric_tracking: 'Метрики',
  deadline_tracking: 'Дедлайны',
  calculator_required: 'Расчёт',
  comparison_required: 'Сравнение',
  source_citation_required: 'Источники',
  recurring_checkins: 'Регулярные сверки',
  risk_sensitive: 'Риски',
};
function ruMechanicLabel(m: string): string {
  return RU_MECHANIC_LABELS[m] || m;
}

export default ProjectCommandCenter;
