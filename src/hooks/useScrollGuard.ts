import { useRef, type RefObject } from "react";
import type { ScrollObserver } from "@/hooks/useScrollObserver";

type Options = {
  /** Pixels-per-ms above which the observer is paused to skip fly-by fetches. */
  pauseThreshold?: number;
  /** Ms of scroll inactivity before the observer resumes. */
  settleDelay?: number;
};

/**
 * Returns an onScroll handler that pauses the shared IntersectionObserver
 * during fast scrolls (S2). When the user flicks the feed at high velocity,
 * every cell in the 600px IO buffer would otherwise queue a media fetch —
 * serviced FIFO, so cells at the landing position sit behind hundreds of
 * already-passed-by ones. Pausing IO delivery during the flick and replaying
 * only once settled keeps fetches focused on where the user actually stopped.
 */
export function useScrollGuard(
  observerRef: RefObject<ScrollObserver | null>,
  { pauseThreshold = 2, settleDelay = 150 }: Options = {},
) {
  const lastTopRef = useRef(0);
  const lastTimeRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  return function onScroll(scrollTop: number) {
    const now = performance.now();
    const dt = now - lastTimeRef.current;
    const dy = Math.abs(scrollTop - lastTopRef.current);

    if (dt > 0 && dy / dt > pauseThreshold) {
      observerRef.current?.setPaused(true);
    }

    lastTopRef.current = scrollTop;
    lastTimeRef.current = now;

    if (timerRef.current !== null) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      observerRef.current?.setPaused(false);
    }, settleDelay);
  };
}
