type BaseFeedItem = {
  id: string;
  width: number;
  height: number;
  author?: string;
  alt?: string;
  src: string;
};

export type ImageFeedItem = BaseFeedItem & {
  kind: "image";
  srcTemplate?: string;
};

export type VideoFeedItem = BaseFeedItem & {
  kind: "video";
  poster?: string;
  duration?: number;
  // Poster URL with {w}/{h} placeholders — Pexels resizes the thumbnail to the
  // cell on resize (S4).
  posterTemplate?: string;
  // Cloudinary fetch URL with a {w} placeholder — the app substitutes the cell
  // width on resize so the CDN delivers a right-sized transcode (S4). Validated
  // at generation, so the runtime fetch never 400s.
  srcTemplate?: string;
};

export type FeedItem = ImageFeedItem | VideoFeedItem;
