import { format, isSameDay, isSameMonth, isSameYear, parseISO } from "date-fns";

export const getTodayDate = () => format(new Date(), "yyyy-MM-dd");

export const formatDateRange = (startDate: string, endDate: string) => {
  const start = parseISO(startDate);
  const end = parseISO(endDate);

  if (isSameDay(start, end)) {
    return format(start, "MMM d, yyyy");
  }
  if (isSameMonth(start, end)) {
    return `${format(start, "MMM d")}–${format(end, "d, yyyy")}`;
  }
  if (isSameYear(start, end)) {
    return `${format(start, "MMM d")}–${format(end, "MMM d, yyyy")}`;
  }

  return `${format(start, "MMM d, yyyy")}–${format(end, "MMM d, yyyy")}`;
};

export const formatRaceDateRange = formatDateRange;
