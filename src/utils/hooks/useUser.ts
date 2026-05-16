import { useEffect, useLayoutEffect, useState } from 'react';
import { IUserUI, userService } from '@/services/ui/UserService';
import { useAppSession } from '@/utils/hooks/useAppSession';
import useForceUpdate from '@/utils/hooks/useForceUpdate';

const listeners = new Set<() => void>([]);

const runListeners = () => {
  console.log([listeners]);
  listeners.forEach((listener) => {
    console.log('update');
    listener();
  });
};

let globalUser: IUserUI | null = null;

export function useUser(runOnMount: boolean = true) {
  const update = useForceUpdate();

  const { session, isAnonymous } = useAppSession();
  const [loading, setLoading] = useState(false);

  const getUser = async () => {
    setLoading(true);
    await userService
      .getUser()
      .then((user) => (globalUser = user))
      .finally(() => {
        setLoading(false);

        console.log(listeners);
        runListeners();
      });
  };

  useLayoutEffect(() => {
    if (runOnMount) getUser();

    listeners.add(update);

    return () => {
      listeners.delete(update);
    };
  }, []);

  return {
    loading,
    user: globalUser,
    session,
    isAnonymous,
    refreshUser: getUser,
  };
}
