import type { ReactNode } from "react";

interface DialogValueProps {
  value: string | ReactNode;
}

export function DialogValue({ value }: DialogValueProps) {
  if (typeof value === "string") {
    return <span className="text-sm tabular-nums">{value}</span>;
  }
  return value;
}
