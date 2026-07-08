'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

export default function ScrollReset() {
  const pathname = usePathname();
  const previousPathnameRef = useRef(pathname);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const previousPathname = previousPathnameRef.current;
    previousPathnameRef.current = pathname;

    if (pathname === '/' && previousPathname !== '/') {
      const resetScroll = () => {
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
        window.requestAnimationFrame(() => {
          window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
        });
      };

      resetScroll();
      const timeoutId = window.setTimeout(resetScroll, 60);
      return () => window.clearTimeout(timeoutId);
    }

    if (pathname !== '/') {
      return undefined;
    }

    const resetScroll = () => {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      window.requestAnimationFrame(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      });
    };

    resetScroll();
    const timeoutId = window.setTimeout(resetScroll, 60);
    return () => window.clearTimeout(timeoutId);
  }, [pathname]);

  return null;
}
