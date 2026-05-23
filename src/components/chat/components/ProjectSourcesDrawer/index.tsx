'use client';

import {
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  Icon,
  IconButton,
  Input,
  Spinner,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Tag,
  Text,
  Textarea,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  MdAdd,
  MdAutoAwesome,
  MdCheck,
  MdClose,
  MdDelete,
  MdFolderOpen,
  MdInsertDriveFile,
  MdLink,
  MdNoteAdd,
  MdOpenInNew,
  MdReplay,
  MdSearch,
  MdTravelExplore,
  MdWarningAmber,
} from 'react-icons/md';
import {
  projectsService,
  IProjectSourceUI,
  IDiscoveredSource,
  ProjectArtifactKind,
} from '@/services/ui/ProjectsService';

const FONT_APPLE_TEXT = `'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif`;
const FONT_APPLE_DISPLAY = `'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif`;

const ACCENT_BLUE = '#0066cc';
const ACCENT_BLUE_HOVER = '#0071e3';

interface Props {
  projectId: string;
  open: boolean;
  onClose: () => void;
}

const STATUS_LABEL: Record<IProjectSourceUI['status'], string> = {
  uploaded: 'Загружен',
  processing: 'Обработка…',
  ready: 'Готов к поиску',
  error: 'Ошибка',
  unsupported: 'Формат пока не индексируется',
};

const STATUS_COLOR: Record<IProjectSourceUI['status'], string> = {
  uploaded: 'gray',
  processing: 'blue',
  ready: 'green',
  error: 'red',
  unsupported: 'orange',
};

const ARTIFACT_BUTTONS: { id: ProjectArtifactKind; label: string }[] = [
  { id: 'brief', label: 'Обзор проекта' },
  { id: 'plan', label: 'План действий' },
  { id: 'risks', label: 'Риски' },
  { id: 'faq', label: 'FAQ' },
  { id: 'comparison', label: 'Сравнение источников' },
  { id: 'mindmap', label: 'Карта проекта' },
];

/**
 * NotebookLM-like Sources Drawer для проекта.
 * Используется поверх /chat?projectId=... — открывается из ProjectChatBanner.
 */
function ProjectSourcesDrawer({ projectId, open, onClose }: Props) {
  const toast = useToast();
  const [sources, setSources] = useState<IProjectSourceUI[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [noteTitle, setNoteTitle] = useState('');
  const [noteText, setNoteText] = useState('');
  const [discoverQuery, setDiscoverQuery] = useState('');
  const [discovered, setDiscovered] = useState<IDiscoveredSource[]>([]);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [generatingArtifact, setGeneratingArtifact] = useState<
    ProjectArtifactKind | null
  >(null);
  const [lastArtifact, setLastArtifact] = useState<{
    title: string;
    content: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Solid Apple-like sheet surface — без translucent + backdrop-blur на
  // самом контенте, чтобы Drawer всегда был чётко виден, даже если
  // overlay по какой-то причине отрисовался поверх (раньше выходил
  // эффект «blur есть, шторки нет»).
  const surfaceBg = useColorModeValue('#ffffff', '#15171c');
  const cardBg = useColorModeValue(
    'rgba(255,255,255,0.66)',
    'rgba(15,18,32,0.58)',
  );
  const cardBorder = useColorModeValue(
    'rgba(0,0,0,0.07)',
    'rgba(255,255,255,0.10)',
  );
  const cardBorderActive = useColorModeValue(
    'rgba(0,102,204,0.32)',
    'rgba(41,151,255,0.36)',
  );
  const textPrimary = useColorModeValue('#1d1d1f', '#f5f5f7');
  const textSecondary = useColorModeValue(
    '#6e6e73',
    'rgba(245,245,247,0.65)',
  );
  const inputBg = useColorModeValue(
    'rgba(255,255,255,0.92)',
    'rgba(13,18,34,0.62)',
  );

  const refresh = useCallback(async () => {
    if (!projectId) return;
    setIsLoading(true);
    try {
      const list = await projectsService.listSources(projectId);
      setSources(list);
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (open) refresh();
  }, [open, refresh]);

  const handleUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const created = await projectsService.uploadSourceFile(projectId, file);
      if (!created) throw new Error('upload failed');
      toast({
        title: 'Файл загружен',
        description:
          created.status === 'ready'
            ? `Готов к поиску · ${created.chunksCount} фрагментов`
            : created.status === 'unsupported'
              ? 'Формат пока не индексируется'
              : 'Источник добавлен',
        status:
          created.status === 'ready'
            ? 'success'
            : created.status === 'unsupported'
              ? 'warning'
              : 'info',
        duration: 3500,
        isClosable: true,
      });
      await refresh();
    } catch (e) {
      toast({
        title: 'Не удалось загрузить файл',
        status: 'error',
        duration: 3500,
        isClosable: true,
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddLink = async () => {
    const url = linkUrl.trim();
    if (!/^https?:\/\//i.test(url)) {
      toast({
        title: 'Нужна валидная https-ссылка',
        status: 'warning',
        duration: 2500,
        isClosable: true,
      });
      return;
    }
    setBusyId('__link__');
    try {
      const created = await projectsService.addSourceLink(projectId, url);
      if (!created) throw new Error('failed');
      toast({
        title: 'Ссылка добавлена',
        description:
          created.status === 'ready'
            ? `Готов к поиску · ${created.chunksCount} фрагментов`
            : 'Источник добавлен',
        status: created.status === 'ready' ? 'success' : 'info',
        duration: 3000,
        isClosable: true,
      });
      setLinkUrl('');
      await refresh();
    } catch (e) {
      toast({
        title: 'Не удалось добавить ссылку',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setBusyId(null);
    }
  };

  const handleAddNote = async () => {
    if (noteText.trim().length < 5) {
      toast({
        title: 'Слишком короткая заметка',
        status: 'warning',
        duration: 2500,
        isClosable: true,
      });
      return;
    }
    setBusyId('__note__');
    try {
      const created = await projectsService.addSourceNote(
        projectId,
        noteText.trim(),
        noteTitle.trim() || undefined,
      );
      if (!created) throw new Error('failed');
      toast({
        title: 'Заметка добавлена',
        status: 'success',
        duration: 2500,
        isClosable: true,
      });
      setNoteText('');
      setNoteTitle('');
      await refresh();
    } catch (e) {
      toast({
        title: 'Не удалось добавить заметку',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (id: string) => {
    setBusyId(id);
    try {
      const ok = await projectsService.deleteSource(projectId, id);
      if (!ok) throw new Error('delete failed');
      await refresh();
    } catch {
      toast({
        title: 'Не удалось удалить',
        status: 'error',
        duration: 2500,
        isClosable: true,
      });
    } finally {
      setBusyId(null);
    }
  };

  const handleReprocess = async (id: string) => {
    setBusyId(id);
    try {
      const updated = await projectsService.reprocessSource(projectId, id);
      if (!updated) throw new Error('reprocess failed');
      toast({
        title: 'Источник переобработан',
        status: 'success',
        duration: 2500,
        isClosable: true,
      });
      await refresh();
    } catch {
      toast({
        title: 'Не удалось переобработать',
        status: 'error',
        duration: 2500,
        isClosable: true,
      });
    } finally {
      setBusyId(null);
    }
  };

  const handleDiscover = async () => {
    setIsDiscovering(true);
    try {
      const { recommended } = await projectsService.discoverSources(
        projectId,
        discoverQuery.trim() || undefined,
      );
      setDiscovered(recommended);
      if (recommended.length === 0) {
        toast({
          title: 'Не нашли подходящих источников',
          status: 'info',
          duration: 2500,
          isClosable: true,
        });
      }
    } catch {
      toast({
        title: 'Не удалось получить рекомендации',
        status: 'error',
        duration: 2500,
        isClosable: true,
      });
    } finally {
      setIsDiscovering(false);
    }
  };

  const addDiscovered = async (url: string) => {
    setBusyId(url);
    try {
      const created = await projectsService.addSourceLink(projectId, url);
      if (!created) throw new Error('failed');
      await refresh();
    } catch {
      toast({
        title: 'Не удалось добавить ссылку',
        status: 'error',
        duration: 2500,
        isClosable: true,
      });
    } finally {
      setBusyId(null);
    }
  };

  const createArtifact = async (type: ProjectArtifactKind) => {
    setGeneratingArtifact(type);
    setLastArtifact(null);
    try {
      const a = await projectsService.createArtifact(projectId, type);
      if (!a) throw new Error('failed');
      setLastArtifact({ title: a.title, content: a.content });
    } catch {
      toast({
        title: 'Не удалось сгенерировать',
        status: 'error',
        duration: 2500,
        isClosable: true,
      });
    } finally {
      setGeneratingArtifact(null);
    }
  };

  const readyCount = sources.filter((s) => s.status === 'ready').length;
  const processingCount = sources.filter(
    (s) => s.status === 'processing',
  ).length;

  const renderSourceCard = (s: IProjectSourceUI) => {
    const isBusy = busyId === s._id;
    const tag = STATUS_LABEL[s.status];
    const color = STATUS_COLOR[s.status];
    const icon =
      s.type === 'file'
        ? MdInsertDriveFile
        : s.type === 'link'
          ? MdLink
          : MdNoteAdd;
    return (
      <Box
        key={s._id}
        p={{ base: '12px', md: '14px' }}
        borderRadius="14px"
        bg={cardBg}
        border="1px solid"
        borderColor={s.status === 'ready' ? cardBorderActive : cardBorder}
        minW={0}
      >
        <Flex justify="space-between" align="flex-start" gap="10px" minW={0}>
          <Box minW={0} flex="1 1 0">
            <Flex align="center" gap="6px" mb="4px" flexWrap="wrap">
              <Icon as={icon} w="13px" h="13px" color={textSecondary} />
              <Tag
                size="sm"
                colorScheme={color as any}
                borderRadius="9999px"
                fontSize="10px"
              >
                {tag}
              </Tag>
              {s.chunksCount > 0 && (
                <Text fontSize="11px" color={textSecondary}>
                  · {s.chunksCount} фрагм.
                </Text>
              )}
            </Flex>
            <Text
              fontFamily={FONT_APPLE_DISPLAY}
              fontSize="14px"
              fontWeight="600"
              color={textPrimary}
              noOfLines={2}
              wordBreak="break-word"
            >
              {s.title}
            </Text>
            {s.url && (
              <Text
                mt="2px"
                fontSize="11px"
                color={textSecondary}
                noOfLines={1}
                wordBreak="break-all"
              >
                {s.url}
              </Text>
            )}
            {s.errorMessage && (
              <Flex
                mt="6px"
                align="flex-start"
                gap="6px"
                color="#b25f00"
                minW={0}
              >
                <Icon as={MdWarningAmber} w="13px" h="13px" mt="2px" />
                <Text fontSize="11px" lineHeight="1.4" wordBreak="break-word">
                  {s.errorMessage}
                </Text>
              </Flex>
            )}
          </Box>
          <Flex direction="column" gap="6px" flexShrink={0}>
            {s.url && (
              <IconButton
                as="a"
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Открыть"
                size="xs"
                variant="ghost"
                icon={<Icon as={MdOpenInNew} />}
              />
            )}
            <IconButton
              aria-label="Переобработать"
              size="xs"
              variant="ghost"
              icon={<Icon as={MdReplay} />}
              onClick={() => handleReprocess(s._id)}
              isLoading={isBusy}
            />
            <IconButton
              aria-label="Удалить"
              size="xs"
              variant="ghost"
              color="#c4341e"
              icon={<Icon as={MdDelete} />}
              onClick={() => handleDelete(s._id)}
              isLoading={isBusy}
            />
          </Flex>
        </Flex>
      </Box>
    );
  };

  const filterBy = (type: IProjectSourceUI['type']) =>
    sources.filter((s) => s.type === type);

  return (
    // ── Sources drawer ─────────────────────────────────────────────
    // Chakra Drawer сам портится в document.body через внутренний
    // Portal. portalProps.appendToParentPortal=false гарантирует, что
    // он НЕ вкладывается в родительский Chakra Portal (например в
    // sidebar Drawer на mobile или в navbar Portal из app/layout.tsx).
    //
    // z-index НЕ переопределяем: Chakra-дефолт `modal` (1400) уже выше
    // всего в проекте. Раньше overlay поднимали до 3000, а dialog-
    // wrapper оставался на 1400 — поэтому контент исчезал «под» blur.
    //
    // Solid surface без backdrop-blur на контенте — чтобы шторка
    // всегда была чётко видна и не зависела от того, что за ней.
    <Drawer
      isOpen={open}
      onClose={onClose}
      placement="right"
      size={{ base: 'full', md: 'md' } as any}
      autoFocus={false}
      portalProps={{ appendToParentPortal: false }}
    >
      <DrawerOverlay
        bg="rgba(0,0,0,0.45)"
        sx={{
          backdropFilter: 'blur(8px) saturate(140%)',
          WebkitBackdropFilter: 'blur(8px) saturate(140%)',
        }}
      />
      <DrawerContent
        bg={surfaceBg}
        maxW={{ base: '100vw', md: '560px' }}
        fontFamily={FONT_APPLE_TEXT}
        boxShadow="-1px 0 2px rgba(15,23,42,0.04), -24px 0 60px -8px rgba(15,23,42,0.18)"
      >
          <DrawerCloseButton
            top={{ base: '12px', md: '14px' }}
            right={{ base: '12px', md: '14px' }}
            borderRadius="9999px"
          />
          <DrawerHeader
            fontFamily={FONT_APPLE_DISPLAY}
            fontSize={{ base: '18px', md: '22px' }}
            fontWeight="600"
            letterSpacing="-0.35px"
            color={textPrimary}
            pb="4px"
          >
            Источники проекта
          </DrawerHeader>

          <DrawerBody
            pt="0"
            pb={{ base: '24px', md: '28px' }}
            px={{ base: '14px', md: '20px' }}
            minW={0}
          >
            {/* Summary */}
            <Text fontSize="12px" color={textSecondary} mb="14px">
              {isLoading
                ? 'Загружаю источники…'
                : `Всего ${sources.length} · Готовы ${readyCount}${
                    processingCount > 0 ? ` · В обработке ${processingCount}` : ''
                  }`}
            </Text>

            <Tabs variant="soft-rounded" colorScheme="blue" isLazy>
              <TabList overflowX="auto" gap="6px" mb="14px" minW={0}>
                <Tab fontSize="12px" px="10px" py="6px">
                  Все
                </Tab>
                <Tab fontSize="12px" px="10px" py="6px">
                  Файлы
                </Tab>
                <Tab fontSize="12px" px="10px" py="6px">
                  Ссылки
                </Tab>
                <Tab fontSize="12px" px="10px" py="6px">
                  Заметки
                </Tab>
                <Tab fontSize="12px" px="10px" py="6px">
                  Веб
                </Tab>
                <Tab fontSize="12px" px="10px" py="6px">
                  Создать
                </Tab>
              </TabList>

              <TabPanels>
                {/* ── ALL ─────────────────────────────────────────── */}
                <TabPanel px="0" pt="0" pb="0">
                  {/* Quick actions */}
                  <Flex gap="6px" mb="14px" flexWrap="wrap">
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      isLoading={isUploading}
                      size="sm"
                      bg={ACCENT_BLUE}
                      color="white"
                      borderRadius="9999px"
                      leftIcon={<Icon as={MdFolderOpen} />}
                      fontSize="12px"
                      _hover={{ bg: ACCENT_BLUE_HOVER }}
                    >
                      Загрузить файл
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      hidden
                      accept=".pdf,.docx,.xlsx,.xls,.txt,.md,.markdown,.csv,.tsv,.json,.log"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleUpload(f);
                        e.target.value = '';
                      }}
                    />
                  </Flex>
                  {isLoading && sources.length === 0 ? (
                    <Flex justify="center" py="40px">
                      <Spinner color={ACCENT_BLUE} />
                    </Flex>
                  ) : sources.length === 0 ? (
                    <Text fontSize="13px" color={textSecondary}>
                      Источников пока нет. Загрузите PDF, DOCX, XLSX, TXT, MD,
                      CSV или JSON (до 25 МБ), добавьте ссылку или заметку —
                      ИИСеть учтёт их в ответах.
                    </Text>
                  ) : (
                    <Flex direction="column" gap="8px">
                      {sources.map(renderSourceCard)}
                    </Flex>
                  )}
                </TabPanel>

                {/* ── FILES ───────────────────────────────────── */}
                <TabPanel px="0" pt="0" pb="0">
                  <Flex direction="column" gap="8px">
                    {filterBy('file').length === 0 ? (
                      <Text fontSize="13px" color={textSecondary}>
                        Файлов пока нет. Кнопка «Загрузить файл» на вкладке «Все».
                      </Text>
                    ) : (
                      filterBy('file').map(renderSourceCard)
                    )}
                  </Flex>
                </TabPanel>

                {/* ── LINKS ───────────────────────────────────── */}
                <TabPanel px="0" pt="0" pb="0">
                  <Flex gap="6px" mb="14px" minW={0}>
                    <Input
                      placeholder="https://…"
                      value={linkUrl}
                      onChange={(e) => setLinkUrl(e.target.value)}
                      bg={inputBg}
                      borderRadius="12px"
                      fontSize="13px"
                      flex="1 1 0"
                      minW={0}
                    />
                    <Button
                      onClick={handleAddLink}
                      isLoading={busyId === '__link__'}
                      bg={ACCENT_BLUE}
                      color="white"
                      borderRadius="9999px"
                      px="14px"
                      fontSize="12px"
                      _hover={{ bg: ACCENT_BLUE_HOVER }}
                      flexShrink={0}
                    >
                      Добавить
                    </Button>
                  </Flex>
                  <Flex direction="column" gap="8px">
                    {filterBy('link').length === 0 ? (
                      <Text fontSize="13px" color={textSecondary}>
                        Ссылок пока нет.
                      </Text>
                    ) : (
                      filterBy('link').map(renderSourceCard)
                    )}
                  </Flex>
                </TabPanel>

                {/* ── NOTES ───────────────────────────────────── */}
                <TabPanel px="0" pt="0" pb="0">
                  <Input
                    mb="6px"
                    placeholder="Заголовок заметки (необязательно)"
                    value={noteTitle}
                    onChange={(e) => setNoteTitle(e.target.value)}
                    bg={inputBg}
                    borderRadius="12px"
                    fontSize="13px"
                  />
                  <Textarea
                    placeholder="Текст заметки или важный факт. Можно вставить расшифровку звонка, фрагмент договора или личный план."
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    rows={4}
                    bg={inputBg}
                    borderRadius="12px"
                    fontSize="13px"
                  />
                  <Flex justify="flex-end" mt="8px">
                    <Button
                      onClick={handleAddNote}
                      isLoading={busyId === '__note__'}
                      bg={ACCENT_BLUE}
                      color="white"
                      borderRadius="9999px"
                      px="16px"
                      fontSize="12px"
                      leftIcon={<Icon as={MdNoteAdd} />}
                      _hover={{ bg: ACCENT_BLUE_HOVER }}
                    >
                      Сохранить заметку
                    </Button>
                  </Flex>
                  <Box mt="14px">
                    <Flex direction="column" gap="8px">
                      {filterBy('note').length === 0 ? (
                        <Text fontSize="13px" color={textSecondary}>
                          Заметок пока нет.
                        </Text>
                      ) : (
                        filterBy('note').map(renderSourceCard)
                      )}
                    </Flex>
                  </Box>
                </TabPanel>

                {/* ── DISCOVER (Веб) ──────────────────────────── */}
                <TabPanel px="0" pt="0" pb="0">
                  <Flex gap="6px" mb="14px" minW={0}>
                    <Input
                      placeholder="Что искать (по умолчанию — цель проекта)"
                      value={discoverQuery}
                      onChange={(e) => setDiscoverQuery(e.target.value)}
                      bg={inputBg}
                      borderRadius="12px"
                      fontSize="13px"
                      flex="1 1 0"
                      minW={0}
                    />
                    <Button
                      onClick={handleDiscover}
                      isLoading={isDiscovering}
                      bg={ACCENT_BLUE}
                      color="white"
                      borderRadius="9999px"
                      px="14px"
                      fontSize="12px"
                      leftIcon={<Icon as={MdTravelExplore} />}
                      _hover={{ bg: ACCENT_BLUE_HOVER }}
                      flexShrink={0}
                    >
                      Найти
                    </Button>
                  </Flex>
                  {discovered.length === 0 ? (
                    <Text fontSize="13px" color={textSecondary}>
                      Найдём релевантные страницы и свежие новости по теме
                      проекта. Вы выбираете, какие добавить.
                    </Text>
                  ) : (
                    <Flex direction="column" gap="8px">
                      {discovered.map((d) => (
                        <Box
                          key={d.url}
                          p="12px"
                          borderRadius="14px"
                          bg={cardBg}
                          border="1px solid"
                          borderColor={cardBorder}
                          minW={0}
                        >
                          <Text
                            fontFamily={FONT_APPLE_DISPLAY}
                            fontSize="14px"
                            fontWeight="600"
                            color={textPrimary}
                            noOfLines={2}
                            wordBreak="break-word"
                          >
                            {d.title}
                          </Text>
                          {d.domain && (
                            <Text
                              fontSize="11px"
                              color={textSecondary}
                              noOfLines={1}
                              mt="2px"
                            >
                              {d.domain}
                              {d.date ? ` · ${d.date}` : ''}
                            </Text>
                          )}
                          {d.snippet && (
                            <Text
                              fontSize="12px"
                              color={textSecondary}
                              mt="4px"
                              noOfLines={2}
                              wordBreak="break-word"
                            >
                              {d.snippet}
                            </Text>
                          )}
                          <Flex justify="space-between" mt="8px" gap="8px">
                            <Button
                              as="a"
                              href={d.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              size="xs"
                              variant="ghost"
                              rightIcon={<Icon as={MdOpenInNew} />}
                            >
                              Открыть
                            </Button>
                            <Button
                              onClick={() => addDiscovered(d.url)}
                              isLoading={busyId === d.url}
                              size="xs"
                              bg={ACCENT_BLUE}
                              color="white"
                              borderRadius="9999px"
                              leftIcon={<Icon as={MdAdd} />}
                              _hover={{ bg: ACCENT_BLUE_HOVER }}
                            >
                              В проект
                            </Button>
                          </Flex>
                        </Box>
                      ))}
                    </Flex>
                  )}
                </TabPanel>

                {/* ── CREATE (artifacts) ──────────────────────── */}
                <TabPanel px="0" pt="0" pb="0">
                  <Text fontSize="13px" color={textSecondary} mb="12px">
                    Сгенерируем материал на основе источников проекта.
                  </Text>
                  <Flex gap="6px" flexWrap="wrap" mb="14px">
                    {ARTIFACT_BUTTONS.map((b) => (
                      <Button
                        key={b.id}
                        onClick={() => createArtifact(b.id)}
                        isLoading={generatingArtifact === b.id}
                        size="sm"
                        bg={
                          generatingArtifact === b.id
                            ? ACCENT_BLUE
                            : 'transparent'
                        }
                        color={
                          generatingArtifact === b.id ? 'white' : textPrimary
                        }
                        border="1px solid"
                        borderColor={cardBorder}
                        borderRadius="9999px"
                        fontSize="12px"
                        _hover={{
                          borderColor: ACCENT_BLUE,
                          color: ACCENT_BLUE,
                        }}
                        leftIcon={<Icon as={MdAutoAwesome} />}
                      >
                        {b.label}
                      </Button>
                    ))}
                  </Flex>
                  {lastArtifact && (
                    <Box
                      p="14px"
                      borderRadius="14px"
                      bg={cardBg}
                      border="1px solid"
                      borderColor={cardBorder}
                    >
                      <Text
                        fontFamily={FONT_APPLE_DISPLAY}
                        fontSize="14px"
                        fontWeight="600"
                        color={textPrimary}
                        mb="8px"
                      >
                        {lastArtifact.title}
                      </Text>
                      <Text
                        fontSize="12px"
                        color={textPrimary}
                        whiteSpace="pre-wrap"
                        wordBreak="break-word"
                        lineHeight="1.55"
                      >
                        {lastArtifact.content}
                      </Text>
                    </Box>
                  )}
                </TabPanel>
              </TabPanels>
            </Tabs>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
  );
}

export default ProjectSourcesDrawer;
