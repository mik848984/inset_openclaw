import React from 'react';
import type { Metadata } from 'next';
import { getAllPosts } from '@/lib/blog';
import {
  Container,
  Heading,
  Text,
  Stack,
  Box,
  SimpleGrid,
  HStack,
  Flex,
  Button,
} from '@chakra-ui/react';
import BlogCard from '@/components/blog/BlogCard';
import HeroBlogCard from '@/components/blog/HeroBlogCard';
import BlogPromoBanner from '@/components/blog/BlogPromoBanner';
import BlogPageTracker from '@/components/blog/BlogPageTracker';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  metadataBase: new URL('https://iiset.io'),
  title: 'Новости ИИСеть — новости технологий и искусственного интеллекта',
  description:
    'Новости ИИСеть: новости технологий и искусственного интеллекта, обзоры ИИ-инструментов и практические кейсы применения ИИСети в работе и личной жизни.',
  alternates: {
    canonical: 'https://iiset.io/blog',
  },
  openGraph: {
    type: 'website',
    locale: 'ru_RU',
    siteName: 'ИИСеть',
    url: 'https://iiset.io/blog',
    title: 'Новости ИИСеть — новости технологий и искусственного интеллекта',
    description:
      'Новости ИИСеть: новости технологий и искусственного интеллекта, обзоры ИИ-инструментов и практические кейсы применения ИИСети.',
    images: ['https://iiset.io/brand.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Новости ИИСеть',
    description:
      'Новости технологий и искусственного интеллекта, обзоры и практические кейсы.',
    images: ['https://iiset.io/brand.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

// ── Apple typography ──────────────────────────────────────────────
const FONT_APPLE_TEXT = `'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif`;
const FONT_APPLE_DISPLAY = `'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif`;

// ── Smart pagination items (1, ..., n-1, n, n+1, ..., last) ──────
function getPaginationItems(
  currentPage: number,
  totalPages: number,
): Array<number | 'ellipsis'> {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const items: Array<number | 'ellipsis'> = [1];
  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);

  if (start > 2) items.push('ellipsis');
  for (let i = start; i <= end; i++) items.push(i);
  if (end < totalPages - 1) items.push('ellipsis');
  if (totalPages > 1 && items[items.length - 1] !== totalPages) {
    items.push(totalPages);
  }

  return items;
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams?: { page?: string };
}) {
  const allPosts = getAllPosts();
  const now = new Date();

  const publishedPosts = allPosts.filter((post) => {
    if (!post.date) return false;
    const d = new Date(post.date);
    if (Number.isNaN(d.getTime())) return false;
    return d <= now;
  });

  // ── Empty state: premium glass card with CTA ─────────────────────
  if (!publishedPosts.length) {
    return (
      <>
        <BlogPageTracker />
        <Container
          maxW="7xl"
          py={{ base: 10, md: 16 }}
          px={{ base: '16px', md: '24px' }}
          fontFamily={FONT_APPLE_TEXT}
        >
          <Flex justify="center" align="center" minH="50vh">
            <Box
              bg="rgba(255,255,255,0.72)"
              _dark={{
                bg: 'rgba(13,18,34,0.62)',
                borderColor: 'rgba(255,255,255,0.10)',
                color: '#f5f5f7',
              }}
              backdropFilter="blur(20px) saturate(180%)"
              border="1px solid"
              borderColor="rgba(255,255,255,0.68)"
              borderRadius={{ base: '24px', md: '28px' }}
              boxShadow="inset 0 1px 0 rgba(255,255,255,0.55), 0 18px 50px rgba(31,38,70,0.06)"
              p={{ base: '24px', md: '36px' }}
              maxW="560px"
              width="100%"
              textAlign="center"
              sx={{ WebkitBackdropFilter: 'blur(20px) saturate(180%)' }}
            >
              <Heading
                as="h1"
                fontFamily={FONT_APPLE_DISPLAY}
                fontSize={{ base: '24px', md: '32px' }}
                fontWeight="600"
                lineHeight="1.15"
                letterSpacing="-0.5px"
                color="#1d1d1f"
                _dark={{ color: '#f5f5f7' }}
                mb="10px"
              >
                Материалы скоро появятся
              </Heading>
              <Text
                fontSize={{ base: '15px', md: '16px' }}
                lineHeight="1.55"
                color="#6e6e73"
                _dark={{ color: 'rgba(245,245,247,0.66)' }}
                mb="22px"
              >
                Мы уже готовим обзоры моделей, гайды по работе с ИИ и
                практические кейсы использования ИИСети.
              </Text>
              <Button
                as="a"
                href="/chat"
                bg="#0066cc"
                color="white"
                borderRadius="9999px"
                h="44px"
                px="22px"
                fontFamily={FONT_APPLE_TEXT}
                fontWeight="500"
                fontSize="15px"
                letterSpacing="-0.2px"
                _hover={{ bg: '#0071e3' }}
                _active={{ transform: 'scale(0.97)' }}
                transition="background 0.16s ease, transform 0.12s ease"
              >
                Перейти в чат
              </Button>
            </Box>
          </Flex>
        </Container>
      </>
    );
  }

  const POSTS_PER_PAGE = 10;
  const totalPosts = publishedPosts.length;
  const totalPages = Math.max(1, Math.ceil(totalPosts / POSTS_PER_PAGE));

  const pageParam =
    typeof searchParams?.page === 'string' ? searchParams.page : undefined;
  const currentPage = (() => {
    const p = pageParam ? parseInt(pageParam, 10) : 1;
    if (Number.isNaN(p) || p < 1) return 1;
    if (p > totalPages) return totalPages;
    return p;
  })();

  const sorted = [...publishedPosts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  let hero = null as typeof sorted[0] | null;
  let popular: typeof sorted = [];
  let remaining: typeof sorted = [];
  let pagePosts: typeof sorted = [];

  if (currentPage === 1) {
    const [first, ...rest] = sorted;
    hero = first ?? null;
    popular = rest.slice(0, 3);
    const remainingAll = rest.slice(popular.length);
    const remainingLimit = Math.max(
      0,
      POSTS_PER_PAGE - (hero ? 1 : 0) - popular.length,
    );
    remaining = remainingAll.slice(0, remainingLimit);
  } else {
    const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
    const endIndex = startIndex + POSTS_PER_PAGE;
    pagePosts = sorted.slice(startIndex, endIndex);
  }

  const paginationItems = getPaginationItems(currentPage, totalPages);
  const prevHref =
    currentPage > 1
      ? currentPage === 2
        ? '/blog'
        : `/blog?page=${currentPage - 1}`
      : undefined;
  const nextHref =
    currentPage < totalPages ? `/blog?page=${currentPage + 1}` : undefined;

  return (
    <>
      <BlogPageTracker />
      <Container
        maxW="7xl"
        py={{ base: 8, md: 14 }}
        px={{ base: '16px', md: '24px', xl: '32px' }}
        fontFamily={FONT_APPLE_TEXT}
        width="100%"
        maxWidth={{ base: '100%', md: '7xl' }}
        minWidth={0}
      >
        {/* ── Apple editorial hero ─────────────────────────────── */}
        <Stack
          spacing={{ base: '14px', md: '20px' }}
          mb={{ base: '32px', md: '48px' }}
          align="flex-start"
          maxW="900px"
        >
          {/* Eyebrow pill */}
          <Box
            display="inline-flex"
            alignItems="center"
            gap="6px"
            px="10px"
            py="4px"
            bg="rgba(0,102,204,0.08)"
            _dark={{ bg: 'rgba(41,151,255,0.14)' }}
            borderRadius="9999px"
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

          {/* H1 */}
          <Heading
            as="h1"
            fontFamily={FONT_APPLE_DISPLAY}
            fontSize={{ base: '40px', sm: '48px', md: '60px', lg: '68px' }}
            fontWeight="600"
            lineHeight="1.05"
            letterSpacing={{ base: '-0.8px', md: '-1.2px' }}
            color="#1d1d1f"
            _dark={{ color: '#f5f5f7' }}
            maxWidth="100%"
            wordBreak="break-word"
          >
            Новости ИИСеть
          </Heading>

          {/* Subtitle */}
          <Text
            fontFamily={FONT_APPLE_TEXT}
            fontSize={{ base: '16px', md: '20px' }}
            lineHeight="1.5"
            fontWeight="400"
            letterSpacing="-0.15px"
            color="#3c3c43"
            _dark={{ color: 'rgba(245,245,247,0.78)' }}
            maxW="780px"
          >
            Самые свежие материалы про ИИ, нейросети и технологии: новости,
            обзоры моделей, практические гайды и кейсы использования ИИСети в
            работе и личной жизни.
          </Text>

          {/* CTA cluster */}
          <Flex
            gap="10px"
            direction={{ base: 'column', sm: 'row' }}
            w={{ base: '100%', sm: 'auto' }}
            mt="6px"
          >
            <Button
              as="a"
              href="/chat"
              bg="#0066cc"
              color="white"
              borderRadius="9999px"
              h={{ base: '46px', md: '48px' }}
              px="24px"
              fontFamily={FONT_APPLE_TEXT}
              fontSize="15px"
              fontWeight="500"
              letterSpacing="-0.2px"
              _hover={{ bg: '#0071e3' }}
              _active={{ transform: 'scale(0.97)' }}
              transition="background 0.16s ease, transform 0.12s ease"
              boxShadow="0 1px 2px rgba(0,0,0,0.06)"
              w={{ base: '100%', sm: 'auto' }}
            >
              Перейти в чат
            </Button>
            <Button
              as="a"
              href="/life-agents"
              variant="ghost"
              bg="rgba(255,255,255,0.62)"
              _dark={{
                bg: 'rgba(255,255,255,0.08)',
                borderColor: 'rgba(255,255,255,0.16)',
                color: 'rgba(245,245,247,0.92)',
                _hover: {
                  bg: 'rgba(255,255,255,0.12)',
                  borderColor: 'rgba(41,151,255,0.42)',
                  color: '#2997ff',
                },
              }}
              backdropFilter="blur(18px) saturate(180%)"
              sx={{ WebkitBackdropFilter: 'blur(18px) saturate(180%)' }}
              border="1px solid"
              bg="rgba(255,255,255,0.66)"
              borderColor="rgba(0,0,0,0.08)"
              color="#1d1d1f"
              borderRadius="9999px"
              h={{ base: '46px', md: '48px' }}
              px="22px"
              fontFamily={FONT_APPLE_TEXT}
              fontSize="15px"
              fontWeight="500"
              letterSpacing="-0.2px"
              w={{ base: '100%', sm: 'auto' }}
              _hover={{
                bg: 'rgba(255,255,255,0.84)',
                borderColor: '#0066cc',
                color: '#0066cc',
              }}
              _active={{ transform: 'scale(0.97)' }}
              transition="background 0.16s ease, border-color 0.16s ease, color 0.16s ease, transform 0.12s ease"
            >
              Агенты жизни →
            </Button>
          </Flex>
        </Stack>

        {/* ── Featured hero card ───────────────────────────────── */}
        {currentPage === 1 && hero && (
          <HeroBlogCard
            slug={hero.slug}
            title={hero.title}
            description={hero.description}
            date={hero.date}
            tags={hero.tags}
            readingTime={hero.readingTime}
            author={hero.author}
            coverImage={hero.coverImage || hero.ogImage}
          />
        )}

        {/* ── Popular section ──────────────────────────────────── */}
        {currentPage === 1 && popular.length > 0 && (
          <Box mb={{ base: 8, md: 12 }}>
            <Flex
              align={{ base: 'flex-start', sm: 'baseline' }}
              gap="12px"
              direction={{ base: 'column', sm: 'row' }}
              mb={{ base: '14px', md: '18px' }}
            >
              <Heading
                as="h2"
                fontFamily={FONT_APPLE_DISPLAY}
                fontSize={{ base: '22px', md: '28px' }}
                fontWeight="600"
                lineHeight="1.2"
                letterSpacing="-0.4px"
                color="#1d1d1f"
                _dark={{ color: '#f5f5f7' }}
              >
                Самое популярное
              </Heading>
              <Text
                fontFamily={FONT_APPLE_TEXT}
                fontSize="14px"
                color="#6e6e73"
                _dark={{ color: 'rgba(245,245,247,0.62)' }}
                letterSpacing="-0.1px"
              >
                Подборка свежих материалов
              </Text>
            </Flex>
            <SimpleGrid
              columns={{ base: 1, md: 2, lg: 3 }}
              spacing={{ base: '14px', md: '18px' }}
              width="100%"
              minWidth={0}
            >
              {popular.map((post) => (
                <BlogCard
                  key={post.slug}
                  slug={post.slug}
                  title={post.title}
                  description={post.description}
                  date={post.date}
                  tags={post.tags}
                  readingTime={post.readingTime}
                  author={post.author}
                  coverImage={post.coverImage || post.ogImage}
                />
              ))}
            </SimpleGrid>
          </Box>
        )}

        {/* ── Remaining / page grid + promo banner ─────────────── */}
        {(currentPage === 1 ? remaining.length > 0 : pagePosts.length > 0) && (
          <Box mb={{ base: 6, md: 10 }}>
            {currentPage === 1 && remaining.length > 0 && (
              <Heading
                as="h2"
                fontFamily={FONT_APPLE_DISPLAY}
                fontSize={{ base: '22px', md: '28px' }}
                fontWeight="600"
                lineHeight="1.2"
                letterSpacing="-0.4px"
                color="#1d1d1f"
                _dark={{ color: '#f5f5f7' }}
                mb={{ base: '14px', md: '18px' }}
              >
                Все материалы
              </Heading>
            )}
            <Box
              display="grid"
              gridTemplateColumns={{
                base: '1fr',
                md: 'repeat(2, minmax(0, 1fr))',
                lg: 'repeat(3, minmax(0, 1fr))',
              }}
              gap={{ base: '14px', md: '18px' }}
              width="100%"
              minWidth={0}
            >
              {(currentPage === 1 ? remaining : pagePosts).map(
                (post, index) => (
                  <React.Fragment key={post.slug}>
                    {(index === 2 ||
                      (index > 2 && (index - 2) % 4 === 0)) && (
                      <Box gridColumn={{ base: '1', md: '1 / -1' }}>
                        <BlogPromoBanner />
                      </Box>
                    )}
                    <BlogCard
                      slug={post.slug}
                      title={post.title}
                      description={post.description}
                      date={post.date}
                      tags={post.tags}
                      readingTime={post.readingTime}
                      author={post.author}
                      coverImage={post.coverImage || post.ogImage}
                    />
                  </React.Fragment>
                ),
              )}
            </Box>
          </Box>
        )}

        {/* ── Apple Liquid Glass pagination ─────────────────────── */}
        {totalPages > 1 && (
          <Flex justify="center" mt={{ base: '20px', md: '32px' }} width="100%">
            <Flex
              align="center"
              gap="4px"
              p="6px"
              bg="rgba(255,255,255,0.62)"
              _dark={{
                bg: 'rgba(13,18,34,0.58)',
                borderColor: 'rgba(255,255,255,0.10)',
              }}
              backdropFilter="blur(18px) saturate(180%)"
              sx={{
                WebkitBackdropFilter: 'blur(18px) saturate(180%)',
                '::-webkit-scrollbar': { display: 'none' },
                scrollbarWidth: 'none',
                WebkitOverflowScrolling: 'touch',
              }}
              border="1px solid"
              borderColor="rgba(0,0,0,0.08)"
              borderRadius="9999px"
              boxShadow="inset 0 1px 0 rgba(255,255,255,0.55), 0 1px 2px rgba(0,0,0,0.04)"
              overflowX="auto"
              maxWidth="100%"
              minWidth={0}
            >
              {/* Prev */}
              <Button
                as={prevHref ? 'a' : 'button'}
                href={prevHref}
                isDisabled={!prevHref}
                aria-label="Назад"
                variant="ghost"
                w={{ base: '36px', md: '38px' }}
                h={{ base: '36px', md: '38px' }}
                minW={{ base: '36px', md: '38px' }}
                borderRadius="9999px"
                bg="transparent"
                color="#1d1d1f"
                _dark={{ color: '#f5f5f7' }}
                fontFamily={FONT_APPLE_TEXT}
                fontSize="16px"
                fontWeight="500"
                p="0"
                flexShrink={0}
                _hover={{ bg: 'rgba(0,0,0,0.05)' }}
                _disabled={{
                  opacity: 0.35,
                  cursor: 'not-allowed',
                  _hover: { bg: 'transparent' },
                }}
                _active={{ transform: 'scale(0.94)' }}
                transition="background 0.14s ease, transform 0.12s ease"
              >
                ‹
              </Button>

              {/* Numbered + ellipsis items */}
              {paginationItems.map((item, idx) => {
                if (item === 'ellipsis') {
                  return (
                    <Box
                      key={`e-${idx}`}
                      px="6px"
                      minW="20px"
                      textAlign="center"
                      color="#6e6e73"
                      _dark={{ color: 'rgba(245,245,247,0.55)' }}
                      fontFamily={FONT_APPLE_TEXT}
                      fontSize="14px"
                      fontWeight="500"
                      letterSpacing="-0.05px"
                      userSelect="none"
                      flexShrink={0}
                    >
                      …
                    </Box>
                  );
                }
                const page = item;
                const isActive = page === currentPage;
                const href = page === 1 ? '/blog' : `/blog?page=${page}`;
                return (
                  <Button
                    key={page}
                    as="a"
                    href={href}
                    aria-current={isActive ? 'page' : undefined}
                    variant="ghost"
                    minW={{ base: '36px', md: '38px' }}
                    h={{ base: '36px', md: '38px' }}
                    px="10px"
                    borderRadius="9999px"
                    bg={isActive ? '#0066cc' : 'transparent'}
                    color={isActive ? 'white' : '#1d1d1f'}
                    _dark={{
                      color: isActive ? 'white' : '#f5f5f7',
                    }}
                    fontFamily={FONT_APPLE_TEXT}
                    fontSize="14px"
                    fontWeight={isActive ? '600' : '500'}
                    letterSpacing="-0.1px"
                    flexShrink={0}
                    boxShadow={
                      isActive ? '0 1px 2px rgba(0,0,0,0.10)' : 'none'
                    }
                    _hover={
                      isActive
                        ? { bg: '#0071e3' }
                        : { bg: 'rgba(0,0,0,0.05)' }
                    }
                    _active={{ transform: 'scale(0.94)' }}
                    transition="background 0.14s ease, transform 0.12s ease"
                  >
                    {page}
                  </Button>
                );
              })}

              {/* Next */}
              <Button
                as={nextHref ? 'a' : 'button'}
                href={nextHref}
                isDisabled={!nextHref}
                aria-label="Вперёд"
                variant="ghost"
                w={{ base: '36px', md: '38px' }}
                h={{ base: '36px', md: '38px' }}
                minW={{ base: '36px', md: '38px' }}
                borderRadius="9999px"
                bg="transparent"
                color="#1d1d1f"
                _dark={{ color: '#f5f5f7' }}
                fontFamily={FONT_APPLE_TEXT}
                fontSize="16px"
                fontWeight="500"
                p="0"
                flexShrink={0}
                _hover={{ bg: 'rgba(0,0,0,0.05)' }}
                _disabled={{
                  opacity: 0.35,
                  cursor: 'not-allowed',
                  _hover: { bg: 'transparent' },
                }}
                _active={{ transform: 'scale(0.94)' }}
                transition="background 0.14s ease, transform 0.12s ease"
              >
                ›
              </Button>
            </Flex>
          </Flex>
        )}
      </Container>
    </>
  );
}
