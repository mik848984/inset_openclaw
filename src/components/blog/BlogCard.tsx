'use client';

import {
  Box,
  Heading,
  Text,
  HStack,
  Tag,
  Image,
  Stack,
  useColorModeValue,
} from '@chakra-ui/react';
import Link from 'next/link';

export type BlogCardProps = {
  slug: string;
  title: string;
  description: string;
  date: string;
  tags?: string[];
  readingTime?: number;
  author?: string;
  coverImage?: string;
};

export function BlogCard(props: BlogCardProps) {
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
  const cardBorder = useColorModeValue('gray.100', 'transparent');
  const metaColor = useColorModeValue('gray.500', 'gray.400');
  const titleColor = useColorModeValue('gray.900', 'white');
  const descColor = useColorModeValue('gray.700', 'gray.300');
  const linkColor = useColorModeValue('blue.500', 'blue.300');

  return (
    <Box as={Link} href={`/blog/${encodeURIComponent(slug)}`} _hover={{ textDecoration: 'none' }}>
      <Box
        borderRadius="2xl"
        bg={cardBg}
        borderWidth="1px"
        borderColor={cardBorder}
        boxShadow="md"
        overflow="hidden"
        transition="all 0.2s ease"
        _hover={{
          boxShadow: 'xl',
          transform: 'translateY(-2px)',
        }}
      >
        {coverImage ? (
          <Image
            src={coverImage}
            alt={title}
            w="100%"
            h={{ base: '220px', md: '260px' }}
            objectFit="cover"
          />
        ) : (
          <Box
            w="100%"
            h={{ base: '220px', md: '260px' }}
            bgGradient="linear(to-r, blue.500, purple.500)"
          />
        )}

        <Box p={{ base: 4, md: 6 }}>
          <HStack spacing={3} mb={3} fontSize="sm" color={metaColor} wrap="wrap">
            {author && <Text>{author}</Text>}
            <Text>
              {new Date(date).toLocaleDateString('ru-RU', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })}
            </Text>
            {readingTime && (
              <>
                <Text>•</Text>
                <Text>{readingTime} мин чтения</Text>
              </>
            )}
          </HStack>

          <Heading
            as="h2"
            fontSize={{ base: 'xl', md: '2xl' }}
            mb={2}
            color={titleColor}
          >
            {title}
          </Heading>

          <Text fontSize="md" color={descColor} mb={4} noOfLines={3}>
            {description}
          </Text>

          <Stack
            direction={{ base: 'column', md: 'row' }}
            justify="space-between"
            align={{ base: 'flex-start', md: 'center' }}
            spacing={3}
          >
            <HStack spacing={2} flexWrap="wrap">
              {tags.slice(0, 4).map((tag) => (
                <Tag
                  key={tag}
                  size="sm"
                  borderRadius="full"
                  variant="subtle"
                  colorScheme="purple"
                >
                  {tag}
                </Tag>
              ))}
            </HStack>

            <Text fontSize="sm" fontWeight="semibold" color={linkColor}>
              Продолжить читать →
            </Text>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}

export default BlogCard;
