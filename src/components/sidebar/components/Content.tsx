'use client';
/**
 * Apple-like consumer sidebar для ИИСеть.
 *
 * Цель — личное рабочее пространство, а не админ-меню. Структура:
 *   • Brand (компактный)
 *   • «+ Новый запрос» — primary CTA в /chat
 *   • Primary nav: Чат · Поиск · Картинки · История
 *   • Проекты (через <ProjectSidebarSection/>)
 *   • «Ещё» — accordion с дополнительными разделами (шаблоны, агенты, блог)
 *   • «Администрирование» — accordion, ТОЛЬКО если в routes есть admin-paths
 *   • Bottom: profile + logout (logout-логика next-auth сохранена 1:1)
 *
 * Admin detection: routes уже отфильтрованы выше (см. app/layout.tsx + Sidebar.tsx
 * SidebarResponsive — `route.admin ? user?.isAdmin : true`). Здесь просто
 * категоризуем входящие routes по path и не показываем admin-раздел, если
 * соответствующих путей в routes нет.
 */

import {
  Box,
  Button,
  Collapse,
  Flex,
  Icon,
  Stack,
  Text,
} from '@chakra-ui/react';
import { NextAvatar } from '@/components/image/Avatar';
import Brand from '@/components/sidebar/components/Brand';
import ProjectSidebarSection from '@/components/sidebar/components/ProjectSidebarSection';
import React, { PropsWithChildren, Suspense, useContext, useMemo, useState } from 'react';
import { IRoute } from '@/types/navigation';
import {
  FiLogOut,
  FiChevronDown,
  FiChevronRight,
  FiMessageCircle,
  FiClock,
  FiPlus,
} from 'react-icons/fi';
import { useAppSession } from '@/utils/hooks/useAppSession';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { ModalContext } from '@/contexts/ModalContext';
import { usePathname } from 'next/navigation';

interface SidebarContent extends PropsWithChildren {
  routes: IRoute[];
  [x: string]: any;
}

const FONT_DISPLAY = `'SF Pro Display', -apple-system, BlinkMacSystemFont, system-ui, sans-serif`;
const FONT_TEXT = `'SF Pro Text', -apple-system, BlinkMacSystemFont, system-ui, sans-serif`;

const ACCENT_BLUE = '#0066cc';
const ACCENT_BLUE_HOVER = '#0071e3';

// ── Primary nav items ────────────────────────────────────────────
// Только Чат и История — поиск и картинки это РЕЖИМЫ внутри composer'а
// одного чата, а не отдельная навигация. Раньше показывали их как
// отдельные пункты — это вводило пользователя в заблуждение.
const PRIMARY_NAV = [
  { label: 'Чат', icon: FiMessageCircle, href: '/chat' },
  { label: 'История', icon: FiClock, href: '/dialogs' },
];

// Категоризация secondary/admin путей. routes.tsx сейчас не маркирует
// группы, поэтому делим по path. Кто меняет routes.tsx — пусть
// проверит здесь.
const SECONDARY_PATHS = new Set(['/all-templates', '/life-agents', '/blog']);
const ADMIN_PATHS = new Set(['/blog/admin', '/users']);

function SidebarContent(props: SidebarContent) {
  const { routes } = props;
  const pathname = usePathname() || '';
  const { session, isAnonymous } = useAppSession();
  const { setSideBarOpen } = useContext(ModalContext);

  // ── Tokens (фиксированно light) ─────────────────────────────
  // useColorModeValue убран сознательно: sidebar/drawer должны быть
  // светлым Apple-like premium UI независимо от system dark mode.
  // Раньше dark mode превращал sidebar в navy admin-панель.
  const surface = '#ffffff';
  const surfaceSoft = '#f7f8fb';
  const hairline = 'rgba(15,23,42,0.08)';
  const hairlineSoft = 'rgba(15,23,42,0.05)';
  const itemHoverBg = 'rgba(15,23,42,0.04)';
  const activeBg = 'rgba(0,113,227,0.08)'; // soft Apple-blue tint
  const textPrimary = '#111827';
  const textSecondary = '#6b7280';
  const textTertiary = '#9ca3af';
  const accent = ACCENT_BLUE;

  // ── Categorize received routes ────────────────────────────────
  const { secondaryRoutes, adminRoutes } = useMemo(() => {
    const sec: IRoute[] = [];
    const adm: IRoute[] = [];
    for (const r of routes || []) {
      if (ADMIN_PATHS.has(r.path)) adm.push(r);
      else if (SECONDARY_PATHS.has(r.path)) sec.push(r);
      // Чат/история уже в PRIMARY_NAV — не дублируем.
    }
    return { secondaryRoutes: sec, adminRoutes: adm };
  }, [routes]);

  const [moreOpen, setMoreOpen] = useState(true);
  const [adminOpen, setAdminOpen] = useState(false);

  const closeDrawerIfMobile = () => setSideBarOpen?.(false);
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  // ── Item renderer ─────────────────────────────────────────────
  const NavItem = ({
    icon,
    label,
    href,
    active,
  }: {
    icon: any;
    label: string;
    href: string;
    active?: boolean;
  }) => (
    <Box
      as={Link}
      href={href}
      onClick={closeDrawerIfMobile}
      display="flex"
      alignItems="center"
      gap="10px"
      px="12px"
      h="36px"
      borderRadius="10px"
      bg={active ? activeBg : 'transparent'}
      color={active ? accent : textPrimary}
      textDecoration="none"
      cursor="pointer"
      transition="background-color 0.14s ease, color 0.14s ease"
      _hover={{ bg: active ? activeBg : itemHoverBg }}
      sx={{ WebkitTapHighlightColor: 'transparent' }}
    >
      <Icon as={icon} boxSize="16px" flexShrink={0} />
      <Text
        fontFamily={FONT_TEXT}
        fontSize="14px"
        fontWeight={active ? 600 : 500}
        letterSpacing="-0.12px"
        noOfLines={1}
        flex="1 1 auto"
        minW={0}
      >
        {label}
      </Text>
    </Box>
  );

  const SecondaryItem = ({ route }: { route: IRoute }) => {
    const href = route.layout ? route.layout + route.path : route.path;
    const active = isActive(href);
    return (
      <Box
        as={Link}
        href={href}
        onClick={closeDrawerIfMobile}
        display="flex"
        alignItems="center"
        gap="10px"
        px="12px"
        h="34px"
        borderRadius="10px"
        bg={active ? activeBg : 'transparent'}
        color={active ? accent : textSecondary}
        textDecoration="none"
        cursor="pointer"
        transition="background-color 0.14s ease, color 0.14s ease"
        _hover={{ bg: active ? activeBg : itemHoverBg, color: active ? accent : textPrimary }}
        sx={{ WebkitTapHighlightColor: 'transparent' }}
      >
        {route.icon ? (
          <Box display="flex" alignItems="center" justifyContent="center" boxSize="16px" flexShrink={0}>
            {route.icon}
          </Box>
        ) : null}
        <Text
          fontFamily={FONT_TEXT}
          fontSize="13px"
          fontWeight={active ? 600 : 500}
          letterSpacing="-0.1px"
          noOfLines={1}
          flex="1 1 auto"
          minW={0}
        >
          {route.name}
        </Text>
      </Box>
    );
  };

  const SectionHeader = ({
    label,
    open,
    onToggle,
  }: {
    label: string;
    open: boolean;
    onToggle: () => void;
  }) => (
    <Flex
      as="button"
      type="button"
      onClick={onToggle}
      align="center"
      justify="space-between"
      gap="6px"
      w="100%"
      px="12px"
      py="6px"
      bg="transparent"
      cursor="pointer"
      _hover={{ color: textPrimary }}
      transition="color 0.14s ease"
      sx={{ WebkitTapHighlightColor: 'transparent' }}
      color={textTertiary}
    >
      <Text
        fontFamily={FONT_TEXT}
        fontSize="11px"
        fontWeight="700"
        letterSpacing="0.5px"
        textTransform="uppercase"
      >
        {label}
      </Text>
      <Icon as={open ? FiChevronDown : FiChevronRight} boxSize="12px" />
    </Flex>
  );

  // ── Bottom auth block ─────────────────────────────────────────
  // КРИТИЧНО: логику login/logout не трогаем — только визуал. signOut
  // из next-auth и Link на /profile сохранены 1:1.
  const userName = session?.user?.name || (isAnonymous ? 'Анонимный' : '');
  const BottomAuth = (
    <Flex
      align="center"
      gap="10px"
      px="10px"
      py="8px"
      borderRadius="14px"
      bg={surfaceSoft}
      border="1px solid"
      borderColor={hairlineSoft}
      mx="8px"
      minW={0}
    >
      <Link
        href="/profile"
        onClick={closeDrawerIfMobile}
        style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: '1 1 auto', minWidth: 0, textDecoration: 'none' }}
      >
        <NextAvatar
          minW="30px"
          h="30px"
          w="30px"
          src={session?.user?.image}
        />
        <Text
          fontFamily={FONT_TEXT}
          fontSize="13px"
          fontWeight="600"
          color={textPrimary}
          noOfLines={1}
          letterSpacing="-0.1px"
          flex="1 1 auto"
          minW={0}
        >
          {userName}
        </Text>
      </Link>
      <Button
        onClick={() => signOut({ redirectTo: '/others/sign-in' })}
        variant="ghost"
        borderRadius="9999px"
        w="32px"
        h="32px"
        minW="32px"
        px="0"
        color={textSecondary}
        _hover={{ bg: itemHoverBg, color: textPrimary }}
        aria-label="Выйти"
        title="Выйти"
        flexShrink={0}
      >
        <Icon as={FiLogOut} boxSize="15px" />
      </Button>
    </Flex>
  );

  return (
    <Flex
      direction="column"
      height="100%"
      pt="14px"
      pb="10px"
      borderRadius="20px"
      maxW={{ base: '100%', xl: '300px' }}
      px="10px"
      bg={surface}
    >
      {/* Brand — компактнее */}
      <Box px="12px" mb="14px">
        <Brand />
      </Box>

      {/* Primary CTA: + Новый запрос */}
      <Box px="8px" mb="14px">
        <Box
          as={Link}
          href="/chat"
          onClick={closeDrawerIfMobile}
          display="flex"
          alignItems="center"
          gap="8px"
          h="36px"
          px="14px"
          borderRadius="9999px"
          bg={accent}
          color="white"
          textDecoration="none"
          fontFamily={FONT_TEXT}
          fontSize="14px"
          fontWeight="500"
          letterSpacing="-0.1px"
          boxShadow="0 1px 2px rgba(15,23,42,0.05), 0 8px 24px -16px rgba(0,102,204,0.32)"
          _hover={{ bg: ACCENT_BLUE_HOVER }}
          _active={{ transform: 'scale(0.98)' }}
          transition="background-color 0.15s ease, transform 0.12s ease"
          sx={{ WebkitTapHighlightColor: 'transparent' }}
        >
          <Icon as={FiPlus} boxSize="16px" />
          <Text>Новый запрос</Text>
        </Box>
      </Box>

      {/* Scrollable middle: nav + projects + accordions */}
      <Stack
        direction="column"
        mb="auto"
        mt="0"
        spacing="14px"
        overflowY="auto"
        sx={{
          '::-webkit-scrollbar': { width: '4px' },
          '::-webkit-scrollbar-thumb': {
            background: 'rgba(127,127,127,0.22)',
            borderRadius: '999px',
          },
        }}
      >
        {/* Primary nav */}
        <Box px="2px">
          {PRIMARY_NAV.map((it) => (
            <NavItem
              key={it.label}
              icon={it.icon}
              label={it.label}
              href={it.href}
              active={
                it.label === 'История'
                  ? pathname.startsWith('/dialogs')
                  : pathname.startsWith('/chat')
              }
            />
          ))}
        </Box>

        {/* Projects (existing, polished) — Suspense нужен под
            useSearchParams внутри ProjectSidebarSection. */}
        <Suspense fallback={null}>
          <ProjectSidebarSection />
        </Suspense>

        {/* «Ещё» — secondary routes, по умолчанию свёрнуто-открыто
            (open=true), чтобы пользователь сразу видел шаблоны и
            агентов, но визуально это вторая категория. */}
        {secondaryRoutes.length > 0 && (
          <Box>
            <SectionHeader
              label="Ещё"
              open={moreOpen}
              onToggle={() => setMoreOpen((v) => !v)}
            />
            <Collapse in={moreOpen} animateOpacity unmountOnExit>
              <Stack direction="column" spacing="2px" mt="4px" px="2px">
                {secondaryRoutes.map((r) => (
                  <SecondaryItem key={r.path} route={r} />
                ))}
              </Stack>
            </Collapse>
          </Box>
        )}

        {/* «Администрирование» — только если route с admin-path реально
            пришёл (значит, текущий пользователь — админ). */}
        {adminRoutes.length > 0 && (
          <Box>
            <SectionHeader
              label="Администрирование"
              open={adminOpen}
              onToggle={() => setAdminOpen((v) => !v)}
            />
            <Collapse in={adminOpen} animateOpacity unmountOnExit>
              <Stack direction="column" spacing="2px" mt="4px" px="2px">
                {adminRoutes.map((r) => (
                  <SecondaryItem key={r.path} route={r} />
                ))}
              </Stack>
            </Collapse>
          </Box>
        )}
      </Stack>

      {/* Bottom auth — компактный блок, login/logout не тронут */}
      <Box mt="10px">{BottomAuth}</Box>
    </Flex>
  );
}

export default SidebarContent;
