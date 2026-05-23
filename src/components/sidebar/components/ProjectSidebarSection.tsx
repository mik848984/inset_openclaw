'use client';

import {
  Box,
  Button,
  Flex,
  Icon,
  IconButton,
  Input,
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
import { MdAdd, MdAutoAwesome, MdClose } from 'react-icons/md';
import {
  projectsService,
  IProjectUI,
} from '@/services/ui/ProjectsService';
import { ModalContext } from '@/contexts/ModalContext';
import Modal from '@/components/modals/Modal/Modal';
import { useUser } from '@/utils/hooks/useUser';

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
  const modalSurface = useColorModeValue(
    'rgba(255,255,255,0.88)',
    'rgba(13,18,34,0.72)',
  );
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
                    noOfLines={1}
                    wordBreak="break-word"
                  >
                    → {p.nextStep}
                  </Text>
                )}
              </Box>
            );
          })}
        </Flex>
      )}

      {/* ── Create modal ─────────────────────────────────────────── */}
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        headerProps={
          <Flex
            justify="space-between"
            align="center"
            px={{ base: '18px', md: '24px' }}
            py={{ base: '14px', md: '18px' }}
            gap="12px"
            minW={0}
          >
            <Box minW={0}>
              <Text
                fontFamily={FONT_APPLE_DISPLAY}
                fontSize={{ base: '18px', md: '22px' }}
                fontWeight="600"
                letterSpacing="-0.35px"
                color={modalText}
                noOfLines={1}
              >
                Новый проект
              </Text>
              <Text
                mt="2px"
                fontFamily={FONT_APPLE_TEXT}
                fontSize="13px"
                color={modalMuted}
                lineHeight="1.4"
              >
                ИИСеть запомнит цель и подскажет, что делать дальше.
              </Text>
            </Box>
            <IconButton
              aria-label="Закрыть"
              size="sm"
              variant="ghost"
              icon={<Icon as={MdClose} />}
              borderRadius="9999px"
              onClick={() => setOpen(false)}
            />
          </Flex>
        }
        contentProps={
          <Box
            px={{ base: '18px', md: '24px' }}
            pb={{ base: '20px', md: '24px' }}
            pt="6px"
            bg={modalSurface}
            sx={{ backdropFilter: 'blur(22px) saturate(180%)' }}
            minW={0}
          >
            <Text
              fontFamily={FONT_APPLE_TEXT}
              fontSize="12px"
              fontWeight="600"
              color={modalMuted}
              mb="8px"
            >
              Что хотите сделать?
            </Text>
            <Textarea
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="Например: развить сайт ИИСеть до 100 тысяч рублей в месяц"
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
            <Flex gap="8px" mt="14px" justify="flex-end" flexWrap="wrap">
              <Button
                onClick={() => setOpen(false)}
                bg="transparent"
                color={modalText}
                border="1px solid"
                borderColor={modalBorder}
                borderRadius="9999px"
                h="38px"
                px="16px"
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
                h="38px"
                px="18px"
                fontWeight="600"
                fontSize="13px"
                _hover={{ bg: ACCENT_BLUE_HOVER }}
                leftIcon={<Icon as={MdAutoAwesome} />}
              >
                Создать проект
              </Button>
            </Flex>
            <Text
              mt="10px"
              fontFamily={FONT_APPLE_TEXT}
              fontSize="11px"
              color={modalMuted}
              lineHeight="1.5"
            >
              ИИСеть сформулирует цель, инструкции и предложит первый шаг.
              Память проекта пополнится по мере работы.
            </Text>
          </Box>
        }
      />
    </Box>
  );
}

export default ProjectSidebarSection;
