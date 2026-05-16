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
    const newMessage = { role: 'user', content: message };
    const newMessages = [...messagesRef.current, newMessage];
    setMessages(newMessages);

    setLoading(true);

    await messagesService.createMessage(newMessage);

    const answerMessage = { role: 'assistant', content: '' };
    let newMessagesWithAnswer = [...newMessages, answerMessage];

    setMessages(newMessagesWithAnswer);

    const controller = new AbortController();

    refAbortController.current = controller;

    try {
      const response = await fetch('/api/chatAPI', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          messages: newMessages,
          model,
          mode,
          webSearch,
          files: attachmentsService.getSuccessAttachments(),
          youtube: attachmentsService.youTube,
        }),
      });

      const data = response.body;

      if (!data) {
        setLoading(false);
        return;
      }

      const reader = data.getReader();
      const decoder = new TextDecoder();
      let done = false;

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;

        const chunkValue = decoder.decode(value);
        newMessagesWithAnswer = [...newMessages, answerMessage];

        answerMessage.content += chunkValue;
        newMessagesWithAnswer[newMessagesWithAnswer.length - 1] = answerMessage;
        setMessages([...newMessagesWithAnswer]);
      }
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);

      await messagesService.createMessage(
        newMessagesWithAnswer[newMessagesWithAnswer.length - 1],
      );
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
