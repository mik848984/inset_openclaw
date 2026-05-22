'use client';

import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import OnboardingHint from './OnboardingHint';
import { useAppSession } from '@/utils/hooks/useAppSession';
import { ChatAiContext } from '@/contexts/ChatAiContext';
import type { IChatState } from '@/contexts/ChatAiContext';

type HintType = 'model' | 'image' | 'browsing';

interface HintConfig {
  id: HintType;
  title: string;
  description: string;
  actionLabel: string;
  allowAnonymous: boolean;
  priority: number;
}

// ── Storage & timing constants ────────────────────────────────────
// LOCAL_STORAGE_KEY is preserved — старые seen flags продолжат читаться
const LOCAL_STORAGE_KEY = 'iiset_onboarding_v1';
const SESSION_SHOWN_KEY = 'iiset_onboarding_hint_shown_this_session';

const INITIAL_DELAY_MS = 4000;
const AUTO_CLOSE_MS = 14000;
const MAX_HINTS_PER_SESSION = 1;
const GLOBAL_COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24h

// ── Hint catalog (no emoji, structured copy) ──────────────────────
const HINTS: HintConfig[] = [
  {
    id: 'model',
    title: 'Можно выбрать другую модель',
    description:
      'Для быстрых задач подойдёт лёгкая модель, для сложных — более сильная.',
    actionLabel: 'Понятно',
    allowAnonymous: true,
    priority: 1,
  },
  {
    id: 'image',
    title: 'ИИСеть умеет создавать изображения',
    description: 'Включите режим картинок и опишите, что хотите получить.',
    actionLabel: 'Понятно',
    allowAnonymous: true,
    priority: 2,
  },
  {
    id: 'browsing',
    title: 'Нужны свежие данные?',
    description:
      'Включите Web Поиск, чтобы ИИСеть искала информацию в интернете.',
    actionLabel: 'Понятно',
    allowAnonymous: false,
    priority: 3,
  },
];

// ── Persistent storage ────────────────────────────────────────────
interface OnboardingStorage {
  modelHintSeen?: boolean;
  imageHintSeen?: boolean;
  browsingHintSeen?: boolean;
  optOut?: boolean;
  lastHintAt?: number;
}

function readStorage(): OnboardingStorage {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as OnboardingStorage;
  } catch {
    return {};
  }
}

function writeStorage(next: OnboardingStorage) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
}

function markShown(id: HintType) {
  // Lighter-than-seen: just record cooldown and session flag
  const prev = readStorage();
  const updated: OnboardingStorage = {
    ...prev,
    lastHintAt: Date.now(),
  };
  writeStorage(updated);
  if (typeof window !== 'undefined') {
    try {
      window.sessionStorage.setItem(SESSION_SHOWN_KEY, '1');
    } catch {
      // ignore
    }
  }
  // We intentionally don't reference `id` here — markSeen handles per-hint flag
  void id;
}

function markSeen(id: HintType) {
  const prev = readStorage();
  const updated: OnboardingStorage = {
    ...prev,
    lastHintAt: Date.now(),
  };
  if (id === 'model') updated.modelHintSeen = true;
  if (id === 'image') updated.imageHintSeen = true;
  if (id === 'browsing') updated.browsingHintSeen = true;
  writeStorage(updated);
}

function isSeen(id: HintType, storage: OnboardingStorage): boolean {
  if (id === 'model') return !!storage.modelHintSeen;
  if (id === 'image') return !!storage.imageHintSeen;
  if (id === 'browsing') return !!storage.browsingHintSeen;
  return false;
}

// ── Helpers for показ-условий ─────────────────────────────────────
function isTypingNow(): boolean {
  if (typeof document === 'undefined') return false;
  const active = document.activeElement as HTMLElement | null;
  if (!active) return false;
  const tag = active.tagName?.toLowerCase();
  return (
    tag === 'input' ||
    tag === 'textarea' ||
    !!active.isContentEditable
  );
}

function isInGlobalCooldown(storage: OnboardingStorage): boolean {
  if (!storage.lastHintAt) return false;
  return Date.now() - storage.lastHintAt < GLOBAL_COOLDOWN_MS;
}

function hasSessionShownFlag(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.sessionStorage.getItem(SESSION_SHOWN_KEY) === '1';
  } catch {
    return false;
  }
}

// Heuristic: don't show a hint when a modal/sheet/drawer is open.
// Covers Chakra modals (role="dialog" aria-modal="true"), Plasma Sheet,
// and any custom modal-like element. Lightweight DOM probe; no DOM walks.
function hasOpenModal(): boolean {
  if (typeof document === 'undefined') return false;
  try {
    return !!document.querySelector('[aria-modal="true"]');
  } catch {
    return false;
  }
}

function sendMetric(event: string, payload: Record<string, any>) {
  if (typeof window === 'undefined') return;
  try {
    const w = window as any;
    if (typeof w.ym === 'function') {
      w.ym(100585692, 'reachGoal', event, payload);
    }
  } catch {
    // ignore
  }
}

export default function OnboardingHintManager() {
  const { session, isAnonymous } = useAppSession();
  const chatState = useContext(ChatAiContext) as Partial<IChatState>;
  const [currentHint, setCurrentHint] = useState<HintType | null>(null);
  const [storageSnapshot, setStorageSnapshot] = useState<OnboardingStorage>({});
  const sessionShownCountRef = useRef(0);
  const timersRef = useRef<number[]>([]);
  const hasScheduledRef = useRef(false);

  const userType: 'anonymous' | 'authorized' =
    session && !isAnonymous ? 'authorized' : 'anonymous';
  const device: 'mobile' | 'desktop' =
    typeof window !== 'undefined' && window.innerWidth <= 768
      ? 'mobile'
      : 'desktop';

  const messages = chatState.messages ?? [];
  const mode = chatState.mode ?? 'chat';
  const webSearch = chatState.webSearch ?? false;
  const loading = chatState.loading ?? false;

  const clearTimers = () => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  };

  // Read storage once on mount
  useEffect(() => {
    setStorageSnapshot(readStorage());
  }, []);

  // Cleanup all timers on unmount
  useEffect(() => {
    return () => {
      clearTimers();
    };
  }, []);

  const availableHints = useMemo(() => {
    const baseStorage = storageSnapshot || readStorage();
    return HINTS.filter((hint) => {
      if (!hint.allowAnonymous && userType === 'anonymous') return false;
      if (isSeen(hint.id, baseStorage)) return false;
      return true;
    }).sort((a, b) => a.priority - b.priority);
  }, [storageSnapshot, userType]);

  function conditionsSatisfied(id: HintType): boolean {
    const msgCount = messages.length || 0;

    if (id === 'model') {
      return msgCount >= 1;
    }

    if (id === 'image') {
      // Не показывать, если уже в режиме картинок
      return msgCount >= 3 && mode !== 'images';
    }

    if (id === 'browsing') {
      // Не показывать, если веб-поиск уже включён
      return msgCount >= 3 && !webSearch && userType === 'authorized';
    }

    return false;
  }

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // ── Pre-schedule gates ────────────────────────────────────────
    if (currentHint) return;
    if (loading) return;
    if (isTypingNow()) return;
    if (hasOpenModal()) return;
    if (storageSnapshot.optOut) return;
    if (hasSessionShownFlag()) return;
    if (isInGlobalCooldown(storageSnapshot)) return;
    if (sessionShownCountRef.current >= MAX_HINTS_PER_SESSION) return;
    if (!availableHints.length) return;
    if (hasScheduledRef.current) return;

    const nextEligible = availableHints.find((hint) =>
      conditionsSatisfied(hint.id),
    );
    if (!nextEligible) return;

    hasScheduledRef.current = true;

    const timeoutId = window.setTimeout(() => {
      // ── Re-check conditions inside the timer ─────────────────
      const freshStorage = readStorage();
      if (
        loading ||
        currentHint ||
        isTypingNow() ||
        hasOpenModal() ||
        hasSessionShownFlag() ||
        isInGlobalCooldown(freshStorage) ||
        !conditionsSatisfied(nextEligible.id)
      ) {
        hasScheduledRef.current = false;
        return;
      }

      setCurrentHint(nextEligible.id);
      sessionShownCountRef.current += 1;
      hasScheduledRef.current = false;
      markShown(nextEligible.id);

      sendMetric('onboarding_hint_shown', {
        type: nextEligible.id,
        surface: 'chat',
        userType,
        device,
      });

      const autoCloseId = window.setTimeout(() => {
        handleClose('auto');
      }, AUTO_CLOSE_MS);
      timersRef.current.push(autoCloseId);
    }, INITIAL_DELAY_MS);

    timersRef.current.push(timeoutId);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    availableHints,
    currentHint,
    loading,
    messages.length,
    mode,
    webSearch,
    userType,
    device,
    storageSnapshot,
  ]);

  const handleClose = (method: 'manual' | 'auto') => {
    if (!currentHint) return;

    markSeen(currentHint);
    setStorageSnapshot(readStorage());
    if (typeof window !== 'undefined') {
      try {
        window.sessionStorage.setItem(SESSION_SHOWN_KEY, '1');
      } catch {
        // ignore
      }
    }

    sendMetric('onboarding_hint_closed', {
      type: currentHint,
      surface: 'chat',
      userType,
      device,
      method,
    });

    setCurrentHint(null);
    clearTimers();
  };

  if (!currentHint) return null;

  const config = HINTS.find((h) => h.id === currentHint);
  if (!config) return null;

  return (
    <OnboardingHint
      type={config.id}
      title={config.title}
      description={config.description}
      actionLabel={config.actionLabel}
      onClose={() => handleClose('manual')}
      onAction={() => handleClose('manual')}
    />
  );
}
