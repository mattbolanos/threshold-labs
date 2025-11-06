"use client";

import * as React from "react";
import { DayBlocks } from "./day-blocks";
import { DayCarousel } from "./day-carousel";

interface CalendarDaysProps {
  maxWorkoutDatePromise: Promise<string | undefined>;
}

export function CalendarDays({ maxWorkoutDatePromise }: CalendarDaysProps) {
  const maxWorkoutDate = React.use(maxWorkoutDatePromise);

  return (
    <>
      <DayCarousel maxWorkoutDate={maxWorkoutDate} />
      <DayBlocks />
    </>
  );
}
