'use client';

import {
  Box,
  Button,
  Checkbox,
  Divider,
  Flex,
  Grid,
  Heading,
  Icon,
  Text,
  useBreakpointValue,
  useColorModeValue,
} from '@chakra-ui/react';
import React, { useContext, useEffect, useState } from 'react';
import { IStatisticUser, usersService } from '@/services/ui/UsersService';
import { NextAvatar } from '@/components/image/Avatar';
import { useRouter } from 'next/navigation';
import { ModalContext } from '@/contexts/ModalContext';
import { AutoSizer, List, WindowScroller } from 'react-virtualized';
import 'react-virtualized/styles.css';
import Card from '@/components/card/Card';
import IconBox from '@/components/icons/IconBox';
import { MdOutlineRequestPage } from 'react-icons/md';
import { IoIosImages } from 'react-icons/io';
import { LuCircleDollarSign, LuGlobe } from 'react-icons/lu';
import { ListRowProps } from 'react-virtualized/dist/es/List';
import { calculatePages } from '../admin-user/Content';

export default function Users() {
  const boxBg = useColorModeValue('secondaryGray.300', 'whiteAlpha.100');
  const brandColor = useColorModeValue('brand.500', 'white');

  const [isCheckedAuth, setIsCheckedAuth] = useState(false);
  const [isCheckedSubs, setIsCheckedSubs] = useState(false);

  const router = useRouter();
  const [users, setUsers] = useState<IStatisticUser[]>([]);
  const textColorPrimary = useColorModeValue('navy.700', 'white');
  const textSecondaryColor = useColorModeValue('gray.500', 'gray.500');
  const borderColor = useColorModeValue('#A3AED0', '#1B2559');
  const borderColorButton = useColorModeValue('gray.200', 'whiteAlpha.200');

  const variant = useBreakpointValue({
    base: 340,
    xl: 270,
  });

  const { setUserDetailOpen } = useContext(ModalContext);
  useEffect(() => {
    usersService.getUsers().then(setUsers);
  }, []);

  const filteredUsers = users
    .filter((user) => {
      if (isCheckedAuth) {
        return !user.email.includes('@example.com');
      }

      return true;
    })
    .filter((user) => {
      if (isCheckedSubs) {
        return user.subscriptions[0]?.status === 'active';
      }

      return true;
    });

  console.log({ filteredUsers });
  const renderTr = ({ index, isScrolling, key, style }: ListRowProps) => {
    const user = filteredUsers[index];

    return (
      <Box key={key} style={style} p="12px" pr="32px">
        <Card>
          <Flex
            gap="32px"
            justifyContent="space-between"
            flexDirection={{ base: 'column', xl: 'row' }}
          >
            <Flex gap="32px" width="100%" overflow="hidden">
              <Box>
                <Flex gap="8px" alignItems="center" borderColor="none">
                  <NextAvatar src={user.image} minW="34px" h="34px" w="34px" />
                  <Grid>
                    <Text fontSize="xl" textColor={textColorPrimary}>
                      {user.name}
                    </Text>
                    <Text
                      textOverflow="elipsis"
                      fontSize={{ base: 'sm', xl: 'md' }}
                      textColor={textSecondaryColor}
                    >
                      {user.email}
                    </Text>
                  </Grid>
                </Flex>
                <Box mt="12px">
                  <Grid gap="8px">
                    <Divider />
                    <Flex gap="12px" alignItems="center">
                      <IconBox
                        minW="34px"
                        minH="34px"
                        bg={boxBg}
                        icon={
                          <Icon
                            w="24px"
                            h="24px"
                            as={MdOutlineRequestPage}
                            color={brandColor}
                          />
                        }
                      />
                      <Text fontSize="md">
                        Страницы:{' '}
                        <Text
                          display="inline"
                          fontSize="sm"
                          textColor={textSecondaryColor}
                        >
                          {calculatePages(user.modelsBalance)}
                        </Text>
                      </Text>
                    </Flex>
                    <Divider />
                    <Flex gap="12px" alignItems="center">
                      <IconBox
                        minW="34px"
                        minH="34px"
                        bg={boxBg}
                        icon={
                          <Icon
                            w="24px"
                            h="24px"
                            as={LuGlobe}
                            color={brandColor}
                          />
                        }
                      />
                      <Text fontSize="md">
                        Веб-поиск:{' '}
                        <Text
                          display="inline"
                          fontSize="sm"
                          textColor={textSecondaryColor}
                        >
                          {user.webSearchBalance ?? 0}
                        </Text>
                      </Text>
                    </Flex>
                    <Divider />
                    <Flex gap="12px" alignItems="center">
                      <IconBox
                        minW="34px"
                        minH="34px"
                        bg={boxBg}
                        icon={
                          <Icon
                            w="24px"
                            h="24px"
                            as={IoIosImages}
                            color={brandColor}
                          />
                        }
                      />
                      <Text fontSize="md">
                        Картинки:{' '}
                        <Text
                          display="inline"
                          fontSize="sm"
                          textColor={textSecondaryColor}
                        >
                          {user.imageGenerationBalance}{' '}
                        </Text>
                      </Text>
                    </Flex>
                    <Divider />
                    <Flex gap="12px" alignItems="center">
                      <IconBox
                        minW="34px"
                        minH="34px"
                        bg={boxBg}
                        icon={
                          <Icon
                            w="24px"
                            h="24px"
                            as={LuCircleDollarSign}
                            color={brandColor}
                          />
                        }
                      />
                      <Text fontSize="md">
                        Подписка:{' '}
                        <Text
                          display="inline"
                          fontSize="sm"
                          textColor={textSecondaryColor}
                        >
                          {user.subscriptions[0]?.status === 'active'
                            ? '✅ Активна'
                            : '🟥 Не активна'}
                        </Text>
                      </Text>
                    </Flex>
                  </Grid>
                </Box>
              </Box>
            </Flex>
            <Box width="100%">
              <Flex
                width="100%"
                direction="row-reverse"
                onClick={() => {
                  setUserDetailOpen!(true);
                  usersService.setCurrentUser(user);
                }}
              >
                <Button
                  width={{ base: '100%', xl: 'auto' }}
                  border="1px solid"
                  borderColor={borderColorButton}
                >
                  Детальная информация
                </Button>
              </Flex>
            </Box>
          </Flex>
        </Card>
      </Box>
    );
  };

  return (
    <Grid pb="44px">
      <Heading>Пользователи</Heading>
      <Box height="24px" />
      <Box h="8px" />
      <Box>
        <Flex mt="12px" mb="12px" gap="8px">
          <Heading size="md"> Количество пользователей: </Heading>
          <Heading size="md" fontWeight="700">
            {filteredUsers.length}
          </Heading>
        </Flex>
        <Flex gap="18px" mb="12px" flexWrap="wrap">
          <Checkbox
            isChecked={isCheckedAuth}
            onChange={() => setIsCheckedAuth((prev) => !prev)}
            s
            colorScheme="brandScheme"
          >
            Только авторизованные пользователи
          </Checkbox>
          <Checkbox
            isChecked={isCheckedSubs}
            onChange={() => setIsCheckedSubs((prev) => !prev)}
            colorScheme="brandScheme"
          >
            Только пользователи c подпиской
          </Checkbox>
        </Flex>
      </Box>
      {!!filteredUsers.length && (
        <WindowScroller scrollElement={window}>
          {({
            height,
            isScrolling,
            registerChild,
            onChildScroll,
            scrollTop,
          }) => (
            <AutoSizer disableHeight>
              {({ width }) => (
                <div ref={registerChild}>
                  <List
                    ref="List"
                    className="list-virualized"
                    height={height}
                    autoHeight
                    onScroll={onChildScroll}
                    overscanRowCount={10}
                    rowCount={filteredUsers.length}
                    scrollTop={scrollTop}
                    rowHeight={variant || 270}
                    rowRenderer={renderTr}
                    width={width}
                  />
                </div>
              )}
            </AutoSizer>
          )}
        </WindowScroller>
      )}
    </Grid>
  );
}
