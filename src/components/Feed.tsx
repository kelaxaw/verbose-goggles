import Grid from "@/components/Grid";
import type { FeedItem } from "@/types/feed";

export default function Feed({ data }: { data: FeedItem[] }) {
  return <Grid data={data} />;
}
