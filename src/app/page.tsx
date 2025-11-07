import { Suspense } from "react";
import { CalendarArrows } from "@/components/calendar/calendar-arrows";
import { CalendarBlocks } from "@/components/calendar/calendar-blocks";
import { CalendarHeaderText } from "@/components/calendar/calendar-header-text";
import { DayBlocks } from "@/components/calendar/day-blocks";
import { api } from "@/trpc/server";

export default function Home() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
        <Suspense fallback={<div>Loading...</div>}>
          <CalendarHeaderText />
          <CalendarArrows
            workoutsDateRangePromise={api.internal.getWorkoutsDateRange()}
          />
        </Suspense>
      </div>
      <div className="flex flex-col gap-2">
        <Suspense fallback={<div>Loading...</div>}>
          <DayBlocks />
        </Suspense>
        <Suspense fallback={<div>Loading...</div>}>
          <CalendarBlocks />
        </Suspense>
      </div>
    </div>
  );
}
