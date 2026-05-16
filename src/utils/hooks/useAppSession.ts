import { useSession } from 'next-auth/react';

export function useAppSession() {
  const { data: session } = useSession();

  return {
    session,
    isAnonymous: (session as any)?.token_provider === 'anonymous',
  };
}
