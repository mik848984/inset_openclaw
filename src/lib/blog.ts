import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export type BlogPostMeta = {
  title: string;
  slug: string;
  description: string;
  date: string;
  tags: string[];
  readingTime?: number;
  author?: string;
  ogImage?: string;
  coverImage?: string;
};

export type BlogPost = BlogPostMeta & {
  content: string;
};

const internalPostsDirectory = path.join(process.cwd(), 'content', 'blog');

// Основная директория для статей. Если указана переменная окружения
// BLOG_CONTENT_DIR, используем её (это удобно для Docker-томов и внешних дисков).
const postsDirectory =
  process.env.BLOG_CONTENT_DIR && process.env.BLOG_CONTENT_DIR.trim() !== ''
    ? process.env.BLOG_CONTENT_DIR.trim()
    : internalPostsDirectory;

function bootstrapFromInternalIfNeeded() {
  // Если используется внешняя директория и в ней пока нет файлов,
  // скопируем в неё дефолтные статьи из content/blog внутри проекта.
  if (!process.env.BLOG_CONTENT_DIR) return;
  if (!fs.existsSync(internalPostsDirectory)) return;
  if (!fs.existsSync(postsDirectory)) return;

  const existing = fs
    .readdirSync(postsDirectory)
    .filter((file) => file.endsWith('.md') || file.endsWith('.mdx'));
  if (existing.length > 0) return;

  const defaults = fs
    .readdirSync(internalPostsDirectory)
    .filter((file) => file.endsWith('.md') || file.endsWith('.mdx'));

  for (const file of defaults) {
    const src = path.join(internalPostsDirectory, file);
    const dest = path.join(postsDirectory, file);
    try {
      fs.copyFileSync(src, dest);
    } catch (e) {
      // не падаем, если не получилось скопировать — просто логируем
      console.error('[BLOG_BOOTSTRAP_COPY_ERROR]', e);
    }
  }
}

function ensurePostsDirectory() {
  if (!fs.existsSync(postsDirectory)) {
    fs.mkdirSync(postsDirectory, { recursive: true });
  }
  bootstrapFromInternalIfNeeded();
}

export function getAllPosts(): BlogPostMeta[] {
  ensurePostsDirectory();

  const fileNames = fs
    .readdirSync(postsDirectory)
    .filter((file) => file.endsWith('.md') || file.endsWith('.mdx'));

  const posts: BlogPostMeta[] = fileNames.map((fileName) => {
    const fullPath = path.join(postsDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data } = matter(fileContents);

    const meta: BlogPostMeta = {
      title: data.title || '',
      slug: data.slug || fileName.replace(/\.mdx?$/, ''),
      description: data.description || '',
      date: data.date || new Date().toISOString(),
      tags: data.tags || [],
      readingTime: data.readingTime,
      author: 'Команда ИИСеть',
      ogImage: data.ogImage,
      coverImage: data.coverImage,
    };

    return meta;
  });

  return posts.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPostBySlug(slug: string): BlogPost {
  ensurePostsDirectory();

  const fileNames = fs
    .readdirSync(postsDirectory)
    .filter((file) => file.endsWith('.md') || file.endsWith('.mdx'));

  for (const fileName of fileNames) {
    const fullPath = path.join(postsDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);
    const fileSlug = data.slug || fileName.replace(/\.mdx?$/, '');
    if (fileSlug === slug) {
      const post: BlogPost = {
        title: data.title || '',
        slug: fileSlug,
        description: data.description || '',
        date: data.date || new Date().toISOString(),
        tags: data.tags || [],
        readingTime: data.readingTime,
        author: data.author,
        ogImage: data.ogImage,
        coverImage: data.coverImage,
        content,
      };
      return post;
    }
  }

  throw new Error(`Post with slug "${slug}" not found`);
}

export type BlogPostInput = {
  title: string;
  slug?: string;
  description: string;
  content: string;
  date?: string;
  tags?: string[];
  readingTime?: number;
  author?: string;
  coverImage?: string;
  ogImage?: string;
};

function generateSlugFromTitle(title: string): string {
  return title
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9а-яё\-]/gi, '')
    .replace(/-+/g, '-');
}

export function createOrUpdatePost(
  input: BlogPostInput,
  oldSlug?: string,
): BlogPost {
  ensurePostsDirectory();

  const slug =
    input.slug && input.slug.trim() !== ''
      ? input.slug
      : generateSlugFromTitle(input.title);

  const date = input.date || new Date().toISOString();

  const meta: BlogPostMeta = {
    title: input.title,
    slug,
    description: input.description,
    date,
    tags: input.tags || [],
    readingTime: input.readingTime,
    author: 'Команда ИИСеть',
    coverImage: input.coverImage,
    ogImage: input.ogImage || input.coverImage,
  };

  function sanitizeMeta(meta: BlogPostMeta): BlogPostMeta {
    const cleaned: any = {};

    (Object.entries(meta) as [keyof BlogPostMeta, any][]).forEach(
      ([key, value]) => {
        // js-yaml не любит undefined — просто не записываем такие поля
        if (value === undefined) return;
        cleaned[key] = value;
      },
    );

    return cleaned as BlogPostMeta;
  }

  // ⬇️ вот тут важно — очищаем undefined
  const safeMeta = sanitizeMeta(meta);

  const fileName = `${slug}.mdx`;
  const filePath = path.join(postsDirectory, fileName);

  const fm = matter.stringify(input.content || '', safeMeta as any);
  fs.writeFileSync(filePath, fm, 'utf8');

  if (oldSlug && oldSlug !== slug) {
    const oldPath = path.join(postsDirectory, `${oldSlug}.mdx`);
    if (fs.existsSync(oldPath) && oldPath !== filePath) {
      fs.unlinkSync(oldPath);
    }
  }

  return { ...meta, content: input.content };
}

export function deletePost(slug: string) {
  ensurePostsDirectory();
  const filePathMdx = path.join(postsDirectory, `${slug}.mdx`);
  const filePathMd = path.join(postsDirectory, `${slug}.md`);
  if (fs.existsSync(filePathMdx)) {
    fs.unlinkSync(filePathMdx);
    return;
  }
  if (fs.existsSync(filePathMd)) {
    fs.unlinkSync(filePathMd);
  }
}