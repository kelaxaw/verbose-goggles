import Grid from "@/components/Grid";
import { useAssets } from "@/hooks/useAssets";

export default function Feed() {
  const { data } = useAssets();

  return <Grid data={data} />;
}
