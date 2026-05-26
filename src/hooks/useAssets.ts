import { useEffect, useState } from "react";
import type { FeedItem } from "scripts/build-dataset";

const getAssets = async () => {
  const data = await fetch("/feed.json");
  return data.json();
};

export const useAssets = () => {
  const [data, setData] = useState<FeedItem[] | []>([]);

  useEffect(() => {
    getAssets().then((data) => setData(data));
  }, []);

  return { data };
};
