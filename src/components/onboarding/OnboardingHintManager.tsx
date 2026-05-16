'use client';

import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import OnboardingHint from './OnboardingHint';
import { useAppSession } from '@/utils/hooks/useAppSession';
import { ChatAiContext } from '@/contexts/ChatAiContext';
import type { IChatState } from '@/contexts/ChatAiContext';


type HintType = 'model' | 'image' | 'browsing';

interface HintConfig {
  id: HintType;
  text: string;
  allowAnonymous: boolean;
  priority: number;
}

const LOCAL_STORAGE_KEY = 'iiset_onboarding_v1';
const INITIAL_DELAY_MS = 2500;
const BETWEEN_HINTS_MS = 60000;
const AUTO_CLOSE_MS = 10000;
const MAX_HINTS_PER_SESSION = 2;

const HINTS: HintConfig[] = [
  {
    id: 'model',
    text:
      '💡 Попробуй сменить модель — нажми на 🤖 рядом с панелью ввода: у каждой модели свой стиль и скорость ответов.',
    allowAnonymous: true,
    priority: 1,
  },
  {
    id: 'image',
    text:
      '🎨 Попробуй сгенерировать картинку — включи режим «Генерация изображений» справа от поля ввода.',
    allowAnonymous: true,
    priority: 2,
  },
  {
    id: 'browsing',
    text:
      '🌐 Воспользуйся веб-поиском, чтобы получать свежие данные из интернета — включи «Web Поиск» под выбором модели.',
    allowAnonymous: false,
    priority: 3,
  },
];

interface OnboardingStorage {
  modelHintSeen?: boolean;
  imageHintSeen?: boolean;
  browsingHintSeen?: boolean;
  optOut?: boolean;
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

function markSeen(id: HintType) {
  const prev = readStorage();
  const updated: OnboardingStorage = { ...prev };
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
  const lastHintIdRef = useRef<HintType | null>(null);

  const userType: 'anonymous' | 'authorized' = session && !isAnonymous ? 'authorized' : 'anonymous';
  const device: 'mobile' | 'desktop' =
    typeof window !== 'undefined' && window.innerWidth <= 768 ? 'mobile' : 'desktop';

  const messages = chatState.messages ?? [];
  const mode = chatState.mode ?? 'chat';
  const webSearch = chatState.webSearch ?? false;
  const loading = chatState.loading ?? false;

  // read storage once on mount
  useEffect(() => {
    setStorageSnapshot(readStorage());
  }, []);

  useEffect(() => {
    return () => {
      timersRef.current.forEach((id) => window.clearTimeout(id));
      timersRef.current = [];
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
      return msgCount >= 3 && mode !== 'images';
    }

    if (id === 'browsing') {
      return msgCount >= 3 && !webSearch && userType === 'authorized';
    }

    return false;
  }

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (sessionShownCountRef.current >= MAX_HINTS_PER_SESSION) return;
    if (!availableHints.length) return;
    if (currentHint) return;
    if (loading) return;
    if (hasScheduledRef.current) return;

    const nextEligible = availableHints.find((hint) => conditionsSatisfied(hint.id));
    if (!nextEligible) return;

    const isFirst = sessionShownCountRef.current === 0;
    const delay = isFirst ? INITIAL_DELAY_MS : BETWEEN_HINTS_MS;

    hasScheduledRef.current = true;

    const timeoutId = window.setTimeout(() => {
      setCurrentHint(nextEligible.id);
      sessionShownCountRef.current += 1;
      hasScheduledRef.current = false;
      lastHintIdRef.current = nextEligible.id;

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
    }, delay);

    timersRef.current.push(timeoutId);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availableHints, currentHint, loading, messages.length, mode, webSearch, userType, device]);

  const handleClose = (method: 'manual' | 'auto') => {
    if (!currentHint) return;

    markSeen(currentHint);
    setStorageSnapshot(readStorage());

    sendMetric('onboarding_hint_closed', {
      type: currentHint,
      surface: 'chat',
      userType,
      device,
      method,
    });

    setCurrentHint(null);
  };

  if (!currentHint) return null;

  const config = HINTS.find((h) => h.id === currentHint);
  if (!config) return null;

  return <OnboardingHint text={config.text} onClose={() => handleClose('manual')} />;
}
