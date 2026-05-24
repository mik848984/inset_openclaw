'use client';
import React, { ReactNode, useEffect } from 'react';
import { Box, Flex, Portal, useColorModeValue } from '@chakra-ui/react';
import routes from '@/routes';
import Sidebar from '@/components/sidebar/Sidebar';
import NavbarLinksAdmin from '@/components/navbar/NavbarLinksAdmin';

import { getActiveNavbar } from '@/utils/navigation';
import { usePathname } from 'next/navigation';
import '@/styles/App.css';
import '@/styles/Contact.css';
import '@/styles/Plugins.css';
import '@/styles/MiniCalendar.css';
import AppWrappers from './AppWrappers';
import { signIn, useSession } from 'next-auth/react';
import FingerprintJS from '@fingerprintjs/fingerprintjs';
import Script from 'next/script';
import { createGlobalStyle } from 'styled-components';
import { useUser } from '@/utils/hooks/useUser';
import { setYmUser } from '@/utils/metrics';

function App({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  const { user } = useUser(false);

  useEffect(() => {
    if (user) {
      setYmUser({
        _id: (user as any)._id,
        email: (user as any).email,
        modelsBalance: (user as any).modelsBalance,
        simpleModelsBalance: (user as any).simpleModelsBalance,
        premiumModelsBalance: (user as any).premiumModelsBalance,
        imageGenerationBalance: (user as any).imageGenerationBalance,
        webSearchBalance: (user as any).webSearchBalance,
      });
    }
  }, [user]);

  const { data: session, status } = useSession();
  const brandColor = useColorModeValue('white', '#111c44');
  const textColor = useColorModeValue('#080808F5', 'white');
  const inverseTextColor = useColorModeValue('white', '#080808F5');
  const textSecondary = useColorModeValue('#0808088F', '#adadad');
  const surfaceTransparent = useColorModeValue(
    '#E2E8F0',
    'rgba(255, 255, 255, 0.08)',
  );

  const theme = [
    `:root {
      --surface-solid-card: ${brandColor};
      --shadow-down-soft-s: 0px 4px 14px -4px #08080814, 0px 1px 4px -1px #0000000A;
      --surface-transparent-secondary: #FFFFFF38;
      --surface-solid-default: ${textColor};
      --inverse-text-primary: ${inverseTextColor};
      --text-secondary: ${textSecondary};
      --surface-transparent-tertiary: ${surfaceTransparent};
      --plasma-date-picker-calendar-margin-top: 8px; 
      --plasma-textfield-border-width: 0.0625rem;
      --plasma_private-textfield-border-color: #422AFB;
      --plasma-calendar-disabled-opacity: 0.6; 
      --overlay-blur: #98989847;
      --chakra-radii-md: 0.875rem;
      --alert-fg: ${inverseTextColor};
    }`,
  ] as any;

  const Theme = createGlobalStyle(theme);
  // --surface-solid-card: #FFFFFFFF;

  console.log({ status, session });

  useEffect(() => {
    const params = Object.fromEntries([
      ...new URLSearchParams(location.search),
    ]);

    console.log(params);

    console.log({ pathname });
    if (pathname?.includes('register') || pathname?.includes('sign-in')) {
      return;
    }

    if (status === 'loading') return;

    if (status === 'unauthenticated') {
      FingerprintJS.load()
        .then((fp) => fp.get())
        .then((result) => {
          signIn('credentials', {
            visitorId: result.visitorId,
            redirect: false,
          });
        });
    }
  }, [status]);

  const filteredRoutes = routes.filter((route) => {
    if (route.admin) {
      return user?.isAdmin;
    }

    return true;
  });

  return (
    <>
      {pathname === '/' || pathname?.includes('register') || pathname?.includes('sign-in') ? (
        children
      ) : (
        <Box id="page">
          <Theme />
          <Sidebar routes={filteredRoutes} />

          <Box
            className="scroll-container"
            pt="20px"
            float="right"
            minHeight="100dvh"
            height="100%"
            overflow="auto"
            position="relative"
            maxHeight="100%"
            scrollBehavior="smooth"
            w={{ base: '100%', xl: 'calc( 100% - 290px )' }}
            maxWidth={{ base: '100%', xl: 'calc( 100% - 290px )' }}
            transition="all 0.33s cubic-bezier(0.685, 0.0473, 0.346, 1)"
            transitionDuration=".2s, .2s, .35s"
            transitionProperty="top, bottom, width"
            transitionTimingFunction="linear, linear, ease"
          >
            <Portal>
              <Box
                margin="0 auto"
                paddingRight={{ base: '20px', md: '45px' }}
                paddingTop="30px"
                position="fixed"
                top={{ base: "8px", md: "16px" }}
                right={{ base: "8px", md: "16px" }}
                zIndex="1000"
              >
                <Flex
                  w="100%"
                  alignItems="center"
                  mb="10px"
                  bg="rgba(15, 15, 35, 0.72)"
                  backdropFilter="blur(10px)"
                  borderRadius="9999px"
                  px={{ base: '10px', md: '16px' }}
                  py={{ base: '6px', md: '8px' }}
                >
                  <NavbarLinksAdmin
                    secondary={getActiveNavbar(filteredRoutes, pathname)}
                  />
                </Flex>
              </Box>
            </Portal>
            <Box
              mx="auto"
              pb="20px"
              p={{ base: '20px', md: '30px' }}
              pr={{ base: '20px', md: '45px' }}
              pe="20px"
              pt="50px"
            >
              {children}
            </Box>
          </Box>
        </Box>
      )}
    </>
  );
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru" className="html">
      <head>
        <title>ИИСеть</title>
        <meta
          name="description"
          content="ИИСеть – инновационная платформа генерации ИИ-контента. Создавайте уникальные тексты и изображения быстро и удобно. Бесплатный тестовый период!"
        />
        <meta
          name="keywords"
          content="ИИСеть, Нейросети, GPT, DeepSeek, Chat GPT, Чат ГПТ, AI, Миджорни, генерация картинок, flux, stable diffusion"
        />

        {/* Robots */}
        <meta name="robots" content="index, follow" />
        <meta
          name="googlebot"
          content="index, follow, max-image-preview:large, max-snippet:-1"
        />
        <meta name="yandex" content="index, follow" />

        {/* Canonical */}
        <link rel="canonical" href="https://iiset.io/" />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="ИИСеть" />
        <meta property="og:locale" content="ru_RU" />
        <meta property="og:url" content="https://iiset.io/" />
        <meta property="og:title" content="ИИСеть" />
        <meta
          property="og:description"
          content="ИИСеть – инновационная платформа генерации ИИ-контента. Создавайте уникальные тексты и изображения быстро и удобно. Бесплатный тестовый период!"
        />
        <meta property="og:image" content="https://iiset.io/brand.png" />
        <meta property="og:image:alt" content="ИИСеть" />

        {/* Twitter / X */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="ИИСеть" />
        <meta
          name="twitter:description"
          content="ИИСеть – инновационная платформа генерации ИИ-контента. Создавайте уникальные тексты и изображения быстро и удобно. Бесплатный тестовый период!"
        />
        <meta name="twitter:image" content="https://iiset.io/brand.png" />

        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="https://iiset.io/favicon.ico"
        />
      </head>
      <body id={'root'}>
        <Script src="https://yookassa.ru/checkout-widget/v1/checkout-widget.js" />
        <Script src="https://unpkg.com/@vkid/sdk@<3.0.0/dist-sdk/umd/index.js" />
        <Script id="yandex-metrika">
          {`
         (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
         m[i].l=1*new Date();
         for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
         k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
         (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");
      
         ym(100585692, "init", {
              clickmap:true,
              trackLinks:true,
              accurateTrackBounce:true,
              webvisor:true,
              trackHash:true
         }); 
      `}
        </Script>
        <AppWrappers>
          <App>{children}</App>
        </AppWrappers>
      </body>
    </html>
  );
}
