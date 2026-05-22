'use client';
// Minimal Apple-like auth shell: full viewport, centered, calm
import { Box, Flex, Icon, Text, useColorModeValue } from '@chakra-ui/react';
import { FaChevronLeft } from 'react-icons/fa';
import NavLink from '@/components/link/NavLink';
import { PropsWithChildren } from 'react';

interface DefaultAuthLayoutProps extends PropsWithChildren {
  children: JSX.Element;
  // Kept for backward compat — visually NOT used in the new minimal layout
  illustrationBackground?: string;
}

// ── Apple typography ──────────────────────────────────────────────
const FONT_APPLE_TEXT = `'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif`;

export default function DefaultAuthLayout(props: DefaultAuthLayoutProps) {
  const { children } = props;

  // ── Calm page tokens ────────────────────────────────────────────
  const pageBg = useColorModeValue('#f5f5f7', '#070b16');
  const ambientHighlight = useColorModeValue(
    'radial-gradient(circle at 50% 18%, rgba(126,89,255,0.06) 0%, transparent 50%)',
    'radial-gradient(circle at 50% 22%, rgba(126,89,255,0.12) 0%, transparent 50%)',
  );
  const backPillBg = useColorModeValue(
    'rgba(255,255,255,0.62)',
    'rgba(13,18,34,0.62)',
  );
  const backPillBorder = useColorModeValue(
    'rgba(0,0,0,0.08)',
    'rgba(255,255,255,0.10)',
  );
  const textPrimary = useColorModeValue('#1d1d1f', '#f5f5f7');
  const textSecondary = useColorModeValue('#6e6e73', 'rgba(245,245,247,0.68)');

  return (
    <Box
      position="relative"
      minH="100dvh"
      bg={pageBg}
      fontFamily={FONT_APPLE_TEXT}
      overflowX="hidden"
      width="100%"
      maxWidth="100%"
      sx={{
        // Single barely-visible radial highlight behind the centered logo
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: '0',
          background: ambientHighlight,
          pointerEvents: 'none',
          zIndex: 0,
        },
      }}
    >
      <Flex
        position="relative"
        zIndex={1}
        direction="column"
        minH="100dvh"
        width="100%"
        maxWidth="100%"
        minWidth={0}
      >
        {/* Back to chat — small Apple glass pill */}
        <Box
          position="absolute"
          top={{ base: '14px', md: '20px' }}
          left={{ base: '14px', md: '24px' }}
          zIndex={5}
        >
          <NavLink
            href="/chat"
            styles={{ display: 'inline-flex', textDecoration: 'none' }}
          >
            <Flex
              align="center"
              gap="6px"
              px={{ base: '11px', md: '13px' }}
              py={{ base: '7px', md: '8px' }}
              bg={backPillBg}
              border="1px solid"
              borderColor={backPillBorder}
              borderRadius="9999px"
              backdropFilter="blur(20px) saturate(180%)"
              sx={{ WebkitBackdropFilter: 'blur(20px) saturate(180%)' }}
              transition="background 0.16s ease, border-color 0.16s ease"
              _hover={{ borderColor: 'rgba(0,102,204,0.30)' }}
            >
              <Icon
                as={FaChevronLeft}
                w="10px"
                h="10px"
                color={textSecondary}
              />
              <Text
                fontSize={{ base: '13px', md: '14px' }}
                fontWeight="500"
                letterSpacing="-0.15px"
                color={textPrimary}
              >
                Вернуться в чат
              </Text>
            </Flex>
          </NavLink>
        </Box>

        {/* Centered content */}
        <Flex
          flex="1 1 auto"
          align="center"
          justify="center"
          width="100%"
          maxWidth="100%"
          minWidth={0}
          px={{ base: '16px', md: '24px' }}
          py={{ base: '72px', md: '64px' }}
        >
          {children}
        </Flex>
      </Flex>
    </Box>
  );
}
