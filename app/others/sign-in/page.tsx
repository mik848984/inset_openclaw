'use client';

// Chakra imports
import {
  Box,
  Button,
  Divider,
  Flex,
  Icon,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import illustration from '/public/img/auth/auth.png';
import DefaultAuth from '@/components/auth';
import React, { useEffect } from 'react';
import { FcGoogle } from 'react-icons/fc';
import { FaYandex } from 'react-icons/fa';
import { signIn, signOut, useSession } from 'next-auth/react';
import { Scheme, ConfigAuthMode } from '@vkid/sdk';
import { useRouter } from 'next/navigation';
import { useAppSession } from '@/utils/hooks/useAppSession';

function SignUp() {
  const textColor = useColorModeValue('navy.700', 'white');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.200');
  const scheme = useColorModeValue(Scheme.LIGHT, Scheme.DARK);
  const router = useRouter();
  const { isAnonymous } = useAppSession();
  const { status } = useSession();

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
      <Flex
        w="100%"
        maxW="max-content"
        mx={{ base: 'auto', lg: '0px' }}
        me="auto"
        h="100%"
        justifyContent="center"
        mb={{ base: '30px', md: '60px' }}
        px={{ base: '25px', md: '0px' }}
        mt={{ base: '40px', md: '30vh' }}
        flexDirection="column"
      >
        <Box me="auto" mb="30px">
          <Text
            color={textColor}
            fontSize={{ base: '34px', lg: '36px' }}
            mb="10px"
            fontWeight={'700'}
          >
            Вход
          </Text>
        </Box>
        <Flex
          zIndex="2"
          direction="column"
          w={{ base: '85vw', md: '420px' }}
          maxW="100%"
          borderRadius="15px"
          mx={{ base: 'auto', lg: 'unset' }}
          me="auto"
          mb={{ base: '20px', md: 'auto' }}
        >
          <Box minH="135px" id="vk"></Box>
          <Flex>
            <Divider mb="20px" mt="20px" ml="40%" mr="40%" />
          </Flex>
          <Button
            onClick={async () => {
              await signIn('google', { redirectTo: '/chat' });
            }}
            variant="transparent"
            border="1px solid"
            borderColor={borderColor}
            borderRadius="14px"
            ms="auto"
            fontSize="md"
            w={{ base: '100%' }}
            h="54px"
          >
            <Icon as={FcGoogle} w="20px" h="20px" me="10px" />
            Войти через Google
          </Button>
          <Flex>
            <Divider mb="20px" mt="20px" ml="40%" mr="40%" />
          </Flex>
          <Button
            onClick={async () => {
              await signIn('yandex', { redirectTo: '/chat' });
            }}
            variant="transparent"
            border="1px solid"
            borderColor={borderColor}
            borderRadius="14px"
            ms="auto"
            fontSize="md"
            w={{ base: '100%' }}
            h="54px"
          >
            <Icon as={FaYandex} color="red.500" w="20px" h="20px" me="10px" />
            Войти через Яндекс
          </Button>
        </Flex>
      </Flex>
    </DefaultAuth>
  );
}

export default SignUp;
