import type {
  FeedItem,
  ImageFeedItem,
  VideoFeedItem,
} from "@/types/feed";
import type { ScrollObserver } from "@/hooks/useScrollObserver";

export type AssetProps = {
  item: FeedItem;
  displayWidth: number;
  displayHeight: number;
  observer: ScrollObserver | null;
};

export type ImageAssetProps = Omit<AssetProps, "item"> & {
  item: ImageFeedItem;
};

export type VideoAssetProps = Omit<AssetProps, "item"> & {
  item: VideoFeedItem;
};
