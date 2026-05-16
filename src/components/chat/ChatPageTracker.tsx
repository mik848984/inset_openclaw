'use client';

import { useEffect } from 'react';
import { trackGoal } from '@/utils/metrics';

export default function ChatPageTracker() {
  useEffect(() => {
    trackGoal('chat_opened');
  }, []);

  return null;
}
