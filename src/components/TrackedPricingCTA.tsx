'use client';

import Link from 'next/link';
import { trackGoal } from '@/utils/metrics';
import { type CSSProperties, type ReactNode } from 'react';

interface TrackedPricingCTAProps {
  href: string;
  style?: CSSProperties;
  location: string;
  plan?: string;
  children: ReactNode;
}

export function TrackedPricingCTA({ href, style, location, plan, children }: TrackedPricingCTAProps) {
  return (
    <Link
      href={href}
      style={style}
      data-event="pricing_cta_click"
      data-location={location}
      data-target={href}
      data-plan={plan ?? ''}
      onClick={() => trackGoal('pricing_cta_click', { location, target: href, plan })}
    >
      {children}
    </Link>
  );
}
