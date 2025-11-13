import { addWeeks, startOfWeek } from "date-fns";
import { parseAsString, useQueryState } from "nuqs";

export function useCalendarNav() {
  const today = new Date();

  const [weekStart, setWeekStart] = useQueryState(
    "weekStart",
    parseAsString.withDefault(
      startOfWeek(today, { weekStartsOn: 1 }).toISOString().split("T")[0],
    ),
  );

  const weekStartDate = new Date(`${weekStart}T00:00:00`);

  const addWeektoStart = () => {
    setWeekStart(addWeeks(weekStartDate, 1).toISOString().split("T")[0]);
  };

  const subtractWeekfromStart = () => {
    setWeekStart(addWeeks(weekStartDate, -1).toISOString().split("T")[0]);
  };

  const jumpToToday = () => {
    setWeekStart(
      startOfWeek(today, { weekStartsOn: 1 }).toISOString().split("T")[0],
    );
  };

  return {
    addWeektoStart,
    jumpToToday,
    setWeekStart,
    subtractWeekfromStart,
    today,
    weekStartDate,
  };
}
