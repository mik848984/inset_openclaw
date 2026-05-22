'use client';

import {
  Box,
  Flex,
  HStack,
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

// ── Apple typography ──────────────────────────────────────────────
const FONT_APPLE_TEXT = `'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif`;
const FONT_APPLE_DISPLAY = `'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif`;

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
  const accentBlue = useColorModeValue('#0066cc', '#2997ff');
  const tagBg = useColorModeValue(
    'rgba(0,102,204,0.07)',
    'rgba(41,151,255,0.14)',
  );
  const tagColor = useColorModeValue('#0066cc', '#2997ff');
  const eyebrowBg = useColorModeValue(
    'rgba(0,102,204,0.10)',
    'rgba(41,151,255,0.16)',
  );
  const fallbackBg = useColorModeValue(
    'linear-gradient(135deg, #f5f5f7 0%, #e8e8eb 100%)',
    'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)',
  );
  const cardShadow = useColorModeValue(
    'inset 0 1px 0 rgba(255,255,255,0.55), 0 1px 2px rgba(0,0,0,0.03), 0 24px 60px rgba(31,38,70,0.08)',
    'inset 0 1px 0 rgba(255,255,255,0.08), 0 1px 2px rgba(0,0,0,0.16), 0 24px 60px rgba(0,0,0,0.34)',
  );
  const cardShadowHover = useColorModeValue(
    'inset 0 1px 0 rgba(255,255,255,0.55), 0 8px 20px rgba(0,0,0,0.06), 0 32px 80px rgba(31,38,70,0.12)',
    'inset 0 1px 0 rgba(255,255,255,0.08), 0 8px 20px rgba(0,0,0,0.24), 0 32px 80px rgba(0,0,0,0.40)',
  );

  return (
    <Box
      as={Link}
      href={`/blog/${encodeURIComponent(slug)}`}
      display="block"
      mb={{ base: 8, md: 12 }}
      _hover={{ textDecoration: 'none' }}
      width="100%"
      maxWidth="100%"
      minWidth={0}
    >
      <Box
        bg={cardBg}
        backdropFilter="blur(20px) saturate(180%)"
        border="1px solid"
        borderColor={borderGlass}
        boxShadow={cardShadow}
        borderRadius={{ base: '24px', md: '32px' }}
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
        <Flex
          direction={{ base: 'column', md: 'row' }}
          align="stretch"
          width="100%"
          minWidth={0}
        >
          {/* Image side */}
          <Box
            flex={{ base: '0 0 auto', md: '0 0 52%' }}
            width={{ base: '100%', md: '52%' }}
            sx={{ aspectRatio: { base: '16 / 10', md: 'auto' } as any }}
            minHeight={{ md: '360px' }}
            overflow="hidden"
            position="relative"
          >
            {coverImage ? (
              <Image
                src={coverImage}
                alt={title}
                w="100%"
                h="100%"
                objectFit="cover"
                position={{ md: 'absolute' }}
                top={{ md: 0 }}
                left={{ md: 0 }}
              />
            ) : (
              <Box w="100%" h="100%" bgGradient={fallbackBg} />
            )}
          </Box>

          {/* Content side */}
          <Flex
            flex="1 1 0"
            minWidth={0}
            direction="column"
            justify="center"
            px={{ base: '20px', md: '36px' }}
            py={{ base: '24px', md: '36px' }}
          >
            {/* Eyebrow chip */}
            <Box
              display="inline-flex"
              alignItems="center"
              gap="6px"
              px="10px"
              py="4px"
              bg={eyebrowBg}
              borderRadius="9999px"
              width="fit-content"
              mb="14px"
            >
              <Box w="5px" h="5px" borderRadius="50%" bg={accentBlue} />
              <Text
                fontFamily={FONT_APPLE_TEXT}
                fontSize="11px"
                fontWeight="600"
                letterSpacing="0.4px"
                textTransform="uppercase"
                color={accentBlue}
              >
                Главный материал
              </Text>
            </Box>

            {/* Title */}
            <Heading
              as="h2"
              fontFamily={FONT_APPLE_DISPLAY}
              fontSize={{ base: '26px', sm: '30px', md: '36px', lg: '42px' }}
              fontWeight="600"
              lineHeight="1.08"
              letterSpacing={{ base: '-0.4px', md: '-0.7px' }}
              color={titleColor}
              mb="14px"
              wordBreak="break-word"
              noOfLines={3}
            >
              {title}
            </Heading>

            {/* Description */}
            {description && (
              <Text
                fontFamily={FONT_APPLE_TEXT}
                fontSize={{ base: '15px', md: '17px' }}
                lineHeight="1.55"
                letterSpacing="-0.1px"
                color={descColor}
                mb="16px"
                noOfLines={3}
              >
                {description}
              </Text>
            )}

            {/* Meta + tags */}
            <HStack
              spacing="8px"
              fontSize="13px"
              color={metaColor}
              wrap="wrap"
              fontFamily={FONT_APPLE_TEXT}
              letterSpacing="-0.1px"
              mb="14px"
              rowGap="6px"
            >
              {author && <Text>{author}</Text>}
              {author && date && <Text opacity={0.5}>·</Text>}
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
                <>
                  <Text opacity={0.5}>·</Text>
                  <Text>{readingTime} мин</Text>
                </>
              )}
            </HStack>

            {tags.length > 0 && (
              <HStack spacing="6px" flexWrap="wrap" rowGap="6px" mb="16px">
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
            )}

            {/* CTA */}
            <Text
              fontFamily={FONT_APPLE_TEXT}
              fontSize="15px"
              fontWeight="500"
              letterSpacing="-0.15px"
              color={accentBlue}
            >
              Читать материал →
            </Text>
          </Flex>
        </Flex>
      </Box>
    </Box>
  );
}
