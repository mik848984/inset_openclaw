import type { Metadata } from 'next';
import { Flex } from '@chakra-ui/react';
import '@/components/chat/components/oneLight.css';
import '@/components/chat/components/oneDark.css';
import GptChat from '@/components/chat/components/GptChat';
import ChatPageTracker from '@/components/chat/ChatPageTracker';
import OnboardingHintManager from '@/components/onboarding/OnboardingHintManager';

import { Viewport } from 'next';

export const metadata: Metadata = {
  title: 'Чат ИИСеть — ИИ-помощник для работы, учёбы и творчества',
  description:
    'Чат ИИСеть — GPT-4o, Claude и Gemini на русском с веб-поиском и генерацией изображений. Без VPN, без иностранных карт.',
};

export function generateViewport(): Viewport {
  return {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
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
