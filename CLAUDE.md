# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev            # start dev server
pnpm build          # tsc -b + vite build
pnpm test           # run layout unit tests (Vitest, no watch)
pnpm test:watch     # vitest in watch mode
pnpm lint           # eslint
pnpm build:dataset  # regenerate public/db/ JSONs (needs PEXELS_API_KEY + CLOUDINARY_CLOUD_NAME)
```

## Architecture

**Stack:** React 19, TypeScript, Vite, Tailwind v4, `@tanstack/react-virtual`, Vitest.

### Data flow

`useAssets` fetches `public/db/feed.json` (static JSON, no API key needed). To swap datasets, change the `routes` key in `src/hooks/useAssets.ts`. Available: `BASE` (~2.5k mixed), `BIG`, `MORE_VIDEOS`, `ONLY_PHOTOS`.

`FeedItem` (`src/types/feed.ts`) — union of `ImageFeedItem | VideoFeedItem`. Both carry `width`/`height` (intrinsic dimensions used only for aspect-ratio math), `src`, and an optional `srcTemplate` with `{w}`/`{h}` placeholders for right-sized delivery (S4).

### Layout engine

`computeJustifiedRows` (`src/layout/justified.ts`) — pure function, O(n). Slices items into fixed-width rows of `columns` items, computes `rowHeight = (containerWidth - gap * (n-1)) / sumAspectRatio`. Underfull last row is height-capped (to previous row's height, or a square proxy if it's the only row) so lone wide items underfill width instead of blowing up tall.

`useComputeLayout` wraps it with a `ResizeObserver` (rAF-debounced) to track `containerWidth`, then `useMemo`s the row array.

### Virtualization

`Grid.tsx` uses `useVirtualizer` (row-level, not item-level — rows are the natural flex unit). Each virtual item renders a `<figure>` with `position: absolute; transform: translateY(...)`. `overscan: 3`.

### Scroll anchoring

`useScrollAnchor` (`src/hooks/useScrollAnchor.ts`) — `useLayoutEffect` keyed on `rows`. Reads previous rows from a ref, finds the first visible item by item **id** (not row index — reflow moves items between rows), then scrolls the virtualizer to the same item in the new layout. Fires on both column-count changes and viewport resize.

### Columns state

`ColumnsContext` / `ColumnsProvider` (`src/contexts/`) — simple context holding `{ value: number }` and a setter. `useColumns` hook is the consumer. Slider range: 1–6.

### Intersection / lazy loading

`createScrollObserver` (`src/hooks/useScrollObserver.ts`) — one shared `IntersectionObserver` per grid (600px rootMargin), with a `Map<Element, callback>`. Fires synchronously on `observe()` for elements already in the detection zone to avoid a one-frame skeleton gap. `setPaused(true/false)` implements fast-scroll grace (S2): above `PAUSE_VELOCITY_PX_MS = 2 px/ms`, the observer is paused; on settle (150ms idle) it replays only elements still in the live viewport.

### Asset rendering

`Asset/index.tsx` — `memo`-wrapped dispatcher to `ImageAsset` or `VideoAsset` by `item.kind`. Both receive `displayWidth`, `displayHeight`, and the shared `observer`.

- **Images** (`ImageAsset.tsx`) — module-level `imageMemoryCache: Map<string, {src, loaded}>` (S3). On intersect, resolves `srcTemplate` to a width snapped to a step (folding in DPR, capped at 2×), sets `<img src>`.
- **Videos** (`VideoAsset.tsx`) — `videoMemoryCache` same pattern. Thumbnail via `poster`. `<video>` mounts **only on hover** — explicit intent gate to avoid queueing dozens of multi-MB downloads.

### Column-count transition (S1)

In `Grid.tsx`, on `columns.value` change: sets `data-layout-transition="1"` on the outer scroll container (enables CSS `transition: transform, height` on rows via `globals.css`), and triggers a `layout-settle` keyframe (blur 0→0 with a brief peak) on the inner div. Cleared after 300ms so normal scroll stays snappy.
