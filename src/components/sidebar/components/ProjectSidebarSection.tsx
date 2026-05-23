'use client';

import {
  Box,
  Button,
  Flex,
  Icon,
  IconButton,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spinner,
  Text,
  Textarea,
  useToast,
} from '@chakra-ui/react';
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  MdAdd,
  MdAutoAwesome,
  MdChevronRight,
  MdKeyboardArrowDown,
} from 'react-icons/md';
import {
  projectsService,
  IProjectUI,
  IProjectThreadUI,
  RU_DOMAIN_LABELS_UI,
} from '@/services/ui/ProjectsService';
import { ModalContext } from '@/contexts/ModalContext';
import { useUser } from '@/utils/hooks/useUser';

const PROJECT_EXAMPLES = [
  'Открыть свой бизнес',
  'Написать курсовую',
  'Похудеть к лету',
  'Выучить Python',
  'Найти работу',
  'Написать книгу',
];

const FONT_APPLE_TEXT = `'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif`;
const FONT_APPLE_DISPLAY = `'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif`;

const ACCENT_BLUE = '#0066cc';
const ACCENT_BLUE_HOVER = '#0071e3';

/**
 * Список «умных проектов» в левой шторке.
 *
 * Это не папки с чатами: каждый проект показывает свою цель и подсказку
 * «следующий шаг». Клик — открывает /chat?projectId=<id>, активный
 * проект подсвечен.
 */
function ProjectSidebarSection() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeProjectId = searchParams?.get('projectId') || null;
  const toast = useToast();
  const { setSideBarOpen } = useContext(ModalContext);
  const { isAnonymous } = useUser(false);

  const [projects, setProjects] = useState<IProjectUI[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [rawText, setRawText] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // ── Threads (ветки) ────────────────────────────────────────────
  // Одно раскрытие в момент времени — sidebar узкий, два-три открытых
  // проекта одновременно ломают визуальный ритм.
  const activeThreadId = searchParams?.get('threadId') || null;
  const [expandedProjectId, setExpandedProjectId] = useState<string | null>(
    null,
  );
  const [threadsByProject, setThreadsByProject] = useState<
    Record<string, IProjectThreadUI[]>
  >({});
  const [threadsLoadingFor, setThreadsLoadingFor] = useState<string | null>(
    null,
  );
  const [creatingThreadFor, setCreatingThreadFor] = useState<string | null>(
    null,
  );

  // Активный проект автоматически раскрывается, чтобы пользователь видел
  // его ветки. Не сбрасываем, если пользователь сам раскрыл другой.
  useEffect(() => {
    if (activeProjectId && expandedProjectId === null) {
      setExpandedProjectId(activeProjectId);
    }
  }, [activeProjectId, expandedProjectId]);

  // ── Light tokens (фиксированно) ───────────────────────────────
  // Sidebar и create-modal всегда светлые. useColorModeValue убран
  // сознательно — system dark mode не должен превращать sidebar
  // в navy-админку.
  const headerColor = '#9ca3af';
  const sectionTitleColor = '#111827';
  const itemBg = 'transparent';
  const itemHoverBg = 'rgba(15,23,42,0.04)';
  const activeBg = 'rgba(0,113,227,0.08)';
  const activeBorder = 'rgba(0,113,227,0.30)';
  const titleColor = '#111827';
  const hintColor = '#6b7280';
  const modalSurface = '#ffffff';
  const modalBorder = 'rgba(15,23,42,0.08)';
  const modalText = '#111827';
  const modalMuted = '#6b7280';
  const inputBg = '#f7f8fb';
  const inputBorder = 'rgba(15,23,42,0.08)';

  const loadProjects = useCallback(async () => {
    setIsLoading(true);
    try {
      const list = await projectsService.list();
      setProjects(list);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAnonymous) {
      setProjects([]);
      return;
    }
    loadProjects();
  }, [isAnonymous, loadProjects]);

  const handleOpenProject = (id: string) => {
    setSideBarOpen?.(false);
    router.push(`/chat?projectId=${encodeURIComponent(id)}`);
  };

  const loadThreadsFor = useCallback(async (projectId: string) => {
    setThreadsLoadingFor(projectId);
    try {
      const list = await projectsService.listThreads(projectId);
      setThreadsByProject((prev) => ({ ...prev, [projectId]: list }));
    } finally {
      setThreadsLoadingFor((curr) => (curr === projectId ? null : curr));
    }
  }, []);

  const handleToggleExpand = useCallback(
    (projectId: string) => {
      setExpandedProjectId((prev) => {
        const next = prev === projectId ? null : projectId;
        // Fetch threads lazy при первом раскрытии.
        if (next && !threadsByProject[projectId]) {
          void loadThreadsFor(projectId);
        }
        return next;
      });
    },
    [threadsByProject, loadThreadsFor],
  );

  const handleCreateThread = useCallback(
    async (projectId: string) => {
      setCreatingThreadFor(projectId);
      try {
        const existing = threadsByProject[projectId] || [];
        // Дефолтный набор тредов под JTBD — пользователь дальше переименует
        // через детали. На MVP создаём «Новая ветка N».
        const title = `Новая ветка ${existing.length + 1}`;
        const thread = await projectsService.createThread(projectId, {
          title,
        });
        if (!thread) throw new Error('create thread failed');
        setThreadsByProject((prev) => ({
          ...prev,
          [projectId]: [...(prev[projectId] || []), thread],
        }));
        toast({
          title: 'Ветка создана',
          description: thread.title,
          status: 'success',
          duration: 2200,
          isClosable: true,
        });
        setSideBarOpen?.(false);
        router.push(
          `/chat?projectId=${encodeURIComponent(projectId)}&threadId=${encodeURIComponent(thread._id)}`,
        );
      } catch (e) {
        console.error(e);
        toast({
          title: 'Не удалось создать ветку',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setCreatingThreadFor(null);
      }
    },
    [threadsByProject, toast, setSideBarOpen, router],
  );

  const handleOpenThread = (projectId: string, threadId: string) => {
    setSideBarOpen?.(false);
    router.push(
      `/chat?projectId=${encodeURIComponent(projectId)}&threadId=${encodeURIComponent(threadId)}`,
    );
  };

  const handleCreate = async () => {
    const text = rawText.trim();
    if (!text) {
      toast({
        title: 'Опишите проект',
        description: 'Хотя бы одной фразой — что вы хотите сделать.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    setIsCreating(true);
    try {
      const project = await projectsService.create(text);
      if (!project) throw new Error('create failed');
      setProjects((prev) => [project, ...prev]);
      setOpen(false);
      setRawText('');
      toast({
        title: 'Проект создан',
        description: project.title,
        status: 'success',
        duration: 2500,
        isClosable: true,
      });
      handleOpenProject(project._id);
    } catch (e) {
      console.error(e);
      toast({
        title: 'Не удалось создать проект',
        description: 'Попробуйте ещё раз.',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setIsCreating(false);
    }
  };

  const isOnChat = pathname === '/chat';

  // Apple-like consumer sidebar — показываем максимум 5 «недавних»
  // проектов. Остальное скрыто за «Показать все». Это убирает ощущение
  // админ-списка и оставляет внимание на главных проектах.
  const PROJECTS_PREVIEW_LIMIT = 5;
  const [showAllProjects, setShowAllProjects] = useState(false);
  const visibleProjects = useMemo(
    () =>
      showAllProjects
        ? projects.slice(0, 50)
        : projects.slice(0, PROJECTS_PREVIEW_LIMIT),
    [projects, showAllProjects],
  );
  const hiddenProjectsCount = Math.max(
    0,
    projects.length - PROJECTS_PREVIEW_LIMIT,
  );

  // Статус-строка под названием проекта. Apple-like: одна строка,
  // line-clamp 1, без визуального шума.
  const buildStatusFor = (p: IProjectUI): string => {
    const bp = p.blueprint;
    if (bp?.domain) {
      const domain =
        RU_DOMAIN_LABELS_UI[bp.domain as keyof typeof RU_DOMAIN_LABELS_UI] ||
        'Проект';
      if (bp.primaryDocumentTitle) {
        return `${domain} · ${bp.primaryDocumentTitle.toLowerCase()}`;
      }
      const mech = bp.mechanics || [];
      if (mech.includes('metric_tracking') || mech.includes('progress_tracking')) {
        return `${domain} · трекер`;
      }
      if (mech.includes('file_required')) return `${domain} · материалы`;
      if (mech.includes('web_research_required')) return `${domain} · исследование`;
      if (p.nextStep) return `${domain} · следующий шаг`;
      return `${domain} · рабочая комната`;
    }
    if (p.nextStep) return 'Следующий шаг';
    const memCount = Array.isArray(p.memoryItems) ? p.memoryItems.length : 0;
    if (memCount > 0) return `${memCount} заметок`;
    return 'Добавьте материалы';
  };

  if (isAnonymous) {
    // Тихо скрываем секцию для гостей — UI всё равно ничего не покажет.
    return null;
  }

  return (
    <Box mt="2px" mb="8px" px="17px" width="100%" maxW="100%" minW={0}>
      <Flex
        align="center"
        justify="space-between"
        mb="8px"
        minW={0}
        gap="6px"
      >
        <Text
          fontFamily={FONT_APPLE_TEXT}
          fontSize="11px"
          fontWeight="700"
          letterSpacing="0.6px"
          textTransform="uppercase"
          color={headerColor}
          noOfLines={1}
        >
          Проекты
        </Text>
        <IconButton
          aria-label="Новый проект"
          size="xs"
          variant="ghost"
          icon={<Icon as={MdAdd} w="14px" h="14px" />}
          color={ACCENT_BLUE}
          h="24px"
          minW="24px"
          borderRadius="9999px"
          onClick={() => setOpen(true)}
          _hover={{ bg: itemHoverBg }}
        />
      </Flex>

      {isLoading && projects.length === 0 ? (
        <Flex align="center" gap="8px" px="4px" py="4px">
          <Spinner size="xs" color={ACCENT_BLUE} />
          <Text fontSize="11px" color={hintColor}>
            Загружаю проекты…
          </Text>
        </Flex>
      ) : projects.length === 0 ? (
        <Box
          px="2px"
          py="6px"
          fontFamily={FONT_APPLE_TEXT}
          fontSize="12px"
          color={hintColor}
          lineHeight="1.45"
        >
          Проекты помогают ИИСеть помнить контекст задачи. Создайте первый —
          и ИИ предложит следующий шаг.
        </Box>
      ) : (
        <Flex direction="column" gap="2px" minW={0}>
          {visibleProjects.map((p) => {
            const isActive = p._id === activeProjectId && isOnChat;
            const isExpanded = expandedProjectId === p._id;
            const threads = threadsByProject[p._id] || [];
            const isLoadingThreads = threadsLoadingFor === p._id;
            const isCreatingThreadHere = creatingThreadFor === p._id;
            return (
              <Box key={p._id} minW={0} maxW="100%">
                {/* ── Project row ─────────────────────────────────── */}
                <Flex
                  align="center"
                  gap="2px"
                  borderRadius="10px"
                  bg={isActive ? activeBg : itemBg}
                  border="1px solid"
                  borderColor={isActive ? activeBorder : 'transparent'}
                  _hover={{ bg: isActive ? activeBg : itemHoverBg }}
                  transition="background 0.14s ease, border-color 0.14s ease"
                  minW={0}
                  overflow="hidden"
                >
                  {/* Chevron toggle — отдельный hit-target, не открывает проект */}
                  <Flex
                    as="button"
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleExpand(p._id);
                    }}
                    aria-label={isExpanded ? 'Свернуть' : 'Раскрыть ветки'}
                    align="center"
                    justify="center"
                    boxSize="24px"
                    ml="4px"
                    borderRadius="6px"
                    bg="transparent"
                    color={hintColor}
                    _hover={{ bg: 'rgba(0,0,0,0.05)', color: ACCENT_BLUE }}
                    cursor="pointer"
                    flexShrink={0}
                    sx={{ WebkitTapHighlightColor: 'transparent' }}
                  >
                    <Icon
                      as={isExpanded ? MdKeyboardArrowDown : MdChevronRight}
                      boxSize="14px"
                    />
                  </Flex>
                  {/* Project title — клик открывает Project Home */}
                  <Box
                    as="button"
                    type="button"
                    onClick={() => handleOpenProject(p._id)}
                    textAlign="left"
                    flex="1 1 0"
                    minW={0}
                    py="6px"
                    pr="8px"
                    bg="transparent"
                    cursor="pointer"
                    sx={{ WebkitTapHighlightColor: 'transparent' }}
                  >
                    <Text
                      fontFamily={FONT_APPLE_TEXT}
                      fontSize="13px"
                      fontWeight={isActive ? 600 : 500}
                      color={titleColor}
                      letterSpacing="-0.15px"
                      noOfLines={1}
                      wordBreak="break-word"
                    >
                      {p.title || 'Без названия'}
                    </Text>
                    {!isExpanded && (
                      <Text
                        mt="2px"
                        fontFamily={FONT_APPLE_TEXT}
                        fontSize="11px"
                        color={isActive ? ACCENT_BLUE : hintColor}
                        opacity={isActive ? 0.9 : 1}
                        noOfLines={1}
                        wordBreak="break-word"
                        lineHeight="1.35"
                      >
                        {buildStatusFor(p)}
                      </Text>
                    )}
                  </Box>
                </Flex>

                {/* ── Threads sub-list ───────────────────────────── */}
                {isExpanded && (
                  <Flex
                    direction="column"
                    gap="1px"
                    mt="2px"
                    ml="22px"
                    pl="6px"
                    minW={0}
                  >
                    {isLoadingThreads && threads.length === 0 ? (
                      <Flex align="center" gap="6px" py="4px" px="4px">
                        <Spinner size="xs" color={ACCENT_BLUE} />
                        <Text fontSize="11px" color={hintColor}>
                          Загружаю ветки…
                        </Text>
                      </Flex>
                    ) : threads.length === 0 ? (
                      <Text
                        fontSize="11px"
                        color={hintColor}
                        px="4px"
                        py="4px"
                        lineHeight="1.35"
                      >
                        Веток пока нет. Они помогают разделить
                        исследование, план и риски.
                      </Text>
                    ) : (
                      threads.map((t) => {
                        const tActive =
                          activeThreadId === t._id &&
                          activeProjectId === p._id;
                        return (
                          <Box
                            key={t._id}
                            as="button"
                            type="button"
                            onClick={() => handleOpenThread(p._id, t._id)}
                            textAlign="left"
                            px="8px"
                            py="5px"
                            borderRadius="7px"
                            bg={tActive ? activeBg : 'transparent'}
                            _hover={{
                              bg: tActive ? activeBg : itemHoverBg,
                            }}
                            color={titleColor}
                            cursor="pointer"
                            sx={{ WebkitTapHighlightColor: 'transparent' }}
                            minW={0}
                          >
                            <Text
                              fontFamily={FONT_APPLE_TEXT}
                              fontSize="12px"
                              fontWeight={tActive ? 600 : 500}
                              color={tActive ? ACCENT_BLUE : titleColor}
                              noOfLines={1}
                              letterSpacing="-0.1px"
                            >
                              {t.title}
                            </Text>
                          </Box>
                        );
                      })
                    )}
                    {/* + Ветка */}
                    <Box
                      as="button"
                      type="button"
                      onClick={() => handleCreateThread(p._id)}
                      disabled={isCreatingThreadHere}
                      mt="2px"
                      px="8px"
                      py="5px"
                      borderRadius="7px"
                      bg="transparent"
                      color={ACCENT_BLUE}
                      cursor={isCreatingThreadHere ? 'wait' : 'pointer'}
                      _hover={{ bg: itemHoverBg }}
                      textAlign="left"
                      opacity={isCreatingThreadHere ? 0.6 : 1}
                      sx={{ WebkitTapHighlightColor: 'transparent' }}
                    >
                      <Flex align="center" gap="6px">
                        {isCreatingThreadHere ? (
                          <Spinner size="xs" />
                        ) : (
                          <Icon as={MdAdd} boxSize="12px" />
                        )}
                        <Text
                          fontFamily={FONT_APPLE_TEXT}
                          fontSize="12px"
                          fontWeight="500"
                        >
                          Новая ветка
                        </Text>
                      </Flex>
                    </Box>
                  </Flex>
                )}
              </Box>
            );
          })}

          {/* «+N ещё» / «Свернуть» — без отдельной /projects страницы;
              просто раскрываем список в самой шторке. */}
          {hiddenProjectsCount > 0 && (
            <Box
              as="button"
              type="button"
              onClick={() => setShowAllProjects((v) => !v)}
              mt="4px"
              px="10px"
              py="6px"
              borderRadius="8px"
              bg="transparent"
              color={ACCENT_BLUE}
              _hover={{ bg: itemHoverBg }}
              textAlign="left"
              cursor="pointer"
              sx={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <Text
                fontFamily={FONT_APPLE_TEXT}
                fontSize="12px"
                fontWeight="500"
                letterSpacing="-0.1px"
              >
                {showAllProjects
                  ? 'Свернуть'
                  : `Показать все · +${hiddenProjectsCount}`}
              </Text>
            </Box>
          )}
        </Flex>
      )}

      {/* ── Create modal ────────────────────────────────────────────
          Chakra Modal через свой Portal монтируется в document.body.
          portalProps.appendToParentPortal=false гарантирует, что Modal
          НЕ вкладывается ни в какой родительский Chakra Portal (например,
          sidebar Drawer на mobile) и всегда живёт на body-уровне.

          z-index НЕ переопределяем: Chakra-дефолт `modal = 1400` уже
          выше всего в проекте (navbar=1000, sticky composer=20, sidebar
          auto). Раньше мы поднимали overlay до 20000 — это побеждало
          dialog-wrapper (тоже 1400) и контент исчезал «под» оверлеем.

          ModalContent — солидная поверхность без backdrop-blur: blur на
          translucent surface давал «blur есть, окна нет», если overlay
          оказывался поверх. */}
      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        isCentered
        size={{ base: 'full', md: 'lg' } as any}
        motionPreset="slideInBottom"
        autoFocus
        closeOnOverlayClick
        closeOnEsc
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
            maxW={{ base: 'calc(100vw - 32px)', md: '640px' }}
            maxH={{
              base: 'calc(100dvh - 32px)',
              md: 'calc(100dvh - 80px)',
            }}
            borderRadius={{ base: '22px', md: '24px' }}
            border="1px solid"
            borderColor={modalBorder}
            bg={modalSurface}
            boxShadow="0 1px 2px rgba(15,23,42,0.04), 0 32px 64px -16px rgba(15,23,42,0.30)"
            overflow="hidden"
            display="flex"
            flexDirection="column"
          >
            <ModalHeader
              px={{ base: '18px', md: '24px' }}
              pt={{ base: '18px', md: '22px' }}
              pb={{ base: '6px', md: '8px' }}
              fontFamily={FONT_APPLE_DISPLAY}
              fontSize={{ base: '18px', md: '22px' }}
              fontWeight="600"
              letterSpacing="-0.35px"
              color={modalText}
            >
              Что хотите довести до результата?
            </ModalHeader>
            <ModalCloseButton
              top={{ base: '12px', md: '16px' }}
              right={{ base: '12px', md: '16px' }}
              borderRadius="9999px"
            />
            <ModalBody
              px={{ base: '18px', md: '24px' }}
              pt="0"
              pb={{ base: '6px', md: '6px' }}
              overflowY="auto"
              minW={0}
            >
              <Text
                fontFamily={FONT_APPLE_TEXT}
                fontSize="13px"
                color={modalMuted}
                lineHeight="1.45"
                mb="16px"
              >
                ИИСеть определит тип цели, соберёт первые шаги, создаст
                анкеты, документы и трекер, если они нужны.
              </Text>

              <Text
                fontFamily={FONT_APPLE_TEXT}
                fontSize="12px"
                fontWeight="600"
                color={modalMuted}
                mb="6px"
                letterSpacing="0.2px"
              >
                Цель одной фразой
              </Text>
              <Textarea
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="Например: открыть свой бизнес, написать курсовую, похудеть к лету"
                rows={4}
                minH="120px"
                bg={inputBg}
                border="1px solid"
                borderColor={inputBorder}
                borderRadius="14px"
                fontFamily={FONT_APPLE_TEXT}
                fontSize="14px"
                color={modalText}
                _focus={{
                  borderColor: ACCENT_BLUE,
                  boxShadow: '0 0 0 3px rgba(0,102,204,0.15)',
                }}
              />

              <Text
                mt="14px"
                mb="8px"
                fontFamily={FONT_APPLE_TEXT}
                fontSize="11px"
                fontWeight="600"
                letterSpacing="0.4px"
                textTransform="uppercase"
                color={modalMuted}
              >
                Быстрые примеры
              </Text>
              <Flex gap="6px" flexWrap="wrap" minW={0}>
                {PROJECT_EXAMPLES.map((ex) => (
                  <Box
                    key={ex}
                    as="button"
                    type="button"
                    onClick={() => setRawText(ex)}
                    px="12px"
                    py="6px"
                    borderRadius="9999px"
                    border="1px solid"
                    borderColor={modalBorder}
                    bg="transparent"
                    color={modalText}
                    fontFamily={FONT_APPLE_TEXT}
                    fontSize="12px"
                    fontWeight="500"
                    _hover={{
                      borderColor: ACCENT_BLUE,
                      bg: 'rgba(0,102,204,0.06)',
                      color: ACCENT_BLUE,
                    }}
                    cursor="pointer"
                    sx={{ WebkitTapHighlightColor: 'transparent' }}
                    maxW="100%"
                    whiteSpace="normal"
                    textAlign="left"
                    lineHeight="1.3"
                  >
                    {ex}
                  </Box>
                ))}
              </Flex>

              <Text
                mt="16px"
                fontFamily={FONT_APPLE_TEXT}
                fontSize="11px"
                color={modalMuted}
                lineHeight="1.5"
              >
                Проект появится в левой шторке. В чате ИИСеть будет
                учитывать цель, решения и следующий шаг.
              </Text>
            </ModalBody>
            <ModalFooter
              px={{ base: '18px', md: '24px' }}
              pt="14px"
              pb={{ base: 'calc(18px + env(safe-area-inset-bottom))', md: '22px' }}
              gap="8px"
              flexWrap="wrap"
              borderTop="1px solid"
              borderColor={modalBorder}
              bg="transparent"
            >
              <Button
                onClick={() => setOpen(false)}
                bg="transparent"
                color={modalText}
                border="1px solid"
                borderColor={modalBorder}
                borderRadius="9999px"
                h="40px"
                px="18px"
                fontWeight="500"
                fontSize="13px"
                _hover={{ bg: 'rgba(0,0,0,0.04)' }}
              >
                Отмена
              </Button>
              <Button
                onClick={handleCreate}
                isLoading={isCreating}
                bg={ACCENT_BLUE}
                color="white"
                borderRadius="9999px"
                h="40px"
                px="20px"
                fontWeight="600"
                fontSize="13px"
                _hover={{ bg: ACCENT_BLUE_HOVER }}
                leftIcon={<Icon as={MdAutoAwesome} />}
              >
                Создать рабочую комнату
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
    </Box>
  );
}

export default ProjectSidebarSection;
