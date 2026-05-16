import { useState, useEffect, useRef, useCallback } from 'react';

const useInfinityScroll = (
  callback: () => Promise<void>,
  options = {},
): any => {
  const [isLoading, setIsLoading] = useState(false);
  const observerTarget = useRef(null);

  const mergedOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1,
    ...options,
  };

  const loadMore = useCallback(async () => {
    console.log('hello');
    if (isLoading) return;

    setIsLoading(true);
    try {
      await callback();
    } catch (error) {
      console.error('Ошибка при загрузке данных:', error);
    } finally {
      setIsLoading(false);
    }
  }, [callback, isLoading]);

  useEffect(() => {
    const target = observerTarget.current;

    console.log({ target });
    if (!target) return;

    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0];
      console.log(entry.isIntersecting);
      if (entry.isIntersecting) {
        loadMore();
      }
    }, mergedOptions);

    console.log('HELLLLLO!!');
    console.log({ target });
    observer.observe(target);

    return () => {
      if (target) {
        observer.unobserve(target);
      }
      observer.disconnect();
    };
  }, [observerTarget.current, mergedOptions, loadMore]);

  return { observerTarget, isLoading };
};

export default useInfinityScroll;
