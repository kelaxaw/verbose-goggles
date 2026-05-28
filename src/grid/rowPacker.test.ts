import { describe, it, expect } from "vitest";
import { packRows } from "./rowPacker";
import type { FeedItem } from "@/types/feed";

function items(aspectRatios: number[]): FeedItem[] {
  return aspectRatios.map((ar, i) => ({
    id: `i${i}`,
    kind: "image",
    width: ar * 1000,
    height: 1000,
    src: `https://example.test/${i}`,
  }));
}

function rowFilledWidth(row: { items: { width: number }[] }, gap: number) {
  return row.items.reduce((s, it) => s + it.width, 0) + (row.items.length - 1) * gap;
}

const W = 1000;
const gap = 8;

describe("packRows", () => {
  describe("guard clauses", () => {
    it("returns [] for empty input", () => {
      expect(packRows([], { containerWidth: W, columns: 3, gap })).toEqual([]);
    });
    it("returns [] when containerWidth is 0", () => {
      expect(packRows(items([1, 1, 1]), { containerWidth: 0, columns: 3, gap })).toEqual([]);
    });
    it("returns [] when columns <= 0", () => {
      expect(packRows(items([1, 1, 1]), { containerWidth: W, columns: 0, gap })).toEqual([]);
    });
  });

  describe("coverage", () => {
    it("covers every input item exactly once, in order", () => {
      const input = items([1.5, 0.5, 1, 2, 0.75, 1.33, 1, 0.67, 1.2]);
      const rows = packRows(input, { containerWidth: 800, columns: 3, gap: 6 });
      const ids = rows.flatMap((r) => r.items.map((li) => li.item.id));
      expect(ids).toEqual(input.map((it) => it.id));
    });
    it("total item count matches input", () => {
      const input = items(Array.from({ length: 20 }, (_, i) => 0.5 + i * 0.1));
      const rows = packRows(input, { containerWidth: W, columns: 4, gap });
      expect(rows.reduce((s, r) => s + r.items.length, 0)).toBe(input.length);
    });
  });

  describe("geometry", () => {
    it("fills container width on full rows", () => {
      const rows = packRows(
        items([1.5, 0.75, 1, 1.5, 0.667, 1.333, 1, 2, 0.5, 1.2, 0.8, 1.6]),
        { containerWidth: W, columns: 3, gap },
      );
      for (const row of rows.slice(0, -1)) {
        expect(rowFilledWidth(row, gap)).toBeCloseTo(W, 5);
      }
    });
    it("preserves each item's aspect ratio", () => {
      const ars = [1.5, 0.75, 1, 16 / 9, 2 / 3, 4 / 3, 1, 0.5, 2];
      const rows = packRows(items(ars), { containerWidth: 1200, columns: 3, gap });
      for (const row of rows)
        for (const li of row.items)
          expect(li.width).toBeCloseTo(row.height * (li.item.width / li.item.height), 5);
    });
    it("last row height never exceeds targetHeight", () => {
      const target = (W - gap * 2) / 3;
      const rows = packRows(items([2, 2, 2, 2]), { containerWidth: W, columns: 3, gap });
      expect(rows.at(-1)!.height).toBeLessThanOrEqual(target + 0.001);
    });
    it("portrait-only last row underfills width", () => {
      const rows = packRows(items([9 / 16]), { containerWidth: W, columns: 3, gap });
      expect(rows).toHaveLength(1);
      expect(rowFilledWidth(rows[0], gap)).toBeLessThan(W);
    });
    it("full last row fills width", () => {
      const rows = packRows(items(new Array(6).fill(1)), { containerWidth: W, columns: 3, gap });
      expect(rowFilledWidth(rows.at(-1)!, gap)).toBeCloseTo(W, 5);
    });
    it("row heights stay within 2x of each other with mixed content", () => {
      const mixed = items([16/9, 9/16, 1, 16/9, 2/3, 3/2, 9/16, 16/9, 1, 4/3, 9/16, 16/9]);
      const rows = packRows(mixed, { containerWidth: W, columns: 3, gap });
      const heights = rows.map((r) => r.height);
      expect(Math.max(...heights) / Math.min(...heights)).toBeLessThan(2);
    });
  });

  describe("determinism", () => {
    it("same inputs → same output", () => {
      const input = items([1.5, 0.75, 1, 1.333, 0.667, 1.5, 1]);
      const opts = { containerWidth: 900, columns: 3, gap: 10 };
      expect(packRows(input, opts)).toEqual(packRows(input, opts));
    });
  });

  describe("column count semantics", () => {
    it("more columns → shorter rows on average", () => {
      const input = items(new Array(12).fill(1));
      const avg = (rows: PackedRow[]) => rows.reduce((s, r) => s + r.height, 0) / rows.length;
      const r3 = packRows(input, { containerWidth: W, columns: 3, gap });
      const r5 = packRows(input, { containerWidth: W, columns: 5, gap });
      expect(avg(r3)).toBeGreaterThan(avg(r5));
    });
    it("columns=1 → one item per row for square items", () => {
      const rows = packRows(items(new Array(5).fill(1)), { containerWidth: W, columns: 1, gap });
      for (const row of rows) expect(row.items).toHaveLength(1);
    });
  });
});

// Type alias for the test above
type PackedRow = ReturnType<typeof packRows>[number];
