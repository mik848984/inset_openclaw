'use client';
import React, { PropsWithChildren, useContext } from 'react';

// chakra imports
import {
  Box,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerOverlay,
  Flex,
  Icon,
  useColorModeValue,
} from '@chakra-ui/react';
import Content from '@/components/sidebar/components/Content';

import { IoMenuOutline } from 'react-icons/io5';
import { IRoute } from '@/types/navigation';
import { isWindowAvailable } from '@/utils/navigation';
import { ModalContext } from '@/contexts/ModalContext';
import { useUser } from '@/utils/hooks/useUser';

export interface SidebarProps extends PropsWithChildren {
  routes: IRoute[];
  [x: string]: any;
}

function Sidebar(props: SidebarProps) {
  const { routes, setApiKey } = props;
  // Theme-aware sidebar. Светлый при light theme, графит при dark.
  // Раньше hardcode-или белый — на dark-странице получалось белое
  // окно посреди тёмного интерфейса. Теперь sidebar совпадает с темой.
  // НЕ используем navy.* — это слишком админский синий.
  const variantChange = '0.2s linear';
  const shadow = useColorModeValue(
    '14px 17px 40px 4px rgba(112, 144, 176, 0.08)',
    '0 1px 2px rgba(0,0,0,0.30), 24px 0 48px -18px rgba(0,0,0,0.40)',
  );
  const sidebarBg = useColorModeValue('white', '#15161a');
  const sidebarRadius = '14px';
  const sidebarMargins = '0px';
  // SIDEBAR
  return (
    <Box display={{ base: 'none', xl: 'block' }} position="fixed" minH="100%">
      <Box
        bg={sidebarBg}
        transition={variantChange}
        w="285px"
        ms={{
          sm: '16px',
        }}
        my={{
          sm: '16px',
        }}
        h="calc(100dvh - 32px)"
        m={sidebarMargins}
        borderRadius={sidebarRadius}
        minH="100%"
        overflowX="hidden"
        boxShadow={shadow}
      >
        <Content setApiKey={setApiKey} routes={routes} />
      </Box>
    </Box>
  );
}

// FUNCTIONS
export function SidebarResponsive(props: { routes: IRoute[] }) {
  // Drawer theme-aware: соответствует текущей теме страницы.
  // Иконка-гамбургер тёмная на свете, светлая на тёмной странице.
  const sidebarBackgroundColor = useColorModeValue('white', '#15161a');
  const menuColor = useColorModeValue('gray.500', 'whiteAlpha.700');
  const overlayBg = useColorModeValue(
    'rgba(15,23,42,0.24)',
    'rgba(0,0,0,0.45)',
  );
  const closeBtnColor = useColorModeValue('#6b7280', 'whiteAlpha.700');
  const closeBtnHoverBg = useColorModeValue(
    'rgba(15,23,42,0.04)',
    'rgba(255,255,255,0.08)',
  );
  const closeBtnHoverColor = useColorModeValue('#111827', 'white');
  const drawerText = useColorModeValue('#111827', '#f5f7fb');
  // // SIDEBAR
  const { sideBarOpen, setSideBarOpen } = useContext(ModalContext);

  const { routes } = props;
  const { user } = useUser(false);

  return (
    <Flex display={{ sm: 'flex', xl: 'none' }} alignItems="center">
      <Flex
        w="max-content"
        h="max-content"
        onClick={() => setSideBarOpen!(true)}
      >
        <Icon
          as={IoMenuOutline}
          color={menuColor}
          my="auto"
          w="20px"
          h="20px"
          me="10px"
          _hover={{ cursor: 'pointer' }}
        />
      </Flex>
      {/* ── Mobile drawer ────────────────────────────────────────
          portalProps.appendToParentPortal=false страхует от вложения
          в чужой Chakra Portal (например, project Modal внутри sidebar
          раньше оказывался под overlay). z-index на Chakra default
          `modal=1400` уже выше chat composer (z=20) и sticky bars.
          BlockScrollOnMount по умолчанию true — body не скроллится,
          drawer имеет свой скролл. Esc и overlay-click тоже default. */}
      <Drawer
        isOpen={!!sideBarOpen}
        onClose={() => setSideBarOpen!(false)}
        placement={
          isWindowAvailable() && document.documentElement.dir === 'rtl'
            ? 'right'
            : 'left'
        }
        size="xs"
        closeOnOverlayClick
        closeOnEsc
        portalProps={{ appendToParentPortal: false }}
      >
        <DrawerOverlay
          // Theme-aware нейтральный overlay. На светлой странице
          // лёгкий slate (24%), на тёмной — более насыщенный чёрный
          // (45%). НЕ навязываем синий цвет.
          bg={overlayBg}
          sx={{
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
          }}
        />
        <DrawerContent
          w={{ base: '92vw', sm: '360px' }}
          maxW="360px"
          my="0"
          ms="0"
          borderRadius="0"
          // Opaque фон — 100% перекрывает body за drawer, drawer
          // выглядит как часть текущей темы, а не белая шторка над
          // тёмным интерфейсом.
          bg={sidebarBackgroundColor}
          color={drawerText}
          boxShadow={useColorModeValue(
            '0 1px 2px rgba(15,23,42,0.04), 24px 0 48px -18px rgba(15,23,42,0.18)',
            '0 1px 2px rgba(0,0,0,0.30), 24px 0 48px -18px rgba(0,0,0,0.40)',
          )}
        >
          <DrawerCloseButton
            zIndex="3"
            top="14px"
            right="14px"
            borderRadius="9999px"
            color={closeBtnColor}
            onClick={() => setSideBarOpen!(false)}
            _focus={{ boxShadow: 'none' }}
            _hover={{
              boxShadow: 'none',
              color: closeBtnHoverColor,
              bg: closeBtnHoverBg,
            }}
          />
          <DrawerBody
            px="0"
            pb="calc(env(safe-area-inset-bottom) + 8px)"
            sx={{
              // Хочется чистого блюра без скроллбара внутри body.
              overflowY: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Content
              routes={routes.filter((route) => {
                if (route.admin) {
                  return user?.isAdmin;
                }

                return true;
              })}
            />
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Flex>
  );
}
// PROPS

export default Sidebar;
