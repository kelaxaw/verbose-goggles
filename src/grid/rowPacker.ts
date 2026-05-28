import type { FeedItem } from "@/types/feed";

export type PackedItem = {
  item: FeedItem;
  width: number;
};

export type PackedRow = {
  height: number;
  items: PackedItem[];
};

export type PackOptions = {
  containerWidth: number;
  columns: number;
  gap: number;
};

/**
 * Packs feed items into justified rows with visually consistent heights.
 *
 * The `columns` value maps to a target row height — roughly how tall a row
 * of that many square items would be. The packer then finds row boundaries
 * that keep actual heights close to that target, even with mixed portrait and
 * landscape aspect ratios.
 *
 * Implementation uses aspect-ratio prefix sums for O(1) height queries and
 * binary search per row boundary, making the total pass O(n log k) where k
 * is the average items per row.
 */
export function packRows(
  data: readonly FeedItem[],
  { containerWidth, columns, gap }: PackOptions,
): PackedRow[] {
  if (!containerWidth || columns <= 0 || data.length === 0) return [];

  const targetHeight = (containerWidth - gap * (columns - 1)) / columns;

  const prefixAr = new Float64Array(data.length + 1);
  for (let i = 0; i < data.length; i++) {
    prefixAr[i + 1] = prefixAr[i] + data[i].width / data[i].height;
  }

  const naturalHeight = (start: number, count: number): number => {
    const sumAr = prefixAr[start + count] - prefixAr[start];
    return (containerWidth - gap * (count - 1)) / sumAr;
  };

  const rows: PackedRow[] = [];
  let i = 0;

  while (i < data.length) {
    const remaining = data.length - i;

    let lo = 1;
    let hi = remaining;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (naturalHeight(i, mid) >= targetHeight) lo = mid;
      else hi = mid - 1;
    }

    let count = lo;
    if (count < remaining) {
      const above = naturalHeight(i, count);
      const below = naturalHeight(i, count + 1);
      if (Math.abs(below - targetHeight) < Math.abs(above - targetHeight)) {
        count += 1;
      }
    }

    const isLastRow = i + count >= data.length;
    const height = isLastRow
      ? Math.min(naturalHeight(i, count), targetHeight)
      : naturalHeight(i, count);

    rows.push({
      height,
      items: data.slice(i, i + count).map((item) => ({
        item,
        width: height * (item.width / item.height),
      })),
    });

    i += count;
  }

  return rows;
}
