'use client';

// Chakra imports
import {
  Box,
  Button,
  Flex,
  Heading,
  Icon,
  Link as LinkChakra,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import illustration from '/public/img/auth/auth.png';
import DefaultAuth from '@/components/auth';
import React, { useEffect } from 'react';
import { FcGoogle } from 'react-icons/fc';
import { FaYandex } from 'react-icons/fa';
import { signIn, signOut, useSession } from 'next-auth/react';
import { Scheme } from '@vkid/sdk';
import { useRouter } from 'next/navigation';
import { useAppSession } from '@/utils/hooks/useAppSession';
import { LogoChat } from '@/components/icons/Icons';

// ── Apple typography ──────────────────────────────────────────────
const FONT_APPLE_TEXT = `'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif`;
const FONT_APPLE_DISPLAY = `'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif`;

function SignUp() {
  // ── Auth scheme (preserved exactly) ────────────────────────────
  const scheme = useColorModeValue(Scheme.LIGHT, Scheme.DARK);
  const router = useRouter();
  const { isAnonymous } = useAppSession();
  const { status } = useSession();

  // ── Design tokens — minimal, lean ──────────────────────────────
  const pageBg = useColorModeValue('#f5f5f7', '#070b16');
  const glassSurface = useColorModeValue(
    'rgba(255,255,255,0.68)',
    'rgba(13,18,34,0.58)',
  );
  const glassButtonBg = useColorModeValue(
    'rgba(255,255,255,0.78)',
    'rgba(255,255,255,0.06)',
  );
  const glassButtonHover = useColorModeValue(
    'rgba(255,255,255,0.92)',
    'rgba(255,255,255,0.10)',
  );
  const borderGlass = useColorModeValue(
    'rgba(255,255,255,0.72)',
    'rgba(255,255,255,0.12)',
  );
  const borderSubtle = useColorModeValue(
    'rgba(0,0,0,0.08)',
    'rgba(255,255,255,0.10)',
  );
  const textPrimary = useColorModeValue('#1d1d1f', '#f5f5f7');
  const textSecondary = useColorModeValue(
    '#6e6e73',
    'rgba(245,245,247,0.68)',
  );
  const accentBlue = useColorModeValue('#0066cc', '#2997ff');
  const cardShadow = useColorModeValue(
    'inset 0 1px 0 rgba(255,255,255,0.62), 0 1px 2px rgba(0,0,0,0.03), 0 18px 50px rgba(31,38,70,0.06)',
    'inset 0 1px 0 rgba(255,255,255,0.10), 0 1px 2px rgba(0,0,0,0.16), 0 18px 50px rgba(0,0,0,0.32)',
  );
  const dividerLine = useColorModeValue(
    'rgba(0,0,0,0.08)',
    'rgba(255,255,255,0.10)',
  );

  // ── VK SDK init — preserved exactly (container id="vk") ─────────
  const renderVK = async () => {
    let interval: any = null;
    const VKID: any = await new Promise((resolve) => {
      const VKID = (window as any).VKIDSDK;
      if (VKID) resolve(VKID);

      interval = setInterval(() => {
        const VKID = (window as any).VKIDSDK;
        if (VKID) resolve(VKID);
      }, 50);
      console.log({ interval });
    });

    clearInterval(interval);

    console.log({ VKID });
    if (!VKID) return;

    const container = document.querySelector('#vk')! as any;

    container.innerHTML = '';

    VKID.Config.init({
      app: 53265645,
      redirectUrl: `https://iiset.io/others/sign-in`,
      responseMode: VKID.ConfigResponseMode.Callback,
      source: VKID.ConfigSource.LOWCODE,
      scope: 'email',
    });

    const oneTap = new VKID.OneTap();

    oneTap
      .render({
        container,
        showAlternativeLogin: true,
        oauthList: [VKID.OAuthName.OK, VKID.OAuthName.MAIL, VKID.OAuthName.VK],
        scheme,
      })
      .on(VKID.WidgetEvents.ERROR, vkidOnError)
      .on(VKID.OneTapInternalEvents.LOGIN_SUCCESS, function (payload: any) {
        console.log(payload);
        const code = payload.code;
        const deviceId = payload.device_id;

        VKID.Auth.exchangeCode(code, deviceId)
          .then(vkidOnSuccess)
          .catch(vkidOnError);
      });

    async function vkidOnSuccess(data: any) {
      console.log({ data });
      await signOut({ redirect: false });
      await signOut({ redirect: false });
      await signOut({ redirect: false });

      await signIn('credentials', {
        access_token: data.access_token,
        redirect: false,
      });

      await signIn('credentials', {
        access_token: data.access_token,
        redirect: false,
      });

      await signIn('credentials', {
        access_token: data.access_token,
        redirect: false,
      });

      router.push('/chat');
    }

    function vkidOnError(error: any) {
      console.log({ error });
    }
  };

  useEffect(() => {
    renderVK();
  }, [scheme]);

  return (
    <DefaultAuth illustrationBackground={illustration?.src}>
      {/* ── Single centered column ─────────────────────────────── */}
      <Flex
        direction="column"
        align="center"
        justify="center"
        width="100%"
        maxWidth={{ base: '100%', md: '440px' }}
        minWidth={0}
        gap={{ base: '14px', md: '18px' }}
        textAlign="center"
      >
        {/* ── Big brand LogoChat (как на /chat) ────────────────── */}
        <Icon
          as={LogoChat}
          width={{ base: '160px', sm: '190px', md: '260px' }}
          height={{ base: '160px', sm: '190px', md: '260px' }}
          color={pageBg}
          flexShrink={0}
          maxWidth="100%"
          mt={{ base: '-12px', md: '-24px' }}
          mb={{ base: '-4px', md: '-8px' }}
        />

        {/* ── Heading ─────────────────────────────────────────── */}
        <Heading
          as="h1"
          fontFamily={FONT_APPLE_DISPLAY}
          fontSize={{ base: '28px', sm: '32px', md: '38px' }}
          fontWeight="600"
          lineHeight="1.1"
          letterSpacing="-0.5px"
          color={textPrimary}
          maxWidth="100%"
          wordBreak="break-word"
        >
          Войдите в ИИСеть
        </Heading>

        {/* ── Subtitle ────────────────────────────────────────── */}
        <Text
          fontSize={{ base: '15px', md: '16px' }}
          lineHeight="1.55"
          fontWeight="400"
          letterSpacing="-0.1px"
          color={textSecondary}
          maxWidth="420px"
          mb={{ base: '4px', md: '6px' }}
        >
          Сохраняйте историю чатов, используйте веб-поиск, модели и
          генерацию изображений в одном пространстве.
        </Text>

        {/* ── Auth card ────────────────────────────────────────── */}
        <Box
          width="100%"
          maxWidth="440px"
          minWidth={0}
          bg={glassSurface}
          backdropFilter="blur(20px) saturate(170%)"
          border="1px solid"
          borderColor={borderGlass}
          borderRadius={{ base: '24px', md: '28px' }}
          boxShadow={cardShadow}
          px={{ base: '20px', md: '28px' }}
          py={{ base: '22px', md: '28px' }}
          textAlign="left"
          sx={{
            WebkitBackdropFilter: 'blur(20px) saturate(170%)',
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              inset: '0',
              borderRadius: 'inherit',
              pointerEvents: 'none',
              background:
                'linear-gradient(180deg, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0) 55%)',
              opacity: 0.85,
              zIndex: 0,
            },
            '& > *': { position: 'relative', zIndex: 1 },
          }}
        >
          {/* Card heading */}
          <Heading
            fontFamily={FONT_APPLE_DISPLAY}
            fontSize={{ base: '20px', md: '22px' }}
            fontWeight="600"
            lineHeight="1.2"
            letterSpacing="-0.3px"
            color={textPrimary}
            mb="4px"
          >
            Продолжить
          </Heading>
          <Text
            fontSize={{ base: '13px', md: '14px' }}
            lineHeight="1.45"
            letterSpacing="-0.1px"
            color={textSecondary}
            mb={{ base: '16px', md: '18px' }}
          >
            Выберите удобный способ входа.
          </Text>

          {/* VK block — preserved id="vk" */}
          <Box
            id="vk"
            width="100%"
            maxWidth="100%"
            minWidth={0}
            sx={{
              // Keep VK widget contents within the card
              '& *': { maxWidth: '100% !important' },
            }}
          />

          {/* «или» divider */}
          <Flex align="center" gap="10px" my={{ base: '14px', md: '16px' }}>
            <Box flex="1" h="1px" bg={dividerLine} />
            <Text
              fontSize="11px"
              fontWeight="500"
              letterSpacing="0.4px"
              textTransform="uppercase"
              color={textSecondary}
            >
              или
            </Text>
            <Box flex="1" h="1px" bg={dividerLine} />
          </Flex>

          {/* Google */}
          <Button
            onClick={async () => {
              await signIn('google', { redirectTo: '/chat' });
            }}
            variant="ghost"
            bg={glassButtonBg}
            border="1px solid"
            borderColor={borderSubtle}
            borderRadius="9999px"
            w="100%"
            h="48px"
            fontFamily={FONT_APPLE_TEXT}
            fontSize="15px"
            fontWeight="500"
            letterSpacing="-0.2px"
            color={textPrimary}
            mb="8px"
            transition="background 0.16s ease, border-color 0.16s ease, transform 0.12s ease"
            _hover={{
              bg: glassButtonHover,
              borderColor: 'rgba(0,102,204,0.28)',
            }}
            _active={{ transform: 'scale(0.98)' }}
            leftIcon={<Icon as={FcGoogle} w="18px" h="18px" />}
          >
            Войти через Google
          </Button>

          {/* Yandex */}
          <Button
            onClick={async () => {
              await signIn('yandex', { redirectTo: '/chat' });
            }}
            variant="ghost"
            bg={glassButtonBg}
            border="1px solid"
            borderColor={borderSubtle}
            borderRadius="9999px"
            w="100%"
            h="48px"
            fontFamily={FONT_APPLE_TEXT}
            fontSize="15px"
            fontWeight="500"
            letterSpacing="-0.2px"
            color={textPrimary}
            transition="background 0.16s ease, border-color 0.16s ease, transform 0.12s ease"
            _hover={{
              bg: glassButtonHover,
              borderColor: 'rgba(0,102,204,0.28)',
            }}
            _active={{ transform: 'scale(0.98)' }}
            leftIcon={<Icon as={FaYandex} color="red.500" w="16px" h="16px" />}
          >
            Войти через Яндекс
          </Button>

          {/* Legal text inside the card */}
          <Text
            fontSize="12px"
            lineHeight="1.5"
            letterSpacing="-0.05px"
            color={textSecondary}
            mt={{ base: '16px', md: '18px' }}
          >
            Продолжая, вы соглашаетесь с{' '}
            <LinkChakra
              href="https://telegra.ph/Polzovatelskoe-soglashenie-03-05-7"
              target="_blank"
              rel="noopener noreferrer"
              color={accentBlue}
              textDecoration="none"
              borderBottom="1px solid currentColor"
              paddingBottom="1px"
              _hover={{ opacity: 0.75 }}
              transition="opacity 0.15s ease"
            >
              пользовательским соглашением
            </LinkChakra>{' '}
            и{' '}
            <LinkChakra
              href="https://telegra.ph/Politika-konfidencialnosti-03-05-7"
              target="_blank"
              rel="noopener noreferrer"
              color={accentBlue}
              textDecoration="none"
              borderBottom="1px solid currentColor"
              paddingBottom="1px"
              _hover={{ opacity: 0.75 }}
              transition="opacity 0.15s ease"
            >
              политикой конфиденциальности
            </LinkChakra>
            .
          </Text>
        </Box>
      </Flex>
    </DefaultAuth>
  );
}

export default SignUp;
