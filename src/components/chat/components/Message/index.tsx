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
import { LuChevronDown, LuLink } from 'react-icons/lu';
import { markdown } from '@/services/ui/MarkdownService';
import {
  extractThinkBlocks,
  parseSourcesFromContent,
  ISource,
} from '@/utils/normalizeModelOutput';
import React, { useContext, useEffect, useMemo, useState } from 'react';
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
    // Priority: live `message.sources` (during streaming) > marker re-parse
    // from content (after reload). The marker is always stripped from text.
    const { cleanText, reasoningText, sources } = useMemo(() => {
      const raw = message.content || '';
      const sourcesParsed = parseSourcesFromContent(raw);
      const liveSources: ISource[] | undefined = (message as any).sources;
      const finalSources: ISource[] =
        liveSources && liveSources.length > 0
          ? liveSources
          : sourcesParsed.sources;

      const withoutSources = sourcesParsed.cleanContent;
      if (reasoningEnabled) {
        const ext = extractThinkBlocks(withoutSources);
        return {
          cleanText: ext.cleanText,
          reasoningText: ext.reasoningText,
          sources: finalSources,
        };
      }
      return {
        cleanText: withoutSources,
        reasoningText: '',
        sources: finalSources,
      };
    }, [message.content, (message as any).sources, reasoningEnabled]);

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
                message.content === '__WEB_SEARCH_REGISTER__' ||
                message.content === '__WEB_SEARCH_FREE_LIMIT__' ||
                message.content === '__WEB_SEARCH_PRO_LIMIT__')) && (
              <Grid gap="12px" mt="12px">
                {message.content.startsWith('Ваш баланс для ') && (
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
                      border="1px solid"
                      borderColor={borderColor}
                      rightIcon={
                        <Icon
                          as={TbSettingsDollar}
                          width="20px"
                          height="20px"
                        />
                      }
                    >
                      Активировать тариф
                    </Button>
                  </Flex>
                )}

                {isAnonymous &&
                  message.content.startsWith('Ваш баланс для ') && (
                    <Grid mt="12px" gap="14px">
                      <div>
                        Авторизуйтесь и получите бесплатно 160 страниц генерации
                        текста бесплатно! 🔥
                      </div>
                      <Link
                        style={{ width: '100%' }}
                        href="/others/sign-in"
                      >
                        <Button
                          border="1px solid"
                          borderColor={borderColor}
                          mb={'5'}
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
                  <Grid mt="12px" gap="12px">
                    <div>Закончились попытки бесплатного поиска :(</div>
                    <div>Оформите подписку и получите 100 запросов в месяц!</div>
                    <Button
                      onClick={() => setTariffModalOpen!(true)}
                      border="1px solid"
                      borderColor={borderColor}
                      rightIcon={
                        <Icon
                          as={TbSettingsDollar}
                          width="20px"
                          height="20px"
                        />
                      }
                    >
                      Управлять подпиской
                    </Button>
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

            {/* Source cards under the answer (Perplexity-like) */}
            {sources && sources.length > 0 && cleanText && (
              <SourcesBlock sources={sources} />
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
// SourcesBlock — Perplexity-like source cards under the answer.
// Mobile: 1 column. Desktop: 2 columns. All cards click-open in new tab.
// ──────────────────────────────────────────────────────────────────
interface SourcesBlockProps {
  sources: ISource[];
}

function SourcesBlock({ sources }: SourcesBlockProps) {
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

  return (
    <Box mt="20px" width="100%" maxWidth="100%" minWidth={0}>
      <Flex align="center" gap="6px" mb="10px">
        <Icon as={LuLink} w="13px" h="13px" color={metaColor} />
        <Text
          fontFamily={FONT_APPLE_TEXT}
          fontSize="11px"
          fontWeight="600"
          letterSpacing="0.5px"
          textTransform="uppercase"
          color={metaColor}
        >
          Источники
        </Text>
      </Flex>
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
    </Box>
  );
}

export default Message;
