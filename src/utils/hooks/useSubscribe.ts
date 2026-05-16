import useForceUpdate from '@/utils/hooks/useForceUpdate';
import { useEffect } from 'react';

export function useSubscribe(listeners: Set<any>) {
  const update = useForceUpdate();

  useEffect(() => {
    listeners.add(update);

    return () => {
      listeners.delete(update);
    };
  }, []);
}
