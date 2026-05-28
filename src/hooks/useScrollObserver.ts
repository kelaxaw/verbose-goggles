export type ObserverCallback = (entry: IntersectionObserverEntry) => void;

export type ScrollObserver = {
  observe: (el: Element, cb: ObserverCallback) => () => void;
  disconnect: () => void;
  setPaused: (paused: boolean) => void;
};

export function createScrollObserver(
  root: Element,
  rootMargin = "600px 0px",
): ScrollObserver {
  const callbacks = new Map<Element, ObserverCallback>();
  const intersecting = new Map<Element, IntersectionObserverEntry>();
  let paused = false;

  // Parse vertical margin for the synchronous pre-check below.
  const marginPx = parseInt(rootMargin) || 0;

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) intersecting.set(entry.target, entry);
        else intersecting.delete(entry.target);

        if (paused) continue;
        callbacks.get(entry.target)?.(entry);
      }
    },
    { root, rootMargin, threshold: [0, 0.5] },
  );

  return {
    observe(el, cb) {
      callbacks.set(el, cb);
      io.observe(el);

      // IO delivers the initial intersection record asynchronously (next
      // frame), which leaves a one-frame skeleton gap for newly-mounted rows.
      // Synchronously check if the element is already inside the detection
      // zone and fire immediately — ImageAsset's `if (prev) return prev`
      // guard makes a subsequent IO fire harmless.
      if (!paused) {
        const rootRect = root.getBoundingClientRect();
        const elRect = el.getBoundingClientRect();
        if (
          elRect.width > 0 &&
          elRect.bottom > rootRect.top - marginPx &&
          elRect.top < rootRect.bottom + marginPx
        ) {
          cb({ isIntersecting: true, target: el } as IntersectionObserverEntry);
        }
      }

      return () => {
        io.unobserve(el);
        callbacks.delete(el);
        intersecting.delete(el);
      };
    },
    disconnect() {
      io.disconnect();
      callbacks.clear();
      intersecting.clear();
    },
    setPaused(next) {
      const wasPaused = paused;
      paused = next;
      if (wasPaused && !next) {
        // Replay every element IO currently considers intersecting (within the
        // rootMargin band). Do NOT re-filter by a narrower viewport check and
        // do NOT delete entries here: IO is edge-triggered, so a cell already
        // inside the detection zone won't fire again as it scrolls into view —
        // dropping it now means its callback never runs (permanent skeleton).
        // Callbacks are idempotent (`if (prev) return prev`), so replaying the
        // full band is safe.
        for (const [el, entry] of [...intersecting]) {
          callbacks.get(el)?.(entry);
        }
      }
    },
  };
}
