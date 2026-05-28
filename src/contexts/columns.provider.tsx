import { useState, type ReactNode } from "react";
import { ColumnsContext, type ColumnsState } from "@/contexts/columns.context";

export function ColumnsProvider({ children }: { children: ReactNode }) {
  const [columns, setColumnsState] = useState<ColumnsState>(() => ({
    value: 3,
  }));

  const setColumns = (n: number) => setColumnsState({ value: n });

  return (
    <ColumnsContext.Provider value={{ columns, setColumns }}>
      {children}
    </ColumnsContext.Provider>
  );
}
