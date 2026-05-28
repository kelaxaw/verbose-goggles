import { useEffect, useRef, useState } from "react";
import { AssetBadge } from "@/components/Asset/Badge";
import type { VideoAssetProps } from "@/components/Asset/types";

export function VideoAsset({
  item,
  displayWidth,
  displayHeight,
  observer,
}: VideoAssetProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<HTMLVideoElement>(null);

  const [thumbUrl, setThumbUrl] = useState<string | null>(null);
  const [thumbReady, setThumbReady] = useState(false);
  const [playerVisible, setPlayerVisible] = useState(false);
  const [shouldPlay, setShouldPlay] = useState(false);
  const [playing, setPlaying] = useState(false);

  // Ref so the observer callback (bound once) doesn't re-subscribe on re-renders.
  const thumbUrlRef = useRef<string | null>(null);

  // Intersection → load poster. Video src comes directly from item.src on hover.
  useEffect(() => {
    const el = frameRef.current;
    if (!el || !observer) return;
    return observer.observe(el, (entry) => {
      if (!entry.isIntersecting || thumbUrlRef.current) return;
      const url =
        item.poster ??
        item.posterTemplate
          ?.replace("{w}", "640")
          .replace(
            "{h}",
            String(Math.round((640 * item.height) / item.width)),
          ) ??
        null;
      if (!url) return;
      thumbUrlRef.current = url;
      setThumbUrl(url);
    });
  }, [observer, item.poster, item.posterTemplate, item.width, item.height]);

  // Drive play/pause after commit — playerRef.current exists once playerVisible=true.
  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;
    if (shouldPlay) void player.play().catch(() => {});
    else player.pause();
  }, [shouldPlay, playerVisible]);

  const onEnter = () => {
    if (!playerVisible) setPlayerVisible(true);
    setShouldPlay(true);
  };

  const onLeave = () => {
    setShouldPlay(false);
  };

  return (
    <div
      ref={frameRef}
      onPointerEnter={onEnter}
      onPointerLeave={onLeave}
      className="relative overflow-hidden bg-neutral-800 cursor-pointer"
      style={{ width: displayWidth, height: displayHeight }}
    >
      {thumbUrl && (
        <img
          src={thumbUrl}
          alt={item.alt}
          loading="lazy"
          decoding="async"
          draggable={false}
          onLoad={() => setThumbReady(true)}
          className="absolute inset-0 w-full h-full object-cover block"
          style={{
            opacity: thumbReady ? 1 : 0,
            transition: "opacity 180ms ease-out",
          }}
        />
      )}
      {playerVisible && (
        <video
          ref={playerRef}
          src={item.src}
          muted
          loop
          playsInline
          preload="auto"
          onLoadedData={(e) => {
            (e.currentTarget as HTMLVideoElement).style.opacity = "1";
          }}
          onPlaying={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={() => setPlaying(false)}
          className="absolute inset-0 w-full h-full object-cover block"
          style={{ opacity: 0, transition: "opacity 180ms ease-out" }}
        />
      )}
      {playing && (
        <span className="absolute top-2 left-2 z-10 size-5 animate-pulse rounded-full bg-red-500" />
      )}
      <AssetBadge kind={item.kind} author={item.author} />
    </div>
  );
}
