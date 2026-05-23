'use client';
// chakra imports
import {
  Box,
  Button,
  Flex,
  Icon,
  Stack,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
//   Custom components
import { NextAvatar } from '@/components/image/Avatar';
import Brand from '@/components/sidebar/components/Brand';
import Links from '@/components/sidebar/components/Links';
import React, { PropsWithChildren, useContext } from 'react';
import { IRoute } from '@/types/navigation';
import { FiLogOut } from 'react-icons/fi';
import { useAppSession } from '@/utils/hooks/useAppSession';
import Link from 'next/link';
import Card from '@/components/card/Card';
import { mode } from '@chakra-ui/theme-tools';
import { signOut } from 'next-auth/react';
import { ModalContext } from '@/contexts/ModalContext';
import { useRouter } from 'next/navigation';
import SidebarCard from '@/components/sidebar/components/SidebarCard';
import ProjectSidebarSection from '@/components/sidebar/components/ProjectSidebarSection';

// FUNCTIONS

interface SidebarContent extends PropsWithChildren {
  routes: IRoute[];
  [x: string]: any;
}

function SidebarContent(props: SidebarContent) {
  const router = useRouter();
  const { session, isAnonymous } = useAppSession();
  const { setSideBarOpen } = useContext(ModalContext);

  const { routes, setApiKey } = props;
  const textColor = useColorModeValue('navy.700', 'white');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.300');
  const shadowPillBar = useColorModeValue(
    '4px 17px 40px 4px rgba(112, 144, 176, 0.08)',
    'none',
  );

  return (
    <Flex
      direction="column"
      height="100%"
      pt="20px"
      pb="12px"
      borderRadius="30px"
      maxW="285px"
      px="20px"
    >
      <Brand />
      <Stack
        direction="column"
        mb="auto"
        mt="8px"
        overflowY="auto"
        sx={{
          '::-webkit-scrollbar': { width: '4px' },
          '::-webkit-scrollbar-thumb': {
            background: 'rgba(127,127,127,0.25)',
            borderRadius: '999px',
          },
        }}
      >
        <Box ps="0px" pe={{ md: '0px', '2xl': '0px' }}>
          <Links routes={routes} />
        </Box>
        <ProjectSidebarSection />
      </Stack>
      <SidebarCard />
      <Box h="24px" />
      <Card
        m={0}
        p={0}
        boxShadow={
          mode(
            '0px 0px 37px -5px rgba(112, 144, 176, 0.15)' as any,
            'unset',
          ) as any
        }
      >
        <Flex
          justifyContent="space-between"
          alignItems="center"
          boxShadow={shadowPillBar}
          borderRadius="30px"
          p="14px"
          gap="12px"
        >
          <Link href="/profile" onClick={() => setSideBarOpen!(false)}>
            <Flex w="100%" alignItems="center">
              <NextAvatar
                minW="34px"
                h="34px"
                w="34px"
                src={session?.user?.image}
                me="10px"
              />
              <Text color={textColor} fontSize="xs" fontWeight="600" me="10px">
                {isAnonymous ? 'Анонимный' : session?.user?.name}
              </Text>
            </Flex>
          </Link>
          <Button
            onClick={() => signOut({ redirectTo: '/others/sign-in' })}
            variant="transparent"
            border="1px solid"
            borderColor={borderColor}
            borderRadius="full"
            w="34px"
            h="34px"
            px="0px"
            minW="34px"
            justifyContent={'center'}
            alignItems="center"
          >
            <Icon as={FiLogOut} width="16px" height="16px" color="inherit" />
          </Button>
        </Flex>
      </Card>
    </Flex>
  );
}

export default SidebarContent;
