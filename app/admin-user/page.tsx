'use client';

import React, { Suspense } from 'react';
import Content from './Content';
import { usersService } from '@/services/ui/UsersService';
import { useSubscribe } from '@/utils/hooks/useSubscribe';

export default function Home() {
  useSubscribe(usersService.listeners);

  if (!usersService.currentUser) return null;

  return (
    <Suspense fallback={null}>
      <Content />
    </Suspense>
  );
}
