import { InfoIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface Definition {
  label: string;
  description: string;
  colorClassName?: string;
}

interface InfoPopoverProps {
  title: string;
  definitions: Definition[];
  className?: string;
}

export function InfoPopover({
  title = "Definitions",
  definitions,
}: InfoPopoverProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          className="data-[state=open]:bg-accent"
          size="icon-sm"
          variant="ghost"
        >
          <InfoIcon className="size-5" />
          <span className="sr-only">View definitions</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-84 p-4" collisionPadding={10}>
        <div className="space-y-5">
          <h4 className="leading-none font-semibold">{title}</h4>
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
                  <span className="text-sm leading-none font-medium">
                    {item.label}
                  </span>
                </div>
                <p className="text-muted-foreground text-sm leading-normal">
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
