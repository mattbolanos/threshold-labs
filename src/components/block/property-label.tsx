"use client";

import type { TablerIcon } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

interface PropertyLabelProps {
  label: {
    icon: TablerIcon;
    title: string;
  };
  labelClassName?: string;
}

export function PropertyLabel({ label, labelClassName }: PropertyLabelProps) {
  return (
    <div
      className={cn(
        "text-muted-foreground md:hover:bg-muted flex h-9 w-46 shrink-0 cursor-default items-center rounded-sm px-2 transition-colors md:w-48",
        labelClassName,
      )}
      title={label.title}
    >
      <div className="flex min-w-0 items-center gap-1.5 py-1.5">
        <label.icon className="text-muted-foreground size-5 shrink-0" />
        <span className="line-clamp-1 truncate text-sm font-medium">
          {label.title}
        </span>
      </div>
    </div>
  );
}
