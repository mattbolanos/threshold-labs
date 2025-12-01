import { type ClassValue, clsx } from "clsx";
import { addDays } from "date-fns";
import { twMerge } from "tailwind-merge";

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
  locale: string = "default",
  showDays: boolean = false,
): string {
  const weekEnd = addDays(weekStart, 6);
  const sameYear = weekStart.getFullYear() === weekEnd.getFullYear();
  const sameMonth = sameYear && weekStart.getMonth() === weekEnd.getMonth();

  const monthOptions = showDays
    ? { day: "numeric" as const, month: "short" as const }
    : { month: "short" as const };
  const fmt = new Intl.DateTimeFormat(locale, monthOptions);
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
  return date.toISOString().split("T")[0];
}
