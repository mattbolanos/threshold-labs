"use client";

import { IconCalendarWeek } from "@tabler/icons-react";
import { format } from "date-fns";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  METRIC_FIELD_CONFIG,
  type WorkoutFormState,
} from "./workout-form-utils";

type WorkoutEditorFieldsProps = {
  form: WorkoutFormState;
  idPrefix: string;
  onChange: <K extends keyof WorkoutFormState>(
    field: K,
    value: WorkoutFormState[K],
  ) => void;
};

/**
 * Get the Monday that starts the Mon–Sun week containing `dateString`.
 * e.g. 2025-11-02 (Sun) → "2025-10-27", 2025-10-27 (Mon) → "2025-10-27"
 */
function computeWeekMonday(dateString: string): string {
  const date = new Date(`${dateString}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "";

  const day = date.getDay(); // 0=Sun … 6=Sat
  // Sun (0) is the last day of the Mon–Sun week, so go back 6; otherwise back (day-1)
  const daysBack = day === 0 ? 6 : day - 1;
  const monday = new Date(date);
  monday.setDate(monday.getDate() - daysBack);
  return format(monday, "yyyy-MM-dd");
}

export function WorkoutEditorFields({
  form,
  idPrefix,
  onChange,
}: WorkoutEditorFieldsProps) {
  const [calendarOpen, setCalendarOpen] = useState(false);

  const selectedDate = form.workoutDate
    ? new Date(`${form.workoutDate}T00:00:00`)
    : undefined;

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    const formatted = format(date, "yyyy-MM-dd");
    onChange("workoutDate", formatted);
    onChange("week", computeWeekMonday(formatted));
    setCalendarOpen(false);
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor={`${idPrefix}-title`}>
            Title <span className="text-destructive">*</span>
          </Label>
          <Input
            autoComplete="off"
            className="min-h-11"
            id={`${idPrefix}-title`}
            name={`${idPrefix}-title`}
            onChange={(event) => onChange("title", event.target.value)}
            placeholder="e.g., Long Run + Tempo…"
            required
            value={form.title}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor={`${idPrefix}-workoutDate`}>
            Workout Date <span className="text-destructive">*</span>
          </Label>
          <Popover onOpenChange={setCalendarOpen} open={calendarOpen}>
            <PopoverTrigger asChild>
              <Button
                className={cn(
                  "min-h-11 w-full justify-start text-left font-normal",
                  !form.workoutDate && "text-muted-foreground",
                )}
                id={`${idPrefix}-workoutDate`}
                type="button"
                variant="outline"
              >
                <IconCalendarWeek aria-hidden className="size-4" />
                {selectedDate && !Number.isNaN(selectedDate.getTime())
                  ? format(selectedDate, "MMM d, yyyy")
                  : "Pick a date…"}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-auto p-0">
              <Calendar
                defaultMonth={selectedDate ?? new Date()}
                mode="single"
                onSelect={handleDateSelect}
                selected={selectedDate}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor={`${idPrefix}-week`}>
            Week <span className="text-destructive">*</span>
          </Label>
          <Input
            aria-readonly
            className="bg-muted/50 min-h-11 cursor-not-allowed opacity-70"
            id={`${idPrefix}-week`}
            name={`${idPrefix}-week`}
            placeholder="Auto-calculated from date"
            readOnly
            tabIndex={-1}
            value={form.week}
          />
          <p className="text-muted-foreground text-xs">
            Determined by workout date.
          </p>
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor={`${idPrefix}-tags`}>
            Tags <span className="text-destructive">*</span>
          </Label>
          <Input
            autoComplete="off"
            className="min-h-11"
            id={`${idPrefix}-tags`}
            name={`${idPrefix}-tags`}
            onChange={(event) => onChange("tags", event.target.value)}
            placeholder="Aerobic Run, Strength…"
            required
            value={form.tags}
          />
          <p className="text-muted-foreground text-xs">
            Separate tags with commas.
          </p>
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor={`${idPrefix}-workoutPlan`}>
            Workout Plan <span className="text-destructive">*</span>
          </Label>
          <textarea
            className="border-input bg-background focus-visible:border-ring focus-visible:ring-ring/40 min-h-24 w-full rounded-lg border px-4 py-2 text-base shadow-xs focus-visible:ring-2 focus-visible:outline-none"
            id={`${idPrefix}-workoutPlan`}
            name={`${idPrefix}-workoutPlan`}
            onChange={(event) => onChange("workoutPlan", event.target.value)}
            placeholder="Describe the workout plan…"
            required
            value={form.workoutPlan}
          />
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor={`${idPrefix}-notes`}>Notes</Label>
          <textarea
            className="border-input bg-background focus-visible:border-ring focus-visible:ring-ring/40 min-h-20 w-full rounded-lg border px-4 py-2 text-base shadow-xs focus-visible:ring-2 focus-visible:outline-none"
            id={`${idPrefix}-notes`}
            name={`${idPrefix}-notes`}
            onChange={(event) => onChange("notes", event.target.value)}
            placeholder="Optional notes…"
            value={form.notes}
          />
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="text-sm font-semibold">Metrics</h4>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
          {METRIC_FIELD_CONFIG.map((field) => (
            <div className="space-y-1.5" key={`${idPrefix}-${field.id}`}>
              <Label htmlFor={`${idPrefix}-${field.id}`}>
                {field.label}
                {field.isRequired ? (
                  <span className="text-destructive"> *</span>
                ) : null}
              </Label>
              <Input
                autoComplete="off"
                className="min-h-11"
                id={`${idPrefix}-${field.id}`}
                inputMode="decimal"
                name={`${idPrefix}-${field.id}`}
                onChange={(event) => onChange(field.id, event.target.value)}
                placeholder={field.placeholder}
                required={field.isRequired === true}
                type="text"
                value={form[field.id]}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
