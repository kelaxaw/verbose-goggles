import { useContext } from "react";
import { ColumnsContext } from "@/contexts/columns.context";

export function useColumns() {
  const ctx = useContext(ColumnsContext);
  if (!ctx) throw new Error("useColumns must be used within ColumnsProvider");
  return ctx;
}
