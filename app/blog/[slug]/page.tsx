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
  Tag,
  Divider,
  Image,
  Button,
  SimpleGrid,
} from '@chakra-ui/react';
import ReactMarkdown from 'react-markdown';
import ArticleTracker from '@/components/blog/ArticleTracker';

type Props = {
  params: {
    slug: string;
  };
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const siteBaseUrl = 'https://iiset.io';

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
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      type: 'article',
      publishedTime,
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
    author: {
      '@type': 'Person',
      name: post.author || 'Команда ИИСеть',
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
  const topPosts = allPosts.slice(0, 6);

  return (
    <>
      <ArticleTracker slug={params.slug} />
      <Container maxW="4xl" py={{ base: 8, md: 12 }}>
      <Heading as="h1" size="xl" mb={4}>
        {post.title}
      </Heading>

      <HStack spacing={3} mb={6} color="gray.500" fontSize="sm" wrap="wrap">
        {post.date && (
          <Text>
            {new Date(post.date).toLocaleDateString('ru-RU', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
            })}
          </Text>
        )}
        {post.readingTime && <Text>· {post.readingTime} мин чтения</Text>}
        {post.author && <Text>· {post.author}</Text>}
      </HStack>

      {post.tags && post.tags.length > 0 && (
        <HStack spacing={2} mb={4} flexWrap="wrap">
          {post.tags.map((tag) => (
            <Tag key={tag} size="sm" variant="subtle" colorScheme="purple">
              {tag}
            </Tag>
          ))}
        </HStack>
      )}

      {imageUrl && (
        <Box mb={6}>
          <Image
            src={imageUrl}
            alt={post.title}
            borderRadius="lg"
            w="100%"
            maxH="420px"
            objectFit="cover"
          />
        </Box>
      )}

      <Divider mb={6} />

      <Box className="blog-content">
        <ReactMarkdown>{post.content}</ReactMarkdown>
      </Box>

      <Box mt={10}>
        <Button as={Link} href="/blog" colorScheme="purple" variant="outline">
          Вернуться ко всем новостям
        </Button>
      </Box>

      <Box mt={12}>
        <Heading size="md" mb={4}>
          Главное на ИИСети
        </Heading>
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
          {topPosts.map((p) => (
            <Box
              key={p.slug}
              p={4}
              borderWidth="1px"
              borderRadius="lg"
              _hover={{ boxShadow: 'md', transform: 'translateY(-2px)' }}
              transition="all 0.15s ease-out"
            >
              <Heading as="h3" size="sm" mb={2}>
                <Link href={`/blog/${encodeURIComponent(p.slug)}`}>
                  {p.title}
                </Link>
              </Heading>
              <Text fontSize="sm" color="gray.600" noOfLines={3} mb={2}>
                {p.description}
              </Text>
              <HStack spacing={2} fontSize="xs" color="gray.500">
                {p.date && (
                  <Text>
                    {new Date(p.date).toLocaleDateString('ru-RU', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </Text>
                )}
                {p.readingTime && <Text>· {p.readingTime} мин чтения</Text>}
              </HStack>
            </Box>
          ))}
        </SimpleGrid>
      </Box>


      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </Container>
    </>
  );
}