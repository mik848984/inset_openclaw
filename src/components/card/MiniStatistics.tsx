'use client';
// Chakra imports
import {
  Flex,
  Stat,
  StatLabel,
  StatNumber,
  useColorModeValue,
  Text,
  Box,
} from '@chakra-ui/react';
import Card from '@/components/card/Card';
import { isPrimitive } from 'util';

export default function Default(props: {
  startContent?: JSX.Element;
  endContent?: JSX.Element;
  bottomContent?: JSX.Element;
  name: any;
  growth?: string | number;
  value: any;
}) {
  const { startContent, endContent, name, growth, value, bottomContent } =
    props;
  const textColor = useColorModeValue('navy.700', 'white');
  const textColorSecondary = 'gray.500';

  return (
    <Card>
      <Flex
        my="auto"
        h="100%"
        align={{ base: 'start', xl: 'start' }}
        justify={{ base: 'center', xl: 'center' }}
        direction={{ base: 'column', md: 'row' }}
        gap="20px"
        alignItems="center"
      >
        <Flex w="100%">
          {startContent}
          <Stat my="auto" ms={startContent ? '18px' : '0px'}>
            <StatLabel
              w="100%"
              lineHeight="100%"
              color={textColorSecondary}
              fontSize="sm"
              mb="4px"
            >
              {name}
            </StatLabel>

            {isPrimitive(value) ? (
              <StatNumber color={textColor} fontWeight="700" fontSize="lg">
                {value}
              </StatNumber>
            ) : (
              <Box color={textColor}>{value}</Box>
            )}

            {growth ? (
              <Flex align="center">
                <Text color="green.500" fontSize="xs" fontWeight="700" me="5px">
                  {growth}
                </Text>
                <Text color="gray.500" fontSize="xs" fontWeight="400">
                  since last month
                </Text>
              </Flex>
            ) : null}
          </Stat>
        </Flex>

        {endContent}
      </Flex>
      {bottomContent}
    </Card>
  );
}
