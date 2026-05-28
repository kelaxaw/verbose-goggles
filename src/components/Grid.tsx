import type { FeedItem } from "@/types/feed";
import { useColumns } from "@/hooks/useColumns";
import { useComputeLayout } from "@/hooks/useComputeLayout";
import { useFeedObserver } from "@/hooks/useFeedObserver";
import { useScrollGuard } from "@/hooks/useScrollGuard";
import { useScrollAnchor } from "@/hooks/useScrollAnchor";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useEffect, useRef, type UIEvent } from "react";
import Asset from "./Asset";

const GAP = 8;

export default function Grid({ data }: { data: FeedItem[] }) {
  const { columns } = useColumns();
  const containerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  const { rows, containerWidth } = useComputeLayout({
    data,
    columns: columns.value,
    gap: GAP,
    containerRef,
  });

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => containerRef.current,
    estimateSize: (i) => (rows[i]?.height ?? 200) + GAP,
    overscan: 3,
  });

  useEffect(() => {
    rowVirtualizer.measure();
  }, [containerWidth, columns.value, rowVirtualizer]);

  const { observer, observerRef } = useFeedObserver(containerRef);
  const fireScrollGuard = useScrollGuard(observerRef);

  const onScroll = (e: UIEvent<HTMLDivElement>) => {
    fireScrollGuard(e.currentTarget.scrollTop);
  };

  useScrollAnchor({ rows, rowVirtualizer, containerRef, gap: GAP });

  return (
    <div
      ref={containerRef}
      onScroll={onScroll}
      className="overflow-auto h-screen flex-1 min-h-0 p-2"
    >
      <div
        ref={innerRef}
        className="w-full relative"
        style={{ height: `${rowVirtualizer.getTotalSize()}px` }}
      >
        {rowVirtualizer.getVirtualItems().map((vRow) => {
          const row = rows[vRow.index];
          return (
            <figure
              key={vRow.key}
              className="absolute top-0 left-0 w-full flex"
              style={{
                gap: GAP,
                height: `${row.height}px`,
                transform: `translateY(${vRow.start}px)`,
              }}
            >
              {row.items.map((cell) => (
                <Asset
                  key={cell.item.id}
                  item={cell.item}
                  displayWidth={cell.width}
                  displayHeight={row.height}
                  observer={observer}
                />
              ))}
            </figure>
          );
        })}
      </div>
    </div>
  );
}
