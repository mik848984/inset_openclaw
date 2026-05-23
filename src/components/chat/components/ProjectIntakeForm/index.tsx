'use client';

/**
 * Project Intake Form — модальная анкета первого шага проекта.
 *
 * Цель: собрать недостающие вводные (missingInputs из blueprint) одним
 * понятным экраном вместо «пиши всё в чат». После submit:
 *   1) Ответы превращаются в Markdown и сохраняются как artifact
 *      типа `intake` через POST /api/projects/[id]/artifacts...
 *      Backend сам уйдёт в LLM, чтобы сделать summary анкеты — это
 *      штатное поведение existing route.
 *   2) Параллельно отправляем в чат человеческое сообщение
 *      «Я заполнил анкету, вот что вышло…», чтобы агент сразу видел
 *      ответы и предлагал следующий шаг.
 *
 * Apple-like: solid surface, тонкий hairline, мягкая тень, без glass
 * на content (см. фиксы прошлых сессий с z-index/портals).
 */

import {
  Box,
  Button,
  Flex,
  Icon,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Text,
  Textarea,
  Input,
  useColorModeValue,
  useToast,
  VStack,
} from '@chakra-ui/react';
import React, { useMemo, useState } from 'react';
import { MdAutoAwesome } from 'react-icons/md';
import { projectsService } from '@/services/ui/ProjectsService';

const FONT_DISPLAY = `'SF Pro Display', -apple-system, BlinkMacSystemFont, system-ui, sans-serif`;
const FONT_TEXT = `'SF Pro Text', -apple-system, BlinkMacSystemFont, system-ui, sans-serif`;

const ACCENT_BLUE = '#0066cc';
const ACCENT_BLUE_HOVER = '#0071e3';

// ── Field schema per intake formKind ───────────────────────────
type FieldKind = 'text' | 'textarea' | 'number' | 'select';

interface IntakeField {
  name: string;
  label: string;
  kind: FieldKind;
  placeholder?: string;
  options?: string[];
  required?: boolean;
}

const FORMS: Record<string, { title: string; hint: string; fields: IntakeField[] }> = {
  business: {
    title: 'Анкета идеи бизнеса',
    hint: 'Соберём вводные за 3 минуты — дальше ИИСеть сделает исследование рынка, финмодель и план запуска.',
    fields: [
      { name: 'sphere', label: 'Какой бизнес', kind: 'text', placeholder: 'кофейня, IT-сервис, маркетплейс, …', required: true },
      { name: 'city', label: 'Город / география', kind: 'text', placeholder: 'Москва, онлайн, …' },
      { name: 'budget', label: 'Бюджет на запуск (₽)', kind: 'text', placeholder: 'например, 500 000' },
      { name: 'deadline', label: 'Срок до старта', kind: 'text', placeholder: '3 месяца, к лету, …' },
      { name: 'experience', label: 'Опыт в этой нише', kind: 'textarea', placeholder: 'Кратко опишите релевантный опыт.' },
      { name: 'hours', label: 'Часов в неделю на проект', kind: 'text', placeholder: '10–15 ч' },
      { name: 'targetIncome', label: 'Целевой доход', kind: 'text', placeholder: '200 000 ₽/мес чистыми' },
      { name: 'haves', label: 'Что уже есть', kind: 'textarea', placeholder: 'Команда, помещение, контакты, идея?' },
      { name: 'constraints', label: 'Ключевые ограничения', kind: 'textarea', placeholder: 'Деньги, время, регион, …' },
    ],
  },
  career: {
    title: 'Анкета поиска работы',
    hint: 'Зафиксируем целевую роль, после загрузим резюме и подготовим план.',
    fields: [
      { name: 'targetRole', label: 'Целевая роль', kind: 'text', placeholder: 'Senior Product Manager, …', required: true },
      { name: 'level', label: 'Уровень', kind: 'select', options: ['Junior', 'Middle', 'Senior', 'Lead', 'Head'] },
      { name: 'geo', label: 'География', kind: 'text', placeholder: 'РФ, remote, EU, …' },
      { name: 'deadline', label: 'Срок до выхода', kind: 'text', placeholder: '1–3 месяца' },
      { name: 'salary', label: 'Желаемая зарплата', kind: 'text', placeholder: '350 000 ₽/мес' },
      { name: 'cases', label: 'Сильные кейсы', kind: 'textarea', placeholder: '3–5 примеров, где я дал результат.' },
      { name: 'constraints', label: 'Ограничения', kind: 'textarea', placeholder: 'Город, индустрия, формат, …' },
    ],
  },
  health: {
    title: 'Анкета исходных данных',
    hint: 'Соберём отправную точку — ИИСеть рассчитает калории и составит план под цель.',
    fields: [
      { name: 'gender', label: 'Пол', kind: 'select', options: ['Мужской', 'Женский'] },
      { name: 'age', label: 'Возраст', kind: 'number', placeholder: '30' },
      { name: 'height', label: 'Рост (см)', kind: 'number', placeholder: '178' },
      { name: 'weight', label: 'Текущий вес (кг)', kind: 'number', placeholder: '82' },
      { name: 'targetWeight', label: 'Цель по весу (кг)', kind: 'number', placeholder: '74' },
      { name: 'deadline', label: 'Целевой срок', kind: 'text', placeholder: 'к 1 июня' },
      { name: 'activity', label: 'Уровень активности', kind: 'select', options: ['Низкий', 'Лёгкий (1–2 трен./нед.)', 'Средний (3–4)', 'Высокий (5+)'] },
      { name: 'limitations', label: 'Ограничения по здоровью', kind: 'textarea', placeholder: 'Травмы, хронические, аллергии — что важно учесть.' },
      { name: 'eating', label: 'Питание сейчас', kind: 'textarea', placeholder: 'Кратко: режим, что нравится/не любите.' },
      { name: 'training', label: 'Тренировки сейчас', kind: 'textarea', placeholder: 'Что и как часто.' },
      { name: 'sleep', label: 'Качество сна', kind: 'text', placeholder: '6–7 часов, рваный, …' },
    ],
  },
  academic: {
    title: 'Анкета требований к работе',
    hint: 'Зафиксируем тему, объём, дедлайн и оформление — потом начнём структуру.',
    fields: [
      { name: 'topic', label: 'Тема', kind: 'text', placeholder: 'Влияние ИИ на рынок труда…', required: true },
      { name: 'discipline', label: 'Дисциплина', kind: 'text', placeholder: 'Менеджмент, эконометрика, …' },
      { name: 'pages', label: 'Объём (страниц)', kind: 'text', placeholder: '35–40' },
      { name: 'deadline', label: 'Дедлайн', kind: 'text', placeholder: 'к 15 июня' },
      { name: 'requirements', label: 'Требования / ГОСТ', kind: 'textarea', placeholder: 'Шрифт, межстрочный, ссылки, форматирование…' },
      { name: 'literature', label: 'Список литературы (если есть)', kind: 'textarea', placeholder: 'Можно списком.' },
      { name: 'practical', label: 'Нужна ли практическая часть', kind: 'select', options: ['Да', 'Нет', 'Не уверен'] },
    ],
  },
  general: {
    title: 'Уточнить задачу',
    hint: 'Соберём минимум вводных, чтобы ИИСеть подобрал первые шаги под результат.',
    fields: [
      { name: 'outcome', label: 'Желаемый результат', kind: 'textarea', placeholder: 'Что должно получиться к концу?', required: true },
      { name: 'deadline', label: 'Срок (если есть)', kind: 'text', placeholder: 'через месяц, к лету, …' },
      { name: 'constraints', label: 'Ограничения', kind: 'textarea', placeholder: 'Время, бюджет, доступ, …' },
      { name: 'context', label: 'Контекст', kind: 'textarea', placeholder: 'Что важно знать о ситуации?' },
    ],
  },
};

interface Props {
  projectId: string;
  formKind: string;
  open: boolean;
  onClose: () => void;
  /** После submit вернём сообщение для отправки в чат — родитель пусть решает, что с ним сделать. */
  onSubmitted?: (chatMessage: string) => void;
}

function ProjectIntakeForm({
  projectId,
  formKind,
  open,
  onClose,
  onSubmitted,
}: Props) {
  const toast = useToast();
  const spec = useMemo(() => FORMS[formKind] || FORMS.general, [formKind]);
  const [values, setValues] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const surface = useColorModeValue('#ffffff', '#1c1c1f');
  const hairline = useColorModeValue(
    'rgba(15,23,42,0.08)',
    'rgba(255,255,255,0.10)',
  );
  const inputBg = useColorModeValue('#fafafb', 'rgba(255,255,255,0.04)');
  const textPrimary = useColorModeValue('#1d1d1f', '#f5f5f7');
  const textSecondary = useColorModeValue(
    '#6e6e73',
    'rgba(245,245,247,0.65)',
  );

  const setField = (name: string, v: string) =>
    setValues((prev) => ({ ...prev, [name]: v }));

  const buildMarkdown = (): string => {
    const lines: string[] = [`# ${spec.title}`, ''];
    for (const f of spec.fields) {
      const v = (values[f.name] || '').trim();
      if (!v) continue;
      lines.push(`**${f.label}:** ${v}`);
    }
    return lines.join('\n');
  };

  const buildChatMessage = (): string => {
    const md = buildMarkdown();
    return (
      'Я заполнил анкету проекта. Учти эти вводные и предложи следующий ' +
      'конкретный шаг — а если для шага нужны ещё данные, спроси одним ' +
      'списком, что добавить.\n\n' +
      md
    );
  };

  const handleSubmit = async () => {
    const required = spec.fields.filter((f) => f.required);
    const missing = required.filter((f) => !(values[f.name] || '').trim());
    if (missing.length > 0) {
      toast({
        title: 'Заполните обязательные поля',
        description: missing.map((m) => m.label).join(', '),
        status: 'warning',
        duration: 3500,
        isClosable: true,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // ── 1) Сохраняем как artifact ────────────────────────────
      // Используем существующий artifacts API. Backend сам сделает
      // LLM-summary анкеты и положит в storage. Не критично, если
      // упадёт — продолжим к чату с тем же markdown.
      try {
        await fetch(
          `/api/projects/${encodeURIComponent(projectId)}/artifacts`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'intake' }),
          },
        );
      } catch (e) {
        console.warn('[IntakeForm] artifact save failed', e);
      }

      // ── 2) Сообщение в чат ───────────────────────────────────
      const chatMsg = buildChatMessage();
      onSubmitted?.(chatMsg);

      toast({
        title: 'Анкета сохранена',
        description: 'ИИСеть учтёт её в ответах и в следующих шагах.',
        status: 'success',
        duration: 2500,
        isClosable: true,
      });
      onClose();
      setValues({});
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      isCentered
      size={{ base: 'full', md: 'xl' } as any}
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
        maxW={{ base: 'calc(100vw - 32px)', md: '720px' }}
        maxH={{ base: 'calc(100dvh - 32px)', md: 'calc(100dvh - 80px)' }}
        borderRadius={{ base: '22px', md: '24px' }}
        border="1px solid"
        borderColor={hairline}
        bg={surface}
        boxShadow="0 1px 2px rgba(15,23,42,0.04), 0 32px 64px -16px rgba(15,23,42,0.30)"
        overflow="hidden"
        display="flex"
        flexDirection="column"
      >
        <ModalHeader
          px={{ base: '20px', md: '28px' }}
          pt={{ base: '20px', md: '24px' }}
          pb="4px"
          fontFamily={FONT_DISPLAY}
          fontSize={{ base: '18px', md: '22px' }}
          fontWeight="600"
          letterSpacing="-0.35px"
          color={textPrimary}
        >
          <Flex align="center" gap="10px">
            <Flex
              boxSize="28px"
              borderRadius="8px"
              bg="rgba(0,102,204,0.10)"
              align="center"
              justify="center"
              flexShrink={0}
            >
              <Icon as={MdAutoAwesome} color={ACCENT_BLUE} boxSize="15px" />
            </Flex>
            <Text>{spec.title}</Text>
          </Flex>
        </ModalHeader>
        <ModalCloseButton
          top={{ base: '14px', md: '18px' }}
          right={{ base: '14px', md: '18px' }}
          borderRadius="9999px"
        />
        <ModalBody
          px={{ base: '20px', md: '28px' }}
          pt="10px"
          pb="14px"
          overflowY="auto"
        >
          <Text
            fontFamily={FONT_TEXT}
            fontSize="13px"
            color={textSecondary}
            lineHeight="1.45"
            mb="20px"
          >
            {spec.hint}
          </Text>

          <VStack align="stretch" spacing="14px">
            {spec.fields.map((f) => {
              const v = values[f.name] || '';
              return (
                <Box key={f.name}>
                  <Text
                    as="label"
                    fontFamily={FONT_TEXT}
                    fontSize="12px"
                    fontWeight="600"
                    color={textSecondary}
                    mb="6px"
                    display="block"
                    letterSpacing="0.1px"
                  >
                    {f.label}
                    {f.required && (
                      <Text as="span" color={ACCENT_BLUE} ml="4px">
                        *
                      </Text>
                    )}
                  </Text>
                  {f.kind === 'textarea' ? (
                    <Textarea
                      value={v}
                      onChange={(e) => setField(f.name, e.target.value)}
                      placeholder={f.placeholder}
                      bg={inputBg}
                      border="1px solid"
                      borderColor={hairline}
                      borderRadius="12px"
                      fontFamily={FONT_TEXT}
                      fontSize="14px"
                      color={textPrimary}
                      rows={3}
                      _focus={{
                        borderColor: ACCENT_BLUE,
                        boxShadow: '0 0 0 3px rgba(0,102,204,0.10)',
                      }}
                    />
                  ) : f.kind === 'select' ? (
                    <Select
                      value={v}
                      onChange={(e) => setField(f.name, e.target.value)}
                      placeholder="Выберите…"
                      bg={inputBg}
                      border="1px solid"
                      borderColor={hairline}
                      borderRadius="12px"
                      fontFamily={FONT_TEXT}
                      fontSize="14px"
                      color={textPrimary}
                      _focus={{
                        borderColor: ACCENT_BLUE,
                        boxShadow: '0 0 0 3px rgba(0,102,204,0.10)',
                      }}
                    >
                      {(f.options || []).map((o) => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ))}
                    </Select>
                  ) : (
                    <Input
                      value={v}
                      onChange={(e) => setField(f.name, e.target.value)}
                      placeholder={f.placeholder}
                      type={f.kind === 'number' ? 'number' : 'text'}
                      bg={inputBg}
                      border="1px solid"
                      borderColor={hairline}
                      borderRadius="12px"
                      fontFamily={FONT_TEXT}
                      fontSize="14px"
                      color={textPrimary}
                      _focus={{
                        borderColor: ACCENT_BLUE,
                        boxShadow: '0 0 0 3px rgba(0,102,204,0.10)',
                      }}
                    />
                  )}
                </Box>
              );
            })}
          </VStack>
        </ModalBody>

        <ModalFooter
          px={{ base: '20px', md: '28px' }}
          pt="14px"
          pb={{ base: 'calc(20px + env(safe-area-inset-bottom))', md: '24px' }}
          gap="8px"
          flexWrap="wrap"
          borderTop="1px solid"
          borderColor={hairline}
          bg="transparent"
        >
          <Button
            onClick={onClose}
            bg="transparent"
            color={textPrimary}
            border="1px solid"
            borderColor={hairline}
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
            onClick={handleSubmit}
            isLoading={isSubmitting}
            bg={ACCENT_BLUE}
            color="white"
            borderRadius="9999px"
            h="40px"
            px="20px"
            fontWeight="600"
            fontSize="13px"
            _hover={{ bg: ACCENT_BLUE_HOVER }}
          >
            Сохранить и продолжить
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default ProjectIntakeForm;
