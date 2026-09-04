import { useQuery } from "convex/react";
import { isAfter, isBefore, startOfWeek } from "date-fns";
import { createParser, useQueryState } from "nuqs";
import { formatQueryDate, parseQueryDate } from "@/lib/utils";
import { api } from "../../convex/_generated/api";

const WEEK_START_OPTIONS = { weekStartsOn: 1 as const };

const parseAsWeekStart = createParser<Date>({
  eq: (left, right) => left.getTime() === right.getTime(),
  parse: (value) => {
    const date = parseQueryDate(value);
    return date ? startOfWeek(date, WEEK_START_OPTIONS) : null;
  },
  serialize: (date) => formatQueryDate(startOfWeek(date, WEEK_START_OPTIONS)),
});

function toWeekStart(value: string | null | undefined) {
  const date = value ? parseQueryDate(value) : null;
  return date ? startOfWeek(date, WEEK_START_OPTIONS) : null;
}

export function clampWeekStart(
  weekStart: Date,
  bounds: { max: Date | null; min: Date | null },
) {
  if (bounds.min && isBefore(weekStart, bounds.min)) {
    return bounds.min;
  }
  if (bounds.max && isAfter(weekStart, bounds.max)) {
    return bounds.max;
  }
  return weekStart;
}

/**
 * Week navigation for the training calendar. The selected week lives in the
 * URL, but it is clamped to the range of weeks the viewer can actually see so
 * that someone whose access ended (or has not started) never lands on an
 * empty week outside their entitlements.
 */
export function useCalendarNav() {
  const today = new Date();
  const currentWeekStart = startOfWeek(today, WEEK_START_OPTIONS);
  const calendarRange = useQuery(api.workouts.getTrainingCalendarRange);

  const [requestedWeekStart, setWeekStart] = useQueryState(
    "weekStart",
    parseAsWeekStart.withDefault(currentWeekStart),
  );

  const isRangeLoading = calendarRange === undefined;
  const minWeekStart = toWeekStart(calendarRange?.from);
  const maxWeekStart = toWeekStart(calendarRange?.to);
  const weekStartDate = isRangeLoading
    ? requestedWeekStart
    : clampWeekStart(requestedWeekStart, {
        max: maxWeekStart,
        min: minWeekStart,
      });
  const isCurrentWeekNavigable =
    !isRangeLoading &&
    clampWeekStart(currentWeekStart, {
      max: maxWeekStart,
      min: minWeekStart,
    }).getTime() === currentWeekStart.getTime();

  const jumpToToday = () => {
    void setWeekStart(currentWeekStart);
  };

  return {
    currentWeekStart,
    isCurrentWeekNavigable,
    isRangeLoading,
    jumpToToday,
    maxWeekStart,
    minWeekStart,
    setWeekStart,
    today,
    weekStartDate,
  };
}
