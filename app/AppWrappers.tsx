'use client';
import React, { ReactNode } from 'react';
import '@/styles/App.css';
import '@/styles/Contact.css';
import '@/styles/Plugins.css';
import '@/styles/MiniCalendar.css';
import { ChakraProvider } from '@chakra-ui/react';

// import dynamic from 'next/dynamic';
import theme from '@/theme/theme';
import { SessionProvider } from 'next-auth/react';
import ChatAiContextProvider from '@/contexts/ChatAiContext/ChatAiContextProvider';
import ModalContextProvider from '@/contexts/ModalContext/ModalContextProvider';
import { ModalsProvider } from '@salutejs/plasma-web';

const _NoSSR = ({ children }: any) => (
  <React.Fragment>{children}</React.Fragment>
);

// const NoSSR = dynamic(() => Promise.resolve(_NoSSR), {
//   ssr: false,
// });

export default function AppWrappers({ children }: { children: ReactNode }) {
  return (
    <ChatAiContextProvider>
      <SessionProvider>
        <ModalsProvider>
          <ChakraProvider theme={theme}>
            <ModalContextProvider>{children}</ModalContextProvider>
          </ChakraProvider>
        </ModalsProvider>
      </SessionProvider>
    </ChatAiContextProvider>
  );
}
