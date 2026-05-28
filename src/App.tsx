import { ColumnsSlider } from "./components/ColumnsSlider";
import Feed from "./components/Feed";
import { ColumnsProvider } from "./contexts/columns.provider";
import { useAssets } from "./hooks/useAssets";
import { ItemCount } from "./components/ItemCount";

function App() {
  const { data } = useAssets();

  return (
    <ColumnsProvider>
      <div className="h-svh flex flex-col">
        <Feed data={data} />
        <ItemCount count={data.length} />
        <ColumnsSlider />
      </div>
    </ColumnsProvider>
  );
}

export default App;
