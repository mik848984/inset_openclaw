'use client';

import { useEffect } from 'react';
import { trackGoal } from '@/utils/metrics';

export default function BlogPageTracker() {
  useEffect(() => {
    trackGoal('blog_opened');
  }, []);

  return null;
}
