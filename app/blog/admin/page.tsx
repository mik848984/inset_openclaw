'use client';

import {
  Badge,
  Box,
  Button,
  ButtonGroup,
  Checkbox,
  Container,
  Flex,
  Heading,
  HStack,
  Input,
  SimpleGrid,
  Stack,
  Tag,
  Text,
  Textarea,
  useToast,
  Image,
  Spinner,
  Icon,
  useColorModeValue,
} from '@chakra-ui/react';
import ReactMarkdown from 'react-markdown';
import { useSession } from 'next-auth/react';
import { ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useUser } from '@/utils/hooks/useUser';
import {
  MdAutoAwesome,
  MdContentCopy,
  MdLockOutline,
  MdLogin,
  MdOpenInNew,
  MdSearch,
  MdCheckCircle,
  MdRadioButtonUnchecked,
  MdArrowOutward,
} from 'react-icons/md';

// ── Apple typography ──────────────────────────────────────────────
const FONT_APPLE_TEXT = `'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif`;
const FONT_APPLE_DISPLAY = `'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif`;
const FONT_APPLE_MONO = `'SF Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`;

const ACCENT_BLUE = '#0066cc';
const ACCENT_BLUE_HOVER = '#0071e3';

type BlogPost = {
  slug: string;
  title: string;
  description: string;
  content: string;
  date?: string;
  tags?: string[];
  readingTime?: number;
  author?: string;
  coverImage?: string;
};

type BlogFormState = BlogPost & {
  tagsInput: string;
  readingTimeInput: string;
  isScheduled: boolean;
  scheduledAt: string;
};

type AutoNewsFormState = {
  query: string;
  baseTitle: string;
  appendDateToTitle: boolean;
  location: string;
  gl: string;
  hl: string;
  tbs: 'qdr:d' | 'qdr:w' | 'qdr:m';
  mode: 'now' | 'schedule';
  scheduledAt: string;
  maxNews: string;
  isSubmitting: boolean;
};

const emptyAutoNews: AutoNewsFormState = {
  query: '',
  baseTitle: '',
  appendDateToTitle: true,
  location: 'Russia',
  gl: 'ru',
  hl: 'ru',
  tbs: 'qdr:d',
  mode: 'now',
  scheduledAt: '',
  maxNews: '10',
  isSubmitting: false,
};

const emptyPost: BlogFormState = {
  slug: '',
  title: '',
  description: '',
  content: '',
  tags: [],
  readingTime: undefined,
  date: '',
  author: '',
  coverImage: '',
  tagsInput: '',
  readingTimeInput: '',
  isScheduled: false,
  scheduledAt: '',
};

export default function BlogAdminPage() {
  const { data: session, status } = useSession();
  const { user, loading: userLoading } = useUser(false);
  const toast = useToast();

  const isUserAdmin = !!(user as any)?.isAdmin;
  const isAuthed = status === 'authenticated';
  const isResolvingAuth = status === 'loading' || userLoading;

  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [form, setForm] = useState<BlogFormState>(emptyPost);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isLoadingPost, setIsLoadingPost] = useState(false);
  const [listQuery, setListQuery] = useState('');
  const [autoForm, setAutoForm] = useState<AutoNewsFormState>(emptyAutoNews);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const previewRef = useRef<HTMLDivElement | null>(null);
  const [editorLayout, setEditorLayout] = useState<
    'split' | 'editor' | 'preview'
  >('split');

  // ── Apple glass tokens ─────────────────────────────────────────────
  const pageBg = useColorModeValue('#f5f5f7', 'navy.900');
  const surfaceGlass = useColorModeValue(
    'rgba(255,255,255,0.72)',
    'rgba(13,18,34,0.62)',
  );
  const surfaceGlassSubtle = useColorModeValue(
    'rgba(255,255,255,0.55)',
    'rgba(13,18,34,0.46)',
  );
  const borderSubtle = useColorModeValue(
    'rgba(0,0,0,0.07)',
    'rgba(255,255,255,0.10)',
  );
  const borderActive = useColorModeValue(
    'rgba(0,102,204,0.32)',
    'rgba(41,151,255,0.42)',
  );
  const textPrimary = useColorModeValue('#1d1d1f', '#f5f5f7');
  const textBody = useColorModeValue('#2b2b2f', 'rgba(245,245,247,0.86)');
  const textSecondary = useColorModeValue('#6e6e73', 'rgba(245,245,247,0.62)');
  const inputBg = useColorModeValue(
    'rgba(255,255,255,0.92)',
    'rgba(13,18,34,0.62)',
  );
  const tagBg = useColorModeValue(
    'rgba(0,102,204,0.08)',
    'rgba(41,151,255,0.14)',
  );

  // ── Load posts ─ ONLY for admin ─────────────────────────────────────
  useEffect(() => {
    if (isAuthed && isUserAdmin) {
      void loadPosts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthed, isUserAdmin]);

  async function loadPosts() {
    try {
      setIsLoading(true);
      const res = await fetch('/api/blog');
      if (!res.ok) {
        throw new Error('Не удалось загрузить статьи');
      }
      const data: BlogPost[] = await res.json();
      setPosts(data);
    } catch (error) {
      console.error(error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить список статей.',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  }

  function handleAutoNewsChange(
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setAutoForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  }

  function handleAutoNewsTbsChange(value: 'qdr:d' | 'qdr:w' | 'qdr:m') {
    setAutoForm((prev) => ({ ...prev, tbs: value }));
  }

  async function handleAutoNewsSubmit() {
    if (!autoForm.query.trim() || !autoForm.baseTitle.trim()) {
      toast({
        title: 'Заполните запрос и заголовок',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const payload: any = {
      query: autoForm.query.trim(),
      baseTitle: autoForm.baseTitle.trim(),
      appendDateToTitle: autoForm.appendDateToTitle,
      location: autoForm.location.trim() || 'Russia',
      gl: autoForm.gl.trim() || 'ru',
      hl: autoForm.hl.trim() || 'ru',
      tbs: autoForm.tbs,
      mode: autoForm.mode,
    };

    if (autoForm.maxNews && Number(autoForm.maxNews) > 0) {
      payload.maxNews = Number(autoForm.maxNews);
    }

    if (autoForm.mode === 'schedule' && autoForm.scheduledAt) {
      payload.scheduledAt = autoForm.scheduledAt;
    }

    try {
      setAutoForm((prev) => ({ ...prev, isSubmitting: true }));
      const res = await fetch('/api/blog/auto-news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(
          data?.message || 'Не удалось автоматически сгенерировать статью',
        );
      }

      await res.json();

      toast({
        title: 'AI-новость создана',
        description:
          'Статья появилась в списке. Можно отредактировать её вручную.',
        status: 'success',
        duration: 4000,
        isClosable: true,
      });

      loadPosts();

      // Сбрасываем форму (кроме технических настроек)
      setAutoForm((prev) => ({
        ...emptyAutoNews,
        location: prev.location,
        gl: prev.gl,
        hl: prev.hl,
        tbs: prev.tbs,
        maxNews: prev.maxNews,
      }));
    } catch (error: any) {
      console.error(error);
      toast({
        title: 'Ошибка авто-генерации статьи',
        description: error?.message || 'Попробуйте ещё раз чуть позже',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setAutoForm((prev) => ({ ...prev, isSubmitting: false }));
    }
  }

  function handleFieldChange(
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    const { name, value } = e.target;

    if (name === 'tagsInput') {
      setForm((prev) => ({
        ...prev,
        tagsInput: value,
        tags: value
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean),
      }));
      return;
    }

    if (name === 'readingTimeInput') {
      const num = value ? Number(value) : undefined;
      setForm((prev) => ({
        ...prev,
        readingTimeInput: value,
        readingTime: Number.isNaN(num!) ? undefined : num,
      }));
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleCoverFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingCover(true);

      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/blog/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error('Upload failed');
      }

      const data = await res.json();

      setForm((prev) => ({
        ...prev,
        coverImage: data.url ?? prev.coverImage,
      }));

      toast({
        title: 'Обложка загружена',
        description: 'Ссылка на картинку подставлена автоматически',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error(error);
      toast({
        title: 'Ошибка загрузки обложки',
        description: 'Не удалось загрузить файл',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setIsUploadingCover(false);
      e.target.value = '';
    }
  }

  function startCreate() {
    setSelectedSlug(null);
    setForm(emptyPost);
  }

  async function startEdit(post: BlogPost) {
    setSelectedSlug(post.slug);
    setIsLoadingPost(true);

    try {
      const res = await fetch(`/api/blog/${encodeURIComponent(post.slug)}`);
      if (!res.ok) {
        throw new Error('Не удалось загрузить статью');
      }

      const fullPost: BlogPost = await res.json();

      const postDate = fullPost.date ? new Date(fullPost.date) : null;
      const isScheduled =
        postDate !== null &&
        !Number.isNaN(postDate.getTime()) &&
        postDate.getTime() > Date.now();

      const toDatetimeLocal = (d: Date | null): string => {
        if (!d || Number.isNaN(d.getTime())) return '';
        const pad = (n: number) => String(n).padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
          d.getDate(),
        )}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
      };

      setForm({
        ...emptyPost,
        ...fullPost,
        tagsInput: (fullPost.tags || []).join(', '),
        readingTimeInput:
          typeof fullPost.readingTime === 'number'
            ? String(fullPost.readingTime)
            : '',
        isScheduled,
        scheduledAt: isScheduled ? toDatetimeLocal(postDate) : '',
      });
    } catch (error) {
      console.error(error);
      toast({
        title: 'Ошибка загрузки статьи',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setIsLoadingPost(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title || !form.slug || !form.description) {
      toast({
        title: 'Заполните обязательные поля',
        description: 'Нужно указать заголовок, slug и описание.',
        status: 'warning',
        duration: 4000,
        isClosable: true,
      });
      return;
    }

    if (form.isScheduled && !form.scheduledAt) {
      toast({
        title: 'Укажите дату публикации',
        description:
          'Вы включили запланированную публикацию, но не выбрали дату и время.',
        status: 'warning',
        duration: 4000,
        isClosable: true,
      });
      return;
    }

    try {
      setIsSaving(true);

      const payload: any = {
        title: form.title,
        slug: form.slug,
        description: form.description,
        content: form.content,
        tags: form.tags || [],
        readingTime: form.readingTime,
        coverImage: form.coverImage,
      };

      if (form.isScheduled && form.scheduledAt) {
        const scheduledDate = new Date(form.scheduledAt);
        if (!Number.isNaN(scheduledDate.getTime())) {
          payload.date = scheduledDate.toISOString();
        }
      }

      const url =
        selectedSlug && selectedSlug !== ''
          ? `/api/blog/${encodeURIComponent(selectedSlug)}`
          : '/api/blog';

      const method = selectedSlug ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error('Ошибка сохранения статьи');
      }

      toast({
        title: 'Статья сохранена',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      setForm(emptyPost);
      setSelectedSlug(null);
      await loadPosts();
    } catch (error) {
      console.error(error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось сохранить статью.',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(slug: string) {
    if (!window.confirm('Удалить статью?')) return;

    try {
      const res = await fetch(`/api/blog/${encodeURIComponent(slug)}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Не удалось удалить статью');
      }

      toast({
        title: 'Статья удалена',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      await loadPosts();
    } catch (error) {
      console.error(error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить статью.',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    }
  }

  function applyMarkdown(type: 'bold' | 'italic' | 'h2' | 'ul' | 'link') {
    const el = textareaRef.current;
    if (!el) return;

    const previewScrollTop = previewRef.current?.scrollTop ?? 0;

    const start = el.selectionStart;
    const end = el.selectionEnd;
    const value = form.content || '';
    const selected = value.slice(start, end);

    const before = value.slice(0, start);
    const after = value.slice(end);
    let replacement = '';

    switch (type) {
      case 'bold':
        replacement = `**${selected || 'жирный текст'}**`;
        break;
      case 'italic':
        replacement = `*${selected || 'курсив'}*`;
        break;
      case 'h2':
        replacement = `## ${selected || 'Заголовок'}\n`;
        break;
      case 'ul':
        if (selected) {
          replacement = selected
            .split('\n')
            .map((line) => (line.trim() ? `- ${line}` : ''))
            .join('\n');
        } else {
          replacement = `- Первый пункт\n- Второй пункт\n`;
        }
        break;
      case 'link':
        replacement = `[${selected || 'текст ссылки'}](https://example.com)`;
        break;
      default:
        replacement = selected;
    }

    const newValue = before + replacement + after;

    setForm((prev) => ({ ...prev, content: newValue }));

    requestAnimationFrame(() => {
      const pos = before.length + replacement.length;
      el.focus();
      el.setSelectionRange(pos, pos);

      if (previewRef.current) {
        previewRef.current.scrollTop = previewScrollTop;
      }
    });
  }

  async function copySlug() {
    if (!form.slug) return;
    try {
      await navigator.clipboard.writeText(form.slug);
      toast({
        title: 'Slug скопирован',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch {
      // ignore
    }
  }

  // ── Stats (only meaningful when posts are loaded) ──────────────────
  const stats = useMemo(() => {
    const now = Date.now();
    let total = 0;
    let published = 0;
    let scheduled = 0;
    let noDesc = 0;
    for (const p of posts) {
      total++;
      const d = p.date ? new Date(p.date) : null;
      if (d && !Number.isNaN(d.getTime())) {
        if (d.getTime() > now) scheduled++;
        else published++;
      }
      if (!p.description || p.description.length < 30) noDesc++;
    }
    return { total, published, scheduled, noDesc };
  }, [posts]);

  const filteredPosts = useMemo(() => {
    const q = listQuery.trim().toLowerCase();
    if (!q) return posts;
    return posts.filter((p) => {
      const hay =
        `${p.title || ''} ${p.slug || ''} ${(p.tags || []).join(' ')}`.toLowerCase();
      return hay.includes(q);
    });
  }, [posts, listQuery]);

  // ── SEO checklist data ─────────────────────────────────────────────
  const titleLen = (form.title || '').length;
  const descLen = (form.description || '').length;
  const contentLen = (form.content || '').length;
  const tagsCount = form.tags?.length || 0;
  const seoItems: { ok: boolean; label: string; hint?: string }[] = [
    { ok: titleLen > 0, label: 'Заголовок указан' },
    {
      ok: titleLen >= 40 && titleLen <= 70,
      label: 'Заголовок 40–70 символов',
      hint: 'Рекомендация: лучше укладываться в этот диапазон.',
    },
    { ok: descLen > 0, label: 'Описание указано' },
    {
      ok: descLen >= 120 && descLen <= 160,
      label: 'Описание 120–160 символов',
      hint: 'Рекомендация: оптимальная длина для сниппета в поиске.',
    },
    { ok: !!form.slug && form.slug.length > 0, label: 'Slug заполнен' },
    { ok: !!form.coverImage, label: 'Обложка добавлена' },
    { ok: tagsCount > 0, label: 'Хотя бы один тег' },
    {
      ok: !form.isScheduled || !!form.scheduledAt,
      label: 'Дата публикации задана для расписания',
    },
    { ok: contentLen > 500, label: 'Текст длиннее 500 символов' },
  ];

  // ────────────────────────────────────────────────────────────────────
  //   Guard states: loading / not-authed / not-admin / admin
  // ────────────────────────────────────────────────────────────────────

  if (isResolvingAuth) {
    return (
      <Box bg={pageBg} minH="100vh">
        <Container
          maxW="7xl"
          py={{ base: 8, md: 14 }}
          fontFamily={FONT_APPLE_TEXT}
        >
          <Flex minH="60vh" align="center" justify="center" gap="14px">
            <Spinner size="md" color={ACCENT_BLUE} />
            <Text color={textSecondary} fontSize="14px">
              Проверяю права доступа…
            </Text>
          </Flex>
        </Container>
      </Box>
    );
  }

  if (!isAuthed) {
    return (
      <Box bg={pageBg} minH="100vh">
        <Container
          maxW="2xl"
          py={{ base: 10, md: 16 }}
          fontFamily={FONT_APPLE_TEXT}
        >
          <Box
            bg={surfaceGlass}
            border="1px solid"
            borderColor={borderSubtle}
            borderRadius={{ base: '20px', md: '24px' }}
            backdropFilter="blur(22px) saturate(180%)"
            sx={{ WebkitBackdropFilter: 'blur(22px) saturate(180%)' }}
            p={{ base: '24px', md: '36px' }}
            textAlign="center"
            boxShadow="inset 0 1px 0 rgba(255,255,255,0.55), 0 18px 48px rgba(31,38,70,0.06)"
          >
            <Flex
              w="56px"
              h="56px"
              mx="auto"
              mb="14px"
              align="center"
              justify="center"
              borderRadius="9999px"
              bg="rgba(0,102,204,0.10)"
            >
              <Icon
                as={MdLockOutline}
                w="26px"
                h="26px"
                color={ACCENT_BLUE}
              />
            </Flex>
            <Heading
              as="h1"
              fontFamily={FONT_APPLE_DISPLAY}
              fontSize={{ base: '22px', md: '28px' }}
              fontWeight="600"
              letterSpacing="-0.4px"
              color={textPrimary}
              mb="8px"
            >
              Нужен вход
            </Heading>
            <Text
              color={textSecondary}
              fontSize={{ base: '14px', md: '15px' }}
              mb="22px"
              lineHeight="1.55"
            >
              Контент-студия доступна только администраторам. Войдите в свой
              аккаунт, чтобы продолжить.
            </Text>
            <Button
              as={Link}
              href="/others/sign-in"
              bg={ACCENT_BLUE}
              color="white"
              borderRadius="9999px"
              h="42px"
              px="22px"
              fontWeight="600"
              _hover={{ bg: ACCENT_BLUE_HOVER }}
              leftIcon={<Icon as={MdLogin} />}
            >
              Войти
            </Button>
          </Box>
        </Container>
      </Box>
    );
  }

  if (!isUserAdmin) {
    return (
      <Box bg={pageBg} minH="100vh">
        <Container
          maxW="2xl"
          py={{ base: 10, md: 16 }}
          fontFamily={FONT_APPLE_TEXT}
        >
          <Box
            bg={surfaceGlass}
            border="1px solid"
            borderColor={borderSubtle}
            borderRadius={{ base: '20px', md: '24px' }}
            backdropFilter="blur(22px) saturate(180%)"
            sx={{ WebkitBackdropFilter: 'blur(22px) saturate(180%)' }}
            p={{ base: '24px', md: '36px' }}
            textAlign="center"
            boxShadow="inset 0 1px 0 rgba(255,255,255,0.55), 0 18px 48px rgba(31,38,70,0.06)"
          >
            <Flex
              w="56px"
              h="56px"
              mx="auto"
              mb="14px"
              align="center"
              justify="center"
              borderRadius="9999px"
              bg="rgba(0,0,0,0.06)"
            >
              <Icon
                as={MdLockOutline}
                w="26px"
                h="26px"
                color={textSecondary}
              />
            </Flex>
            <Heading
              as="h1"
              fontFamily={FONT_APPLE_DISPLAY}
              fontSize={{ base: '22px', md: '28px' }}
              fontWeight="600"
              letterSpacing="-0.4px"
              color={textPrimary}
              mb="8px"
            >
              Нет доступа
            </Heading>
            <Text
              color={textSecondary}
              fontSize={{ base: '14px', md: '15px' }}
              mb="22px"
              lineHeight="1.55"
            >
              Этот раздел доступен только администраторам. Если вы автор — обратитесь
              к команде, чтобы получить доступ.
            </Text>
            <Button
              as={Link}
              href="/blog"
              bg="transparent"
              color={textPrimary}
              border="1px solid"
              borderColor={borderSubtle}
              borderRadius="9999px"
              h="42px"
              px="22px"
              fontWeight="500"
              _hover={{ bg: 'rgba(0,0,0,0.04)', borderColor: borderActive }}
              rightIcon={<Icon as={MdArrowOutward} />}
            >
              Вернуться в блог
            </Button>
          </Box>
        </Container>
      </Box>
    );
  }

  // ── Reusable atoms (defined inside so they use color tokens) ───────
  const fieldLabel = (text: string, hint?: string) => (
    <HStack
      justify="space-between"
      align="baseline"
      spacing="6px"
      mb="6px"
      width="100%"
    >
      <Text
        fontFamily={FONT_APPLE_TEXT}
        fontSize="12px"
        fontWeight="600"
        letterSpacing="0.4px"
        textTransform="uppercase"
        color={textSecondary}
      >
        {text}
      </Text>
      {hint && (
        <Text fontSize="11px" color={textSecondary} opacity={0.85}>
          {hint}
        </Text>
      )}
    </HStack>
  );

  const inputBase = {
    bg: inputBg,
    border: '1px solid',
    borderColor: borderSubtle,
    borderRadius: '12px',
    fontFamily: FONT_APPLE_TEXT,
    fontSize: '14px',
    color: textBody,
    _placeholder: { color: textSecondary, opacity: 0.7 },
    _hover: { borderColor: borderActive },
    _focus: {
      borderColor: ACCENT_BLUE,
      boxShadow: `0 0 0 3px rgba(0,102,204,0.15)`,
    },
  } as any;

  const glassCardSx = {
    bg: surfaceGlass,
    border: '1px solid',
    borderColor: borderSubtle,
    borderRadius: { base: '18px', md: '22px' },
    backdropFilter: 'blur(20px) saturate(180%)',
    sx: {
      WebkitBackdropFilter: 'blur(20px) saturate(180%)',
    },
    boxShadow:
      'inset 0 1px 0 rgba(255,255,255,0.45), 0 8px 24px rgba(31,38,70,0.04)',
  } as any;

  // ────────────────────────────────────────────────────────────────────
  //   Admin view
  // ────────────────────────────────────────────────────────────────────
  return (
    <Box bg={pageBg} minH="100vh" fontFamily={FONT_APPLE_TEXT}>
      <Container
        maxW="1320px"
        py={{ base: 6, md: 10 }}
        px={{ base: '14px', md: '24px' }}
      >
        {/* ── Header / Hero ────────────────────────────────────────── */}
        <Box {...glassCardSx} p={{ base: '18px', md: '26px' }} mb="18px">
          <Flex
            direction={{ base: 'column', md: 'row' }}
            justify="space-between"
            align={{ base: 'flex-start', md: 'flex-end' }}
            gap={{ base: '14px', md: '20px' }}
          >
            <Box minW={0} maxW="100%">
              <Badge
                bg={tagBg}
                color={ACCENT_BLUE}
                borderRadius="9999px"
                px="10px"
                py="3px"
                fontSize="11px"
                fontWeight="600"
                letterSpacing="0.2px"
                textTransform="none"
                mb="10px"
              >
                Только для администратора
              </Badge>
              <Heading
                as="h1"
                fontFamily={FONT_APPLE_DISPLAY}
                fontSize={{ base: '26px', md: '34px' }}
                fontWeight="600"
                letterSpacing="-0.5px"
                color={textPrimary}
                lineHeight="1.15"
                mb="6px"
              >
                Контент-студия ИИСеть
              </Heading>
              <Text
                color={textSecondary}
                fontSize={{ base: '14px', md: '15px' }}
                lineHeight="1.55"
                maxW="640px"
              >
                Создавайте SEO-статьи, новости и гайды для блога. Markdown, обложки,
                расписание публикации и автогенерация новостей — в одном окне.
              </Text>
            </Box>

            <HStack
              spacing="8px"
              flexWrap="wrap"
              justify={{ base: 'flex-start', md: 'flex-end' }}
            >
              <Button
                onClick={startCreate}
                bg={ACCENT_BLUE}
                color="white"
                borderRadius="9999px"
                h="38px"
                px="16px"
                fontWeight="600"
                fontSize="13px"
                _hover={{ bg: ACCENT_BLUE_HOVER }}
                leftIcon={<Icon as={MdAutoAwesome} />}
              >
                Новая статья
              </Button>
              <Button
                as={Link}
                href="/blog"
                target="_blank"
                bg="transparent"
                color={textPrimary}
                border="1px solid"
                borderColor={borderSubtle}
                borderRadius="9999px"
                h="38px"
                px="16px"
                fontWeight="500"
                fontSize="13px"
                _hover={{
                  bg: 'rgba(0,0,0,0.04)',
                  borderColor: borderActive,
                }}
                rightIcon={<Icon as={MdOpenInNew} />}
              >
                Открыть блог
              </Button>
            </HStack>
          </Flex>

          {/* ── Mini stats ───────────────────────────────────────── */}
          <SimpleGrid
            mt={{ base: '16px', md: '20px' }}
            columns={{ base: 2, md: 4 }}
            spacing={{ base: '8px', md: '12px' }}
          >
            {[
              { label: 'Всего статей', value: stats.total },
              { label: 'Опубликовано', value: stats.published },
              { label: 'Запланировано', value: stats.scheduled },
              { label: 'Без описания', value: stats.noDesc },
            ].map((s) => (
              <Box
                key={s.label}
                bg={surfaceGlassSubtle}
                border="1px solid"
                borderColor={borderSubtle}
                borderRadius="14px"
                p={{ base: '10px 12px', md: '12px 14px' }}
                minW={0}
              >
                <Text
                  fontSize="11px"
                  color={textSecondary}
                  fontWeight="600"
                  letterSpacing="0.3px"
                  textTransform="uppercase"
                  noOfLines={1}
                >
                  {s.label}
                </Text>
                <Text
                  mt="2px"
                  fontFamily={FONT_APPLE_DISPLAY}
                  fontSize={{ base: '22px', md: '26px' }}
                  fontWeight="600"
                  letterSpacing="-0.3px"
                  color={textPrimary}
                >
                  {s.value}
                </Text>
              </Box>
            ))}
          </SimpleGrid>
        </Box>

        {/* ── Two-column layout ────────────────────────────────────── */}
        <SimpleGrid
          columns={{ base: 1, lg: 2 }}
          spacing={{ base: '14px', md: '18px' }}
          minWidth={0}
        >
          {/* ── LEFT: Posts list ──────────────────────────────────── */}
          <Box {...glassCardSx} p={{ base: '16px', md: '20px' }} minW={0}>
            <Flex justify="space-between" align="center" mb="12px" gap="10px">
              <Heading
                fontFamily={FONT_APPLE_DISPLAY}
                fontSize={{ base: '17px', md: '19px' }}
                fontWeight="600"
                letterSpacing="-0.25px"
                color={textPrimary}
              >
                Статьи
              </Heading>
              <Button
                size="sm"
                onClick={loadPosts}
                isLoading={isLoading}
                bg="transparent"
                color={textPrimary}
                border="1px solid"
                borderColor={borderSubtle}
                borderRadius="9999px"
                h="30px"
                px="12px"
                fontWeight="500"
                fontSize="12px"
                _hover={{ borderColor: borderActive, bg: 'rgba(0,0,0,0.03)' }}
              >
                Обновить
              </Button>
            </Flex>

            {/* Search */}
            <HStack mb="12px" gap="8px" align="center">
              <Box
                position="relative"
                w="100%"
                bg={inputBg}
                border="1px solid"
                borderColor={borderSubtle}
                borderRadius="12px"
                _focusWithin={{
                  borderColor: ACCENT_BLUE,
                  boxShadow: '0 0 0 3px rgba(0,102,204,0.15)',
                }}
              >
                <Flex
                  position="absolute"
                  top="0"
                  bottom="0"
                  left="10px"
                  align="center"
                  pointerEvents="none"
                >
                  <Icon as={MdSearch} color={textSecondary} />
                </Flex>
                <Input
                  value={listQuery}
                  onChange={(e) => setListQuery(e.target.value)}
                  placeholder="Поиск по title, slug, тегам…"
                  pl="34px"
                  bg="transparent"
                  border="none"
                  _focus={{ boxShadow: 'none' }}
                  fontSize="14px"
                  color={textBody}
                  _placeholder={{ color: textSecondary, opacity: 0.75 }}
                />
              </Box>
            </HStack>

            {isLoading && posts.length === 0 ? (
              <Flex minH="200px" align="center" justify="center">
                <Spinner color={ACCENT_BLUE} />
              </Flex>
            ) : (
              <Stack spacing="10px" maxH="72vh" overflowY="auto" pr="4px">
                {filteredPosts.map((post) => {
                  const d = post.date ? new Date(post.date) : null;
                  const isFuture =
                    d && !Number.isNaN(d.getTime()) && d.getTime() > Date.now();
                  const isActive = post.slug === selectedSlug;

                  return (
                    <Box
                      key={post.slug}
                      p={{ base: '12px', md: '14px' }}
                      borderRadius="14px"
                      bg={surfaceGlassSubtle}
                      border="1px solid"
                      borderColor={isActive ? borderActive : borderSubtle}
                      transition="border-color 0.16s ease, background 0.16s ease, transform 0.12s ease"
                      _hover={{
                        borderColor: borderActive,
                        transform: 'translateY(-1px)',
                      }}
                      minW={0}
                    >
                      <Flex
                        justify="space-between"
                        align="flex-start"
                        gap="10px"
                        minW={0}
                      >
                        <Stack spacing="6px" flex="1" minW={0}>
                          <HStack spacing="6px" align="center" flexWrap="wrap">
                            <Badge
                              bg={
                                isFuture
                                  ? 'rgba(255,159,10,0.16)'
                                  : 'rgba(48,209,88,0.16)'
                              }
                              color={isFuture ? '#b25f00' : '#0a8a3a'}
                              borderRadius="9999px"
                              px="8px"
                              py="2px"
                              fontSize="10px"
                              fontWeight="600"
                              textTransform="none"
                              letterSpacing="0"
                            >
                              {isFuture ? 'Запланировано' : 'Опубликовано'}
                            </Badge>
                            {d && !Number.isNaN(d.getTime()) && (
                              <Text fontSize="11px" color={textSecondary}>
                                {d.toLocaleDateString('ru-RU')}
                              </Text>
                            )}
                            {typeof post.readingTime === 'number' && (
                              <Text fontSize="11px" color={textSecondary}>
                                · {post.readingTime} мин
                              </Text>
                            )}
                          </HStack>
                          <Text
                            fontFamily={FONT_APPLE_DISPLAY}
                            fontSize="14px"
                            fontWeight="600"
                            color={textPrimary}
                            noOfLines={2}
                            wordBreak="break-word"
                          >
                            {post.title}
                          </Text>
                          <Text
                            fontSize="12px"
                            color={textSecondary}
                            noOfLines={2}
                          >
                            /{post.slug}
                          </Text>
                          {post.tags && post.tags.length > 0 && (
                            <HStack spacing="4px" flexWrap="wrap">
                              {post.tags.slice(0, 4).map((tag) => (
                                <Tag
                                  key={tag}
                                  size="sm"
                                  bg={tagBg}
                                  color={ACCENT_BLUE}
                                  borderRadius="9999px"
                                  fontSize="11px"
                                  fontWeight="500"
                                >
                                  {tag}
                                </Tag>
                              ))}
                            </HStack>
                          )}
                        </Stack>

                        {post.coverImage && (
                          <Image
                            src={post.coverImage}
                            alt={post.title}
                            w="80px"
                            h="60px"
                            objectFit="cover"
                            borderRadius="10px"
                            flexShrink={0}
                          />
                        )}
                      </Flex>

                      <HStack mt="10px" spacing="8px" flexWrap="wrap">
                        <Button
                          size="xs"
                          onClick={() => startEdit(post)}
                          bg={ACCENT_BLUE}
                          color="white"
                          borderRadius="9999px"
                          h="28px"
                          px="12px"
                          fontWeight="500"
                          fontSize="12px"
                          _hover={{ bg: ACCENT_BLUE_HOVER }}
                        >
                          Редактировать
                        </Button>
                        <Button
                          as={Link}
                          href={`/blog/${encodeURIComponent(post.slug)}`}
                          target="_blank"
                          size="xs"
                          bg="transparent"
                          color={textPrimary}
                          border="1px solid"
                          borderColor={borderSubtle}
                          borderRadius="9999px"
                          h="28px"
                          px="12px"
                          fontWeight="500"
                          fontSize="12px"
                          _hover={{
                            borderColor: borderActive,
                            bg: 'rgba(0,0,0,0.03)',
                          }}
                          rightIcon={<Icon as={MdOpenInNew} />}
                        >
                          Открыть
                        </Button>
                        <Button
                          size="xs"
                          variant="ghost"
                          onClick={() => handleDelete(post.slug)}
                          color="#c4341e"
                          h="28px"
                          px="10px"
                          fontWeight="500"
                          fontSize="12px"
                          borderRadius="9999px"
                          _hover={{ bg: 'rgba(196,52,30,0.08)' }}
                        >
                          Удалить
                        </Button>
                      </HStack>
                    </Box>
                  );
                })}

                {filteredPosts.length === 0 && !isLoading && (
                  <Text fontSize="13px" color={textSecondary} py="8px">
                    {listQuery
                      ? 'Ничего не найдено по этому запросу.'
                      : 'Пока нет ни одной статьи.'}
                  </Text>
                )}
              </Stack>
            )}
          </Box>

          {/* ── RIGHT: Editor + SEO + Auto-news ───────────────────── */}
          <Stack spacing={{ base: '14px', md: '18px' }} minW={0}>
            <Box
              as="form"
              onSubmit={handleSubmit}
              {...glassCardSx}
              p={{ base: '16px', md: '22px' }}
              minW={0}
            >
              <Flex
                justify="space-between"
                align="center"
                mb="14px"
                gap="10px"
                flexWrap="wrap"
              >
                <Heading
                  fontFamily={FONT_APPLE_DISPLAY}
                  fontSize={{ base: '17px', md: '19px' }}
                  fontWeight="600"
                  letterSpacing="-0.25px"
                  color={textPrimary}
                >
                  {selectedSlug ? 'Редактирование статьи' : 'Новая статья'}
                </Heading>
                {isLoadingPost && <Spinner size="sm" color={ACCENT_BLUE} />}
              </Flex>

              <Stack spacing="14px">
                {/* Title */}
                <Box minW={0}>
                  {fieldLabel(
                    'Заголовок',
                    `${titleLen} симв.${
                      titleLen >= 40 && titleLen <= 70 ? ' · ok' : ''
                    }`,
                  )}
                  <Input
                    name="title"
                    value={form.title}
                    onChange={handleFieldChange}
                    placeholder="Например, ИИ-инструменты для бизнеса в 2025"
                    h="44px"
                    {...inputBase}
                  />
                </Box>

                {/* Slug */}
                <Box minW={0}>
                  {fieldLabel('Slug', '/blog/<slug> · только латиница и дефисы')}
                  <HStack spacing="8px" minW={0}>
                    <Input
                      name="slug"
                      value={form.slug}
                      onChange={handleFieldChange}
                      placeholder="ai-tools-2025"
                      h="44px"
                      flex="1"
                      minW={0}
                      fontFamily={FONT_APPLE_MONO}
                      {...inputBase}
                    />
                    <Button
                      type="button"
                      onClick={copySlug}
                      h="44px"
                      px="12px"
                      bg="transparent"
                      color={textPrimary}
                      border="1px solid"
                      borderColor={borderSubtle}
                      borderRadius="12px"
                      _hover={{ borderColor: borderActive }}
                      title="Скопировать slug"
                      aria-label="Скопировать slug"
                    >
                      <Icon as={MdContentCopy} />
                    </Button>
                  </HStack>
                  {form.slug && (
                    <Text
                      mt="6px"
                      fontSize="11px"
                      color={textSecondary}
                      noOfLines={1}
                    >
                      Preview: <b>/blog/{form.slug}</b>
                    </Text>
                  )}
                </Box>

                {/* Description */}
                <Box minW={0}>
                  {fieldLabel(
                    'Описание (SEO)',
                    `${descLen} симв.${
                      descLen >= 120 && descLen <= 160 ? ' · ok' : ''
                    }`,
                  )}
                  <Textarea
                    name="description"
                    value={form.description}
                    onChange={handleFieldChange}
                    placeholder="Короткое описание, которое попадёт в meta description и сниппет."
                    rows={3}
                    {...inputBase}
                  />
                </Box>

                {/* Tags */}
                <Box minW={0}>
                  {fieldLabel('Теги', 'через запятую')}
                  <Input
                    name="tagsInput"
                    value={form.tagsInput}
                    onChange={handleFieldChange}
                    placeholder="ИИ, бизнес, кейсы"
                    h="44px"
                    {...inputBase}
                  />
                  {form.tags && form.tags.length > 0 && (
                    <HStack spacing="4px" flexWrap="wrap" mt="6px">
                      {form.tags.map((t) => (
                        <Tag
                          key={t}
                          size="sm"
                          bg={tagBg}
                          color={ACCENT_BLUE}
                          borderRadius="9999px"
                          fontSize="11px"
                        >
                          {t}
                        </Tag>
                      ))}
                    </HStack>
                  )}
                </Box>

                {/* Reading time + cover URL */}
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing="10px">
                  <Box minW={0}>
                    {fieldLabel('Время чтения (мин.)')}
                    <Input
                      name="readingTimeInput"
                      value={form.readingTimeInput}
                      onChange={handleFieldChange}
                      placeholder="например, 7"
                      type="number"
                      h="44px"
                      {...inputBase}
                    />
                  </Box>
                  <Box minW={0}>
                    {fieldLabel('URL обложки', 'если есть готовая ссылка')}
                    <Input
                      name="coverImage"
                      value={form.coverImage ?? ''}
                      onChange={handleFieldChange}
                      placeholder="https://… или /api/blog/image/…"
                      h="44px"
                      {...inputBase}
                    />
                  </Box>
                </SimpleGrid>

                {/* Cover upload + preview */}
                <Box minW={0}>
                  {fieldLabel('Загрузить обложку')}
                  <HStack align="center" spacing="10px" minW={0}>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleCoverFileChange}
                      disabled={isUploadingCover}
                      h="44px"
                      pt="10px"
                      {...inputBase}
                    />
                    {isUploadingCover && (
                      <Spinner size="sm" color={ACCENT_BLUE} />
                    )}
                  </HStack>
                  {form.coverImage && (
                    <Box mt="10px">
                      <Image
                        src={form.coverImage}
                        alt={form.title || 'Обложка'}
                        maxH="160px"
                        w="100%"
                        objectFit="cover"
                        borderRadius="14px"
                        border="1px solid"
                        borderColor={borderSubtle}
                      />
                    </Box>
                  )}
                </Box>

                {/* Editor layout switch */}
                <HStack
                  justify="space-between"
                  align="center"
                  mt="6px"
                  flexWrap="wrap"
                  gap="8px"
                >
                  <Text
                    fontFamily={FONT_APPLE_TEXT}
                    fontSize="12px"
                    fontWeight="600"
                    letterSpacing="0.4px"
                    textTransform="uppercase"
                    color={textSecondary}
                  >
                    Тело статьи (Markdown)
                  </Text>
                  <ButtonGroup
                    size="xs"
                    isAttached
                    variant="outline"
                    borderRadius="9999px"
                  >
                    {(['editor', 'split', 'preview'] as const).map((mode) => (
                      <Button
                        key={mode}
                        type="button"
                        onClick={() => setEditorLayout(mode)}
                        bg={
                          editorLayout === mode ? ACCENT_BLUE : 'transparent'
                        }
                        color={
                          editorLayout === mode ? 'white' : textPrimary
                        }
                        border="1px solid"
                        borderColor={
                          editorLayout === mode ? ACCENT_BLUE : borderSubtle
                        }
                        h="28px"
                        px="12px"
                        fontWeight="500"
                        fontSize="11px"
                        _hover={{
                          bg:
                            editorLayout === mode
                              ? ACCENT_BLUE_HOVER
                              : 'rgba(0,0,0,0.03)',
                          borderColor:
                            editorLayout === mode
                              ? ACCENT_BLUE_HOVER
                              : borderActive,
                        }}
                      >
                        {mode === 'editor'
                          ? 'Редактор'
                          : mode === 'split'
                            ? 'Сплит'
                            : 'Превью'}
                      </Button>
                    ))}
                  </ButtonGroup>
                </HStack>

                <SimpleGrid
                  columns={
                    editorLayout === 'split'
                      ? { base: 1, md: 2 }
                      : { base: 1, md: 1 }
                  }
                  spacing="10px"
                  minWidth={0}
                >
                  {editorLayout !== 'preview' && (
                    <Box
                      border="1px solid"
                      borderColor={borderSubtle}
                      borderRadius="14px"
                      overflow="hidden"
                      bg={inputBg}
                      minW={0}
                    >
                      <HStack
                        spacing="6px"
                        p="6px"
                        borderBottom="1px solid"
                        borderColor={borderSubtle}
                        bg={surfaceGlassSubtle}
                      >
                        {(
                          [
                            { id: 'h2', label: 'H2' },
                            { id: 'bold', label: 'B' },
                            { id: 'italic', label: 'I' },
                            { id: 'ul', label: 'Список' },
                            { id: 'link', label: 'Ссылка' },
                          ] as const
                        ).map((b) => (
                          <Button
                            key={b.id}
                            type="button"
                            size="xs"
                            onClick={() => applyMarkdown(b.id)}
                            bg="transparent"
                            color={textPrimary}
                            border="1px solid"
                            borderColor={borderSubtle}
                            borderRadius="9999px"
                            h="26px"
                            px="10px"
                            fontWeight="500"
                            fontSize="11px"
                            _hover={{
                              borderColor: borderActive,
                              color: ACCENT_BLUE,
                            }}
                          >
                            {b.label}
                          </Button>
                        ))}
                      </HStack>
                      <Textarea
                        ref={textareaRef}
                        value={form.content}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            content: e.target.value,
                          }))
                        }
                        placeholder="Текст статьи в формате Markdown…"
                        minH="420px"
                        maxH="70vh"
                        resize="vertical"
                        fontFamily={FONT_APPLE_MONO}
                        fontSize="13px"
                        bg="transparent"
                        border="none"
                        color={textBody}
                        _focus={{
                          boxShadow: 'none',
                          borderColor: 'transparent',
                        }}
                      />
                    </Box>
                  )}

                  {editorLayout !== 'editor' && (
                    <Box
                      ref={previewRef}
                      border="1px solid"
                      borderColor={borderSubtle}
                      borderRadius="14px"
                      p="14px"
                      maxH="70vh"
                      overflowY="auto"
                      className="blog-content"
                      bg={surfaceGlassSubtle}
                      minW={0}
                      sx={{
                        wordBreak: 'break-word',
                        '& h2': {
                          fontFamily: FONT_APPLE_DISPLAY,
                          fontSize: '20px',
                          fontWeight: 600,
                          color: textPrimary,
                          marginTop: '1.2em',
                          marginBottom: '0.5em',
                        },
                        '& p': {
                          color: textBody,
                          marginBottom: '0.9em',
                          lineHeight: 1.65,
                        },
                        '& a': {
                          color: ACCENT_BLUE,
                          textDecoration: 'underline',
                        },
                        '& ul, & ol': { paddingLeft: '1.25em' },
                        '& code': {
                          fontFamily: FONT_APPLE_MONO,
                          fontSize: '13px',
                          background: 'rgba(0,0,0,0.05)',
                          padding: '1px 6px',
                          borderRadius: '6px',
                        },
                        '& img': {
                          maxWidth: '100%',
                          borderRadius: '10px',
                        },
                      }}
                    >
                      {form.content ? (
                        <ReactMarkdown>{form.content}</ReactMarkdown>
                      ) : (
                        <Text fontSize="13px" color={textSecondary}>
                          Превью появится здесь по мере ввода текста.
                        </Text>
                      )}
                    </Box>
                  )}
                </SimpleGrid>

                {/* Schedule */}
                <HStack
                  spacing="10px"
                  align="center"
                  mt="4px"
                  flexWrap="wrap"
                  gap="8px"
                >
                  <Checkbox
                    isChecked={form.isScheduled}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        isScheduled: e.target.checked,
                      }))
                    }
                    colorScheme="blue"
                  >
                    <Text fontSize="13px" color={textBody}>
                      Запланировать публикацию
                    </Text>
                  </Checkbox>
                  <Input
                    type="datetime-local"
                    size="sm"
                    value={form.scheduledAt}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        scheduledAt: e.target.value,
                      }))
                    }
                    isDisabled={!form.isScheduled}
                    maxW="240px"
                    {...inputBase}
                  />
                </HStack>

                <Text fontSize="11px" color={textSecondary} mt="-2px">
                  Поддерживается Markdown: заголовки, списки, выделение, ссылки и
                  картинки. Для встроенных изображений: <code>![alt](/api/blog/image/имя.png)</code>.
                </Text>

                {/* Actions */}
                <HStack spacing="10px" mt="4px" flexWrap="wrap">
                  <Button
                    type="submit"
                    isLoading={isSaving}
                    isDisabled={isLoadingPost}
                    bg={ACCENT_BLUE}
                    color="white"
                    borderRadius="9999px"
                    h="40px"
                    px="20px"
                    fontWeight="600"
                    fontSize="13px"
                    _hover={{ bg: ACCENT_BLUE_HOVER }}
                  >
                    Сохранить
                  </Button>
                  <Button
                    type="button"
                    onClick={startCreate}
                    bg="transparent"
                    color={textPrimary}
                    border="1px solid"
                    borderColor={borderSubtle}
                    borderRadius="9999px"
                    h="40px"
                    px="16px"
                    fontWeight="500"
                    fontSize="13px"
                    _hover={{
                      bg: 'rgba(0,0,0,0.03)',
                      borderColor: borderActive,
                    }}
                  >
                    Очистить форму
                  </Button>
                </HStack>
              </Stack>
            </Box>

            {/* ── SEO checklist ───────────────────────────────────── */}
            <Box {...glassCardSx} p={{ base: '16px', md: '20px' }} minW={0}>
              <Heading
                fontFamily={FONT_APPLE_DISPLAY}
                fontSize={{ base: '15px', md: '17px' }}
                fontWeight="600"
                letterSpacing="-0.2px"
                color={textPrimary}
                mb="10px"
              >
                SEO-проверка
              </Heading>
              <Stack spacing="6px">
                {seoItems.map((it) => (
                  <HStack
                    key={it.label}
                    spacing="8px"
                    align="start"
                    minW={0}
                  >
                    <Icon
                      as={it.ok ? MdCheckCircle : MdRadioButtonUnchecked}
                      color={it.ok ? '#0a8a3a' : textSecondary}
                      mt="2px"
                    />
                    <Box minW={0}>
                      <Text
                        fontSize="13px"
                        color={it.ok ? textBody : textSecondary}
                        fontWeight={it.ok ? 500 : 400}
                      >
                        {it.label}
                      </Text>
                      {it.hint && (
                        <Text fontSize="11px" color={textSecondary}>
                          {it.hint}
                        </Text>
                      )}
                    </Box>
                  </HStack>
                ))}
              </Stack>
              <Text mt="10px" fontSize="11px" color={textSecondary}>
                Проверка не блокирует сохранение — это рекомендации.
              </Text>
            </Box>

            {/* ── AI-новость (auto-news) ──────────────────────────── */}
            <Box {...glassCardSx} p={{ base: '16px', md: '20px' }} minW={0}>
              <Flex
                justify="space-between"
                align="baseline"
                mb="10px"
                gap="10px"
                flexWrap="wrap"
              >
                <Box minW={0}>
                  <Heading
                    fontFamily={FONT_APPLE_DISPLAY}
                    fontSize={{ base: '17px', md: '19px' }}
                    fontWeight="600"
                    letterSpacing="-0.25px"
                    color={textPrimary}
                  >
                    AI-новость из поиска
                  </Heading>
                  <Text
                    mt="4px"
                    fontSize="12px"
                    color={textSecondary}
                    maxW="520px"
                  >
                    GPT-OSS + Serper соберут свежий дайджест по теме и
                    сформируют статью. Её можно опубликовать сразу или
                    запланировать на дату.
                  </Text>
                </Box>
              </Flex>

              <Stack spacing="12px">
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing="10px">
                  <Box minW={0}>
                    {fieldLabel('Поисковый запрос')}
                    <Input
                      name="query"
                      value={autoForm.query}
                      onChange={handleAutoNewsChange}
                      placeholder="новости из мира ИИ"
                      h="42px"
                      {...inputBase}
                    />
                  </Box>
                  <Box minW={0}>
                    {fieldLabel('Базовый заголовок')}
                    <Input
                      name="baseTitle"
                      value={autoForm.baseTitle}
                      onChange={handleAutoNewsChange}
                      placeholder="Новости из мира IT"
                      h="42px"
                      {...inputBase}
                    />
                  </Box>
                </SimpleGrid>

                <Checkbox
                  name="appendDateToTitle"
                  isChecked={autoForm.appendDateToTitle}
                  onChange={handleAutoNewsChange}
                  colorScheme="blue"
                >
                  <Text fontSize="13px" color={textBody}>
                    Добавлять дату к заголовку (например, «за 13.11.2025»)
                  </Text>
                </Checkbox>

                <SimpleGrid columns={{ base: 2, md: 4 }} spacing="8px">
                  <Box minW={0}>
                    {fieldLabel('location')}
                    <Input
                      name="location"
                      value={autoForm.location}
                      onChange={handleAutoNewsChange}
                      placeholder="Russia"
                      h="38px"
                      {...inputBase}
                    />
                  </Box>
                  <Box minW={0}>
                    {fieldLabel('gl')}
                    <Input
                      name="gl"
                      value={autoForm.gl}
                      onChange={handleAutoNewsChange}
                      placeholder="ru"
                      h="38px"
                      {...inputBase}
                    />
                  </Box>
                  <Box minW={0}>
                    {fieldLabel('hl')}
                    <Input
                      name="hl"
                      value={autoForm.hl}
                      onChange={handleAutoNewsChange}
                      placeholder="ru"
                      h="38px"
                      {...inputBase}
                    />
                  </Box>
                  <Box minW={0}>
                    {fieldLabel('maxNews')}
                    <Input
                      name="maxNews"
                      type="number"
                      min={1}
                      max={20}
                      value={autoForm.maxNews}
                      onChange={handleAutoNewsChange}
                      placeholder="10"
                      h="38px"
                      {...inputBase}
                    />
                  </Box>
                </SimpleGrid>

                <Box>
                  {fieldLabel('Период')}
                  <ButtonGroup size="xs" isAttached borderRadius="9999px">
                    {(
                      [
                        { v: 'qdr:d', label: '24 часа' },
                        { v: 'qdr:w', label: 'Неделя' },
                        { v: 'qdr:m', label: 'Месяц' },
                      ] as const
                    ).map((opt) => (
                      <Button
                        key={opt.v}
                        type="button"
                        bg={autoForm.tbs === opt.v ? ACCENT_BLUE : 'transparent'}
                        color={
                          autoForm.tbs === opt.v ? 'white' : textPrimary
                        }
                        border="1px solid"
                        borderColor={
                          autoForm.tbs === opt.v ? ACCENT_BLUE : borderSubtle
                        }
                        h="30px"
                        px="12px"
                        fontWeight="500"
                        fontSize="12px"
                        onClick={() => handleAutoNewsTbsChange(opt.v)}
                        _hover={{
                          bg:
                            autoForm.tbs === opt.v
                              ? ACCENT_BLUE_HOVER
                              : 'rgba(0,0,0,0.03)',
                          borderColor:
                            autoForm.tbs === opt.v
                              ? ACCENT_BLUE_HOVER
                              : borderActive,
                        }}
                      >
                        {opt.label}
                      </Button>
                    ))}
                  </ButtonGroup>
                </Box>

                <Stack spacing="6px">
                  {fieldLabel('Режим публикации')}
                  <Checkbox
                    isChecked={autoForm.mode === 'now'}
                    onChange={() =>
                      setAutoForm((prev) => ({ ...prev, mode: 'now' }))
                    }
                    colorScheme="blue"
                  >
                    <Text fontSize="13px" color={textBody}>
                      Опубликовать сразу
                    </Text>
                  </Checkbox>
                  <Checkbox
                    isChecked={autoForm.mode === 'schedule'}
                    onChange={() =>
                      setAutoForm((prev) => ({
                        ...prev,
                        mode: 'schedule',
                      }))
                    }
                    colorScheme="blue"
                  >
                    <Text fontSize="13px" color={textBody}>
                      Запланировать на дату
                    </Text>
                  </Checkbox>
                  {autoForm.mode === 'schedule' && (
                    <Input
                      type="datetime-local"
                      name="scheduledAt"
                      value={autoForm.scheduledAt}
                      onChange={handleAutoNewsChange}
                      maxW="280px"
                      h="38px"
                      {...inputBase}
                    />
                  )}
                </Stack>

                <Button
                  onClick={handleAutoNewsSubmit}
                  isLoading={autoForm.isSubmitting}
                  bg={ACCENT_BLUE}
                  color="white"
                  borderRadius="9999px"
                  h="40px"
                  px="20px"
                  fontWeight="600"
                  fontSize="13px"
                  alignSelf="flex-start"
                  _hover={{ bg: ACCENT_BLUE_HOVER }}
                  leftIcon={<Icon as={MdAutoAwesome} />}
                >
                  Сгенерировать новость
                </Button>
              </Stack>
            </Box>
          </Stack>
        </SimpleGrid>
      </Container>
    </Box>
  );
}
