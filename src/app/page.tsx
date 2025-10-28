import { Suspense } from "react";
import { CalendarArrows } from "@/components/calendar-arrows";
import { CalendarBlocks } from "@/components/calendar-blocks";
import { CalendarDays } from "@/components/calendar-days";
import { CalendarHeaderText } from "@/components/calendar-header-text";
import { addDays } from "@/lib/utils";
import { api } from "@/trpc/server";

const pacificFmt = new Intl.DateTimeFormat("en-CA", {
  day: "2-digit",
  month: "2-digit",
  timeZone: "America/Los_Angeles",
  year: "numeric",
});

const formatQueryDate = (date: Date) =>
  pacificFmt.format(date).replace(/\//g, "-");

export default function Home() {
  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());

  // prefetch this week
  void api.internal.getWorkouts.prefetch({
    from: formatQueryDate(weekStart),
    to: formatQueryDate(addDays(weekStart, 6)),
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between px-1">
        <CalendarHeaderText />
        <CalendarArrows />
      </div>
      <div className="flex flex-col gap-2">
        <CalendarDays />
        <Suspense fallback={<div>Loading...</div>}>
          <CalendarBlocks />
        </Suspense>
      </div>
    </div>
  );
}
