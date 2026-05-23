'use client';
// Chakra imports
import { Flex, Link } from '@chakra-ui/react';

import { HorizonLogo } from '@/components/icons/Icons';
import { HSeparator } from '@/components/separator/Separator';

export function SidebarBrand() {
  // Sidebar всегда light — фиксированный тёмный цвет лого, без
  // useColorModeValue, чтобы system dark mode не делал лого белым
  // на белом фоне.
  const logoColor = 'navy.700';

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
