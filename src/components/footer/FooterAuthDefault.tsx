'use client';
/*eslint-disable*/

import {
  Flex,
  List,
  ListItem,
  Link,
  useColorModeValue,
} from '@chakra-ui/react';

// Apple-like font stack
const FONT_APPLE_TEXT = `'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif`;

export default function Footer() {
  const textColor = useColorModeValue('#6e6e73', 'rgba(245,245,247,0.68)');
  const accentBlue = useColorModeValue('#0066cc', '#2997ff');

  return (
    <Flex
      zIndex="3"
      flexDirection={{
        base: 'column',
        lg: 'row',
      }}
      alignItems="center"
      justifyContent="center"
      gap={{ base: '10px', lg: '24px' }}
      px={{ base: '24px', md: '32px' }}
      pb={{ base: '20px', md: '24px' }}
      pt={{ base: '12px', md: '0px' }}
      fontFamily={FONT_APPLE_TEXT}
    >
      <List
        display="flex"
        flexDirection={{ base: 'column', sm: 'row' }}
        alignItems="center"
        gap={{ base: '8px', sm: '24px' }}
      >
        <ListItem>
          <Link
            fontWeight="500"
            fontSize={{ base: '13px', md: '14px' }}
            letterSpacing="-0.1px"
            color={textColor}
            isExternal
            target="_blank"
            rel="noopener noreferrer"
            href="https://telegra.ph/Polzovatelskoe-soglashenie-03-05-7"
            textDecoration="none"
            transition="color 0.16s ease"
            _hover={{ color: accentBlue, textDecoration: 'none' }}
          >
            Пользовательское соглашение
          </Link>
        </ListItem>
        <ListItem>
          <Link
            fontWeight="500"
            fontSize={{ base: '13px', md: '14px' }}
            letterSpacing="-0.1px"
            color={textColor}
            isExternal
            target="_blank"
            rel="noopener noreferrer"
            href="https://telegra.ph/Politika-konfidencialnosti-03-05-7"
            textDecoration="none"
            transition="color 0.16s ease"
            _hover={{ color: accentBlue, textDecoration: 'none' }}
          >
            Политика конфиденциальности
          </Link>
        </ListItem>
      </List>
    </Flex>
  );
}
