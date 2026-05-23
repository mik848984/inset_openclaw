import { MetadataRoute } from 'next';
import { getAllPosts } from '@/lib/blog';

/**
 * sitemap.xml для iiset.io
 *
 * Включает только публичные страницы. Приватные/админские/технические
 * (/api, /admin, /users, /settings, /usage, /dialogs и т.п.) — не индексируем.
 *
 * Для блога берём slug + date из frontmatter (через getAllPosts), а не
 * имя файла + Date.now(). Будущие/невалидные/без title посты отфильтрованы.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://iiset.io';
  const now = new Date();

  // ── Публичные «лендинговые» страницы ───────────────────────────────
  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/chat`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/life-agents`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/all-templates`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.75,
    },
    {
      url: `${baseUrl}/others/sign-in`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
  ];

  // ── Доступные life-agents (статически на диске) ───────────────────
  // Список синхронизирован с app/life-agents/*/page.tsx
  const lifeAgentSlugs = [
    'alter-ego',
    'epilogist',
    'letter-from-child',
    'life-editor',
    'netflix-writer',
    'oracle',
    'psychoanalyst',
  ];
  const lifeAgentEntries: MetadataRoute.Sitemap = lifeAgentSlugs.map(
    (slug) => ({
      url: `${baseUrl}/life-agents/${slug}`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.65,
    }),
  );

  // ── Блог: публикуем только не-будущие посты с непустым title ──────
  let blogEntries: MetadataRoute.Sitemap = [];
  try {
    const posts = getAllPosts();
    blogEntries = posts
      .filter((post) => {
        if (!post.slug || !post.title) return false;
        if (!post.date) return false;
        const d = new Date(post.date);
        if (Number.isNaN(d.getTime())) return false;
        return d <= now;
      })
      .map((post) => ({
        url: `${baseUrl}/blog/${encodeURIComponent(post.slug)}`,
        lastModified: new Date(post.date),
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      }));
  } catch (err) {
    console.warn('[sitemap] blog read failed:', err);
  }

  return [...staticEntries, ...lifeAgentEntries, ...blogEntries];
}
