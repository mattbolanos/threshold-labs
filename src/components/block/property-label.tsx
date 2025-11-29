"use client";

import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface PropertyLabelProps {
  Icon: LucideIcon;
  label: string;
  labelClassName?: string;
}

export function PropertyLabel({
  Icon,
  label,
  labelClassName,
}: PropertyLabelProps) {
  return (
    <div
      className={cn(
        "text-muted-foreground md:hover:bg-muted flex h-9 w-46 shrink-0 cursor-default items-center rounded-sm px-2 transition-colors md:w-44",
        labelClassName,
      )}
      title={label}
    >
      <div className="flex min-w-0 items-center gap-1.5 py-1.5">
        <Icon className="text-muted-foreground size-5 shrink-0" />
        <span className="line-clamp-1 truncate text-sm font-medium">
          {label}
        </span>
      </div>
    </div>
  );
}
