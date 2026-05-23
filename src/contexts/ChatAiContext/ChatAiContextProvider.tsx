import React, { useEffect, useRef, useState } from 'react';
import {
  ChatAiContext,
  IMessage,
  IProjectChip,
} from '@/contexts/ChatAiContext/index';
import { ChatBody } from '@/types/types';
import DDG from 'duck-duck-scrape';
import useLocalStorageState from 'use-local-storage-state';
import { messagesService } from '@/services/ui/MessagesService';
import { attachmentsService } from '@/services/ui/AttachemntsService';
import {
  stripThinkBlocks,
  findFlushBoundary,
  parseSourcesFromContent,
  stripSourcesMarker,
  ISource,
  SearchImage,
  SearchIntent,
  SearchSummary,
  ComparisonWidget,
  CodeFixWidget,
  NewsTimelineItem,
  SearchKnowledgeGraph,
  PeopleAlsoAskItem,
  SearchNewsItem,
  SearchPlaceItem,
  SearchProductItem,
  SearchScholarItem,
  SearchVideoItem,
} from '@/utils/normalizeModelOutput';

interface IProps {
  children: React.ReactNode;
}

function ChatAiContextProvider({ children }: IProps) {
  const refAbortController = useRef<AbortController>();
  const messagesRef = useRef<IMessage[]>([]);
  const [messages, setMessagesInitial] = useState<IMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [mode, setModeAction] = useLocalStorageState('mode', {
    defaultValue: 'chat',
  });

  const setMessages = (messages: IMessage[]) => {
    messagesRef.current = messages;
    setMessagesInitial(messages);
  };

  const [webSearch, setWebSearchAction] = useLocalStorageState('webSearch', {
    defaultValue: false,
  });
  const [model, setModelAction] = useLocalStorageState('model', {
    defaultValue: 'gemini-2.5-flash-lite',
  });
  // Reasoning visibility — OFF by default. Controls whether the UI exposes
  // model <think> reasoning in a collapsible section.
  const [reasoningEnabled, setReasoningEnabledAction] =
    useLocalStorageState<boolean>('reasoningEnabled', {
      defaultValue: false,
    });
  const setReasoningEnabled = (value: boolean) => {
    setReasoningEnabledAction(value);
  };
  // Keep a ref to read the latest value inside the streaming closure.
  const reasoningEnabledRef = useRef(reasoningEnabled);
  useEffect(() => {
    reasoningEnabledRef.current = reasoningEnabled;
  }, [reasoningEnabled]);

  // ── Project workspace state ─────────────────────────────────────
  // Чат может работать «в контексте проекта»: тогда в /api/chatAPI летит
  // projectId, и backend подмешивает project system prompt в LLM-запрос.
  const [activeProjectId, setActiveProjectIdState] = useState<string | null>(
    null,
  );
  const [activeProjectChip, setActiveProjectChip] =
    useState<IProjectChip | null>(null);
  const activeProjectIdRef = useRef<string | null>(null);
  useEffect(() => {
    activeProjectIdRef.current = activeProjectId;
  }, [activeProjectId]);

  const setActiveProjectId = (id: string | null) => {
    setActiveProjectIdState(id);
    if (!id) setActiveProjectChip(null);
  };

  // Sync с ?projectId= URL — клиентский SPA-роутинг сам не дёргает
  // провайдер при изменении query, поэтому слушаем popstate/pushstate.
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const readFromUrl = () => {
      try {
        const u = new URL(window.location.href);
        const next = u.searchParams.get('projectId') || null;
        if (next !== activeProjectIdRef.current) {
          setActiveProjectIdState(next);
          if (!next) setActiveProjectChip(null);
        }
      } catch {
        /* noop */
      }
    };

    readFromUrl();
    window.addEventListener('popstate', readFromUrl);
    // Next.js `router.push` issues a custom event in some setups; в любом
    // случае polling-fallback тут не нужен — компонент сам set'ит chip.
    return () => {
      window.removeEventListener('popstate', readFromUrl);
    };
  }, []);

  const setModel = (modelValue: string) => {
    setModelAction(modelValue);
  };

  const setMode = (modeValue: string) => {
    if (modeValue === 'chat' && mode === 'chat') {
      setWebSearch(false);
      setModeAction('images');
    } else if (modeValue === 'images' && mode === 'images') {
      setModeAction('chat');
    } else {
      if (modeValue === 'images') {
        setWebSearch(false);
      }
      setModeAction(modeValue);
    }
  };

  const setWebSearch = (webSearchValue: boolean) => {
    if (webSearchValue && mode === 'images') {
      setMode('chat');
      setWebSearchAction(webSearchValue);
    } else {
      setWebSearchAction(webSearchValue);
    }
  };

  async function sendMessage(message: string) {
    // ── Lightweight latency instrumentation ───────────────────────
    // Logs durations only; never logs the user's message text.
    // Gated by NODE_ENV to avoid spamming production console.
    const ENABLE_LATENCY_LOGS =
      typeof process !== 'undefined' &&
      process.env.NODE_ENV !== 'production';

    const t0 =
      typeof performance !== 'undefined' ? performance.now() : Date.now();
    const log = (tag: string, extra?: Record<string, any>) => {
      if (!ENABLE_LATENCY_LOGS) return;
      const dt = Math.round(
        (typeof performance !== 'undefined' ? performance.now() : Date.now()) -
          t0,
      );
      // eslint-disable-next-line no-console
      console.log(`[CHAT-CLIENT] ${tag} +${dt}ms`, extra || '');
    };

    log('send_start');

    const newMessage = { role: 'user', content: message };
    const newMessages = [...messagesRef.current, newMessage];
    setMessages(newMessages);
    log('optimistic_set');

    setLoading(true);

    // Fire-and-forget save of user message — DOES NOT block LLM fetch.
    // Errors are logged, but the assistant response still streams normally.
    const createUserPromise = messagesService
      .createMessage(newMessage)
      .catch((e) => {
        // eslint-disable-next-line no-console
        console.error('[CHAT-CLIENT] createMessage(user) error', e);
      });
    log('create_user_msg_scheduled');

    // Start with empty assistant message (immutable updates only)
    setMessages([...newMessages, { role: 'assistant', content: '' }]);

    const controller = new AbortController();
    refAbortController.current = controller;

    // ── Smoothing buffer (ChatGPT-like streaming) ─────────────────
    // rawAccumulator       — exact text from the stream (with <think> tags)
    // displayFullAnswer    — what the UI is supposed to converge to
    //                        = raw if reasoningEnabled (Message extracts think)
    //                        = stripped if reasoningEnabled is false
    // visibleAnswer        — what's currently rendered in the UI
    // pendingText          — buffer between stream → UI flush ticks
    let rawAccumulator = '';
    let displayFullAnswer = '';
    let visibleAnswer = '';
    let pendingText = '';
    // Search metadata extracted from the leading __IISET_SOURCES__ marker
    // (if any). All fields travel together so source cards, image strip,
    // follow-up chips и v3-виджеты (summary / comparison / codeFix /
    // newsTimeline) рендерятся live в процессе стрима.
    let messageSources: ISource[] | undefined = undefined;
    let messageImages: SearchImage[] | undefined = undefined;
    let messageFollowUps: string[] | undefined = undefined;
    let messageIntent: SearchIntent | null | undefined = undefined;
    let messageSummary: SearchSummary | null | undefined = undefined;
    let messageComparison: ComparisonWidget | null | undefined = undefined;
    let messageCodeFix: CodeFixWidget | null | undefined = undefined;
    let messageNewsTimeline: NewsTimelineItem[] | undefined = undefined;
    let messageKnowledgeGraph: SearchKnowledgeGraph | null | undefined =
      undefined;
    let messagePeopleAlsoAsk: PeopleAlsoAskItem[] | undefined = undefined;
    let messageNews: SearchNewsItem[] | undefined = undefined;
    let messagePlaces: SearchPlaceItem[] | undefined = undefined;
    let messageShopping: SearchProductItem[] | undefined = undefined;
    let messageScholar: SearchScholarItem[] | undefined = undefined;
    let messageVideos: SearchVideoItem[] | undefined = undefined;
    let flushTimer: ReturnType<typeof setInterval> | null = null;

    // Adaptive chunk size — more text in buffer ⇒ faster output.
    // Sizes are intentionally larger than per-char to feel like
    // "words appear" instead of "letters being typed".
    const getChunkSize = () => {
      if (pendingText.length > 800) return 160;
      if (pendingText.length > 300) return 80;
      if (pendingText.length > 80) return 40;
      return 18;
    };

    // Immutable assistant message update — React/Message memo sees a new
    // object. Search metadata (sources/images/followUps + v3 widgets)
    // travels via optional fields so Perplexity-like UI рендерится LIVE
    // в процессе стрима, ещё до того, как reload пересчитает marker.
    const updateAssistantMessage = (content: string) => {
      const hasMeta =
        (messageSources && messageSources.length > 0) ||
        (messageImages && messageImages.length > 0) ||
        (messageFollowUps && messageFollowUps.length > 0) ||
        !!messageIntent ||
        !!messageSummary ||
        !!messageComparison ||
        !!messageCodeFix ||
        (messageNewsTimeline && messageNewsTimeline.length > 0) ||
        !!messageKnowledgeGraph ||
        (messagePeopleAlsoAsk && messagePeopleAlsoAsk.length > 0) ||
        (messageNews && messageNews.length > 0) ||
        (messagePlaces && messagePlaces.length > 0) ||
        (messageShopping && messageShopping.length > 0) ||
        (messageScholar && messageScholar.length > 0) ||
        (messageVideos && messageVideos.length > 0);

      const next: IMessage = hasMeta
        ? {
            role: 'assistant',
            content,
            ...(messageSources && messageSources.length > 0
              ? { sources: messageSources }
              : {}),
            ...(messageImages && messageImages.length > 0
              ? { images: messageImages }
              : {}),
            ...(messageFollowUps && messageFollowUps.length > 0
              ? { followUps: messageFollowUps }
              : {}),
            ...(messageIntent ? { intent: messageIntent } : {}),
            ...(messageSummary ? { summary: messageSummary } : {}),
            ...(messageComparison
              ? { comparison: messageComparison }
              : {}),
            ...(messageCodeFix ? { codeFix: messageCodeFix } : {}),
            ...(messageNewsTimeline && messageNewsTimeline.length > 0
              ? { newsTimeline: messageNewsTimeline }
              : {}),
            ...(messageKnowledgeGraph
              ? { knowledgeGraph: messageKnowledgeGraph }
              : {}),
            ...(messagePeopleAlsoAsk && messagePeopleAlsoAsk.length > 0
              ? { peopleAlsoAsk: messagePeopleAlsoAsk }
              : {}),
            ...(messageNews && messageNews.length > 0
              ? { news: messageNews }
              : {}),
            ...(messagePlaces && messagePlaces.length > 0
              ? { places: messagePlaces }
              : {}),
            ...(messageShopping && messageShopping.length > 0
              ? { shopping: messageShopping }
              : {}),
            ...(messageScholar && messageScholar.length > 0
              ? { scholar: messageScholar }
              : {}),
            ...(messageVideos && messageVideos.length > 0
              ? { videos: messageVideos }
              : {}),
          }
        : { role: 'assistant', content };

      setMessages([...newMessages, next]);
    };

    // Per-tick flush: take a word-aligned slice from pendingText.
    const tick = () => {
      if (pendingText.length === 0) return;
      const size = getChunkSize();
      const cut = findFlushBoundary(pendingText, size);
      const slice = pendingText.slice(0, cut);
      pendingText = pendingText.slice(cut);
      visibleAnswer += slice;
      updateAssistantMessage(visibleAnswer);
    };

    // Stop timer + sync UI to the full text immediately.
    const finalize = () => {
      if (flushTimer) {
        clearInterval(flushTimer);
        flushTimer = null;
      }
      if (visibleAnswer !== displayFullAnswer) {
        visibleAnswer = displayFullAnswer;
        pendingText = '';
        updateAssistantMessage(displayFullAnswer);
      }
    };

    // Recompute the display text from raw, account for any retraction
    // (e.g. when a <think> block just closed and we need to remove its
    // partial content from pendingText). Also strips the leading sources
    // marker (Perplexity-like cards are pushed via `messageSources`).
    const ingestChunk = (rawChunk: string) => {
      if (!rawChunk) return;
      rawAccumulator += rawChunk;

      // Detect a freshly-complete sources marker once. Marker может
      // нести расширенные v3-виджеты — intent, summary, comparison,
      // codeFix, newsTimeline. Старые v1/v2 markers всё ещё валидны.
      if (
        !messageSources &&
        !messageImages &&
        !messageFollowUps &&
        !messageIntent &&
        !messageSummary &&
        !messageComparison &&
        !messageCodeFix &&
        !messageNewsTimeline &&
        !messageKnowledgeGraph &&
        !messagePeopleAlsoAsk &&
        !messageNews &&
        !messagePlaces &&
        !messageShopping &&
        !messageScholar &&
        !messageVideos
      ) {
        const parsed = parseSourcesFromContent(rawAccumulator);
        const gotAnything =
          parsed.sources.length > 0 ||
          parsed.images.length > 0 ||
          parsed.followUps.length > 0 ||
          !!parsed.intent ||
          !!parsed.summary ||
          !!parsed.comparison ||
          !!parsed.codeFix ||
          parsed.newsTimeline.length > 0 ||
          !!parsed.knowledgeGraph ||
          parsed.peopleAlsoAsk.length > 0 ||
          parsed.news.length > 0 ||
          parsed.places.length > 0 ||
          parsed.shopping.length > 0 ||
          parsed.scholar.length > 0 ||
          parsed.videos.length > 0;
        if (gotAnything) {
          if (parsed.sources.length > 0) messageSources = parsed.sources;
          if (parsed.images.length > 0) messageImages = parsed.images;
          if (parsed.followUps.length > 0)
            messageFollowUps = parsed.followUps;
          if (parsed.intent) messageIntent = parsed.intent;
          if (parsed.summary) messageSummary = parsed.summary;
          if (parsed.comparison) messageComparison = parsed.comparison;
          if (parsed.codeFix) messageCodeFix = parsed.codeFix;
          if (parsed.newsTimeline.length > 0)
            messageNewsTimeline = parsed.newsTimeline;
          if (parsed.knowledgeGraph)
            messageKnowledgeGraph = parsed.knowledgeGraph;
          if (parsed.peopleAlsoAsk.length > 0)
            messagePeopleAlsoAsk = parsed.peopleAlsoAsk;
          if (parsed.news.length > 0) messageNews = parsed.news;
          if (parsed.places.length > 0) messagePlaces = parsed.places;
          if (parsed.shopping.length > 0) messageShopping = parsed.shopping;
          if (parsed.scholar.length > 0) messageScholar = parsed.scholar;
          if (parsed.videos.length > 0) messageVideos = parsed.videos;
          // Refresh UI now that we know meta — even before first LLM token
          updateAssistantMessage(visibleAnswer);
        }
      }

      // displayFullAnswer = what the UI should converge to (no marker, no
      // hidden think when reasoning is OFF).
      const withoutThink = reasoningEnabledRef.current
        ? rawAccumulator
        : stripThinkBlocks(rawAccumulator);
      const next = stripSourcesMarker(withoutThink);

      const accounted = visibleAnswer.length + pendingText.length;
      if (next.length > accounted) {
        pendingText += next.slice(accounted);
      } else if (next.length < accounted) {
        // Retract: the strip removed something already buffered/shown.
        const overshoot = accounted - next.length;
        if (pendingText.length >= overshoot) {
          pendingText = pendingText.slice(0, pendingText.length - overshoot);
        } else {
          // Rare case: visible already shows text that no longer should be
          // shown — sync hard. Brief flicker is acceptable.
          pendingText = '';
          visibleAnswer = next;
          updateAssistantMessage(visibleAnswer);
        }
      }
      displayFullAnswer = next;
    };

    // ~28ms ≈ 35 ticks/sec — soft, word-by-word feel.
    flushTimer = setInterval(tick, 28);

    try {
      const successAttachments = attachmentsService.getSuccessAttachments();
      const youtubeUrl = attachmentsService.youTube;

      log('fetch_started', {
        model,
        mode,
        webSearch: !!webSearch,
        filesCount: Array.isArray(successAttachments)
          ? successAttachments.length
          : 0,
        youtubePresent: !!youtubeUrl,
        messagesCount: newMessages.length,
      });

      const response = await fetch('/api/chatAPI', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          messages: newMessages,
          model,
          mode,
          webSearch,
          files: successAttachments,
          youtube: youtubeUrl,
          projectId: activeProjectIdRef.current || undefined,
        }),
      });

      log('fetch_headers', { status: response.status });

      const data = response.body;

      if (!data) {
        log('no_response_body');
        finalize();
        setLoading(false);
        return;
      }

      const reader = data.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let firstChunkLogged = false;

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;

        // When doneReading=true, value is undefined — guard before decode.
        // { stream: true } keeps multi-byte UTF-8 boundaries safe (важно для кириллицы)
        if (!value) continue;
        const chunkValue = decoder.decode(value, { stream: true });
        if (chunkValue) {
          if (!firstChunkLogged) {
            log('first_chunk_received');
            firstChunkLogged = true;
          }
          ingestChunk(chunkValue);
        }
      }

      // Drain decoder's internal buffer at the end
      const rest = decoder.decode();
      if (rest) ingestChunk(rest);

      log('stream_done', { rawChars: rawAccumulator.length });

      // Stream complete — sync UI to full text immediately
      finalize();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log('[CHAT-CLIENT] stream_error', e);
      // Abort or fetch error — stop timer and show whatever we have
      finalize();
    } finally {
      // Safety net: even if finalize threw, the timer must not leak
      if (flushTimer) {
        clearInterval(flushTimer);
        flushTimer = null;
      }
      setLoading(false);

      // Wait for user-message save to settle before saving assistant.
      // We awaited the promise (not awaiting createMessage upfront) so
      // LLM fetch could start in parallel with user message persistence.
      await createUserPromise;

      // Persist text with <think> stripped but the __IISET_SOURCES__ marker
      // KEPT — so on page reload Message can re-parse source cards. The
      // marker is hidden from rendering via parseSourcesFromContent.
      const cleanFinal = stripThinkBlocks(rawAccumulator);

      // Skip empty assistant save — avoids polluting history with empty rows
      // on abort/error before the first chunk arrived.
      // Use stripped-visible length for the emptiness check.
      const visibleFinal = stripSourcesMarker(cleanFinal);
      if (visibleFinal.trim().length > 0) {
        await messagesService.createMessage({
          role: 'assistant',
          content: cleanFinal,
        });
        log('all_saved');
      } else {
        log('skipped_empty_assistant_save');
      }
    }
  }

  function abortRequest() {
    refAbortController.current?.abort();
  }

  const regenerateLastMessage = async () => {
    const userMessages = messagesRef.current.filter(
      (message) => message.role === 'user',
    );

    const lastUserMessage = userMessages[userMessages.length - 1].content;

    console.log({ messages: messagesRef.current });
    console.log({
      'messages.slice(0, messages.length - 2)': messagesRef.current.slice(
        0,
        messagesRef.current.length - 2,
      ),
    });

    setMessages(messagesRef.current.slice(0, messagesRef.current.length - 2));

    await sendMessage(lastUserMessage);
  };

  return (
    <ChatAiContext.Provider
      value={{
        messages,
        model,
        mode,
        sendMessage,
        setModel,
        loading,
        abortRequest,
        setMode,
        webSearch,
        setWebSearch,
        setMessages,
        regenerateLastMessage,
        reasoningEnabled,
        setReasoningEnabled,
        activeProjectId,
        setActiveProjectId,
        activeProjectChip,
        setActiveProjectChip,
      }}
    >
      {children}
    </ChatAiContext.Provider>
  );
}

export default ChatAiContextProvider;
