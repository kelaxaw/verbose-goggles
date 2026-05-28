import { memo, type ComponentType } from "react";
import { ImageAsset } from "@/components/Asset/ImageAsset";
import { VideoAsset } from "@/components/Asset/VideoAsset";
import type { AssetProps } from "@/components/Asset/types";
import type { FeedItem } from "@/types/feed";

const assetRenderers = {
  image: function ImageRenderer(props: AssetProps) {
    if (props.item.kind !== "image") return null;
    return <ImageAsset {...props} item={props.item} />;
  },
  video: function VideoRenderer(props: AssetProps) {
    if (props.item.kind !== "video") return null;
    return <VideoAsset {...props} item={props.item} />;
  },
} satisfies Record<FeedItem["kind"], ComponentType<AssetProps>>;

export default memo(function Asset(props: AssetProps) {
  const Component = assetRenderers[props.item.kind];
  return <Component {...props} />;
});
