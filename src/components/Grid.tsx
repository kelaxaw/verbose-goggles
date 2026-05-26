import type { FeedItem } from "scripts/build-dataset";
import { useColumns } from "@/contexts/columns.context";
import { useComputeLayout } from "@/hooks/useComputeLayout";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useEffect, useRef } from "react";
import Asset from "./Asset";

const GAP = 8;

export default function Grid({ data }: { data: FeedItem[] }) {
  const { columns } = useColumns();

  const containerRef = useRef<HTMLDivElement>(null);

  const { rows, containerWidth } = useComputeLayout({
    data,
    columns: columns.value,
    gap: GAP,
    containerRef,
  });

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => containerRef.current,
    estimateSize: (idx) => (rows[idx]?.height ?? 200) + GAP,
    overscan: 5,
  });

  useEffect(() => {
    rowVirtualizer.measure();
  }, [containerWidth, columns.value, rowVirtualizer]);

  const isScrolling = rowVirtualizer.isScrolling;

  return (
    <div
      ref={containerRef}
      className="overflow-auto h-screen flex-1 min-h-0 p-2"
    >
      <div
        className="w-full relative"
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualItem) => {
          const row = rows[virtualItem.index];
          return (
            <figure
              key={virtualItem.key}
              className="absolute top-0 left-0 w-full flex"
              style={{
                gap: GAP,
                height: `${row.height}px`,
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              {row.items.map((asset) => {
                const item = asset.item;

                return (
                  <Asset
                    key={item.id}
                    item={asset.item}
                    displayWidth={asset.width}
                    displayHeight={row.height}
                    isScrolling={isScrolling}
                  />
                );
              })}
            </figure>
          );
        })}
      </div>
    </div>
  );
}
