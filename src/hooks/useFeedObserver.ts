import { useEffect, useRef, useState } from "react";
import {
  createScrollObserver,
  type ScrollObserver,
} from "@/hooks/useScrollObserver";

/**
 * Creates and manages a single shared ScrollObserver scoped to the scroll
 * container. Returns both a React state value (for passing to cells as props
 * so they re-render once when the observer becomes available) and a stable ref
 * (for imperative access inside event handlers without stale-closure risk).
 */
export function useFeedObserver(containerRef: React.RefObject<HTMLElement | null>) {
  const [observer, setObserver] = useState<ScrollObserver | null>(null);
  const observerRef = useRef<ScrollObserver | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = createScrollObserver(el);
    setObserver(obs);
    observerRef.current = obs;
    return () => {
      obs.disconnect();
      observerRef.current = null;
    };
  }, [containerRef]);

  return { observer, observerRef };
}
