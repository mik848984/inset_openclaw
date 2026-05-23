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
  useColorModeValue,
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
import { MdAdd, MdAutoAwesome } from 'react-icons/md';
import {
  projectsService,
  IProjectUI,
} from '@/services/ui/ProjectsService';
import { ModalContext } from '@/contexts/ModalContext';
import { useUser } from '@/utils/hooks/useUser';

const PROJECT_EXAMPLES = [
  'Развить сайт ИИСеть до 100 тыс. ₽/мес',
  'Подготовиться к собеседованию',
  'Запустить небольшой бизнес',
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

  const headerColor = useColorModeValue('gray.500', 'gray.500');
  const sectionTitleColor = useColorModeValue('navy.700', 'white');
  const itemBg = useColorModeValue(
    'rgba(0,0,0,0.00)',
    'rgba(255,255,255,0.00)',
  );
  const itemHoverBg = useColorModeValue(
    'rgba(0,0,0,0.04)',
    'rgba(255,255,255,0.06)',
  );
  const activeBg = useColorModeValue(
    'rgba(0,102,204,0.08)',
    'rgba(41,151,255,0.14)',
  );
  const activeBorder = useColorModeValue(
    'rgba(0,102,204,0.32)',
    'rgba(41,151,255,0.36)',
  );
  const titleColor = useColorModeValue('navy.700', 'white');
  const hintColor = useColorModeValue('gray.500', 'whiteAlpha.700');
  // Solid Apple-like sheet surface. Translucent + backdrop-blur контента
  // приводил к ситуации «blur есть, окна нет», если overlay побеждал по
  // z-index — surface блюрила overlay и сливалась с ним.
  const modalSurface = useColorModeValue('#ffffff', '#1c1c1f');
  const modalBorder = useColorModeValue(
    'rgba(0,0,0,0.08)',
    'rgba(255,255,255,0.10)',
  );
  const modalText = useColorModeValue('#1d1d1f', '#f5f5f7');
  const modalMuted = useColorModeValue(
    '#6e6e73',
    'rgba(245,245,247,0.65)',
  );
  const inputBg = useColorModeValue(
    'rgba(255,255,255,0.92)',
    'rgba(13,18,34,0.62)',
  );
  const inputBorder = useColorModeValue(
    'rgba(0,0,0,0.08)',
    'rgba(255,255,255,0.12)',
  );

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

  const visibleProjects = useMemo(() => projects.slice(0, 12), [projects]);

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
            const memoryCount = Array.isArray(p.memoryItems)
              ? p.memoryItems.length
              : 0;
            return (
              <Box
                key={p._id}
                as="button"
                type="button"
                onClick={() => handleOpenProject(p._id)}
                textAlign="left"
                px="10px"
                py="8px"
                borderRadius="10px"
                bg={isActive ? activeBg : itemBg}
                border="1px solid"
                borderColor={isActive ? activeBorder : 'transparent'}
                _hover={{ bg: isActive ? activeBg : itemHoverBg }}
                transition="background 0.14s ease, border-color 0.14s ease"
                sx={{ WebkitTapHighlightColor: 'transparent' }}
                cursor="pointer"
                minW={0}
                maxW="100%"
                overflow="hidden"
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
                {p.nextStep && (
                  <Text
                    mt="2px"
                    fontFamily={FONT_APPLE_TEXT}
                    fontSize="11px"
                    color={hintColor}
                    noOfLines={2}
                    wordBreak="break-word"
                    lineHeight="1.35"
                  >
                    → {p.nextStep}
                  </Text>
                )}
                {memoryCount > 0 && (
                  <Flex
                    mt="6px"
                    gap="4px"
                    align="center"
                    minW={0}
                    overflow="hidden"
                  >
                    <Box
                      px="6px"
                      py="1px"
                      borderRadius="9999px"
                      bg="rgba(0,102,204,0.10)"
                      color={ACCENT_BLUE}
                    >
                      <Text
                        fontFamily={FONT_APPLE_TEXT}
                        fontSize="10px"
                        fontWeight="600"
                        letterSpacing="0.2px"
                      >
                        {memoryCount}{' '}
                        {memoryCount === 1
                          ? 'заметка'
                          : memoryCount < 5
                            ? 'заметки'
                            : 'заметок'}
                      </Text>
                    </Box>
                  </Flex>
                )}
              </Box>
            );
          })}
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
              Новый проект
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
                Опишите задачу одной фразой — ИИСеть соберёт цель, контекст
                и следующий шаг.
              </Text>

              <Text
                fontFamily={FONT_APPLE_TEXT}
                fontSize="12px"
                fontWeight="600"
                color={modalMuted}
                mb="6px"
                letterSpacing="0.2px"
              >
                Что хотите сделать?
              </Text>
              <Textarea
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="Например: открыть кофейню в Екатеринбурге и понять, окупится ли она"
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
