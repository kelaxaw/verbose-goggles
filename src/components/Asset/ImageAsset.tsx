import { useCallback, useEffect, useRef, useState } from "react";
import { AssetBadge } from "@/components/Asset/Badge";
import { ThumbOverlay } from "@/components/Asset/ThumbOverlay";
import type { ImageAssetProps } from "@/components/Asset/types";

const MAX_IMAGE_MEMORY_SIZE = 1_000;

// Snap display width up to a step + fold in DPR (capped at 2). A handful of
// distinct widths cover the viewport range, so reflows on column change reuse
// HTTP cache hits instead of requesting a fresh URL per pixel difference.
const WIDTH_STEP = 64;
const MAX_DPR = 2;
const MIN_WIDTH = 96;

function resolveSizedSrc(
  template: string,
  displayWidth: number,
  aspectRatio: number,
): string {
  const dpr = Math.min(MAX_DPR, window.devicePixelRatio || 1);
  const w = Math.max(
    MIN_WIDTH,
    Math.ceil((displayWidth * dpr) / WIDTH_STEP) * WIDTH_STEP,
  );
  const h = Math.max(1, Math.round(w / aspectRatio));
  return template.replace("{w}", String(w)).replace("{h}", String(h));
}

// Store only metadata
const imageMemoryCache = new Map<
  string,
  { fullLoaded: boolean; bestSrc: string }
>();

export function ImageAsset({
  item,
  displayWidth,
  displayHeight,
  observer,
}: ImageAssetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cached = imageMemoryCache.get(item.id) ?? null;

  const [src, setSrc] = useState<string | null>(cached?.bestSrc ?? null);
  const [loaded, setLoaded] = useState(cached?.fullLoaded ?? false);

  const thumbSrc = item.srcTemplate
    ? item.srcTemplate
        .replace("{w}", "40")
        .replace(
          "{h}",
          String(Math.max(1, Math.round((40 * item.height) / item.width))),
        )
    : item.src;

  useEffect(() => {
    const el = containerRef.current;
    if (!observer) {
      setSrc(item.src);
      return;
    }
    if (!el) return;
    return observer.observe(el, (entry) => {
      if (!entry.isIntersecting) return;
      setSrc((prev) => {
        if (prev) return prev;
        const resolved = item.srcTemplate
          ? resolveSizedSrc(
              item.srcTemplate,
              displayWidth,
              item.width / item.height,
            )
          : item.src;
        // Write bestSrc immediately so remount before onLoad doesn't re-request.
        imageMemoryCache.set(item.id, {
          fullLoaded: false,
          bestSrc: resolved,
        });
        return resolved;
      });
    });
  }, [
    item.id,
    item.src,
    item.srcTemplate,
    observer,
    displayWidth,
    displayHeight,
  ]);

  const onImageLoad = useCallback(() => {
    if (imageMemoryCache.size > MAX_IMAGE_MEMORY_SIZE) {
      const firstItem = imageMemoryCache.keys().next().value;
      if (firstItem) imageMemoryCache.delete(firstItem);
    }

    imageMemoryCache.set(item.id, { fullLoaded: true, bestSrc: src! });
    setLoaded(true);
  }, [item.id, src]);

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden bg-neutral-800"
      style={{ width: displayWidth, height: displayHeight }}
    >
      {src && <ThumbOverlay src={thumbSrc} hidden={loaded} />}
      {src && (
        <img
          src={src}
          decoding={loaded ? "sync" : "async"}
          alt={item.alt}
          className="absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ease-in-out"
          style={{ opacity: loaded ? 1 : 0 }}
          onLoad={onImageLoad}
        />
      )}
      <AssetBadge kind={item.kind} author={item.author} />
    </div>
  );
}
