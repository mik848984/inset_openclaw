'use client';

import {
  Box,
  HStack,
  Tag,
  Image,
  Heading,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import Link from 'next/link';

export type HeroBlogCardProps = {
  slug: string;
  title: string;
  description?: string;
  date?: string;
  tags?: string[];
  readingTime?: number;
  author?: string;
  coverImage?: string;
};

export default function HeroBlogCard(props: HeroBlogCardProps) {
  const {
    slug,
    title,
    description,
    date,
    tags = [],
    readingTime,
    author,
    coverImage,
  } = props;

  const cardBg = useColorModeValue('white', 'navy.800');
  const cardBorder = useColorModeValue('gray.100', 'whiteAlpha.200');
  const metaColor = useColorModeValue('gray.500', 'gray.400');
  const titleColor = useColorModeValue('gray.900', 'white');
  const descColor = useColorModeValue('gray.700', 'gray.300');

  return (
    <Box
      mb={{ base: 10, md: 12 }}
      borderWidth="1px"
      borderRadius="2xl"
      overflow="hidden"
      bg={cardBg}
      borderColor={cardBorder}
      boxShadow="md"
    >
      <Box
        as={Link}
        href={`/blog/${encodeURIComponent(slug)}`}
        _hover={{ textDecoration: 'none' }}
      >
        <Box position="relative" h={{ base: '220px', md: '320px' }} w="100%">
          {coverImage ? (
            <Image
              src={coverImage}
              alt={title}
              w="100%"
              h="100%"
              objectFit="cover"
            />
          ) : (
            <Box
              w="100%"
              h="100%"
              bgGradient="linear(to-r, blue.500, purple.500)"
            />
          )}
        </Box>

        <Box p={{ base: 4, md: 6 }}>
          <HStack
            spacing={3}
            mb={3}
            fontSize="sm"
            color={metaColor}
            wrap="wrap"
          >
            {author && <Text>{author}</Text>}
            {date && (
              <Text>
                {new Date(date).toLocaleDateString('ru-RU', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              })}
            </Text>
            )}
            {typeof readingTime === 'number' && (
              <Text>· {readingTime} мин чтения</Text>
            )}
            {tags.slice(0, 3).map((tag) => (
              <Tag key={tag} size="sm" variant="subtle" colorScheme="purple">
                {tag}
              </Tag>
            ))}
          </HStack>

          <Heading as="h2" size="lg" mb={2} color={titleColor}>
            {title}
          </Heading>
          {description && (
            <Text fontSize="md" color={descColor} noOfLines={3}>
              {description}
            </Text>
          )}
        </Box>
      </Box>
    </Box>
  );
}
