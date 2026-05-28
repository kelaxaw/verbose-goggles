import { createContext } from "react";

export type ColumnsState = { value: number };

export type ColumnsContextType = {
  columns: ColumnsState;
  setColumns: (n: number) => void;
};

export const ColumnsContext = createContext<ColumnsContextType | null>(null);
