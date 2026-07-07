import type { ReactNode } from "react";

interface PropertyValueProps {
  suffix?: string;
  value: string | ReactNode;
}

export function PropertyValue({ suffix, value }: PropertyValueProps) {
  return (
    <div className="flex h-full min-h-9 flex-1 shrink grow items-center">
      <span className="py-1.5 text-sm">{value}</span>
      {suffix && <span className="py-1.5 text-sm">{suffix}</span>}
    </div>
  );
}
