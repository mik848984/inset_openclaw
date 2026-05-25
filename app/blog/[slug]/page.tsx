import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllPosts, getPostBySlug } from '@/lib/blog';
import {
  Box,
  Container,
  Heading,
  Text,
  HStack,
  Flex,
  Image,
  Button,
  SimpleGrid,
} from '@chakra-ui/react';
import ReactMarkdown from 'react-markdown';
import ArticleTracker from '@/components/blog/ArticleTracker';
import BlogPromoBanner from '@/components/blog/BlogPromoBanner';

type Props = {
  params: {
    slug: string;
  };
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const siteBaseUrl = 'https://iiset.io';

// ── Apple typography (server-safe constants) ──────────────────────
const FONT_APPLE_TEXT = `'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif`;
const FONT_APPLE_DISPLAY = `'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif`;
const FONT_APPLE_MONO = `'SF Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`;

function makeAbsoluteImageUrl(image?: string): string | undefined {
  if (!image) return undefined;
  if (image.startsWith('http://') || image.startsWith('https://')) return image;
  if (image.startsWith('/')) return `${siteBaseUrl}${image}`;
  return `${siteBaseUrl}/${image}`;
}

export function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export function generateMetadata({ params }: Props): Metadata {
  const post = getPostBySlug(params.slug);

  if (!post) {
    return {
      title: 'Статья не найдена — Блог ИИСеть',
      robots: { index: false, follow: false },
    };
  }

  const url = `${siteBaseUrl}/blog/${encodeURIComponent(post.slug)}`;
  const title = `${post.title} — Блог ИИСеть`;
  const description =
    post.description ||
    'Статья блога ИИСеть про искусственный интеллект, технологии и практические кейсы использования ИИСети.';
  const image = makeAbsoluteImageUrl(post.ogImage || post.coverImage);
  const publishedTime = post.date ? new Date(post.date).toISOString() : undefined;
  const authors = post.author ? [post.author] : ['Команда ИИСеть'];

  return {
    metadataBase: new URL(siteBaseUrl),
    title,
    description,
    alternates: {
      canonical: url,
    },
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      title,
      description,
      url,
      type: 'article',
      siteName: 'ИИСеть',
      locale: 'ru_RU',
      publishedTime,
      modifiedTime: publishedTime,
      authors,
      images: image
        ? [
            {
              url: image,
              alt: post.title,
            },
          ]
        : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default function BlogPostPage({ params }: Props) {
  const post = getPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  const imageUrl = makeAbsoluteImageUrl(post.ogImage || post.coverImage);
  const postUrl = `${siteBaseUrl}/blog/${encodeURIComponent(post.slug)}`;

  const jsonLd: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description:
      post.description ||
      'Статья блога ИИСеть про искусственный интеллект, технологии и практические кейсы использования ИИСети.',
    datePublished: post.date ? new Date(post.date).toISOString() : undefined,
    dateModified: post.date ? new Date(post.date).toISOString() : undefined,
    inLanguage: 'ru-RU',
    author: {
      '@type': 'Person',
      name: post.author || 'Команда ИИСеть',
    },
    publisher: {
      '@type': 'Organization',
      name: 'ИИСеть',
      url: siteBaseUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${siteBaseUrl}/brand.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': postUrl,
    },
  };

  if (imageUrl) {
    jsonLd.image = [imageUrl];
  }

  const allPosts = getAllPosts().filter((p) => p.slug !== post.slug);
  const topPosts = allPosts.slice(0, 3);

  // ── Apple editorial markdown styles (server-safe via sx) ────────
  const markdownSx = {
    fontFamily: FONT_APPLE_TEXT,
    color: '#333336',
    fontSize: { base: '17px', md: '18px' },
    lineHeight: { base: 1.75, md: 1.8 },
    letterSpacing: '-0.01em',
    width: '100%',
    maxWidth: '100%',

    '& p': {
      marginBottom: '1.25em',
      color: 'inherit',
    },
    '& p:last-child': { marginBottom: 0 },

    '& h2': {
      fontFamily: FONT_APPLE_DISPLAY,
      fontSize: { base: '28px', md: '36px' },
      fontWeight: 600,
      lineHeight: 1.15,
      letterSpacing: '-0.03em',
      color: '#1d1d1f',
      marginTop: '2.2em',
      marginBottom: '0.65em',
    },
    '& h3': {
      fontFamily: FONT_APPLE_DISPLAY,
      fontSize: { base: '23px', md: '28px' },
      fontWeight: 600,
      lineHeight: 1.2,
      letterSpacing: '-0.02em',
      color: '#1d1d1f',
      marginTop: '1.8em',
      marginBottom: '0.5em',
    },
    '& h4': {
      fontFamily: FONT_APPLE_DISPLAY,
      fontSize: { base: '20px', md: '23px' },
      fontWeight: 600,
      lineHeight: 1.25,
      letterSpacing: '-0.015em',
      color: '#1d1d1f',
      marginTop: '1.5em',
      marginBottom: '0.5em',
    },
    '& h2:first-of-type, & h3:first-of-type': { marginTop: 0 },

    '& ul, & ol': {
      paddingLeft: '1.3em',
      marginBottom: '1.4em',
    },
    '& li': { marginBottom: '0.5em', lineHeight: 1.7 },
    '& li > p': { marginBottom: '0.5em' },

    '& strong, & b': {
      color: '#1d1d1f',
      fontWeight: 650,
    },
    '& em, & i': { fontStyle: 'italic' },

    '& a': {
      color: '#0066cc',
      textDecoration: 'none',
      borderBottom: '1px solid rgba(0,102,204,0.30)',
      paddingBottom: '1px',
      transition: 'border-color 0.15s ease',
    },
    '& a:hover': { borderBottomColor: 'currentColor' },

    '& blockquote': {
      margin: '2em 0',
      padding: { base: '18px 20px', md: '22px 24px' },
      borderRadius: '20px',
      bg: 'rgba(255,255,255,0.62)',
      backdropFilter: 'blur(18px) saturate(180%)',
      WebkitBackdropFilter: 'blur(18px) saturate(180%)',
      border: '1px solid rgba(255,255,255,0.62)',
      borderLeft: '3px solid #0066cc',
      color: '#3c3c43',
      fontStyle: 'italic',
    },

    '& code': {
      fontFamily: FONT_APPLE_MONO,
      fontSize: '0.9em',
      padding: '2px 6px',
      borderRadius: '8px',
      background: 'rgba(0,0,0,0.05)',
      letterSpacing: 0,
    },

    '& pre': {
      width: '100%',
      overflowX: 'auto',
      margin: '1.6em 0',
      padding: { base: '16px 18px', md: '20px 22px' },
      borderRadius: '20px',
      background: 'rgba(248,248,250,0.85)',
      border: '1px solid rgba(0,0,0,0.07)',
      backdropFilter: 'blur(18px) saturate(180%)',
      WebkitBackdropFilter: 'blur(18px) saturate(180%)',
      fontFamily: FONT_APPLE_MONO,
      fontSize: '13.5px',
      lineHeight: 1.6,
    },
    '& pre code': {
      padding: 0,
      background: 'transparent',
      borderRadius: 0,
      fontSize: 'inherit',
    },

    '& img': {
      borderRadius: '20px',
      margin: '2em auto',
      maxWidth: '100%',
      display: 'block',
    },

    '& hr': {
      border: 'none',
      borderTop: '1px solid rgba(0,0,0,0.10)',
      margin: '2.5em 0',
    },

    '& table': {
      display: 'block',
      width: '100%',
      maxWidth: '100%',
      overflowX: 'auto',
      borderCollapse: 'collapse',
      margin: '2em 0',
      fontFamily: FONT_APPLE_TEXT,
      fontSize: '15px',
    },
    '& th, & td': {
      border: '1px solid rgba(0,0,0,0.10)',
      padding: '10px 12px',
      textAlign: 'left' as const,
      verticalAlign: 'top',
    },
    '& th': { fontWeight: 600, color: '#1d1d1f' },

    // ── Dark mode overrides ──────────────────────────────────────
    '.chakra-ui-dark &': {
      color: 'rgba(245,245,247,0.82)',
    },
    '.chakra-ui-dark & h2, .chakra-ui-dark & h3, .chakra-ui-dark & h4': {
      color: '#f5f5f7',
    },
    '.chakra-ui-dark & strong, .chakra-ui-dark & b': { color: '#f5f5f7' },
    '.chakra-ui-dark & a': {
      color: '#2997ff',
      borderBottomColor: 'rgba(41,151,255,0.30)',
    },
    '.chakra-ui-dark & blockquote': {
      bg: 'rgba(13,18,34,0.62)',
      borderColor: 'rgba(255,255,255,0.10)',
      borderLeftColor: '#2997ff',
      color: 'rgba(245,245,247,0.78)',
    },
    '.chakra-ui-dark & code': { background: 'rgba(255,255,255,0.08)' },
    '.chakra-ui-dark & pre': {
      background: 'rgba(13,18,34,0.62)',
      borderColor: 'rgba(255,255,255,0.10)',
    },
    '.chakra-ui-dark & hr': { borderTopColor: 'rgba(255,255,255,0.10)' },
    '.chakra-ui-dark & th, .chakra-ui-dark & td': {
      borderColor: 'rgba(255,255,255,0.10)',
    },
    '.chakra-ui-dark & th': { color: '#f5f5f7' },
  };

  return (
    <>
      <ArticleTracker slug={params.slug} />

      <Container
        maxW="7xl"
        py={{ base: '24px', md: '40px' }}
        px={{ base: '16px', md: '24px', xl: '32px' }}
        fontFamily={FONT_APPLE_TEXT}
        width="100%"
        maxWidth={{ base: '100%', md: '7xl' }}
        minWidth={0}
      >
        {/* ── Back to blog — Apple glass pill ─────────────────── */}
        <Box mb={{ base: '20px', md: '28px' }}>
          <Box
            as={Link}
            href="/blog"
            display="inline-flex"
            alignItems="center"
            gap="6px"
            height={{ base: '36px', md: '38px' }}
            px={{ base: '14px', md: '16px' }}
            borderRadius="9999px"
            bg="rgba(255,255,255,0.62)"
            _dark={{
              bg: 'rgba(13,18,34,0.62)',
              borderColor: 'rgba(255,255,255,0.10)',
              color: '#f5f5f7',
            }}
            backdropFilter="blur(18px) saturate(180%)"
            sx={{ WebkitBackdropFilter: 'blur(18px) saturate(180%)' }}
            border="1px solid"
            borderColor="rgba(0,0,0,0.08)"
            color="#1d1d1f"
            fontFamily={FONT_APPLE_TEXT}
            fontSize={{ base: '13px', md: '14px' }}
            fontWeight="500"
            letterSpacing="-0.15px"
            textDecoration="none"
            transition="border-color 0.16s ease, color 0.16s ease, transform 0.12s ease"
            _hover={{
              borderColor: '#0066cc',
              color: '#0066cc',
              transform: 'translateY(-1px)',
            }}
          >
            ← Вернуться в блог
          </Box>
        </Box>

        {/* ── Article hero ─────────────────────────────────────── */}
        <Box maxW="900px" mb={{ base: '24px', md: '36px' }}>
          {/* Eyebrow chip */}
          <Box
            display="inline-flex"
            alignItems="center"
            gap="6px"
            px="10px"
            py="4px"
            bg="rgba(0,102,204,0.08)"
            _dark={{ bg: 'rgba(41,151,255,0.14)' }}
            borderRadius="9999px"
            mb={{ base: '14px', md: '18px' }}
          >
            <Box
              w="5px"
              h="5px"
              borderRadius="50%"
              bg="#0066cc"
              _dark={{ bg: '#2997ff' }}
            />
            <Text
              fontFamily={FONT_APPLE_TEXT}
              fontSize="11px"
              fontWeight="600"
              letterSpacing="0.5px"
              textTransform="uppercase"
              color="#0066cc"
              _dark={{ color: '#2997ff' }}
            >
              Блог ИИСеть
            </Text>
          </Box>

          {/* H1 — Apple editorial */}
          <Heading
            as="h1"
            fontFamily={FONT_APPLE_DISPLAY}
            fontSize={{ base: '36px', sm: '44px', md: '54px', lg: '62px' }}
            fontWeight="600"
            lineHeight={{ base: '1.08', md: '1.05' }}
            letterSpacing={{ base: '-0.6px', md: '-1.1px' }}
            color="#1d1d1f"
            _dark={{ color: '#f5f5f7' }}
            wordBreak="break-word"
            mb={{ base: '14px', md: '20px' }}
          >
            {post.title}
          </Heading>

          {/* Description */}
          {post.description && (
            <Text
              fontFamily={FONT_APPLE_TEXT}
              fontSize={{ base: '17px', md: '21px' }}
              lineHeight="1.5"
              letterSpacing="-0.15px"
              color="#3c3c43"
              _dark={{ color: 'rgba(245,245,247,0.78)' }}
              maxW="820px"
              mb={{ base: '18px', md: '24px' }}
            >
              {post.description}
            </Text>
          )}

          {/* Meta row */}
          <HStack
            spacing="8px"
            fontSize={{ base: '13px', md: '14px' }}
            color="#6e6e73"
            _dark={{ color: 'rgba(245,245,247,0.62)' }}
            wrap="wrap"
            rowGap="6px"
            mb={{ base: '14px', md: '18px' }}
            fontFamily={FONT_APPLE_TEXT}
            letterSpacing="-0.1px"
          >
            {post.date && (
              <Text>
                {new Date(post.date).toLocaleDateString('ru-RU', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                })}
              </Text>
            )}
            {post.readingTime && (
              <>
                <Text opacity={0.5}>·</Text>
                <Text>{post.readingTime} мин чтения</Text>
              </>
            )}
            {post.author && (
              <>
                <Text opacity={0.5}>·</Text>
                <Text>{post.author}</Text>
              </>
            )}
          </HStack>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <HStack spacing="6px" flexWrap="wrap" rowGap="6px">
              {post.tags.map((tag) => (
                <Box
                  key={tag}
                  px="9px"
                  py="3px"
                  bg="rgba(0,102,204,0.07)"
                  _dark={{
                    bg: 'rgba(41,151,255,0.14)',
                    color: '#2997ff',
                  }}
                  color="#0066cc"
                  borderRadius="9999px"
                  fontFamily={FONT_APPLE_TEXT}
                  fontSize="11px"
                  fontWeight="500"
                  letterSpacing="-0.05px"
                >
                  {tag}
                </Box>
              ))}
            </HStack>
          )}
        </Box>

        {/* ── Cover image — large editorial ────────────────────── */}
        {imageUrl && (
          <Box
            mb={{ base: '28px', md: '44px' }}
            borderRadius={{ base: '20px', md: '32px' }}
            overflow="hidden"
            border="1px solid"
            borderColor="rgba(0,0,0,0.06)"
            _dark={{ borderColor: 'rgba(255,255,255,0.08)' }}
            boxShadow="0 24px 60px rgba(31,38,70,0.10)"
            width="100%"
            maxWidth="100%"
          >
            <Image
              src={imageUrl}
              alt={post.title}
              w="100%"
              maxH={{ base: '320px', md: '520px' }}
              objectFit="cover"
              display="block"
            />
          </Box>
        )}

        {/* ── Article body — Apple editorial prose ─────────────── */}
        <Box
          mx="auto"
          maxW={{ base: '100%', md: '820px' }}
          width="100%"
          minWidth={0}
          mb={{ base: '40px', md: '64px' }}
        >
          <Box className="blog-content" sx={markdownSx}>
            <ReactMarkdown>{post.content}</ReactMarkdown>
          </Box>
        </Box>

        {/* ── CTA glass card (dynamic) ───────────────────────────── */}
        <Box
          mx="auto"
          maxW={{ base: '100%', md: '820px' }}
          width="100%"
          minWidth={0}
          mb={{ base: '40px', md: '56px' }}
        >
          <BlogPromoBanner />
        </Box>

        {/* ── Related posts ────────────────────────────────────── */}
        {topPosts.length > 0 && (
          <Box>
            <Flex
              direction={{ base: 'column', sm: 'row' }}
              align={{ base: 'flex-start', sm: 'baseline' }}
              gap="12px"
              mb={{ base: '16px', md: '22px' }}
            >
              <Heading
                as="h2"
                fontFamily={FONT_APPLE_DISPLAY}
                fontSize={{ base: '24px', md: '32px' }}
                fontWeight="600"
                lineHeight="1.2"
                letterSpacing="-0.4px"
                color="#1d1d1f"
                _dark={{ color: '#f5f5f7' }}
              >
                Читайте также
              </Heading>
              <Text
                fontFamily={FONT_APPLE_TEXT}
                fontSize="14px"
                color="#6e6e73"
                _dark={{ color: 'rgba(245,245,247,0.62)' }}
                letterSpacing="-0.1px"
              >
                Ещё материалы об ИИ и сценариях использования ИИСети.
              </Text>
            </Flex>

            <SimpleGrid
              columns={{ base: 1, md: 2, lg: 3 }}
              spacing={{ base: '12px', md: '16px' }}
              width="100%"
              minWidth={0}
            >
              {topPosts.map((p) => (
                <Box
                  key={p.slug}
                  as={Link}
                  href={`/blog/${encodeURIComponent(p.slug)}`}
                  display="block"
                  bg="rgba(255,255,255,0.62)"
                  _dark={{
                    bg: 'rgba(13,18,34,0.58)',
                    borderColor: 'rgba(255,255,255,0.10)',
                  }}
                  backdropFilter="blur(20px) saturate(180%)"
                  sx={{ WebkitBackdropFilter: 'blur(20px) saturate(180%)' }}
                  border="1px solid"
                  borderColor="rgba(255,255,255,0.68)"
                  borderRadius={{ base: '20px', md: '24px' }}
                  boxShadow="inset 0 1px 0 rgba(255,255,255,0.55), 0 1px 2px rgba(0,0,0,0.03), 0 12px 32px rgba(31,38,70,0.05)"
                  p={{ base: '18px', md: '22px' }}
                  textDecoration="none"
                  transition="background 0.2s ease, border-color 0.2s ease, transform 0.2s ease, box-shadow 0.22s ease"
                  _hover={{
                    bg: 'rgba(255,255,255,0.82)',
                    borderColor: 'rgba(0,102,204,0.28)',
                    transform: 'translateY(-2px)',
                    boxShadow:
                      'inset 0 1px 0 rgba(255,255,255,0.55), 0 6px 16px rgba(0,0,0,0.06), 0 20px 48px rgba(31,38,70,0.10)',
                  }}
                  width="100%"
                  minWidth={0}
                >
                  <Heading
                    as="h3"
                    fontFamily={FONT_APPLE_DISPLAY}
                    fontSize={{ base: '17px', md: '19px' }}
                    fontWeight="600"
                    lineHeight="1.25"
                    letterSpacing="-0.25px"
                    color="#1d1d1f"
                    _dark={{ color: '#f5f5f7' }}
                    mb="8px"
                    wordBreak="break-word"
                    noOfLines={3}
                  >
                    {p.title}
                  </Heading>
                  {p.description && (
                    <Text
                      fontFamily={FONT_APPLE_TEXT}
                      fontSize={{ base: '13px', md: '14px' }}
                      lineHeight="1.55"
                      letterSpacing="-0.1px"
                      color="#3c3c43"
                      _dark={{ color: 'rgba(245,245,247,0.74)' }}
                      noOfLines={3}
                      mb="10px"
                    >
                      {p.description}
                    </Text>
                  )}
                  <HStack
                    spacing="6px"
                    fontSize="12px"
                    color="#6e6e73"
                    _dark={{ color: 'rgba(245,245,247,0.55)' }}
                    fontFamily={FONT_APPLE_TEXT}
                    letterSpacing="-0.05px"
                    wrap="wrap"
                  >
                    {p.date && (
                      <Text>
                        {new Date(p.date).toLocaleDateString('ru-RU', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </Text>
                    )}
                    {p.readingTime && (
                      <>
                        <Text opacity={0.5}>·</Text>
                        <Text>{p.readingTime} мин</Text>
                      </>
                    )}
                  </HStack>
                </Box>
              ))}
            </SimpleGrid>
          </Box>
        )}

        {/* ── JSON-LD (preserved) ──────────────────────────────── */}
        <script
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </Container>
    </>
  );
}
