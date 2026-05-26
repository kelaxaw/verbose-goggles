import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

type ColumnsState = { value: number };

type ColumnsContextType = {
  columns: ColumnsState;
  setColumns: (n: number) => void;
};

const ColumnsContext = createContext<ColumnsContextType | null>(null);

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

export function useColumns() {
  const ctx = useContext(ColumnsContext);
  if (!ctx) throw new Error("useColumns must be used within ColumnsProvider");
  return ctx;
}
