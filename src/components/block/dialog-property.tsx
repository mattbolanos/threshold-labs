import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { DialogLabel } from "./dialog-label";
import { DialogValue } from "./dialog-value";

interface DialogPropertyProps {
  label: string;
  Icon: LucideIcon;
  value: string | ReactNode | null;
  labelClassName?: string;
}

export function DialogProperty({
  Icon,
  label,
  value,
  labelClassName,
}: DialogPropertyProps) {
  if (value === null) return null;

  return (
    <div className="flex items-center justify-start gap-8">
      <DialogLabel Icon={Icon} label={label} labelClassName={labelClassName} />
      <DialogValue value={value} />
    </div>
  );
}
