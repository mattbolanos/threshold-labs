import type { LucideIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DialogLabelProps {
  Icon: LucideIcon;
  label: string;
}

export function DialogLabel({ Icon, label }: DialogLabelProps) {
  return (
    <Tooltip>
      <TooltipTrigger>
        <div className="text-muted-foreground hover:bg-muted flex h-9 w-40 shrink-0 cursor-default items-center rounded-sm px-2">
          <div className="flex items-center gap-1.5 py-1.5">
            <Icon className="text-muted-foreground size-5 shrink-0" />
            <span className="line-clamp-1 truncate text-sm font-medium">
              {label}
            </span>
          </div>
        </div>
      </TooltipTrigger>
      <TooltipContent side="left">
        <p>{label}</p>
      </TooltipContent>
    </Tooltip>
  );
}
