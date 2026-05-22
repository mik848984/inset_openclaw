'use client';
// Apple Liquid Glass template tile — used by /all-templates, /life-agents,
// /admin/all-admin-templates. Public props interface is preserved 1:1.
import {
  Box,
  Button,
  Flex,
  Icon,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { MdEdit } from 'react-icons/md';
import NavLink from '../link/NavLink';

// ── Apple typography ──────────────────────────────────────────────
const FONT_APPLE_TEXT = `'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif`;
const FONT_APPLE_DISPLAY = `'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif`;

export default function Default(props: {
  illustration: string | JSX.Element;
  name: string;
  description: string;
  link: string;
  edit?: string;
  action?: any;
  admin?: boolean;
}) {
  const { illustration, name, description, link, edit, admin } = props;

  // ── Apple Liquid Glass tokens ─────────────────────────────────
  const cardBg = useColorModeValue(
    'rgba(255,255,255,0.72)',
    'rgba(13,18,34,0.62)',
  );
  const cardBgHover = useColorModeValue(
    'rgba(255,255,255,0.86)',
    'rgba(13,18,34,0.78)',
  );
  const borderGlass = useColorModeValue(
    'rgba(0,0,0,0.06)',
    'rgba(255,255,255,0.10)',
  );
  const borderHover = useColorModeValue(
    'rgba(0,102,204,0.28)',
    'rgba(41,151,255,0.34)',
  );
  const cardShadow = useColorModeValue(
    'inset 0 1px 0 rgba(255,255,255,0.65), 0 1px 2px rgba(0,0,0,0.03), 0 18px 50px rgba(15,23,42,0.06)',
    'inset 0 1px 0 rgba(255,255,255,0.10), 0 1px 2px rgba(0,0,0,0.14), 0 18px 50px rgba(0,0,0,0.24)',
  );
  const cardShadowHover = useColorModeValue(
    'inset 0 1px 0 rgba(255,255,255,0.65), 0 6px 16px rgba(0,0,0,0.06), 0 28px 60px rgba(15,23,42,0.10)',
    'inset 0 1px 0 rgba(255,255,255,0.10), 0 6px 16px rgba(0,0,0,0.20), 0 28px 60px rgba(0,0,0,0.34)',
  );
  const titleColor = useColorModeValue('#1d1d1f', '#f5f5f7');
  const descColor = useColorModeValue('#6e6e73', 'rgba(245,245,247,0.66)');
  const accentBlue = useColorModeValue('#0066cc', '#2997ff');
  const iconWellBg = useColorModeValue(
    'rgba(0,102,204,0.07)',
    'rgba(41,151,255,0.14)',
  );
  const iconWellBorder = useColorModeValue(
    'rgba(255,255,255,0.62)',
    'rgba(255,255,255,0.10)',
  );
  const editBtnBg = useColorModeValue(
    'rgba(255,255,255,0.62)',
    'rgba(255,255,255,0.06)',
  );
  const editBtnHoverBg = useColorModeValue(
    'rgba(255,255,255,0.88)',
    'rgba(255,255,255,0.12)',
  );
  const editIconColor = useColorModeValue('#6e6e73', 'rgba(245,245,247,0.66)');

  // Detect emoji vs JSX illustration
  const isEmoji = typeof illustration === 'string';

  return (
    <NavLink href={link} styles={{ display: 'block', height: '100%' }}>
      <Box
        h="100%"
        minH={{ base: '200px', md: '220px' }}
        bg={cardBg}
        backdropFilter="blur(20px) saturate(180%)"
        border="1px solid"
        borderColor={borderGlass}
        boxShadow={cardShadow}
        borderRadius={{ base: '24px', md: '28px' }}
        p={{ base: '20px', md: '22px' }}
        cursor="pointer"
        transition="background 0.2s ease, border-color 0.2s ease, transform 0.2s ease, box-shadow 0.22s ease"
        fontFamily={FONT_APPLE_TEXT}
        position="relative"
        sx={{
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        }}
        _hover={{
          bg: cardBgHover,
          borderColor: borderHover,
          transform: 'translateY(-3px)',
          boxShadow: cardShadowHover,
        }}
        _active={{ transform: 'translateY(-1px)' }}
        display="flex"
        flexDirection="column"
        width="100%"
        maxWidth="100%"
        minWidth={0}
      >
        {/* Top row: icon well + optional admin edit */}
        <Flex align="flex-start" w="100%" mb={{ base: '14px', md: '18px' }}>
          {/* Icon well — glass square */}
          <Flex
            align="center"
            justify="center"
            w={{ base: '56px', md: '60px' }}
            h={{ base: '56px', md: '60px' }}
            minW={{ base: '56px', md: '60px' }}
            borderRadius={{ base: '16px', md: '18px' }}
            bg={iconWellBg}
            border="1px solid"
            borderColor={iconWellBorder}
            backdropFilter="blur(14px) saturate(160%)"
            sx={{ WebkitBackdropFilter: 'blur(14px) saturate(160%)' }}
            flexShrink={0}
            overflow="hidden"
          >
            {isEmoji ? (
              <Text
                fontSize={{ base: '28px', md: '32px' }}
                lineHeight="1"
                userSelect="none"
              >
                {illustration}
              </Text>
            ) : (
              <Box display="flex" alignItems="center" justifyContent="center">
                {illustration}
              </Box>
            )}
          </Flex>

          {/* Admin edit button — compact glass circle */}
          {admin && (
            <Flex ms="auto" flexShrink={0}>
              <NavLink href={edit ? edit : '/admin/edit-template'}>
                <Button
                  w="32px"
                  h="32px"
                  minW="32px"
                  p="0"
                  borderRadius="9999px"
                  bg={editBtnBg}
                  border="1px solid"
                  borderColor={borderGlass}
                  backdropFilter="blur(14px) saturate(160%)"
                  sx={{ WebkitBackdropFilter: 'blur(14px) saturate(160%)' }}
                  _hover={{
                    bg: editBtnHoverBg,
                    borderColor: borderHover,
                  }}
                  _focus={{}}
                  _active={{ transform: 'scale(0.94)' }}
                  transition="background 0.16s ease, border-color 0.16s ease, transform 0.12s ease"
                >
                  <Icon w="15px" h="15px" as={MdEdit} color={editIconColor} />
                </Button>
              </NavLink>
            </Flex>
          )}
        </Flex>

        {/* Text content */}
        <Box minWidth={0}>
          <Text
            fontFamily={FONT_APPLE_DISPLAY}
            fontSize={{ base: '17px', md: '19px' }}
            fontWeight="600"
            lineHeight="1.25"
            letterSpacing="-0.2px"
            color={titleColor}
            mb="8px"
            wordBreak="break-word"
            noOfLines={2}
          >
            {name}
          </Text>
          <Text
            fontFamily={FONT_APPLE_TEXT}
            fontSize={{ base: '13px', md: '14px' }}
            lineHeight="1.55"
            letterSpacing="-0.1px"
            color={descColor}
            noOfLines={3}
          >
            {description}
          </Text>
        </Box>

        {/* Bottom micro-link */}
        <Text
          mt="auto"
          pt={{ base: '14px', md: '18px' }}
          fontFamily={FONT_APPLE_TEXT}
          fontSize="13px"
          fontWeight="600"
          letterSpacing="-0.1px"
          color={accentBlue}
        >
          Открыть →
        </Text>
      </Box>
    </NavLink>
  );
}
