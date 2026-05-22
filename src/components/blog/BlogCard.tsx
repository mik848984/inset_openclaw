'use client';

import {
  Box,
  Heading,
  Text,
  HStack,
  Flex,
  Image,
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

// ── Apple typography ──────────────────────────────────────────────
const FONT_APPLE_TEXT = `'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif`;
const FONT_APPLE_DISPLAY = `'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif`;

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

  // ── Liquid Glass tokens ─────────────────────────────────────────
  const cardBg = useColorModeValue(
    'rgba(255,255,255,0.72)',
    'rgba(13,18,34,0.62)',
  );
  const cardBgHover = useColorModeValue(
    'rgba(255,255,255,0.86)',
    'rgba(13,18,34,0.78)',
  );
  const borderGlass = useColorModeValue(
    'rgba(255,255,255,0.68)',
    'rgba(255,255,255,0.10)',
  );
  const borderHover = useColorModeValue(
    'rgba(0,102,204,0.28)',
    'rgba(41,151,255,0.34)',
  );
  const titleColor = useColorModeValue('#1d1d1f', '#f5f5f7');
  const descColor = useColorModeValue('#3c3c43', 'rgba(245,245,247,0.78)');
  const metaColor = useColorModeValue('#6e6e73', 'rgba(245,245,247,0.62)');
  const linkColor = useColorModeValue('#0066cc', '#2997ff');
  const tagBg = useColorModeValue(
    'rgba(0,102,204,0.07)',
    'rgba(41,151,255,0.14)',
  );
  const tagColor = useColorModeValue('#0066cc', '#2997ff');
  const fallbackBg = useColorModeValue(
    'linear-gradient(135deg, #f5f5f7 0%, #e8e8eb 100%)',
    'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
  );
  const cardShadow = useColorModeValue(
    'inset 0 1px 0 rgba(255,255,255,0.55), 0 1px 2px rgba(0,0,0,0.03), 0 18px 40px rgba(31,38,70,0.06)',
    'inset 0 1px 0 rgba(255,255,255,0.08), 0 1px 2px rgba(0,0,0,0.12), 0 18px 40px rgba(0,0,0,0.28)',
  );
  const cardShadowHover = useColorModeValue(
    'inset 0 1px 0 rgba(255,255,255,0.55), 0 6px 16px rgba(0,0,0,0.06), 0 28px 60px rgba(31,38,70,0.10)',
    'inset 0 1px 0 rgba(255,255,255,0.08), 0 6px 16px rgba(0,0,0,0.20), 0 28px 60px rgba(0,0,0,0.36)',
  );

  return (
    <Box
      as={Link}
      href={`/blog/${encodeURIComponent(slug)}`}
      display="block"
      _hover={{ textDecoration: 'none' }}
      width="100%"
      maxWidth="100%"
      minWidth={0}
    >
      <Box
        borderRadius={{ base: '24px', md: '28px' }}
        bg={cardBg}
        backdropFilter="blur(20px) saturate(180%)"
        border="1px solid"
        borderColor={borderGlass}
        boxShadow={cardShadow}
        overflow="hidden"
        transition="background 0.2s ease, border-color 0.2s ease, transform 0.2s ease, box-shadow 0.22s ease"
        sx={{
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          position: 'relative',
        }}
        _hover={{
          bg: cardBgHover,
          borderColor: borderHover,
          transform: 'translateY(-3px)',
          boxShadow: cardShadowHover,
        }}
      >
        {/* Cover image — 16/9 */}
        <Box width="100%" sx={{ aspectRatio: '16 / 9' }} overflow="hidden">
          {coverImage ? (
            <Image
              src={coverImage}
              alt={title}
              w="100%"
              h="100%"
              objectFit="cover"
            />
          ) : (
            <Box w="100%" h="100%" bgGradient={fallbackBg} />
          )}
        </Box>

        {/* Content */}
        <Box p={{ base: '18px', md: '22px' }}>
          {/* Meta */}
          <HStack
            spacing="8px"
            mb="10px"
            fontSize="13px"
            color={metaColor}
            wrap="wrap"
            fontFamily={FONT_APPLE_TEXT}
            letterSpacing="-0.1px"
          >
            {author && <Text>{author}</Text>}
            {author && <Text opacity={0.5}>·</Text>}
            <Text>
              {new Date(date).toLocaleDateString('ru-RU', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })}
            </Text>
            {readingTime && (
              <>
                <Text opacity={0.5}>·</Text>
                <Text>{readingTime} мин</Text>
              </>
            )}
          </HStack>

          {/* Title */}
          <Heading
            as="h2"
            fontFamily={FONT_APPLE_DISPLAY}
            fontSize={{ base: '20px', md: '22px' }}
            fontWeight="600"
            lineHeight="1.18"
            letterSpacing="-0.3px"
            color={titleColor}
            mb="8px"
            wordBreak="break-word"
            noOfLines={3}
          >
            {title}
          </Heading>

          {/* Description */}
          <Text
            fontFamily={FONT_APPLE_TEXT}
            fontSize={{ base: '14px', md: '15px' }}
            lineHeight="1.55"
            letterSpacing="-0.1px"
            color={descColor}
            mb="14px"
            noOfLines={3}
          >
            {description}
          </Text>

          {/* Tags + CTA */}
          <Flex
            direction={{ base: 'column', md: 'row' }}
            justify="space-between"
            align={{ base: 'flex-start', md: 'center' }}
            gap="10px"
            mt="2px"
          >
            <HStack spacing="6px" flexWrap="wrap" rowGap="6px">
              {tags.slice(0, 4).map((tag) => (
                <Box
                  key={tag}
                  px="9px"
                  py="3px"
                  bg={tagBg}
                  borderRadius="9999px"
                  fontFamily={FONT_APPLE_TEXT}
                  fontSize="11px"
                  fontWeight="500"
                  letterSpacing="-0.05px"
                  color={tagColor}
                >
                  {tag}
                </Box>
              ))}
            </HStack>

            <Text
              fontFamily={FONT_APPLE_TEXT}
              fontSize="14px"
              fontWeight="500"
              letterSpacing="-0.15px"
              color={linkColor}
              flexShrink={0}
            >
              Читать →
            </Text>
          </Flex>
        </Box>
      </Box>
    </Box>
  );
}

export default BlogCard;
