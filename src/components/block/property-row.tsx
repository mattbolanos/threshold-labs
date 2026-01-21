import type { TablerIcon } from "@tabler/icons-react";
import type { ReactNode } from "react";
import { PropertyLabel } from "./property-label";
import { PropertyValue } from "./property-value";

interface PropertyRowProps {
  label: {
    icon: TablerIcon;
    title: string;
  };
  value: string | ReactNode | null | undefined;
  labelClassName?: string;
}

export function PropertyRow({
  label,
  value,
  labelClassName,
}: PropertyRowProps) {
  if (value === null || value === undefined) return null;

  return (
    <div className="flex items-center justify-start gap-8">
      <PropertyLabel label={label} labelClassName={labelClassName} />
      <PropertyValue value={value} />
    </div>
  );
}
