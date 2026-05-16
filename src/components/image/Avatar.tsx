'use client';
import { chakra, useColorMode } from '@chakra-ui/system';
import React, { ComponentProps } from 'react';
import { Image } from './Image';
import { Flex, Icon, useColorModeValue } from '@chakra-ui/react';
import { FaCircleUser } from 'react-icons/fa6';

type AvatarImageProps = Partial<
  ComponentProps<typeof Image> & {
    showBorder?: boolean;
    src?: any;
  }
>;

export function NextAvatar({
  src,
  showBorder,
  alt = '',
  style,
  ...props
}: AvatarImageProps) {
  const { colorMode } = useColorMode();
  const bgAvatar = useColorModeValue('white', 'navy.700');
  const borderAvatar = useColorModeValue('white', 'navy.700');

  if (!src)
    return (
      <Flex
        boxSizing="border-box"
        border="4px solid"
        borderColor={borderAvatar}
        {...props}
        borderRadius="50%"
        bg={bgAvatar}
      >
        <Icon w="100%" h="100%" as={FaCircleUser}></Icon>
      </Flex>
    );

  return (
    <Image
      {...props}
      {...(showBorder
        ? {
            border: '4px',
            borderColor: borderAvatar,
          }
        : {})}
      alt={alt}
      objectFit={'fill'}
      src={src}
      style={{ ...style, borderRadius: '50%' }}
    />
  );
}

export const ChakraNextAvatar = chakra(NextAvatar, {
  shouldForwardProp: (prop) =>
    ['width', 'height', 'src', 'alt', 'layout'].includes(prop),
});
