'use client';
// Chakra imports
import { Flex, Link, useColorModeValue } from '@chakra-ui/react';

import { HorizonLogo } from '@/components/icons/Icons';
import { HSeparator } from '@/components/separator/Separator';

export function SidebarBrand() {
  // Theme-aware logo: тёмный текст на светлом sidebar, светлый на
  // тёмном. Не белый на белом, не тёмный на тёмном.
  const logoColor = useColorModeValue('navy.700', 'whiteAlpha.900');

  return (
    <Flex alignItems="center" flexDirection="column">
      <Link href="/" _hover={{ textDecoration: 'none' }}>
        <HorizonLogo h="45px" w="200px" mb="24px" mt="8px" color={logoColor} />
      </Link>
      <HSeparator mb="20px" w="284px" />
    </Flex>
  );
}

export default SidebarBrand;
