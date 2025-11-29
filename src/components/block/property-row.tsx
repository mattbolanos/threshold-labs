import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { PropertyLabel } from "./property-label";
import { PropertyValue } from "./property-value";

interface PropertyRowProps {
  label: string;
  Icon: LucideIcon;
  value: string | ReactNode | null;
  labelClassName?: string;
}

export function PropertyRow({
  Icon,
  label,
  value,
  labelClassName,
}: PropertyRowProps) {
  if (value === null) return null;

  return (
    <div className="flex items-center justify-start gap-8">
      <PropertyLabel
        Icon={Icon}
        label={label}
        labelClassName={labelClassName}
      />
      <PropertyValue value={value} />
    </div>
  );
}
