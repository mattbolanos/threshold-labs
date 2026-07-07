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
import { useIsMobile } from "@/hooks/use-mobile";
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

function getPresetStartDate(preset: DatePreset, to: Date) {
  switch (preset.unit) {
    case "week":
      return subWeeks(to, preset.amount);
    case "month":
      return subMonths(to, preset.amount);
    case "year":
      return subYears(to, preset.amount);
  }
}

function getPresetRange(preset: DatePreset): Range {
  const to = getToday();
  const from = getPresetStartDate(preset, to);

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

  const to = parseQueryDate(range.to);

  if (!to) return "";

  const matchingPreset = DATE_PRESETS.find((preset) => {
    const presetFrom = getPresetStartDate(preset, to);

    return formatQueryDate(presetFrom) === range.from;
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

  if (!from || !to) return "Date Range";

  return `${format(from, "MMM d, yyyy")} - ${format(to, "MMM d, yyyy")}`;
}

export function DateFilter({ range, setRange }: DateFilterProps) {
  const isMobile = useIsMobile();
  const appliedRange = rangeToDateRange(range);
  const [draftRange, setDraftRange] = React.useState<DateRange | undefined>();
  const [open, setOpen] = React.useState(false);
  const calendarRange = draftRange ?? appliedRange;
  const selectedPreset = getMatchingPresetValue(
    dateRangeToRange(calendarRange),
  );
  const hasCompleteCalendarRange = Boolean(
    calendarRange?.from && calendarRange?.to,
  );

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);

    if (!nextOpen) {
      setDraftRange(undefined);
    }
  };

  const handlePresetSelect = (values: string[]) => {
    const preset = getPresetByValue(values[0]);

    if (!preset) return;

    const nextRange = getPresetRange(preset);

    setRange(nextRange);
    setDraftRange(undefined);
    setOpen(false);
  };

  const handleApply = () => {
    const nextRange = dateRangeToRange(calendarRange);

    if (!nextRange) return;

    setRange(nextRange);
    setDraftRange(undefined);
    setOpen(false);
  };

  return (
    <Popover onOpenChange={handleOpenChange} open={open}>
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
          className="grid grid-cols-3 sm:flex sm:flex-wrap"
          onValueChange={handlePresetSelect}
          size="sm"
          value={selectedPreset ? [selectedPreset] : []}
          variant="outline"
        >
          {DATE_PRESETS.map((preset) => (
            <ToggleGroupItem
              aria-label={preset.label}
              className="w-full sm:w-auto"
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
          defaultMonth={calendarRange?.from}
          fixedWeeks
          mode="range"
          numberOfMonths={isMobile ? 1 : 2}
          onSelect={setDraftRange}
          selected={calendarRange}
          showOutsideDays
        />
        <div className="flex justify-end gap-2">
          <Button
            onClick={() => {
              setRange(null);
              setDraftRange(undefined);
              setOpen(false);
            }}
            type="button"
            variant="outline"
          >
            Clear
          </Button>
          <Button
            disabled={!hasCompleteCalendarRange}
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
