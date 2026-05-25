'use client';

import { ChatAiContext, IMessage } from '@/contexts/ChatAiContext';
import {
  Box,
  Button,
  Collapse,
  Flex,
  Grid,
  Icon,
  IconButton,
  Stack,
  Text,
  useColorModeValue,
  useDisclosure,
  useToast,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from '@chakra-ui/react';
import { MdAutoAwesome } from 'react-icons/md';
import {
  LuChevronDown,
  LuLink,
  LuImages,
  LuSparkles,
  LuLayoutGrid,
  LuTerminal,
  LuClock,
  LuMapPin,
  LuShoppingBag,
  LuGraduationCap,
  LuVideo,
  LuMessageSquare,
  LuInfo,
  LuStar,
  LuExternalLink,
} from 'react-icons/lu';
import { markdown } from '@/services/ui/MarkdownService';
import {
  extractThinkBlocks,
  parseSourcesFromContent,
  ISource,
  SearchImage,
  SearchIntent,
  SearchSummary,
  ComparisonWidget as ComparisonWidgetMeta,
  CodeFixWidget as CodeFixWidgetMeta,
  NewsTimelineItem,
  SearchKnowledgeGraph,
  PeopleAlsoAskItem,
  SearchNewsItem,
  SearchPlaceItem,
  SearchProductItem,
  SearchScholarItem,
  SearchVideoItem,
} from '@/utils/normalizeModelOutput';
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { trackGoal } from '@/utils/metrics';
import { NextAvatar } from '@/components/image/Avatar';
import { useSession } from 'next-auth/react';
import { TbCreditCardPay, TbSettingsDollar } from 'react-icons/tb';
import { ModalContext } from '@/contexts/ModalContext';
import { downloadImage } from '@/utils/downloadImage';
import { HiOutlineDownload } from 'react-icons/hi';
import { useUser } from '@/utils/hooks/useUser';
import Link from 'next/link';
import { PiRepeat, PiSignIn } from 'react-icons/pi';
import { copyTextToClipboard } from '@/utils/copyText';
import { FiMoreVertical } from 'react-icons/fi';

interface IProps {
  message: IMessage;
  isLast: boolean;
}

// Apple-like typography stacks
const FONT_APPLE_TEXT = `'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif`;
const FONT_APPLE_DISPLAY = `'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif`;
const FONT_APPLE_MONO = `'SF Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', monospace`;

function Message({ message, isLast }: IProps) {
  const toast = useToast();
  // Apple-like text colors
  const textPrimary = useColorModeValue('#1d1d1f', '#f5f5f7');
  const textBody = useColorModeValue('#2b2b2f', 'rgba(245,245,247,0.88)');
  const textSecondary = useColorModeValue('#6e6e73', 'rgba(245,245,247,0.62)');
  const limitCardBg = useColorModeValue(
    'rgba(126,89,255,0.06)',
    'rgba(126,89,255,0.10)',
  );
  const limitCardBorder = useColorModeValue(
    'rgba(126,89,255,0.20)',
    'rgba(160,130,255,0.25)',
  );
  const accentPurple = useColorModeValue('#7e59ff', '#9f7fff');
  const textColor = textBody;
  const borderColor = useColorModeValue(
    'rgba(0,0,0,0.08)',
    'rgba(255,255,255,0.10)',
  );
  const borderGlass = useColorModeValue(
    'rgba(255,255,255,0.55)',
    'rgba(255,255,255,0.10)',
  );

  // User bubble — soft glass, Apple Messages-like
  const userBubbleBg = useColorModeValue(
    'rgba(255,255,255,0.62)',
    'rgba(13,18,34,0.62)',
  );
  const userBubbleShadow = useColorModeValue(
    'inset 0 1px 0 rgba(255,255,255,0.62), 0 1px 2px rgba(31,38,70,0.04)',
    'inset 0 1px 0 rgba(255,255,255,0.10), 0 1px 2px rgba(0,0,0,0.25)',
  );

  // Assistant — open text, no heavy panel
  const codeBg = useColorModeValue(
    'rgba(0,0,0,0.04)',
    'rgba(255,255,255,0.06)',
  );
  const preBg = useColorModeValue('#f5f5f7', 'rgba(255,255,255,0.04)');
  const linkColor = useColorModeValue('#0066cc', '#2997ff');
  const blockquoteBorder = useColorModeValue(
    'rgba(0,102,204,0.30)',
    'rgba(41,151,255,0.40)',
  );

  // Avatar gradient — brand purple для assistant
  const assistantAvatarBg =
    'linear-gradient(150deg, #4A25E1 18%, #7B5AFF 82%)';
  const assistantAvatarShadow = useColorModeValue(
    '0 4px 12px rgba(74,37,225,0.20)',
    '0 4px 12px rgba(74,37,225,0.40)',
  );

  // Message menu trigger glass colors — lifted to top to follow rules of hooks
  // (were previously called inside `{message.content && (...)}` conditional)
  const menuBtnBg = useColorModeValue(
    'rgba(255,255,255,0.62)',
    'rgba(13,18,34,0.62)',
  );
  const menuBtnHoverBg = useColorModeValue(
    'rgba(255,255,255,0.85)',
    'rgba(13,18,34,0.85)',
  );

  const { data: session } = useSession();
  const {
    regenerateLastMessage,
    loading,
    webSearch,
    messages,
    setMessages,
    reasoningEnabled,
    sendMessage,
    activeProjectId,
  } = useContext(ChatAiContext);
  const { setTariffModalOpen, setPayBalanceModalOpen } =
    useContext(ModalContext);

  // Reasoning collapsible state — closed by default
  const reasoningDisclosure = useDisclosure({ defaultIsOpen: false });

  // Glass tokens for reasoning block + dots loader
  const reasoningBg = useColorModeValue(
    'rgba(255,255,255,0.62)',
    'rgba(13,18,34,0.58)',
  );
  const reasoningBorder = useColorModeValue(
    'rgba(0,0,0,0.06)',
    'rgba(255,255,255,0.08)',
  );
  const dotsPillBg = useColorModeValue(
    'rgba(255,255,255,0.72)',
    'rgba(15,18,32,0.62)',
  );
  const dotsPillBorder = useColorModeValue(
    'rgba(0,0,0,0.08)',
    'rgba(255,255,255,0.10)',
  );
  const dotsColor = useColorModeValue('#6e6e73', 'rgba(245,245,247,0.66)');

  const { isAnonymous, user, refreshUser } = useUser(false);

  // ── Apple-like markdown styles ──────────────────────────────────
  const markdownSx = {
    width: '100%',
    maxWidth: '100%',
    overflowX: 'auto' as const,
    fontFamily: FONT_APPLE_TEXT,
    // Paragraphs
    '& p': {
      marginBottom: '0.75em',
      lineHeight: 1.7,
      letterSpacing: '-0.01em',
      whiteSpace: 'normal',
      wordBreak: 'break-word' as const,
    },
    '& p:last-child': { marginBottom: 0 },
    // Headings — modest Apple-tight scale
    '& h1': {
      fontFamily: FONT_APPLE_DISPLAY,
      fontSize: { base: '20px', md: '22px' },
      fontWeight: 600,
      lineHeight: 1.2,
      letterSpacing: '-0.4px',
      margin: '1.1em 0 0.4em',
    },
    '& h2': {
      fontFamily: FONT_APPLE_DISPLAY,
      fontSize: { base: '18px', md: '19px' },
      fontWeight: 600,
      lineHeight: 1.25,
      letterSpacing: '-0.3px',
      margin: '1em 0 0.4em',
    },
    '& h3': {
      fontFamily: FONT_APPLE_DISPLAY,
      fontSize: '17px',
      fontWeight: 600,
      lineHeight: 1.3,
      letterSpacing: '-0.2px',
      margin: '0.9em 0 0.35em',
    },
    '& h4, & h5, & h6': {
      fontFamily: FONT_APPLE_DISPLAY,
      fontSize: '15px',
      fontWeight: 600,
      lineHeight: 1.35,
      margin: '0.8em 0 0.3em',
    },
    '& h1:first-of-type, & h2:first-of-type, & h3:first-of-type': {
      marginTop: 0,
    },
    // Inline emphasis
    '& strong, & b': { fontWeight: 600, color: textPrimary },
    '& em, & i': { fontStyle: 'italic' },
    // Lists
    '& ul, & ol': {
      margin: '0.6em 0 0.9em',
      paddingLeft: '1.25em',
    },
    '& li': { marginBottom: '0.3em', lineHeight: 1.65 },
    '& li > p': { marginBottom: '0.3em' },
    // Links
    '& a': {
      color: linkColor,
      textDecoration: 'none',
      borderBottom: '1px solid',
      borderColor: 'currentColor',
      paddingBottom: '1px',
      transition: 'opacity 0.15s ease',
    },
    '& a:hover': { opacity: 0.75 },
    // Inline code
    '& code': {
      fontFamily: FONT_APPLE_MONO,
      fontSize: '0.88em',
      padding: '2px 6px',
      borderRadius: '6px',
      background: codeBg,
      letterSpacing: 0,
    },
    // Code blocks
    '& pre': {
      width: '100%',
      overflowX: 'auto',
      margin: '0.8em 0',
      padding: '14px 16px',
      borderRadius: '12px',
      background: preBg,
      border: '1px solid',
      borderColor: borderColor,
      fontFamily: FONT_APPLE_MONO,
      fontSize: '13px',
      lineHeight: 1.6,
    },
    '& pre code': {
      padding: 0,
      background: 'transparent',
      borderRadius: 0,
      fontSize: 'inherit',
    },
    // Blockquote
    '& blockquote': {
      borderLeft: '3px solid',
      borderColor: blockquoteBorder,
      paddingLeft: '14px',
      margin: '0.8em 0',
      color: textSecondary,
      fontStyle: 'italic',
    },
    // Tables
    '& table': {
      borderCollapse: 'collapse',
      borderSpacing: 0,
      minWidth: '100%',
      margin: '0.8em 0',
    },
    '& th, & td': {
      padding: '6px 10px',
      minWidth: '90px',
      whiteSpace: 'normal',
      wordBreak: 'break-word',
      verticalAlign: 'top',
      borderBottom: '1px solid',
      borderColor: borderColor,
    },
    '& th': { fontWeight: 600, color: textPrimary, textAlign: 'left' as const },
    // HR
    '& hr': {
      border: 'none',
      borderTop: '1px solid',
      borderColor: borderColor,
      margin: '1em 0',
    },
    // Images
    '& img': {
      maxWidth: '100%',
      borderRadius: '12px',
      margin: '0.5em 0',
    },
  };

  const handleRegenerate = async () => {
    if (!regenerateLastMessage || loading) return;

    const currentMessages = messages || [];

    if (webSearch) {
      if (isAnonymous || !user) {
        setMessages?.([
          ...currentMessages,
          { role: 'assistant', content: '__WEB_SEARCH_REGISTER__' },
        ]);
        return;
      }

      const hasActiveSubscription = user?.subscription?.status === 'active';

      if (!hasActiveSubscription) {
        const availableBalance = user?.webSearchBalance ?? 0;

        if (availableBalance <= 0) {
          setMessages?.([
            ...currentMessages,
            { role: 'assistant', content: '__WEB_SEARCH_FREE_LIMIT__' },
          ]);
          return;
        }
      }
    }

    await regenerateLastMessage();

    if (
      webSearch &&
      !isAnonymous &&
      user?.subscription?.status !== 'active'
    ) {
      await refreshUser?.();
    }
  };

  if (message.role === 'assistant') {
    // ── Parse sources marker (Perplexity cards) and reasoning ─────
    // Priority: live `message.*` (during streaming) > marker re-parse from
    // content (after reload). Marker is stripped from visible text.
    const {
      cleanText,
      reasoningText,
      sources,
      images,
      followUps,
      intent,
      summary,
      comparison,
      codeFix,
      newsTimeline,
      knowledgeGraph,
      peopleAlsoAsk,
      news,
      places,
      shopping,
      scholar,
      videos,
    } = useMemo(() => {
      const raw = message.content || '';
      const sourcesParsed = parseSourcesFromContent(raw);

      const liveSources: ISource[] | undefined = (message as any).sources;
      const liveImages: SearchImage[] | undefined = (message as any).images;
      const liveFollowUps: string[] | undefined = (message as any).followUps;
      const liveIntent: SearchIntent | null | undefined = (message as any)
        .intent;
      const liveSummary: SearchSummary | null | undefined = (message as any)
        .summary;
      const liveComparison: ComparisonWidgetMeta | null | undefined = (
        message as any
      ).comparison;
      const liveCodeFix: CodeFixWidgetMeta | null | undefined = (
        message as any
      ).codeFix;
      const liveNewsTimeline: NewsTimelineItem[] | undefined = (
        message as any
      ).newsTimeline;
      const liveKnowledgeGraph: SearchKnowledgeGraph | null | undefined = (
        message as any
      ).knowledgeGraph;
      const livePeopleAlsoAsk: PeopleAlsoAskItem[] | undefined = (
        message as any
      ).peopleAlsoAsk;
      const liveNews: SearchNewsItem[] | undefined = (message as any).news;
      const livePlaces: SearchPlaceItem[] | undefined = (message as any)
        .places;
      const liveShopping: SearchProductItem[] | undefined = (message as any)
        .shopping;
      const liveScholar: SearchScholarItem[] | undefined = (message as any)
        .scholar;
      const liveVideos: SearchVideoItem[] | undefined = (message as any)
        .videos;

      const finalSources: ISource[] =
        liveSources && liveSources.length > 0
          ? liveSources
          : sourcesParsed.sources;
      const finalImages: SearchImage[] =
        liveImages && liveImages.length > 0
          ? liveImages
          : sourcesParsed.images;
      const finalFollowUps: string[] =
        liveFollowUps && liveFollowUps.length > 0
          ? liveFollowUps
          : sourcesParsed.followUps;
      const finalIntent: SearchIntent | null =
        liveIntent !== undefined ? liveIntent : sourcesParsed.intent;
      const finalSummary: SearchSummary | null =
        liveSummary !== undefined ? liveSummary : sourcesParsed.summary;
      const finalComparison: ComparisonWidgetMeta | null =
        liveComparison !== undefined
          ? liveComparison
          : sourcesParsed.comparison;
      const finalCodeFix: CodeFixWidgetMeta | null =
        liveCodeFix !== undefined ? liveCodeFix : sourcesParsed.codeFix;
      const finalNewsTimeline: NewsTimelineItem[] =
        liveNewsTimeline && liveNewsTimeline.length > 0
          ? liveNewsTimeline
          : sourcesParsed.newsTimeline;
      const finalKnowledgeGraph: SearchKnowledgeGraph | null =
        liveKnowledgeGraph !== undefined
          ? liveKnowledgeGraph
          : sourcesParsed.knowledgeGraph;
      const finalPeopleAlsoAsk: PeopleAlsoAskItem[] =
        livePeopleAlsoAsk && livePeopleAlsoAsk.length > 0
          ? livePeopleAlsoAsk
          : sourcesParsed.peopleAlsoAsk;
      const finalNews: SearchNewsItem[] =
        liveNews && liveNews.length > 0 ? liveNews : sourcesParsed.news;
      const finalPlaces: SearchPlaceItem[] =
        livePlaces && livePlaces.length > 0
          ? livePlaces
          : sourcesParsed.places;
      const finalShopping: SearchProductItem[] =
        liveShopping && liveShopping.length > 0
          ? liveShopping
          : sourcesParsed.shopping;
      const finalScholar: SearchScholarItem[] =
        liveScholar && liveScholar.length > 0
          ? liveScholar
          : sourcesParsed.scholar;
      const finalVideos: SearchVideoItem[] =
        liveVideos && liveVideos.length > 0
          ? liveVideos
          : sourcesParsed.videos;

      const withoutSources = sourcesParsed.cleanContent;
      const base = {
        sources: finalSources,
        images: finalImages,
        followUps: finalFollowUps,
        intent: finalIntent,
        summary: finalSummary,
        comparison: finalComparison,
        codeFix: finalCodeFix,
        newsTimeline: finalNewsTimeline,
        knowledgeGraph: finalKnowledgeGraph,
        peopleAlsoAsk: finalPeopleAlsoAsk,
        news: finalNews,
        places: finalPlaces,
        shopping: finalShopping,
        scholar: finalScholar,
        videos: finalVideos,
      };

      if (reasoningEnabled) {
        const ext = extractThinkBlocks(withoutSources);
        return {
          cleanText: ext.cleanText,
          reasoningText: ext.reasoningText,
          ...base,
        };
      }
      return {
        cleanText: withoutSources,
        reasoningText: '',
        ...base,
      };
    }, [
      message.content,
      (message as any).sources,
      (message as any).images,
      (message as any).followUps,
      (message as any).intent,
      (message as any).summary,
      (message as any).comparison,
      (message as any).codeFix,
      (message as any).newsTimeline,
      (message as any).knowledgeGraph,
      (message as any).peopleAlsoAsk,
      (message as any).news,
      (message as any).places,
      (message as any).shopping,
      (message as any).scholar,
      (message as any).videos,
      reasoningEnabled,
    ]);

    return (
      <Flex
        w="100%"
        maxW={{ base: '100%', md: '820px' }}
        mx="auto"
        align={'start'}
        mb={{ base: '16px', md: '20px' }}
        position="relative"
        sx={{
          '@keyframes iisetMsgIn': {
            from: { opacity: 0, transform: 'translateY(2px)' },
            to: { opacity: 1, transform: 'translateY(0)' },
          },
          animation: 'iisetMsgIn 200ms ease-out both',
        }}
      >
        {message.content && (
          <Box
            position="absolute"
            top="-4px"
            right="-2px"
            zIndex={2}
          >
            <Menu>
              <MenuButton
                as={IconButton}
                aria-label="Опции сообщения"
                variant="ghost"
                size="sm"
                icon={<FiMoreVertical />}
                bg={menuBtnBg}
                _hover={{ bg: menuBtnHoverBg }}
                borderRadius="full"
                backdropFilter="blur(14px) saturate(180%)"
                sx={{ WebkitBackdropFilter: 'blur(14px) saturate(180%)' }}
                border="1px solid"
                borderColor={borderGlass}
                boxShadow="0 1px 2px rgba(0,0,0,0.04)"
                w="28px"
                h="28px"
                minW="28px"
              />
              <MenuList>
                <MenuItem
                  onClick={async () => {
                    await copyTextToClipboard(message.content);
                    toast({
                      title: 'Текст скопирован!',
                      position: 'bottom-left',
                      status: 'success',
                      isClosable: true,
                    });
                  }}
                >
                  Скопировать
                </MenuItem>
                <MenuItem
                  onClick={async () => {
                    try {
                      const res = await fetch('/api/chatShare', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                          role: message.role,
                          content: message.content,
                        }),
                      });

                      const data = await res.json();

                      if (!res.ok) {
                        throw new Error(
                          data?.error || 'Не удалось создать ссылку',
                        );
                      }

                      const shareUrl = `${window.location.origin}/chat/share/${data.id}`;

                      try {
                        if (
                          typeof navigator !== 'undefined' &&
                          (navigator as any).share
                        ) {
                          try {
                            await (navigator as any).share({
                              url: shareUrl,
                              title: 'Сообщение из чата ИИСеть',
                              text: 'Поделиться сообщением из чата ИИСеть',
                            });
                          } catch (shareError) {
                            console.warn(
                              'Share cancelled or failed',
                              shareError,
                            );
                          }
                        } else {
                          await copyTextToClipboard(shareUrl);
                        }
                      } catch (copyError) {
                        console.error(copyError);
                      }

                      toast({
                        title: 'Ссылка скопирована',
                        description:
                          'Поделиться сообщением можно по этой ссылке. Она будет доступна в течение 7 дней.',
                        status: 'success',
                        duration: 5000,
                        isClosable: true,
                      });
                    } catch (error: any) {
                      console.error(error);
                      toast({
                        title: 'Ошибка',
                        description:
                          error?.message ||
                          'Не удалось создать ссылку. Попробуйте ещё раз.',
                        status: 'error',
                        duration: 5000,
                        isClosable: true,
                      });
                    }
                  }}
                >
                  Поделиться
                </MenuItem>
                {message.role === 'assistant' && activeProjectId && (
                  <MenuItem
                    onClick={async () => {
                      try {
                        const text = (cleanText || message.content || '')
                          .trim()
                          .slice(0, 2000);
                        if (!text) {
                          toast({
                            title: 'Нечего сохранять',
                            status: 'warning',
                            duration: 2500,
                            isClosable: true,
                          });
                          return;
                        }
                        const res = await fetch(
                          `/api/projects/${encodeURIComponent(
                            activeProjectId,
                          )}/memory`,
                          {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              type: 'note',
                              text,
                            }),
                          },
                        );
                        if (!res.ok) {
                          throw new Error('save failed');
                        }
                        toast({
                          title: 'Добавлено в память проекта',
                          description:
                            'ИИСеть учтёт это в следующих ответах.',
                          status: 'success',
                          duration: 3000,
                          isClosable: true,
                        });
                      } catch (e) {
                        console.error(e);
                        toast({
                          title: 'Не удалось сохранить',
                          description:
                            'Попробуйте ещё раз чуть позже.',
                          status: 'error',
                          duration: 4000,
                          isClosable: true,
                        });
                      }
                    }}
                  >
                    Сохранить в память проекта
                  </MenuItem>
                )}
              </MenuList>
            </Menu>
          </Box>
        )}
        <Flex
          borderRadius="full"
          justify="center"
          align="center"
          bg={assistantAvatarBg}
          boxShadow={assistantAvatarShadow}
          me={{ base: '12px', md: '14px' }}
          h={{ base: '32px', md: '34px' }}
          w={{ base: '32px', md: '34px' }}
          minH={{ base: '32px', md: '34px' }}
          minW={{ base: '32px', md: '34px' }}
          mt="2px"
          flexShrink={0}
        >
          <Icon
            as={MdAutoAwesome}
            width={{ base: '15px', md: '16px' }}
            height={{ base: '15px', md: '16px' }}
            color="white"
          />
        </Flex>
        <Flex w="100%" minW={0}>
          <Grid w="100%" minW={0}>
            {/* Collapsible reasoning block — only shown when the user
                explicitly turned on "Размышление" AND the model produced
                <think> content for THIS message. */}
            {reasoningEnabled && reasoningText && (
              <Box
                mb="10px"
                bg={reasoningBg}
                border="1px solid"
                borderColor={reasoningBorder}
                borderRadius="14px"
                backdropFilter="blur(18px) saturate(180%)"
                sx={{ WebkitBackdropFilter: 'blur(18px) saturate(180%)' }}
                px={{ base: '12px', md: '14px' }}
                py={{ base: '10px', md: '12px' }}
              >
                <Flex
                  as="button"
                  type="button"
                  onClick={reasoningDisclosure.onToggle}
                  align="center"
                  justify="space-between"
                  width="100%"
                  cursor="pointer"
                  bg="transparent"
                  border="none"
                  textAlign="left"
                  p="0"
                >
                  <Box>
                    <Text
                      fontFamily={FONT_APPLE_TEXT}
                      fontSize="13px"
                      fontWeight="600"
                      letterSpacing="-0.15px"
                      color={textPrimary}
                      lineHeight="1.3"
                    >
                      Размышление
                    </Text>
                    <Text
                      fontFamily={FONT_APPLE_TEXT}
                      fontSize="12px"
                      letterSpacing="-0.1px"
                      color={textSecondary}
                      lineHeight="1.3"
                      mt="2px"
                    >
                      Модель сначала набросала ход мысли
                    </Text>
                  </Box>
                  <Icon
                    as={LuChevronDown}
                    w="16px"
                    h="16px"
                    color={textSecondary}
                    transform={
                      reasoningDisclosure.isOpen
                        ? 'rotate(180deg)'
                        : 'rotate(0deg)'
                    }
                    transition="transform 0.18s ease"
                    flexShrink={0}
                    ml="10px"
                  />
                </Flex>
                <Collapse in={reasoningDisclosure.isOpen} animateOpacity>
                  <Box
                    mt="10px"
                    pt="10px"
                    borderTop="1px solid"
                    borderColor={reasoningBorder}
                    fontFamily={FONT_APPLE_TEXT}
                    fontSize="13px"
                    lineHeight="1.6"
                    letterSpacing="-0.05px"
                    color={textSecondary}
                    whiteSpace="pre-wrap"
                    wordBreak="break-word"
                  >
                    {reasoningText}
                  </Box>
                </Collapse>
              </Box>
            )}

            {/* SearchSummaryWidget — рендерится как только marker пришёл,
                ДО полного ответа LLM, чтобы пользователь сразу видел
                полезные данные поиска. */}
            {summary && (
              <SearchSummaryWidget
                summary={summary}
                isStreaming={!cleanText && !!loading}
              />
            )}

            {/* Knowledge Graph — entity card сразу после summary */}
            {knowledgeGraph && (
              <KnowledgeGraphCard data={knowledgeGraph} />
            )}

            {cleanText && (
              <Box
                color={textColor}
                fontFamily={FONT_APPLE_TEXT}
                fontWeight="400"
                fontSize={{ base: '15px', md: '16px' }}
                lineHeight="1.7"
                letterSpacing="-0.01em"
                pt="3px"
                minW={0}
              >
                <Box
                  sx={markdownSx}
                  dangerouslySetInnerHTML={{
                    __html: markdown.markdownItWithPlugins.render(
                      cleanText === '__WEB_SEARCH_REGISTER__' ||
                        cleanText === '__WEB_SEARCH_FREE_LIMIT__' ||
                        cleanText === '__WEB_SEARCH_PRO_LIMIT__'
                        ? ''
                        : cleanText,
                    ),
                  }}
                />
              </Box>
            )}

            {/* Intent-specific widgets — между ответом и SourcesBlock */}
            {cleanText && intent === 'comparison' && comparison && (
              <ComparisonWidgetView data={comparison} />
            )}
            {cleanText && intent === 'code' && codeFix && (
              <CodeFixWidgetView data={codeFix} />
            )}
            {cleanText &&
              intent === 'news' &&
              newsTimeline &&
              newsTimeline.length > 0 && (
                <NewsTimelineWidgetView items={newsTimeline} />
              )}

            {/* v4 specialized blocks — рисуются как только marker дошёл,
                без ожидания полного ответа LLM. */}
            {places && places.length > 0 && (
              <PlacesBlock items={places} />
            )}
            {shopping && shopping.length > 0 && (
              <ShoppingBlock items={shopping} />
            )}
            {videos && videos.length > 0 && (
              <VideoBlock items={videos} />
            )}
            {scholar && scholar.length > 0 && (
              <ScholarBlock items={scholar} />
            )}
            {news && news.length > 0 && (
              <NewsBlock items={news} />
            )}
            {peopleAlsoAsk && peopleAlsoAsk.length > 0 && (
              <PeopleAlsoAskBlock
                items={peopleAlsoAsk}
                onAsk={(q) => {
                  if (!q || loading || !sendMessage) return;
                  sendMessage(q);
                }}
              />
            )}

            {message.content &&
              message.content.startsWith('![image](') && (
                <Flex>
                  <Button
                    mt="12px"
                    onClick={() =>
                      downloadImage(
                        message.content.match(/!\[.*?\]\((.*?)\)/)![1],
                      )
                    }
                    border="1px solid"
                    borderColor={borderColor}
                    rightIcon={
                      <Icon
                        as={HiOutlineDownload}
                        width="20px"
                        height="20px"
                      />
                    }
                  >
                    Скачать изображение
                  </Button>
                </Flex>
              )}

            {(message.content &&
              (message.content.startsWith('Ваш баланс для ') ||
                message.content.startsWith('Бесплатный лимит') ||
                message.content === '__WEB_SEARCH_REGISTER__' ||
                message.content === '__WEB_SEARCH_FREE_LIMIT__' ||
                message.content === '__WEB_SEARCH_PRO_LIMIT__')) && (
              <Grid gap="12px" mt="12px">
                {(message.content.startsWith('Ваш баланс для ') ||
                  message.content.startsWith('Бесплатный лимит')) && (
                  <Flex
                    gap="12px"
                    mt="12px"
                    direction={{ base: 'column', md: 'row' }}
                  >
                    <Button
                      onClick={() => setPayBalanceModalOpen!(true)}
                      border="1px solid"
                      borderColor={borderColor}
                      rightIcon={
                        <Icon
                          as={TbCreditCardPay}
                          width="20px"
                          height="20px"
                        />
                      }
                    >
                      Пополнить баланс
                    </Button>
                    <Button
                      onClick={() => setTariffModalOpen!(true)}
                      bg="#422AFB"
                      color="white"
                      _hover={{ bg: '#3311DB' }}
                      rightIcon={
                        <Icon
                          as={TbSettingsDollar}
                          width="20px"
                          height="20px"
                        />
                      }
                    >
                      Оформить Premium — 249 ₽/мес
                    </Button>
                  </Flex>
                )}

                {isAnonymous &&
                  (message.content.startsWith('Ваш баланс для ') ||
                    message.content.startsWith('Бесплатный лимит')) && (
                    <Grid mt="12px" gap="14px">
                      <div>
                        Авторизуйтесь и получите GPT-4o, Claude и Gemini на русском + веб-поиск со ссылками на источники. Без VPN. 🔥
                      </div>
                      <Link
                        style={{ width: '100%' }}
                        href="/others/sign-in"
                      >
                        <Button
                          border="1px solid"
                          borderColor={borderColor}
                          mb={'5'}
                          onClick={() =>
                            trackGoal('balance_prompt_signup_click', {
                              source: 'chat_limit_message',
                            })
                          }
                          rightIcon={
                            <Icon
                              as={PiSignIn}
                              width="20px"
                              height="20px"
                            />
                          }
                        >
                          Авторизоваться
                        </Button>
                      </Link>
                    </Grid>
                  )}

                {message.content === '__WEB_SEARCH_REGISTER__' && (
                  <Grid mt="12px" gap="12px">
                    <div>
                      Веб-поиск доступен только при регистрации. Зарегистрируйтесь, это бесплатно!
                    </div>
                    <Link
                      style={{ width: '100%' }}
                      href="/others/sign-in"
                    >
                      <Button
                        border="1px solid"
                        borderColor={borderColor}
                        mb={'5'}
                        onClick={() =>
                          trackGoal('web_search_register_signup_click', {
                            source: 'chat_limit_message',
                          })
                        }
                        rightIcon={
                          <Icon
                            as={PiSignIn}
                            width="20px"
                            height="20px"
                          />
                        }
                      >
                        Зарегистрироваться
                      </Button>
                    </Link>
                  </Grid>
                )}

                {message.content === '__WEB_SEARCH_FREE_LIMIT__' && (
                  <Grid
                    mt="12px"
                    gap="12px"
                    p="16px"
                    borderRadius="16px"
                    border="1px solid"
                    borderColor={limitCardBorder}
                    bg={limitCardBg}
                  >
                    <Text
                      fontSize="15px"
                      fontWeight="600"
                      color={textPrimary}
                      lineHeight="1.3"
                    >
                      Поиск в интернете без ограничений
                    </Text>
                    <Text
                      fontSize="14px"
                      color={textSecondary}
                      lineHeight="1.5"
                    >
                      С Premium вы получаете 100 поисковых запросов в месяц +
                      GPT-4o, генерацию изображений и другие возможности. Всё за{' '}
                      249 ₽/мес.
                    </Text>
                    <Button
                      onClick={() => {
                        trackGoal('web_search_limit_upgrade_click', {
                          source: 'chat_limit_message',
                          grade: user?.subscription?.grade || 'start',
                        });
                        setTariffModalOpen!(true);
                      }}
                      bg={accentPurple}
                      color="white"
                      borderRadius="12px"
                      fontSize="14px"
                      fontWeight="600"
                      py="14px"
                      _hover={{ opacity: 0.92 }}
                      _active={{ transform: 'scale(0.98)' }}
                      transition="opacity 0.14s ease, transform 0.12s ease"
                      rightIcon={
                        <Icon
                          as={TbSettingsDollar}
                          width="18px"
                          height="18px"
                        />
                      }
                    >
                      Перейти на Premium — 249 ₽/мес
                    </Button>
                    <Text
                      fontSize="12px"
                      color={textSecondary}
                      textAlign="center"
                    >
                      Отмена в любой момент · Без скрытых платежей
                    </Text>
                  </Grid>
                )}

                {message.content === '__WEB_SEARCH_PRO_LIMIT__' && (
                  <Grid mt="12px" gap="12px">
                    <div>
                      На этот месяц попытки веб-поиска закончились. Лимит
                      обновится в начале следующего месяца 💫
                    </div>
                  </Grid>
                )}
              </Grid>
            )}

            {/* Apple-style premium thinking indicator.
                If webSearch is ON, cycle Perplexity-like phase statuses.
                Otherwise show neutral "Думаю…". */}
            {!cleanText && isLast && loading && (
              <Box mt="8px">
                {webSearch ? (
                  <WebSearchProgress
                    pillBg={dotsPillBg}
                    pillBorder={dotsPillBorder}
                    dotsColor={dotsColor}
                    textPrimary={textPrimary}
                  />
                ) : (
                  <ThinkingPill
                    pillBg={dotsPillBg}
                    pillBorder={dotsPillBorder}
                    dotsColor={dotsColor}
                    label="Думаю…"
                  />
                )}
              </Box>
            )}

            {/* Source cards / image strip / follow-ups under the answer */}
            {((sources && sources.length > 0) ||
              (images && images.length > 0) ||
              (followUps && followUps.length > 0)) &&
              cleanText && (
                <SourcesBlock
                  sources={sources}
                  images={images}
                  followUps={followUps}
                  onFollowUp={(q) => {
                    if (!q || loading || !sendMessage) return;
                    sendMessage(q);
                  }}
                />
              )}

            {!loading && isLast && (
              <Box>
                <Button
                  mt="20px"
                  onClick={handleRegenerate}
                  bg={dotsPillBg}
                  border="1px solid"
                  borderColor={dotsPillBorder}
                  backdropFilter="blur(16px) saturate(180%)"
                  sx={{
                    WebkitBackdropFilter: 'blur(16px) saturate(180%)',
                  }}
                  borderRadius="9999px"
                  h={{ base: '38px', md: '40px' }}
                  px={{ base: '14px', md: '16px' }}
                  fontFamily={FONT_APPLE_TEXT}
                  fontSize={{ base: '13px', md: '14px' }}
                  fontWeight="500"
                  letterSpacing="-0.15px"
                  color={textPrimary}
                  rightIcon={
                    <Icon
                      as={PiRepeat}
                      width="15px"
                      height="15px"
                      color={textSecondary}
                    />
                  }
                  _hover={{
                    borderColor: 'rgba(0,102,204,0.28)',
                    transform: 'translateY(-1px)',
                    color: '#0066cc',
                  }}
                  _active={{ transform: 'scale(0.98)' }}
                  transition="border-color 0.16s ease, transform 0.12s ease, color 0.16s ease"
                >
                  Повторить ответ
                </Button>
              </Box>
            )}
          </Grid>
        </Flex>
      </Flex>
    );
  }

  if (message.role === 'user') {
    return (
      <Flex
        w="100%"
        maxW={{ base: '100%', md: '820px' }}
        mx="auto"
        align="start"
        mb={{ base: '16px', md: '20px' }}
        minW={0}
      >
        {/* User avatar — compact, no extra ring */}
        <Flex
          borderRadius="full"
          justify="center"
          align="center"
          bg="transparent"
          border="1px solid"
          borderColor={borderGlass}
          me={{ base: '12px', md: '14px' }}
          h={{ base: '32px', md: '34px' }}
          w={{ base: '32px', md: '34px' }}
          minH={{ base: '32px', md: '34px' }}
          minW={{ base: '32px', md: '34px' }}
          mt="2px"
          flexShrink={0}
          overflow="hidden"
        >
          <NextAvatar
            src={session?.user?.image!}
            w={{ base: '32px', md: '34px' }}
            h={{ base: '32px', md: '34px' }}
          />
        </Flex>

        {/* User bubble — soft Apple glass */}
        <Box
          flex="1 1 0"
          minW={0}
          maxWidth="100%"
          bg={userBubbleBg}
          backdropFilter="blur(18px) saturate(180%)"
          border="1px solid"
          borderColor={borderGlass}
          borderRadius={{ base: '18px 18px 18px 6px', md: '20px 20px 20px 6px' }}
          boxShadow={userBubbleShadow}
          px={{ base: '14px', md: '18px' }}
          py={{ base: '11px', md: '13px' }}
          color={textColor}
          fontFamily={FONT_APPLE_TEXT}
          fontWeight="400"
          fontSize={{ base: '15px', md: '15.5px' }}
          lineHeight={{ base: '1.65', md: '1.7' }}
          letterSpacing="-0.01em"
          sx={{
            WebkitBackdropFilter: 'blur(18px) saturate(180%)',
            width: '100%',
            overflowX: 'auto',
            // Compact paragraph rhythm для user-сообщения
            '& p': {
              whiteSpace: 'normal',
              wordBreak: 'break-word',
              marginBottom: '0.45em',
              fontWeight: 'inherit',
              fontSize: 'inherit',
              lineHeight: 'inherit',
            },
            '& p:last-child': { marginBottom: 0 },
            '& strong, & b': { fontWeight: 600 },
            '& em, & i': { fontStyle: 'italic' },
            '& a': {
              color: linkColor,
              textDecoration: 'none',
              borderBottom: '1px solid currentColor',
              paddingBottom: '1px',
            },
            '& code': {
              fontFamily: FONT_APPLE_MONO,
              fontSize: '0.88em',
              padding: '2px 5px',
              borderRadius: '5px',
              background: codeBg,
              whiteSpace: 'pre',
            },
            '& pre': {
              width: '100%',
              overflowX: 'auto',
              margin: '0.5em 0',
              padding: '10px 12px',
              borderRadius: '10px',
              background: preBg,
              fontFamily: FONT_APPLE_MONO,
              fontSize: '13px',
            },
            '& pre code': {
              padding: 0,
              background: 'transparent',
              borderRadius: 0,
            },
            '& ul, & ol': {
              margin: '0.4em 0',
              paddingLeft: '1.2em',
            },
            '& li': { marginBottom: '0.2em' },
            '& table': {
              borderCollapse: 'collapse',
              borderSpacing: 0,
              width: 'max-content',
              maxWidth: '100%',
              margin: '0.5em 0',
            },
            '& th, & td': {
              padding: '4px 8px',
              whiteSpace: 'nowrap',
              verticalAlign: 'top',
              borderWidth: '1px',
              borderStyle: 'solid',
              borderColor: borderColor,
            },
          }}
          dangerouslySetInnerHTML={{
            __html: markdown.markdownItWithPlugins.render(message.content),
          }}
        />
      </Flex>
    );
  }

  return null;
}

// ──────────────────────────────────────────────────────────────────
// ThinkingPill — neutral "Думаю…" Apple glass pill with 3 staggered dots
// ──────────────────────────────────────────────────────────────────
interface ThinkingPillProps {
  pillBg: string;
  pillBorder: string;
  dotsColor: string;
  label: string;
}

function ThinkingPill({
  pillBg,
  pillBorder,
  dotsColor,
  label,
}: ThinkingPillProps) {
  return (
    <Flex
      align="center"
      gap="10px"
      px="14px"
      py="8px"
      bg={pillBg}
      border="1px solid"
      borderColor={pillBorder}
      borderRadius="9999px"
      backdropFilter="blur(18px) saturate(180%)"
      sx={{
        WebkitBackdropFilter: 'blur(18px) saturate(180%)',
        '@keyframes iisetThinkingDot': {
          '0%, 80%, 100%': { opacity: 0.25, transform: 'scale(0.85)' },
          '40%': { opacity: 1, transform: 'scale(1)' },
        },
      }}
      maxWidth="100%"
      minWidth={0}
      display="inline-flex"
      width="fit-content"
    >
      <Flex gap="4px" align="center">
        {[0, 1, 2].map((i) => (
          <Box
            key={i}
            w="6px"
            h="6px"
            borderRadius="9999px"
            bg={dotsColor}
            sx={{
              animation: `iisetThinkingDot 1.2s ease-in-out ${
                i * 0.16
              }s infinite`,
            }}
          />
        ))}
      </Flex>
      <Text
        fontFamily={FONT_APPLE_TEXT}
        fontSize="13px"
        fontWeight="500"
        letterSpacing="-0.1px"
        color={dotsColor}
        whiteSpace="nowrap"
      >
        {label}
      </Text>
    </Flex>
  );
}

// ──────────────────────────────────────────────────────────────────
// WebSearchProgress — Perplexity-like staged loader.
// Cycles through 4 phases via timer. Replaces the indicator the moment
// the first token of the answer arrives (parent controls visibility).
// ──────────────────────────────────────────────────────────────────
const WEB_SEARCH_PHASES = [
  'Ищу источники…',
  'Отбираю релевантные материалы…',
  'Читаю найденные страницы…',
  'Собираю ответ с источниками…',
];

interface WebSearchProgressProps {
  pillBg: string;
  pillBorder: string;
  dotsColor: string;
  textPrimary: string;
}

function WebSearchProgress({
  pillBg,
  pillBorder,
  dotsColor,
  textPrimary,
}: WebSearchProgressProps) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setPhase((p) => (p + 1 < WEB_SEARCH_PHASES.length ? p + 1 : p));
    }, 1100);
    return () => window.clearInterval(id);
  }, []);

  return (
    <Flex
      align="center"
      gap="10px"
      px="14px"
      py="9px"
      bg={pillBg}
      border="1px solid"
      borderColor={pillBorder}
      borderRadius="9999px"
      backdropFilter="blur(18px) saturate(180%)"
      sx={{
        WebkitBackdropFilter: 'blur(18px) saturate(180%)',
        '@keyframes iisetThinkingDot': {
          '0%, 80%, 100%': { opacity: 0.25, transform: 'scale(0.85)' },
          '40%': { opacity: 1, transform: 'scale(1)' },
        },
      }}
      maxWidth="100%"
      minWidth={0}
      display="inline-flex"
      width="fit-content"
    >
      <Flex gap="4px" align="center">
        {[0, 1, 2].map((i) => (
          <Box
            key={i}
            w="6px"
            h="6px"
            borderRadius="9999px"
            bg={dotsColor}
            sx={{
              animation: `iisetThinkingDot 1.2s ease-in-out ${
                i * 0.16
              }s infinite`,
            }}
          />
        ))}
      </Flex>
      <Text
        fontFamily={FONT_APPLE_TEXT}
        fontSize="13px"
        fontWeight="500"
        letterSpacing="-0.1px"
        color={textPrimary}
        sx={{
          transition: 'opacity 0.3s ease',
        }}
      >
        {WEB_SEARCH_PHASES[phase]}
      </Text>
    </Flex>
  );
}

// ──────────────────────────────────────────────────────────────────
// SourcesBlock — Perplexity-like search result block under the answer.
//
// Sections (each rendered only if non-empty):
//   1. "Ответ с источниками · N источников" badge
//   2. Sources cards (responsive grid: 1 col mobile, 2 cols desktop)
//   3. "Визуальные материалы" — horizontal image strip (mobile-safe)
//   4. "Можно уточнить" — follow-up chips, click → sendMessage(q)
// ──────────────────────────────────────────────────────────────────
interface SourcesBlockProps {
  sources?: ISource[];
  images?: SearchImage[];
  followUps?: string[];
  onFollowUp?: (q: string) => void;
}

function ruMaterialNoun(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 14) return 'источников';
  if (mod10 === 1) return 'источник';
  if (mod10 >= 2 && mod10 <= 4) return 'источника';
  return 'источников';
}

function SourcesBlock({
  sources = [],
  images = [],
  followUps = [],
  onFollowUp,
}: SourcesBlockProps) {
  const cardBg = useColorModeValue(
    'rgba(255,255,255,0.66)',
    'rgba(15,18,32,0.58)',
  );
  const cardBgHover = useColorModeValue(
    'rgba(255,255,255,0.84)',
    'rgba(15,18,32,0.78)',
  );
  const cardBorder = useColorModeValue(
    'rgba(0,0,0,0.07)',
    'rgba(255,255,255,0.10)',
  );
  const cardBorderHover = useColorModeValue(
    'rgba(0,102,204,0.28)',
    'rgba(41,151,255,0.34)',
  );
  const titleColor = useColorModeValue('#1d1d1f', '#f5f5f7');
  const metaColor = useColorModeValue('#6e6e73', 'rgba(245,245,247,0.62)');
  const snippetColor = useColorModeValue(
    '#3c3c43',
    'rgba(245,245,247,0.72)',
  );
  const accentBlue = useColorModeValue('#0066cc', '#2997ff');
  const indexPillBg = useColorModeValue(
    'rgba(0,102,204,0.08)',
    'rgba(41,151,255,0.14)',
  );

  // Badge pill colors (subtle blue tint)
  const badgeBg = useColorModeValue(
    'rgba(0,102,204,0.08)',
    'rgba(41,151,255,0.14)',
  );

  // Follow-up chips
  const chipBg = useColorModeValue(
    'rgba(0,102,204,0.06)',
    'rgba(41,151,255,0.10)',
  );
  const chipBgHover = useColorModeValue(
    'rgba(0,102,204,0.14)',
    'rgba(41,151,255,0.22)',
  );
  const chipBorder = useColorModeValue(
    'rgba(0,102,204,0.18)',
    'rgba(41,151,255,0.22)',
  );

  const hasSources = sources.length > 0;
  const hasImages = images.length > 0;
  const hasFollowUps = followUps.length > 0;

  if (!hasSources && !hasImages && !hasFollowUps) return null;

  return (
    <Box mt="20px" width="100%" maxWidth="100%" minWidth={0}>
      {/* "Ответ с источниками · N источников" badge */}
      {hasSources && (
        <Flex align="center" gap="8px" mb="10px" flexWrap="wrap">
          <Flex
            align="center"
            gap="6px"
            px="10px"
            py="4px"
            borderRadius="9999px"
            bg={badgeBg}
          >
            <Icon as={LuLink} w="12px" h="12px" color={accentBlue} />
            <Text
              fontFamily={FONT_APPLE_TEXT}
              fontSize="11px"
              fontWeight="600"
              letterSpacing="-0.05px"
              color={accentBlue}
            >
              Ответ с источниками
            </Text>
          </Flex>
          <Text
            fontFamily={FONT_APPLE_TEXT}
            fontSize="11px"
            fontWeight="500"
            letterSpacing="-0.05px"
            color={metaColor}
          >
            · {sources.length} {ruMaterialNoun(sources.length)}
          </Text>
        </Flex>
      )}

      {/* Sources cards grid */}
      {hasSources && (
        <Box
          display="grid"
          gridTemplateColumns={{
            base: '1fr',
            md: 'repeat(2, minmax(0, 1fr))',
          }}
          gap={{ base: '8px', md: '10px' }}
          width="100%"
          minWidth={0}
        >
          {sources.map((s) => (
            <Box
              key={`${s.index ?? 0}-${s.url}`}
              as="a"
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              display="block"
              bg={cardBg}
              backdropFilter="blur(16px) saturate(180%)"
              sx={{ WebkitBackdropFilter: 'blur(16px) saturate(180%)' }}
              border="1px solid"
              borderColor={cardBorder}
              borderRadius={{ base: '16px', md: '18px' }}
              p={{ base: '12px', md: '14px' }}
              textDecoration="none"
              transition="background 0.16s ease, border-color 0.16s ease, transform 0.14s ease"
              _hover={{
                bg: cardBgHover,
                borderColor: cardBorderHover,
                transform: 'translateY(-1px)',
              }}
              width="100%"
              maxWidth="100%"
              minWidth={0}
            >
              <Flex align="center" gap="6px" mb="6px" minWidth={0}>
                {typeof s.index === 'number' && (
                  <Flex
                    align="center"
                    justify="center"
                    w="18px"
                    h="18px"
                    minW="18px"
                    borderRadius="9999px"
                    bg={indexPillBg}
                    flexShrink={0}
                  >
                    <Text
                      fontFamily={FONT_APPLE_TEXT}
                      fontSize="10px"
                      fontWeight="600"
                      color={accentBlue}
                      letterSpacing="-0.05px"
                    >
                      {s.index}
                    </Text>
                  </Flex>
                )}
                {s.domain && (
                  <Text
                    fontFamily={FONT_APPLE_TEXT}
                    fontSize="11px"
                    fontWeight="500"
                    letterSpacing="-0.1px"
                    color={metaColor}
                    noOfLines={1}
                  >
                    {s.domain}
                  </Text>
                )}
              </Flex>
              <Text
                fontFamily={FONT_APPLE_TEXT}
                fontSize={{ base: '13px', md: '14px' }}
                fontWeight="600"
                lineHeight="1.35"
                letterSpacing="-0.15px"
                color={titleColor}
                noOfLines={2}
                mb={s.snippet ? '4px' : '0'}
                wordBreak="break-word"
              >
                {s.title}
              </Text>
              {s.snippet && (
                <Text
                  fontFamily={FONT_APPLE_TEXT}
                  fontSize="12px"
                  lineHeight="1.45"
                  letterSpacing="-0.05px"
                  color={snippetColor}
                  noOfLines={2}
                >
                  {s.snippet}
                </Text>
              )}
            </Box>
          ))}
        </Box>
      )}

      {/* Image strip — Визуальные материалы */}
      {hasImages && (
        <Box mt={hasSources ? '16px' : '0'}>
          <Flex align="center" gap="6px" mb="10px">
            <Icon as={LuImages} w="13px" h="13px" color={metaColor} />
            <Text
              fontFamily={FONT_APPLE_TEXT}
              fontSize="11px"
              fontWeight="600"
              letterSpacing="0.5px"
              textTransform="uppercase"
              color={metaColor}
            >
              Визуальные материалы
            </Text>
          </Flex>
          <Flex
            gap={{ base: '8px', md: '10px' }}
            overflowX="auto"
            pb="6px"
            mx={{ base: '-4px', md: '0' }}
            px={{ base: '4px', md: '0' }}
            width="100%"
            maxWidth="100%"
            minWidth={0}
            sx={{
              scrollbarWidth: 'thin',
              '::-webkit-scrollbar': { height: '6px' },
              '::-webkit-scrollbar-thumb': {
                background: 'rgba(127,127,127,0.25)',
                borderRadius: '999px',
              },
              scrollSnapType: 'x proximity',
            }}
          >
            {images.map((img, i) => (
              <Box
                key={`${img.imageUrl}-${i}`}
                as="a"
                href={img.sourceUrl || img.imageUrl}
                target="_blank"
                rel="noopener noreferrer"
                flexShrink={0}
                w={{ base: '160px', md: '200px' }}
                h={{ base: '110px', md: '130px' }}
                borderRadius={{ base: '14px', md: '16px' }}
                border="1px solid"
                borderColor={cardBorder}
                position="relative"
                overflow="hidden"
                bg={cardBg}
                sx={{
                  scrollSnapAlign: 'start',
                  textDecoration: 'none',
                  transition: 'transform 0.14s ease, border-color 0.16s ease',
                }}
                _hover={{
                  transform: 'translateY(-1px)',
                  borderColor: cardBorderHover,
                }}
                display="block"
              >
                <Box
                  as="img"
                  src={img.imageUrl}
                  alt={img.title || img.domain || ''}
                  loading="lazy"
                  w="100%"
                  h="100%"
                  sx={{ objectFit: 'cover', display: 'block' }}
                  onError={(e: any) => {
                    const wrapper = e?.currentTarget?.parentElement as
                      | HTMLElement
                      | undefined;
                    if (wrapper) wrapper.style.display = 'none';
                  }}
                />
                {(img.domain || img.title) && (
                  <Box
                    position="absolute"
                    left="8px"
                    bottom="8px"
                    px="8px"
                    py="3px"
                    borderRadius="9999px"
                    bg="rgba(0,0,0,0.55)"
                    color="white"
                    fontFamily={FONT_APPLE_TEXT}
                    fontSize="10px"
                    fontWeight="600"
                    letterSpacing="-0.05px"
                    maxWidth="calc(100% - 16px)"
                    overflow="hidden"
                    textOverflow="ellipsis"
                    whiteSpace="nowrap"
                    sx={{
                      backdropFilter: 'blur(8px)',
                      WebkitBackdropFilter: 'blur(8px)',
                    }}
                  >
                    {img.domain || img.title}
                  </Box>
                )}
              </Box>
            ))}
          </Flex>
        </Box>
      )}

      {/* Follow-up chips — Можно уточнить */}
      {hasFollowUps && (
        <Box mt={hasSources || hasImages ? '16px' : '0'}>
          <Flex align="center" gap="6px" mb="10px">
            <Icon as={LuSparkles} w="13px" h="13px" color={metaColor} />
            <Text
              fontFamily={FONT_APPLE_TEXT}
              fontSize="11px"
              fontWeight="600"
              letterSpacing="0.5px"
              textTransform="uppercase"
              color={metaColor}
            >
              Можно уточнить
            </Text>
          </Flex>
          <Flex gap="8px" flexWrap="wrap" minWidth={0}>
            {followUps.map((q, i) => (
              <Box
                key={`${i}-${q}`}
                as="button"
                type="button"
                onClick={() => onFollowUp?.(q)}
                px="14px"
                py="8px"
                borderRadius="9999px"
                border="1px solid"
                borderColor={chipBorder}
                bg={chipBg}
                color={accentBlue}
                fontFamily={FONT_APPLE_TEXT}
                fontSize="13px"
                fontWeight="500"
                letterSpacing="-0.1px"
                lineHeight="1.2"
                textAlign="left"
                cursor="pointer"
                maxWidth="100%"
                whiteSpace="normal"
                wordBreak="break-word"
                sx={{
                  transition:
                    'background 0.14s ease, border-color 0.14s ease, transform 0.12s ease',
                }}
                _hover={{
                  bg: chipBgHover,
                  borderColor: 'rgba(0,102,204,0.42)',
                }}
                _active={{ transform: 'scale(0.98)' }}
              >
                {q}
              </Box>
            ))}
          </Flex>
        </Box>
      )}
    </Box>
  );
}

// ──────────────────────────────────────────────────────────────────
//  v3 search widgets — used for advanced web-search responses.
//  Each widget is graceful: if data is empty, it renders null. Designs
//  share the same Apple/glass tokens as SourcesBlock and WebSearchProgress.
// ──────────────────────────────────────────────────────────────────

const INTENT_LABELS: Record<SearchIntent, string> = {
  general: 'Поиск',
  news: 'Новости',
  comparison: 'Сравнение',
  code: 'Код',
  weather: 'Погода',
  places: 'Места',
  shopping: 'Покупки',
  image: 'Изображения',
  video: 'Видео',
  scholar: 'Наука',
};

interface SearchSummaryWidgetProps {
  summary: SearchSummary;
  isStreaming?: boolean;
}

function SearchSummaryWidget({
  summary,
  isStreaming = false,
}: SearchSummaryWidgetProps) {
  const cardBg = useColorModeValue(
    'rgba(255,255,255,0.72)',
    'rgba(15,18,32,0.60)',
  );
  const cardBorder = useColorModeValue(
    'rgba(0,0,0,0.07)',
    'rgba(255,255,255,0.10)',
  );
  const titleColor = useColorModeValue('#1d1d1f', '#f5f5f7');
  const metaColor = useColorModeValue('#6e6e73', 'rgba(245,245,247,0.62)');
  const accentBlue = useColorModeValue('#0066cc', '#2997ff');
  const chipBg = useColorModeValue(
    'rgba(0,102,204,0.08)',
    'rgba(41,151,255,0.14)',
  );
  const chipBorder = useColorModeValue(
    'rgba(0,102,204,0.18)',
    'rgba(41,151,255,0.22)',
  );

  const intentLabel =
    INTENT_LABELS[summary.intent] || INTENT_LABELS.general;

  return (
    <Box
      mt="6px"
      mb="14px"
      p={{ base: '12px 14px', md: '14px 18px' }}
      borderRadius={{ base: '16px', md: '18px' }}
      bg={cardBg}
      border="1px solid"
      borderColor={cardBorder}
      backdropFilter="blur(18px) saturate(180%)"
      sx={{ WebkitBackdropFilter: 'blur(18px) saturate(180%)' }}
      width="100%"
      maxWidth="100%"
      minWidth={0}
    >
      <Flex
        align="center"
        gap="8px"
        flexWrap="wrap"
        minW={0}
        mb={
          summary.domains.length > 0 || summary.readSources > 0
            ? '8px'
            : '0'
        }
      >
        <Box
          px="10px"
          py="3px"
          borderRadius="9999px"
          bg={chipBg}
          color={accentBlue}
          border="1px solid"
          borderColor={chipBorder}
        >
          <Text
            fontFamily={FONT_APPLE_TEXT}
            fontSize="11px"
            fontWeight="700"
            letterSpacing="0.1px"
            textTransform="uppercase"
          >
            Поиск с источниками
          </Text>
        </Box>
        <Text
          fontFamily={FONT_APPLE_TEXT}
          fontSize="12px"
          fontWeight="600"
          color={titleColor}
        >
          {intentLabel}
        </Text>
        {summary.totalSources > 0 && (
          <Text
            fontFamily={FONT_APPLE_TEXT}
            fontSize="12px"
            color={metaColor}
          >
            · Найдено {summary.totalSources}
          </Text>
        )}
        {summary.readSources > 0 && (
          <Text
            fontFamily={FONT_APPLE_TEXT}
            fontSize="12px"
            color={metaColor}
          >
            · Прочитано {summary.readSources}
          </Text>
        )}
      </Flex>

      {summary.domains.length > 0 && (
        <Flex gap="6px" flexWrap="wrap" minW={0}>
          {summary.domains.slice(0, 8).map((d) => (
            <Box
              key={d}
              px="8px"
              py="3px"
              borderRadius="9999px"
              border="1px solid"
              borderColor={cardBorder}
              maxW="100%"
            >
              <Text
                fontFamily={FONT_APPLE_TEXT}
                fontSize="11px"
                fontWeight="500"
                color={metaColor}
                noOfLines={1}
                wordBreak="break-all"
              >
                {d}
              </Text>
            </Box>
          ))}
        </Flex>
      )}

      {/* Subtle indicator: marker уже пришёл, но LLM ещё стримит ответ. */}
      {isStreaming && (
        <Flex
          mt="10px"
          align="center"
          gap="8px"
          width="fit-content"
          maxWidth="100%"
          px="10px"
          py="4px"
          borderRadius="9999px"
          bg={chipBg}
          border="1px solid"
          borderColor={chipBorder}
          sx={{
            '@keyframes iisetSummaryDot': {
              '0%, 80%, 100%': {
                opacity: 0.25,
                transform: 'scale(0.85)',
              },
              '40%': { opacity: 1, transform: 'scale(1)' },
            },
          }}
        >
          <Flex gap="3px" align="center">
            {[0, 1, 2].map((i) => (
              <Box
                key={i}
                w="5px"
                h="5px"
                borderRadius="9999px"
                bg={accentBlue}
                sx={{
                  animation: `iisetSummaryDot 1.2s ease-in-out ${
                    i * 0.16
                  }s infinite`,
                }}
              />
            ))}
          </Flex>
          <Text
            fontFamily={FONT_APPLE_TEXT}
            fontSize="11px"
            fontWeight="600"
            color={accentBlue}
          >
            Собираю ответ с источниками…
          </Text>
        </Flex>
      )}
    </Box>
  );
}

interface ComparisonWidgetViewProps {
  data: ComparisonWidgetMeta;
}

function ComparisonWidgetView({ data }: ComparisonWidgetViewProps) {
  const cardBg = useColorModeValue(
    'rgba(255,255,255,0.66)',
    'rgba(15,18,32,0.58)',
  );
  const cardBorder = useColorModeValue(
    'rgba(0,0,0,0.07)',
    'rgba(255,255,255,0.10)',
  );
  const titleColor = useColorModeValue('#1d1d1f', '#f5f5f7');
  const metaColor = useColorModeValue('#6e6e73', 'rgba(245,245,247,0.62)');
  const accentBlue = useColorModeValue('#0066cc', '#2997ff');
  const pillBg = useColorModeValue(
    'rgba(0,102,204,0.06)',
    'rgba(41,151,255,0.10)',
  );
  const pillBorder = useColorModeValue(
    'rgba(0,102,204,0.18)',
    'rgba(41,151,255,0.22)',
  );

  if (!data.criteria.length && !data.note) return null;

  return (
    <Box
      mt="18px"
      p={{ base: '14px', md: '18px' }}
      borderRadius={{ base: '16px', md: '20px' }}
      bg={cardBg}
      border="1px solid"
      borderColor={cardBorder}
      backdropFilter="blur(18px) saturate(180%)"
      sx={{ WebkitBackdropFilter: 'blur(18px) saturate(180%)' }}
      width="100%"
      maxWidth="100%"
      minWidth={0}
    >
      <Flex align="center" gap="8px" mb="10px" minW={0}>
        <Icon as={LuLayoutGrid} w="14px" h="14px" color={accentBlue} />
        <Text
          fontFamily={FONT_APPLE_TEXT}
          fontSize="11px"
          fontWeight="700"
          letterSpacing="0.5px"
          textTransform="uppercase"
          color={metaColor}
        >
          Сравнение
        </Text>
      </Flex>
      {data.query && (
        <Text
          fontFamily={FONT_APPLE_DISPLAY}
          fontSize={{ base: '15px', md: '16px' }}
          fontWeight="600"
          color={titleColor}
          mb="10px"
          letterSpacing="-0.2px"
          wordBreak="break-word"
          noOfLines={2}
        >
          {data.query}
        </Text>
      )}
      {data.criteria.length > 0 && (
        <Flex gap="6px" flexWrap="wrap" minW={0} mb={data.note ? '10px' : 0}>
          {data.criteria.map((c) => (
            <Box
              key={c}
              px="10px"
              py="4px"
              borderRadius="9999px"
              bg={pillBg}
              border="1px solid"
              borderColor={pillBorder}
              color={accentBlue}
            >
              <Text
                fontFamily={FONT_APPLE_TEXT}
                fontSize="12px"
                fontWeight="600"
                noOfLines={1}
              >
                {c}
              </Text>
            </Box>
          ))}
        </Flex>
      )}
      {data.note && (
        <Text
          fontFamily={FONT_APPLE_TEXT}
          fontSize="12px"
          color={metaColor}
          lineHeight="1.55"
        >
          {data.note}
        </Text>
      )}
    </Box>
  );
}

interface CodeFixWidgetViewProps {
  data: CodeFixWidgetMeta;
}

function CodeFixWidgetView({ data }: CodeFixWidgetViewProps) {
  const cardBg = useColorModeValue(
    'rgba(255,255,255,0.66)',
    'rgba(15,18,32,0.58)',
  );
  const cardBorder = useColorModeValue(
    'rgba(0,0,0,0.07)',
    'rgba(255,255,255,0.10)',
  );
  const titleColor = useColorModeValue('#1d1d1f', '#f5f5f7');
  const metaColor = useColorModeValue('#6e6e73', 'rgba(245,245,247,0.62)');
  const accentBlue = useColorModeValue('#0066cc', '#2997ff');
  const warnBg = useColorModeValue(
    'rgba(255,159,10,0.08)',
    'rgba(255,159,10,0.14)',
  );
  const warnBorder = useColorModeValue(
    'rgba(255,159,10,0.24)',
    'rgba(255,159,10,0.32)',
  );
  const warnColor = useColorModeValue('#b25f00', '#ffb454');
  const stackPillBg = useColorModeValue(
    'rgba(0,102,204,0.06)',
    'rgba(41,151,255,0.10)',
  );
  const stackPillBorder = useColorModeValue(
    'rgba(0,102,204,0.18)',
    'rgba(41,151,255,0.22)',
  );

  if (!data.detectedStack.length && !data.safetyNote && !data.query)
    return null;

  return (
    <Box
      mt="18px"
      p={{ base: '14px', md: '18px' }}
      borderRadius={{ base: '16px', md: '20px' }}
      bg={cardBg}
      border="1px solid"
      borderColor={cardBorder}
      backdropFilter="blur(18px) saturate(180%)"
      sx={{ WebkitBackdropFilter: 'blur(18px) saturate(180%)' }}
      width="100%"
      maxWidth="100%"
      minWidth={0}
    >
      <Flex align="center" gap="8px" mb="10px" minW={0}>
        <Icon as={LuTerminal} w="14px" h="14px" color={accentBlue} />
        <Text
          fontFamily={FONT_APPLE_TEXT}
          fontSize="11px"
          fontWeight="700"
          letterSpacing="0.5px"
          textTransform="uppercase"
          color={metaColor}
        >
          Технический разбор
        </Text>
      </Flex>
      {data.query && (
        <Text
          fontFamily={FONT_APPLE_DISPLAY}
          fontSize={{ base: '15px', md: '16px' }}
          fontWeight="600"
          color={titleColor}
          mb="10px"
          letterSpacing="-0.2px"
          wordBreak="break-word"
          noOfLines={2}
        >
          {data.query}
        </Text>
      )}
      {data.detectedStack.length > 0 && (
        <Flex gap="6px" flexWrap="wrap" minW={0} mb="10px">
          {data.detectedStack.map((s) => (
            <Box
              key={s}
              px="10px"
              py="4px"
              borderRadius="9999px"
              bg={stackPillBg}
              border="1px solid"
              borderColor={stackPillBorder}
              color={accentBlue}
            >
              <Text
                fontFamily={FONT_APPLE_TEXT}
                fontSize="12px"
                fontWeight="600"
                noOfLines={1}
              >
                {s}
              </Text>
            </Box>
          ))}
        </Flex>
      )}
      {data.safetyNote && (
        <Flex
          gap="8px"
          align="flex-start"
          px="12px"
          py="10px"
          borderRadius="12px"
          bg={warnBg}
          border="1px solid"
          borderColor={warnBorder}
          minW={0}
        >
          <Icon
            as={LuSparkles}
            w="14px"
            h="14px"
            color={warnColor}
            mt="2px"
            flexShrink={0}
          />
          <Text
            fontFamily={FONT_APPLE_TEXT}
            fontSize="12px"
            color={warnColor}
            lineHeight="1.55"
            wordBreak="break-word"
          >
            {data.safetyNote} Сначала проверьте окружение, затем выполняйте
            команды.
          </Text>
        </Flex>
      )}
    </Box>
  );
}

interface NewsTimelineWidgetViewProps {
  items: NewsTimelineItem[];
}

function NewsTimelineWidgetView({ items }: NewsTimelineWidgetViewProps) {
  const cardBg = useColorModeValue(
    'rgba(255,255,255,0.66)',
    'rgba(15,18,32,0.58)',
  );
  const cardBgHover = useColorModeValue(
    'rgba(255,255,255,0.84)',
    'rgba(15,18,32,0.78)',
  );
  const cardBorder = useColorModeValue(
    'rgba(0,0,0,0.07)',
    'rgba(255,255,255,0.10)',
  );
  const cardBorderHover = useColorModeValue(
    'rgba(0,102,204,0.28)',
    'rgba(41,151,255,0.34)',
  );
  const titleColor = useColorModeValue('#1d1d1f', '#f5f5f7');
  const metaColor = useColorModeValue('#6e6e73', 'rgba(245,245,247,0.62)');
  const accentBlue = useColorModeValue('#0066cc', '#2997ff');
  const railColor = useColorModeValue(
    'rgba(0,102,204,0.18)',
    'rgba(41,151,255,0.24)',
  );
  const dotColor = accentBlue;

  if (!items.length) return null;

  return (
    <Box mt="18px" width="100%" maxWidth="100%" minWidth={0}>
      <Flex align="center" gap="8px" mb="10px" minW={0}>
        <Icon as={LuClock} w="14px" h="14px" color={accentBlue} />
        <Text
          fontFamily={FONT_APPLE_TEXT}
          fontSize="11px"
          fontWeight="700"
          letterSpacing="0.5px"
          textTransform="uppercase"
          color={metaColor}
        >
          Хронология новостей
        </Text>
      </Flex>

      <Box position="relative" pl={{ base: '16px', md: '20px' }} minW={0}>
        {/* Vertical rail */}
        <Box
          position="absolute"
          left={{ base: '5px', md: '7px' }}
          top="6px"
          bottom="6px"
          w="2px"
          bg={railColor}
          borderRadius="9999px"
        />

        <Stack spacing="10px" minW={0}>
          {items.map((it, i) => (
            <Box
              key={`${i}-${it.url}`}
              as="a"
              href={it.url}
              target="_blank"
              rel="noopener noreferrer"
              position="relative"
              display="block"
              p={{ base: '10px 12px', md: '12px 14px' }}
              borderRadius={{ base: '14px', md: '16px' }}
              bg={cardBg}
              border="1px solid"
              borderColor={cardBorder}
              backdropFilter="blur(16px) saturate(180%)"
              sx={{
                WebkitBackdropFilter: 'blur(16px) saturate(180%)',
                textDecoration: 'none',
              }}
              transition="background 0.16s ease, border-color 0.16s ease, transform 0.14s ease"
              _hover={{
                bg: cardBgHover,
                borderColor: cardBorderHover,
                transform: 'translateY(-1px)',
              }}
              minW={0}
              wordBreak="break-word"
            >
              {/* Dot on the rail */}
              <Box
                position="absolute"
                left={{ base: '-13px', md: '-17px' }}
                top="14px"
                w="10px"
                h="10px"
                borderRadius="9999px"
                bg={dotColor}
                border="2px solid"
                borderColor={cardBg}
                boxShadow="0 0 0 2px rgba(0,102,204,0.18)"
              />

              <Flex
                align="center"
                gap="6px"
                mb="4px"
                fontSize="11px"
                color={metaColor}
                minW={0}
                flexWrap="wrap"
              >
                {it.domain && (
                  <Text
                    fontFamily={FONT_APPLE_TEXT}
                    fontWeight="600"
                    noOfLines={1}
                  >
                    {it.domain}
                  </Text>
                )}
                {it.date && (
                  <Text fontFamily={FONT_APPLE_TEXT} fontWeight="500">
                    · {it.date}
                  </Text>
                )}
              </Flex>
              <Text
                fontFamily={FONT_APPLE_DISPLAY}
                fontSize={{ base: '14px', md: '15px' }}
                fontWeight="600"
                color={titleColor}
                lineHeight="1.35"
                letterSpacing="-0.2px"
                noOfLines={2}
                mb={it.snippet ? '4px' : 0}
              >
                {it.title}
              </Text>
              {it.snippet && (
                <Text
                  fontFamily={FONT_APPLE_TEXT}
                  fontSize="12px"
                  color={metaColor}
                  lineHeight="1.5"
                  noOfLines={2}
                >
                  {it.snippet}
                </Text>
              )}
            </Box>
          ))}
        </Stack>
      </Box>
    </Box>
  );
}

// ──────────────────────────────────────────────────────────────────
//  v4 search widgets — KG / PAA / Places / Shopping / Scholar / Videos / News
// ──────────────────────────────────────────────────────────────────

function useWidgetTokens() {
  const cardBg = useColorModeValue(
    'rgba(255,255,255,0.66)',
    'rgba(15,18,32,0.58)',
  );
  const cardBgHover = useColorModeValue(
    'rgba(255,255,255,0.84)',
    'rgba(15,18,32,0.78)',
  );
  const cardBorder = useColorModeValue(
    'rgba(0,0,0,0.07)',
    'rgba(255,255,255,0.10)',
  );
  const cardBorderHover = useColorModeValue(
    'rgba(0,102,204,0.28)',
    'rgba(41,151,255,0.34)',
  );
  const titleColor = useColorModeValue('#1d1d1f', '#f5f5f7');
  const bodyColor = useColorModeValue('#2b2b2f', 'rgba(245,245,247,0.86)');
  const metaColor = useColorModeValue('#6e6e73', 'rgba(245,245,247,0.62)');
  const accentBlue = useColorModeValue('#0066cc', '#2997ff');
  const chipBg = useColorModeValue(
    'rgba(0,102,204,0.06)',
    'rgba(41,151,255,0.10)',
  );
  const chipBorder = useColorModeValue(
    'rgba(0,102,204,0.18)',
    'rgba(41,151,255,0.22)',
  );
  return {
    cardBg,
    cardBgHover,
    cardBorder,
    cardBorderHover,
    titleColor,
    bodyColor,
    metaColor,
    accentBlue,
    chipBg,
    chipBorder,
  };
}

function SectionHeader({
  icon,
  label,
  metaColor,
  accentBlue,
}: {
  icon: any;
  label: string;
  metaColor: string;
  accentBlue: string;
}) {
  return (
    <Flex align="center" gap="8px" mb="10px" minW={0}>
      <Icon as={icon} w="14px" h="14px" color={accentBlue} />
      <Text
        fontFamily={FONT_APPLE_TEXT}
        fontSize="11px"
        fontWeight="700"
        letterSpacing="0.5px"
        textTransform="uppercase"
        color={metaColor}
      >
        {label}
      </Text>
    </Flex>
  );
}

// ── KnowledgeGraphCard ─────────────────────────────────────────────
function KnowledgeGraphCard({ data }: { data: SearchKnowledgeGraph }) {
  const T = useWidgetTokens();
  return (
    <Box
      mt="14px"
      p={{ base: '14px', md: '18px' }}
      borderRadius={{ base: '16px', md: '20px' }}
      bg={T.cardBg}
      border="1px solid"
      borderColor={T.cardBorder}
      backdropFilter="blur(18px) saturate(180%)"
      sx={{ WebkitBackdropFilter: 'blur(18px) saturate(180%)' }}
      width="100%"
      maxWidth="100%"
      minWidth={0}
    >
      <SectionHeader
        icon={LuInfo}
        label="Краткая справка"
        metaColor={T.metaColor}
        accentBlue={T.accentBlue}
      />

      <Flex
        direction={{ base: 'column', sm: 'row' }}
        gap={{ base: '12px', sm: '14px' }}
        align="flex-start"
        minW={0}
      >
        {data.imageUrl && (
          <Box
            w={{ base: '100%', sm: '128px' }}
            maxW={{ base: '180px', sm: '128px' }}
            flexShrink={0}
            borderRadius="14px"
            overflow="hidden"
            border="1px solid"
            borderColor={T.cardBorder}
          >
            <Box
              as="img"
              src={data.imageUrl}
              alt={data.title}
              loading="lazy"
              w="100%"
              h={{ base: '120px', sm: '110px' }}
              sx={{ objectFit: 'cover', display: 'block' }}
              onError={(e: any) => {
                const el = e?.currentTarget?.parentElement as
                  | HTMLElement
                  | undefined;
                if (el) el.style.display = 'none';
              }}
            />
          </Box>
        )}

        <Box flex="1" minW={0}>
          <Text
            fontFamily={FONT_APPLE_DISPLAY}
            fontSize={{ base: '17px', md: '19px' }}
            fontWeight="600"
            color={T.titleColor}
            letterSpacing="-0.25px"
            lineHeight="1.2"
            mb="3px"
            noOfLines={2}
            wordBreak="break-word"
          >
            {data.title}
          </Text>
          {data.type && (
            <Text
              fontFamily={FONT_APPLE_TEXT}
              fontSize="12px"
              color={T.metaColor}
              mb="6px"
              noOfLines={1}
            >
              {data.type}
            </Text>
          )}
          {data.description && (
            <Text
              fontFamily={FONT_APPLE_TEXT}
              fontSize="13px"
              color={T.bodyColor}
              lineHeight="1.55"
              mb={data.attributes && data.attributes.length > 0 ? '10px' : '0'}
              noOfLines={4}
              wordBreak="break-word"
            >
              {data.description}
            </Text>
          )}
          {data.attributes && data.attributes.length > 0 && (
            <Flex gap="6px" flexWrap="wrap" minW={0}>
              {data.attributes.slice(0, 6).map((a, i) => (
                <Box
                  key={`${i}-${a.label}`}
                  px="10px"
                  py="4px"
                  borderRadius="9999px"
                  bg={T.chipBg}
                  border="1px solid"
                  borderColor={T.chipBorder}
                  color={T.accentBlue}
                  maxW="100%"
                >
                  <Text
                    fontFamily={FONT_APPLE_TEXT}
                    fontSize="11px"
                    fontWeight="600"
                    noOfLines={1}
                    wordBreak="break-word"
                  >
                    <Text as="span" opacity={0.75}>
                      {a.label}:
                    </Text>{' '}
                    {a.value}
                  </Text>
                </Box>
              ))}
            </Flex>
          )}
          {data.website && (
            <Box
              as="a"
              href={data.website}
              target="_blank"
              rel="noopener noreferrer"
              display="inline-flex"
              alignItems="center"
              mt="10px"
              px="12px"
              py="6px"
              borderRadius="9999px"
              bg={T.chipBg}
              color={T.accentBlue}
              border="1px solid"
              borderColor={T.chipBorder}
              fontFamily={FONT_APPLE_TEXT}
              fontSize="12px"
              fontWeight="600"
              sx={{ textDecoration: 'none' }}
              _hover={{ borderColor: T.cardBorderHover }}
              gap="6px"
            >
              <Text>Сайт</Text>
              <Icon as={LuExternalLink} w="12px" h="12px" />
            </Box>
          )}
        </Box>
      </Flex>
    </Box>
  );
}

// ── PeopleAlsoAskBlock ─────────────────────────────────────────────
function PeopleAlsoAskBlock({
  items,
  onAsk,
}: {
  items: PeopleAlsoAskItem[];
  onAsk: (q: string) => void;
}) {
  const T = useWidgetTokens();
  return (
    <Box mt="18px" width="100%" maxWidth="100%" minWidth={0}>
      <SectionHeader
        icon={LuMessageSquare}
        label="Что ещё спрашивают"
        metaColor={T.metaColor}
        accentBlue={T.accentBlue}
      />
      <Stack spacing="8px" minW={0}>
        {items.map((p, i) => (
          <Box
            as="button"
            type="button"
            key={`${i}-${p.question}`}
            onClick={() => onAsk(p.question)}
            display="block"
            textAlign="left"
            p={{ base: '12px', md: '14px' }}
            borderRadius={{ base: '14px', md: '16px' }}
            bg={T.cardBg}
            border="1px solid"
            borderColor={T.cardBorder}
            backdropFilter="blur(16px) saturate(180%)"
            sx={{
              WebkitBackdropFilter: 'blur(16px) saturate(180%)',
              cursor: 'pointer',
              WebkitTapHighlightColor: 'transparent',
            }}
            transition="background 0.16s ease, border-color 0.16s ease, transform 0.14s ease"
            _hover={{
              bg: T.cardBgHover,
              borderColor: T.cardBorderHover,
              transform: 'translateY(-1px)',
            }}
            width="100%"
            maxW="100%"
            minW={0}
          >
            <Flex align="center" justify="space-between" gap="10px" minW={0}>
              <Text
                fontFamily={FONT_APPLE_DISPLAY}
                fontSize={{ base: '14px', md: '15px' }}
                fontWeight="600"
                color={T.titleColor}
                letterSpacing="-0.15px"
                lineHeight="1.35"
                noOfLines={2}
                wordBreak="break-word"
                minW={0}
              >
                {p.question}
              </Text>
              <Icon
                as={LuExternalLink}
                w="14px"
                h="14px"
                color={T.metaColor}
                flexShrink={0}
              />
            </Flex>
            {p.snippet && (
              <Text
                mt="4px"
                fontFamily={FONT_APPLE_TEXT}
                fontSize="12px"
                color={T.metaColor}
                lineHeight="1.5"
                noOfLines={2}
                wordBreak="break-word"
              >
                {p.snippet}
              </Text>
            )}
            {p.domain && (
              <Text
                mt="6px"
                fontFamily={FONT_APPLE_TEXT}
                fontSize="11px"
                color={T.metaColor}
                fontWeight="500"
                noOfLines={1}
              >
                {p.domain}
              </Text>
            )}
          </Box>
        ))}
      </Stack>
    </Box>
  );
}

// ── PlacesBlock ────────────────────────────────────────────────────
function PlacesBlock({ items }: { items: SearchPlaceItem[] }) {
  const T = useWidgetTokens();
  return (
    <Box mt="18px" width="100%" maxWidth="100%" minWidth={0}>
      <SectionHeader
        icon={LuMapPin}
        label="Места"
        metaColor={T.metaColor}
        accentBlue={T.accentBlue}
      />
      <Stack spacing="8px" minW={0}>
        {items.map((p, i) => {
          const linkUrl = p.mapsUrl || p.url;
          return (
            <Box
              key={`${i}-${p.title}`}
              as={linkUrl ? 'a' : 'div'}
              href={linkUrl}
              target={linkUrl ? '_blank' : undefined}
              rel={linkUrl ? 'noopener noreferrer' : undefined}
              display="block"
              p={{ base: '12px', md: '14px' }}
              borderRadius={{ base: '14px', md: '16px' }}
              bg={T.cardBg}
              border="1px solid"
              borderColor={T.cardBorder}
              backdropFilter="blur(16px) saturate(180%)"
              sx={{
                WebkitBackdropFilter: 'blur(16px) saturate(180%)',
                textDecoration: 'none',
              }}
              transition="background 0.16s ease, border-color 0.16s ease, transform 0.14s ease"
              _hover={
                linkUrl
                  ? {
                      bg: T.cardBgHover,
                      borderColor: T.cardBorderHover,
                      transform: 'translateY(-1px)',
                    }
                  : undefined
              }
              minW={0}
            >
              <Flex
                justify="space-between"
                align="flex-start"
                gap="10px"
                minW={0}
              >
                <Box minW={0} flex="1">
                  <Text
                    fontFamily={FONT_APPLE_DISPLAY}
                    fontSize={{ base: '14px', md: '15px' }}
                    fontWeight="600"
                    color={T.titleColor}
                    lineHeight="1.35"
                    letterSpacing="-0.15px"
                    noOfLines={2}
                    wordBreak="break-word"
                  >
                    {p.title}
                  </Text>
                  {p.category && (
                    <Text
                      mt="2px"
                      fontFamily={FONT_APPLE_TEXT}
                      fontSize="11px"
                      color={T.metaColor}
                      noOfLines={1}
                    >
                      {p.category}
                    </Text>
                  )}
                  {p.address && (
                    <Text
                      mt="4px"
                      fontFamily={FONT_APPLE_TEXT}
                      fontSize="12px"
                      color={T.bodyColor}
                      lineHeight="1.45"
                      noOfLines={2}
                      wordBreak="break-word"
                    >
                      {p.address}
                    </Text>
                  )}
                </Box>
                {typeof p.rating === 'number' && (
                  <Flex
                    align="center"
                    gap="4px"
                    px="8px"
                    py="3px"
                    borderRadius="9999px"
                    bg={T.chipBg}
                    border="1px solid"
                    borderColor={T.chipBorder}
                    flexShrink={0}
                  >
                    <Icon as={LuStar} w="11px" h="11px" color={T.accentBlue} />
                    <Text
                      fontFamily={FONT_APPLE_TEXT}
                      fontSize="11px"
                      fontWeight="600"
                      color={T.accentBlue}
                    >
                      {p.rating.toFixed(1)}
                      {typeof p.ratingCount === 'number' && (
                        <Text
                          as="span"
                          ml="3px"
                          opacity={0.7}
                          fontWeight="500"
                        >
                          · {p.ratingCount}
                        </Text>
                      )}
                    </Text>
                  </Flex>
                )}
              </Flex>
            </Box>
          );
        })}
      </Stack>
    </Box>
  );
}

// ── ShoppingBlock ──────────────────────────────────────────────────
function ShoppingBlock({ items }: { items: SearchProductItem[] }) {
  const T = useWidgetTokens();
  return (
    <Box mt="18px" width="100%" maxWidth="100%" minWidth={0}>
      <SectionHeader
        icon={LuShoppingBag}
        label="Товары"
        metaColor={T.metaColor}
        accentBlue={T.accentBlue}
      />
      <Flex
        gap="10px"
        overflowX="auto"
        pb="6px"
        mx={{ base: '-4px', md: '0' }}
        px={{ base: '4px', md: '0' }}
        sx={{
          scrollbarWidth: 'thin',
          '::-webkit-scrollbar': { height: '6px' },
          '::-webkit-scrollbar-thumb': {
            background: 'rgba(127,127,127,0.25)',
            borderRadius: '999px',
          },
          scrollSnapType: 'x proximity',
        }}
      >
        {items.map((s, i) => (
          <Box
            key={`${i}-${s.url}`}
            as="a"
            href={s.url}
            target="_blank"
            rel="noopener noreferrer"
            flexShrink={0}
            w={{ base: '180px', md: '210px' }}
            borderRadius={{ base: '14px', md: '16px' }}
            bg={T.cardBg}
            border="1px solid"
            borderColor={T.cardBorder}
            backdropFilter="blur(16px) saturate(180%)"
            sx={{
              WebkitBackdropFilter: 'blur(16px) saturate(180%)',
              scrollSnapAlign: 'start',
              textDecoration: 'none',
            }}
            transition="background 0.16s ease, border-color 0.16s ease, transform 0.14s ease"
            _hover={{
              bg: T.cardBgHover,
              borderColor: T.cardBorderHover,
              transform: 'translateY(-1px)',
            }}
            display="block"
            overflow="hidden"
          >
            {s.imageUrl && (
              <Box
                w="100%"
                h={{ base: '120px', md: '130px' }}
                overflow="hidden"
              >
                <Box
                  as="img"
                  src={s.imageUrl}
                  alt={s.title}
                  loading="lazy"
                  w="100%"
                  h="100%"
                  sx={{ objectFit: 'cover', display: 'block' }}
                  onError={(e: any) => {
                    const el = e?.currentTarget?.parentElement as
                      | HTMLElement
                      | undefined;
                    if (el) el.style.display = 'none';
                  }}
                />
              </Box>
            )}
            <Box p={{ base: '10px', md: '12px' }}>
              {s.price && (
                <Text
                  fontFamily={FONT_APPLE_DISPLAY}
                  fontSize={{ base: '15px', md: '16px' }}
                  fontWeight="700"
                  color={T.accentBlue}
                  letterSpacing="-0.2px"
                  mb="2px"
                >
                  {s.price}
                </Text>
              )}
              <Text
                fontFamily={FONT_APPLE_TEXT}
                fontSize="13px"
                fontWeight="600"
                color={T.titleColor}
                lineHeight="1.35"
                noOfLines={2}
                mb="4px"
                wordBreak="break-word"
              >
                {s.title}
              </Text>
              <Flex
                align="center"
                gap="6px"
                fontSize="11px"
                color={T.metaColor}
                minW={0}
              >
                {s.source && (
                  <Text
                    fontFamily={FONT_APPLE_TEXT}
                    fontWeight="600"
                    noOfLines={1}
                  >
                    {s.source}
                  </Text>
                )}
                {typeof s.rating === 'number' && (
                  <Flex align="center" gap="2px">
                    <Icon as={LuStar} w="10px" h="10px" />
                    <Text fontFamily={FONT_APPLE_TEXT}>
                      {s.rating.toFixed(1)}
                    </Text>
                  </Flex>
                )}
              </Flex>
            </Box>
          </Box>
        ))}
      </Flex>
    </Box>
  );
}

// ── ScholarBlock ───────────────────────────────────────────────────
function ScholarBlock({ items }: { items: SearchScholarItem[] }) {
  const T = useWidgetTokens();
  return (
    <Box mt="18px" width="100%" maxWidth="100%" minWidth={0}>
      <SectionHeader
        icon={LuGraduationCap}
        label="Научные публикации"
        metaColor={T.metaColor}
        accentBlue={T.accentBlue}
      />
      <Stack spacing="8px" minW={0}>
        {items.map((s, i) => (
          <Box
            key={`${i}-${s.url}`}
            as="a"
            href={s.url}
            target="_blank"
            rel="noopener noreferrer"
            display="block"
            p={{ base: '12px', md: '14px' }}
            borderRadius={{ base: '14px', md: '16px' }}
            bg={T.cardBg}
            border="1px solid"
            borderColor={T.cardBorder}
            backdropFilter="blur(16px) saturate(180%)"
            sx={{
              WebkitBackdropFilter: 'blur(16px) saturate(180%)',
              textDecoration: 'none',
            }}
            transition="background 0.16s ease, border-color 0.16s ease, transform 0.14s ease"
            _hover={{
              bg: T.cardBgHover,
              borderColor: T.cardBorderHover,
              transform: 'translateY(-1px)',
            }}
            minW={0}
          >
            <Text
              fontFamily={FONT_APPLE_DISPLAY}
              fontSize={{ base: '14px', md: '15px' }}
              fontWeight="600"
              color={T.titleColor}
              lineHeight="1.35"
              letterSpacing="-0.15px"
              noOfLines={2}
              mb="4px"
              wordBreak="break-word"
            >
              {s.title}
            </Text>
            {(s.authors || s.year || typeof s.citedBy === 'number') && (
              <Flex
                gap="6px"
                flexWrap="wrap"
                align="center"
                fontSize="11px"
                color={T.metaColor}
                mb={s.snippet ? '4px' : 0}
              >
                {s.authors && (
                  <Text
                    fontFamily={FONT_APPLE_TEXT}
                    noOfLines={1}
                    maxW="100%"
                    wordBreak="break-word"
                  >
                    {s.authors}
                  </Text>
                )}
                {s.year && (
                  <Text fontFamily={FONT_APPLE_TEXT}>· {s.year}</Text>
                )}
                {typeof s.citedBy === 'number' && (
                  <Text fontFamily={FONT_APPLE_TEXT}>
                    · Цитирований: {s.citedBy}
                  </Text>
                )}
              </Flex>
            )}
            {s.snippet && (
              <Text
                fontFamily={FONT_APPLE_TEXT}
                fontSize="12px"
                color={T.bodyColor}
                lineHeight="1.5"
                noOfLines={2}
                wordBreak="break-word"
              >
                {s.snippet}
              </Text>
            )}
            {s.domain && (
              <Text
                mt="4px"
                fontFamily={FONT_APPLE_TEXT}
                fontSize="11px"
                color={T.metaColor}
                fontWeight="500"
              >
                {s.domain}
              </Text>
            )}
          </Box>
        ))}
      </Stack>
    </Box>
  );
}

// ── VideoBlock ─────────────────────────────────────────────────────
function VideoBlock({ items }: { items: SearchVideoItem[] }) {
  const T = useWidgetTokens();
  return (
    <Box mt="18px" width="100%" maxWidth="100%" minWidth={0}>
      <SectionHeader
        icon={LuVideo}
        label="Видео"
        metaColor={T.metaColor}
        accentBlue={T.accentBlue}
      />
      <Flex
        gap="10px"
        overflowX="auto"
        pb="6px"
        mx={{ base: '-4px', md: '0' }}
        px={{ base: '4px', md: '0' }}
        sx={{
          scrollbarWidth: 'thin',
          '::-webkit-scrollbar': { height: '6px' },
          '::-webkit-scrollbar-thumb': {
            background: 'rgba(127,127,127,0.25)',
            borderRadius: '999px',
          },
          scrollSnapType: 'x proximity',
        }}
      >
        {items.map((v, i) => (
          <Box
            key={`${i}-${v.url}`}
            as="a"
            href={v.url}
            target="_blank"
            rel="noopener noreferrer"
            flexShrink={0}
            w={{ base: '210px', md: '240px' }}
            borderRadius={{ base: '14px', md: '16px' }}
            bg={T.cardBg}
            border="1px solid"
            borderColor={T.cardBorder}
            sx={{
              scrollSnapAlign: 'start',
              textDecoration: 'none',
            }}
            transition="background 0.16s ease, border-color 0.16s ease, transform 0.14s ease"
            _hover={{
              bg: T.cardBgHover,
              borderColor: T.cardBorderHover,
              transform: 'translateY(-1px)',
            }}
            display="block"
            overflow="hidden"
          >
            <Box
              position="relative"
              w="100%"
              h={{ base: '120px', md: '135px' }}
              bg="rgba(0,0,0,0.06)"
            >
              {v.imageUrl && (
                <Box
                  as="img"
                  src={v.imageUrl}
                  alt={v.title}
                  loading="lazy"
                  w="100%"
                  h="100%"
                  sx={{ objectFit: 'cover', display: 'block' }}
                  onError={(e: any) => {
                    const el = e?.currentTarget as HTMLImageElement;
                    el.style.display = 'none';
                  }}
                />
              )}
              {v.duration && (
                <Box
                  position="absolute"
                  right="8px"
                  bottom="8px"
                  px="6px"
                  py="2px"
                  borderRadius="6px"
                  bg="rgba(0,0,0,0.65)"
                  color="white"
                  fontFamily={FONT_APPLE_TEXT}
                  fontSize="10px"
                  fontWeight="600"
                >
                  {v.duration}
                </Box>
              )}
            </Box>
            <Box p={{ base: '10px', md: '12px' }}>
              <Text
                fontFamily={FONT_APPLE_TEXT}
                fontSize="13px"
                fontWeight="600"
                color={T.titleColor}
                lineHeight="1.35"
                noOfLines={2}
                mb="4px"
                wordBreak="break-word"
              >
                {v.title}
              </Text>
              <Flex
                align="center"
                gap="6px"
                fontSize="11px"
                color={T.metaColor}
                minW={0}
              >
                {v.channel && (
                  <Text fontFamily={FONT_APPLE_TEXT} noOfLines={1}>
                    {v.channel}
                  </Text>
                )}
                {v.date && (
                  <Text fontFamily={FONT_APPLE_TEXT}>· {v.date}</Text>
                )}
              </Flex>
            </Box>
          </Box>
        ))}
      </Flex>
    </Box>
  );
}

// ── NewsBlock — простые карточки (отличается от NewsTimelineWidgetView
//    тем, что не строит вертикальный rail, а отдаёт компактную сетку). ─
function NewsBlock({ items }: { items: SearchNewsItem[] }) {
  const T = useWidgetTokens();
  return (
    <Box mt="18px" width="100%" maxWidth="100%" minWidth={0}>
      <SectionHeader
        icon={LuClock}
        label="Свежие материалы"
        metaColor={T.metaColor}
        accentBlue={T.accentBlue}
      />
      <Stack spacing="8px" minW={0}>
        {items.map((n, i) => (
          <Box
            key={`${i}-${n.url}`}
            as="a"
            href={n.url}
            target="_blank"
            rel="noopener noreferrer"
            display="block"
            p={{ base: '12px', md: '14px' }}
            borderRadius={{ base: '14px', md: '16px' }}
            bg={T.cardBg}
            border="1px solid"
            borderColor={T.cardBorder}
            sx={{ textDecoration: 'none' }}
            transition="background 0.16s ease, border-color 0.16s ease, transform 0.14s ease"
            _hover={{
              bg: T.cardBgHover,
              borderColor: T.cardBorderHover,
              transform: 'translateY(-1px)',
            }}
            minW={0}
          >
            <Flex
              align="center"
              gap="6px"
              mb="4px"
              fontSize="11px"
              color={T.metaColor}
              minW={0}
              flexWrap="wrap"
            >
              {n.domain && (
                <Text
                  fontFamily={FONT_APPLE_TEXT}
                  fontWeight="600"
                  noOfLines={1}
                >
                  {n.domain}
                </Text>
              )}
              {n.date && (
                <Text fontFamily={FONT_APPLE_TEXT}>· {n.date}</Text>
              )}
            </Flex>
            <Text
              fontFamily={FONT_APPLE_DISPLAY}
              fontSize={{ base: '14px', md: '15px' }}
              fontWeight="600"
              color={T.titleColor}
              lineHeight="1.35"
              letterSpacing="-0.15px"
              noOfLines={2}
              mb={n.snippet ? '4px' : 0}
              wordBreak="break-word"
            >
              {n.title}
            </Text>
            {n.snippet && (
              <Text
                fontFamily={FONT_APPLE_TEXT}
                fontSize="12px"
                color={T.bodyColor}
                lineHeight="1.5"
                noOfLines={2}
                wordBreak="break-word"
              >
                {n.snippet}
              </Text>
            )}
          </Box>
        ))}
      </Stack>
    </Box>
  );
}

export default Message;
