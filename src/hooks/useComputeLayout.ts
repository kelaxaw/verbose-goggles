import { useEffect, useMemo, useState, type RefObject } from "react";
import type { FeedItem } from "scripts/build-dataset";

type LayoutItem = {
  item: FeedItem;
  width: number;
};

type LayoutRow = {
  height: number;
  items: LayoutItem[];
};

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

    let timer: ReturnType<typeof setTimeout> | null = null;

    const ro = new ResizeObserver(([entry]) => {
      const width = entry.contentRect.width;
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => setContainerWidth(width), 150);
    });

    ro.observe(el);
    return () => {
      ro.disconnect();
      if (timer) clearTimeout(timer);
    };
  }, []);

  const rows = useMemo(() => {
    if (!containerWidth) return [];

    const rows: LayoutRow[] = [];

    for (let start = 0; start < data.length; start += columns) {
      const currentRow = data.slice(start, start + columns);
      const sumAR = currentRow.reduce(
        (acc, item) => acc + item.width / item.height,
        0,
      );
      const rowHeight =
        (containerWidth - gap * (currentRow.length - 1)) / sumAR;

      rows.push({
        height: rowHeight,
        items: currentRow.map((item) => ({
          item,
          width: rowHeight * (item.width / item.height),
        })),
      });
    }

    return rows;
  }, [data, columns, gap, containerWidth]);

  return { rows, containerWidth };
};
