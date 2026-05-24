import type { Metadata, Viewport } from 'next';
import { auth } from '@/auth';
import { isAdmin } from '@/utils/isAdmin';
import SearchClient from './SearchClient';
import SearchRestricted from './SearchRestricted';

export const metadata: Metadata = {
  title: 'ИИСеть Поиск — ответы с источниками',
  description:
    'Спросите ИИСеть Поиск — получите краткий ответ с цитированием источников вместо десятка вкладок.',
};

export function generateViewport(): Viewport {
  return {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  };
}

export default async function SearchPage() {
  const session = await auth();
  const email = session?.user?.email;

  if (!email || !isAdmin(email)) {
    return <SearchRestricted />;
  }

  return <SearchClient />;
}
