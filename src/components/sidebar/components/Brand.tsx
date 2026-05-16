'use client';
// Chakra imports
import { Flex, Link, useColorModeValue } from '@chakra-ui/react';

import { HorizonLogo } from '@/components/icons/Icons';
import { HSeparator } from '@/components/separator/Separator';

export function SidebarBrand() {
  //   Chakra color mode
  let logoColor = useColorModeValue('navy.700', 'white');

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
