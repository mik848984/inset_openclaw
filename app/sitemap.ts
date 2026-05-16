import { MetadataRoute } from "next";
import fs from "fs";
import path from "path";

/**
 * Генерация sitemap.xml для IISet
 * Включает все основные страницы + динамические посты блога.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://iiset.io";

  // Папка с постами блога (если контент хранится в /content/blog)
  const postsDirectory = path.join(process.cwd(), "content/blog");

  let blogUrls: MetadataRoute.Sitemap = [];

  try {
    // Читаем список файлов постов и формируем URL
    const files = fs.readdirSync(postsDirectory);
    blogUrls = files
      .filter((file) => file.endsWith(".md") || file.endsWith(".mdx"))
      .map((file) => {
        const slug = file.replace(/\.mdx?$/, "");
        return {
          url: `${baseUrl}/blog/${slug}`,
          lastModified: new Date(),
          changeFrequency: "weekly",
          priority: 0.6,
        };
      });
  } catch (err) {
    // Если нет папки content/blog — пропускаем
    console.warn("⚠️ Папка content/blog не найдена, пропускаем генерацию постов");
  }

  // Основные разделы сайта
  const staticUrls: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/chat`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/agents`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${baseUrl}/life-agents`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/templates`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.75,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
  ];

  return [...staticUrls, ...blogUrls];
}
