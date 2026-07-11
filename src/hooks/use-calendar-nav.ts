import { startOfWeek } from "date-fns";
import { createParser, useQueryState } from "nuqs";
import { formatQueryDate, parseQueryDate } from "@/lib/utils";

const WEEK_START_OPTIONS = { weekStartsOn: 1 as const };

const parseAsWeekStart = createParser<Date>({
  eq: (left, right) => left.getTime() === right.getTime(),
  parse: (value) => {
    const date = parseQueryDate(value);
    return date ? startOfWeek(date, WEEK_START_OPTIONS) : null;
  },
  serialize: (date) => formatQueryDate(startOfWeek(date, WEEK_START_OPTIONS)),
});

export function useCalendarNav() {
  const today = new Date();
  const currentWeekStart = startOfWeek(today, WEEK_START_OPTIONS);

  const [weekStartDate, setWeekStart] = useQueryState(
    "weekStart",
    parseAsWeekStart.withDefault(currentWeekStart),
  );

  const jumpToToday = () => {
    void setWeekStart(currentWeekStart);
  };

  return {
    jumpToToday,
    setWeekStart,
    today,
    weekStartDate,
  };
}
