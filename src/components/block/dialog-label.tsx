import type { LucideIcon } from "lucide-react";

interface DialogLabelProps {
  Icon: LucideIcon;
  label: string;
}

export function DialogLabel({ Icon, label }: DialogLabelProps) {
  return (
    <div className="text-muted-foreground hover:bg-muted flex w-40 shrink-0 cursor-default items-center gap-1.5 rounded-sm p-2">
      <Icon className="text-muted-foreground size-5" />
      <span className="line-clamp-1 truncate text-sm font-normal">{label}</span>
    </div>
  );
}
