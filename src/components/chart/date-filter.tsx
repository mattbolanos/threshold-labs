"use client";

import { IconCalendarWeek } from "@tabler/icons-react";
import { format, subMonths, subWeeks, subYears } from "date-fns";
import * as React from "react";
import type { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn, formatQueryDate } from "@/lib/utils";

interface Range {
  from?: string | undefined;
  to?: string | undefined;
}

interface DateFilterProps {
  range: Range | null;
  setRange: (range: Range | null) => void;
}

const DATE_PRESETS = [
  { amount: 4, label: "Last 4w", unit: "week", value: "last-4w" },
  { amount: 8, label: "Last 8w", unit: "week", value: "last-8w" },
  { amount: 12, label: "Last 12w", unit: "week", value: "last-12w" },
  { amount: 16, label: "Last 16w", unit: "week", value: "last-16w" },
  { amount: 6, label: "Last 6m", unit: "month", value: "last-6m" },
  { amount: 1, label: "Last 1y", unit: "year", value: "last-1y" },
] as const;

type DatePreset = (typeof DATE_PRESETS)[number];
type DatePresetValue = DatePreset["value"];

function getToday() {
  const today = new Date();

  return new Date(today.getFullYear(), today.getMonth(), today.getDate());
}

function getPresetRange(preset: DatePreset): Range {
  const to = getToday();
  let from: Date;

  switch (preset.unit) {
    case "week":
      from = subWeeks(to, preset.amount);
      break;
    case "month":
      from = subMonths(to, preset.amount);
      break;
    case "year":
      from = subYears(to, preset.amount);
      break;
  }

  return {
    from: formatQueryDate(from),
    to: formatQueryDate(to),
  };
}

function getPresetByValue(value: string | undefined) {
  return DATE_PRESETS.find((preset) => preset.value === value);
}

function getMatchingPresetValue(range: Range | null): DatePresetValue | "" {
  if (!range?.from || !range?.to) return "";

  const matchingPreset = DATE_PRESETS.find((preset) => {
    const presetRange = getPresetRange(preset);

    return presetRange.from === range.from && presetRange.to === range.to;
  });

  return matchingPreset?.value ?? "";
}

function parseQueryDate(value: string | undefined) {
  if (!value) return undefined;

  const date = new Date(`${value}T00:00:00`);

  return Number.isNaN(date.getTime()) ? undefined : date;
}

function rangeToDateRange(range: Range | null): DateRange | undefined {
  const from = parseQueryDate(range?.from);
  const to = parseQueryDate(range?.to);

  if (!from && !to) return undefined;

  return { from, to };
}

function dateRangeToRange(range: DateRange | undefined): Range | null {
  if (!range?.from || !range?.to) return null;

  return {
    from: formatQueryDate(range.from),
    to: formatQueryDate(range.to),
  };
}

function getRangeLabel(range: Range | null) {
  const matchingPreset = getPresetByValue(getMatchingPresetValue(range));

  if (matchingPreset) return matchingPreset.label;

  const from = parseQueryDate(range?.from);
  const to = parseQueryDate(range?.to);

  if (!from || !to) return "Select Date Range";

  return `${format(from, "MMM d, yyyy")} - ${format(to, "MMM d, yyyy")}`;
}

export function DateFilter({ range, setRange }: DateFilterProps) {
  const rangeFrom = range?.from;
  const rangeTo = range?.to;
  const [localRange, setLocalRange] = React.useState<DateRange | undefined>(
    rangeToDateRange(range),
  );
  const [open, setOpen] = React.useState(false);
  const selectedPreset = getMatchingPresetValue(dateRangeToRange(localRange));
  const hasCompleteLocalRange = Boolean(localRange?.from && localRange?.to);

  React.useEffect(() => {
    setLocalRange(
      rangeToDateRange(
        rangeFrom || rangeTo ? { from: rangeFrom, to: rangeTo } : null,
      ),
    );
  }, [rangeFrom, rangeTo]);

  const handlePresetSelect = (values: string[]) => {
    const preset = getPresetByValue(values[0]);

    if (!preset) return;

    const nextRange = getPresetRange(preset);

    setLocalRange(rangeToDateRange(nextRange));
    setRange(nextRange);
    setOpen(false);
  };

  const handleApply = () => {
    const nextRange = dateRangeToRange(localRange);

    if (!nextRange) return;

    setRange(nextRange);
    setOpen(false);
  };

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger
        render={
          <Button
            className={cn(
              "max-w-72 justify-start text-left font-normal",
              !range?.from || !range?.to ? "text-muted-foreground" : false,
            )}
            variant="outline"
          />
        }
      >
        <IconCalendarWeek aria-hidden data-icon="inline-start" />
        <span className="truncate">{getRangeLabel(range)}</span>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-auto p-2">
        <ToggleGroup
          aria-label="Date range presets"
          className="max-w-[calc(100vw-2rem)] flex-wrap"
          onValueChange={handlePresetSelect}
          size="sm"
          value={selectedPreset ? [selectedPreset] : []}
          variant="outline"
        >
          {DATE_PRESETS.map((preset) => (
            <ToggleGroupItem
              aria-label={preset.label}
              key={preset.value}
              value={preset.value}
            >
              {preset.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <Separator />
        <Calendar
          className="w-full"
          defaultMonth={localRange?.from ?? new Date()}
          fixedWeeks
          mode="range"
          numberOfMonths={2}
          onSelect={setLocalRange}
          selected={localRange}
          showOutsideDays
        />
        <div className="flex justify-end gap-2">
          <Button
            onClick={() => {
              setRange(null);
              setLocalRange(undefined);
              setOpen(false);
            }}
            type="button"
            variant="outline"
          >
            Clear
          </Button>
          <Button
            disabled={!hasCompleteLocalRange}
            onClick={handleApply}
            type="button"
          >
            Apply
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
