"use client";

import { IconCalendar } from "@tabler/icons-react";
import { format, isValid, parseISO } from "date-fns";
import type { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type AdminDateRangePickerFieldProps = {
  className?: string;
  endDate: string;
  error?: string;
  id: string;
  label: string;
  onValueChange: (range: { endDate: string; startDate: string }) => void;
  startDate: string;
};

const parseDateValue = (value: string) => {
  if (!value) return undefined;

  const date = parseISO(value);
  return isValid(date) ? date : undefined;
};

export function AdminDateRangePickerField({
  className,
  endDate,
  error,
  id,
  label,
  onValueChange,
  startDate,
}: AdminDateRangePickerFieldProps) {
  const from = parseDateValue(startDate);
  const to = parseDateValue(endDate);
  const date: DateRange | undefined = from ? { from, to } : undefined;

  const handleSelect = (range: DateRange | undefined) => {
    onValueChange({
      endDate: range?.to ? format(range.to, "yyyy-MM-dd") : "",
      startDate: range?.from ? format(range.from, "yyyy-MM-dd") : "",
    });
  };

  return (
    <Field className={className} data-invalid={Boolean(error)}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Popover>
        <PopoverTrigger
          render={
            <Button
              aria-invalid={Boolean(error)}
              className="w-full justify-start px-2.5 text-left font-normal data-[empty=true]:text-muted-foreground"
              data-empty={!date?.from}
              id={id}
              type="button"
              variant="outline"
            />
          }
        >
          <IconCalendar data-icon="inline-start" />
          {date?.from ? (
            date.to ? (
              <>
                {format(date.from, "LLL dd, y")} –{" "}
                {format(date.to, "LLL dd, y")}
              </>
            ) : (
              format(date.from, "LLL dd, y")
            )
          ) : (
            <span>Pick a date range</span>
          )}
        </PopoverTrigger>
        <PopoverContent align="start" className="w-auto p-0">
          <Calendar
            defaultMonth={date?.from}
            mode="range"
            numberOfMonths={2}
            onSelect={handleSelect}
            selected={date}
          />
        </PopoverContent>
      </Popover>
      <FieldError>{error}</FieldError>
    </Field>
  );
}
