import React, { useEffect, useRef, useState } from 'react';
import { ChatAiContext, IMessage } from '@/contexts/ChatAiContext/index';
import { ChatBody } from '@/types/types';
import DDG from 'duck-duck-scrape';
import useLocalStorageState from 'use-local-storage-state';
import { messagesService } from '@/services/ui/MessagesService';
import { attachmentsService } from '@/services/ui/AttachemntsService';

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
    // fullAnswer    — all decoded text accumulated from the stream
    // visibleAnswer — what's currently rendered in the UI
    // pendingText   — buffer between stream → UI flush ticks
    let fullAnswer = '';
    let visibleAnswer = '';
    let pendingText = '';
    let flushTimer: ReturnType<typeof setInterval> | null = null;

    // Adaptive chunk size — more text in buffer ⇒ faster output
    const getChunkSize = () => {
      if (pendingText.length > 1000) return 180;
      if (pendingText.length > 400) return 100;
      if (pendingText.length > 120) return 48;
      return 24;
    };

    // Immutable assistant message update — React/Message memo sees a new object
    const updateAssistantMessage = (content: string) => {
      setMessages([...newMessages, { role: 'assistant', content }]);
    };

    // Per-tick flush: move a slice of pendingText into visibleAnswer
    const tick = () => {
      if (pendingText.length === 0) return;
      const size = getChunkSize();
      const slice = pendingText.slice(0, size);
      pendingText = pendingText.slice(size);
      visibleAnswer += slice;
      updateAssistantMessage(visibleAnswer);
    };

    // Stop timer + sync UI to the full text immediately
    const finalize = () => {
      if (flushTimer) {
        clearInterval(flushTimer);
        flushTimer = null;
      }
      if (visibleAnswer !== fullAnswer) {
        visibleAnswer = fullAnswer;
        updateAssistantMessage(fullAnswer);
      }
    };

    flushTimer = setInterval(tick, 32);

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
          fullAnswer += chunkValue;
          pendingText += chunkValue;
        }
      }

      // Drain decoder's internal buffer at the end
      const rest = decoder.decode();
      if (rest) {
        fullAnswer += rest;
        pendingText += rest;
      }

      log('stream_done', { totalChars: fullAnswer.length });

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

      // Skip empty assistant save — avoids polluting history with empty rows
      // on abort/error before the first chunk arrived.
      if (fullAnswer.trim().length > 0) {
        // Save the FINAL full assistant message (not partial visibleAnswer)
        await messagesService.createMessage({
          role: 'assistant',
          content: fullAnswer,
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
      }}
    >
      {children}
    </ChatAiContext.Provider>
  );
}

export default ChatAiContextProvider;
