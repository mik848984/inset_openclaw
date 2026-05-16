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
  Tag,
  Button,
} from '@chakra-ui/react';
import BlogCard from '@/components/blog/BlogCard';
import HeroBlogCard from '@/components/blog/HeroBlogCard';
import BlogPromoBanner from '@/components/blog/BlogPromoBanner';
import BlogPageTracker from '@/components/blog/BlogPageTracker';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Новости ИИСеть — новости технологий и искусственного интеллекта',
  description:
    'Новости ИИСеть: новости технологий и искусственного интеллекта, обзоры ИИ-инструментов и практические кейсы применения ИИСети в работе и личной жизни.',
};

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

  // Если нет опубликованных постов
  if (!publishedPosts.length) {
    return (
      <>
        <BlogPageTracker />
        <Container maxW="5xl" py={{ base: 8, md: 12 }}>
          <Heading as="h1" size="xl" mb={4}>
            Новости ИИСеть
          </Heading>
          <Text color="gray.500">
            В блоге пока нет опубликованных статей. Загляните позже — мы уже готовим для вас материалы
            про ИИ и ИИСеть.
          </Text>
        </Container>
      </>
    );
  }



  const POSTS_PER_PAGE = 10;
  const totalPosts = publishedPosts.length;
  const totalPages = Math.max(1, Math.ceil(totalPosts / POSTS_PER_PAGE));

  const pageParam = typeof searchParams?.page === 'string' ? searchParams.page : undefined;
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
    const remainingLimit = Math.max(0, POSTS_PER_PAGE - (hero ? 1 : 0) - popular.length);
    remaining = remainingAll.slice(0, remainingLimit);
  } else {
    const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
    const endIndex = startIndex + POSTS_PER_PAGE;
    pagePosts = sorted.slice(startIndex, endIndex);
  }

  return (
    <>
      <BlogPageTracker />
      <Container maxW="5xl" py={{ base: 8, md: 12 }}>
        <Stack spacing={3} mb={{ base: 8, md: 10 }}>
          <Heading as="h1" size="2xl">
            Новости ИИСеть
          </Heading>
          <Text fontSize="lg" color="gray.500" maxW="3xl">
            Самые свежие материалы про ИИ, нейросети и технологии: новости, обзоры моделей,
            практические гайды и кейсы использования ИИСети в работе и личной жизни.
          </Text>
          <Button
            as="a"
            href="/"
            mt={4}
            size="sm"
            colorScheme="purple"
            variant="outline"
          >
            Перейти в чат
          </Button>
        </Stack>

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

        {currentPage === 1 && popular.length > 0 && (
          <Box mb={{ base: 10, md: 12 }}>
            <Heading as="h2" size="md" mb={4}>
              Самое популярное
            </Heading>
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={{ base: 4, md: 6 }}>
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

        <Stack spacing={6}>
          {currentPage === 1 &&
            remaining.map((post, index) => (
              <React.Fragment key={post.slug}>
                {index === 2 || (index > 2 && (index - 2) % 4 === 0) ? <BlogPromoBanner /> : null}
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
            ))}

          {currentPage > 1 &&
            pagePosts.map((post, index) => (
              <React.Fragment key={post.slug}>
                {index === 2 || (index > 2 && (index - 2) % 4 === 0) ? <BlogPromoBanner /> : null}
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
            ))}
        </Stack>

        <Stack mt={10} direction="row" spacing={2} justify="center">
          {Array.from({ length: totalPages }).map((_, index) => {
            const page = index + 1;
            const isActive = page === currentPage;
            const href = page === 1 ? '/blog' : `/blog?page=${page}`;
            return (
              <Button
                key={page}
                as="a"
                href={href}
                size="sm"
                variant={isActive ? 'solid' : 'outline'}
                colorScheme="purple"
              >
                {page}
              </Button>
            );
          })}
        </Stack>
      </Container>
    </>
  );
}
