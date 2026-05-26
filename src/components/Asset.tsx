import { memo, useEffect, useMemo, useState } from "react";
import type { FeedItem } from "scripts/build-dataset";

type Phase = "skeleton" | "preview" | "full";

const loadedItemIds = new Set<string>();

export default memo(function Asset({
  item,
  displayWidth,
  displayHeight,
  isScrolling,
}: {
  item: FeedItem;
  displayWidth: number;
  displayHeight: number;
  isScrolling: boolean;
}) {
  const alreadyLoaded = loadedItemIds.has(item.id);

  const [phase, setPhase] = useState<Phase>(() => {
    if (alreadyLoaded) return "preview";
    return isScrolling ? "skeleton" : "preview";
  });

  useEffect(() => {
    if (!isScrolling) {
      setPhase((prev) => (prev === "skeleton" ? "preview" : prev));
    }
  }, [isScrolling]);

  const showFull = phase === "full";

  const baseStyles = { width: displayWidth, height: displayHeight };

  const thumbSrc = useMemo(() => {
    if (item.kind === "image" && item.srcTemplate) {
      const w = 40;
      const h = Math.max(1, Math.round((w * item.height) / item.width));
      return item.srcTemplate
        .replace("{w}", String(w))
        .replace("{h}", String(h));
    }
    return item.poster ?? null;
  }, [item]);

  const onLoaded = () => {
    loadedItemIds.add(item.id);
    setPhase("full");
  };

  if (phase === "skeleton") {
    return <div className="animate-pulse bg-muted" style={baseStyles} />;
  }

  return (
    <div className="relative overflow-hidden" style={baseStyles}>
      {!showFull && <div className="absolute inset-0 animate-pulse bg-muted" />}
      {thumbSrc && (
        <img
          src={thumbSrc}
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover blur-xl transition-opacity duration-300 ease-in-out"
          style={{ opacity: showFull ? 0 : 1 }}
        />
      )}
      {item.kind === "image" ? (
        <img
          src={item.src}
          alt=""
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ease-in-out"
          style={{ opacity: showFull ? 1 : 0 }}
          onLoad={onLoaded}
        />
      ) : (
        <video
          src={item.src}
          muted
          loop
          autoPlay
          playsInline
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ease-in-out"
          onLoadedData={onLoaded}
        />
      )}
    </div>
  );
});
