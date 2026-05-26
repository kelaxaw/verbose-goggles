import { Slider } from "@/components/ui/slider";
import { useColumns } from "@/contexts/columns.context";

export function ColumnsSlider() {
  const { columns, setColumns } = useColumns();

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex w-64 items-center gap-3 rounded-xl bg-black/80 px-4 py-3 backdrop-blur-sm">
      <span className="w-4 text-center text-sm font-medium text-white">
        {columns.value}
      </span>
      <Slider
        min={1}
        max={6}
        step={1}
        value={[columns.value]}
        onValueChange={([n]) => setColumns(n)}
      />
    </div>
  );
}
