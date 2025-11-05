import { parseAsString, useQueryState } from "nuqs";
import { addWeeks, startOfWeek } from "@/lib/utils";

export function useCalendar() {
  const today = new Date();

  const [weekStart, setWeekStart] = useQueryState(
    "weekStart",
    parseAsString.withDefault(startOfWeek(today).toISOString().split("T")[0]),
  );

  const [selectedDay, setSelectedDay] = useQueryState(
    "selectedDay",
    parseAsString.withDefault(today.toISOString().split("T")[0]),
  );

  const weekStartDate = new Date(`${weekStart}T00:00:00`);
  const selectedDayDate = new Date(`${selectedDay}T00:00:00`);

  const addWeektoStart = () => {
    setWeekStart(addWeeks(weekStartDate, 1).toISOString().split("T")[0]);
  };

  const subtractWeekfromStart = () => {
    setWeekStart(addWeeks(weekStartDate, -1).toISOString().split("T")[0]);
  };

  const jumpToToday = () => {
    setWeekStart(startOfWeek(today).toISOString().split("T")[0]);
    setSelectedDay(today.toISOString().split("T")[0]);
  };

  return {
    addWeektoStart,
    jumpToToday,
    selectedDay,
    selectedDayDate,
    setSelectedDay,
    setWeekStart,
    subtractWeekfromStart,
    today,
    weekStartDate,
  };
}
