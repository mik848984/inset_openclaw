'use client';
// Chakra Imports
import {
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
  const navbarIcon = useColorModeValue('gray.500', 'white');
  let menuBg = useColorModeValue('white', 'navy.800');
  const shadow = useColorModeValue(
    '14px 17px 40px 4px rgba(112, 144, 176, 0.18)',
    '0px 41px 75px #081132',
  );
  const buttonBg = useColorModeValue('transparent', 'navy.800');
  const hoverButton = useColorModeValue(
    { bg: 'gray.100' },
    { bg: 'whiteAlpha.100' },
  );
  const activeButton = useColorModeValue(
    { bg: 'gray.200' },
    { bg: 'whiteAlpha.200' },
  );

  const filteredRoutes = routes.filter((route) => {
    if (route.admin) {
      return user?.isAdmin;
    }

    return true;
  });

  return (
    <Flex
      gap="10px"
      zIndex="100"
      w={{ sm: '100%', md: 'auto' }}
      alignItems="center"
      flexDirection="row"
      justifyContent={{ base: 'space-between', md: 'flex-start' }}
      bg={menuBg}
      flexWrap={secondary ? { base: 'wrap', md: 'nowrap' } : 'unset'}
      p="10px"
      pl="15px"
      pr="15px"
      borderRadius="20px"
      boxShadow={shadow}
    >
      <SidebarResponsive routes={filteredRoutes} />
      <Flex align="center" gap="4px">
        <IconButton
          variant="ghost"
          aria-label="Сменить тему"
          onClick={toggleColorMode}
        >
          <Icon
            h="18px"
            w="18px"
            color={navbarIcon}
            as={colorMode === 'light' ? IoMdMoon : IoMdSunny}
          />
        </IconButton>

        <Menu>
          <Link href="/profile">
            <NextAvatar
              mx="auto"
              src={session?.user?.image as any}
              w="40px"
              h="40px"
            />
          </Link>
          {/*<MenuList*/}
          {/*    boxShadow={shadow}*/}
          {/*    p="0px"*/}
          {/*    mt="10px"*/}
          {/*    borderRadius="20px"*/}
          {/*    bg={menuBg}*/}
          {/*    border="none"*/}
          {/*>*/}
          {/*    <Flex w="100%" mb="0px">*/}
          {/*        <Text*/}
          {/*            ps="20px"*/}
          {/*            pt="16px"*/}
          {/*            pb="10px"*/}
          {/*            w="100%"*/}
          {/*            borderBottom="1px solid"*/}
          {/*            borderColor={borderColor}*/}
          {/*            fontSize="sm"*/}
          {/*            fontWeight="700"*/}
          {/*            color={textColor}*/}
          {/*        >*/}
          {/*            👋&nbsp; Hey, Adela*/}
          {/*        </Text>*/}
          {/*    </Flex>*/}
          {/*    <Flex flexDirection="column" p="10px">*/}
          {/*        <NavLink href="/settings">*/}
          {/*            <MenuItem*/}
          {/*                _hover={{bg: 'none'}}*/}
          {/*                _focus={{bg: 'none'}}*/}
          {/*                color={textColor}*/}
          {/*                borderRadius="8px"*/}
          {/*                px="14px"*/}
          {/*            >*/}
          {/*                <Text fontWeight="500" fontSize="sm">*/}
          {/*                    Profile Settings*/}
          {/*                </Text>*/}
          {/*            </MenuItem>*/}
          {/*        </NavLink>*/}
          {/*        <MenuItem*/}
          {/*            _hover={{bg: 'none'}}*/}
          {/*            _focus={{bg: 'none'}}*/}
          {/*            color={textColor}*/}
          {/*            borderRadius="8px"*/}
          {/*            px="14px"*/}
          {/*        >*/}
          {/*            <Text fontWeight="500" fontSize="sm">*/}
          {/*                Newsletter Settings*/}
          {/*            </Text>*/}
          {/*        </MenuItem>*/}
          {/*        <MenuItem*/}
          {/*            _hover={{bg: 'none'}}*/}
          {/*            _focus={{bg: 'none'}}*/}
          {/*            color="red.400"*/}
          {/*            borderRadius="8px"*/}
          {/*            px="14px"*/}
          {/*        >*/}
          {/*            <Text fontWeight="500" fontSize="sm">*/}
          {/*                Log out*/}
          {/*            </Text>*/}
          {/*        </MenuItem>*/}
          {/*    </Flex>*/}
          {/*</MenuList>*/}
        </Menu>
      </Flex>
    </Flex>
  );
}
