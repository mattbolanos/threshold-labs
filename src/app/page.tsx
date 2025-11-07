import { Suspense } from "react";
import { CalendarArrows } from "@/components/calendar/calendar-arrows";
import { CalendarBlocks } from "@/components/calendar/calendar-blocks";
import { CalendarHeaderText } from "@/components/calendar/calendar-header-text";
import { DayBlocks } from "@/components/calendar/day-blocks";
import { api } from "@/trpc/server";
import { Separator } from "../components/ui/separator";

export default function Home() {
  return (
    <div className="bg-background flex flex-col">
      {/* Header */}
      <div
        className="bg-background sticky z-20 -mx-5 sm:-mx-6"
        style={{ top: "max(0px, env(safe-area-inset-top))" }}
      >
        <div className="flex flex-col justify-between gap-3 px-5 py-3 sm:px-6 sm:py-4 md:flex-row md:items-center">
          <Suspense fallback={<div>Loading...</div>}>
            <CalendarHeaderText />
            <CalendarArrows
              workoutsDateRangePromise={api.internal.getWorkoutsDateRange()}
            />
          </Suspense>
        </div>
        <Separator className="data-[orientation=horizontal]:h-0.5 md:hidden" />
      </div>

      <div className="mt-4 flex flex-col gap-2 md:mt-0">
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
