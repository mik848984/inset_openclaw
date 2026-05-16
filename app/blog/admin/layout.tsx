import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Админка блога — ИИСеть',
  robots: {
    index: false,
    follow: false,
  },
};

export default function BlogAdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
