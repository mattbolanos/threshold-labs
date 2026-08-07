import { IconInfoCircle } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export interface Definition {
  label: string;
  description: string;
  colorClassName?: string;
  formula?: string;
}

interface InfoPopoverProps {
  title: string;
  definitions: Definition[];
  className?: string;
  size?: "sm" | "xs";
}

export function InfoPopover({
  title = "Definitions",
  definitions,
  className,
  size = "sm",
}: InfoPopoverProps) {
  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            className={cn(
              "data-[state=open]:bg-accent data-[state=open]:text-foreground text-muted-foreground hover:text-foreground",
              className,
            )}
            size={size === "xs" ? "icon-xs" : "icon-sm"}
            variant="ghost"
          />
        }
      >
        <IconInfoCircle className={size === "xs" ? "size-4" : "size-5"} />
        <span className="sr-only">Learn more about {title}</span>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-84 p-4">
        <div className="space-y-5">
          <h4 className="font-semibold">{title}</h4>
          <div className="grid gap-3">
            {definitions.map((item) => (
              <div className="grid gap-1" key={item.label}>
                <div className="flex items-center gap-2">
                  {item.colorClassName && (
                    <div
                      className={cn(
                        "size-3 shrink-0 rounded-xs",
                        item.colorClassName,
                      )}
                    />
                  )}
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
                {item.formula && (
                  <code className="block rounded-md bg-muted px-3 py-2 font-mono text-xs font-semibold text-foreground">
                    {item.formula}
                  </code>
                )}
                <p className="text-muted-foreground text-sm">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
