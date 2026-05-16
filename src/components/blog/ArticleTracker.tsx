'use client';

import { useEffect } from 'react';
import { trackGoal } from '@/utils/metrics';

type Props = {
  slug: string;
};

export default function ArticleTracker({ slug }: Props) {
  useEffect(() => {
    trackGoal('article_opened', { slug });

    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const docHeight =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight;

      if (docHeight <= 0) return;

      const scrolled = scrollTop / docHeight;

      if (scrolled > 0.9) {
        // Дочитал до ~90% статьи
        trackGoal('article_read', { slug });
        window.removeEventListener('scroll', handleScroll);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [slug]);

  return null;
}
