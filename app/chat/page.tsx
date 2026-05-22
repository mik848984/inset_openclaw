import type { Metadata } from 'next';
import { Flex } from '@chakra-ui/react';
import '@/components/chat/components/oneLight.css';
import '@/components/chat/components/oneDark.css';
import GptChat from '@/components/chat/components/GptChat';
import ChatPageTracker from '@/components/chat/ChatPageTracker';
import OnboardingHintManager from '@/components/onboarding/OnboardingHintManager';

import { Viewport } from 'next';

export const metadata: Metadata = {
  title: 'Чат с искусственным интеллектом — IISet Chat',
  description:
    'Главная рабочая среда ИИСети: диалоги с искусственным интеллектом, генерация текстов и изображений, работа с файлами и интернет-поиск в одном интерфейсе.',
};

export function generateViewport(): Viewport {
  return {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  };
}

export default function Home() {
  return (
    <>
      <ChatPageTracker />
      <Flex
        w="100%"
        pt={{ base: '70px', md: '0px' }}
        direction="column"
        position="relative"
        height={{
          base: 'calc(100dvh - 100px)',
          xl: 'calc(100dvh - 100px)',
        }}
        maxHeight={{
          base: 'calc(100dvh - 100px)',
          xl: 'calc(100dvh - 100px)',
        }}
        maxW="100vw"
        overflowX="hidden"
      >
        <Flex
          direction="column"
          mx="auto"
          w={{ base: '100%', md: '100%', xl: '100%' }}
          maxHeight={{
            base: 'calc(100dvh - 100px)',
            xl: 'calc(100dvh - 100px)',
          }}
          height={{
            base: 'calc(100dvh - 100px)',
            xl: 'calc(100dvh - 100px)',
          }}
          maxW="100%"
          overflowX="hidden"
        >
          <GptChat />
          <OnboardingHintManager />
        </Flex>
      </Flex>
    </>
  );
}
