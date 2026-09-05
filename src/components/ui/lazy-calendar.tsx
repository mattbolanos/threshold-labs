"use client";

import { type ComponentProps, lazy, Suspense } from "react";
import { Skeleton } from "./skeleton";

const CalendarView = lazy(() =>
  import("./calendar").then((module) => ({ default: module.Calendar })),
);

// Keep the popover shell and focus management available before loading the picker.
export function Calendar(props: ComponentProps<typeof CalendarView>) {
  return (
    <Suspense
      fallback={
        <output
          aria-busy="true"
          aria-label="Loading calendar"
          className="flex gap-4"
        >
          <Skeleton className="h-80 w-64" />
          {(props.numberOfMonths ?? 1) > 1 ? (
            <Skeleton className="h-80 w-64" />
          ) : null}
        </output>
      }
    >
      <CalendarView {...props} />
    </Suspense>
  );
}
