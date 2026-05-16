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

function Message({ message, isLast }: IProps) {
  const toast = useToast();
  const textColor = useColorModeValue('navy.700', 'white');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.200');
  const { data: session } = useSession();
  const { regenerateLastMessage, loading, webSearch, messages, setMessages } =
    useContext(ChatAiContext);
  const { setTariffModalOpen, setPayBalanceModalOpen } =
    useContext(ModalContext);

  const { isAnonymous, user, refreshUser } = useUser(false);

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
      <Flex w="100%" align={'start'} mb="10px" position="relative">
        {message.content && (
          <Box position="absolute" top="-2px" right="0px" zIndex={2}>
            <Menu>
              <MenuButton
                as={IconButton}
                aria-label="Опции сообщения"
                variant="ghost"
                size="sm"
                icon={<FiMoreVertical />}
                bg="rgba(255, 255, 255, 0.7)"
                _dark={{ bg: 'rgba(15, 15, 35, 0.8)' }}
                _hover={{
                  bg: 'rgba(255, 255, 255, 0.9)',
                  _dark: { bg: 'rgba(15, 15, 35, 0.95)' },
                }}
                borderRadius="full"
                backdropFilter="blur(6px)"
                boxShadow="sm"
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
          bg={'linear-gradient(15.46deg, #4A25E1 26.3%, #7B5AFF 86.4%)'}
          me="20px"
          h="40px"
          minH="40px"
          minW="40px"
        >
          <Icon as={MdAutoAwesome} width="20px" height="20px" color="white" />
        </Flex>
        <Flex w="100%">
          <Grid>
            {message.content && (
              <Text
                pt="12px"
                color={textColor}
                fontWeight="600"
                fontSize={{ base: 'sm', md: 'md' }}
                lineHeight={{ base: '24px', md: '26px' }}
                minW={0}
              >
                <Box
                  opacity={message.content ? '1' : '0'}
                  transition="opacity 1s"
                  sx={{
                    width: '100%',
                    maxWidth: '100%',
                    overflowX: 'auto',
                    '& table': {
                      borderCollapse: 'collapse',
                      borderSpacing: 0,
                      minWidth: '100%',
                    },
                    '& th, & td': {
                      padding: '4px 8px',
                      minWidth: '90px',
                      whiteSpace: 'normal',
                      wordBreak: 'break-word',
                      verticalAlign: 'top',
                    },
                  }}
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
              </Text>
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
      <Flex w="100%">
        <Flex
          borderRadius="full"
          justify="center"
          align="center"
          bg={'transparent'}
          border="1px solid"
          borderColor={borderColor}
          me="20px"
          h="40px"
          minH="40px"
          minW="40px"
        >
          <NextAvatar src={session?.user?.image!} w="40px" h="40px" />
        </Flex>
        <Box
          pt="12px"
          color={textColor}
          fontWeight="600"
          fontSize={{ base: 'sm', md: 'md' }}
          lineHeight={{ base: '24px', md: '26px' }}
          sx={{
            width: '100%',
            maxWidth: '100%',
            overflowX: 'auto',
            '& p': {
              whiteSpace: 'normal',
              wordBreak: 'break-word',
              marginBottom: '0.5em',
            },
            '& pre': {
              width: '100%',
              overflowX: 'auto',
            },
            '& code': {
              whiteSpace: 'pre',
            },
            '& table': {
              borderCollapse: 'collapse',
              borderSpacing: 0,
              width: 'max-content',
              maxWidth: 'none',
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
