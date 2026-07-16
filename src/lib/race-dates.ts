import { format, isSameDay, isSameMonth, isSameYear, parseISO } from "date-fns";

export const getTodayDate = () => format(new Date(), "yyyy-MM-dd");

export const formatDateRange = (startDate: string, endDate: string) => {
  const start = parseISO(startDate);
  const end = parseISO(endDate);

  if (isSameDay(start, end)) {
    return format(start, "MMM dd, yyyy");
  }
  if (isSameMonth(start, end)) {
    return `${format(start, "MMM dd")}–${format(end, "dd, yyyy")}`;
  }
  if (isSameYear(start, end)) {
    return `${format(start, "MMM dd")}–${format(end, "MMM dd, yyyy")}`;
  }

  return `${format(start, "MMM dd, yyyy")}–${format(end, "MMM dd, yyyy")}`;
};

export const formatRaceDateRange = formatDateRange;
