import {
  IconCalendarEvent,
  IconClockHour4,
  IconMoon,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";

export type CalendarDayStatus =
  | "empty"
  | "logged"
  | "not-logged"
  | "planned"
  | "rest";

export function isFutureCalendarDay(day: string, today: string | null) {
  return today !== null && day > today;
}

export function getCalendarDayStatus({
  day,
  hasWorkouts,
  today,
}: {
  day: string;
  hasWorkouts: boolean;
  today: string | null;
}): CalendarDayStatus {
  if (today === null) return hasWorkouts ? "logged" : "empty";
  if (isFutureCalendarDay(day, today)) {
    return hasWorkouts ? "planned" : "empty";
  }
  if (day === today && !hasWorkouts) return "not-logged";

  return hasWorkouts ? "logged" : "rest";
}

const DAY_STATUS_CONFIG = {
  "not-logged": {
    className: "border-primary/30 bg-primary/10 text-primary",
    icon: IconClockHour4,
    label: "Not logged yet",
  },
  planned: {
    className: "border-chart-3/30 bg-chart-3/10 text-chart-3",
    icon: IconCalendarEvent,
    label: "Planned",
  },
  rest: {
    className: "border-border/70 bg-muted/30 text-muted-foreground",
    icon: IconMoon,
    label: "Rest day",
  },
} as const;

export function DayStatus({
  status,
}: {
  status: Exclude<CalendarDayStatus, "empty" | "logged">;
}) {
  const config = DAY_STATUS_CONFIG[status];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex h-5 shrink-0 items-center gap-1 rounded-sm border px-1.5 text-xs font-medium whitespace-nowrap",
        config.className,
      )}
    >
      <Icon aria-hidden className="size-3.5" stroke={1.5} />
      {config.label}
    </span>
  );
}
