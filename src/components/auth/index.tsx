'use client';
// Chakra imports
import { Box, Flex, Grid, Icon, Text } from '@chakra-ui/react';
import Footer from '@/components/footer/FooterAuthDefault';
import FixedPlugin from '@/components/fixedPlugin/FixedPlugin';
import { FaChevronLeft } from 'react-icons/fa';
import NavLink from '@/components/link/NavLink';
import { PropsWithChildren } from 'react';

interface DefaultAuthLayoutProps extends PropsWithChildren {
  children: JSX.Element;
  illustrationBackground: string;
}

export default function DefaultAuthLayout(props: DefaultAuthLayoutProps) {
  const { children, illustrationBackground } = props;
  // Chakra color mode
  return (
    <Flex height="100dvh">
      <Grid templateColumns={{ base: '1fr 1px', lg: '1fr 1fr' }} width="100%">
        <Flex direction="column" alignItems="center">
          <NavLink
            href="/chat"
            styles={{
              width: 'fit-content',
              marginTop: '40px',
            }}
          >
            <Flex
              align="center"
              ps={{ base: '25px', lg: '0px' }}
              pt={{ lg: '0px', xl: '0px' }}
              w="fit-content"
            >
              <Icon
                as={FaChevronLeft}
                me="12px"
                h="13px"
                w="8px"
                color="gray.500"
              />
              <Text ms="0px" fontSize="sm" color="gray.500">
                Вернуться в чат
              </Text>
            </Flex>
          </NavLink>
          {children}
        </Flex>
        <Box display={{ base: 'none', md: 'block' }} h="100%">
          <Flex
            bg={`url(${illustrationBackground})`}
            justify="center"
            align="end"
            w="100%"
            h="100%"
            bgSize="cover"
            bgPosition="50%"
            position="absolute"
          />
        </Box>
      </Grid>
      <FixedPlugin />
    </Flex>
  );
}
