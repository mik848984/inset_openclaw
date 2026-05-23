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
  // Sidebar всегда light — без useColorModeValue. Раньше при system
  // dark mode фон превращался в navy.800 и появлялась «тёмная подложка
  // + тёмно-серый drawer» — это ломало Apple-like premium consumer UI.
  const variantChange = '0.2s linear';
  const shadow = '14px 17px 40px 4px rgba(112, 144, 176, 0.08)';
  const sidebarBg = 'white';
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
  // Drawer всегда light, иконка-гамбургер тёмная — соответствует
  // премиальному светлому интерфейсу ИИСеть. Не зависит от system
  // dark mode.
  const sidebarBackgroundColor = 'white';
  const menuColor = 'gray.500';
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
          // Нейтральный overlay (slate, не navy) + лёгкий blur. Раньше
          // overlay был чисто чёрный, и сквозь него просвечивал
          // дефолтный navy.800 body — выглядело как «тёмно-синяя сцена
          // под тёмным drawer».
          bg="rgba(15,23,42,0.24)"
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
          // Opaque белый — не #fff с alpha, чтобы 100% перекрыть navy
          // body за drawer, даже если страница в dark mode.
          bg={sidebarBackgroundColor}
          color="#111827"
          boxShadow="0 1px 2px rgba(15,23,42,0.04), 24px 0 48px -18px rgba(15,23,42,0.18)"
        >
          <DrawerCloseButton
            zIndex="3"
            top="14px"
            right="14px"
            borderRadius="9999px"
            color="#6b7280"
            onClick={() => setSideBarOpen!(false)}
            _focus={{ boxShadow: 'none' }}
            _hover={{ boxShadow: 'none', color: '#111827', bg: 'rgba(15,23,42,0.04)' }}
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
