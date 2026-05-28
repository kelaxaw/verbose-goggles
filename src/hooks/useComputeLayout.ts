import { useEffect, useMemo, useState, type RefObject } from "react";
import { packRows } from "@/grid/rowPacker";
import type { FeedItem } from "@/types/feed";

export const useComputeLayout = ({
  data,
  columns,
  gap = 8,
  containerRef,
}: {
  data: FeedItem[];
  columns: number;
  gap: number;
  containerRef: RefObject<HTMLElement | null>;
}) => {
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let frameId: number | null = null;

    const commitWidth = (width: number) => {
      setContainerWidth((prev) => (prev === width ? prev : width));
    };

    commitWidth(el.clientWidth);

    const ro = new ResizeObserver(([entry]) => {
      const width = entry.contentRect.width;
      if (frameId !== null) cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(() => {
        commitWidth(width);
        frameId = null;
      });
    });

    ro.observe(el);
    return () => {
      ro.disconnect();
      if (frameId !== null) cancelAnimationFrame(frameId);
    };
  }, [containerRef]);

  const rows = useMemo(
    () =>
      packRows(data, {
        containerWidth,
        columns,
        gap,
      }),
    [data, columns, gap, containerWidth],
  );

  return { rows, containerWidth };
};
