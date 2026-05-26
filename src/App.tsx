import { ColumnsSlider } from "./components/ColumnsSlider";
import Feed from "./components/Feed";
import { ColumnsProvider } from "./contexts/columns.context";

function App() {
  return (
    <ColumnsProvider>
      <div className="h-svh flex flex-col">
        <ColumnsSlider />
        <Feed />
      </div>
    </ColumnsProvider>
  );
}

export default App;

//TODO
// 1. Сделать задержку загрузки асетов пока юзер не перестанет скролить
// 2. Сделать превью асетов (скелетоны)
// 3. Починить якорь на асеты при изменении окна
// 3. Добавить видео
