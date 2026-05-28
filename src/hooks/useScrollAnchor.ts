import { useLayoutEffect, useRef, type RefObject } from "react";
import type { Virtualizer } from "@tanstack/react-virtual";
import type { PackedRow as LayoutRow } from "@/grid/rowPacker";

type Args = {
  rows: LayoutRow[];
  rowVirtualizer: Virtualizer<HTMLDivElement, Element>;
  containerRef: RefObject<HTMLDivElement | null>;
  gap: number;
};

/**
 * Keeps the user anchored on the same item across layout changes
 * (column-count slider, viewport resize).
 *
 * One layout effect, keyed on `rows`. A ref holds the previous render's rows;
 * at the top of the effect we read it (old layout) then overwrite it (new
 * layout), so both are in hand at once. scrollTop hasn't been touched by the
 * layout change yet, so it still points into the old layout — exactly the
 * input we need to find which item was at the top.
 *
 * Anchored by item id rather than row index: changing columns reshuffles
 * which items land in which row, so a row index would point at a different
 * item after the change.
 */
export function useScrollAnchor({
  rows,
  rowVirtualizer,
  containerRef,
  gap,
}: Args) {
  const prevRowsRef = useRef<LayoutRow[] | null>(null);

  useLayoutEffect(() => {
    const prevRows = prevRowsRef.current;
    prevRowsRef.current = rows;

    if (!prevRows || prevRows === rows || !containerRef.current) return;

    const scrollTop = containerRef.current.scrollTop;

    // Find first visible item in the OLD layout.
    let acc = 0,
      anchorItemId: string | null = null,
      offset = 0;

    for (const row of prevRows) {
      if (acc + row.height > scrollTop) {
        anchorItemId = row.items[0]?.item.id ?? null;
        offset = scrollTop - acc;
        break;
      }
      acc += row.height + gap;
    }

    if (!anchorItemId) return;

    // Locate that same item in the NEW layout, scroll so it lands at offset.
    let newStart = 0;
    for (const row of rows) {
      if (row.items.some((li) => li.item.id === anchorItemId)) {
        rowVirtualizer.scrollToOffset(newStart + offset, { align: "start" });
        return;
      }
      newStart += row.height + gap;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows]);
}
