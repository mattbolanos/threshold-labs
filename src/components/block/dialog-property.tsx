import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { DialogLabel } from "./dialog-label";
import { DialogValue } from "./dialog-value";

interface DialogPropertyProps {
  label: string;
  Icon: LucideIcon;
  value: string | ReactNode;
}

export function DialogProperty({ Icon, label, value }: DialogPropertyProps) {
  return (
    <div className="flex justify-start gap-8">
      <DialogLabel Icon={Icon} label={label} />
      <DialogValue value={value} />
    </div>
  );
}
