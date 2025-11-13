"use client";

import { CalendarIcon } from "lucide-react";
import type { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface CalendarFilterProps {
  range: DateRange | undefined;
  setRange: (range: DateRange | undefined) => void;
}

export function CalendarFilter({ range, setRange }: CalendarFilterProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          className={cn(
            !range?.from || !range?.to ? "text-muted-foreground" : "",
          )}
          variant="outline"
        >
          <CalendarIcon />
          {range?.from && range?.to
            ? `${range.from.toLocaleDateString()} - ${range.to.toLocaleDateString()}`
            : "Select Date Range"}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-auto overflow-hidden p-0">
        <Calendar
          className="w-full"
          defaultMonth={range?.from}
          disableNavigation
          fixedWeeks
          mode="range"
          onSelect={setRange}
          selected={range}
          showOutsideDays
          startMonth={range?.from}
        />
      </PopoverContent>
    </Popover>
  );
}
