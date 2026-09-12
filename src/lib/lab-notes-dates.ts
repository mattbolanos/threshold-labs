import "server-only";

import { cacheLife } from "next/cache";

const LAB_TIME_ZONE = "America/New_York";
const DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  day: "2-digit",
  month: "2-digit",
  timeZone: LAB_TIME_ZONE,
  year: "numeric",
});

function formatDate(date: Date) {
  const parts = Object.fromEntries(
    DATE_FORMATTER.formatToParts(date).map(({ type, value }) => [type, value]),
  );

  return `${parts.year}-${parts.month}-${parts.day}`;
}

function subtractYear(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  const previousYear = year - 1;
  const lastDayOfMonth = new Date(
    Date.UTC(previousYear, month, 0),
  ).getUTCDate();

  return [previousYear, month, Math.min(day, lastDayOfMonth)]
    .map((part) => String(part).padStart(2, "0"))
    .join("-");
}

export async function getLabNotesDates() {
  "use cache";

  cacheLife({ expire: 300, revalidate: 60, stale: 60 });

  const today = formatDate(new Date());

  return {
    oneYearAgo: subtractYear(today),
    today,
  };
}
