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
  VStack,
  Image,
  Spinner,
} from '@chakra-ui/react';
import ReactMarkdown from 'react-markdown';
import { useSession } from 'next-auth/react';
import { ChangeEvent, useEffect, useRef, useState } from 'react';

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
  const toast = useToast();

  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [form, setForm] = useState(emptyPost);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isLoadingPost, setIsLoadingPost] = useState(false);

const [autoForm, setAutoForm] = useState<AutoNewsFormState>(emptyAutoNews);


  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const previewRef = useRef<HTMLDivElement | null>(null);
  const [editorLayout, setEditorLayout] = useState<'split' | 'editor' | 'preview'>('split');


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

    setForm((prev) => ({
      ...prev,
      content: newValue,
    }));

    requestAnimationFrame(() => {
      const pos = before.length + replacement.length;
      el.focus();
      el.setSelectionRange(pos, pos);

      if (previewRef.current) {
        previewRef.current.scrollTop = previewScrollTop;
      }
    });
  }

  const isAdmin = !!session?.user?.email; // реальная проверка прав уже на API

  useEffect(() => {
    if (status === 'authenticated') {
      void loadPosts();
    }
  }, [status]);

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
    [name]:
      type === 'checkbox'
        ? checked
        : value,
  }));
}

function handleAutoNewsTbsChange(value: 'qdr:d' | 'qdr:w' | 'qdr:m') {
  setAutoForm((prev) => ({
    ...prev,
    tbs: value,
  }));
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
      title: 'Авто-статья создана',
      description: 'Статья появилась в списке. Можно отредактировать её вручную.',
      status: 'success',
      duration: 4000,
      isClosable: true,
    });

    // Обновляем список статей
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

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }


  async function handleCoverFileChange(
    e: ChangeEvent<HTMLInputElement>,
  ) {
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
      // чтобы можно было выбрать тот же файл ещё раз
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

  if (status === 'loading') {
    return (
      <Flex minH="60vh" align="center" justify="center">
        <Spinner />
      </Flex>
    );
  }

  if (!isAdmin) {
    return (
      <Flex minH="60vh" align="center" justify="center">
        <Text>Доступ только для администратора.</Text>
      </Flex>
    );
  }

  return (
    <Container maxW="7xl" py={{ base: 8, md: 12 }}>
      
<Stack spacing={6} mb={8}>
        <Badge
          alignSelf="flex-start"
          colorScheme="purple"
          borderRadius="full"
          px={3}
          py={1}
        >
          Админка блога
        </Badge>
        <Heading size="lg">Управление статьями</Heading>
        <Text color="gray.500">
          Создавайте, редактируйте и удаляйте статьи блога ИИСеть.
        </Text>
      </Stack>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10}>
        <Box as="form" onSubmit={handleSubmit}>
          <Stack spacing={4}>
            <Heading size="md">
              {selectedSlug ? 'Редактирование статьи' : 'Новая статья'}
            </Heading>

            <Input
              name="title"
              value={form.title}
              onChange={handleFieldChange}
              placeholder="Заголовок статьи"
            />

            <Input
              name="slug"
              value={form.slug}
              onChange={handleFieldChange}
              placeholder="slug (url-часть, латиницей)"
            />

            <Textarea
              name="description"
              value={form.description}
              onChange={handleFieldChange}
              placeholder="Краткое описание"
              rows={3}
            />

            <Input
              name="tagsInput"
              value={form.tagsInput}
              onChange={handleFieldChange}
              placeholder="Теги через запятую"
            />

            <Input
              name="readingTimeInput"
              value={form.readingTimeInput}
              onChange={handleFieldChange}
              placeholder="Время чтения (минуты)"
            />

            <Input
              name="coverImage"
              value={form.coverImage ?? ''}
              onChange={handleFieldChange}
              placeholder="URL обложки (если используете внешний хостинг)"
            />

            <HStack align="center" spacing={4} mt={2}>
              <Input
                type="file"
                accept="image/*"
                onChange={handleCoverFileChange}
                disabled={isUploadingCover}
              />
              {isUploadingCover && <Spinner size="sm" />}
            </HStack>

            {form.coverImage && (
              <Box mt={2}>
                <Text fontSize="xs" color="gray.500" mb={1}>
                  Текущая обложка:
                </Text>
                <Image
                  src={form.coverImage}
                  alt={form.title || 'Обложка'}
                  maxH="160px"
                  borderRadius="md"
                  objectFit="cover"
                />
              </Box>
            )}

                        <HStack justify="space-between" align="center" mt={4} mb={2}>
              <Text fontSize="sm" color="gray.600">
                Тело статьи
              </Text>
              <ButtonGroup size="xs" isAttached variant="outline">
                <Button
                  type="button"
                  variant={editorLayout === 'editor' ? 'solid' : 'outline'}
                  onClick={() => setEditorLayout('editor')}
                >
                  Только редактор
                </Button>
                <Button
                  type="button"
                  variant={editorLayout === 'split' ? 'solid' : 'outline'}
                  onClick={() => setEditorLayout('split')}
                >
                  Редактор + превью
                </Button>
                <Button
                  type="button"
                  variant={editorLayout === 'preview' ? 'solid' : 'outline'}
                  onClick={() => setEditorLayout('preview')}
                >
                  Только превью
                </Button>
              </ButtonGroup>
            </HStack>

            <SimpleGrid
              columns={
                editorLayout === 'split'
                  ? { base: 1, md: 2 }
                  : { base: 1, md: 1 }
              }
              spacing={4}
            >
              {editorLayout !== 'preview' && (
                <Box borderWidth="1px" borderRadius="lg" overflow="hidden">
                  <HStack
                    spacing={2}
                    p={2}
                    borderBottomWidth="1px"
                    bg="gray.50"
                  >
                    <Button type="button" size="xs" onClick={() => applyMarkdown('h2')}>
                      H2
                    </Button>
                    <Button type="button" size="xs" onClick={() => applyMarkdown('bold')}>
                      B
                    </Button>
                    <Button
                      type="button"
                      size="xs"
                      onClick={() => applyMarkdown('italic')}
                    >
                      I
                    </Button>
                    <Button type="button" size="xs" onClick={() => applyMarkdown('ul')}>
                      Список
                    </Button>
                    <Button type="button" size="xs" onClick={() => applyMarkdown('link')}>
                      Ссылка
                    </Button>
                  </HStack>
                  <Textarea
                    ref={textareaRef}
                    value={form.content}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, content: e.target.value }))
                    }
                    placeholder="Текст статьи в формате Markdown"
                    minH="420px"
                    maxH="70vh"
                    resize="vertical"
                    fontFamily="monospace"
                    fontSize="14px"
                    border="none"
                    _focus={{ boxShadow: 'none', borderColor: 'transparent' }}
                  />
                </Box>
              )}

              {editorLayout !== 'editor' && (
                <Box
                  ref={previewRef}
                  borderWidth="1px"
                  borderRadius="lg"
                  p={4}
                  maxH="70vh"
                  overflowY="auto"
                  className="blog-content"
                >
                  {form.content ? (
                    <ReactMarkdown>{form.content}</ReactMarkdown>
                  ) : (
                    <Text fontSize="sm" color="gray.500">
                      Превью статьи появится здесь по мере ввода текста.
                    </Text>
                  )}
                </Box>
              )}
            </SimpleGrid>

      <Stack spacing={6}>
        <Heading size="md">Авто-новости (GPT-OSS + Serper)</Heading>
        <Text fontSize="sm" color="gray.600" maxW="3xl">
          Здесь можно автоматически собрать дайджест новостей: задать запрос,
          сгенерировать статью сейчас или создать статью с отложенной публикацией.
          Статьи появятся в общем списке и их можно будет отредактировать вручную.
        </Text>

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10}>
          <Box>
            <Stack spacing={4}>
              <Heading size="sm">Параметры поиска новостей</Heading>

              <Input
                name="query"
                value={autoForm.query}
                onChange={handleAutoNewsChange}
                placeholder="Запрос для новостей (например, новости из мира ИИ)"
              />

              <Input
                name="baseTitle"
                value={autoForm.baseTitle}
                onChange={handleAutoNewsChange}
                placeholder="Базовый заголовок (например, Новости из мира IT)"
              />

              <Checkbox
                name="appendDateToTitle"
                isChecked={autoForm.appendDateToTitle}
                onChange={handleAutoNewsChange}
              >
                Добавлять дату к заголовку (за 13.11.2025)
              </Checkbox>

              <HStack spacing={4}>
                <Input
                  name="location"
                  value={autoForm.location}
                  onChange={handleAutoNewsChange}
                  placeholder="location (по умолчанию Russia)"
                />
                <Input
                  name="gl"
                  value={autoForm.gl}
                  onChange={handleAutoNewsChange}
                  placeholder="gl (по умолчанию ru)"
                />
                <Input
                  name="hl"
                  value={autoForm.hl}
                  onChange={handleAutoNewsChange}
                  placeholder="hl (по умолчанию ru)"
                />
              </HStack>

              <Box>
                <Text fontSize="sm" color="gray.600" mb={1}>
                  Период новостей
                </Text>
                <ButtonGroup size="xs" isAttached>
                  <Button
                    variant={autoForm.tbs === 'qdr:d' ? 'solid' : 'outline'}
                    onClick={() => handleAutoNewsTbsChange('qdr:d')}
                  >
                    24 часа
                  </Button>
                  <Button
                    variant={autoForm.tbs === 'qdr:w' ? 'solid' : 'outline'}
                    onClick={() => handleAutoNewsTbsChange('qdr:w')}
                  >
                    Неделя
                  </Button>
                  <Button
                    variant={autoForm.tbs === 'qdr:m' ? 'solid' : 'outline'}
                    onClick={() => handleAutoNewsTbsChange('qdr:m')}
                  >
                    Месяц
                  </Button>
                </ButtonGroup>
              </Box>

              <HStack>
                <Input
                  name="maxNews"
                  type="number"
                  min={1}
                  max={20}
                  value={autoForm.maxNews}
                  onChange={handleAutoNewsChange}
                  placeholder="Сколько новостей брать (по умолчанию 10)"
                />
              </HStack>
            </Stack>
          </Box>

          <Box>
            <Stack spacing={4}>
              <Heading size="sm">Режим генерации</Heading>

              <Stack spacing={2}>
                <Checkbox
                  isChecked={autoForm.mode === 'now'}
                  onChange={() =>
                    setAutoForm((prev) => ({ ...prev, mode: 'now' }))
                  }
                >
                  Написать сейчас
                </Checkbox>

                <Checkbox
                  isChecked={autoForm.mode === 'schedule'}
                  onChange={() =>
                    setAutoForm((prev) => ({ ...prev, mode: 'schedule' }))
                  }
                >
                  Написать с датой публикации
                </Checkbox>

                {autoForm.mode === 'schedule' && (
                  <Input
                    type="datetime-local"
                    name="scheduledAt"
                    value={autoForm.scheduledAt}
                    onChange={handleAutoNewsChange}
                  />
                )}
              </Stack>

              <Text fontSize="xs" color="gray.500">
                В режиме с датой публикации статья создаётся сразу, но будет
                показана на сайте только после наступления указанного времени
                (по аналогии с таймером публикации обычных статей).
              </Text>

              <Button
                onClick={handleAutoNewsSubmit}
                isLoading={autoForm.isSubmitting}
                colorScheme="purple"
                alignSelf="flex-start"
              >
                Сгенерировать авто-статью
              </Button>
            </Stack>
          </Box>
        </SimpleGrid>
      </Stack>

            <HStack spacing={4} align="center" mt={4}>
              <Checkbox
                isChecked={form.isScheduled}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    isScheduled: e.target.checked,
                  }))
                }
              >
                Запланировать публикацию
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
              />
            </HStack>
            <Text fontSize="xs" color="gray.500" mt={2}>
              Поддерживается Markdown: заголовки, списки, выделение текста, ссылки и картинки.
              Чтобы вставить картинку внутри статьи, загрузите её в обложки или другой хостинг и
              вставьте ссылку в формате <code>![описание](/api/blog/image/имя-файла.png)</code>.
            </Text>


            <HStack spacing={4}>
              <Button
                type="submit"
                colorScheme="purple"
                isLoading={isSaving}
                isDisabled={isLoadingPost}
              >
                Сохранить
              </Button>
              <Button variant="ghost" onClick={startCreate}>
                Очистить форму
              </Button>
            </HStack>
          </Stack>
        </Box>

        <Box>
          <Flex justify="space-between" align="center" mb={4}>
            <Heading size="md">Список статей</Heading>
            <Button size="sm" onClick={loadPosts} isLoading={isLoading}>
              Обновить
            </Button>
          </Flex>

          {isLoading && posts.length === 0 ? (
            <Flex minH="200px" align="center" justify="center">
              <Spinner />
            </Flex>
          ) : (
            <Stack spacing={4}>
              {posts.map((post) => (
                <Box
                  key={post.slug}
                  p={4}
                  borderWidth="1px"
                  borderRadius="lg"
                  _hover={{ shadow: 'sm' }}
                >
                  <HStack justify="space-between" align="flex-start">
                    <Stack spacing={2} flex="1">
                      <Heading size="sm">{post.title}</Heading>
                      <Text fontSize="sm" color="gray.500">
                        {post.description}
                      </Text>
                      <HStack spacing={2} flexWrap="wrap">
                        {post.tags?.map((tag) => (
                          <Tag key={tag} size="sm" colorScheme="purple">
                            {tag}
                          </Tag>
                        ))}
                      </HStack>
                      <HStack spacing={3} fontSize="xs" color="gray.500">
                        {post.date && (
                          <Text>
                            {new Date(post.date).toLocaleDateString('ru-RU')}
                          </Text>
                        )}
                        {typeof post.readingTime === 'number' && (
                          <Text>· {post.readingTime} мин чтения</Text>
                        )}
                      </HStack>
                    </Stack>

                    {post.coverImage && (
                      <Image
                        src={post.coverImage}
                        alt={post.title}
                        w="120px"
                        h="80px"
                        objectFit="cover"
                        borderRadius="md"
                        ml={4}
                      />
                    )}
                  </HStack>

                  <HStack mt={3} spacing={3}>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => startEdit(post)}
                    >
                      Редактировать
                    </Button>
                    <Button
                      size="sm"
                      colorScheme="red"
                      variant="outline"
                      onClick={() => handleDelete(post.slug)}
                    >
                      Удалить
                    </Button>
                  </HStack>
                </Box>
              ))}

              {posts.length === 0 && !isLoading && (
                <Text fontSize="sm" color="gray.500">
                  Пока нет ни одной статьи.
                </Text>
              )}
            </Stack>
          )}
        </Box>
      </SimpleGrid>
    </Container>
  );
}