import { useEffect, RefObject } from 'react';

const useIntersectionObserver = (
  ref: RefObject<Element>,
  callback: IntersectionObserverCallback,
  options?: IntersectionObserverInit,
  isOpen?: boolean
) => {
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const observer = new IntersectionObserver(callback, options);
    if (ref.current) {
      observer.observe(ref.current);
    }
    return () => observer.disconnect();
  }, [callback, isOpen, options, ref]);
};

export default useIntersectionObserver;
