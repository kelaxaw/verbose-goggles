import { useEffect, useState } from "react";
import type { FeedItem } from "@/types/feed";

const getAssets = async () => {
  const response = await fetch("db/feed.json");
  return (await response.json()) as FeedItem[];
};

export const useAssets = () => {
  const [data, setData] = useState<FeedItem[]>([]);

  useEffect(() => {
    getAssets().then((data) => setData(data));
  }, []);

  return { data };
};
