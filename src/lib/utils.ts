import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatMinutesToTime(minutes: number): string {
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

// Date helpers for week-based calendar views
export function startOfWeek(date: Date): Date {
  const normalized = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );
  const currentDay = normalized.getDay();

  const diff = currentDay === 0 ? 6 : currentDay - 1;
  const start = new Date(normalized);
  start.setDate(start.getDate() - diff);
  return start;
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function addWeeks(date: Date, weeks: number): Date {
  return addDays(date, weeks * 7);
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function getWeekDays(weekStart: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
}

export function formatWeekRangeLabel(
  weekStart: Date,
  locale: string = "default",
): string {
  const weekEnd = addDays(weekStart, 6);
  const sameYear = weekStart.getFullYear() === weekEnd.getFullYear();
  const sameMonth = sameYear && weekStart.getMonth() === weekEnd.getMonth();

  const fmt = new Intl.DateTimeFormat(locale, { month: "short" });
  const startMonth = fmt.format(weekStart);
  const endMonth = fmt.format(weekEnd);
  const startYear = weekStart.getFullYear();
  const endYear = weekEnd.getFullYear();

  if (sameYear && sameMonth) {
    return `${startMonth} ${startYear}`;
  }
  if (sameYear) {
    return `${startMonth} - ${endMonth} ${startYear}`;
  }
  return `${startMonth} ${startYear} - ${endMonth} ${endYear}`;
}

export function formatQueryDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

export function getCalendarDays(anchorDate: Date): {
  date: Date;
  weekIndex: number;
}[] {
  const days = [];

  // Upper bound is the end of the week containing the anchor date
  const upperBound = addDays(anchorDate, 6 - anchorDate.getDay());

  // Lower bound is 60 days before the anchor date, adjusted to start on Sunday
  const lowerBoundBeforeAdjustment = addDays(upperBound, -60);
  const lowerBound = addDays(
    lowerBoundBeforeAdjustment,
    -lowerBoundBeforeAdjustment.getDay(),
  );

  // Generate all days from lower bound to upper bound
  const currentDate = new Date(lowerBound);
  let weekIndex = 0;
  while (currentDate <= upperBound) {
    days.push({ date: new Date(currentDate), weekIndex });
    if (currentDate.getDay() === 6) {
      weekIndex++;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return days;
}
