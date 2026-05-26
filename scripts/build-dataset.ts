#!/usr/bin/env node
// Run: npx tsx scripts/build-dataset.ts
// Requires: PEXELS_API_KEY in environment or .env file
// Output: public/feed.json

import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT_PATH = path.join(ROOT, "public", "feed.json");

const PEXELS_KEY = process.env.PEXELS_API_KEY;

// ─── Types ────────────────────────────────────────────────────────────────────

export type FeedItem = {
  id: string;
  kind: "image" | "video";
  width: number;
  height: number;
  // For images: URL template — replace {w} and {h} with cell size at render time
  src: string;
  srcTemplate?: string;
  // Poster frame for video — must be set to avoid black square on load
  poster?: string;
  duration?: number;
};

// ─── Picsum (no API key required) ────────────────────────────────────────────

interface PicsumRaw {
  id: string;
  width: number;
  height: number;
}

async function fetchPicsum(pages: number): Promise<FeedItem[]> {
  const items: FeedItem[] = [];

  for (let page = 1; page <= pages; page++) {
    const res = await fetch(
      `https://picsum.photos/v2/list?page=${page}&limit=100`,
    );
    if (!res.ok) throw new Error(`Picsum page ${page}: HTTP ${res.status}`);

    const data: PicsumRaw[] = await res.json();

    for (const item of data) {
      items.push({
        id: `picsum-${item.id}`,
        kind: "image",
        width: item.width,
        height: item.height,
        // Base src at medium resolution for initial load
        src: `https://picsum.photos/id/${item.id}/1200/${Math.round((1200 * item.height) / item.width)}`,
        // Right-sized media template (S4): substitute {w} and {h} in the app
        srcTemplate: `https://picsum.photos/id/${item.id}/{w}/{h}`,
      });
    }

    process.stdout.write(
      `\rPicsum: page ${page}/${pages} (${items.length} images)`,
    );
  }

  console.log();
  return items;
}

// ─── Pexels Videos (API key required) ────────────────────────────────────────

interface PexelsVideoFile {
  link: string;
  width: number;
  height: number;
  quality: string;
  file_type: string;
}

interface PexelsVideo {
  id: number;
  width: number;
  height: number;
  duration: number;
  image: string;
  video_files: PexelsVideoFile[];
}

interface PexelsResponse {
  videos: PexelsVideo[];
}

async function fetchPexels(
  queries: string[],
  pagesPerQuery: number,
): Promise<FeedItem[]> {
  if (!PEXELS_KEY) {
    console.warn("PEXELS_API_KEY not set — Pexels videos skipped");
    return [];
  }

  const seen = new Set<number>();
  const items: FeedItem[] = [];

  for (const query of queries) {
    for (let page = 1; page <= pagesPerQuery; page++) {
      const res = await fetch(
        `https://api.pexels.com/videos/search?query=${encodeURIComponent(query)}&per_page=80&page=${page}`,
        { headers: { Authorization: PEXELS_KEY } },
      );

      if (res.status === 429) {
        console.warn(`\nPexels: rate limited, waiting 60s...`);
        await sleep(60_000);
        continue;
      }
      if (!res.ok)
        throw new Error(`Pexels "${query}" page ${page}: HTTP ${res.status}`);

      const data: PexelsResponse = await res.json();

      for (const video of data.videos) {
        if (seen.has(video.id)) continue;
        seen.add(video.id);

        // Pick best MP4 by width
        const file = video.video_files
          .filter((f) => f.file_type === "video/mp4" && f.width > 0)
          .sort((a, b) => b.width - a.width)[0];

        if (!file) continue;

        items.push({
          id: `pexels-${video.id}`,
          kind: "video",
          width: video.width || file.width,
          height: video.height || file.height,
          src: file.link,
          poster: video.image,
          duration: video.duration,
        });
      }

      process.stdout.write(
        `\rPexels "${query}": page ${page}/${pagesPerQuery} (${items.length} videos total)`,
      );

      // Pexels free tier: 200 req/min → 300ms between requests
      await sleep(350);
    }
    console.log();
  }

  return items;
}

// ─── Google sample MP4s (no key, fixed list) ──────────────────────────────────

function getGoogleSamples(): FeedItem[] {
  const BASE = "https://storage.googleapis.com/gtv-videos-bucket/sample";

  const samples: Array<{ name: string; width: number; height: number }> = [
    { name: "BigBuckBunny", width: 1280, height: 720 },
    { name: "ElephantsDream", width: 1280, height: 720 },
    { name: "ForBiggerBlazes", width: 1280, height: 720 },
    { name: "ForBiggerEscapes", width: 1280, height: 720 },
    { name: "ForBiggerFun", width: 1280, height: 720 },
    { name: "ForBiggerJoyrides", width: 1280, height: 720 },
    { name: "ForBiggerMeltdowns", width: 1280, height: 720 },
    { name: "SubaruOutbackOnStreetAndDirt", width: 1280, height: 720 },
    { name: "TearsOfSteel", width: 1280, height: 720 },
    { name: "VolkswagenGTIReview", width: 1280, height: 720 },
    { name: "WeAreGoingOnBullrun", width: 1280, height: 720 },
    { name: "WhatCarCanYouGetForAGrand", width: 1280, height: 720 },
  ];

  return samples.map((s) => ({
    id: `google-${s.name.toLowerCase().replace(/\s+/g, "-")}`,
    kind: "video" as const,
    width: s.width,
    height: s.height,
    src: `${BASE}/${s.name}.mp4`,
    poster: `${BASE}/images/${s.name}.jpg`,
  }));
}

// ─── Utilities ────────────────────────────────────────────────────────────────

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Deterministic shuffle — same order on every run (stable for scroll anchor testing)
function seededShuffle<T>(arr: T[], seed: string): T[] {
  let s = [...seed].reduce((acc, c) => acc + c.charCodeAt(0), 0);

  const rand = () => {
    s = Math.imul(s ^ (s >>> 16), 0x45d9f3b);
    s = Math.imul(s ^ (s >>> 16), 0x45d9f3b);
    s ^= s >>> 16;
    return (s >>> 0) / 0xffffffff;
  };

  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("Building dataset...\n");

  const [images, pexelsVideos] = await Promise.all([
    fetchPicsum(15), // 1500 images
    fetchPexels(
      ["nature", "city", "people", "ocean", "architecture"],
      4, // ~400–500 unique videos after dedup
    ),
  ]);

  const googleVideos = getGoogleSamples();
  const combined = seededShuffle(
    [...images, ...pexelsVideos, ...googleVideos],
    "higgsfield-2026",
  );

  const imageCount = combined.filter((i) => i.kind === "image").length;
  const videoCount = combined.filter((i) => i.kind === "video").length;

  console.log(`\nTotal: ${combined.length} items`);
  console.log(`  Images: ${imageCount}`);
  console.log(`  Videos: ${videoCount}`);

  await mkdir(path.dirname(OUT_PATH), { recursive: true });
  await writeFile(OUT_PATH, JSON.stringify(combined, null, 2), "utf-8");

  console.log(`\nWritten: ${OUT_PATH}`);
}

main().catch((err) => {
  console.error("\nError:", err.message);
  process.exit(1);
});
