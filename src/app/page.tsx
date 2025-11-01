import { Suspense } from "react";
import { CalendarArrows } from "@/components/calendar-arrows";
import { CalendarBlocks } from "@/components/calendar-blocks";
import { CalendarDays } from "@/components/calendar-days";
import { CalendarHeaderText } from "@/components/calendar-header-text";

export default function Home() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between px-1">
        <Suspense fallback={<div>Loading...</div>}>
          <CalendarHeaderText />
          <CalendarArrows />
        </Suspense>
      </div>
      <div className="flex flex-col gap-2">
        <Suspense fallback={<div>Loading...</div>}>
          <CalendarDays />
        </Suspense>
        <Suspense fallback={<div>Loading...</div>}>
          <CalendarBlocks />
        </Suspense>
      </div>
    </div>
  );
}
