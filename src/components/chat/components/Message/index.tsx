'use client';

import { ChatAiContext, IMessage } from '@/contexts/ChatAiContext';
import {
  Box,
  Button,
  CircularProgress,
  Flex,
  Grid,
  Icon,
  IconButton,
  Text,
  useColorModeValue,
  useToast,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from '@chakra-ui/react';
import { MdAutoAwesome } from 'react-icons/md';
import { markdown } from '@/services/ui/MarkdownService';
import React, { useContext } from 'react';
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
  const { regenerateLastMessage, loading, webSearch, messages, setMessages } =
    useContext(ChatAiContext);
  const { setTariffModalOpen, setPayBalanceModalOpen } =
    useContext(ModalContext);

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
    return (
      <Flex
        w="100%"
        maxW={{ base: '100%', md: '820px' }}
        mx="auto"
        align={'start'}
        mb={{ base: '16px', md: '20px' }}
        position="relative"
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
            {message.content && (
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
                  opacity={message.content ? '1' : '0'}
                  transition="opacity 0.6s ease"
                  sx={markdownSx}
                  dangerouslySetInnerHTML={{
                    __html: markdown.markdownItWithPlugins.render(
                      message.content === '__WEB_SEARCH_REGISTER__' ||
                      message.content === '__WEB_SEARCH_FREE_LIMIT__' ||
                      message.content === '__WEB_SEARCH_PRO_LIMIT__'
                        ? ''
                        : message.content,
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

            <Flex
              pointerEvents={!message.content ? 'auto' : 'none'}
              height={!message.content ? 'auto' : '0px'}
              transition="opacity 0.5s, height 2s"
              opacity={!message.content ? '1' : '0'}
              gap="12px"
              mt="14px"
            >
              <CircularProgress
                size="35px"
                isIndeterminate
                color="brand.500"
              />
              <Text color="gray.400" mt="14px">
                🚀 Работаем над этим...{' '}
              </Text>
            </Flex>

            {!loading && isLast && (
              <Box>
                <Button
                  w="auto"
                  mt="20px"
                  onClick={handleRegenerate}
                  border="1px solid"
                  borderColor={borderColor}
                  rightIcon={
                    <Icon as={PiRepeat} width="20px" height="20px" />
                  }
                >
                  Перегенерировать
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

export default Message;
