"use client";

import { CalendarIcon } from "lucide-react";
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
  from: string;
  to: string;
}
interface CalendarFilterProps {
  range: Range;
  setRange: (range: Range) => void;
  defaultRange: Range;
}

export function CalendarFilter({
  range,
  setRange,
  defaultRange,
}: CalendarFilterProps) {
  const [localRange, setLocalRange] = React.useState<DateRange | undefined>({
    from: new Date(range.from),
    to: new Date(range.to),
  });
  const [open, setOpen] = React.useState(false);

  const handleApply = () => {
    setRange({
      from: formatQueryDate(localRange?.from ?? new Date()),
      to: formatQueryDate(localRange?.to ?? new Date()),
    });
    setOpen(false);
  };

  const handleClear = () => {
    setRange(defaultRange);
    setLocalRange(undefined);
    setOpen(false);
  };

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
          <CalendarIcon />
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
          onSelect={setLocalRange}
          selected={localRange}
          showOutsideDays
        />
        <div className="flex justify-end gap-2 p-2">
          <Button onMouseDown={handleClear} variant="outline">
            Clear
          </Button>
          <Button onMouseDown={handleApply}>Apply</Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
