'use client';
// Chakra Imports
import {
  Box,
  Flex,
  Icon,
  IconButton,
  Link,
  Menu,
  useColorMode,
  useColorModeValue,
} from '@chakra-ui/react';
import { SidebarResponsive } from '@/components/sidebar/Sidebar';
import { IoMdMoon, IoMdSunny } from 'react-icons/io';
import routes from '@/routes';
import React from 'react';
import { NextAvatar } from '@/components/image/Avatar';
import { useAppSession } from '@/utils/hooks/useAppSession';
import { useUser } from '@/utils/hooks/useUser';

export default function NavbarLinksAdmin(props: { secondary: boolean }) {
  const { user } = useUser(false);
  const { session, isAnonymous } = useAppSession();
  const { secondary } = props;
  const { colorMode, toggleColorMode } = useColorMode();

  // ── Apple/VisionOS glass capsule tokens ─────────────────────────
  const capsuleBg = useColorModeValue(
    'rgba(255,255,255,0.52)',
    'rgba(10,14,28,0.55)',
  );
  const capsuleBorder = useColorModeValue(
    'rgba(255,255,255,0.65)',
    'rgba(255,255,255,0.14)',
  );
  // Multi-layer Apple-like shadow + inset highlights
  const capsuleShadow = useColorModeValue(
    [
      'inset 0 1px 0 rgba(255,255,255,0.65)',
      'inset 0 -1px 0 rgba(255,255,255,0.10)',
      '0 18px 45px rgba(31,38,70,0.14)',
      '0 2px 6px rgba(31,38,70,0.06)',
    ].join(', '),
    [
      'inset 0 1px 0 rgba(255,255,255,0.10)',
      'inset 0 -1px 0 rgba(0,0,0,0.30)',
      '0 18px 45px rgba(0,0,0,0.32)',
      '0 2px 6px rgba(0,0,0,0.18)',
    ].join(', '),
  );

  // ::before glass top-shine gradient
  const glassShineGradient = useColorModeValue(
    'linear-gradient(180deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.08) 60%, rgba(255,255,255,0) 100%)',
    'linear-gradient(180deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.04) 60%, rgba(255,255,255,0) 100%)',
  );

  // Icon colors — обеспечивают visibility на light theme
  const navIconColor = useColorModeValue('#1d1d1f', '#f5f5f7');
  const iconBtnHoverBg = useColorModeValue(
    'rgba(255,255,255,0.55)',
    'rgba(255,255,255,0.10)',
  );
  const iconBtnActiveBg = useColorModeValue(
    'rgba(0,102,204,0.10)',
    'rgba(41,151,255,0.16)',
  );
  const avatarRing = useColorModeValue(
    'rgba(255,255,255,0.78)',
    'rgba(255,255,255,0.20)',
  );
  const avatarShadow = useColorModeValue(
    '0 1px 3px rgba(0,0,0,0.10)',
    '0 1px 3px rgba(0,0,0,0.40)',
  );

  const filteredRoutes = routes.filter((route) => {
    if (route.admin) {
      return user?.isAdmin;
    }

    return true;
  });

  return (
    <Flex
      gap={{ base: '6px', md: '4px' }}
      zIndex="100"
      w="auto"
      maxWidth="calc(100vw - 32px)"
      minWidth={0}
      alignItems="center"
      flexDirection="row"
      justifyContent="flex-start"
      bg={capsuleBg}
      backdropFilter="blur(22px) saturate(180%)"
      sx={{
        WebkitBackdropFilter: 'blur(22px) saturate(180%)',
        position: 'relative',
        // Apple glass top-shine highlight
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: '1px',
          borderRadius: 'inherit',
          pointerEvents: 'none',
          background: glassShineGradient,
          opacity: 0.85,
          zIndex: 0,
        },
        // Override SidebarResponsive menu icon — gray.400 → tinted ink color
        '& [class*="chakra-icon"]': {
          color: navIconColor,
        },
        '& svg': {
          color: navIconColor,
        },
        // Keep contents above the ::before pseudo
        '& > *': {
          position: 'relative',
          zIndex: 1,
        },
      }}
      flexWrap={secondary ? { base: 'wrap', md: 'nowrap' } : 'unset'}
      px={{ base: '6px', md: '5px' }}
      py={{ base: '6px', md: '5px' }}
      borderRadius="9999px"
      border="1px solid"
      borderColor={capsuleBorder}
      boxShadow={capsuleShadow}
      flexShrink={0}
    >
      {/* Sidebar menu trigger — wrapped for unified hover & icon visibility */}
      <Box
        sx={{
          display: { sm: 'flex', xl: 'none' },
          alignItems: 'center',
          justifyContent: 'center',
          width: '36px',
          height: '36px',
          minWidth: '36px',
          flexShrink: 0,
          borderRadius: '9999px',
          transition: 'background 0.16s ease',
          cursor: 'pointer',
          '&:hover': { background: iconBtnHoverBg },
          '&:active': { background: iconBtnActiveBg },
          // Reset SidebarResponsive's inner Icon overrides
          '& > div, & > div > div': {
            width: '36px',
            height: '36px',
            margin: '0 !important',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          },
          '& svg': {
            width: '20px',
            height: '20px',
            margin: '0 !important',
            marginInlineEnd: '0 !important',
            color: navIconColor,
          },
        }}
      >
        <SidebarResponsive routes={filteredRoutes} />
      </Box>

      <Flex align="center" gap="2px">
        <IconButton
          variant="ghost"
          aria-label="Сменить тему"
          onClick={toggleColorMode}
          bg="transparent"
          w="36px"
          h="36px"
          minW="36px"
          borderRadius="9999px"
          flexShrink={0}
          transition="background 0.16s ease, transform 0.12s ease"
          _hover={{ bg: iconBtnHoverBg }}
          _active={{ bg: iconBtnActiveBg, transform: 'scale(0.94)' }}
        >
          <Icon
            h="17px"
            w="17px"
            color={navIconColor}
            as={colorMode === 'light' ? IoMdMoon : IoMdSunny}
          />
        </IconButton>

        <Menu>
          <Link
            href="/profile"
            display="flex"
            alignItems="center"
            justifyContent="center"
            w="36px"
            h="36px"
            borderRadius="9999px"
            transition="transform 0.12s ease"
            _hover={{ transform: 'scale(1.05)' }}
            _active={{ transform: 'scale(0.94)' }}
          >
            <NextAvatar
              src={session?.user?.image as any}
              w="32px"
              h="32px"
              border="1.5px solid"
              borderColor={avatarRing}
              boxShadow={avatarShadow}
            />
          </Link>
        </Menu>
      </Flex>
    </Flex>
  );
}
