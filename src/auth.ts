import NextAuth, { NextAuthConfig } from 'next-auth';
import User from '@/models/user';
import Google from 'next-auth/providers/google';
import Yandex from 'next-auth/providers/yandex';
import CredentialsProvider from 'next-auth/providers/credentials';
import './lib/db';
import VK from '@auth/core/providers/vk';

const createAnonymousUser = (id: string, csrfToken: string): any => {
  return {
    id: 'anonymous',
    email: `${id}|${csrfToken}@example.com`,
    name: 'anonymous',
    image: '',
    provider: 'anonymous',
  };
};

export const authConfig: NextAuthConfig = {
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || (process.env.NODE_ENV === 'production' ? undefined : 'dev-secret-please-override'),
  trustHost: true,
  providers: [
    Google,
    Yandex,
    CredentialsProvider({
      name: 'credentials',
      async authorize(credentials: any, req: any) {
        console.log({ credentials });
        if (credentials.access_token) {
          const url = 'https://id.vk.com/oauth2/user_info';
          const headers = {
            'Content-Type': 'application/x-www-form-urlencoded',
          };
          const body = {
            client_id: process.env.VK_CLIENT_ID,
            access_token: credentials.access_token,
          } as any;

          const response: any = await fetch(url, {
            method: 'POST',
            headers,
            body: new URLSearchParams(body),
          }).then((res) => res.json());

          console.log({ response });
          return {
            id: response.user.user_id,
            email: `${response.user.user_id}@vkmail.com`,
            name: response.user.first_name,
            image: response.user.avatar,
            provider: 'vkid',
          };
        }

        console.log({ credentials });
        const forwarded = req.headers.get('x-forwarded-for');
        const ip = forwarded
          ? forwarded.split(/, /)[0]
          : req.connection.remoteAddress;

        return createAnonymousUser(ip, (credentials as any).visitorId);
      },
    }),
  ],
  callbacks: {
    async signIn({ user }: any) {
      const { name, email, image } = user;

      try {
        const userExists = await User.findOne({ email });

        if (!userExists) {
          await User.create({
            email,
            name,
            image,
            modelsBalance: email.endsWith('@example.com') ? 20_000 : 100_000,
            imageGenerationBalance: email.endsWith('@example.com') ? 5 : 12,
          });
        }
      } catch (error) {
        console.log(error);
        return false;
      }

      return true;
    },
    async session({ session, token, user, ...params }: any) {
      if (session.user.email.endsWith('@example.com')) {
        (session as any).token_provider = 'anonymous';
      }

      return session;
    },
  },
};

export const { handlers, signIn, signOut, auth } = NextAuth(authConfig);