"use client";

import { IconCalendarWeek } from "@tabler/icons-react";
import { format, startOfWeek } from "date-fns";
import { useState } from "react";
import type { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import { formatQueryDate, parseQueryDate } from "@/lib/utils";
import type { WorkoutDateMode } from "@/lib/workout-library";

interface WorkoutDateFilterProps {
  dateMode: WorkoutDateMode;
  from: string;
  id: string;
  onChange: (value: {
    dateMode: WorkoutDateMode;
    from: string;
    to: string;
    week: string;
  }) => void;
  to: string;
  week: string;
}

function formatDate(value: string) {
  const date = parseQueryDate(value);
  return date ? format(date, "MMM d, yyyy") : "";
}

function getDateLabel({
  dateMode,
  from,
  to,
  week,
}: Omit<WorkoutDateFilterProps, "id" | "onChange">) {
  if (dateMode === "week" && week) {
    return `Week of ${formatDate(week)}`;
  }
  if (dateMode === "range" && from && to) {
    return `${formatDate(from)} – ${formatDate(to)}`;
  }
  if (dateMode === "range" && from) {
    return `From ${formatDate(from)}`;
  }
  return "Any time";
}

export function WorkoutDateFilter({
  dateMode,
  from,
  id,
  onChange,
  to,
  week,
}: WorkoutDateFilterProps) {
  const [open, setOpen] = useState(false);
  const [draftRange, setDraftRange] = useState<DateRange | undefined>();
  const [pickerMode, setPickerMode] = useState<"range" | "week">(
    dateMode === "range" ? "range" : "week",
  );
  const selectedWeek = parseQueryDate(week) ?? undefined;
  const selectedRange: DateRange | undefined = parseQueryDate(from)
    ? {
        from: parseQueryDate(from) ?? undefined,
        to: parseQueryDate(to) ?? undefined,
      }
    : undefined;
  const calendarRange = draftRange ?? selectedRange;

  const showWeekPicker = pickerMode === "week";

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (nextOpen) {
      setPickerMode(dateMode === "range" ? "range" : "week");
    } else {
      setDraftRange(undefined);
    }
  };

  const selectWeek = (date: Date | undefined) => {
    if (!date) return;
    const weekStart = startOfWeek(date, { weekStartsOn: 1 });
    onChange({
      dateMode: "week",
      from: "",
      to: "",
      week: formatQueryDate(weekStart),
    });
    setOpen(false);
  };

  const applyRange = () => {
    if (!calendarRange?.from) return;
    onChange({
      dateMode: "range",
      from: formatQueryDate(calendarRange.from),
      to: calendarRange.to ? formatQueryDate(calendarRange.to) : "",
      week: "",
    });
    setDraftRange(undefined);
    setOpen(false);
  };

  return (
    <Popover onOpenChange={handleOpenChange} open={open}>
      <PopoverTrigger
        render={
          <Button
            className="w-full justify-start overflow-hidden text-left font-normal"
            id={id}
            type="button"
            variant="outline"
          />
        }
      >
        <IconCalendarWeek aria-hidden data-icon="inline-start" />
        <span className="truncate">
          {getDateLabel({ dateMode, from, to, week })}
        </span>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-3">
        <PopoverHeader>
          <PopoverTitle>Filter by date</PopoverTitle>
          <PopoverDescription>
            Choose one week or any custom range.
          </PopoverDescription>
        </PopoverHeader>

        <div className="grid grid-cols-2 gap-1 rounded-lg bg-muted p-1">
          <Button
            aria-pressed={showWeekPicker}
            onClick={() => {
              setDraftRange(undefined);
              setPickerMode("week");
            }}
            size="sm"
            type="button"
            variant={showWeekPicker ? "accent" : "ghost"}
          >
            Week
          </Button>
          <Button
            aria-pressed={!showWeekPicker}
            onClick={() => setPickerMode("range")}
            size="sm"
            type="button"
            variant={!showWeekPicker ? "accent" : "ghost"}
          >
            Date range
          </Button>
        </div>

        {showWeekPicker ? (
          <Calendar
            defaultMonth={selectedWeek}
            mode="single"
            onSelect={selectWeek}
            selected={selectedWeek}
          />
        ) : (
          <Calendar
            defaultMonth={calendarRange?.from}
            mode="range"
            onSelect={setDraftRange}
            selected={calendarRange}
          />
        )}

        <div className="flex justify-end gap-2 border-t pt-3">
          <Button
            onClick={() => {
              onChange({
                dateMode: "any",
                from: "",
                to: "",
                week: "",
              });
              setDraftRange(undefined);
              setOpen(false);
            }}
            type="button"
            variant="outline"
          >
            Any time
          </Button>
          {!showWeekPicker ? (
            <Button
              disabled={!calendarRange?.from}
              onClick={applyRange}
              type="button"
            >
              Apply range
            </Button>
          ) : null}
        </div>
      </PopoverContent>
    </Popover>
  );
}
