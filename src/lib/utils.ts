import { type ClassValue, clsx } from "clsx";
import { addDays, format, isValid, parse } from "date-fns";
import { twMerge } from "tailwind-merge";

const TRAINING_LOAD_SCALE_FACTOR = 3;
const QUERY_DATE_FORMAT = "yyyy-MM-dd";
const QUERY_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const QUERY_DATE_REFERENCE = new Date(2000, 0, 1);
const WEEK_RANGE_MONTH_FORMATTER = new Intl.DateTimeFormat("default", {
  month: "short",
});
const WEEK_RANGE_DAY_FORMATTER = new Intl.DateTimeFormat("default", {
  day: "numeric",
  month: "short",
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatMinutesToTime(minutes: number | null): string | null {
  if (minutes === null) return null;

  const totalSeconds = Math.round(minutes * 60);
  const hours = Math.floor(totalSeconds / 3600);
  const remainingSeconds = totalSeconds % 3600;
  const mins = Math.floor(remainingSeconds / 60);
  const secs = remainingSeconds % 60;

  const parts = [];

  parts.push(String(hours).padStart(2, "0"));
  parts.push(String(mins).padStart(2, "0"));
  parts.push(String(secs).padStart(2, "0"));

  return parts.join(":");
}

export function getWeekDays(weekStart: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
}

export function formatWeekRangeLabel(
  weekStart: Date,
  showDays: boolean = false,
): string {
  const weekEnd = addDays(weekStart, 6);
  const sameYear = weekStart.getFullYear() === weekEnd.getFullYear();
  const sameMonth = sameYear && weekStart.getMonth() === weekEnd.getMonth();

  const fmt = showDays ? WEEK_RANGE_DAY_FORMATTER : WEEK_RANGE_MONTH_FORMATTER;
  const startMonth = fmt.format(weekStart);
  const endMonth = fmt.format(weekEnd);
  const startYear = weekStart.getFullYear();
  const endYear = weekEnd.getFullYear();

  if (sameYear && sameMonth) {
    return showDays
      ? `${startMonth} - ${endMonth}, ${startYear}`
      : `${startMonth} ${startYear}`;
  }
  if (sameYear) {
    return showDays
      ? `${startMonth} - ${endMonth}, ${startYear}`
      : `${startMonth} - ${endMonth} ${startYear}`;
  }
  return showDays
    ? `${startMonth}, ${startYear} - ${endMonth}, ${endYear}`
    : `${startMonth} ${startYear} - ${endMonth} ${endYear}`;
}

export function formatQueryDate(date: Date): string {
  return format(date, QUERY_DATE_FORMAT);
}

export function parseQueryDate(value: string): Date | null {
  if (!QUERY_DATE_PATTERN.test(value)) return null;

  const parsed = parse(value, QUERY_DATE_FORMAT, QUERY_DATE_REFERENCE);

  if (!isValid(parsed) || formatQueryDate(parsed) !== value) return null;

  return parsed;
}

export function calculateSTL(
  rpe: number,
  trainingMinutes: number,
  totalRunMiles: number | null,
): number {
  const runMultiplier = totalRunMiles !== null && totalRunMiles > 0 ? 1.1 : 1;
  return (
    rpe * (trainingMinutes / 10) * runMultiplier * TRAINING_LOAD_SCALE_FACTOR
  );
}

export function formatWorkoutDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    timeZone: "UTC",
    year: "numeric",
  });
}
