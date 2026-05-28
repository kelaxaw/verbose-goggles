#!/usr/bin/env node
// Run: pnpm build:dataset
// No API keys required — fully generative, deterministic across runs.
// Images: Picsum seed URLs. Videos: Cloudinary demo pool.
// Output: public/db/feed.json

import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import type { FeedItem } from "../src/types/feed";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT_PATH = path.join(ROOT, "public", "db", "feed.json");

const TARGET_IMAGES = 1900;
const TARGET_VIDEOS = 100;

// ─── PRNG ─────────────────────────────────────────────────────────────────────

function mulberry32(seed: number) {
  let t = seed >>> 0;
  return function rand(): number {
    t = (t + 0x6d2b79f5) >>> 0;
    let r = t;
    r = Math.imul(r ^ (r >>> 15), r | 1);
    r ^= r + Math.imul(r ^ (r >>> 7), r | 61);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(0xc0ffee);

// ─── Images (Picsum seed URLs) ────────────────────────────────────────────────

const ASPECT_BUCKETS: { w: number; h: number; weight: number }[] = [
  { w: 3,  h: 2,  weight: 25 },
  { w: 4,  h: 3,  weight: 15 },
  { w: 16, h: 9,  weight: 12 },
  { w: 1,  h: 1,  weight: 12 },
  { w: 2,  h: 3,  weight: 18 },
  { w: 3,  h: 4,  weight: 10 },
  { w: 9,  h: 16, weight:  8 },
];

function pickWeighted<T extends { weight: number }>(buckets: T[]): T {
  const total = buckets.reduce((s, b) => s + b.weight, 0);
  let r = rand() * total;
  for (const b of buckets) {
    r -= b.weight;
    if (r <= 0) return b;
  }
  return buckets[buckets.length - 1];
}

function generateImages(count: number): FeedItem[] {
  const items: FeedItem[] = [];
  for (let i = 0; i < count; i++) {
    const bucket = pickWeighted(ASPECT_BUCKETS);
    const scale = 0.75 + rand() * 0.5;
    const long = Math.round(1600 * scale);
    const isLandscape = bucket.w >= bucket.h;
    const width  = isLandscape ? long : Math.round(long * bucket.w / bucket.h);
    const height = isLandscape ? Math.round(long * bucket.h / bucket.w) : long;
    const seed = `hf-${i.toString(36)}-${Math.floor(rand() * 1e9).toString(36)}`;
    items.push({
      id: `img-${String(i).padStart(5, "0")}`,
      kind: "image",
      width,
      height,
      author: `Picsum`,
      src: `https://picsum.photos/seed/${seed}/1200/${Math.round(1200 * height / width)}`,
      srcTemplate: `https://picsum.photos/seed/${seed}/{w}/{h}`,
    });
  }
  console.log(`Images: generated ${items.length} via Picsum seed URLs`);
  return items;
}

// ─── Videos (Cloudinary demo pool) ───────────────────────────────────────────

const VIDEO_POOL: { src: string; width: number; height: number; duration: number }[] = [
  { src: "https://res.cloudinary.com/demo/video/upload/q_auto,f_mp4,w_640/dog.mp4",             width: 1280, height: 720,  duration: 10 },
  { src: "https://res.cloudinary.com/demo/video/upload/q_auto,f_mp4,w_640/elephants.mp4",        width: 1280, height: 720,  duration: 12 },
  { src: "https://res.cloudinary.com/demo/video/upload/q_auto,f_mp4,w_640/sea_turtle.mp4",       width: 1280, height: 720,  duration: 8  },
  { src: "https://res.cloudinary.com/demo/video/upload/q_auto,f_mp4,w_640/kitten_fighting.mp4",  width: 1280, height: 720,  duration: 15 },
  { src: "https://res.cloudinary.com/demo/video/upload/q_auto,f_mp4,w_640/cat.mp4",              width: 1280, height: 720,  duration: 6  },
  { src: "https://res.cloudinary.com/demo/video/upload/q_auto,f_mp4,w_640/airplane.mp4",         width: 1280, height: 720,  duration: 9  },
  { src: "https://res.cloudinary.com/demo/video/upload/q_auto,f_mp4,w_360,ar_9:16,c_fill/dog.mp4",            width: 720,  height: 1280, duration: 10 },
  { src: "https://res.cloudinary.com/demo/video/upload/q_auto,f_mp4,w_360,ar_9:16,c_fill/kitten_fighting.mp4", width: 720,  height: 1280, duration: 15 },
  { src: "https://res.cloudinary.com/demo/video/upload/q_auto,f_mp4,w_360,ar_9:16,c_fill/elephants.mp4",       width: 720,  height: 1280, duration: 12 },
  { src: "https://res.cloudinary.com/demo/video/upload/q_auto,f_mp4,w_480,ar_1:1,c_fill/cat.mp4",             width: 1080, height: 1080, duration: 6  },
  { src: "https://res.cloudinary.com/demo/video/upload/q_auto,f_mp4,w_480,ar_1:1,c_fill/sea_turtle.mp4",      width: 1080, height: 1080, duration: 8  },
  { src: "https://res.cloudinary.com/demo/video/upload/q_auto,f_mp4,w_640,ar_4:3,c_fill/airplane.mp4",        width: 1440, height: 1080, duration: 9  },
];

function generateVideos(count: number): FeedItem[] {
  const items: FeedItem[] = [];
  for (let i = 0; i < count; i++) {
    const clip = VIDEO_POOL[i % VIDEO_POOL.length];
    const posterSeed = `vid-${i.toString(36)}-${Math.floor(rand() * 1e9).toString(36)}`;
    const posterW = Math.min(clip.width, 640);
    const posterH = Math.max(1, Math.round(posterW * clip.height / clip.width));
    items.push({
      id: `video-${String(i).padStart(4, "0")}`,
      kind: "video",
      width: clip.width,
      height: clip.height,
      duration: clip.duration,
      src: clip.src,
      poster: `https://picsum.photos/seed/${posterSeed}/${posterW}/${posterH}`,
      posterTemplate: `https://picsum.photos/seed/${posterSeed}/{w}/{h}`,
    });
  }
  console.log(`Videos: generated ${items.length} from pool of ${VIDEO_POOL.length} clips`);
  return items;
}

// ─── Shuffle ──────────────────────────────────────────────────────────────────

function seededShuffle<T>(arr: T[], seed: string): T[] {
  let s = [...seed].reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const r = () => {
    s = Math.imul(s ^ (s >>> 16), 0x45d9f3b);
    s = Math.imul(s ^ (s >>> 16), 0x45d9f3b);
    s ^= s >>> 16;
    return (s >>> 0) / 0xffffffff;
  };
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("Building dataset...\n");

  const images = generateImages(TARGET_IMAGES);
  const videos = generateVideos(TARGET_VIDEOS);
  const combined = seededShuffle([...images, ...videos], "higgsfield-2026");

  console.log(`\nTotal: ${combined.length} items`);
  console.log(`  Images: ${combined.filter((i) => i.kind === "image").length}`);
  console.log(`  Videos: ${combined.filter((i) => i.kind === "video").length}`);

  await mkdir(path.dirname(OUT_PATH), { recursive: true });
  await writeFile(OUT_PATH, JSON.stringify(combined, null, 2), "utf-8");
  console.log(`\nWritten: ${OUT_PATH}`);
}

main().catch((err) => {
  console.error("\nError:", err.message);
  process.exit(1);
});
