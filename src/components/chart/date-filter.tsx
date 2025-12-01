"use client";

import { IconCalendarWeek } from "@tabler/icons-react";
import * as React from "react";
import type { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn, formatQueryDate } from "@/lib/utils";

interface Range {
  from?: string | undefined;
  to?: string | undefined;
}

interface DateFilterProps {
  range: Range | null;
  setRange: (range: Range | null) => void;
}

export function DateFilter({ range, setRange }: DateFilterProps) {
  const [localRange, setLocalRange] = React.useState<DateRange | undefined>({
    from: range?.from ? new Date(range.from) : undefined,
    to: range?.to ? new Date(range.to) : undefined,
  });
  const [open, setOpen] = React.useState(false);

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger asChild>
        <Button
          className={cn(
            "text-xs",
            !range?.from || !range?.to ? "text-muted-foreground" : "",
          )}
          variant="outline"
        >
          <IconCalendarWeek />
          {range?.from && range?.to
            ? `${new Date(range.from).toLocaleDateString()} - ${new Date(range.to).toLocaleDateString()}`
            : "Select Date Range"}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-auto overflow-hidden p-0">
        <Calendar
          className="w-full"
          defaultMonth={new Date()}
          fixedWeeks
          mode="range"
          numberOfMonths={2}
          onSelect={setLocalRange}
          selected={localRange}
          showOutsideDays
        />
        <div className="flex justify-end gap-2 p-2">
          <Button
            onMouseDown={() => {
              setRange(null);
              setLocalRange(undefined);
              setOpen(false);
            }}
            variant="outline"
          >
            Clear
          </Button>
          <Button
            onMouseDown={() => {
              setRange({
                from: localRange?.from ? formatQueryDate(localRange.from) : "",
                to: localRange?.to ? formatQueryDate(localRange.to) : "",
              });
              setOpen(false);
            }}
          >
            Apply
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
