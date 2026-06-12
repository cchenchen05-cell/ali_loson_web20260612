"use client";

import * as React from "react";

export function useInfiniteScroll(
  callback: () => void,
  hasMore: boolean,
  loading: boolean
) {
  const observerRef = React.useRef<IntersectionObserver | null>(null);

  const lastElementRef = React.useCallback(
    (node: HTMLElement | null) => {
      if (loading) return;
      if (observerRef.current) observerRef.current.disconnect();
      if (!hasMore || !node) return;

      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore && !loading) {
            callback();
          }
        },
        { threshold: 0.1 }
      );
      observerRef.current.observe(node);
    },
    [callback, hasMore, loading]
  );

  React.useEffect(() => {
    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, []);

  return lastElementRef;
}